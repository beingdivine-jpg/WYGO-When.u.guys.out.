import { motion } from "framer-motion";
import { crewMembers, luxembourgCrew } from "@/data/mockData";
import { Zap, MapPin } from "lucide-react";

const CrewSection = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <span className="text-xs font-body font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
            The Crew
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-foreground">
            {luxembourgCrew.name}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <MapPin className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground font-body">
              Majority: {luxembourgCrew.majorityCountry} — holidays prioritized
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {crewMembers.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="glass rounded-2xl p-5 flex flex-col items-center text-center group hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-lg font-display font-extrabold text-primary-foreground mb-3">
                {member.avatar}
              </div>
              <h3 className="font-display font-bold text-foreground text-lg">{member.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-base">{member.countryFlag}</span>
                <span className="text-xs text-muted-foreground font-body">{member.country}</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-accent animate-glow-pulse" />
                <span className="text-xs text-accent font-body font-semibold">Synced</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CrewSection;
