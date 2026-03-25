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
      /*
        ROOT CAUSE FIX NOTE:
        This component is now rendered OUTSIDE the page's `motion.div` wrapper in Index.tsx.
        Previously it was a child of `motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}`.
        Framer Motion applies a CSS `transform` on animated elements for GPU compositing.
        Any parent with a CSS `transform` becomes the "containing block" for `position: fixed`
        descendants (CSS spec, Section 9.3). This caused the BottomNav to be positioned relative
        to the parent box width (which could be narrower/offset on mobile) rather than the viewport.
        Now that it is a sibling of that motion.div, `position: fixed` correctly anchors to the
        true viewport on all screen sizes.

        CENTERING STRATEGY:
        `inset-x-0` = left:0; right:0, which constrains the nav box to viewport width.
        `flex justify-center` centers the inner pill horizontally.
        The inner pill uses `w-max` so it only takes natural content width,
        and `style={{ maxWidth: 'calc(100vw - 24px)' }}` as the hard cap that prevents
        the pill from ever being wider than the viewport minus 24px total margin.
      */
      className="fixed bottom-6 md:bottom-12 inset-x-0 z-[100] pointer-events-none flex justify-center"
    >
      <div
        className="bg-white/5 backdrop-blur-2xl border border-white/10 p-1.5 md:p-2 rounded-full pointer-events-auto flex items-stretch gap-1 md:gap-2 shadow-[0_20px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/5 w-max overflow-hidden"
        style={{ maxWidth: "calc(100vw - 24px)" }}
      >
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              data-tab={item.id}
              onClick={() => onNavigate(item.id)}
              aria-label={item.label}
              className={`relative flex items-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-4 rounded-full transition-all duration-500 group ${
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

              <span
                className={`text-xs font-bold tracking-wider transition-opacity duration-500 overflow-hidden whitespace-nowrap ${
                  isActive
                    ? "max-w-[80px] md:max-w-[100px] opacity-100"
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
