import { motion } from "framer-motion";
import { goldenWindows } from "@/data/mockData";
import GoldenWindowCard from "./GoldenWindowCard";
import { Sparkles } from "lucide-react";

const GoldenWindowsSection = () => {
  return (
    <section className="py-20 px-6 relative">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-accent/5 blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-xs font-body font-bold uppercase tracking-[0.2em] text-accent">
              Best Matches
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-foreground">
            Golden Windows
          </h2>
          <p className="text-muted-foreground font-body mt-2 max-w-lg">
            Your crew's best escape windows — ranked by match strength,
            holiday boosts, and who's actually free.
          </p>
        </motion.div>

        <div className="grid gap-4">
          {goldenWindows.map((gw, i) => (
            <GoldenWindowCard key={gw.id} window={gw} index={i} featured={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GoldenWindowsSection;
