import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const { user, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    homeCountry: "Luxembourg"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.homeCountry) return;

    setIsSubmitting(true);
    try {
      await updateProfile({
        username: formData.username.trim(),
        homeCountry: formData.homeCountry,
        onboardingCompleted: true
      });
      // Route is automatically protected so we don't strictly need to redirect,
      // but let's push to home anyway for immediate UX response
      navigate("/");
    } catch (error) {
      console.error("Failed to update profile", error);
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden selection:bg-primary/20">
      <div className="absolute inset-0 gradient-warm opacity-40" />

      <div className="flex-1 flex flex-col relative z-10 max-w-2xl mx-auto w-full p-8 md:p-24 justify-center">
        {/* Nav */}
        <div className="absolute top-12 left-8 right-8 flex justify-end">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-all group"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-widest">Sign Out</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8 md:space-y-16"
        >
          <div className="space-y-4">
            <span className="text-social-label">Welcome to WYGO</span>
            <h2 className="text-4xl md:text-7xl font-display font-medium leading-tight">
              Finish setting <br />
              <span className="text-primary italic">your profile.</span>
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
            <div className="space-y-8">
              {/* Display Name (Read-only from Google) */}
              <div className="space-y-2 relative group">
                <label className="text-social-label">Display Name</label>
                <div className="w-full bg-transparent border-b-2 border-white/5 py-4 text-xl md:text-2xl font-display font-medium text-white/50 cursor-not-allowed">
                  {user?.displayName || "Anonymous"}
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2 relative group">
                <label className="text-social-label">Username</label>
                <input
                  required
                  autoFocus
                  type="text"
                  placeholder="@handle"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-transparent border-b-2 border-white/10 py-4 text-2xl md:text-3xl font-display font-medium text-foreground placeholder:text-white/10 focus:outline-none focus:border-primary transition-all tracking-tight"
                />
              </div>

              {/* Home Country */}
              <div className="space-y-2 relative group">
                <label className="text-social-label">Home Base</label>
                <div className="relative">
                  <select
                    value={formData.homeCountry}
                    onChange={(e) => setFormData({ ...formData, homeCountry: e.target.value })}
                    className="w-full bg-transparent border-b-2 border-white/10 py-4 text-2xl md:text-3xl font-display font-medium text-foreground appearance-none focus:outline-none focus:border-primary transition-all tracking-tight cursor-pointer"
                  >
                    {["Luxembourg", "France", "Germany", "Belgium", "Europe"].map(c => (
                      <option key={c} value={c} className="bg-[#120a16] text-white py-4">{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 bottom-6 w-6 h-6 text-white/40 pointer-events-none" />
                </div>
              </div>
            </div>

            <button
              disabled={!formData.username.trim() || isSubmitting}
              type="submit"
              className="button-premium w-full flex justify-between items-center group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? "Saving..." : "Enter WYGO"}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Onboarding;
