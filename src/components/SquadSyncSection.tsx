import { motion } from "framer-motion";
import { useState } from "react";
import { crewMembers, type AvailabilityStatus, statusConfig } from "@/data/mockData";

const weekends = [
  { id: "w1", label: "May 9–11", tag: "🇱🇺 Europe Day" },
  { id: "w2", label: "May 16–18", tag: null },
  { id: "w3", label: "May 23–25", tag: null },
  { id: "w4", label: "May 29–Jun 1", tag: "🇱🇺 Whit Monday" },
];

const statuses: AvailabilityStatus[] = ["free", "maybe", "busy", "need-leave", "unknown"];

const SquadSyncSection = () => {
  const [availability, setAvailability] = useState<Record<string, Record<string, AvailabilityStatus>>>(() => {
    const init: Record<string, Record<string, AvailabilityStatus>> = {};
    crewMembers.forEach((m) => {
      init[m.id] = {};
      weekends.forEach((w) => {
        init[m.id][w.id] = "unknown";
      });
    });
    // Pre-fill some data
    init["1"]["w1"] = "free";
    init["2"]["w1"] = "free";
    init["3"]["w1"] = "free";
    init["4"]["w1"] = "maybe";
    init["5"]["w1"] = "free";
    init["6"]["w1"] = "free";
    init["1"]["w4"] = "free";
    init["2"]["w4"] = "maybe";
    init["3"]["w4"] = "busy";
    return init;
  });

  const cycleStatus = (memberId: string, weekendId: string) => {
    setAvailability((prev) => {
      const current = prev[memberId][weekendId];
      const idx = statuses.indexOf(current);
      const next = statuses[(idx + 1) % statuses.length];
      return {
        ...prev,
        [memberId]: { ...prev[memberId], [weekendId]: next },
      };
    });
  };

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
            Squad Sync
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-foreground">
            When are you out?
          </h2>
          <p className="text-muted-foreground font-body mt-2">
            Tap to cycle your status. It's that simple.
          </p>
        </motion.div>

        <div className="space-y-3">
          {weekends.map((weekend, wi) => (
            <motion.div
              key={weekend.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: wi * 0.08, duration: 0.5 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-display font-bold text-foreground text-lg">{weekend.label}</h3>
                  {weekend.tag && (
                    <span className="text-xs font-body font-semibold text-accent">{weekend.tag}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {crewMembers.map((member) => {
                  const status = availability[member.id][weekend.id];
                  const config = statusConfig[status];
                  return (
                    <motion.button
                      key={member.id}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => cycleStatus(member.id, weekend.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${config.color} cursor-pointer`}
                    >
                      <span className="text-xs font-display font-bold">{member.avatar}</span>
                      <span className="text-xs font-body font-semibold">{config.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SquadSyncSection;
