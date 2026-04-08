import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, ArrowRight, Zap, Combine, ChevronRight, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type TutorialPath = "selection" | "create" | "join";

export const TutorialOverlay = ({ 
  onComplete, 
  onSkip 
}: { 
  onComplete: (path: "create" | "join") => void,
  onSkip: () => void
}) => {
  const { userProfile } = useAuth();
  const [path, setPath] = useState<TutorialPath>("selection");
  const [step, setStep] = useState(0);

  const handleSelection = (selectedPath: "create" | "join") => {
    setPath(selectedPath);
    setStep(0);
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden text-foreground selection:bg-primary/20 absolute inset-0 z-50">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />

      {/* Top Nav for Skip */}
      <div className="absolute top-6 right-6 md:top-12 md:right-12 z-50">
        <button 
          onClick={onSkip}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all group px-4 py-2 editorial-card rounded-full"
        >
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-[10px] font-bold tracking-widest uppercase">Skip</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-4xl mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          
          {path === "selection" && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <div className="text-center mb-12 md:mb-20 space-y-4">
                <span className="text-social-label text-primary">Getting Started</span>
                <h1 className="text-4xl md:text-6xl font-display font-medium leading-tight">
                  Welcome to WYGO, <br className="hidden md:block"/>
                  <span className="text-primary italic">@{userProfile?.username || "friend"}</span>.
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl max-w-lg mx-auto font-body">
                  Before we start finding the perfect weekends, tell us how you're getting here.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-3xl mx-auto w-full">
                {/* Create Card */}
                <button 
                  onClick={() => handleSelection("create")}
                  className="editorial-card p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] text-left hover:border-primary/30 hover:-translate-y-1 transition-all duration-500 group flex flex-col h-full bg-white relative overflow-hidden"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform duration-500">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-display font-medium mb-3 group-hover:text-primary transition-colors">I'm the Captain.</h3>
                  <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed font-body">
                    I want to create a new squad and invite my friends to sync up.
                  </p>
                  <div className="mt-auto flex items-center gap-2 text-xs font-bold tracking-widest text-primary uppercase pt-4 border-t border-border w-full">
                    Take the Lead <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </button>

                {/* Join Card */}
                <button 
                  onClick={() => handleSelection("join")}
                  className="editorial-card p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] text-left hover:-translate-y-1 transition-all duration-500 group flex flex-col h-full bg-secondary/30 relative overflow-hidden"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white border border-border flex items-center justify-center text-muted-foreground mb-8 group-hover:scale-110 transition-transform duration-500">
                    <UserPlus className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-display font-medium mb-3 group-hover:text-foreground/80 transition-colors">I was invited.</h3>
                  <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed font-body">
                    I have a secret invite code and I want to join my existing crew.
                  </p>
                  <div className="mt-auto flex items-center gap-2 text-xs font-bold tracking-widest text-foreground/50 uppercase group-hover:text-foreground transition-colors pt-4 border-t border-border w-full">
                    Join Squad <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {path === "create" && (
            <motion.div
              key="create-tutorial"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full flex justify-center"
            >
              <div className="max-w-xl w-full editorial-card bg-white p-8 md:p-16 rounded-[3rem] relative text-center">
                <div className="flex justify-center gap-2 mb-12">
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 0 ? "w-10 bg-primary" : "w-4 bg-secondary"}`} />
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 1 ? "w-10 bg-primary" : "w-4 bg-secondary"}`} />
                </div>

                <AnimatePresence mode="wait">
                  {step === 0 ? (
                    <motion.div
                      key="create-slide-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto text-primary">
                        <Zap className="w-10 h-10" />
                      </div>
                      <h2 className="text-3xl md:text-4xl font-display font-medium">We find the overlaps.</h2>
                      <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-body">
                        As captain, you'll choose the planning horizon. WYGO automatically scans upcoming weekends and highlights public holidays for your region.
                      </p>
                      <button 
                         onClick={() => setStep(1)}
                         className="mt-8 px-10 py-4 editorial-card rounded-full text-sm font-bold tracking-wide hover:bg-secondary transition-colors"
                      >
                         Next <ChevronRight className="w-4 h-4 inline" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="create-slide-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center mx-auto text-white">
                        <Combine className="w-10 h-10" />
                      </div>
                      <h2 className="text-3xl md:text-4xl font-display font-medium">Share & Sync.</h2>
                      <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-body">
                        Once created, share the invite code. As friends drop their availability, the optimal weekend magically surfaces at the top.
                      </p>
                      <button 
                         onClick={() => onComplete("create")}
                         className="mt-8 button-premium px-12 py-5 shadow-lg shadow-primary/20 hover:-translate-y-1 w-full"
                      >
                         Start Your Crew
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {path === "join" && (
            <motion.div
              key="join-tutorial"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full flex justify-center"
            >
              <div className="max-w-xl w-full editorial-card bg-white p-8 md:p-16 rounded-[3rem] relative text-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="w-20 h-20 border-2 border-dashed border-border rounded-[2rem] flex items-center justify-center mx-auto text-muted-foreground">
                    <UserPlus className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display font-medium">Enter. Sync. Relax.</h2>
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-body">
                    Just drop in your invite code, tap standard weekends if you are free, and let WYGO do the heavy math to find the perfect squad date.
                  </p>
                  <button 
                      onClick={() => onComplete("join")}
                      className="mt-8 px-12 py-5 rounded-2xl bg-foreground text-background font-medium hover:bg-foreground/90 transition-all shadow-md w-full"
                  >
                      I have my code
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
