import { motion } from "framer-motion";
import { Zap, Users, ArrowRight } from "lucide-react";

interface EntryViewProps {
    onStart: () => void;
    onJoin: () => void;
}

const EntryView = ({ onStart, onJoin }: EntryViewProps) => {
    return (
        <div className="min-h-[100dvh] flex flex-col bg-background relative overflow-hidden text-foreground selection:bg-primary/20">

            <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-8 md:p-24 relative z-10 text-center max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-12"
                >
                    <div className="space-y-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block px-4 py-1.5 rounded-full editorial-card mb-8 shadow-sm"
                        >
                            <span className="text-social-label text-[10px] tracking-[0.3em] text-muted-foreground">Planning made personal</span>
                        </motion.div>
                        <h1 className="text-display-header leading-tight text-foreground">
                            Finally, time <br />
                            <span className="text-primary font-medium">with friends.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto font-body leading-relaxed">
                            Stop the group-chat chaos. Find the perfect weekends, sync your schedules, and make memories happen.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center w-full pt-8">
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            onClick={onStart}
                            className="button-premium w-full md:w-auto min-w-[240px] group"
                        >
                            <span>Start a Crew</span>
                            <ArrowRight className="ml-3 w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </motion.button>

                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            onClick={onJoin}
                            className="button-premium-outline w-full md:w-auto min-w-[200px]"
                        >
                            <span>Join Existing</span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {/* Subtle Footer Decor */}
            <div className="absolute bottom-12 left-12 flex items-center gap-4">
                <div className="w-12 h-px bg-border" />
                <span className="text-[10px] font-bold text-muted-foreground tracking-widest">Moments First</span>
            </div>
        </div>
    );
};

export default EntryView;
