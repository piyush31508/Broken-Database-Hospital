import type { HospitalStatus } from "@/lib/types";

export const MOCK_HOSPITAL: HospitalStatus = {
  status: "critical",
  uptimePercent: 61.4,
  activeIncidents: 4,
  patientsWaiting: 23,
};
