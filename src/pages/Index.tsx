import { useState, useEffect } from "react";
import GoldenWindowsSection from "@/components/GoldenWindowsSection";
import CrewSection from "@/components/CrewSection";
import SquadSyncSection from "@/components/SquadSyncSection";
import BottomNav from "@/components/BottomNav";
import CrewsOverview from "@/components/CrewsOverview";
import OnboardingFlows from "@/components/OnboardingFlows";
import AccountSection from "@/components/AccountSection";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, User as UserIcon, Zap, ArrowRight, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCrew } from "@/contexts/CrewContext";
import { toast } from "sonner";

const Index = () => {
  const { user, userProfile, signOut } = useAuth();
  const { 
    activeCrew, 
    setActiveCrew, 
    createCrew, 
    joinCrew, 
    isLoadingRound,
    activeSyncRound, 
    startNewSyncRound 
  } = useCrew();
  const [activeNav, setActiveNav] = useState("sync");
  const [appState, setAppState] = useState<"overview" | "create" | "join">("overview");
  const [isStartingRound, setIsStartingRound] = useState(false);

  // ... (auto-scroll effect remains same)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeNav, activeCrew]);

  const handleCreateComplete = async (data: any) => {
    await createCrew(data);
    setAppState("overview");
  };

  const handleJoinComplete = async (data: any) => {
    await joinCrew(data.code);
    setAppState("overview");
  };

  const handleStartSync = async () => {
    setIsStartingRound(true);
    try {
      // Default to 3 months for now
      await startNewSyncRound(3);
    } catch (error) {
      console.error("Failed to start sync", error);
    } finally {
      setIsStartingRound(false);
    }
  };

  if (appState === "create" || appState === "join") {
    return (
      <OnboardingFlows
        type={appState}
        onBack={() => setAppState("overview")}
        onComplete={appState === "create" ? handleCreateComplete : handleJoinComplete}
      />
    );
  }

  if (activeCrew && isLoadingRound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-white space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
          <div className="w-16 h-16 border-t-2 border-primary rounded-full animate-spin relative z-10" />
        </div>
        <div className="text-[10px] font-bold tracking-[0.4em] text-white/20 uppercase animate-pulse">
          Synchronizing Squad Data
        </div>
      </div>
    );
  }

  if (!activeCrew && activeNav !== "profile") {
    return (
      <div className="relative min-h-screen">
        <CrewsOverview 
          onCreateClick={() => setAppState("create")}
          onJoinClick={() => setAppState("join")}
        />
        {/* Account Quick Settings */}
        <div className="fixed top-6 md:top-8 right-6 md:right-8 flex flex-col md:flex-row items-end md:items-center gap-3 md:gap-4 z-[9999] pointer-events-auto">
           <button 
             onClick={() => setActiveNav("profile")}
             className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold tracking-widest text-white/50 hover:text-white transition-all uppercase border border-white/10 px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-black/40 backdrop-blur-xl shadow-2xl hover:border-primary/50 group"
           >
             <UserIcon className="w-3 md:w-3.5 h-3 md:h-3.5 group-hover:scale-110 transition-transform" />
             Account
           </button>
           <button 
             onClick={signOut}
             className="text-[9px] md:text-[10px] font-bold tracking-widest text-white/50 hover:text-white transition-all uppercase border border-white/10 px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-black/40 backdrop-blur-xl shadow-2xl hover:border-red-500/50"
           >
             Sign Out
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      <AnimatePresence mode="wait">
        <motion.div
            key={activeCrew ? `crew-view-${activeCrew.id}` : 'account-view'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-80 bg-background min-h-[100dvh] w-full relative overflow-x-hidden"
        >
            {/* Cinematic Textures */}
            <div className="absolute inset-0 scanlines opacity-20 z-50 pointer-events-none" />
            <div className="absolute inset-0 grain opacity-[0.03] z-50 pointer-events-none" />

            {/* Back to Home Navigation */}
            <div className="absolute top-8 left-8 md:top-12 md:left-12 z-50">
              <button 
                onClick={() => {
                  if (activeCrew) setActiveCrew(null);
                  setActiveNav("sync");
                }}
                className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 border border-white/10 text-white/60 hover:text-white transition-all backdrop-blur-md group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-bold tracking-widest uppercase">{activeCrew ? "Overview" : "Dashboard"}</span>
              </button>
            </div>

          {activeCrew && (
            <div className="pt-16 md:pt-32 px-6 md:px-16 max-w-screen-2xl mx-auto mb-8 md:mb-32 relative z-10">
              <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start border-l border-white/5 pl-6 md:pl-16">
                <div className="space-y-6 md:space-y-12 flex-1">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-1.5 h-1.5 bg-primary glow-lime animate-pulse" />
                    <span className="text-label-surgical tracking-widest md:tracking-[0.8em] break-words whitespace-normal max-w-full block">
                      {activeNav === 'sync' ? 'Crew Connected' : activeNav === 'results' ? 'Moments Found' : 'Squad Hub'}
                    </span>
                  </motion.div>

                  <div className="space-y-4">
                    <motion.h1
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                      className="text-4xl sm:text-5xl md:text-8xl font-display font-medium leading-[0.85] tracking-tight text-white mb-2"
                    >
                      {activeCrew.name}
                    </motion.h1>
                    <div className="h-px w-32 bg-primary/40" />
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-6 md:gap-12 group mt-4 md:mt-0">
                  <div className="text-left md:text-right w-full">
                    <div className="text-[10px] font-bold text-white/30 tracking-widest mb-2 text-left md:text-right uppercase">Invite Friends</div>
                    <div className="flex items-center gap-2 justify-start md:justify-end w-full">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(activeCrew.inviteCode);
                          toast.success("Joined code copied!");
                        }}
                        className="flex-1 md:flex-none px-4 md:px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-primary/40 active:scale-95 transition-all duration-700 block group/code"
                      >
                        <span className="text-lg md:text-xl font-display font-bold text-white group-hover/code:text-primary transition-colors tracking-widest uppercase">{activeCrew.inviteCode}</span>
                      </button>
                      
                      {navigator.share && (
                        <button 
                          onClick={() => {
                            navigator.share({
                              title: `Join my WYGO Squad: ${activeCrew.name}`,
                              text: `Hey! Join our squad on WYGO using code: ${activeCrew.inviteCode}`,
                              url: window.location.origin
                            }).catch(() => {});
                          }}
                          className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 active:scale-90 transition-all shrink-0"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="hidden md:block text-[8px] font-bold text-white/10 tracking-widest leading-loose text-right uppercase">
                    Majority: {activeCrew.majorityCountry} <br />
                    Active Season 2024 <br />
                    User: {userProfile?.username || "Friend"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="relative z-10">
            {activeNav === "profile" ? (
              <AccountSection />
            ) : !activeSyncRound && activeCrew ? (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-4xl mx-auto px-6 md:px-8 py-4 md:py-12 flex flex-col items-center space-y-8 md:space-y-12"
              >
                 {activeCrew.ownerId === user?.uid ? (
                   <button 
                    onClick={handleStartSync}
                    disabled={isStartingRound}
                    className="button-premium px-12 py-5 sm:px-16 sm:py-6 text-lg hover:scale-105 transition-all shadow-[0_20px_60px_rgba(244,86,149,0.4)] disabled:opacity-50 z-20"
                   >
                     {isStartingRound ? "Manifesting..." : "Start a Sync Round"}
                   </button>
                 ) : (
                   <div className="px-10 py-5 rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-sm z-20">
                     <span className="text-sm font-bold text-white/50 tracking-widest uppercase">Waiting for Owner</span>
                   </div>
                 )}

                 <div className="flex flex-col items-center gap-6 opacity-60 hover:opacity-100 transition-opacity duration-700">
                    <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center relative group">
                        <Zap className="w-8 h-8 text-primary/30 group-hover:text-primary/70 transition-all duration-700" strokeWidth={1} />
                    </div>
                    <div className="space-y-4 text-center">
                        <h2 className="text-3xl md:text-5xl font-display font-medium italic">Quiet Sector.</h2>
                        <p className="text-white/40 max-w-sm mx-auto font-body text-base leading-relaxed">
                            Your crew is waiting. Kick off a sync to scan {activeCrew.majorityCountry} for the best windows.
                        </p>
                    </div>
                 </div>
              </motion.div>
            ) : (
              <>
                {activeNav === "results" && <GoldenWindowsSection />}
                {activeNav === "crew" && <CrewSection />}
                {activeNav === "sync" && <SquadSyncSection />}
              </>
            )}
          </div>

          <BottomNav
            active={activeNav}
            onNavigate={setActiveNav}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Index;
