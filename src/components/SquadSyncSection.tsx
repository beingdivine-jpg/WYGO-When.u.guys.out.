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
    <div className="sticky top-0 z-50 w-full h-12 bg-white/90 backdrop-blur-xl border-b border-border flex justify-center items-center shadow-sm">
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
              <span className="text-xs md:text-sm font-bold text-foreground tracking-wide">
                Best option: {best.dateRange}
              </span>
              {best.holidayBoost && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
                  ✨ Long weekend
                </span>
              )}
            </>
          ) : (
            <span className="text-xs font-semibold tracking-wide text-muted-foreground">
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
    <section className="pb-28 md:pb-48 bg-background text-foreground min-h-[100dvh] relative flex flex-col">
      <LiveResultsBar results={liveResults} />
      
      <div className="flex-1 pt-4 md:pt-16 px-4 md:px-8 relative w-full overflow-clip">

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row gap-6 md:p-8 md:gap-24 items-start">
        {/* Left Column: Context & Instructions — appears SECOND on mobile, first on desktop */}
        <div className="w-full md:w-1/3 flex flex-col gap-6 md:gap-16 md:sticky md:top-32 h-fit order-1 md:order-1">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 rounded-full editorial-card"
            >
              <span className="text-social-label text-[10px] text-muted-foreground">Live Squad Sync</span>
            </motion.div>

            <h2 className="text-4xl md:text-7xl font-display font-medium leading-tight">
              {saveStatus === 'saving' ? (
                <>Saving <span className="text-primary">draft</span> markers...</>
              ) : (
                <>Mark your <span className="text-primary">weekends.</span></>
              )}
            </h2>

            {isOwner && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="flex items-center gap-2 text-xs font-semibold tracking-wide text-red-500/60 hover:text-red-500 transition-colors">
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel This Sync Round
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-background border-border text-foreground">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Sync Round?</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      This will stop the current sync process for the entire squad. All current markers will be archived.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-secondary border-border text-foreground hover:bg-secondary/70">Keep Round</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelRound} className="bg-red-500 hover:bg-red-600 text-white font-bold">Cancel Round</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <p className="text-base md:text-lg text-muted-foreground font-body leading-relaxed max-w-xs">
              Let the crew know when you're around. We'll find the magic windows for everyone.
            </p>

            {/* Interaction Legend */}
            <div className="editorial-card shadow-sm rounded-2xl p-6 space-y-5">
              <div className="text-xs font-semibold tracking-wide text-muted-foreground">How to Sync</div>
              <p className="text-xs text-muted-foreground leading-relaxed font-body">
                Tap any weekend card to cycle your availability. 
              </p>
              
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white shadow-inner flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Free <span className="text-muted-foreground text-xs ml-1 font-normal">— "I am ready."</span></span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 ring-1 ring-stone-200 flex items-center justify-center shrink-0">
                    <span className="text-xl font-display leading-[0.5]">~</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">Maybe <span className="text-muted-foreground text-xs ml-1 font-normal">— "Need to check."</span></span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Busy <span className="text-muted-foreground text-xs ml-1 font-normal">— "Count me out."</span></span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6 md:p-8 rounded-[2rem] editorial-card">
            <div className="text-xs font-bold text-muted-foreground tracking-widest uppercase">The Squad</div>
            <div className="flex -space-x-2">
              {activeResponses.map((r, i) => (
                <div
                  key={r.userId}
                  className={`w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs font-bold shadow-sm ring-1 ring-black/5 overflow-hidden transition-all hover:-translate-y-1 cursor-help group relative`}
                  style={{ zIndex: 20 - i }}
                >
                  <span className="text-foreground">{r.displayName[0]}</span>
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="text-[10px] text-primary font-medium tracking-wide">View</span>
                  </div>
                </div>
              ))}
              {activeResponses.length < (activeCrew?.memberIds.length || 0) && (
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-border bg-transparent flex items-center justify-center text-muted-foreground text-xs">
                  +{(activeCrew?.memberIds.length || 0) - activeResponses.length}
                </div>
              )}
            </div>
            <div className="h-px w-full bg-border" />
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
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
                className={`w-full flex items-center justify-between p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] transition-all duration-500 group relative active:scale-95 ${
                  status === 'free' ? 'bg-primary border border-primary text-white shadow-md' :
                  status === 'maybe' ? 'bg-stone-50 border border-stone-200 text-stone-600 shadow-sm' :
                  status === 'busy' ? 'bg-slate-50 text-slate-400 border border-transparent' :
                  'editorial-card text-foreground hover:border-border hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3 md:gap-6 md:p-8 relative z-10 min-w-0">
                  <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-sm font-bold transition-all flex-shrink-0 border ${
                    status === 'free' ? 'bg-white/20 text-white border-white/20' : 
                    status === 'maybe' ? 'bg-white text-stone-500 border-stone-200' :
                    status === 'busy' ? 'bg-transparent text-slate-300 border-slate-200' :
                    'bg-transparent text-muted-foreground border-border group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex flex-col items-start gap-1 min-w-0">
                    <h3 className={`text-2xl md:text-3xl font-display font-medium tracking-tight whitespace-nowrap ${
                      status === 'free' ? 'text-white' : 
                      status === 'busy' ? 'text-slate-400' : 'text-foreground'
                    }`}>
                      {weekend.label}
                    </h3>
                    <div className="flex items-center gap-3">
                      {weekend.tag && (
                        <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                          status === 'free' ? 'bg-white/20 text-white' : 
                          status === 'maybe' ? 'bg-amber-400/20 text-amber-700' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {weekend.tag}
                        </div>
                      )}
                      <span className={`text-[10px] font-medium tracking-wide ${
                        status === 'free' ? 'text-white/80' : 
                        status === 'maybe' ? 'text-amber-600/80' :
                        'text-muted-foreground'
                      }`}>Available Window</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 relative z-10">
                  <div className="text-right hidden sm:block">
                    <span className={`text-[10px] font-bold tracking-widest uppercase block mb-0.5 ${
                      status === 'free' ? 'text-white/80' : 
                      status === 'maybe' ? 'text-stone-400' :
                      status === 'busy' ? 'text-slate-300' : 'text-muted-foreground/50'
                    }`}>Status</span>
                    <span className={`text-xs font-bold transition-all ${
                      status === 'free' ? 'text-white' : 
                      status === 'maybe' ? 'text-stone-600' :
                      status === 'busy' ? 'text-slate-400' : 'text-muted-foreground'
                    }`}>
                      {status === 'unknown' ? <span>Tap to mark</span> : status.toUpperCase()}
                    </span>
                  </div>
                  <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-500 flex-shrink-0 ${
                    status === 'free' ? 'bg-white text-primary shadow-sm' :
                    status === 'busy' ? 'bg-transparent text-slate-300' :
                    status === 'maybe' ? 'bg-stone-100 text-stone-500 shadow-sm ring-1 ring-stone-200' :
                    'bg-transparent border-2 border-dashed border-border text-transparent scale-[0.85] group-hover:border-border'
                  }`}>
                    {status === 'free' && <Zap className="w-5 h-5 fill-current" />}
                    {status === 'busy' && <XCircle className="w-5 h-5" />}
                    {status === 'maybe' && <span className="text-2xl font-display leading-[0.5]">~</span>}
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
                <div className="editorial-card px-5 py-3 rounded-full flex items-center gap-3 shadow-md">
                  {saveStatus === "saving" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Saving to Squad Sync...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-[10px] uppercase tracking-widest font-bold text-green-500">Locked in</span>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      </div>
    </section>
  );
};

export default SquadSyncSection;
