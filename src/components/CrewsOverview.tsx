import { motion } from "framer-motion";
import { Users, Plus, ArrowRight, LogOut, Trash2 } from "lucide-react";
import { useCrew } from "@/contexts/CrewContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
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

interface CrewsOverviewProps {
  onCreateClick: () => void;
  onJoinClick: () => void;
}

const CrewsOverview = ({ onCreateClick, onJoinClick }: CrewsOverviewProps) => {
  const { user, userProfile } = useAuth();
  const { userCrews, setActiveCrew, isLoadingCrews, leaveCrew, deleteCrew } = useCrew();

  const handleLeave = async (crewId: string, crewName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await leaveCrew(crewId);
      toast.success(`Left squad: ${crewName}`);
    } catch {
      toast.error("Failed to leave squad.");
    }
  };

  const handleDelete = async (crewId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteCrew(crewId);
      toast.success("Crew disbanded.");
    } catch {
      toast.error("Failed to disband crew.");
    }
  };

  if (isLoadingCrews) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-t-2 border-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden text-foreground selection:bg-primary/20">
      {/* Soft Ambient Glows */}
      <div className="absolute top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-primary/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[10%] -right-[10%] w-[40vw] h-[40vw] bg-purple-500/5 blur-[100px] rounded-full" />

      <div className="max-w-6xl mx-auto w-full px-6 md:px-8 py-12 md:py-24 relative z-10 space-y-12 md:space-y-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12 border-b border-white/10 pb-8 md:pb-12">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <span className="text-social-label text-[9px]">Select a Context</span>
            </motion.div>
            <h1 className="text-4xl md:text-7xl font-display leading-tight">
              Your <span className="text-primary italic font-medium text-5xl md:text-8xl">Crews.</span>
            </h1>
            <p className="text-white/50 text-xl font-body">
              Welcome back, @{userProfile?.username || "friend"}. Choose a squad to view plans or start a new sync.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto">
            <button 
              onClick={onCreateClick}
              className="button-premium shadow-[0_10px_40px_rgba(244,86,149,0.2)] flex items-center justify-center gap-3"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Crew</span>
            </button>
            <button 
              onClick={onJoinClick}
              className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all text-sm tracking-wide flex items-center justify-center gap-3 group"
            >
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <span>Join via Code</span>
            </button>
          </div>
        </div>

        {/* Crews Grid */}
        {userCrews.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 md:py-32 text-center border border-dashed border-white/10 rounded-[3rem] bg-white/[0.02] relative group overflow-hidden px-4"
          >
            {/* Atmospheric Background for Empty State */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 text-white/20 border border-white/10 group-hover:scale-110 group-hover:text-primary/50 transition-all duration-700">
              <Users className="w-10 h-10" strokeWidth={1} />
            </div>
            <h3 className="text-5xl font-display font-medium mb-4 italic text-white/80">The Void.</h3>
            <p className="text-white/40 max-w-sm mb-12 font-body text-lg leading-relaxed">
              No squads found in this sector. Connect with friends to start finding your common weekends.
            </p>
            <button onClick={onCreateClick} className="button-premium px-12 py-5 scale-110 hover:scale-115 transition-transform">
              Manifest a Crew
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userCrews.map((crew, idx) => {
              const isOwner = crew.ownerId === user?.uid;

              return (
              <motion.div
                key={crew.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setActiveCrew(crew)}
                className="group text-left rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-primary/40 transition-all duration-700 p-8 md:p-10 flex flex-col h-[280px] md:h-[320px] justify-between relative overflow-hidden cursor-pointer shadow-xl w-full"
              >
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="relative z-10 flex justify-between items-start w-full">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-black/40 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-700">
                    <span className="text-2xl">{crew.majorityCountry === "Luxembourg" ? "🇱🇺" : "🌍"}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-white/30 tracking-widest uppercase">
                      Code: {crew.inviteCode}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 space-y-4">
                  <div>
                    <h3 className="text-3xl font-display font-medium text-white group-hover:text-primary transition-colors tracking-tight line-clamp-1">
                      {crew.name}
                    </h3>
                    <div className="text-[10px] font-bold text-white/20 tracking-widest uppercase mt-1">
                      {crew.memberIds.length} {crew.memberIds.length === 1 ? 'Member' : 'Members'}
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-white/10 flex items-center justify-between text-sm">
                    <div className="flex -space-x-1">
                       {/* Placeholder for real member avatars if we had them cached in CrewData */}
                       <div className="w-7 h-7 rounded-full bg-primary/10 border border-white/10 flex items-center justify-center text-[8px] text-primary">
                          {crew.name[0]}
                       </div>
                    </div>
                    <span className="text-[10px] font-bold tracking-widest text-primary/60 group-hover:text-primary transition-colors flex items-center gap-2">
                      Enter Hub <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </motion.div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrewsOverview;
