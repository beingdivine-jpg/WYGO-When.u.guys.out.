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
  const { activeCrew, activeMembers, pendingMembers, calculatedResults, activeResponses, pastRounds, leaveCrew, deleteCrew, removeMember, renameCrew, acceptMember, rejectMember } = useCrew();
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

  const handleAcceptMember = async (memberId: string, name: string) => {
    try {
      await acceptMember(activeCrew.id, memberId);
      toast.success(`${name} is now part of the squad!`);
    } catch (error) {
      toast.error(`Failed to accept ${name}.`);
    }
  };

  const handleRejectMember = async (memberId: string, name: string) => {
    try {
      await rejectMember(activeCrew.id, memberId);
      toast.success(`Request from ${name} rejected.`);
    } catch (error) {
      toast.error(`Failed to reject ${name}.`);
    }
  };

  const members = activeMembers;
  const syncPercentage = activeCrew.memberIds.length > 0 
    ? Math.round((activeResponses.length / activeCrew.memberIds.length) * 100)
    : 0;
  return (
    <section className="py-8 md:py-48 pb-28 md:pb-48 px-4 md:px-8 bg-background text-foreground relative overflow-hidden selection:bg-primary/20">

      <div className="max-w-6xl mx-auto relative z-10 space-y-16 md:space-y-32">

        {/* Squad Header */}
        <div className="flex flex-col md:flex-row gap-6 md:p-8 md:gap-16 items-center justify-between">
          <div className="space-y-6 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-1.5 rounded-full editorial-card"
            >
              <span className="text-social-label text-[10px] text-muted-foreground">Your Social Circle</span>
            </motion.div>
            <div className="flex items-center gap-4">
              <h2 className="text-display-header leading-tight text-foreground">
                The <span className="text-primary font-medium">Squad Hub.</span>
              </h2>
              {isOwner && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="p-2 rounded-full editorial-card text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shadow-sm">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-background border-border text-foreground shadow-sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Rename Crew</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        Give your squad a fresh new name.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <input 
                        type="text" 
                        id="new-crew-name"
                        defaultValue={activeCrew.name}
                        className="w-full editorial-card rounded-xl p-4 text-foreground focus:outline-none focus:border-primary/50 shadow-sm"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-secondary border-border text-foreground hover:bg-secondary/70">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => {
                          const newName = (document.getElementById('new-crew-name') as HTMLInputElement).value;
                          if (newName && newName !== activeCrew.name) {
                            renameCrew(activeCrew.id, newName);
                            toast.success("Crew renamed!");
                          }
                        }}
                        className="bg-primary text-white font-bold"
                      >
                        Save Name
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <p className="text-lg text-muted-foreground font-body max-w-xl mx-auto md:mx-0">
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
              className="px-8 py-4 rounded-full bg-primary border-primary text-white hover:bg-primary/90 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 flex-1 sm:flex-initial shadow-sm"
            >
              <Users className="w-4 h-4" />
              Invite
            </button>
          </div>
        </div>

        {/* Pending Requests Section (Owner Only) */}
        {isOwner && pendingMembers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-8 rounded-[2rem] editorial-card shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-primary tracking-widest uppercase">Action Required</div>
                <h3 className="text-2xl font-display font-medium text-foreground">Pending Requests</h3>
              </div>
              <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                {pendingMembers.length} Request{pendingMembers.length > 1 ? 's' : ''}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingMembers.map((pending) => (
                <div 
                  key={pending.uid}
                  className="p-4 rounded-2xl editorial-card flex items-center justify-between group hover:border-primary/20 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl editorial-card flex items-center justify-center text-xl overflow-hidden text-muted-foreground">
                      {pending.photoURL ? (
                        <img src={pending.photoURL} alt={pending.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{pending.displayName?.[0] || pending.username?.[0] || "👤"}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{pending.displayName || pending.username}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-tighter">{pending.homeCountry || "Unknown Location"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleRejectMember(pending.uid, pending.displayName || pending.username)}
                      className="px-4 py-2 rounded-lg bg-white editorial-card ring-red-500/10 shadow-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest shadow-sm"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleAcceptMember(pending.uid, pending.displayName || pending.username)}
                      className="px-4 py-2 rounded-lg bg-primary text-white font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-sm"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

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
              className="p-4 md:p-8 rounded-[2rem] editorial-card group hover:border-primary/40 transition-all duration-700 shadow-sm"
            >
              <div className="text-social-label text-muted-foreground mb-2 group-hover:text-primary transition-colors">{stat.label}</div>
              <div className="text-3xl md:text-5xl font-display font-medium text-foreground group-hover:text-primary transition-all duration-700">{stat.val}</div>
              <div className="text-[10px] font-bold text-muted-foreground tracking-widest mt-2">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Squad Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:p-8">
          {members.map((member, i) => (
            <motion.div
              key={member.uid}
              whileHover={{ y: -8 }}
              className="p-6 md:p-10 rounded-[2.5rem] editorial-card flex flex-col group transition-all duration-700 relative overflow-hidden shadow-sm"
            >

              <div className="flex justify-between items-start mb-10">
                <div className="w-24 h-24 rounded-[2rem] bg-white flex items-center justify-center text-5xl shadow-sm ring-2 ring-border overflow-hidden transition-all group-hover:scale-105 text-muted-foreground">
                  {member.photoURL ? (
                    <img src={member.photoURL} alt={member.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="grayscale-[0.5] group-hover:grayscale-0 transition-all">{member.displayName?.[0] || "👤"}</span>
                  )}
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="px-3 py-1 rounded-full editorial-card text-[10px] font-bold text-muted-foreground tracking-widest uppercase flex items-center gap-2 shadow-sm">
                    {member.uid === activeCrew.ownerId ? <Shield className="w-2.5 h-2.5 text-primary" /> : null}
                    {member.uid === activeCrew.ownerId ? "Owner" : "Member"}
                  </div>
                  {isOwner && member.uid !== user?.uid && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="px-3 py-1 rounded-full bg-red-50 editorial-card ring-red-500/10 shadow-red-500/5 text-red-500 hover:text-white hover:bg-red-500 transition-all shadow-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                          <UserMinus className="w-2.5 h-2.5" />
                          Remove
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-background border-border text-foreground shadow-sm">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove {member.displayName || member.username}?</AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            They will be removed from the squad immediately and will need a new invite to rejoin.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-secondary border-border text-foreground hover:bg-secondary/70">Keep Member</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveMember(member.uid, member.displayName || member.username)} className="bg-red-500 hover:bg-red-600 text-white">Remove Member</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-display font-medium tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {member.displayName || member.username}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase text-label-surgical">Sync Active</span>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-border flex justify-between items-center text-muted-foreground">
                <div className="text-sm font-medium italic lowercase font-body">{member.homeCountry}</div>
                <div className="text-xs font-semibold tracking-wide">Member Hub</div>
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
              className="p-6 md:p-8 md:p-10 rounded-[2.5rem] bg-transparent border border-dashed border-border group hover:bg-secondary hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-6 md:gap-6 md:p-8 min-h-[280px] md:min-h-[340px] shadow-sm">
              <div className="w-20 h-20 rounded-full editorial-card flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/40 transition-all duration-700 shadow-sm">
                <Users className="w-8 h-8" strokeWidth={1} />
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-muted-foreground tracking-widest mb-2 group-hover:text-primary transition-colors">Add to the Crew</div>
                <p className="text-xs text-muted-foreground font-body italic lowercase">Copy Code or Share Link</p>
              </div>
            </button>
          )}
        </div>

        {/* Narrative Log */}
        <div className="p-6 md:p-12 rounded-[2.5rem] editorial-card relative overflow-hidden group hover:border-primary/20 transition-all duration-700 shadow-sm">

          <div className="relative z-10 flex flex-col md:flex-row gap-6 md:p-12 items-start">
            <div className="p-6 rounded-[1.5rem] bg-primary/10 border border-primary/20 text-primary group-hover:scale-105 transition-transform duration-700">
              <Zap className="w-10 h-10 fill-current" />
            </div>
            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <div className="text-social-label text-[10px] text-muted-foreground">The Squad Story</div>
                <h3 className="text-4xl font-display font-medium text-foreground">Moments are falling into place.</h3>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed font-body max-w-4xl">
                We've centered the search around your hub in <span className="text-foreground font-medium underline decoration-primary underline-offset-4 decoration-2">{activeCrew.majorityCountry}</span>.
                Your availability is synced, and the magic is happening. These results represent the best chances for your crew to escape the routine together.
              </p>
            </div>
          </div>
        </div>

        {/* Sync History UI */}
        {pastRounds.length > 0 && (
          <div className="space-y-8 pt-12 border-t border-border">
            <h3 className="text-sm font-medium tracking-wide text-muted-foreground ml-4">Sync History Archive</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastRounds.map(round => (
                <Sheet key={round.id}>
                  <SheetTrigger asChild>
                    <button 
                      onClick={() => handleViewHistory(round)}
                      className="p-6 md:p-8 rounded-[2rem] editorial-card flex items-center justify-between group cursor-pointer hover:border-primary/20 hover:bg-secondary/50 transition-all duration-500 shadow-sm text-left w-full"
                    >
                      <div>
                        <div className="text-xl font-display font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                          {round.createdAt ? new Date(round.createdAt.toMillis?.() || round.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Previous Round'}
                          {round.status === 'cancelled' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-500 uppercase">Cancelled</span>}
                        </div>
                        <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mt-2">
                          {round.durationMonths} Month Scan
                        </div>
                      </div>
                      <div className="p-3 rounded-full bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <Eye className="w-4 h-4" />
                      </div>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[90vh] bg-background border-border p-0 overflow-y-auto">
                    {isLoadingHistory ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin" />
                        <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Recalling Memories</span>
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
        <div className="space-y-12 pt-24 border-t border-border">
          <div className="flex items-center gap-4 mb-4 ml-4">
            <div className="w-10 h-10 rounded-full bg-red-50 editorial-card ring-red-500/10 shadow-red-500/5 flex items-center justify-center text-red-500 shadow-sm">
               <Settings className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
               <h3 className="text-xl font-display font-medium text-foreground tracking-tight">Danger Zone</h3>
               <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">Handle with extreme care</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 md:p-10 rounded-[2.5rem] editorial-card flex flex-col justify-between group hover:shadow-sm transition-all duration-700 relative overflow-hidden">
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl editorial-card flex items-center justify-center text-muted-foreground mb-6 group-hover:text-foreground transition-colors duration-700 shadow-sm">
                   <LogOut className="w-5 h-5" />
                </div>
                <h4 className="text-2xl font-display font-medium text-foreground mb-3">Leave Squad</h4>
                <p className="text-base text-muted-foreground mb-10 leading-relaxed font-body">
                  Step away from this crew. You can rejoin later with an invite link.
                </p>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="px-8 py-4 w-full md:w-auto self-start rounded-full border border-border bg-white text-foreground hover:bg-secondary transition-all font-bold text-[10px] uppercase tracking-[0.2em] shadow-sm">
                    Leave Squad
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-background border-border text-foreground rounded-[2rem] p-6 md:p-8 shadow-sm">
                  <AlertDialogHeader className="space-y-4">
                    <AlertDialogTitle className="text-3xl font-display font-medium">
                      {isOwner && activeCrew.memberIds.length === 1 
                        ? "Disband Squad Permanently?" 
                        : isOwner 
                          ? "Transfer Ownership & Leave?" 
                          : "Leave Squad?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground text-lg leading-relaxed font-body">
                      {isOwner && activeCrew.memberIds.length === 1 
                        ? "You are the last member. This will delete the squad and all its sync history forever." 
                        : isOwner 
                          ? "You are the owner. Ownership will be transferred to another member automatically." 
                          : "You will lose access to this crew and its availability data. You can always rejoin later with an invite link."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-10 gap-4">
                    <AlertDialogCancel className="bg-secondary border-border text-foreground hover:bg-secondary/70 rounded-2xl py-6 font-bold tracking-widest text-xs">Stay in Squad</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleLeave} 
                      className="bg-red-500 hover:bg-red-600 text-white rounded-2xl py-6 font-bold tracking-widest text-xs"
                    >
                      {isOwner && activeCrew.memberIds.length === 1
                        ? "Disband Squad"
                        : isOwner
                          ? "Leave & Transfer"
                          : "Leave Squad"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {isOwner && (
              <div className="p-6 md:p-10 rounded-[2.5rem] bg-white editorial-card ring-red-500/10 shadow-red-500/5 flex flex-col justify-between group hover:shadow-sm transition-all duration-700 relative overflow-hidden">
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-red-50/50 editorial-card ring-red-500/10 shadow-red-500/5 flex items-center justify-center text-red-500 mb-6 group-hover:text-red-500 transition-colors duration-700 shadow-sm">
                     <Trash2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-2xl font-display font-medium text-red-500 mb-3">Disband Squad</h4>
                  <p className="text-base text-red-500/80 mb-10 leading-relaxed font-body">
                    Permanently delete <strong>{activeCrew.name}</strong> and all its sync history for everyone.
                  </p>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="px-8 py-4 w-full md:w-auto self-start rounded-full bg-red-50 editorial-card ring-red-500/10 shadow-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold text-[10px] uppercase tracking-[0.2em] shadow-sm">
                      Disband Permanently
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-background border-border text-foreground rounded-[2rem] p-6 md:p-8 shadow-sm">
                    <AlertDialogHeader className="space-y-4">
                      <AlertDialogTitle className="text-3xl font-display font-medium text-red-500">
                        Disband {activeCrew.name}?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground text-lg leading-relaxed font-body">
                        This is a destructive action. The squad, all its members, and all historical sync rounds will be deleted forever for everyone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-10 gap-4">
                      <AlertDialogCancel className="bg-secondary border-border text-foreground hover:bg-secondary/70 rounded-2xl py-6 font-bold tracking-widest text-xs">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete} 
                        className="bg-red-500 hover:bg-red-600 text-white rounded-2xl py-6 font-bold tracking-widest text-xs"
                      >
                        Disband Squad
                      </AlertDialogAction>
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
