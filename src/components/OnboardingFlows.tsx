import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Users, ArrowRight, ChevronLeft, ChevronDown, Globe, Calendar, X } from "lucide-react";
import { toast } from "sonner";

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
            toast.success(type === "create" ? "Squad created!" : "Joined the squad!");
        } catch (error: any) {
            console.error("Operation failed", error);
            if (error.message === "SQUAD_NOT_FOUND") {
                toast.error("Squad not found. Check your code!");
            } else if (error.message === "ALREADY_MEMBER") {
                toast.error("You're already in this squad!");
            } else {
                toast.error("Something went wrong. Try again later.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[100dvh] flex flex-col bg-background text-foreground relative overflow-hidden selection:bg-primary/20">

            <div className="flex-1 flex flex-col relative z-10 max-w-5xl mx-auto w-full px-6 py-8 md:px-24 md:py-24 justify-center">
                {/* Header / Nav */}
                <div className="flex justify-between items-center mb-8 md:mb-16">
                    <button
                        onClick={prevStep}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all group px-4 py-2 bg-secondary rounded-full"
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
                                    className={`h-1 rounded-full transition-all duration-700 ${s === step ? "w-12 bg-primary" : "w-4 bg-border"}`}
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
                                className="space-y-12 md:space-y-24"
                            >
                                {step === 1 && (
                                    <div className="space-y-10 md:space-y-16">
                                        <div className="space-y-4">
                                            <span className="text-social-label">Step 01 / Group Identity</span>
                                            <h2 className="text-4xl md:text-7xl font-display font-medium leading-tight">
                                                What shall we call <br />
                                                <span className="text-primary">your crew?</span>
                                            </h2>
                                        </div>

                                        <div className="relative group max-w-2xl">
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="The Weekend Legends..."
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-transparent border-b-2 border-border py-4 md:py-8 text-3xl md:text-6xl font-display font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all tracking-tight"
                                            />
                                            <div className="mt-4 text-[10px] font-medium text-muted-foreground tracking-wider uppercase">
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
                                    <div className="space-y-10 md:space-y-16">
                                        <div className="space-y-4">
                                            <span className="text-social-label">Step 02 / Planning Horizon</span>
                                            <h2 className="text-4xl md:text-7xl font-display font-medium leading-tight">
                                                How far ahead are <br />
                                                <span className="text-primary">we looking?</span>
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
                                                    className={`p-6 md:p-10 rounded-[2rem] text-left transition-all duration-500 border ${formData.duration === m.val ? "bg-primary border-primary text-white shadow-md scale-[1.02]" : "editorial-card hover:border-primary/40 text-muted-foreground shadow-sm"}`}
                                                >
                                                    <div className={`text-xl md:text-2xl font-display font-bold mb-1 ${formData.duration === m.val ? "text-white" : "text-foreground"}`}>
                                                        {m.label}
                                                    </div>
                                                    <div className={`text-[10px] md:text-xs font-medium ${formData.duration === m.val ? "text-white/80" : "text-muted-foreground"}`}>
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
                                    <div className="space-y-10 md:space-y-16">
                                        <div className="space-y-4">
                                            <span className="text-social-label">Step 03 / Home Base</span>
                                            <h2 className="text-4xl md:text-7xl font-display font-medium leading-tight">
                                                Where is the squad <br />
                                                <span className="text-primary">mostly based?</span>
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                { val: "Luxembourg", emoji: "🇱🇺" },
                                                { val: "France", emoji: "🇫🇷" },
                                                { val: "Germany", emoji: "🇩🇪" },
                                                { val: "Belgium", emoji: "🇧🇪" },
                                                { val: "Europe", emoji: "🌍" },
                                            ].map((c) => (
                                                <button
                                                    key={c.val}
                                                    onClick={() => setFormData({ ...formData, country: c.val })}
                                                    className={`p-6 md:p-8 rounded-[2rem] text-left transition-all duration-500 border flex items-center gap-4 ${
                                                        formData.country === c.val
                                                            ? "bg-primary border-primary text-white shadow-md scale-[1.02]"
                                                            : "editorial-card hover:border-primary/40 text-muted-foreground shadow-sm"
                                                    }`}
                                                >
                                                    <span className="text-2xl">{c.emoji}</span>
                                                    <div className={`text-lg md:text-xl font-display font-bold ${formData.country === c.val ? "text-white" : "text-foreground"}`}>{c.val}</div>
                                                </button>
                                            ))}
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
                                    <h2 className="text-4xl md:text-7xl font-display font-medium leading-tight">
                                        Enter your <br />
                                        <span className="text-primary">secret code.</span>
                                    </h2>
                                </div>

                                <div className="relative group max-w-2xl">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="e.g. WYGO-7721"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full bg-transparent border-b-2 border-border py-4 md:py-8 text-3xl md:text-6xl font-display font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all tracking-tight uppercase"
                                    />
                                    <div className="mt-4 text-[10px] font-medium text-muted-foreground tracking-wider uppercase">
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
