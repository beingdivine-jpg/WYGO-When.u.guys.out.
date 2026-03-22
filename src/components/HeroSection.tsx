import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import { Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16">
      {/* Background with depth */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08),transparent_75%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-background" />
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover opacity-[0.15] mix-blend-luminosity grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
      </div>

      {/* Floating accent elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-primary/10 blur-[130px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-secondary/10 blur-[130px] animate-glow-pulse" style={{ animationDelay: "2.5s" }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-start md:items-center text-left md:text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 mb-12"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span className="text-label text-secondary opacity-100">
              Golden Windows are live
            </span>
          </motion.div>

          <h1 className="text-display-lg mb-10">
            <span className="block text-foreground mb-1">When are</span>
            <span className="block text-primary italic pr-4">you guys</span>
            <span className="block text-foreground">out?</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-premium text-xl md:text-3xl text-muted-foreground max-w-2xl md:mx-auto mb-16"
          >
            Stop the endless group chat loops. <span className="text-foreground font-bold italic">WYGO</span> finds the perfect escape windows for your squad.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-wrap items-center md:justify-center gap-6"
          >
            <button className="group relative px-12 py-5 rounded-2xl bg-primary font-display font-black text-primary-foreground text-sm shadow-[0_20px_40px_-10px_rgba(244,86,149,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(244,86,149,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 overflow-hidden">
              <span className="relative z-10">Launch Discover</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            </button>
            <button className="px-12 py-5 rounded-2xl bg-card/40 border border-white/5 font-display font-black text-foreground text-sm hover:bg-card/60 hover:border-white/10 transition-all duration-500">
              Meet the Squad
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Social Sync Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="relative z-10 mt-20 flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity cursor-default"
      >
        <div className="flex -space-x-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-12 h-12 rounded-2xl border-2 border-background bg-card flex items-center justify-center text-[10px] font-black font-display shadow-xl">
              {String.fromCharCode(64 + i)}
            </div>
          ))}
        </div>
        <span className="text-label text-white/40 font-bold tracking-widest">
          Luxembourg Crew Connected
        </span>
      </motion.div>
    </section>
  );
};

export default HeroSection;
