import { motion } from "framer-motion";
import { Zap, Users, CalendarDays, User } from "lucide-react";

const navItems = [
  { icon: CalendarDays, label: "Sync", id: "sync" },
  { icon: Zap, label: "Results", id: "results" },
  { icon: Users, label: "Squad", id: "crew" },
  { icon: User, label: "Profile", id: "profile" },
];

interface BottomNavProps {
  active: string;
  onNavigate: (id: string) => void;
}

const BottomNav = ({ active, onNavigate }: BottomNavProps) => {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      // px-3 on mobile keeps the pill 6px away from each edge; md:px-6 restores desktop breathing room
      className="fixed bottom-6 md:bottom-12 inset-x-0 z-50 pointer-events-none px-3 md:px-6 flex justify-center"
    >
      {/*
        overflow-hidden: prevents any child from widening past the pill's own box.
        We removed overflow-x-auto (it was allowing scroll instead of preventing overflow).
        gap-1 md:gap-2 / p-1.5 md:p-2 retain the original desktop spacing exactly.
      */}
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-1.5 md:p-2 rounded-full pointer-events-auto flex items-stretch gap-1 md:gap-2 shadow-[0_20px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/5 overflow-hidden">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              data-tab={item.id}
              onClick={() => onNavigate(item.id)}
              aria-label={item.label}
              /*
                Mobile: px-3 py-3 (48px total h-padding per button → 4×48+gaps+pill-padding ≈ 220px, fits 375px)
                Desktop: px-8 py-4 — identical to the original, no visual change
              */
              className={`relative flex items-center gap-2 md:gap-3 px-3 md:px-8 py-3 md:py-4 rounded-full transition-all duration-500 group ${
                isActive ? "bg-primary text-black" : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-bg"
                  className="absolute inset-0 bg-primary rounded-full -z-10"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                />
              )}

              {/* Icon: 16px on mobile, 20px on desktop (md:). Original was flat w-5 h-5 for all. */}
              <item.icon
                className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-500 flex-shrink-0 ${
                  isActive ? "scale-110" : "group-hover:scale-110"
                }`}
                strokeWidth={isActive ? 2.5 : 1.5}
              />

              {/*
                Active label: max-w-[56px] on mobile (tight clamp), md:max-w-[100px] on desktop (original).
                Inactive: max-w-0 / opacity-0 — same as original.
              */}
              <span
                className={`text-xs font-bold tracking-wider transition-opacity duration-500 overflow-hidden ${
                  isActive
                    ? "max-w-[56px] md:max-w-[100px] opacity-100"
                    : "max-w-0 opacity-0"
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNav;
