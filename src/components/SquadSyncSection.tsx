import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useMemo } from "react";
import { type AvailabilityStatus, statusConfig } from "@/types";
import { useCrew } from "@/contexts/CrewContext";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Zap, XCircle, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { syncEngine } from "@/lib/syncEngine";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const statuses: AvailabilityStatus[] = ["free", "maybe", "busy", "unknown"];

const LiveResultsBar = ({ results }: { results: any[] }) => {
  const best = results[0];

  return (
    <div className="sticky top-0 z-50 w-full h-12 bg-black/80 backdrop-blur-xl border-b border-primary/20 flex justify-center items-center shadow-[0_4px_30px_rgba(244,86,149,0.1)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={best?.id || "empty"}
          initial={{ y: -10, opacity: 0 }}
          animate={
            best
              ? { y: 0, opacity: 1, scale: [1, 1.03, 1] }
              : { y: 0, opacity: 1 }
          }
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2"
        >
          {best ? (
            <>
              <Zap className="w-3.5 h-3.5 fill-primary text-primary" />
              <span className="text-xs md:text-sm font-bold text-white tracking-wide">
                Best option: {best.dateRange}
              </span>
              {best.holidayBoost && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-bold uppercase tracking-widest text-[#F45695]">
                  ✨ Long weekend
                </span>
              )}
            </>
          ) : (
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">
              No strong match yet
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const isEqualAvailability = (
  a: Record<string, AvailabilityStatus>,
  b: Record<string, AvailabilityStatus>
) => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }

  return true;
};

const SquadSyncSection = () => {
  const { user } = useAuth();
  const { activeCrew, activeSyncRound, activeResponses, submitWeekendResponse, syncDraft, setSyncDraft, clearSyncDraft, cancelActiveRound } = useCrew();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const isInitializedRef = useRef(false);
  const isEditingRef = useRef(false);
  const lastSavedRef = useRef<Record<string, AvailabilityStatus>>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isOwner = activeCrew?.ownerId === user?.uid;

  const handleCancelRound = async () => {
    if (!activeCrew) return;
    try {
      await cancelActiveRound(activeCrew.id);
      toast.success("Sync round cancelled.");
    } catch (error) {
      toast.error("Failed to cancel round.");
    }
  };
  
  // Use activeSyncRound to generate weekends
  const weekends = activeSyncRound 
    ? syncEngine.generateWeekends(
        activeSyncRound.durationMonths, 
        activeSyncRound.startDate?.toDate ? activeSyncRound.startDate.toDate() : new Date(activeSyncRound.startDate)
      ) 
    : [];

  const [availability, setAvailability] = useState<Record<string, AvailabilityStatus>>({});

  const myResponseFromDb = activeResponses.find(r => r.userId === user?.uid)?.availability || {};
  const myResponseJson = JSON.stringify(myResponseFromDb);

  // Initialize availability from Draft, then Response, then Default
  useEffect(() => {
    if (weekends.length > 0 && !isInitializedRef.current) {
      const myResponse = activeResponses.find(r => r.userId === user?.uid)?.availability;
      if (myResponse) {
        lastSavedRef.current = myResponse as Record<string, AvailabilityStatus>;
      }

      if (syncDraft && Object.keys(syncDraft).length > 0) {
        setAvailability(syncDraft as Record<string, AvailabilityStatus>);
      } else if (myResponse) {
        setAvailability(myResponse as Record<string, AvailabilityStatus>);
      } else {
        const init: Record<string, AvailabilityStatus> = {};
        weekends.forEach((w) => {
          init[w.id] = "unknown";
        });
        setAvailability(init);
      }
      isInitializedRef.current = true;
    }
  }, [weekends, activeResponses, user?.uid, syncDraft]);

  // Handle external real-time updates safely
  useEffect(() => {
    if (!isInitializedRef.current) return;
    const lastSavedJson = JSON.stringify(lastSavedRef.current);
    
    // If no active local edits exist, but DB state changed, sync from DB
    if (!isEditingRef.current && myResponseJson !== lastSavedJson) {
      if (Object.keys(myResponseFromDb).length > 0) {
        setAvailability(myResponseFromDb as Record<string, AvailabilityStatus>);
        lastSavedRef.current = myResponseFromDb as Record<string, AvailabilityStatus>;
      }
    }
  }, [myResponseJson, availability]);

  // Update draft in context whenever availability changes (locaStorage persistence)
  useEffect(() => {
    if (Object.keys(availability).length > 0 && isInitializedRef.current) {
      if (JSON.stringify(availability) !== JSON.stringify(syncDraft)) {
        setSyncDraft(availability);
      }
    }
  }, [availability, syncDraft, setSyncDraft]);

  // Debounced Auto-Save
  useEffect(() => {
    if (!isInitializedRef.current || Object.keys(availability).length === 0) return;

    if (isEqualAvailability(availability, lastSavedRef.current)) {
      return; 
    }

    setSaveStatus("saving");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const snapshotBeforeSave = availability;
        await submitWeekendResponse(snapshotBeforeSave);

        // Only mark saved if nothing changed during request
        if (isEqualAvailability(snapshotBeforeSave, availability)) {
          lastSavedRef.current = snapshotBeforeSave;
          setSaveStatus("saved");
          
          isEditingRef.current = false;

          setTimeout(() => {
            setSaveStatus("idle");
          }, 2000);
        }
      } catch (error) {
        console.error("Auto-save failed", error);
        toast.error("Failed to auto-save markers.");
        setSaveStatus("idle");
      }
    }, 700);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [availability, submitWeekendResponse]);

  const cycleStatus = (weekendId: string) => {
    isEditingRef.current = true;
    const current = availability[weekendId] || "unknown";
    const idx = statuses.indexOf(current);
    const next = statuses[(idx + 1) % statuses.length];
    setAvailability((prev) => ({ ...prev, [weekendId]: next }));
  };

  const markedCount = Object.values(availability).filter(s => s !== "unknown").length;

  const mergedResponses = useMemo(() => {
    if (!user || !activeCrew) return activeResponses;

    const userId = user.uid;
    let hasUser = false;

    const updated = activeResponses.map((r: any) => {
      if (r.userId === userId) {
        hasUser = true;
        return {
          ...r,
          availability,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    if (!hasUser) {
      updated.push({
        userId,
        displayName: "You",
        availability,
        updatedAt: new Date().toISOString()
      } as any);
    }

    return updated;
  }, [activeResponses, availability, user?.uid, activeCrew?.id]);

  const liveResults = useMemo(() => {
    if (!activeCrew || !activeSyncRound || !mergedResponses || mergedResponses.length === 0) return [];
    
    return syncEngine.calculateResults(
      mergedResponses as any,
      activeCrew,
      activeSyncRound.durationMonths,
      activeSyncRound.startDate?.toDate ? activeSyncRound.startDate.toDate() : new Date(activeSyncRound.startDate as any)
    );
  }, [mergedResponses, activeCrew, activeSyncRound]);

  if (!activeSyncRound) return null;

  return (
    <section className="pb-48 md:pb-48 bg-background text-white min-h-screen relative selection:bg-primary/20 flex flex-col">
      <LiveResultsBar results={liveResults} />
      
      <div className="flex-1 pt-4 md:pt-16 px-4 md:px-8 relative w-full overflow-clip">
      {/* Decorative Atmospheric Glows - pointer-events-none to prevent click blocking */}
      <div className="absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] -left-[10%] w-[40vw] h-[40vw] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row gap-8 md:gap-24 items-start">
        {/* Left Column: Context & Instructions — appears SECOND on mobile, first on desktop */}
        <div className="w-full md:w-1/3 flex flex-col gap-6 md:gap-16 md:sticky md:top-32 h-fit order-2 md:order-1">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <span className="text-social-label text-[9px]">Live Squad Sync</span>
            </motion.div>

            <h2 className="text-4xl md:text-7xl font-display font-medium leading-tight">
              {saveStatus === 'saving' ? (
                <>Saving <span className="text-primary italic">draft</span> markers...</>
              ) : (
                <>Mark your <span className="text-secondary italic">weekends.</span></>
              )}
            </h2>

            {isOwner && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-red-500/40 hover:text-red-500 transition-colors">
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel This Sync Round
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-background border-white/10 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Sync Round?</AlertDialogTitle>
                    <AlertDialogDescription className="text-white/60">
                      This will stop the current sync process for the entire squad. All current markers will be archived.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Keep Round</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelRound} className="bg-red-500 hover:bg-red-600 text-white font-bold">Cancel Round</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <p className="text-base md:text-lg text-white/50 font-body leading-relaxed max-w-xs">
              Let the crew know when you're around. We'll find the magic windows for everyone.
            </p>

            {/* Interaction Legend */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-5">
              <div className="text-[9px] font-bold tracking-widest uppercase text-white/30">How to Sync</div>
              <p className="text-xs text-white/50 leading-relaxed font-body">
                Tap any weekend card to cycle your availability. 
              </p>
              
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-black text-primary shadow-inner flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-sm font-medium text-white/90">Free <span className="text-white/30 text-xs ml-1 font-normal">— "I am ready."</span></span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-400 ring-1 ring-amber-400/30 flex items-center justify-center shrink-0">
                    <span className="text-base font-display">?</span>
                  </div>
                  <span className="text-sm font-medium text-white/90">Maybe <span className="text-white/30 text-xs ml-1 font-normal">— "Need to check."</span></span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 text-white shadow-xl rotate-45 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  </div>
                  <span className="text-sm font-medium text-white/90">Busy <span className="text-white/30 text-xs ml-1 font-normal">— "Count me out."</span></span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-sm shadow-xl">
            <div className="text-xs font-bold text-white/30 tracking-widest uppercase">The Squad</div>
            <div className="flex -space-x-3">
              {activeResponses.map((r, i) => (
                <div
                  key={r.userId}
                  className={`w-14 h-14 rounded-full border-2 border-background bg-muted flex items-center justify-center text-sm font-bold shadow-lg ring-2 ring-white/5 overflow-hidden transition-all hover:-translate-y-2 cursor-help group relative`}
                  style={{ zIndex: 20 - i }}
                >
                  <span className="text-white/80">{r.displayName[0]}</span>
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="text-[10px] text-white">View</span>
                  </div>
                </div>
              ))}
              {activeResponses.length < (activeCrew?.memberIds.length || 0) && (
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-white/10 bg-transparent flex items-center justify-center text-white/20 text-xs">
                  +{(activeCrew?.memberIds.length || 0) - activeResponses.length}
                </div>
              )}
            </div>
            <div className="h-px w-full bg-white/5" />
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary glow-sunset animate-pulse" />
              <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">
                 {activeResponses.length} / {activeCrew?.memberIds.length} Friends Responded
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: The Weekend Selector */}
        <div className="flex-1 w-full space-y-4 md:space-y-6">
          {weekends.map((weekend, i) => {
            const status = availability[weekend.id] || "unknown";

            return (
              <motion.button
                key={weekend.id}
                layout
                onClick={() => cycleStatus(weekend.id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-between p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] transition-all duration-500 group relative border shadow-2xl active:scale-95 ${
                  status === 'free' ? 'bg-primary border-primary text-black' :
                  status === 'maybe' ? 'bg-amber-400/20 border-amber-400/30 text-amber-200' :
                  status === 'busy' ? 'bg-white/5 border-white/5 text-white/20' :
                  'bg-white/[0.03] border-white/10 text-white'
                }`}
              >
                <div className="flex items-center gap-3 md:gap-8 relative z-10 min-w-0">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-bold transition-all ${
                    status === 'free' ? 'bg-black/10 text-black' : 
                    status === 'maybe' ? 'bg-amber-400/20 text-amber-400' :
                    'bg-white/5 text-white/40 group-hover:bg-white/10'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex flex-col items-start gap-1 min-w-0">
                    <h3 className={`text-2xl md:text-4xl font-display font-medium tracking-tight ${
                      status === 'busy' ? 'opacity-40' : 'opacity-100'
                    }`}>
                      {weekend.label}
                    </h3>
                    <div className="flex items-center gap-3">
                      {weekend.tag && (
                        <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${
                          status === 'free' ? 'bg-black/20 text-black' : 
                          status === 'maybe' ? 'bg-amber-400/30 text-amber-400' :
                          'bg-primary/20 text-primary'
                        }`}>
                          {weekend.tag}
                        </div>
                      )}
                      <span className={`text-[10px] font-medium tracking-wide ${
                        status === 'free' ? 'text-black/40' : 
                        status === 'maybe' ? 'text-amber-400/40' :
                        'text-white/20'
                      }`}>Available Window</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 relative z-10">
                  <div className="text-right hidden sm:block">
                    <span className={`text-[10px] font-bold tracking-widest block mb-0.5 ${
                      status === 'free' ? 'text-black/60' : 
                      status === 'maybe' ? 'text-amber-400/60' :
                      'text-white/20'
                    }`}>Status</span>
                    <span className={`text-sm font-bold transition-all ${
                      status === 'free' ? 'text-black' : 
                      status === 'maybe' ? 'text-amber-400' :
                      'text-white/40'
                    }`}>
                      {status === 'unknown' ? 'Tap to mark' : status.toUpperCase()}
                    </span>
                  </div>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
                    status === 'free' ? 'bg-black text-primary shadow-inner rotate-0' :
                    status === 'busy' ? 'bg-white/10 text-white shadow-xl rotate-45' :
                    status === 'maybe' ? 'bg-amber-400/20 text-amber-400 shadow-md ring-1 ring-amber-400/30' :
                    'bg-white/5 text-white/10 scale-90'
                  }`}>
                    {status === 'free' && <Zap className="w-5 h-5 fill-current" />}
                    {status === 'busy' && <div className="w-2 h-2 rounded-full bg-white/40" />}
                    {status === 'maybe' && <span className="text-xl font-display">?</span>}
                    {status === 'unknown' && <div className="w-1 h-1 rounded-full bg-white/20" />}
                  </div>
                </div>
              </motion.button>
            );
          })}

          <AnimatePresence>
            {saveStatus !== "idle" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-6 flex justify-center"
              >
                <div className="bg-black/90 backdrop-blur-md border border-white/10 px-5 py-3 rounded-full flex items-center gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                  {saveStatus === "saving" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-[10px] uppercase tracking-widest font-bold text-white/70">Saving to Squad Sync...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-[10px] uppercase tracking-widest font-bold text-green-400">Locked in</span>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* View Sync Results Floater (Always visible when there is availability data, unless saving) */}
      <AnimatePresence>
        {saveStatus !== "saving" && Object.keys(availability).length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-8 md:bottom-12 inset-x-0 flex justify-center z-[50]"
          >
             <button 
               onClick={() => {
                  const resultsTab = document.querySelector('[data-tab="results"]') as HTMLButtonElement | null;
                  if (resultsTab) resultsTab.click();
               }}
               className="bg-black/95 backdrop-blur-xl border border-primary/40 shadow-[0_10px_40px_rgba(244,86,149,0.3)] rounded-full px-8 py-4 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all pointer-events-auto cursor-pointer group hover:bg-black"
             >
                <Zap className="w-4 h-4 text-primary group-hover:fill-primary transition-all delay-75" />
                <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-white uppercase">View Sync Results</span>
             </button>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </section>
  );
};

export default SquadSyncSection;
