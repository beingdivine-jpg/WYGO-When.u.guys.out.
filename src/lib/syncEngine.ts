import { CrewData, UserResponse } from './dbService';
import { GoldenWindow } from '../types';

export interface Weekend {
  id: string;
  label: string;
  date: Date;
  tag: string | null;
}

export const syncEngine = {
  generateWeekends(durationMonths: number, baseDate?: Date): Weekend[] {
    const weekends: Weekend[] = [];
    const startFrom = baseDate ? new Date(baseDate) : new Date();
    startFrom.setHours(0, 0, 0, 0);
    
    // Start from next Friday relative to startFrom
    let current = new Date(startFrom);
    current.setDate(startFrom.getDate() + (5 - startFrom.getDay() + 7) % 7);
    
    const endDate = new Date(startFrom);
    endDate.setMonth(startFrom.getMonth() + durationMonths);
    
    while (current < endDate) {
      const label = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      // Use a more stable ID: YYYY-MM-DD
      const weekId = `w-${current.getFullYear()}-${(current.getMonth()+1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')}`;
      
      weekends.push({
        id: weekId,
        label: `${label}–${new Date(current.getTime() + 2 * 24 * 60 * 60 * 1000).getDate()}`,
        date: new Date(current),
        tag: null
      });
      
      // Move to next Friday
      current.setDate(current.getDate() + 7);
    }
    
    return weekends;
  },

  calculateResults(responses: UserResponse[], crew: CrewData, durationMonths: number, baseDate?: Date): GoldenWindow[] {
    const weekends = this.generateWeekends(durationMonths, baseDate);
    const results: GoldenWindow[] = [];
    
    const memberCount = responses.length;
    if (memberCount < 2) return [];

    weekends.forEach(w => {
      let freeCount = 0;
      let maybeCount = 0;
      let busyCount = 0;
      const freeNames: string[] = [];
      const maybeNames: string[] = [];
      const busyNames: string[] = [];

      responses.forEach(r => {
        const status = r.availability[w.id] || 'unknown';
        if (status === 'free') {
          freeCount++;
          freeNames.push(r.displayName);
        } else if (status === 'maybe') {
          maybeCount++;
          maybeNames.push(r.displayName);
        } else if (status === 'busy') {
          busyCount++;
          busyNames.push(r.displayName);
        }
      });

      // Scoring Logic:
      // Base: (Free*1 + Maybe*0.4) / totalMembers
      // Penalty: Busy*0.5 (We want windows with NO busy people if possible)
      const baseScore = (freeCount * 1 + maybeCount * 0.4 - busyCount * 0.5) / memberCount;
      
      // Scalable Country-Aware Holiday Detection
      let holidayBoost = 0;
      
      const holidays = [
        { date: "Jan 1", name: "New Year's Day", countries: [] }, // Global
        { date: "May 1", name: "Labor Day", countries: ["France", "Germany", "Belgium", "Luxembourg"] },
        { date: "May 9", name: "Europe Day", countries: ["Luxembourg"] },
        { date: "May 29", name: "Ascension Day", countries: ["France", "Germany", "Belgium", "Luxembourg"] },
        { date: "Jun 9", name: "Whit Monday", countries: ["France", "Germany", "Belgium", "Luxembourg"] },
        { date: "Jun 23", name: "Luxembourg National Day", countries: ["Luxembourg"] },
        { date: "Jul 4", name: "Independence Day", countries: ["United States"] },
        { date: "Jul 14", name: "Bastille Day", countries: ["France"] },
        { date: "Oct 3", name: "German Unity Day", countries: ["Germany"] },
        { date: "Nov 1", name: "All Saints' Day", countries: ["France", "Luxembourg", "Belgium"] },
        { date: "Nov 27", name: "Thanksgiving", countries: ["United States"] },
        { date: "Dec 25", name: "Christmas Day", countries: [] } // Global
      ];

      // Check for holidays within or adjacent to the weekend (Fri, Sat, Sun, Mon)
      const daysToCheck = [0, 1, 2, 3]; // Fri, Sat, Sun, Mon relative to Friday
      let detectedHoliday = null;
      
      for (const offset of daysToCheck) {
        const d = new Date(w.date.getTime() + offset * 24 * 60 * 60 * 1000);
        const dateKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const matchingHoliday = holidays.find(h => h.date === dateKey);
        
        if (matchingHoliday) {
          // Check if this holiday applies to the crew's majority country
          const applies = matchingHoliday.countries.length === 0 || 
                          matchingHoliday.countries.includes(crew.majorityCountry);
                          
          if (applies) {
            detectedHoliday = matchingHoliday.name;
            holidayBoost = 0.20; // Significant boost for relevant holiday overlap
            break;
          }
        }
      }
      
      let leaveDays = 0;
      if (detectedHoliday) {
        const fri = new Date(w.date);
        const thu = new Date(fri.getTime() - 86400000);
        const tue = new Date(fri.getTime() + 345600000);
        const thuKey = thu.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const tueKey = tue.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const checkThu = holidays.find(h => h.date === thuKey && (h.countries.length === 0 || h.countries.includes(crew.majorityCountry)));
        const checkTue = holidays.find(h => h.date === tueKey && (h.countries.length === 0 || h.countries.includes(crew.majorityCountry)));
        
        if (checkThu || checkTue) leaveDays = 1;
      }

      const finalScore = Math.max(0, Math.min(1.0, baseScore + holidayBoost));
      const matchStrength = Math.round(finalScore * 100);

      if (matchStrength > 30) {
        results.push({
          id: w.id,
          dateRange: w.label,
          dates: "Fri – Sun",
          matchStrength,
          tags: this.generateTags(matchStrength, freeCount, memberCount, w),
          freeMembers: freeNames,
          maybeMembers: maybeNames,
          busyMembers: busyNames,
          explanation: this.generateExplanation(freeCount, maybeCount, memberCount, detectedHoliday),
          holidayBoost: detectedHoliday || undefined,
          leaveDays
        });
      }
    });

    return results.sort((a, b) => b.matchStrength - a.matchStrength).slice(0, 5);
  },

  generateTags(strength: number, freeCount: number, total: number, weekend: Weekend): string[] {
    const tags = [];
    if (strength > 85) tags.push("Best Common Slot");
    if (freeCount === total) tags.push("Full Squad Ready");
    if (strength > 70 && strength <= 85) tags.push("Solid Backup");
    if (strength > 50 && strength <= 70) tags.push("Majority Works");
    return tags;
  },

  generateExplanation(free: number, maybe: number, total: number, holidayName: string | null): string {
    if (free === total) return "Total squad alignment! Everyone is free and ready to go.";
    if (holidayName && free + maybe === total) return `Magic overlap! ${holidayName} makes this the ultimate window for everyone.`;
    if (holidayName && free > 0) return `${holidayName} holiday detected! ${free} members are already free to celebrate.`;
    if (free + maybe === total && maybe > 0) return `Strong potential: ${free} confirmed free, and ${maybe} are likely to join!`;
    if (free >= Math.ceil(total * 0.7)) return `High confidence: This works for nearly the whole crew (${free}/${total}).`;
    if (free >= Math.ceil(total * 0.5)) return `Majority match: ${free} out of ${total} are free. A solid bet for an escape.`;
    return `Backup option: Still waiting on more squad markers to confirm this window.`;
  }
};
