export type QueryRow = Record<string, unknown>;

export type CaseValidationResult = {
  solved: boolean;
  message: string;
};

function normalize(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

/**
 * Case 001 — Missing Patient Records
 *
 * A correct solution must return the 7 waiting patients
 * from the last 24 hours with:
 *
 * - full_name
 * - room
 * - triage_level
 *
 * We validate the result rather than comparing SQL strings,
 * because multiple SQL queries can legitimately solve the case.
 */
const CASE_001_EXPECTED_ROWS = [
  {
    full_name: "Amara Okonkwo",
    room: "Triage-1",
    triage_level: 2,
  },
  {
    full_name: "Priya Natarajan",
    room: "Triage-2",
    triage_level: 3,
  },
  {
    full_name: "Diego Morales",
    room: "Triage-3",
    triage_level: 1,
  },
  {
    full_name: "Helen Cho",
    room: "Triage-4",
    triage_level: 2,
  },
  {
    full_name: "Noah Bergström",
    room: "Triage-5",
    triage_level: 3,
  },
  {
    full_name: "Yuki Tanaka",
    room: "Triage-6",
    triage_level: 4,
  },
  {
    full_name: "Elena Vasquez",
    room: "Hall-A",
    triage_level: 2,
  },
];

function rowMatchesExpected(
  row: QueryRow,
  expected: (typeof CASE_001_EXPECTED_ROWS)[number],
): boolean {
  return (
    normalize(row.full_name) === normalize(expected.full_name) &&
    normalize(row.room) === normalize(expected.room) &&
    Number(row.triage_level) === expected.triage_level
  );
}

function validateCase001(rows: QueryRow[]): CaseValidationResult {
  if (rows.length !== CASE_001_EXPECTED_ROWS.length) {
    return {
      solved: false,
      message: `The query returned ${rows.length} rows, but the triage board should contain ${CASE_001_EXPECTED_ROWS.length} waiting patients.`,
    };
  }

  const allExpectedRowsPresent = CASE_001_EXPECTED_ROWS.every(
    (expected) =>
      rows.some((row) => rowMatchesExpected(row, expected)),
  );

  if (!allExpectedRowsPresent) {
    return {
      solved: false,
      message:
        "The query returned the wrong patient records. The triage board is still incomplete.",
    };
  }

  return {
    solved: true,
    message:
      "All 7 waiting patients were recovered. The emergency triage board is restored.",
  };
}

export function validateCaseResult(
  caseId: string,
  rows: QueryRow[],
): CaseValidationResult {
  switch (caseId) {
    case "case-001":
      return validateCase001(rows);

    default:
      return {
        solved: false,
        message:
          "This case does not have a result validator yet.",
      };
  }
}