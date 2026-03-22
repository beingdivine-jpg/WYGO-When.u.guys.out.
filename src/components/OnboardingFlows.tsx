import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Users, ArrowRight, ChevronLeft, ChevronDown, Globe, Calendar, X } from "lucide-react";

interface OnboardingFlowsProps {
    type: "create" | "join";
    onBack: () => void;
    onComplete: (data: any) => void;
}

const OnboardingFlows = ({ type, onBack, onComplete }: OnboardingFlowsProps) => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const totalSteps = type === "create" ? 3 : 1;
    const [formData, setFormData] = useState({
        name: "",
        duration: "3",
        country: "Luxembourg",
        code: "",
    });

    const nextStep = () => setStep((s) => s + 1);
    const prevStep = () => (step === 1 ? onBack() : setStep((s) => s - 1));

    const handleComplete = async () => {
        setIsSubmitting(true);
        try {
            await onComplete(formData);
        } catch (error) {
            console.error("Operation failed", error);
            alert("Something went wrong. Please check your connection or invite code.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden selection:bg-primary/20">
            {/* Atmospheric Background */}
            <div className="absolute inset-0 gradient-warm opacity-40" />

            <div className="flex-1 flex flex-col relative z-10 max-w-5xl mx-auto w-full p-8 md:p-24 justify-center">
                {/* Header / Nav */}
                <div className="absolute top-12 left-8 md:left-24 right-8 md:right-24 flex justify-between items-center">
                    <button
                        onClick={prevStep}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-all group"
                    >
                        {type === "create" && step > 1 ? (
                            <>
                                <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                                <span className="text-[10px] font-bold tracking-widest">Back</span>
                            </>
                        ) : (
                            <>
                                <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
                                <span className="text-[10px] font-bold tracking-widest">Cancel</span>
                            </>
                        )}
                    </button>

                    {/* Elegant Progress Indicator */}
                    {type === "create" && (
                        <div className="flex gap-3">
                            {[1, 2, 3].map((s) => (
                                <div
                                    key={s}
                                    className={`h-1 rounded-full transition-all duration-700 ${s === step ? "w-12 bg-primary" : "w-4 bg-white/10"}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-full">
                    <AnimatePresence mode="wait">
                        {type === "create" ? (
                            <motion.div
                                key={`create-step-${step}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="space-y-24"
                            >
                                {step === 1 && (
                                    <div className="space-y-16">
                                        <div className="space-y-4">
                                            <span className="text-social-label">Step 01 / Group Identity</span>
                                            <h2 className="text-5xl md:text-7xl font-display font-medium leading-tight">
                                                What shall we call <br />
                                                <span className="text-primary italic">your crew?</span>
                                            </h2>
                                        </div>

                                        <div className="relative group max-w-2xl">
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="The Weekend Legends..."
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-transparent border-b-2 border-white/10 py-8 text-4xl md:text-6xl font-display font-medium text-foreground placeholder:text-white/10 focus:outline-none focus:border-primary transition-all tracking-tight"
                                            />
                                            <div className="mt-4 text-[10px] font-medium text-white/20 tracking-wider">
                                                Give your squad a name that sticks.
                                            </div>
                                        </div>

                                        <button
                                            disabled={!formData.name}
                                            onClick={nextStep}
                                            className="button-premium w-full md:w-auto min-w-[280px]"
                                        >
                                            Next Step
                                        </button>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-16">
                                        <div className="space-y-4">
                                            <span className="text-social-label">Step 02 / Planning Horizon</span>
                                            <h2 className="text-5xl md:text-7xl font-display font-medium leading-tight">
                                                How far ahead are <br />
                                                <span className="text-primary italic">we looking?</span>
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {[
                                                { val: "2", label: "2 Months", desc: "Short & Sweet" },
                                                { val: "3", label: "3 Months", desc: "The Sweet Spot" },
                                                { val: "4", label: "4 Months", desc: "Long Term Vision" },
                                            ].map((m) => (
                                                <button
                                                    key={m.val}
                                                    onClick={() => setFormData({ ...formData, duration: m.val })}
                                                    className={`p-10 rounded-[2rem] text-left transition-all duration-500 border ${formData.duration === m.val ? "bg-primary border-primary text-black shadow-xl scale-[1.02]" : "bg-white/5 border-white/5 hover:border-white/10 text-white/60"}`}
                                                >
                                                    <div className="text-2xl font-display font-bold mb-1">
                                                        {m.label}
                                                    </div>
                                                    <div className={`text-xs font-medium ${formData.duration === m.val ? "text-black/60" : "text-white/30"}`}>
                                                        {m.desc}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={nextStep}
                                            className="button-premium w-full md:w-auto min-w-[280px]"
                                        >
                                            Almost there
                                        </button>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-16">
                                        <div className="space-y-4">
                                            <span className="text-social-label">Step 03 / Home Base</span>
                                            <h2 className="text-5xl md:text-7xl font-display font-medium leading-tight">
                                                Where is the squad <br />
                                                <span className="text-primary italic">mostly based?</span>
                                            </h2>
                                        </div>

                                        <div className="relative group max-w-2xl">
                                            <select
                                                value={formData.country}
                                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                className="w-full bg-transparent border-b-2 border-white/10 py-8 text-4xl md:text-6xl font-display font-medium text-foreground appearance-none focus:outline-none focus:border-primary transition-all tracking-tight cursor-pointer"
                                            >
                                                {["Luxembourg", "France", "Germany", "Belgium", "Europe"].map(c => (
                                                    <option key={c} value={c} className="bg-[#120a16] text-white py-4">{c}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-0 bottom-10 w-8 h-8 text-white/40 pointer-events-none" />
                                        </div>

                                        <button
                                            onClick={handleComplete}
                                            disabled={isSubmitting}
                                            className="button-premium w-full md:w-auto min-w-[280px] disabled:opacity-50"
                                        >
                                            {isSubmitting ? "Creating..." : "Create Crew"}
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="join-step"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="space-y-16"
                            >
                                <div className="space-y-4">
                                    <span className="text-social-label">Join a Crew</span>
                                    <h2 className="text-5xl md:text-7xl font-display font-medium leading-tight">
                                        Enter your <br />
                                        <span className="text-primary italic">secret code.</span>
                                    </h2>
                                </div>

                                <div className="relative group max-w-2xl">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="e.g. WYGO-7721"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full bg-transparent border-b-2 border-white/10 py-8 text-4xl md:text-6xl font-display font-medium text-foreground placeholder:text-white/10 focus:outline-none focus:border-primary transition-all tracking-tight"
                                    />
                                    <div className="mt-4 text-[10px] font-medium text-white/20 tracking-wider">
                                        Provided by your crew captain.
                                    </div>
                                </div>

                                <button
                                    disabled={!formData.code || isSubmitting}
                                    onClick={handleComplete}
                                    className="button-premium w-full md:w-auto min-w-[280px] disabled:opacity-50"
                                >
                                    {isSubmitting ? "Accessing..." : "Access Crew"}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default OnboardingFlows;
