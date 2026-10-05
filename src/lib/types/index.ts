export type CaseSeverity = "critical" | "high" | "moderate" | "low";
export type CaseStatus = "active" | "diagnosing" | "resolved" | "locked";
export type HospitalSystemStatus = "critical" | "unstable" | "stable";
export type PlayerRank =
  | "Intern"
  | "Resident"
  | "Attending"
  | "Chief of Data"
  | "Database Surgeon";

export interface PlayerStats {
  id: string;
  displayName: string;
  xp: number;
  xpToNextRank: number;
  rank: PlayerRank;
  casesSolved: number;
  streak: number;
}

export interface HospitalStatus {
  status: HospitalSystemStatus;
  uptimePercent: number;
  activeIncidents: number;
  patientsWaiting: number;
}

export interface CaseBrief {
  id: string;
  title: string;
  department: string;
  severity: CaseSeverity;
  status: CaseStatus;
  xpReward: number;
  estimatedMinutes: number;
  summary: string;
  symptoms: string[];
  brokenQuery: string;
  expectedOutcome: string;
  tablesInvolved: string[];
}
