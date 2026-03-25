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
      className="fixed bottom-6 md:bottom-12 inset-x-0 z-50 pointer-events-none px-4 flex justify-center"
    >
      {/*
        overflow-hidden on the pill prevents any child from spilling out.
        No shrink-0 on buttons — they are allowed to compress.
        Each button only grows as wide as its content needs (px-2 mobile / px-4 sm / px-8 md).
      */}
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-1.5 md:p-2 rounded-full pointer-events-auto flex items-stretch gap-0.5 md:gap-2 shadow-[0_20px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/5 overflow-hidden">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              data-tab={item.id}
              onClick={() => onNavigate(item.id)}
              aria-label={item.label}
              className={`relative flex items-center gap-1.5 md:gap-3 px-2 sm:px-4 md:px-8 py-3 md:py-4 rounded-full transition-all duration-500 group min-w-0 ${
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

              <item.icon
                className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-500 flex-shrink-0 ${
                  isActive ? "scale-110" : "group-hover:scale-110"
                }`}
                strokeWidth={isActive ? 2.5 : 1.5}
              />

              {/* Label only visible on active tab; max-w clamp keeps it from blowing out the pill */}
              <span
                className={`text-[11px] font-bold tracking-wide whitespace-nowrap transition-all duration-500 overflow-hidden ${
                  isActive
                    ? "max-w-[60px] sm:max-w-[80px] md:max-w-[100px] opacity-100"
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
