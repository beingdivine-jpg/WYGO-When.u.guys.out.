import { motion } from "framer-motion";
import GoldenWindowCard from "./GoldenWindowCard";
import { Sparkles, ArrowRight } from "lucide-react";
import { useCrew } from "@/contexts/CrewContext";

const GoldenWindowsSection = () => {
  const { activeCrew, activeResponses, calculatedResults } = useCrew();
  const goldenWindows = calculatedResults;
  
  const categories = [
    { title: "Perfect Moments", filter: (gw: any) => gw.matchStrength > 90, description: "Everyone is free. No excuses." },
    { title: "Easy Escapes", filter: (gw: any) => (gw.leaveDays && gw.leaveDays > 0) || gw.holidayBoost, description: "Minimal effort, maximum reward." },
    { title: "Top Recommendations", filter: (gw: any) => gw.matchStrength <= 90 && gw.matchStrength > 60, description: "Best overlapping potential for the group." },
  ];

  const hasResults = goldenWindows.length > 0;
  const maxStrength = hasResults ? Math.max(...goldenWindows.map(gw => gw.matchStrength)) : 0;
  const totalMembers = activeCrew?.memberIds.length || 0;

  return (
    <section className="py-24 md:py-48 px-8 bg-background text-white relative overflow-hidden selection:bg-primary/20">
      {/* Soft Romantic Glows */}
      <div className="absolute top-[10%] -left-[10%] w-[60vw] h-[60vw] bg-primary/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[10%] -right-[10%] w-[50vw] h-[50vw] bg-purple-500/10 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto space-y-32 relative z-10">

        {/* Elegant Discovery Header */}
        <div className="flex flex-col md:flex-row gap-20 items-end justify-between border-b border-white/10 pb-20">
          <div className="space-y-8 flex-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <span className="text-social-label text-[9px] uppercase tracking-widest">
                {hasResults ? "Squad Discovery Complete" : "Discovery Scanning..."}
              </span>
            </motion.div>

            <div className="space-y-4">
              <h2 className="text-display-header leading-tight max-w-2xl">
                The moments you've been <br />
                <span className="text-primary italic font-medium text-7xl md:text-9xl">waiting for.</span>
              </h2>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-6">
            <div className="text-left md:text-right">
              <div className="text-social-label mb-2 uppercase tracking-widest">Sync Confidence</div>
              <div className="text-6xl md:text-8xl font-display font-bold text-white leading-none tracking-tighter">
                {hasResults ? (
                  <>Over <span className="text-primary italic">{maxStrength}%</span></>
                ) : (
                  <span className="text-white/20 italic">Scanning...</span>
                )}
              </div>
            </div>
            <p className="text-sm text-white/40 font-body max-w-xs md:text-right leading-relaxed">
              {hasResults 
                ? "We've analyzed every available window to find the highest overlapping potential for your squad."
                : "Awaiting squad responses to compute the optimal escape windows."
              }
            </p>
          </div>
        </div>

        {/* Results with Social Rhythm */}
        {!hasResults ? (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-48 text-center space-y-12"
          >
             <div className="w-32 h-32 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-20" />
                <Sparkles className="w-12 h-12 text-primary/40" />
             </div>
             <div className="space-y-4">
                <h3 className="text-5xl font-display font-medium italic">
                  {activeResponses.length === 0 ? "Calculating Magic." : "Schedule Clashing."}
                </h3>
                <p className="text-white/30 max-w-sm mx-auto font-body text-lg leading-relaxed">
                   {activeResponses.length === 0 
                     ? "We need markers from the squad before we can reveal the Golden Windows."
                     : "We couldn't find a strong enough window with the current responses. Adjust markers or scan further ahead."
                   }
                </p>
             </div>
             <div className="flex items-center gap-4 text-primary/40 text-[10px] font-bold tracking-[0.3em] uppercase">
                {activeResponses.length === 0 ? (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Awaiting Inputs
                  </>
                ) : (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                    <span className="text-destructive">Deadlock Detected</span>
                  </>
                )}
             </div>
          </motion.div>
        ) : (
          <div className="space-y-40">
            {categories.map((cat, ci) => {
              const filteredWindows = goldenWindows.filter(cat.filter);
              if (filteredWindows.length === 0) return null;

              return (
                <div key={cat.title} className="space-y-12">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                    <div className="space-y-2">
                      <h3 className="text-4xl font-display font-medium tracking-tight text-white/90">
                        {cat.title}
                      </h3>
                      <div className="text-xs font-medium tracking-wide text-white/30 uppercase">
                        {cat.description}
                      </div>
                    </div>
                    <div className="h-px flex-1 bg-white/5 mx-8 hidden md:block" />
                    <div className="text-social-label text-primary/40 tracking-widest uppercase">
                      Option 0{ci + 1}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredWindows.map((gw, i) => (
                      <GoldenWindowCard 
                        key={gw.id} 
                        window={gw} 
                        index={i} 
                        totalMembers={totalMembers}
                        featured={ci === 0 && i === 0} 
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Social Call to Action */}
        <div className="flex flex-col items-center text-center gap-12 pt-24 border-t border-white/5">
          <div className="space-y-4">
            <h3 className="text-3xl font-display font-medium italic">Want to see more?</h3>
            <p className="text-white/40 max-w-md mx-auto">We can extend the scan to look even further into the year if the crew is feeling ambitious.</p>
          </div>
          <button className="button-premium min-w-[320px] shadow-[0_20px_60px_rgba(244,86,149,0.3)]">
            Look Further Ahead
          </button>
        </div>
      </div>
    </section>
  );
};

export default GoldenWindowsSection;
