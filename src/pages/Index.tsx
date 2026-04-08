import { useState, useEffect } from "react";
import GoldenWindowsSection from "@/components/GoldenWindowsSection";
import CrewSection from "@/components/CrewSection";
import SquadSyncSection from "@/components/SquadSyncSection";
import BottomNav from "@/components/BottomNav";
import CrewsOverview from "@/components/CrewsOverview";
import OnboardingFlows from "@/components/OnboardingFlows";
import AccountSection from "@/components/AccountSection";
import { TutorialOverlay } from "@/components/TutorialOverlay";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, User as UserIcon, Zap, CheckCircle2, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCrew } from "@/contexts/CrewContext";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// InviteScreen — shown immediately after creating a crew
// ---------------------------------------------------------------------------
const InviteScreen = ({
  activeCrew,
  onClose,
}: {
  activeCrew: any;
  onClose: () => void;
}) => {
  const [shared, setShared] = useState(false);
  const inviteLink = `${window.location.origin}/join/${activeCrew.inviteCode}`;
  const memberCount = activeCrew.memberIds?.length || 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-background px-6 text-center"
    >
      <h1 className="text-3xl md:text-5xl font-display font-medium mb-3">
        Invite your crew
      </h1>

      <div className="text-[10px] md:text-xs font-medium tracking-wide text-primary/80 mb-6 bg-primary/10 px-4 py-2 rounded-full inline-flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        {memberCount <= 1
          ? "Waiting for others to join..."
          : `${memberCount} people joined`}
      </div>

      <p className="text-base text-muted-foreground mb-8 max-w-sm font-body leading-relaxed flex items-center justify-center">
        {shared ? (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-foreground font-medium flex items-center justify-center gap-2 bg-secondary px-5 py-2.5 rounded-full"
          >
            <CheckCircle2 className="w-4 h-4 text-green-500" /> Link sent —
            waiting for others to join
          </motion.span>
        ) : (
          "Share this link so everyone can drop their availability."
        )}
      </p>

      <div className="w-full max-w-sm editorial-card rounded-2xl px-6 py-4 mb-6">
        <span className="text-base md:text-xl font-display tracking-widest uppercase break-all font-bold text-foreground">
          {inviteLink}
        </span>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {navigator.share ? (
          <div className="space-y-2">
            <button
              onClick={async () => {
                try {
                  await navigator.share({ url: inviteLink });
                  setShared(true);
                } catch (_) {
                  // cancelled
                }
              }}
              className="w-full py-4 rounded-xl bg-primary text-black font-medium tracking-wide hover:scale-[1.02] active:scale-95 transition-all text-sm"
            >
              Invite friends
            </button>
            <div className="text-[10px] font-bold text-white/20 text-center uppercase tracking-widest pb-1">
              Takes 2 seconds
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(inviteLink);
              toast.success("Link copied!");
              setShared(true);
            }}
            className={`w-full py-4 rounded-xl border font-medium tracking-wide hover:scale-[1.02] active:scale-95 transition-all text-sm ${
              navigator.share
                ? "bg-secondary border-border text-foreground"
                : "bg-primary border-primary text-white"
            }`}
          >
            {navigator.share ? "Copy link" : "Invite friends"}
          </button>
          {!navigator.share && (
            <div className="text-[10px] font-bold text-muted-foreground text-center uppercase tracking-widest pb-1">
              Takes 2 seconds
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onClose}
        className="mt-8 text-xs font-bold text-white/30 tracking-widest uppercase hover:text-white transition-colors p-4"
      >
        Skip for now
      </button>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Main Index page
// ---------------------------------------------------------------------------
const Index = () => {
  const { user, userProfile, signOut, updateProfile } = useAuth();
  const {
    userCrews,
    activeCrew,
    setActiveCrew,
    createCrew,
    joinCrew,
    isLoadingRound,
    activeSyncRound,
    startNewSyncRound,
  } = useCrew();

  const [activeNav, setActiveNav] = useState("sync");
  const [appState, setAppState] = useState<"overview" | "create" | "join">(
    "overview"
  );
  const [isStartingRound, setIsStartingRound] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeNav, activeCrew]);

  // ── Tutorial handlers ───────────────────────────────────────────────────
  const handleTutorialComplete = async (path: "create" | "join") => {
    await updateProfile({ tutorialCompleted: true });
    setAppState(path);
  };

  const handleTutorialSkip = async () => {
    await updateProfile({ tutorialCompleted: true });
  };

  // ── Crew flow handlers ──────────────────────────────────────────────────
  const handleCreateComplete = async (data: any) => {
    await createCrew(data);
    setShowInvite(true);
    setAppState("overview");
  };

  const handleJoinComplete = async (data: any) => {
    try {
      await joinCrew(data.code);
      toast.success("Request sent to squad owner!");
      setAppState("overview");
    } catch (error: any) {
      if (error.message === "ALREADY_REQUESTED") {
        toast.error("You've already requested to join this squad.");
      } else if (error.message === "ALREADY_MEMBER") {
        toast.error("You're already a member of this squad.");
      } else if (error.message === "SQUAD_NOT_FOUND") {
        toast.error("Squad not found. Check the code.");
      } else {
        toast.error("Failed to join squad.");
      }
    }
  };

  const handleStartSync = async () => {
    setIsStartingRound(true);
    try {
      await startNewSyncRound(3);
    } catch (error) {
      console.error("Failed to start sync", error);
    } finally {
      setIsStartingRound(false);
    }
  };

  // ── Routing guards ──────────────────────────────────────────────────────
  if (appState === "create" || appState === "join") {
    return (
      <OnboardingFlows
        type={appState}
        onBack={() => setAppState("overview")}
        onComplete={
          appState === "create" ? handleCreateComplete : handleJoinComplete
        }
      />
    );
  }

  if (showInvite && activeCrew) {
    return (
      <InviteScreen
        activeCrew={activeCrew}
        onClose={() => setShowInvite(false)}
      />
    );
  }

  if (activeCrew && isLoadingRound) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background text-foreground space-y-8">
        <div className="w-16 h-16 border-t-2 border-primary rounded-full animate-spin" />
        <div className="text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase animate-pulse">
          Synchronizing Squad Data
        </div>
      </div>
    );
  }

  // Show tutorial if the user has no crews and hasn't completed it yet
  const isFirstTimeUser =
    userCrews.length === 0 &&
    userProfile != null &&
    !userProfile.tutorialCompleted;

  if (!activeCrew && activeNav !== "profile") {
    if (isFirstTimeUser) {
      return (
        <TutorialOverlay
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      );
    }

    return (
      <div className="relative min-h-[100dvh]">
        <CrewsOverview
          onCreateClick={() => setAppState("create")}
          onJoinClick={() => setAppState("join")}
        />
        {/* Floating account / sign-out buttons */}
        <div className="fixed top-4 md:top-6 right-4 md:right-8 flex flex-row items-center gap-2 md:gap-4 z-[9999] pointer-events-auto">
          <button
            onClick={() => setActiveNav("profile")}
            className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-foreground/70 hover:text-foreground transition-all uppercase px-3 md:px-6 py-2 md:py-2.5 rounded-full editorial-card hover:bg-secondary group"
          >
            <UserIcon className="w-3 md:w-3.5 h-3 md:h-3.5 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Account</span>
          </button>
          <button
            onClick={signOut}
            className="text-[10px] font-bold tracking-widest text-foreground/70 hover:text-foreground transition-all uppercase px-3 md:px-6 py-2 md:py-2.5 rounded-full editorial-card hover:bg-red-50 hover:text-red-500"
          >
            <span className="hidden sm:inline">Sign Out</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Main crew view ──────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCrew ? `crew-view-${activeCrew.id}` : "account-view"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pb-28 md:pb-48 bg-background min-h-[100dvh] w-full relative overflow-x-hidden"
        >
          {/* Back navigation */}
          <div className="absolute top-4 left-4 md:top-6 md:left-12 z-50">
            <button
              onClick={() => {
                if (activeCrew) setActiveCrew(null);
                setActiveNav("sync");
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-full editorial-card text-foreground/60 hover:text-foreground hover:bg-secondary transition-all shadow-sm group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-semibold tracking-wide">
                {activeCrew ? "Overview" : "Dashboard"}
              </span>
            </button>
          </div>

          {activeCrew && (
            <div className="pt-20 md:pt-32 px-6 md:px-16 max-w-screen-2xl mx-auto mb-8 md:mb-32 relative z-10">
              <div className="flex flex-col md:flex-row gap-6 md:gap-16 items-start border-l border-white/5 pl-6 md:pl-16">
                <div className="space-y-6 md:space-y-12 flex-1">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-label-surgical tracking-widest md:tracking-[0.8em] break-words whitespace-normal max-w-full block">
                      {activeNav === "sync"
                        ? "Crew Connected"
                        : activeNav === "results"
                        ? "Moments Found"
                        : "Squad Hub"}
                    </span>
                  </motion.div>

                  <div className="space-y-4">
                    <motion.h1
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                      className="text-4xl sm:text-5xl md:text-8xl font-display font-medium leading-[0.9] pb-1 tracking-tight text-foreground mb-2"
                    >
                      {activeCrew.name}
                    </motion.h1>
                    <div className="h-px w-32 bg-border" />
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-6 mt-4 md:mt-0">
                  <div className="text-left md:text-right w-full">
                    <div className="text-[10px] font-bold text-muted-foreground tracking-widest mb-2 uppercase">
                      Invite Friends
                    </div>
                    <div className="flex items-center gap-2 justify-start md:justify-end w-full">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(activeCrew.inviteCode);
                          toast.success("Invite code copied!");
                        }}
                        className="flex-1 md:flex-none px-4 md:px-6 py-3 rounded-2xl editorial-card hover:border-primary active:scale-95 transition-all duration-700 block group/code shadow-sm"
                      >
                        <span className="text-lg md:text-xl font-display font-bold text-foreground group-hover/code:text-primary transition-colors tracking-widest uppercase">
                          {activeCrew.inviteCode}
                        </span>
                      </button>

                      {navigator.share && (
                        <button
                          onClick={() => {
                            navigator
                              .share({
                                title: `Join my WYGO Squad: ${activeCrew.name}`,
                                text: `Hey! Join our squad on WYGO using code: ${activeCrew.inviteCode}`,
                                url: window.location.origin,
                              })
                              .catch(() => {});
                          }}
                          className="p-3.5 rounded-2xl editorial-card text-foreground hover:bg-secondary/70 active:scale-90 transition-all shrink-0"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="hidden md:block text-[10px] font-bold text-muted-foreground tracking-widest leading-loose text-right uppercase">
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
                    className="button-premium px-12 py-5 sm:px-16 sm:py-6 text-lg hover:scale-105 transition-all disabled:opacity-50 z-20"
                  >
                    {isStartingRound ? "Starting..." : "Start a Sync Round"}
                  </button>
                ) : (
                  <div className="px-10 py-5 rounded-[2rem] editorial-card z-20">
                    <span className="text-sm font-bold text-muted-foreground tracking-widest uppercase">
                      Waiting for Owner
                    </span>
                  </div>
                )}

                <div className="flex flex-col items-center gap-6 opacity-60 hover:opacity-100 transition-opacity duration-700 mt-8">
                  <div className="w-24 h-24 rounded-full editorial-card flex items-center justify-center relative group">
                    <Zap
                      className="w-8 h-8 text-primary/70 group-hover:text-primary transition-all duration-700"
                      strokeWidth={1}
                    />
                  </div>
                  <div className="space-y-4 text-center">
                    <h2 className="text-3xl md:text-5xl font-display font-medium bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent pb-1">
                      {activeCrew.ownerId === user?.uid
                        ? "Your turn."
                        : "All caught up."}
                    </h2>
                    <p className="text-muted-foreground max-w-sm mx-auto font-body text-base leading-relaxed">
                      {activeCrew.ownerId === user?.uid
                        ? `Your crew is waiting. Kick off a sync to discover the best upcoming weekends in ${activeCrew.majorityCountry}.`
                        : `Hang tight. The squad leader will kick off the next sync round soon. In the meantime, convince your friends to join.`}
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
        </motion.div>
      </AnimatePresence>

      {/*
        BottomNav lives OUTSIDE AnimatePresence/motion.div so position:fixed anchors
        to the true viewport. Framer Motion applies CSS transforms which — per the CSS spec —
        make the animated element the containing block for fixed children, breaking anchoring.
      */}
      <BottomNav active={activeNav} onNavigate={setActiveNav} />
    </div>
  );
};

export default Index;
