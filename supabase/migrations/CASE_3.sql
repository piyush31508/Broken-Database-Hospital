-- =============================================================================
-- Case 003: OR Schedule Bottleneck
-- Broken Database Hospital — Surgery
-- =============================================================================
--
-- Bug:
--   The OR schedule query is logically correct but becomes slow because
--   surgeries.surgery_date is not indexed.
--
--   The database contains a large amount of historical surgery data.
--   The application frequently asks for:
--
--       WHERE surgery_date = CURRENT_DATE
--
--   Without an appropriate index PostgreSQL may scan the entire table.
--
-- Intended fix:
--
--   CREATE INDEX idx_surgeries_date_room_start
--   ON hospital.surgeries (surgery_date, room_id, start_time);
--
-- =============================================================================


-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hospital.operating_rooms (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_name     TEXT NOT NULL UNIQUE,
  floor         INTEGER NOT NULL,
  specialty     TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'available'
                CHECK (status IN ('available', 'occupied', 'maintenance')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS hospital.surgeries (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id         BIGINT NOT NULL,
  patient_id      BIGINT,
  surgery_date    DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  surgeon         TEXT NOT NULL,
  procedure_name  TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'scheduled'
                  CHECK (
                    status IN (
                      'scheduled',
                      'in_progress',
                      'completed',
                      'cancelled'
                    )
                  ),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT surgeries_time_check
    CHECK (end_time > start_time)
);


-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
--
-- IMPORTANT:
-- Do NOT create the performance index here.
--
-- The missing index is the actual bug the player needs to discover.
--
-- PostgreSQL already has indexes for:
--   operating_rooms.id       -> PRIMARY KEY
--   surgeries.id             -> PRIMARY KEY
--
-- But there is intentionally NO index on surgery_date.
-- ---------------------------------------------------------------------------


-- ---------------------------------------------------------------------------
-- Public views
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.operating_rooms AS
  SELECT * FROM hospital.operating_rooms;

CREATE OR REPLACE VIEW public.surgeries AS
  SELECT * FROM hospital.surgeries;


GRANT SELECT ON hospital.operating_rooms,
               hospital.surgeries
TO anon, authenticated, service_role;

GRANT SELECT ON public.operating_rooms,
               public.surgeries
TO anon, authenticated, service_role;


-- ---------------------------------------------------------------------------
-- Seed operating rooms
-- ---------------------------------------------------------------------------

TRUNCATE hospital.surgeries RESTART IDENTITY CASCADE;
TRUNCATE hospital.operating_rooms RESTART IDENTITY CASCADE;


INSERT INTO hospital.operating_rooms
  (room_name, floor, specialty, status)
VALUES
  ('OR-1', 1, 'General Surgery', 'available'),
  ('OR-2', 1, 'Orthopedics', 'available'),
  ('OR-3', 1, 'General Surgery', 'occupied'),
  ('OR-4', 2, 'Cardiothoracic', 'available'),
  ('OR-5', 2, 'Neurosurgery', 'available'),
  ('OR-6', 2, 'Ophthalmology', 'available'),
  ('OR-7', 3, 'ENT', 'available'),
  ('OR-8', 3, 'General Surgery', 'available');


-- ---------------------------------------------------------------------------
-- Historical surgery data
-- ---------------------------------------------------------------------------
--
-- Generate a large historical dataset.
--
-- The purpose is to make the table substantially larger than today's
-- schedule so that the missing index becomes meaningful.
--
-- We intentionally generate approximately 50,000 historical rows.
-- ---------------------------------------------------------------------------

INSERT INTO hospital.surgeries
  (
    room_id,
    patient_id,
    surgery_date,
    start_time,
    end_time,
    surgeon,
    procedure_name,
    status
  )
SELECT
  ((gs % 8) + 1)::BIGINT AS room_id,

  ((gs % 12) + 1)::BIGINT AS patient_id,

  CURRENT_DATE
    - ((gs % 365) + 1)::INTEGER AS surgery_date,

  (
    TIME '07:00'
    + ((gs % 12) * INTERVAL '45 minutes')
  )::TIME AS start_time,

  (
    TIME '07:45'
    + ((gs % 12) * INTERVAL '45 minutes')
  )::TIME AS end_time,

  CASE (gs % 8)
    WHEN 0 THEN 'Dr. Sarah Mitchell'
    WHEN 1 THEN 'Dr. James Carter'
    WHEN 2 THEN 'Dr. Priya Shah'
    WHEN 3 THEN 'Dr. Michael Chen'
    WHEN 4 THEN 'Dr. Elena Rodriguez'
    WHEN 5 THEN 'Dr. Daniel Wilson'
    WHEN 6 THEN 'Dr. Aisha Khan'
    ELSE 'Dr. Robert Hayes'
  END AS surgeon,

  CASE (gs % 8)
    WHEN 0 THEN 'Appendectomy'
    WHEN 1 THEN 'Knee Arthroscopy'
    WHEN 2 THEN 'Gallbladder Removal'
    WHEN 3 THEN 'Hernia Repair'
    WHEN 4 THEN 'Cataract Surgery'
    WHEN 5 THEN 'Spinal Decompression'
    WHEN 6 THEN 'Tonsillectomy'
    ELSE 'Colon Resection'
  END AS procedure_name,

  'completed' AS status

FROM generate_series(1, 50000) AS gs;


-- ---------------------------------------------------------------------------
-- Today's OR schedule
-- ---------------------------------------------------------------------------
--
-- Only a handful of records are from today.
--
-- These are the rows the application needs to retrieve quickly.
-- ---------------------------------------------------------------------------

INSERT INTO hospital.surgeries
  (
    room_id,
    patient_id,
    surgery_date,
    start_time,
    end_time,
    surgeon,
    procedure_name,
    status
  )
VALUES

  (
    1,
    1,
    CURRENT_DATE,
    '08:00',
    '09:00',
    'Dr. Sarah Mitchell',
    'Appendectomy',
    'scheduled'
  ),

  (
    2,
    2,
    CURRENT_DATE,
    '08:30',
    '10:00',
    'Dr. James Carter',
    'Knee Arthroscopy',
    'scheduled'
  ),

  (
    3,
    3,
    CURRENT_DATE,
    '09:00',
    '10:30',
    'Dr. Priya Shah',
    'Gallbladder Removal',
    'scheduled'
  ),

  (
    4,
    4,
    CURRENT_DATE,
    '10:00',
    '11:30',
    'Dr. Michael Chen',
    'Hernia Repair',
    'scheduled'
  ),

  (
    5,
    5,
    CURRENT_DATE,
    '11:00',
    '12:30',
    'Dr. Elena Rodriguez',
    'Cataract Surgery',
    'scheduled'
  ),

  (
    6,
    6,
    CURRENT_DATE,
    '13:00',
    '14:30',
    'Dr. Daniel Wilson',
    'Spinal Decompression',
    'scheduled'
  ),

  (
    7,
    7,
    CURRENT_DATE,
    '14:00',
    '15:00',
    'Dr. Aisha Khan',
    'Tonsillectomy',
    'scheduled'
  ),

  (
    8,
    8,
    CURRENT_DATE,
    '15:00',
    '16:30',
    'Dr. Robert Hayes',
    'Colon Resection',
    'scheduled'
  );


-- =============================================================================
-- Sanity checks
-- =============================================================================


-- ---------------------------------------------------------------------------
-- Check total surgery count
-- ---------------------------------------------------------------------------

-- SELECT COUNT(*) FROM surgeries;


-- ---------------------------------------------------------------------------
-- Check today's schedule
-- ---------------------------------------------------------------------------

-- SELECT
--   o.room_name,
--   s.surgery_date,
--   s.start_time,
--   s.end_time,
--   s.surgeon,
--   s.procedure_name
-- FROM surgeries s
-- JOIN operating_rooms o
--   ON o.id = s.room_id
-- WHERE s.surgery_date = CURRENT_DATE
-- ORDER BY s.start_time;


-- ---------------------------------------------------------------------------
-- IMPORTANT: inspect the query plan
-- ---------------------------------------------------------------------------
--
-- Run:
--
-- EXPLAIN ANALYZE
-- SELECT
--   o.room_name,
--   s.start_time,
--   s.end_time,
--   s.surgeon
-- FROM operating_rooms o
-- JOIN surgeries s
--   ON o.id = s.room_id
-- WHERE s.surgery_date = CURRENT_DATE
-- ORDER BY s.start_time;
--
-- Before the fix, PostgreSQL should have no date index available.
--
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_case_003_index()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hospital
AS $$
BEGIN
  CREATE INDEX IF NOT EXISTS idx_surgeries_date_room_start
  ON hospital.surgeries (surgery_date, room_id, start_time);
END;
$$;

GRANT EXECUTE
ON FUNCTION public.create_case_003_index()
TO service_role;

CREATE OR REPLACE FUNCTION public.check_case_003_index()
RETURNS TABLE (
  index_name TEXT,
  index_definition TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, hospital
AS $$
  SELECT
    indexname::TEXT,
    indexdef::TEXT
  FROM pg_indexes
  WHERE schemaname = 'hospital'
    AND tablename = 'surgeries'
    AND indexname = 'idx_surgeries_date_room_start';
$$;

GRANT EXECUTE
ON FUNCTION public.check_case_003_index()
TO service_role;

CREATE OR REPLACE FUNCTION public.create_case_003_index()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hospital
AS $$
BEGIN
  CREATE INDEX IF NOT EXISTS idx_surgeries_date_room_start
  ON hospital.surgeries (surgery_date, room_id, start_time);
END;
$$;

GRANT EXECUTE
ON FUNCTION public.create_case_003_index()
TO service_role;

CREATE OR REPLACE FUNCTION public.check_case_003_index()
RETURNS TABLE (
  index_name TEXT,
  index_definition TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, hospital
AS $$
  SELECT
    indexname::TEXT,
    indexdef::TEXT
  FROM pg_indexes
  WHERE schemaname = 'hospital'
    AND tablename = 'surgeries'
    AND indexname = 'idx_surgeries_date_room_start';
$$;

GRANT EXECUTE
ON FUNCTION public.check_case_003_index()
TO service_role;