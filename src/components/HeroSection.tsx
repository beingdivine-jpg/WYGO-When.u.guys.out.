import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import { Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-accent/10 blur-[100px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-xs font-body font-semibold text-accent uppercase tracking-wider">
              Golden Windows are live
            </span>
          </motion.div>

          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-extrabold leading-[0.9] mb-6">
            <span className="text-foreground">When are</span>
            <br />
            <span className="text-gradient-primary">you guys</span>
            <br />
            <span className="text-foreground">out?</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground font-body max-w-lg mx-auto mb-10 leading-relaxed"
          >
            WYGO finds the golden window for your crew.
            <br className="hidden sm:block" />
            Weekends, holidays, leave days — all synced.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button className="px-8 py-4 rounded-xl gradient-primary font-display font-bold text-primary-foreground text-sm tracking-wide glow-primary hover:scale-105 transition-transform duration-300">
              Find Your Window
            </button>
            <button className="px-8 py-4 rounded-xl glass font-display font-bold text-foreground text-sm tracking-wide hover:border-primary/40 transition-all duration-300">
              See How It Works
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
