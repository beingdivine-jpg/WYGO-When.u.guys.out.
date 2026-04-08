import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { isInAppBrowser } from "@/lib/utils";
import { AlertCircle, ExternalLink } from "lucide-react";

const Login = () => {
    const { 
        signInWithGoogle, 
        signInWithEmail, 
        signUpWithEmail, 
        resetPassword,
        authError 
    } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [showInAppWarning, setShowInAppWarning] = useState(false);

    useEffect(() => {
        if (isInAppBrowser()) {
            setShowInAppWarning(true);
        }
    }, []);

    const handleGoogleLogin = async () => {
        try {
            setErrorMsg("");
            setIsLoading(true);
            await signInWithGoogle();
        } catch (error: any) {
            console.error("Failed to sign in with Google", error);
            setErrorMsg(error.message || "Failed to connect with Google. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!email || !password) {
            setErrorMsg("Please fill in all required fields.");
            return;
        }

        if (password.length < 6) {
            setErrorMsg("Password must be at least 6 characters.");
            return;
        }

        if (authMode === "signup" && password !== confirmPassword) {
            setErrorMsg("Passwords do not match.");
            return;
        }

        try {
            setIsLoading(true);
            if (authMode === "signup") {
                await signUpWithEmail(email, password);
            } else {
                await signInWithEmail(email, password);
            }
        } catch (error: any) {
            console.error(`Failed to ${authMode}`, error);
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                setErrorMsg("Invalid email or password.");
            } else if (error.code === 'auth/email-already-in-use') {
                setErrorMsg("An account with this email already exists.");
            } else if (error.code === 'auth/invalid-email') {
                setErrorMsg("Please enter a valid email address.");
            } else {
                setErrorMsg(error.message || "An unexpected error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setAuthMode(prev => prev === "login" ? "signup" : "login");
        setErrorMsg("");
        setSuccessMsg("");
        setPassword("");
        setConfirmPassword("");
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setErrorMsg("Please enter your email address first to reset your password.");
            return;
        }
        try {
            setIsLoading(true);
            await resetPassword(email);
            setSuccessMsg("Check your inbox. A password reset link has been sent.");
            setErrorMsg("");
        } catch (error: any) {
            setErrorMsg(error.message || "Failed to send reset email.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] flex flex-col bg-background relative overflow-hidden text-foreground selection:bg-primary/20">

            <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-8 md:p-24 relative z-10 max-w-lg mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full space-y-6 md:space-y-10 text-center"
                >
                    <div className="space-y-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block px-4 py-1.5 rounded-full editorial-card mb-6 shadow-sm"
                        >
                            <span className="text-social-label text-[10px] tracking-widest text-muted-foreground">WYGO — when you guys out?</span>
                        </motion.div>
                        <h1 className="text-4xl md:text-7xl font-display leading-tight text-foreground">
                            {authMode === "signup" ? (
                                <>Join the <br/><span className="text-primary font-medium">movement.</span></>
                            ) : (
                                <>Welcome <br/><span className="text-primary font-medium">back.</span></>
                            )}
                        </h1>
                        <p className="text-base text-muted-foreground max-w-xs mx-auto font-body leading-relaxed pt-2">
                            {authMode === "signup" 
                                ? "Create an account to stop the group-chat chaos."
                                : "Log in to see when your friends are free next."}
                        </p>
                    </div>

                    <div className="w-full space-y-6 pt-4">
                        
                        <AnimatePresence>
                            {(showInAppWarning || authError) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`${authError ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'} border rounded-2xl p-4 text-left space-y-3`}
                                >
                                    <div className={`flex items-center gap-2 ${authError ? 'text-red-400' : 'text-amber-500'}`}>
                                        <AlertCircle className="w-5 h-5" />
                                        <span className="text-sm font-bold tracking-tight uppercase">
                                            {authError ? 'Connection Error' : 'In-App Browser Detected'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {authError || (
                                            <>
                                                Gmail and other apps block Google Sign-In. For the best experience, please tap 
                                                <span className="text-foreground font-medium"> ... </span> or 
                                                <span className="text-foreground font-medium"> Share </span> then 
                                                <span className="text-foreground font-medium"> 'Open in Browser'</span>.
                                            </>
                                        )}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        {/* Email/Password Form */}
                        <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
                            <div className="space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full editorial-card rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all shadow-sm"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full editorial-card rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all shadow-sm"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <AnimatePresence>
                                    {authMode === "signup" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="relative pt-2"
                                        >
                                            <div className="absolute inset-y-0 left-0 top-2 pl-4 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <input
                                                type="password"
                                                placeholder="Confirm Password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full editorial-card rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all shadow-sm"
                                                required={authMode === "signup"}
                                                minLength={6}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            
                            {authMode === "login" && (
                                <div className="flex justify-end w-full px-2 pt-1">
                                    <button 
                                        type="button" 
                                        onClick={handleForgotPassword}
                                        className="text-[11px] font-bold tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}
                            
                            <AnimatePresence>
                                {errorMsg && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-red-400 text-sm font-medium px-2 py-1"
                                    >
                                        {errorMsg}
                                    </motion.div>
                                )}
                                {successMsg && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-green-400 text-sm font-medium px-2 py-1"
                                    >
                                        {successMsg}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="button-premium w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4 py-4"
                            >
                                <span>{isLoading ? "Processing..." : authMode === "login" ? "Log In" : "Create Account"}</span>
                                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4 py-2">
                            <div className="h-px bg-border flex-1" />
                            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Or continue with</span>
                            <div className="h-px bg-border flex-1" />
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full relative group flex items-center justify-center gap-3 bg-white hover:editorial-card rounded-2xl py-4 text-foreground shadow-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Google</span>
                        </button>
                        
                        <div className="pt-6 border-t border-border">
                            <button 
                                onClick={toggleMode}
                                type="button"
                                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                            >
                                {authMode === "login" 
                                    ? "Don't have an account? Sign up" 
                                    : "Already have an account? Log in"}
                            </button>
                        </div>

                    </div>
                </motion.div>
            </div>

            {/* Subtle Footer Decor */}
            <div className="absolute bottom-12 left-12 items-center gap-4 hidden md:flex">
                <div className="w-12 h-px bg-border" />
                <span className="text-[10px] font-bold text-muted-foreground tracking-widest">Moments First</span>
            </div>
        </div>
    );
};

export default Login;
