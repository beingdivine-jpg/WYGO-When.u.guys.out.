import { motion } from "framer-motion";
import { Zap, Users, CalendarDays, Compass } from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: Compass, label: "Pulse", id: "pulse" },
  { icon: Zap, label: "Windows", id: "windows" },
  { icon: Users, label: "Crew", id: "crew" },
  { icon: CalendarDays, label: "Sync", id: "sync" },
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
      transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 25 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="glass-strong rounded-2xl px-2 py-2 flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-all duration-300 ${
                isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl bg-accent/10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className="w-5 h-5 relative z-10" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-body font-semibold relative z-10 tracking-wide uppercase">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNav;
