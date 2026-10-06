import type { CaseBrief } from "@/lib/types";

export const MOCK_CASES: CaseBrief[] = [
  {
    id: "case-001",
    title: "Missing Patient Records",
    department: "Emergency",
    severity: "critical",
    status: "active",
    xpReward: 250,
    estimatedMinutes: 12,
    summary:
      "The ER triage board is blank. A JOIN between patients and admissions is dropping every row — and the waiting room is filling up.",
    symptoms: [
      "Triage board returns zero rows",
      "Admissions still write successfully",
      "Nurses report phantom patient IDs",
    ],
    brokenQuery: `SELECT p.full_name, a.room, a.triage_level
FROM patients p
INNER JOIN admissions a ON p.id = a.patient_id
WHERE a.status = 'waiting'
  AND a.admitted_at > NOW() - INTERVAL '24 hours';`,
    expectedOutcome:
      "Return all waiting patients from the last 24 hours with room and triage level.",
    tablesInvolved: ["patients", "admissions"],
  },
  {
    id: "case-002",
    title: "Duplicate Prescriptions",
    department: "Pharmacy",
    severity: "high",
    status: "locked",
    xpReward: 180,
    estimatedMinutes: 10,
  
    summary:
      "Patients are receiving the same medication twice. A pharmacy query is not de-duplicating refill requests correctly.",
  
    symptoms: [
      "Same Rx ID appears multiple times",
      "Inventory depleting faster than expected",
      "Alerts firing on controlled substances",
    ],
  
    brokenQuery: `SELECT
    patient_id,
    m.medication_name,
    dosage,
    COUNT(*) AS fills
  FROM prescriptions p
  JOIN medications m
    ON p.medication_id = m.id
  WHERE filled_at >= CURRENT_DATE - 7
  GROUP BY patient_id
  HAVING COUNT(*) > 1;`,
  
    expectedOutcome:
      "Identify patients with duplicate fills of the same medication in the last 7 days.",
  
    tablesInvolved: ["prescriptions", "medications"],
  },
  {
    id: "case-003",
    title: "OR Schedule Bottleneck",
    department: "Surgery",
    severity: "critical",
    status: "locked",
    xpReward: 300,
    estimatedMinutes: 15,
  
    summary:
      "The operating room schedule is taking too long to load. Today's surgeries are being searched through thousands of historical records.",
  
    symptoms: [
      "OR schedule takes several seconds to load",
      "Database CPU spikes during morning scheduling",
      "Query scans thousands of historical surgeries",
    ],
  
    brokenQuery: `SELECT
    o.room_name,
    s.start_time,
    s.end_time,
    s.surgeon
  FROM operating_rooms o
  JOIN surgeries s
    ON o.id = s.room_id
  WHERE s.surgery_date = CURRENT_DATE
  ORDER BY s.start_time;`,
  
    expectedOutcome:
      "Improve the OR schedule query performance by creating an index that efficiently filters today's surgeries.",
  
    tablesInvolved: ["operating_rooms", "surgeries"],
  },
  {
    id: "case-004",
    title: "Lab Results Out of Order",
    department: "Pathology",
    severity: "moderate",
    status: "locked",
    xpReward: 120,
    estimatedMinutes: 8,
    summary:
      "Critical lab panels are showing older results first. Ordering and NULL handling in the results feed are broken.",
    symptoms: [
      "Stale results appear at the top",
      "NULL collected_at values sort incorrectly",
      "Physicians acting on outdated panels",
    ],
    brokenQuery: `SELECT patient_id, test_name, result_value, collected_at
FROM lab_results
WHERE status = 'final'
ORDER BY collected_at ASC
LIMIT 50;`,
    expectedOutcome:
      "Show the 50 most recent final lab results, newest first, with NULLs last.",
    tablesInvolved: ["lab_results"],
  },
];

export function getCaseById(id: string): CaseBrief | undefined {
  return MOCK_CASES.find((c) => c.id === id);
}

export function getActiveCases(): CaseBrief[] {
  return MOCK_CASES.filter((c) => c.status !== "resolved");
}
