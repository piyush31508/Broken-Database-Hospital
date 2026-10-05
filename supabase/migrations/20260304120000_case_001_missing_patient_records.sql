-- =============================================================================
-- Case 001: Missing Patient Records
-- Broken Database Hospital — Emergency triage board
-- =============================================================================
--
-- Bug setup:
--   The intake form writes admissions.patient_id as the patient's MRN (e.g. 90041)
--   instead of patients.id (e.g. 3). Older discharged rows used the correct id.
--
-- Broken query (returns 0 rows for the waiting board):
--   INNER JOIN admissions a ON p.id = a.patient_id
--   WHERE a.status = 'waiting'
--     AND a.admitted_at > NOW() - INTERVAL '24 hours'
--
-- Intended fix (do not spoil for players in the UI):
--   INNER JOIN admissions a ON p.mrn = a.patient_id
--
-- No foreign key on admissions.patient_id — that is intentional so "phantom"
-- MRN values can be written and admissions still succeed.
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS hospital;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hospital.patients (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  mrn           BIGINT NOT NULL UNIQUE,
  full_name     TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  sex           TEXT CHECK (sex IN ('F', 'M', 'X')),
  blood_type    TEXT,
  phone         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hospital.admissions (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_id      BIGINT NOT NULL, -- should be patients.id; currently often stores MRN
  room            TEXT,
  triage_level    SMALLINT NOT NULL CHECK (triage_level BETWEEN 1 AND 5),
  status          TEXT NOT NULL CHECK (status IN ('waiting', 'admitted', 'discharged', 'left_ama')),
  chief_complaint TEXT,
  department      TEXT NOT NULL DEFAULT 'Emergency',
  admitted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  discharged_at   TIMESTAMPTZ,
  notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_admissions_status_admitted_at
  ON hospital.admissions (status, admitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_admissions_patient_id
  ON hospital.admissions (patient_id);

CREATE INDEX IF NOT EXISTS idx_patients_mrn
  ON hospital.patients (mrn);

-- Convenience views in public so queries can use bare table names
-- (matches the case brief: FROM patients / JOIN admissions)
CREATE OR REPLACE VIEW public.patients AS
  SELECT * FROM hospital.patients;

CREATE OR REPLACE VIEW public.admissions AS
  SELECT * FROM hospital.admissions;

GRANT USAGE ON SCHEMA hospital TO anon, authenticated, service_role;
GRANT SELECT ON hospital.patients, hospital.admissions TO anon, authenticated, service_role;
GRANT SELECT ON public.patients, public.admissions TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Seed: patients
-- ---------------------------------------------------------------------------

TRUNCATE hospital.admissions RESTART IDENTITY CASCADE;
TRUNCATE hospital.patients RESTART IDENTITY CASCADE;

INSERT INTO hospital.patients (mrn, full_name, date_of_birth, sex, blood_type, phone) VALUES
  (90041, 'Amara Okonkwo',     '1988-03-14', 'F', 'O+',  '+1-555-0101'),
  (90042, 'James Whitfield',   '1972-11-02', 'M', 'A-',  '+1-555-0102'),
  (90043, 'Priya Natarajan',   '1995-07-21', 'F', 'B+',  '+1-555-0103'),
  (90044, 'Diego Morales',     '2001-01-09', 'M', 'AB+', '+1-555-0104'),
  (90045, 'Helen Cho',         '1959-05-30', 'F', 'O-',  '+1-555-0105'),
  (90046, 'Marcus Ellery',     '1983-12-18', 'M', 'A+',  '+1-555-0106'),
  (90047, 'Sofia Almeida',     '1990-08-05', 'F', 'B-',  '+1-555-0107'),
  (90048, 'Noah Bergström',    '2014-04-12', 'M', 'O+',  '+1-555-0108'),
  (90049, 'Fatima Al-Rashid',  '1978-09-27', 'F', 'A+',  '+1-555-0109'),
  (90050, 'Owen Cartwright',   '1966-02-14', 'M', 'AB-', '+1-555-0110'),
  (90051, 'Yuki Tanaka',       '1999-10-03', 'X', 'O+',  '+1-555-0111'),
  (90052, 'Elena Vasquez',     '1985-06-22', 'F', 'B+',  '+1-555-0112');

-- ---------------------------------------------------------------------------
-- Seed: admissions
--
-- Historical rows: patient_id correctly stores patients.id (1–12).
-- Live ER waiting rows (last ~18 hours): patient_id incorrectly stores MRN
-- (90041–...). Those are the ones the broken INNER JOIN drops entirely.
-- ---------------------------------------------------------------------------

-- Older discharged / admitted rows with CORRECT patients.id references
INSERT INTO hospital.admissions
  (patient_id, room, triage_level, status, chief_complaint, department, admitted_at, discharged_at, notes)
VALUES
  (1,  'ER-A2', 3, 'discharged', 'Ankle sprain',            'Emergency', NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days' + INTERVAL '3 hours', 'Correct patient_id (id)'),
  (3,  'ER-B1', 2, 'discharged', 'Migraine',                'Emergency', NOW() - INTERVAL '3 days',  NOW() - INTERVAL '3 days' + INTERVAL '4 hours', 'Correct patient_id (id)'),
  (5,  'Ward-4', 4, 'discharged', 'Chest discomfort',       'Emergency', NOW() - INTERVAL '2 days',  NOW() - INTERVAL '1 day',                       'Correct patient_id (id)'),
  (7,  'ER-C3', 3, 'admitted',   'Asthma exacerbation',     'Emergency', NOW() - INTERVAL '36 hours', NULL,                                          'Correct patient_id (id); already bedded'),
  (10, 'OR-2',  2, 'admitted',   'Appendicitis',            'Surgery',   NOW() - INTERVAL '30 hours', NULL,                                          'Correct patient_id (id)');

-- BROKEN intake rows: waiting patients from the last 24 hours.
-- patient_id was filled with MRN instead of patients.id.
INSERT INTO hospital.admissions
  (patient_id, room, triage_level, status, chief_complaint, department, admitted_at, discharged_at, notes)
VALUES
  (90041, 'Triage-1', 2, 'waiting', 'Shortness of breath',     'Emergency', NOW() - INTERVAL '45 minutes',  NULL, 'BUG: patient_id is MRN 90041, not id 1'),
  (90043, 'Triage-2', 3, 'waiting', 'High fever, 39.4°C',      'Emergency', NOW() - INTERVAL '2 hours',     NULL, 'BUG: patient_id is MRN 90043, not id 3'),
  (90044, 'Triage-3', 1, 'waiting', 'Severe abdominal pain',   'Emergency', NOW() - INTERVAL '20 minutes',  NULL, 'BUG: patient_id is MRN 90044, not id 4'),
  (90045, 'Triage-4', 2, 'waiting', 'Syncope / fall at home',  'Emergency', NOW() - INTERVAL '3 hours',     NULL, 'BUG: patient_id is MRN 90045, not id 5'),
  (90048, 'Triage-5', 3, 'waiting', 'Pediatric wheezing',      'Emergency', NOW() - INTERVAL '70 minutes',  NULL, 'BUG: patient_id is MRN 90048, not id 8'),
  (90051, 'Triage-6', 4, 'waiting', 'Laceration, left forearm','Emergency', NOW() - INTERVAL '5 hours',     NULL, 'BUG: patient_id is MRN 90051, not id 11'),
  (90052, 'Hall-A',   2, 'waiting', 'Suspected fracture',      'Emergency', NOW() - INTERVAL '90 minutes',  NULL, 'BUG: patient_id is MRN 90052, not id 12');

-- One waiting row older than 24h (should stay excluded by the time filter)
INSERT INTO hospital.admissions
  (patient_id, room, triage_level, status, chief_complaint, department, admitted_at, notes)
VALUES
  (90046, 'Overflow', 3, 'waiting', 'Back pain (overnight hold)', 'Emergency', NOW() - INTERVAL '29 hours',
   'BUG: also uses MRN, but outside 24h window');

-- ---------------------------------------------------------------------------
-- Sanity checks (optional — run after applying)
-- ---------------------------------------------------------------------------
-- Broken board query → 0 rows:
--   SELECT p.full_name, a.room, a.triage_level
--   FROM patients p
--   INNER JOIN admissions a ON p.id = a.patient_id
--   WHERE a.status = 'waiting'
--     AND a.admitted_at > NOW() - INTERVAL '24 hours';
--
-- Fixed join → 7 waiting patients:
--   SELECT p.full_name, a.room, a.triage_level
--   FROM patients p
--   INNER JOIN admissions a ON p.mrn = a.patient_id
--   WHERE a.status = 'waiting'
--     AND a.admitted_at > NOW() - INTERVAL '24 hours';
