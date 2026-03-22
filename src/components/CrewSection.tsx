import { motion } from "framer-motion";
import { useCrew } from "@/contexts/CrewContext";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Users, Zap } from "lucide-react";
import { toast } from "sonner";

const CrewSection = () => {
  const { activeCrew, activeMembers, calculatedResults, activeResponses, pastRounds } = useCrew();
  const { user } = useAuth();
  
  if (!activeCrew) return null;
  const isOwner = activeCrew.ownerId === user?.uid;
  
  const members = activeMembers;
  const syncPercentage = activeCrew.memberIds.length > 0 
    ? Math.round((activeResponses.length / activeCrew.memberIds.length) * 100)
    : 0;
  return (
    <section className="py-24 md:py-48 px-8 bg-background text-white relative overflow-hidden selection:bg-primary/20">
      {/* Decorative Atmospheric Glows */}
      <div className="absolute top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-primary/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[20%] -right-[10%] w-[40vw] h-[40vw] bg-purple-500/5 blur-[100px] rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-32">

        {/* Squad Header */}
        <div className="flex flex-col md:flex-row gap-16 items-center justify-between">
          <div className="space-y-6 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <span className="text-social-label text-[9px]">Your Social Circle</span>
            </motion.div>
            <h2 className="text-display-header leading-tight">
              The <span className="text-primary italic font-medium">Squad Hub.</span>
            </h2>
            <p className="text-lg text-white/50 font-body max-w-xl mx-auto md:mx-0">
              {isOwner ? "Manage your crew, invite more friends, and see how the group's excitement is building up for the next escape." : "See how the group's excitement is building up for the next escape."}
            </p>
          </div>

          {isOwner && (
            <button className="button-premium min-w-[280px] shadow-[0_20px_50px_rgba(244,86,149,0.3)]">
              Invite More Friends
            </button>
          )}
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
                <div className="text-right">
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-white/30 tracking-widest uppercase">Member</div>
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
              className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-dashed border-white/10 group hover:bg-primary/[0.05] hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-8 min-h-[340px] shadow-sm">
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
                <div key={round.id} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-between group cursor-help hover:border-primary/20 hover:bg-white/[0.04] transition-all duration-500 shadow-sm">
                  <div>
                    <div className="text-xl font-display font-medium text-white/90 group-hover:text-primary transition-colors">
                      {round.createdAt ? new Date(round.createdAt.toMillis()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Previous Round'}
                    </div>
                    <div className="text-[10px] font-bold tracking-widest text-white/30 uppercase mt-2">
                      {round.durationMonths} Month Scan
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-white/5 rounded-full text-[9px] font-bold tracking-widest text-white/50 uppercase group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    Archive
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default CrewSection;
