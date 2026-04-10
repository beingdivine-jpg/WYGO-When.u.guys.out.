import { motion } from "framer-motion";
import GoldenWindowCard from "./GoldenWindowCard";
import { Sparkles, ArrowRight } from "lucide-react";
import { useCrew } from "@/contexts/CrewContext";
import { syncEngine } from "@/lib/syncEngine";

interface GoldenWindowsSectionProps {
  overrideRound?: any;
  overrideResponses?: any[];
  title?: string;
  subtitle?: string;
}

const GoldenWindowsSection = ({ overrideRound, overrideResponses, title, subtitle }: GoldenWindowsSectionProps) => {
  const { activeCrew, activeResponses, calculatedResults, activeSyncRound } = useCrew();
  
  const currentRound = overrideRound || activeSyncRound;
  const currentResponses = overrideResponses || activeResponses;
  
  // If we have overrides, we need to recalculate results locally for this view
  const goldenWindows = (overrideRound && overrideResponses) 
    ? syncEngine.calculateResults(
        overrideResponses, 
        activeCrew!, 
        overrideRound.durationMonths,
        overrideRound.startDate?.toDate ? overrideRound.startDate.toDate() : new Date(overrideRound.startDate)
      )
    : calculatedResults;
  
  const categories = [
    { title: "Perfect Moments", filter: (gw: any) => gw.matchStrength > 90, description: "Everyone is free. No excuses." },
    { title: "Easy Escapes", filter: (gw: any) => (gw.leaveDays && gw.leaveDays > 0) || gw.holidayBoost, description: "Minimal effort, maximum reward." },
    { title: "Top Recommendations", filter: (gw: any) => gw.matchStrength <= 90 && gw.matchStrength >= 60, description: "Best overlapping potential for the group." },
    { title: "Squad Potential", filter: (gw: any) => gw.matchStrength < 60, description: "Emerging windows that need more crew input." },
  ];

  const hasResults = goldenWindows.length > 0;
  const maxStrength = hasResults ? Math.max(...goldenWindows.map(gw => gw.matchStrength)) : 0;
  const totalMembers = activeCrew?.memberIds.length || 0;
  const responseCount = currentResponses.length;

  const isSoloCrew = totalMembers === 1;
  const isWaitingForFriends = totalMembers > 1 && responseCount === 1;
  const isNoInput = totalMembers > 1 && responseCount === 0;
  const isClashing = totalMembers > 1 && responseCount >= 2 && !hasResults;

  return (
    <section className="py-8 md:py-48 pb-28 md:pb-48 px-4 md:px-8 bg-background text-foreground relative overflow-hidden selection:bg-primary/20">

      <div className="max-w-7xl mx-auto space-y-16 md:space-y-32 relative z-10">

        {/* Elegant Discovery Header */}
        <div className="flex flex-col md:flex-row gap-6 md:p-10 md:gap-20 items-end justify-between border-b border-white/10 pb-10 md:pb-20">
          <div className="space-y-8 flex-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-1.5 rounded-full editorial-card"
            >
              <span className="text-social-label text-[10px] uppercase tracking-widest text-muted-foreground">
                {hasResults ? "Squad Discovery Complete" : "Discovery Scanning..."}
              </span>
            </motion.div>

            <div className="space-y-4">
              <h2 className="text-display-header leading-tight max-w-2xl text-foreground">
                {title || (
                  <>
                    The moments you've been <br />
                    <span className="text-primary font-medium text-4xl md:text-9xl">waiting for.</span>
                  </>
                )}
              </h2>
              {subtitle && <p className="text-muted-foreground font-body text-xl">{subtitle}</p>}
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-6">
            <div className="text-left md:text-right">
              <div className="text-social-label mb-2 uppercase tracking-widest">Sync Confidence</div>
              <div className="text-5xl md:text-8xl font-display font-bold text-foreground leading-none tracking-tighter">
                {hasResults ? (
                  <>Over <span className="text-primary">{maxStrength}%</span></>
                ) : (
                  <span className="text-muted-foreground">{isSoloCrew ? "Invite" : isWaitingForFriends ? "Waiting" : "Scanning"}...</span>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-body max-w-xs md:text-right leading-relaxed">
              {hasResults 
                ? "We've analyzed every available window to find the highest overlapping potential for your squad."
                : isSoloCrew 
                  ? "Invite your friends to the crew to start discovering overlapping dates."
                  : isWaitingForFriends
                    ? "We have your dates! Just waiting on the rest of the squad."
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
             <div className="w-32 h-32 rounded-[2rem] editorial-card flex items-center justify-center relative group shadow-sm">
                <Sparkles className={`w-12 h-12 ${isClashing ? "text-destructive" : isSoloCrew ? "text-muted-foreground" : "text-primary"}`} />
             </div>
             <div className="space-y-4">
                <h3 className="text-5xl font-display font-medium text-foreground">
                  {isSoloCrew 
                    ? "The Escape Awaits." 
                    : isWaitingForFriends
                      ? "Sync Initiated."
                      : isNoInput
                        ? "Calculating Magic."
                        : "Schedule Clashing."}
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto font-body text-lg leading-relaxed">
                   {isSoloCrew 
                     ? "Invite your crew to start discovering your Golden Windows."
                     : isWaitingForFriends
                       ? "Waiting for your friends to add their dates before generating the optimal escapes."
                       : isNoInput
                         ? "We need markers from the squad before we can reveal the Golden Windows."
                         : "We couldn't find a strong enough window with the current responses. Adjust markers or scan further ahead."}
                </p>
             </div>
             <div className="flex items-center gap-4 text-muted-foreground text-[10px] font-bold tracking-[0.3em] uppercase">
                {isSoloCrew ? (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 animate-pulse" />
                    Solo Mode Active
                  </>
                ) : isWaitingForFriends || isNoInput ? (
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
          <div className="space-y-20 md:space-y-40">
            {categories.map((cat, ci) => {
              const filteredWindows = goldenWindows.filter(cat.filter);
              if (filteredWindows.length === 0) return null;

              return (
                <div key={cat.title} className="space-y-12">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                    <div className="space-y-2">
                      <h3 className="text-4xl font-display font-medium tracking-tight text-foreground">
                        {cat.title}
                      </h3>
                      <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {cat.description}
                      </div>
                    </div>
                    <div className="h-px flex-1 bg-border mx-8 hidden md:block" />
                    <div className="text-social-label text-muted-foreground tracking-widest uppercase">
                      Option 0{ci + 1}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:p-8">
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
        <div className="flex flex-col items-center text-center gap-6 md:p-12 pt-24 border-t border-white/5">
          <div className="space-y-4">
            <h3 className="text-3xl font-display font-medium">Want to see more?</h3>
            <p className="text-muted-foreground max-w-md mx-auto">We can extend the scan to look even further into the year if the crew is feeling ambitious.</p>
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
