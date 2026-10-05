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
    status: "diagnosing",
    xpReward: 180,
    estimatedMinutes: 10,
    summary:
      "Patients are receiving the same medication twice. A pharmacy query is not de-duplicating refill requests correctly.",
    symptoms: [
      "Same Rx ID appears multiple times",
      "Inventory depleting faster than expected",
      "Alerts firing on controlled substances",
    ],
    brokenQuery: `SELECT patient_id, medication, dosage, COUNT(*) as fills
FROM prescriptions
WHERE filled_at >= CURRENT_DATE - 7
GROUP BY patient_id
HAVING COUNT(*) > 1;`,
    expectedOutcome:
      "Identify patients with duplicate fills of the same medication in the last 7 days.",
    tablesInvolved: ["prescriptions", "medications"],
  },
  {
    id: "case-003",
    title: "OR Schedule Collision",
    department: "Surgery",
    severity: "critical",
    status: "active",
    xpReward: 300,
    estimatedMinutes: 15,
    summary:
      "Two surgeries are booked for the same operating room at the same time. The availability check query is lying.",
    symptoms: [
      "Double-booked OR-3 at 09:00",
      "Conflict detector returns false negatives",
      "Surgeons arriving to occupied rooms",
    ],
    brokenQuery: `SELECT o.room_name, s.start_time, s.end_time, s.surgeon
FROM operating_rooms o
LEFT JOIN surgeries s ON o.id = s.room_id
WHERE s.start_time = '09:00:00'
  AND s.date = CURRENT_DATE;`,
    expectedOutcome:
      "Detect overlapping surgery windows for each operating room today.",
    tablesInvolved: ["operating_rooms", "surgeries"],
  },
  {
    id: "case-004",
    title: "Lab Results Out of Order",
    department: "Pathology",
    severity: "moderate",
    status: "active",
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
  {
    id: "case-005",
    title: "Billing Code Mismatch",
    department: "Finance",
    severity: "low",
    status: "locked",
    xpReward: 90,
    estimatedMinutes: 6,
    summary:
      "Insurance claims are rejecting procedure codes that do not match the visit diagnosis. Unlock after resolving two critical cases.",
    symptoms: [
      "Claim rejection rate spiked 40%",
      "ICD-10 / CPT pairs misaligned",
      "Revenue cycle stalled for elective visits",
    ],
    brokenQuery: `SELECT v.visit_id, v.diagnosis_code, b.procedure_code
FROM visits v
JOIN billing b ON v.visit_id = b.visit_id
WHERE b.claim_status = 'rejected';`,
    expectedOutcome:
      "List rejected claims where diagnosis and procedure codes violate the mapping table.",
    tablesInvolved: ["visits", "billing", "code_mappings"],
  },
  {
    id: "case-006",
    title: "Nurse Shift Overlap",
    department: "Staffing",
    severity: "moderate",
    status: "resolved",
    xpReward: 140,
    estimatedMinutes: 9,
    summary:
      "Resolved: overlapping nurse shifts on Ward B were caused by an exclusive BETWEEN that missed boundary collisions.",
    symptoms: [
      "Double coverage on Ward B nights",
      "Payroll overtime anomalies",
      "Roster view missing edge cases",
    ],
    brokenQuery: `SELECT n.name, s.ward, s.shift_start, s.shift_end
FROM nurses n
JOIN shifts s ON n.id = s.nurse_id
WHERE s.shift_start BETWEEN '19:00' AND '07:00';`,
    expectedOutcome:
      "Find nurses with overlapping shifts on the same ward within a 24-hour window.",
    tablesInvolved: ["nurses", "shifts"],
  },
];

export function getCaseById(id: string): CaseBrief | undefined {
  return MOCK_CASES.find((c) => c.id === id);
}

export function getActiveCases(): CaseBrief[] {
  return MOCK_CASES.filter((c) => c.status !== "resolved");
}
