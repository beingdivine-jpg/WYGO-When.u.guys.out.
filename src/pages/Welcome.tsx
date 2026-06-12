import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { ArrowRight, Calendar, Users, Zap, MapPin, Clock } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const FEATURES = [
  {
    icon: Users,
    title: "Drop your crew in",
    description: "Create a squad. Invite your people. Everyone adds their free weekends.",
    accent: "from-emerald-400/20 to-teal-400/20",
  },
  {
    icon: Zap,
    title: "We find the overlap",
    description: "WYGO scans everyone's availability and surfaces the golden windows — the weekends everyone is free.",
    accent: "from-amber-400/20 to-orange-400/20",
  },
  {
    icon: MapPin,
    title: "Escape together",
    description: "No more \"when are you free?\" loops. Just pick a window and go.",
    accent: "from-violet-400/20 to-indigo-400/20",
  },
];

const Welcome = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  return (
    <div ref={containerRef} className="bg-background text-foreground relative">
      {/* ─── Sticky Header ──────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 md:py-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <span className="font-display font-black text-primary-foreground text-xs leading-none tracking-tighter">W</span>
          </div>
          <span className="font-display font-bold text-lg tracking-tight">WYGO</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="text-xs font-bold tracking-widest text-muted-foreground hover:text-foreground transition-colors uppercase px-4 py-2.5 rounded-full hover:bg-secondary"
          >
            Log in
          </button>
          <button
            onClick={() => navigate("/login?mode=signup")}
            className="text-xs font-bold tracking-widest text-primary-foreground bg-primary hover:bg-primary/90 transition-all uppercase px-5 py-2.5 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
          >
            Sign up
          </button>
        </div>
      </motion.header>

      {/* ─── Hero Section ───────────────────────────────────────────────── */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden px-6"
      >
        {/* Background layers */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background" />
          <img
            src={heroBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-[0.08] mix-blend-luminosity grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background" />
        </div>

        {/* Ambient glows */}
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full bg-primary/[0.07] blur-[150px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full bg-amber-500/[0.05] blur-[130px] animate-glow-pulse" style={{ animationDelay: "2s" }} />

        {/* Content */}
        <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-secondary border border-border mb-10"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              When you guys out?
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-8xl font-display font-medium leading-[0.95] tracking-tight mb-8"
          >
            Stop asking.
            <br />
            <span className="text-primary">Start escaping.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto font-body leading-relaxed mb-12"
          >
            WYGO finds the weekends when your whole crew is free — 
            so you can skip the group chat chaos and just <span className="text-foreground font-bold italic">WYGO</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <button
              onClick={() => navigate("/login?mode=signup")}
              className="group relative px-10 py-4 rounded-2xl bg-primary font-display font-medium text-sm text-primary-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 min-w-[200px]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="relative px-10 py-4 rounded-2xl bg-white font-display font-medium text-sm text-foreground border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center min-w-[200px]"
            >
              How It Works
            </button>
          </motion.div>
        </div>

      </motion.section>

      {/* ─── How It Works ───────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative py-24 md:py-40 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-secondary border border-border mb-6">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Three steps. That's it.
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-medium tracking-tight">
              From <span className="text-muted-foreground">"when are you free?"</span>
              <br />
              to <span className="text-primary">"see you Saturday."</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.7 }}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="group relative"
              >
                <div className={`relative editorial-card rounded-3xl p-8 md:p-10 transition-all duration-500 ${
                  hoveredFeature === i ? "shadow-lg -translate-y-1" : ""
                }`}>
                  {/* Step number */}
                  <div className="absolute top-6 right-6 md:top-8 md:right-8 text-[10px] font-bold tracking-widest text-muted-foreground/40 uppercase">
                    0{i + 1}
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.accent} flex items-center justify-center mb-8 transition-transform duration-500 ${
                    hoveredFeature === i ? "scale-110" : ""
                  }`}>
                    <feature.icon className="w-6 h-6 text-foreground/70" strokeWidth={1.5} />
                  </div>

                  <h3 className="text-xl font-display font-medium mb-3 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Social Proof / Pitch Strip ─────────────────────────────────── */}
      <section className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Floating avatars */}
            <div className="flex justify-center -space-x-3 mb-8">
              {["A", "M", "J", "S", "D", "K"].map((letter, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, type: "spring", stiffness: 200 }}
                  className="w-11 h-11 rounded-xl bg-secondary border-2 border-background flex items-center justify-center text-xs font-display font-bold text-foreground/60 shadow-md"
                >
                  {letter}
                </motion.div>
              ))}
            </div>

            <blockquote className="text-2xl md:text-4xl font-display font-medium leading-snug tracking-tight max-w-2xl mx-auto">
              "We used to spend <span className="text-muted-foreground line-through decoration-primary/40 decoration-2">three weeks</span> planning a weekend trip.
              <br />
              Now it takes <span className="text-primary">three minutes</span>."
            </blockquote>

            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-border" />
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Every friend group, everywhere
              </span>
              <div className="h-px w-8 bg-border" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Final CTA ──────────────────────────────────────────────────── */}
      <section className="relative py-24 md:py-40 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-6xl font-display font-medium tracking-tight">
              Your crew is waiting.
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto font-body leading-relaxed">
              Set up takes 30 seconds. No credit card. No BS.
              <br />
              Just real plans with real people.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => navigate("/login?mode=signup")}
                className="group button-premium px-12 py-5 text-base flex items-center gap-3"
              >
                <span>Create your crew</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Already have an account? <span className="underline underline-offset-4 decoration-primary/40">Log in</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-display font-black text-primary-foreground text-[9px] leading-none tracking-tighter">W</span>
            </div>
            <span className="font-display font-bold text-sm tracking-tight">WYGO</span>
          </div>
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            Moments First
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
