import { motion } from "framer-motion";
import type { GoldenWindow } from "@/data/mockData";
import { Sparkles, Calendar, Users, ArrowRight } from "lucide-react";

interface GoldenWindowCardProps {
  window: GoldenWindow;
  index: number;
  featured?: boolean;
}

const GoldenWindowCard = ({ window: gw, index, featured }: GoldenWindowCardProps) => {
  const isGolden = gw.tags.includes("Golden Window");

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`relative group ${featured ? "col-span-full" : ""}`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-500 ${
          isGolden
            ? "glass border-accent/30 glow-accent-subtle hover:glow-accent"
            : "glass hover:border-primary/30"
        } ${featured ? "p-8" : ""}`}
      >
        {/* Match strength bar */}
        <div className="absolute top-0 left-0 h-1 rounded-t-2xl transition-all duration-500"
          style={{
            width: `${gw.matchStrength}%`,
            background: isGolden
              ? `linear-gradient(90deg, hsl(var(--accent)), hsl(var(--accent) / 0.5))`
              : `linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.5))`,
          }}
        />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isGolden && <Sparkles className="w-4 h-4 text-accent" />}
              <span className={`text-sm font-body font-semibold tracking-wide uppercase ${
                isGolden ? "text-accent" : "text-primary"
              }`}>
                {gw.tags[0]}
              </span>
            </div>
            <h3 className="font-display text-2xl font-extrabold text-foreground">
              {gw.dateRange}
            </h3>
            <span className="text-sm text-muted-foreground font-body">{gw.dates}</span>
          </div>
          <div className={`flex items-center justify-center w-14 h-14 rounded-xl font-display font-extrabold text-lg ${
            isGolden ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary"
          }`}>
            {gw.matchStrength}%
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {gw.tags.slice(1).map((tag) => (
            <span
              key={tag}
              className={`px-2.5 py-1 rounded-lg text-xs font-body font-semibold ${
                tag.includes("Luxembourg") || tag.includes("Boost")
                  ? "bg-accent/10 text-accent"
                  : tag.includes("Leave")
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tag}
            </span>
          ))}
          {gw.holidayBoost && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-body font-semibold bg-accent/10 text-accent">
              {gw.holidayBoost}
            </span>
          )}
          {gw.leaveDays !== undefined && gw.leaveDays > 0 && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-body font-semibold bg-primary/10 text-primary">
              {gw.leaveDays} Leave Day{gw.leaveDays > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Squad status */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex -space-x-2">
            {gw.freeMembers.map((m) => (
              <div
                key={m}
                className="w-8 h-8 rounded-full bg-accent/20 border-2 border-background flex items-center justify-center text-xs font-body font-bold text-accent"
              >
                {m[0]}
              </div>
            ))}
            {gw.maybeMembers.map((m) => (
              <div
                key={m}
                className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-body font-bold text-primary"
              >
                {m[0]}
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground font-body">
            <span className="text-accent font-semibold">{gw.freeMembers.length} free</span>
            {gw.maybeMembers.length > 0 && (
              <span> · <span className="text-primary">{gw.maybeMembers.length} maybe</span></span>
            )}
          </div>
        </div>

        {/* Explanation */}
        <p className="text-sm text-muted-foreground font-body leading-relaxed">
          {gw.explanation}
        </p>

        {/* CTA */}
        <motion.div
          className="mt-4 flex items-center gap-2 text-sm font-body font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          whileHover={{ x: 4 }}
        >
          Lock this window <ArrowRight className="w-4 h-4" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GoldenWindowCard;
