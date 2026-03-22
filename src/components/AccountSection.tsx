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
  AlertCircle
} from "lucide-react";

type AccountView = "home" | "edit" | "security";

const AccountSection = () => {
  const { user, userProfile, updateProfile, changePassword, signOut } = useAuth();
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
      setFeedback({ type: "success", msg: "Profile updated successfully!" });
      setTimeout(() => setView("home"), 1500);
    } catch (error: any) {
      setFeedback({ type: "error", msg: error.message || "Failed to update profile." });
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
      setFeedback({ type: "success", msg: "Password changed successfully!" });
      setPwData({ old: "", new: "", confirm: "" });
      setTimeout(() => setView("home"), 1500);
    } catch (error: any) {
      setFeedback({ type: "error", msg: error.message || "Failed to change password. check your old password." });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section className="py-24 md:py-48 px-8 bg-background text-white relative overflow-hidden selection:bg-primary/20">
      {/* Decorative Atmospheric Glows */}
      <div className="absolute top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-primary/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[20%] -right-[10%] w-[40vw] h-[40vw] bg-purple-500/5 blur-[100px] rounded-full" />

      <div className="max-w-4xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {view === "home" && (
            <motion.div
              key="profile-home"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-12"
            >
              {/* Profile Card */}
              <div className="p-12 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
                
                <div className="flex flex-col md:flex-row gap-12 items-center text-center md:text-left relative z-10">
                   <div className="relative group/avatar">
                      <div className="w-32 h-32 rounded-[2.5rem] bg-white/10 flex items-center justify-center text-5xl shadow-2xl relative overflow-hidden ring-4 ring-white/5 transition-transform group-hover/avatar:scale-105 duration-700">
                        {userProfile?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || <User className="w-12 h-12" />}
                      </div>
                      <button className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-primary text-black shadow-lg opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 hover:scale-110">
                         <Camera className="w-4 h-4" />
                      </button>
                   </div>

                   <div className="space-y-4 flex-1">
                      <div className="space-y-1">
                        <h2 className="text-5xl font-display font-medium">{userProfile?.displayName || "Friend"}</h2>
                        <p className="text-primary italic font-medium">@{userProfile?.username || "squad_member"}</p>
                      </div>
                      <div className="flex flex-wrap gap-4 pt-2 justify-center md:justify-start">
                         <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-widest text-white/40">
                            <Mail className="w-3 h-3" /> {user?.email}
                         </div>
                         <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-widest text-white/40">
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
                     className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-primary/40 text-left transition-all group flex items-center justify-between"
                   >
                     <div className="flex items-center gap-6">
                        <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                           <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                           <div className="font-display font-medium text-lg text-white group-hover:text-primary transition-colors">{item.label}</div>
                           <div className="text-xs text-white/30">{item.sub}</div>
                        </div>
                     </div>
                     <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                   </button>
                 ))}
                 
                 <button
                    onClick={signOut}
                    className="p-8 rounded-[2rem] bg-red-500/5 border border-red-500/10 hover:border-red-500/40 text-left transition-all group flex items-center justify-between md:col-span-2"
                 >
                    <div className="flex items-center gap-6">
                       <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-red-500/20 group-hover:text-red-500 transition-colors">
                          <LogOut className="w-6 h-6" />
                       </div>
                       <div>
                          <div className="font-display font-medium text-lg text-white group-hover:text-red-500 transition-colors">Sign Out</div>
                          <div className="text-xs text-white/30">Securely exit your account</div>
                       </div>
                    </div>
                </button>
              </div>
            </motion.div>
          )}

          {view === "edit" && (
            <motion.div
              key="edit-profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <button 
                onClick={() => setView("home")}
                className="flex items-center gap-3 text-white/40 hover:text-white transition-colors group mb-8"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-bold tracking-widest uppercase">Back to Profile</span>
              </button>

              <div className="space-y-16">
                 <div>
                    <h2 className="text-5xl font-display font-medium">Edit <span className="text-primary italic">Profile.</span></h2>
                    <p className="text-white/40 mt-2">Personalize how the squad sees you.</p>
                 </div>

                 <form onSubmit={handleUpdateProfile} className="space-y-8 max-w-xl">
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold tracking-widest text-white/20 uppercase ml-2">Display Name</label>
                          <input 
                            type="text" 
                            value={editData.displayName}
                            onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                            placeholder="John Doe"
                            required
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold tracking-widest text-white/20 uppercase ml-2">Username</label>
                          <div className="relative">
                             <span className="absolute left-4 top-4 text-primary font-medium">@</span>
                             <input 
                               type="text" 
                               value={editData.username}
                               onChange={(e) => setEditData({...editData, username: e.target.value})}
                               className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-8 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
                               placeholder="johnny"
                               required
                             />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold tracking-widest text-white/20 uppercase ml-2">Home Country</label>
                          <select 
                            value={editData.homeCountry}
                            onChange={(e) => setEditData({...editData, homeCountry: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                          >
                             {["Luxembourg", "France", "Germany", "Belgium", "United Kingdom", "United States"].map(c => (
                               <option key={c} value={c} className="bg-background text-white">{c}</option>
                             ))}
                          </select>
                       </div>
                    </div>

                    {feedback && (
                       <div className={`p-4 rounded-xl flex items-center gap-3 ${feedback.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
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
              className="space-y-12"
            >
              <button 
                onClick={() => setView("home")}
                className="flex items-center gap-3 text-white/40 hover:text-white transition-colors group mb-8"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-bold tracking-widest uppercase">Back to Profile</span>
              </button>

              <div className="space-y-16">
                 <div>
                    <h2 className="text-5xl font-display font-medium">Security <span className="text-primary italic">Settings.</span></h2>
                    <p className="text-white/40 mt-2">Manage your account protection.</p>
                 </div>

                 <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4 max-w-xl">
                    <div className="flex items-center gap-4 text-primary">
                       <ShieldCheck className="w-6 h-6" />
                       <span className="font-display font-medium">Account Access</span>
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed font-body">
                       Your emails and notifications are sent to <span className="text-white font-medium">{user?.email}</span>. 
                       {user?.providerData[0]?.providerId === 'google.com' ? "Your account is managed via Google." : "Update your password below if needed."}
                    </p>
                 </div>

                 {user?.providerData[0]?.providerId !== 'google.com' ? (
                   <form onSubmit={handleChangePassword} className="space-y-8 max-w-xl">
                      <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold tracking-widest text-white/20 uppercase ml-2">Current Password</label>
                           <input 
                             type="password" 
                             value={pwData.old}
                             onChange={(e) => setPwData({...pwData, old: e.target.value})}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                             required
                           />
                        </div>
                        <div className="h-px bg-white/5" />
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold tracking-widest text-white/20 uppercase ml-2">New Password</label>
                           <input 
                             type="password" 
                             value={pwData.new}
                             onChange={(e) => setPwData({...pwData, new: e.target.value})}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                             required
                             minLength={6}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold tracking-widest text-white/20 uppercase ml-2">Confirm New Password</label>
                           <input 
                             type="password" 
                             value={pwData.confirm}
                             onChange={(e) => setPwData({...pwData, confirm: e.target.value})}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                             required
                           />
                        </div>
                      </div>

                      {feedback && (
                       <div className={`p-4 rounded-xl flex items-center gap-3 ${feedback.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
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
                   <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 max-w-xl border border-white/5 rounded-3xl bg-white/[0.02]">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                         <Lock className="w-8 h-8" strokeWidth={1} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-display font-medium text-white/60">Using Google Auth</h3>
                        <p className="text-sm text-white/30 font-body px-8">Password management is handled securely through your Google account settings.</p>
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
