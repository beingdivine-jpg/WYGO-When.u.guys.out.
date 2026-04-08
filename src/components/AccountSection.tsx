import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { 
  User, 
  Settings, 
  Lock, 
  LogOut, 
  ChevronRight, 
  ArrowLeft,
  Camera,
  Globe,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Trash2,
  MessageSquare
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type AccountView = "home" | "edit" | "security";

const AccountSection = () => {
  const { user, userProfile, updateProfile, changePassword, signOut, deleteAccount } = useAuth();
  const [view, setView] = useState<AccountView>("home");
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Form states
  const [editData, setEditData] = useState({
    displayName: userProfile?.displayName || "",
    username: userProfile?.username || "",
    homeCountry: userProfile?.homeCountry || "",
  });

  const [pwData, setPwData] = useState({
    old: "",
    new: "",
    confirm: ""
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setFeedback(null);
    try {
      await updateProfile(editData);
      setFeedback({ type: "success", msg: "Profile updated! Looking good, squad member." });
      setTimeout(() => setView("home"), 1500);
    } catch (error: any) {
      setFeedback({ type: "error", msg: "Oops! Couldn't update your profile. Try again?" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwData.new !== pwData.confirm) {
        setFeedback({ type: "error", msg: "New passwords do not match." });
        return;
    }
    setIsUpdating(true);
    setFeedback(null);
    try {
      await changePassword(pwData.old, pwData.new);
      setFeedback({ type: "success", msg: "Password updated! Your account is secure." });
      setPwData({ old: "", new: "", confirm: "" });
      setTimeout(() => setView("home"), 1500);
    } catch (error: any) {
      setFeedback({ type: "error", msg: "Hmm, that old password doesn't look right. Try again?" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsUpdating(true);
    setFeedback(null);
    try {
      await deleteAccount();
    } catch (error: any) {
      setFeedback({ type: "error", msg: error.message || "Failed to delete account. You may need to sign in again first." });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section className="py-8 md:py-48 px-4 md:px-8 bg-background text-foreground relative overflow-hidden selection:bg-primary/20">

      <div className="max-w-4xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {view === "home" && (
            <motion.div
              key="profile-home"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-12 pb-28 md:pb-0"
            >
              {/* Profile Card */}
              <div className="p-6 md:p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] editorial-card relative overflow-hidden group shadow-sm">
                 <div className="flex flex-col md:flex-row gap-6 md:p-8 md:gap-6 md:p-12 items-center text-center md:text-left relative z-10">
                   <div className="relative group/avatar">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] bg-white flex items-center justify-center text-4xl md:text-5xl shadow-sm relative overflow-hidden ring-4 ring-border transition-transform group-hover/avatar:scale-105 duration-700 text-foreground">
                        {userProfile?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || <User className="w-12 h-12" />}
                      </div>
                      <button className="absolute -bottom-1 -right-1 p-2.5 rounded-xl bg-primary text-white shadow-sm opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 hover:scale-110">
                         <Camera className="w-4 h-4" />
                      </button>
                   </div>

                   <div className="space-y-4 flex-1">
                      <div className="space-y-1">
                        <h2 className="text-3xl md:text-5xl font-display font-medium text-foreground">{userProfile?.displayName || "Friend"}</h2>
                        <p className="text-primary font-medium">@{userProfile?.username || "squad_member"}</p>
                      </div>
                      <div className="flex flex-wrap gap-4 pt-2 justify-center md:justify-start">
                         <div className="flex items-center gap-2 px-4 py-1.5 rounded-full editorial-card text-[10px] font-bold tracking-widest text-muted-foreground shadow-sm">
                            <Mail className="w-3 h-3" /> {user?.email}
                         </div>
                         <div className="flex items-center gap-2 px-4 py-1.5 rounded-full editorial-card text-[10px] font-bold tracking-widest text-muted-foreground shadow-sm">
                            <Globe className="w-3 h-3" /> {userProfile?.homeCountry || "Global"}
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Settings Menu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                   { label: "Profile Details", sub: "Name, username, country", icon: User, target: "edit" as AccountView },
                   { label: "Security", sub: "Change your password", icon: Lock, target: "security" as AccountView },
                 ].map((item) => (
                   <button
                     key={item.label}
                     onClick={() => setView(item.target)}
                     className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] editorial-card hover:border-primary/40 hover:shadow-sm text-left transition-all group flex items-center justify-between"
                   >
                     <div className="flex items-center gap-6">
                        <div className="p-4 rounded-2xl editorial-card group-hover:bg-primary/10 group-hover:text-primary transition-colors shadow-sm">
                           <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                           <div className="font-display font-medium text-base md:text-lg text-foreground group-hover:text-primary transition-colors">{item.label}</div>
                           <div className="text-[10px] md:text-xs text-muted-foreground">{item.sub}</div>
                        </div>
                     </div>
                     <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                   </button>
                 ))}
                 
                 <button
                    onClick={signOut}
                    className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] editorial-card hover:border-border/80 hover:shadow-sm text-left transition-all group flex items-center justify-between"
                 >
                    <div className="flex items-center gap-6">
                       <div className="p-4 rounded-2xl editorial-card group-hover:bg-secondary group-hover:text-foreground transition-colors shadow-sm">
                          <LogOut className="w-6 h-6" />
                       </div>
                       <div>
                          <div className="font-display font-medium text-base md:text-lg text-foreground group-hover:text-foreground transition-colors">Sign Out</div>
                          <div className="text-[10px] md:text-xs text-muted-foreground">Securely exit your account</div>
                       </div>
                     </div>
                </button>

                 <button
                    onClick={() => window.open('mailto:divinjoseph@gmail.com?subject=WYGO Beta Feedback', '_blank')}
                    className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-primary/5 border border-primary/20 hover:border-primary/40 text-left transition-all group flex items-center justify-between hover:shadow-sm"
                 >
                    <div className="flex items-center gap-6">
                       <div className="p-4 rounded-2xl editorial-card group-hover:bg-primary/10 group-hover:text-primary transition-colors shadow-sm">
                          <MessageSquare className="w-6 h-6" />
                       </div>
                       <div>
                          <div className="font-display font-medium text-base md:text-lg text-foreground group-hover:text-primary transition-colors">Share Feedback</div>
                          <div className="text-[10px] md:text-xs text-muted-foreground">Help us make WYGO better</div>
                       </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-red-500/5 border border-red-500/10 hover:border-red-500/40 hover:shadow-sm text-left transition-all group flex items-center justify-between">
                      <div className="flex items-center gap-6">
                         <div className="p-4 rounded-2xl editorial-card group-hover:bg-red-500/10 group-hover:text-red-500 transition-colors shadow-sm">
                            <Trash2 className="w-6 h-6" />
                         </div>
                         <div>
                            <div className="font-display font-medium text-base md:text-lg text-foreground group-hover:text-red-500 transition-colors">Delete Account</div>
                            <div className="text-[10px] md:text-xs text-muted-foreground">Permanently remove your data</div>
                         </div>
                      </div>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-background border-border text-foreground shadow-sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        This action cannot be undone. This will permanently delete your account and remove your 
                        profile from all squads.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-secondary border-border text-foreground hover:bg-secondary/70">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600 text-white font-bold">Delete Account</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>
          )}

          {view === "edit" && (
            <motion.div
              key="edit-profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12 pb-28 md:pb-0"
            >
              <button 
                onClick={() => setView("home")}
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group mb-8"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-semibold tracking-wide">Back to Profile</span>
              </button>

              <div className="space-y-16">
                 <div>
                    <h2 className="text-3xl md:text-5xl font-display font-medium">Edit <span className="text-primary">Profile.</span></h2>
                    <p className="text-muted-foreground mt-2 text-sm md:text-base">Personalize how the squad sees you.</p>
                 </div>

                 <form onSubmit={handleUpdateProfile} className="space-y-8 max-w-xl">
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase ml-2">Display Name</label>
                          <input 
                            type="text" 
                            value={editData.displayName}
                            onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                            className="w-full editorial-card rounded-2xl p-4 text-foreground focus:outline-none focus:border-primary/50 transition-all shadow-sm"
                            placeholder="John Doe"
                            required
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase ml-2">Username</label>
                          <div className="relative">
                             <span className="absolute left-4 top-4 text-primary font-medium">@</span>
                             <input 
                               type="text" 
                               value={editData.username}
                               onChange={(e) => setEditData({...editData, username: e.target.value})}
                               className="w-full editorial-card rounded-2xl py-4 pl-8 pr-4 text-foreground focus:outline-none focus:border-primary/50 transition-all font-medium shadow-sm"
                               placeholder="johnny"
                               required
                             />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase ml-2">Home Country</label>
                          <select 
                            value={editData.homeCountry}
                            onChange={(e) => setEditData({...editData, homeCountry: e.target.value})}
                            className="w-full editorial-card rounded-2xl p-4 text-foreground focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer shadow-sm"
                          >
                             {["Luxembourg", "France", "Germany", "Belgium", "United Kingdom", "United States"].map(c => (
                               <option key={c} value={c} className="bg-background text-foreground">{c}</option>
                             ))}
                          </select>
                       </div>
                    </div>

                    {feedback && (
                       <div className={`p-4 rounded-xl flex items-center gap-3 ${feedback.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 editorial-card ring-red-500/10 shadow-red-500/5'}`}>
                          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                          <span className="text-sm font-medium">{feedback.msg}</span>
                       </div>
                    )}

                    <button 
                       disabled={isUpdating}
                       className="button-premium w-full flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                       {isUpdating ? "Saving..." : "Save Changes"}
                    </button>
                 </form>
              </div>
            </motion.div>
          )}

          {view === "security" && (
            <motion.div
              key="security-settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 md:space-y-12 pb-32 md:pb-0"
            >
              <button 
                onClick={() => setView("home")}
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group mb-8"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-semibold tracking-wide">Back to Profile</span>
              </button>

              <div className="space-y-16">
                 <div>
                    <h2 className="text-3xl md:text-5xl font-display font-medium">Security <span className="text-primary">Settings.</span></h2>
                    <p className="text-muted-foreground mt-2 text-sm md:text-base">Manage your account protection.</p>
                 </div>

                 <div className="p-6 md:p-8 rounded-3xl editorial-card space-y-4 max-w-xl shadow-sm">
                    <div className="flex items-center gap-4 text-primary">
                       <ShieldCheck className="w-6 h-6" />
                       <span className="font-display font-medium">Account Access</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed font-body">
                       Your emails and notifications are sent to <span className="text-foreground font-medium">{user?.email}</span>. 
                       {user?.providerData[0]?.providerId === 'google.com' ? "Your account is managed via Google." : "Update your password below if needed."}
                    </p>
                 </div>

                 {user?.providerData[0]?.providerId !== 'google.com' ? (
                   <form onSubmit={handleChangePassword} className="space-y-8 max-w-xl">
                      <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase ml-2">Current Password</label>
                           <input 
                             type="password" 
                             value={pwData.old}
                             onChange={(e) => setPwData({...pwData, old: e.target.value})}
                             className="w-full editorial-card rounded-2xl p-4 text-foreground focus:outline-none focus:border-primary/50 transition-all font-mono shadow-sm"
                             required
                           />
                        </div>
                        <div className="h-px bg-border" />
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase ml-2">New Password</label>
                           <input 
                             type="password" 
                             value={pwData.new}
                             onChange={(e) => setPwData({...pwData, new: e.target.value})}
                             className="w-full editorial-card rounded-2xl p-4 text-foreground focus:outline-none focus:border-primary/50 transition-all font-mono shadow-sm"
                             required
                             minLength={6}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase ml-2">Confirm New Password</label>
                           <input 
                             type="password" 
                             value={pwData.confirm}
                             onChange={(e) => setPwData({...pwData, confirm: e.target.value})}
                             className="w-full editorial-card rounded-2xl p-4 text-foreground focus:outline-none focus:border-primary/50 transition-all font-mono shadow-sm"
                             required
                           />
                        </div>
                      </div>

                      {feedback && (
                       <div className={`p-4 rounded-xl flex items-center gap-3 ${feedback.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 editorial-card ring-red-500/10 shadow-red-500/5'}`}>
                          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                          <span className="text-sm font-medium">{feedback.msg}</span>
                       </div>
                    )}

                      <button 
                        disabled={isUpdating}
                        className="button-premium w-full flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                         {isUpdating ? "Updating..." : "Update Password"}
                      </button>
                   </form>
                 ) : (
                   <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 max-w-xl border border-border rounded-3xl bg-secondary shadow-sm">
                      <div className="w-16 h-16 rounded-full editorial-card flex items-center justify-center text-muted-foreground shadow-sm">
                         <Lock className="w-8 h-8" strokeWidth={1} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-display font-medium text-foreground">Using Google Auth</h3>
                        <p className="text-sm text-muted-foreground font-body px-8">Password management is handled securely through your Google account settings.</p>
                      </div>
                   </div>
                 )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default AccountSection;
