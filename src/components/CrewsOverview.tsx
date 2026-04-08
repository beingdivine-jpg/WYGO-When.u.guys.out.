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
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-t-2 border-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative overflow-hidden text-foreground selection:bg-primary/20">

      <div className="max-w-6xl mx-auto w-full px-6 md:px-8 py-12 md:py-24 relative z-10 space-y-12 md:space-y-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:p-8 md:gap-6 md:p-12 border-b border-border pb-8 md:pb-12">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-1.5 rounded-full editorial-card"
            >
              <span className="text-social-label text-muted-foreground text-[10px]">Select a Context</span>
            </motion.div>
            <h1 className="text-4xl md:text-7xl font-display leading-tight">
              Your <span className="text-primary font-medium text-5xl md:text-8xl">Crews.</span>
            </h1>
            <p className="text-muted-foreground text-xl font-body">
              Welcome back, @{userProfile?.username || "friend"}. Choose a squad to view plans or start a new sync.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto">
            <button 
              onClick={onCreateClick}
              className="button-premium flex items-center justify-center gap-3"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Crew</span>
            </button>
            <button 
              onClick={onJoinClick}
              className="px-8 py-4 rounded-xl bg-white hover:editorial-card text-foreground font-medium transition-all text-sm tracking-wide flex items-center justify-center gap-3 group shadow-sm"
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
            className="flex flex-col items-center justify-center py-16 md:py-24 text-center editorial-card rounded-[2rem] bg-white relative group overflow-hidden px-4"
          >
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-8 text-muted-foreground editorial-card group-hover:-translate-y-2 group-hover:text-primary transition-all duration-700">
              <Users className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h3 className="text-5xl md:text-6xl font-display font-medium mb-4 text-foreground tracking-tight">Gather your group.</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-12 font-body text-base leading-relaxed">
              Every great escape starts with a crew. Create a new squad, share the invite code, and synchronize your weekends effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-6">
               <button onClick={onCreateClick} className="button-premium w-full sm:w-auto px-10 py-4 shadow-md">
                 Start a Crew
               </button>
               <button onClick={onJoinClick} className="w-full sm:w-auto px-10 py-4 rounded-xl md:rounded-2xl bg-white border border-border hover:bg-secondary text-foreground font-medium transition-all text-base flex items-center justify-center gap-3 shadow-sm">
                 Join via Code
               </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:p-8">
            {userCrews.map((crew, idx) => {
              const isOwner = crew.ownerId === user?.uid;

              return (
              <motion.div
                key={crew.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setActiveCrew(crew)}
                className="group text-left rounded-[2rem] editorial-card hover:border-primary/40 hover:shadow-md transition-all duration-300 p-6 md:p-8 flex flex-col min-h-[240px] md:min-h-[280px] justify-between relative overflow-hidden cursor-pointer shadow-sm w-full"
              >
                <div className="relative z-10 flex justify-between items-start w-full">
                  <div className="w-14 h-14 rounded-2xl editorial-card flex items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-300">
                    <span className="text-2xl">{crew.majorityCountry === "Luxembourg" ? "🇱🇺" : "🌍"}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="px-4 py-1.5 rounded-full editorial-card text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
                      Code: {crew.inviteCode}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 space-y-4">
                  <div>
                    <h3 className="text-2xl font-display font-medium text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1">
                      {crew.name}
                    </h3>
                    <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mt-1">
                      {crew.memberIds.length} {crew.memberIds.length === 1 ? 'Member' : 'Members'}
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-border flex items-center justify-between text-sm">
                    <div className="flex -space-x-1">
                       <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                          {crew.name[0]}
                       </div>
                    </div>
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-2">
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
