import { motion } from "framer-motion";
import { Zap, Users, CalendarDays, User } from "lucide-react";
import { useState } from "react";

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
      className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4"
    >
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-2 rounded-full pointer-events-auto flex items-stretch gap-2 shadow-[0_20px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
        {navItems.map((item, i) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex items-center gap-3 px-8 py-4 rounded-full transition-all duration-500 group ${isActive ? "bg-primary text-black" : "text-white/40 hover:text-white hover:bg-white/5"}`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-bg"
                  className="absolute inset-0 bg-primary rounded-full -z-10"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                />
              )}

              <item.icon className={`w-5 h-5 transition-transform duration-500 ${isActive ? "scale-110" : "group-hover:scale-110"}`} strokeWidth={isActive ? 2.5 : 1.5} />

              <span className={`text-xs font-bold tracking-wider transition-opacity duration-500 overflow-hidden ${isActive ? "max-w-[100px] opacity-100" : "max-w-0 opacity-0"}`}>
                {item.label}
              </span>

              {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNav;
