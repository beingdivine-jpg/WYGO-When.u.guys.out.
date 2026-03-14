export interface CrewMember {
  id: string;
  name: string;
  avatar: string;
  country: string;
  countryFlag: string;
}

export interface GoldenWindow {
  id: string;
  dateRange: string;
  dates: string;
  matchStrength: number;
  tags: string[];
  freeMembers: string[];
  maybeMembers: string[];
  busyMembers: string[];
  explanation: string;
  holidayBoost?: string;
  leaveDays?: number;
}

export interface Crew {
  id: string;
  name: string;
  members: CrewMember[];
  goldenWindows: GoldenWindow[];
  majorityCountry: string;
}

export const crewMembers: CrewMember[] = [
  { id: "1", name: "Léa", avatar: "L", country: "Luxembourg", countryFlag: "🇱🇺" },
  { id: "2", name: "Max", avatar: "M", country: "Luxembourg", countryFlag: "🇱🇺" },
  { id: "3", name: "Sophie", avatar: "S", country: "Germany", countryFlag: "🇩🇪" },
  { id: "4", name: "Jules", avatar: "J", country: "France", countryFlag: "🇫🇷" },
  { id: "5", name: "Anouk", avatar: "A", country: "Belgium", countryFlag: "🇧🇪" },
  { id: "6", name: "Tiago", avatar: "T", country: "Luxembourg", countryFlag: "🇱🇺" },
];

export const goldenWindows: GoldenWindow[] = [
  {
    id: "gw1",
    dateRange: "May 9 – 11",
    dates: "Fri – Sun",
    matchStrength: 97,
    tags: ["Golden Window", "Luxembourg Boost", "Core Squad Ready"],
    freeMembers: ["Léa", "Max", "Tiago", "Sophie", "Anouk"],
    maybeMembers: ["Jules"],
    busyMembers: [],
    explanation: "Europe Day long weekend — Luxembourg public holiday on May 9th. 5 of 6 confirmed free, Jules checking work.",
    holidayBoost: "Luxembourg 🇱🇺 Europe Day",
    leaveDays: 0,
  },
  {
    id: "gw2",
    dateRange: "Jun 23 – 26",
    dates: "Mon – Thu",
    matchStrength: 91,
    tags: ["Golden Window", "Luxembourg Boost", "1 Leave Day Unlock"],
    freeMembers: ["Léa", "Max", "Tiago", "Jules"],
    maybeMembers: ["Sophie", "Anouk"],
    busyMembers: [],
    explanation: "Luxembourg National Day (Jun 23). Take 1 leave day to unlock a 4-day escape. Core Luxembourg crew fully aligned.",
    holidayBoost: "Luxembourg 🇱🇺 National Day",
    leaveDays: 1,
  },
  {
    id: "gw3",
    dateRange: "Aug 15 – 17",
    dates: "Fri – Sun",
    matchStrength: 85,
    tags: ["Main-Country Match", "Almost Perfect"],
    freeMembers: ["Léa", "Max", "Jules", "Anouk"],
    maybeMembers: ["Tiago"],
    busyMembers: ["Sophie"],
    explanation: "Assumption Day — public holiday in Luxembourg, France, and Belgium. Sophie has a family event but 4 confirmed.",
    holidayBoost: "Multi-Country 🇱🇺🇫🇷🇧🇪 Assumption",
    leaveDays: 0,
  },
  {
    id: "gw4",
    dateRange: "Oct 31 – Nov 2",
    dates: "Fri – Sun",
    matchStrength: 78,
    tags: ["Backup but Solid", "1 Leave Day Unlock"],
    freeMembers: ["Max", "Sophie", "Anouk"],
    maybeMembers: ["Léa", "Jules", "Tiago"],
    busyMembers: [],
    explanation: "All Saints' bridge weekend. 3 confirmed, 3 checking — take Friday off to make it work. No one's busy yet.",
    holidayBoost: "All Saints' Day 🇱🇺🇧🇪",
    leaveDays: 1,
  },
];

export const luxembourgCrew: Crew = {
  id: "crew1",
  name: "Luxembourg Crew",
  members: crewMembers,
  goldenWindows,
  majorityCountry: "Luxembourg",
};

export type AvailabilityStatus = "free" | "maybe" | "busy" | "need-leave" | "unknown";

export const statusConfig: Record<AvailabilityStatus, { label: string; color: string }> = {
  free: { label: "Free", color: "bg-accent text-accent-foreground" },
  maybe: { label: "Maybe", color: "bg-primary/20 text-primary" },
  busy: { label: "Busy", color: "bg-destructive/20 text-destructive" },
  "need-leave": { label: "Need Leave", color: "bg-muted text-muted-foreground" },
  unknown: { label: "Unknown", color: "bg-muted/50 text-muted-foreground" },
};
