import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
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

const SquadSyncSection = () => {
  const { user } = useAuth();
  const { activeCrew, activeSyncRound, activeResponses, submitWeekendResponse, syncDraft, setSyncDraft, clearSyncDraft, cancelActiveRound } = useCrew();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Initialize availability from Draft, then Response, then Default
  useEffect(() => {
    // Only run if we have weekends but no availability has been set yet
    if (weekends.length > 0 && Object.keys(availability).length === 0) {
      if (syncDraft) {
        setAvailability(syncDraft as Record<string, AvailabilityStatus>);
      } else if (activeResponses.length > 0 && user?.uid) {
        const myResponse = activeResponses.find(r => r.userId === user.uid);
        if (myResponse) {
          setAvailability(myResponse.availability as Record<string, AvailabilityStatus>);
        }
      } else {
        const init: Record<string, AvailabilityStatus> = {};
        weekends.forEach((w) => {
          init[w.id] = "unknown";
        });
        setAvailability(init);
      }
    }
  }, [weekends, activeResponses, user?.uid, syncDraft, availability]);

  // Update draft in context whenever availability changes (only after it's been initialized)
  useEffect(() => {
    if (Object.keys(availability).length > 0) {
      // Comparison to avoid infinite loops or unnecessary context updates
      if (JSON.stringify(availability) !== JSON.stringify(syncDraft)) {
        setSyncDraft(availability);
      }
    }
  }, [availability, syncDraft, setSyncDraft]);

  const cycleStatus = (weekendId: string) => {
    const current = availability[weekendId] || "unknown";
    const idx = statuses.indexOf(current);
    const next = statuses[(idx + 1) % statuses.length];
    setAvailability((prev) => ({ ...prev, [weekendId]: next }));
  };

  const handleSync = async () => {
    setIsSubmitting(true);
    try {
      await submitWeekendResponse(availability);
      clearSyncDraft();
      toast.success("Squad markers locked in!");
    } catch (error) {
      console.error("Sync failed", error);
      toast.error("Failed to save markers. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    clearSyncDraft();
    // Re-trigger the initial values from activeResponses
    const myResponse = activeResponses.find(r => r.userId === user?.uid);
    if (myResponse) {
      setAvailability(myResponse.availability as Record<string, AvailabilityStatus>);
    } else if (weekends.length > 0) {
      const init: Record<string, AvailabilityStatus> = {};
      weekends.forEach((w) => {
        init[w.id] = "unknown";
      });
      setAvailability(init);
    }
  };

  const markedCount = Object.values(availability).filter(s => s !== "unknown").length;
  
  // Check if draft is truly different from the last synced response
  const myLastResponse = activeResponses.find(r => r.userId === user?.uid)?.availability || {};
  const hasUnsavedChanges = JSON.stringify(availability) !== JSON.stringify(myLastResponse) && Object.keys(availability).length > 0;

  if (!activeSyncRound) return null;

  return (
    <section className="pt-4 pb-48 md:py-48 px-4 md:px-8 bg-background text-white min-h-screen relative overflow-hidden selection:bg-primary/20">
      {/* Decorative Atmospheric Glows - pointer-events-none to prevent click blocking */}
      <div className="absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] -left-[10%] w-[40vw] h-[40vw] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row gap-8 md:gap-24 items-start">
        {/* Left Column: Context & Instructions */}
        <div className="w-full md:w-1/3 flex flex-col gap-6 md:gap-16 md:sticky md:top-32 h-fit">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <span className="text-social-label text-[9px]">Live Squad Sync</span>
            </motion.div>

            <h2 className="text-4xl md:text-7xl font-display font-medium leading-tight">
              {hasUnsavedChanges ? (
                <>Your <span className="text-primary italic">draft</span> markers.</>
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
            {markedCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="pt-12"
              >
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button 
                      onClick={handleSync}
                      disabled={isSubmitting}
                      className="button-premium flex-1 shadow-[0_20px_50px_rgba(244,86,149,0.4)] disabled:opacity-50"
                    >
                      {isSubmitting ? "Updating..." : hasUnsavedChanges ? "Save to Squad Sync" : "Sync with the Crew"}
                    </button>
                    {hasUnsavedChanges && (
                      <button 
                        onClick={handleDiscard}
                        disabled={isSubmitting}
                        className="px-6 py-4 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50 w-full sm:w-auto"
                      >
                        Discard Changes
                      </button>
                    )}
                  </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 inset-x-0 mx-auto z-[60] w-[calc(100%-2rem)] max-w-sm"
          >
            <div className="bg-black/90 backdrop-blur-3xl border border-white/10 rounded-2xl p-3 md:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 md:gap-4 ring-1 ring-white/5">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {isSubmitting ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />}
                </div>
                <div className="min-w-0">
                  <div className="text-[8px] md:text-[10px] font-bold tracking-widest text-primary uppercase">Draft Mode</div>
                  <div className="text-[10px] md:text-xs text-white/60 font-medium truncate">
                    {isSubmitting ? "Syncing..." : "Unsaved markers"}
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5 md:gap-2 shrink-0">
                <button 
                  onClick={handleDiscard}
                  disabled={isSubmitting}
                  className="px-3 md:px-4 py-2 rounded-lg bg-white/5 text-[8px] md:text-[10px] font-bold tracking-widest text-white/40 hover:text-white uppercase transition-colors disabled:opacity-50"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSync}
                  disabled={isSubmitting}
                  className="px-4 md:px-6 py-2 rounded-lg bg-primary text-black text-[8px] md:text-[10px] font-bold tracking-widest uppercase hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Syncing" : "Save"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasUnsavedChanges && Object.keys(availability).length > 0 && (
        <div className="fixed bottom-32 inset-x-0 flex justify-center z-[60] transition-opacity animate-in fade-in slide-in-from-bottom-4">
           <button 
             onClick={() => {
                // Find BottomNav and click the 'results' tab programmatically, or use a context navigation if available
                const resultsTab = document.querySelector('[data-tab="results"]') as HTMLButtonElement | null;
                if (resultsTab) resultsTab.click();
             }}
             className="bg-black/90 backdrop-blur-xl border border-primary/40 shadow-[0_10px_40px_rgba(244,86,149,0.3)] rounded-full px-8 py-4 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all pointer-events-auto cursor-pointer group"
           >
              <Zap className="w-4 h-4 text-primary group-hover:fill-primary transition-all delay-75" />
              <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-white uppercase">View Sync Results</span>
           </button>
        </div>
      )}
    </section>
  );
};

export default SquadSyncSection;
