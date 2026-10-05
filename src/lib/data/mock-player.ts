import type { HospitalStatus, PlayerStats } from "@/lib/types";

export const MOCK_PLAYER: PlayerStats = {
  id: "player-001",
  displayName: "Dr. Query",
  xp: 1240,
  xpToNextRank: 2000,
  rank: "Resident",
  casesSolved: 7,
  streak: 3,
};

export const MOCK_HOSPITAL: HospitalStatus = {
  status: "critical",
  uptimePercent: 61.4,
  activeIncidents: 4,
  patientsWaiting: 23,
};
