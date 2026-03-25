import { motion } from "framer-motion";
import { useCrew } from "@/contexts/CrewContext";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Users, Zap, Settings, LogOut, Trash2, UserMinus, Shield, Edit2, History, Eye } from "lucide-react";
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
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetTrigger
} from "@/components/ui/sheet";
import GoldenWindowsSection from "./GoldenWindowsSection";
import { dbService, UserResponse } from "@/lib/dbService";
import React, { useState } from "react";

const CrewSection = () => {
  const { activeCrew, activeMembers, calculatedResults, activeResponses, pastRounds, leaveCrew, deleteCrew, removeMember, renameCrew } = useCrew();
  const { user } = useAuth();
  
  const [viewingPastRound, setViewingPastRound] = useState<any | null>(null);
  const [pastResponses, setPastResponses] = useState<UserResponse[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const handleViewHistory = async (round: any) => {
    setIsLoadingHistory(true);
    setViewingPastRound(round);
    try {
      const responses = await dbService.getRoundResponses(activeCrew!.id, round.id);
      setPastResponses(responses);
    } catch (error) {
      toast.error("Failed to load history.");
      setViewingPastRound(null);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  if (!activeCrew) return null;
  const isOwner = activeCrew.ownerId === user?.uid;

  const handleLeave = async () => {
    try {
      await leaveCrew(activeCrew.id);
      toast.success("Left the squad. See you around!");
    } catch (error) {
      toast.error("Failed to leave the squad.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCrew(activeCrew.id);
      toast.success("Crew disbanded.");
    } catch (error) {
      toast.error("Failed to disband the crew.");
    }
  };

  const handleRemoveMember = async (memberId: string, name: string) => {
    try {
      await removeMember(activeCrew.id, memberId);
      toast.success(`${name} has been removed from the squad.`);
    } catch (error) {
      toast.error(`Failed to remove ${name}.`);
    }
  };

  const members = activeMembers;
  const syncPercentage = activeCrew.memberIds.length > 0 
    ? Math.round((activeResponses.length / activeCrew.memberIds.length) * 100)
    : 0;
  return (
    <section className="py-12 md:py-48 px-4 md:px-8 bg-background text-white relative overflow-hidden selection:bg-primary/20">
      {/* Decorative Atmospheric Glows */}
      <div className="absolute top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-primary/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[20%] -right-[10%] w-[40vw] h-[40vw] bg-purple-500/5 blur-[100px] rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-16 md:space-y-32">

        {/* Squad Header */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center justify-between">
          <div className="space-y-6 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <span className="text-social-label text-[9px]">Your Social Circle</span>
            </motion.div>
            <div className="flex items-center gap-4">
              <h2 className="text-display-header leading-tight">
                The <span className="text-primary italic font-medium">Squad Hub.</span>
              </h2>
              {isOwner && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-primary hover:border-primary/40 transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-background border-white/10 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Rename Crew</AlertDialogTitle>
                      <AlertDialogDescription className="text-white/60">
                        Give your squad a fresh new name.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <input 
                        type="text" 
                        id="new-crew-name"
                        defaultValue={activeCrew.name}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => {
                          const newName = (document.getElementById('new-crew-name') as HTMLInputElement).value;
                          if (newName && newName !== activeCrew.name) {
                            renameCrew(activeCrew.id, newName);
                            toast.success("Crew renamed!");
                          }
                        }}
                        className="bg-primary text-black font-bold"
                      >
                        Save Name
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <p className="text-lg text-white/50 font-body max-w-xl mx-auto md:mx-0">
              {isOwner ? "Manage your crew, invite more friends, and see how the group's excitement is building up for the next escape." : "See how the group's excitement is building up for the next escape."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button 
              onClick={() => {
                const inviteText = `Join ${activeCrew.name} on WYGO using code: ${activeCrew.inviteCode}`;
                if (navigator.share) {
                  navigator.share({ title: 'Join my WYGO Crew', text: inviteText }).catch(() => {
                    navigator.clipboard.writeText(activeCrew.inviteCode);
                    toast.success("Invite code copied!");
                  });
                } else {
                  navigator.clipboard.writeText(activeCrew.inviteCode);
                  toast.success("Invite code copied!");
                }
              }}
              className="px-8 py-4 rounded-full bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            >
              <Users className="w-4 h-4" />
              Invite
            </button>
          </div>
        </div>

        {/* Social Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Squad Size", val: members.length.toString().padStart(2, '0'), sub: "Active Members" },
            { label: "Group Sync", val: `${syncPercentage}%`, sub: "Participation Rate" },
            { label: "Matches", val: calculatedResults.length.toString(), sub: "Calculated Windows" },
            { label: "Home Base", val: activeCrew.majorityCountry.slice(0, 3).toUpperCase(), sub: activeCrew.majorityCountry },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm group hover:border-primary/40 transition-all duration-700"
            >
              <div className="text-social-label text-white/30 mb-2 group-hover:text-primary transition-colors">{stat.label}</div>
              <div className="text-5xl font-display font-medium text-white group-hover:text-primary transition-all duration-700">{stat.val}</div>
              <div className="text-[10px] font-bold text-white/20 tracking-widest mt-2">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Squad Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member, i) => (
            <motion.div
              key={member.uid}
              whileHover={{ y: -8 }}
              className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col group transition-all duration-700 relative overflow-hidden backdrop-blur-md shadow-2xl"
            >
              {/* Soft Gradient Overlay */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex justify-between items-start mb-10">
                <div className="w-24 h-24 rounded-[2rem] bg-white/10 flex items-center justify-center text-5xl shadow-xl ring-2 ring-white/5 overflow-hidden transition-all group-hover:scale-105">
                  {member.photoURL ? (
                    <img src={member.photoURL} alt={member.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="grayscale-[0.5] group-hover:grayscale-0 transition-all">{member.displayName?.[0] || "👤"}</span>
                  )}
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-white/30 tracking-widest uppercase flex items-center gap-1.5">
                    {member.uid === activeCrew.ownerId ? <Shield className="w-2.5 h-2.5 text-primary" /> : null}
                    {member.uid === activeCrew.ownerId ? "Owner" : "Member"}
                  </div>
                  {isOwner && member.uid !== user?.uid && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button title="Remove Member" className="p-1.5 rounded-lg bg-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/20 transition-all">
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-background border-white/10 text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove {member.displayName || member.username}?</AlertDialogTitle>
                          <AlertDialogDescription className="text-white/60">
                            They will be removed from the squad immediately and will need a new invite to rejoin.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Keep Member</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveMember(member.uid, member.displayName || member.username)} className="bg-red-500 hover:bg-red-600 text-white">Remove Member</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-display font-medium tracking-tight text-white group-hover:text-primary transition-colors">
                  {member.displayName || member.username}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary glow-sunset animate-pulse" />
                  <span className="text-[10px] font-bold text-white/30 tracking-widest uppercase text-label-surgical">Sync Active</span>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center text-white/40">
                <div className="text-sm font-medium italic lowercase font-body">{member.homeCountry}</div>
                <div className="text-[9px] font-bold tracking-widest uppercase">Member Hub</div>
              </div>
            </motion.div>
          ))}

          {/* Add Friend Card */}
          {isOwner && (
            <button 
              onClick={() => {
                const inviteText = `Join ${activeCrew.name} on WYGO using code: ${activeCrew.inviteCode}`;
                if (navigator.share) {
                  navigator.share({
                    title: 'Join my WYGO Crew',
                    text: inviteText,
                  }).catch(() => {
                    navigator.clipboard.writeText(activeCrew.inviteCode);
                    toast.success(`Invite code ${activeCrew.inviteCode} copied to clipboard!`);
                  });
                } else {
                  navigator.clipboard.writeText(activeCrew.inviteCode);
                  toast.success(`Invite code ${activeCrew.inviteCode} copied to clipboard!`);
                }
              }}
              className="p-8 md:p-10 rounded-[2.5rem] bg-white/[0.03] border border-dashed border-white/10 group hover:bg-primary/[0.05] hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-6 md:gap-8 min-h-[280px] md:min-h-[340px] shadow-sm">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 group-hover:text-primary group-hover:border-primary/40 transition-all duration-700">
                <Users className="w-8 h-8" strokeWidth={1} />
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-white/30 tracking-widest mb-2 group-hover:text-primary transition-colors">Add to the Crew</div>
                <p className="text-xs text-white/20 font-body italic lowercase">Copy Code or Share Link</p>
              </div>
            </button>
          )}
        </div>

        {/* Narrative Log */}
        <div className="p-12 rounded-[2.5rem] bg-white/5 border border-white/10 relative overflow-hidden group hover:border-primary/20 transition-all duration-700 shadow-2xl backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -translate-y-12 translate-x-12" />

          <div className="relative z-10 flex flex-col md:flex-row gap-12 items-start">
            <div className="p-6 rounded-[1.5rem] bg-primary/10 border border-primary/20 text-primary glow-sunset group-hover:scale-105 transition-transform duration-700">
              <Zap className="w-10 h-10 fill-current" />
            </div>
            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <div className="text-social-label text-[10px]">The Squad Story</div>
                <h3 className="text-4xl font-display font-medium italic text-white/90">Moments are falling into place.</h3>
              </div>
              <p className="text-lg text-white/50 leading-relaxed font-body max-w-4xl">
                We've centered the search around your hub in <span className="text-white font-medium italic underline decoration-primary underline-offset-4 decoration-2">{activeCrew.majorityCountry}</span>.
                Your availability is synced, and the magic is happening. These results represent the best chances for your crew to escape the routine together.
              </p>
            </div>
          </div>
        </div>

        {/* Sync History UI */}
        {pastRounds.length > 0 && (
          <div className="space-y-8 pt-12 border-t border-white/10">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/30 ml-4">Sync History Archive</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastRounds.map(round => (
                <Sheet key={round.id}>
                  <SheetTrigger asChild>
                    <button 
                      onClick={() => handleViewHistory(round)}
                      className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-between group cursor-pointer hover:border-primary/20 hover:bg-white/[0.04] transition-all duration-500 shadow-sm text-left w-full"
                    >
                      <div>
                        <div className="text-xl font-display font-medium text-white/90 group-hover:text-primary transition-colors flex items-center gap-2">
                          {round.createdAt ? new Date(round.createdAt.toMillis?.() || round.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Previous Round'}
                          {round.status === 'cancelled' && <span className="text-[8px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-500/60 uppercase">Cancelled</span>}
                        </div>
                        <div className="text-[10px] font-bold tracking-widest text-white/30 uppercase mt-2">
                          {round.durationMonths} Month Scan
                        </div>
                      </div>
                      <div className="p-3 rounded-full bg-white/5 text-white/20 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <Eye className="w-4 h-4" />
                      </div>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[90vh] bg-background border-white/10 p-0 overflow-y-auto scanlines-container">
                    <div className="scanlines opacity-20 pointer-events-none" />
                    {isLoadingHistory ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin" />
                        <span className="text-xs font-bold tracking-widest text-white/30 uppercase">Recalling Memories</span>
                      </div>
                    ) : (
                      <GoldenWindowsSection 
                        overrideRound={round}
                        overrideResponses={pastResponses}
                        title="Historical Discovery"
                        subtitle={`${new Date(round.createdAt?.toMillis?.() || round.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Result Archive`}
                      />
                    )}
                  </SheetContent>
                </Sheet>
              ))}
            </div>
          </div>
        )}

        {/* Squad Settings & Danger Zone */}
        <div className="space-y-8 pt-12 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6 ml-4">
            <Settings className="w-5 h-5 text-white/30" />
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/30">Squad Settings</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col justify-between group hover:border-white/20 transition-all duration-500">
              <div>
                <h4 className="text-xl font-display font-medium text-white mb-2 flex items-center gap-2"><LogOut className="w-4 h-4 text-white/50" /> Leave Squad</h4>
                <p className="text-sm text-white/50 mb-8 leading-relaxed">
                  Step away from this crew. You will need a new invite code from a current member to rejoin later.
                  {isOwner && activeCrew.memberIds.length > 1 && " Since you're the owner, ownership will be transferred automatically."}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="px-6 py-4 w-full md:w-auto self-start rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                    Leave Squad
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-background border-white/10 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Leave {activeCrew.name}?</AlertDialogTitle>
                    <AlertDialogDescription className="text-white/60">
                      You're about to leave this squad. You'll lose access to all sync history and future plans until re-invited.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLeave} className="bg-red-500 hover:bg-red-600 text-white">Leave</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {isOwner && (
              <div className="p-8 rounded-[2rem] bg-red-500/5 border border-red-500/10 flex flex-col justify-between group hover:border-red-500/30 transition-all duration-500">
                <div>
                  <h4 className="text-xl font-display font-medium text-red-500 mb-2 flex items-center gap-2"><Trash2 className="w-4 h-4 text-red-500/60" /> Disband Squad</h4>
                  <p className="text-sm text-red-500/60 mb-8 leading-relaxed">
                    Permanently delete <strong>{activeCrew.name}</strong> and all its sync history. This action affects all members and cannot be undone.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="px-6 py-4 w-full md:w-auto self-start rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                      Disband Permanently
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-background border-white/10 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disband {activeCrew.name}?</AlertDialogTitle>
                      <AlertDialogDescription className="text-white/60">
                        This is a destructive action. The squad, all its members, and all historical sync rounds will be deleted forever.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">Disband Squad</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>

      </div>

    </section>
  );
};

export default CrewSection;
