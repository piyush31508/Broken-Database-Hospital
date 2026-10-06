export type QueryRow = Record<string, unknown>;

export type CaseValidationResult = {
  solved: boolean;
  message: string;
};

/* ============================================================
   Shared helpers
   ============================================================ */

function normalize(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function numberEquals(
  actual: unknown,
  expected: number,
): boolean {
  return Number(actual) === expected;
}

function booleanEquals(
  actual: unknown,
  expected: boolean,
): boolean {
  if (typeof actual === "boolean") {
    return actual === expected;
  }

  return normalize(actual) === String(expected);
}

function createFailure(
  message: string,
): CaseValidationResult {
  return {
    solved: false,
    message,
  };
}

function createSuccess(
  message: string,
): CaseValidationResult {
  return {
    solved: true,
    message,
  };
}

/* ============================================================
   Case 001 — Missing Patient Records
   ============================================================ */

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

/* ============================================================
   Case 002 — Duplicate Prescriptions
   ============================================================ */

const CASE_002_EXPECTED_ROWS = [
  {
    patient_id: 1,
    medication_name: "Amoxicillin",
    fills: 2,
  },
  {
    patient_id: 3,
    medication_name: "Metformin",
    fills: 2,
  },
  {
    patient_id: 5,
    medication_name: "Tramadol",
    fills: 2,
  },
  {
    patient_id: 10,
    medication_name: "Alprazolam",
    fills: 2,
  },
  {
    patient_id: 12,
    medication_name: "Amlodipine",
    fills: 2,
  },
];

/* ============================================================
   Case 003 — OR Schedule Index
   ============================================================ */

const CASE_003_EXPECTED_INDEX = {
  action: "create-index",
  case_id: "case-003",
  recorded: true,
  index_name: "idx_surgeries_date_room_start",
  columns: [
    "surgery_date",
    "room_id",
    "start_time",
  ],
};

/* ============================================================
   Case 004 — Lab Results Out of Order
   ============================================================ */

/*
 * The pathology feed must return:
 *
 * - only finalized results
 * - the 50 most recent finalized results
 * - newest collected_at first
 * - NULL collected_at values last
 *
 * There are exactly 50 finalized records in the Case 004
 * dataset:
 *
 *   45 records with collected_at
 *   5 records with collected_at = NULL
 *
 * The first 45 rows are position-sensitive because their
 * timestamps determine their newest-first ordering.
 *
 * The final 5 rows are NOT position-sensitive because SQL
 * does not guarantee the relative order of rows whose
 * collected_at values are all NULL.
 */

const CASE_004_EXPECTED_TIMESTAMPED_ROWS = [
  {
    patient_id: 1001,
    test_name: "Troponin I",
    result_value: "0.08 ng/mL",
  },
  {
    patient_id: 1002,
    test_name: "CBC - Hemoglobin",
    result_value: "13.8 g/dL",
  },
  {
    patient_id: 1003,
    test_name: "Lactate",
    result_value: "2.1 mmol/L",
  },
  {
    patient_id: 1004,
    test_name: "Potassium",
    result_value: "4.2 mmol/L",
  },
  {
    patient_id: 1005,
    test_name: "Creatinine",
    result_value: "1.1 mg/dL",
  },
  {
    patient_id: 1006,
    test_name: "Glucose",
    result_value: "108 mg/dL",
  },
  {
    patient_id: 1007,
    test_name: "WBC",
    result_value: "11.2 K/uL",
  },
  {
    patient_id: 1008,
    test_name: "Platelets",
    result_value: "242 K/uL",
  },
  {
    patient_id: 1009,
    test_name: "CRP",
    result_value: "7.4 mg/L",
  },
  {
    patient_id: 1010,
    test_name: "AST",
    result_value: "31 U/L",
  },
  {
    patient_id: 1011,
    test_name: "ALT",
    result_value: "28 U/L",
  },
  {
    patient_id: 1012,
    test_name: "Sodium",
    result_value: "139 mmol/L",
  },
  {
    patient_id: 1013,
    test_name: "TSH",
    result_value: "2.18 mIU/L",
  },
  {
    patient_id: 1014,
    test_name: "Ferritin",
    result_value: "184 ng/mL",
  },
  {
    patient_id: 1015,
    test_name: "D-Dimer",
    result_value: "0.41 mg/L FEU",
  },
  {
    patient_id: 1016,
    test_name: "INR",
    result_value: "1.1",
  },
  {
    patient_id: 1017,
    test_name: "Magnesium",
    result_value: "2.0 mg/dL",
  },
  {
    patient_id: 1018,
    test_name: "Calcium",
    result_value: "9.3 mg/dL",
  },
  {
    patient_id: 1019,
    test_name: "Albumin",
    result_value: "4.1 g/dL",
  },
  {
    patient_id: 1020,
    test_name: "Bilirubin Total",
    result_value: "0.8 mg/dL",
  },
  {
    patient_id: 1021,
    test_name: "Hemoglobin A1c",
    result_value: "6.4%",
  },
  {
    patient_id: 1022,
    test_name: "Vitamin B12",
    result_value: "412 pg/mL",
  },
  {
    patient_id: 1023,
    test_name: "Folate",
    result_value: "11.8 ng/mL",
  },
  {
    patient_id: 1024,
    test_name: "LDL Cholesterol",
    result_value: "118 mg/dL",
  },
  {
    patient_id: 1025,
    test_name: "HDL Cholesterol",
    result_value: "52 mg/dL",
  },
  {
    patient_id: 1026,
    test_name: "Triglycerides",
    result_value: "141 mg/dL",
  },
  {
    patient_id: 1027,
    test_name: "Urine Protein",
    result_value: "Negative",
  },
  {
    patient_id: 1028,
    test_name: "Urine Glucose",
    result_value: "Negative",
  },
  {
    patient_id: 1029,
    test_name: "Urine Ketones",
    result_value: "Negative",
  },
  {
    patient_id: 1030,
    test_name: "C-Reactive Protein",
    result_value: "3.1 mg/L",
  },
  {
    patient_id: 1031,
    test_name: "ESR",
    result_value: "14 mm/hr",
  },
  {
    patient_id: 1032,
    test_name: "Free T4",
    result_value: "1.2 ng/dL",
  },
  {
    patient_id: 1033,
    test_name: "Cortisol AM",
    result_value: "14.6 ug/dL",
  },
  {
    patient_id: 1034,
    test_name: "Lipase",
    result_value: "42 U/L",
  },
  {
    patient_id: 1035,
    test_name: "Amylase",
    result_value: "71 U/L",
  },
  {
    patient_id: 1036,
    test_name: "CK",
    result_value: "126 U/L",
  },
  {
    patient_id: 1037,
    test_name: "BNP",
    result_value: "88 pg/mL",
  },
  {
    patient_id: 1038,
    test_name: "Procalcitonin",
    result_value: "0.07 ng/mL",
  },
  {
    patient_id: 1039,
    test_name: "Ammonia",
    result_value: "32 umol/L",
  },
  {
    patient_id: 1040,
    test_name: "Phosphate",
    result_value: "3.7 mg/dL",
  },
  {
    patient_id: 1046,
    test_name: "Chloride",
    result_value: "103 mmol/L",
  },
  {
    patient_id: 1047,
    test_name: "Urea Nitrogen",
    result_value: "16 mg/dL",
  },
  {
    patient_id: 1048,
    test_name: "Total Protein",
    result_value: "7.1 g/dL",
  },
  {
    patient_id: 1049,
    test_name: "Alkaline Phosphatase",
    result_value: "82 U/L",
  },
  {
    patient_id: 1050,
    test_name: "Direct Bilirubin",
    result_value: "0.2 mg/dL",
  },
];

const CASE_004_EXPECTED_NULL_ROWS = [
  {
    patient_id: 1041,
    test_name: "Blood Culture",
    result_value: "No growth",
  },
  {
    patient_id: 1042,
    test_name: "Peripheral Smear",
    result_value: "Normal",
  },
  {
    patient_id: 1043,
    test_name: "Reticulocyte Count",
    result_value: "1.8%",
  },
  {
    patient_id: 1044,
    test_name: "PTT",
    result_value: "31 sec",
  },
  {
    patient_id: 1045,
    test_name: "Fibrinogen",
    result_value: "318 mg/dL",
  },
];

const CASE_004_EXPECTED_TOTAL =
  CASE_004_EXPECTED_TIMESTAMPED_ROWS.length +
  CASE_004_EXPECTED_NULL_ROWS.length;

/* ============================================================
   Row matchers
   ============================================================ */

function rowMatchesCase001(
  row: QueryRow,
  expected: (typeof CASE_001_EXPECTED_ROWS)[number],
): boolean {
  return (
    normalize(row.full_name) === normalize(expected.full_name) &&
    normalize(row.room) === normalize(expected.room) &&
    numberEquals(row.triage_level, expected.triage_level)
  );
}

function rowMatchesCase002(
  row: QueryRow,
  expected: (typeof CASE_002_EXPECTED_ROWS)[number],
): boolean {
  return (
    numberEquals(row.patient_id, expected.patient_id) &&
    normalize(row.medication_name) ===
      normalize(expected.medication_name) &&
    numberEquals(row.fills, expected.fills)
  );
}

function rowMatchesCase004(
  row: QueryRow,
  expected:
    | (typeof CASE_004_EXPECTED_TIMESTAMPED_ROWS)[number]
    | (typeof CASE_004_EXPECTED_NULL_ROWS)[number],
): boolean {
  return (
    numberEquals(row.patient_id, expected.patient_id) &&
    normalize(row.test_name) ===
      normalize(expected.test_name) &&
    normalize(row.result_value) ===
      normalize(expected.result_value)
  );
}

/* ============================================================
   Case 001 validator
   ============================================================ */

function validateCase001(
  rows: QueryRow[],
): CaseValidationResult {
  if (rows.length !== CASE_001_EXPECTED_ROWS.length) {
    return createFailure(
      `The query returned ${rows.length} rows, but the triage board should contain ${CASE_001_EXPECTED_ROWS.length} waiting patients.`,
    );
  }

  const allExpectedRowsPresent =
    CASE_001_EXPECTED_ROWS.every((expected) =>
      rows.some((row) =>
        rowMatchesCase001(row, expected),
      ),
    );

  if (!allExpectedRowsPresent) {
    return createFailure(
      "The query returned the wrong patient records. The triage board is still incomplete.",
    );
  }

  return createSuccess(
    "All 7 waiting patients were recovered. The emergency triage board is restored.",
  );
}

/* ============================================================
   Case 002 validator
   ============================================================ */

function validateCase002(
  rows: QueryRow[],
): CaseValidationResult {
  if (rows.length !== CASE_002_EXPECTED_ROWS.length) {
    return createFailure(
      `The query returned ${rows.length} duplicate groups, but the pharmacy audit should identify ${CASE_002_EXPECTED_ROWS.length}.`,
    );
  }

  const allExpectedRowsPresent =
    CASE_002_EXPECTED_ROWS.every((expected) =>
      rows.some((row) =>
        rowMatchesCase002(row, expected),
      ),
    );

  if (!allExpectedRowsPresent) {
    return createFailure(
      "The query found the wrong duplicate prescription groups. Remember that different medications for the same patient are not duplicates.",
    );
  }

  return createSuccess(
    "Duplicate prescription fills identified correctly. The pharmacy audit is restored.",
  );
}

/* ============================================================
   Case 003 validator
   ============================================================ */

function validateCase003(
  rows: QueryRow[],
): CaseValidationResult {
  if (rows.length === 0) {
    return createFailure(
      "The OR schedule index has not been created yet.",
    );
  }

  const result = rows[0];

  const actionMatches =
    normalize(result.action) ===
    normalize(CASE_003_EXPECTED_INDEX.action);

  const caseMatches =
    normalize(result.case_id) ===
    normalize(CASE_003_EXPECTED_INDEX.case_id);

  const recordedMatches = booleanEquals(
    result.recorded,
    CASE_003_EXPECTED_INDEX.recorded,
  );

  const indexNameMatches =
    normalize(result.index_name) ===
    normalize(CASE_003_EXPECTED_INDEX.index_name);

  const returnedColumns = Array.isArray(result.columns)
    ? result.columns.map((column) => normalize(column))
    : [];

  const expectedColumns =
    CASE_003_EXPECTED_INDEX.columns.map(normalize);

  const columnsMatch =
    returnedColumns.length === expectedColumns.length &&
    returnedColumns.every(
      (column, index) =>
        column === expectedColumns[index],
    );

  if (
    !actionMatches ||
    !caseMatches ||
    !recordedMatches ||
    !indexNameMatches ||
    !columnsMatch
  ) {
    return createFailure(
      "The OR schedule index was not recorded correctly. The index must target surgery_date, room_id, and start_time.",
    );
  }

  return createSuccess(
    "OR schedule index created. Today's surgeries can now be located efficiently.",
  );
}

/* ============================================================
   Case 004 validator
   ============================================================ */

function validateCase004(
  rows: QueryRow[],
): CaseValidationResult {
  /*
   * Step 1:
   * The query must return exactly 50 finalized results.
   */
  if (rows.length !== CASE_004_EXPECTED_TOTAL) {
    return createFailure(
      `The pathology feed returned ${rows.length} rows, but it should return the 50 most recent finalized lab results.`,
    );
  }

  /*
   * Step 2:
   * The first 45 rows must be the timestamped results in
   * newest-first order.
   */
  for (
    let index = 0;
    index < CASE_004_EXPECTED_TIMESTAMPED_ROWS.length;
    index++
  ) {
    const actual = rows[index];
    const expected =
      CASE_004_EXPECTED_TIMESTAMPED_ROWS[index];

    /*
     * A timestamped result must not have a NULL collection
     * time. Otherwise NULLS LAST is not being respected.
     */
    if (actual.collected_at == null) {
      return createFailure(
        "The lab results are still out of order. Results with collection times must appear before NULL collected_at values.",
      );
    }

    if (!rowMatchesCase004(actual, expected)) {
      return createFailure(
        "The lab results are still out of order. The pathology feed must show the newest finalized results first, with results missing a collection time at the bottom.",
      );
    }
  }

  /*
   * Step 3:
   * The final 5 rows must all have NULL collected_at.
   *
   * Their internal order does NOT matter because SQL does not
   * guarantee an ordering between rows whose sort key is NULL.
   */
  const nullRows = rows.slice(
    CASE_004_EXPECTED_TIMESTAMPED_ROWS.length,
  );

  const allNullCollectedAt =
    nullRows.every(
      (row) => row.collected_at == null,
    );

  if (!allNullCollectedAt) {
    return createFailure(
      "The lab results are still out of order. Results with missing collection times must appear at the bottom of the feed.",
    );
  }

  /*
   * Step 4:
   * Make sure all five expected NULL-timestamp records are
   * actually present.
   */
  const allExpectedNullRowsPresent =
    CASE_004_EXPECTED_NULL_ROWS.every((expected) =>
      nullRows.some((row) =>
        rowMatchesCase004(row, expected),
      ),
    );

  if (!allExpectedNullRowsPresent) {
    return createFailure(
      "The pathology feed contains the wrong records in the NULL collected_at section.",
    );
  }

  return createSuccess(
    "Lab results are now ordered correctly. The 50 most recent finalized results appear first, with missing collection times last.",
  );
}

/* ============================================================
   Main case validator
   ============================================================ */

export function validateCaseResult(
  caseId: string,
  rows: QueryRow[],
): CaseValidationResult {
  switch (caseId) {
    case "case-001":
      return validateCase001(rows);

    case "case-002":
      return validateCase002(rows);

    case "case-003":
      return validateCase003(rows);

    case "case-004":
      return validateCase004(rows);

    default:
      return createFailure(
        "This case does not have a result validator yet.",
      );
  }
}