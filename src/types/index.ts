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

export type AvailabilityStatus = "free" | "maybe" | "busy" | "need-leave" | "unknown";

export const statusConfig: Record<AvailabilityStatus, { label: string; color: string }> = {
  free: { label: "Free", color: "bg-accent text-accent-foreground" },
  maybe: { label: "Maybe", color: "bg-primary/20 text-primary" },
  busy: { label: "Busy", color: "bg-destructive/20 text-destructive" },
  "need-leave": { label: "Need Leave", color: "bg-muted text-muted-foreground" },
  unknown: { label: "Unknown", color: "bg-muted/50 text-muted-foreground" },
};
