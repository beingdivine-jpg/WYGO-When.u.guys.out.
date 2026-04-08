import { motion } from "framer-motion";
import type { GoldenWindow } from "@/types";
import { Zap, ArrowRight } from "lucide-react";

interface GoldenWindowCardProps {
  window: GoldenWindow;
  index: number;
  totalMembers: number;
  featured?: boolean;
}

const GoldenWindowCard = ({ window: gw, index, totalMembers, featured }: GoldenWindowCardProps) => {
  const freeCount = gw.freeMembers.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`group relative p-6 md:p-10 rounded-[3rem] transition-all duration-700 editorial-card flex flex-col justify-between shadow-sm backdrop-blur-md overflow-hidden ${featured ? "ring-2 ring-primary shadow-sm" : "hover:border-primary/40 hover:shadow-md focus:ring-primary/40"}`}
    >
      {/* Background Accent */}
      {featured && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-12 translate-x-12 pointer-events-none" />
      )}

      <div className="relative z-10 flex flex-col gap-6 md:p-10">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${featured ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
              <span className="text-social-label text-[10px] tracking-widest text-muted-foreground">{featured ? 'TOP_PICK' : `OPTION_0${index + 1}`}</span>
            </div>
            <div className={`px-4 py-1.5 rounded-full inline-block border text-[10px] font-bold tracking-wider ${featured ? 'bg-primary border-primary text-white' : 'bg-secondary border-border text-muted-foreground'}`}>
              {gw.matchStrength}% SYNC
            </div>
          </div>

          {gw.holidayBoost && (
            <div className="bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full flex items-center gap-2 text-primary max-w-[140px]">
              <Zap className="w-3 h-3 fill-current flex-shrink-0" />
              <span className="text-[10px] font-bold tracking-wider truncate uppercase">{gw.holidayBoost}</span>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-4">
          <h3 className="text-2xl md:text-5xl font-display font-medium tracking-tight text-foreground group-hover:text-primary transition-colors">
            {gw.dateRange}
          </h3>
          <p className="text-sm font-medium text-muted-foreground italic font-body lowercase">
            {gw.dates}
          </p>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed font-body line-clamp-3">
          {gw.explanation}
        </p>
      </div>

      <div className="relative z-10 space-y-8 pt-8 border-t border-border mt-auto">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Available</div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-display font-bold text-foreground">{freeCount}</span>
              <span className="text-sm text-muted-foreground mb-1">/ {totalMembers} friends</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-muted-foreground tracking-widest mb-1 uppercase">Leave Impact</div>
            <div className={`text-xs font-bold ${gw.leaveDays ? 'text-amber-500' : 'text-primary'}`}>
              {gw.leaveDays ? `${gw.leaveDays} Day Unlock` : 'No Leave Needed'}
            </div>
          </div>
        </div>

        <button className="button-premium w-full group py-4 flex items-center justify-center gap-3">
          <span>Lock Weekend</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {featured && (
        <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
      )}
    </motion.div>
  );
};

export default GoldenWindowCard;
