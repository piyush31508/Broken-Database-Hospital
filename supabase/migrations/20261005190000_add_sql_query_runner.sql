-- =============================================================================
-- SQL Debugging Game — Read-only query runner
-- =============================================================================

CREATE OR REPLACE FUNCTION public.execute_readonly_query(query_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, hospital
AS $$
DECLARE
    normalized_query TEXT;
    executable_query TEXT;
    result JSONB;
BEGIN
    -- Normalize whitespace
    executable_query := trim(query_text);

    -- Allow one normal trailing semicolon.
    IF right(executable_query, 1) = ';' THEN
        executable_query := trim(
            left(executable_query, length(executable_query) - 1)
        );
    END IF;

    normalized_query := lower(executable_query);

    -- Empty query
    IF normalized_query = '' THEN
        RAISE EXCEPTION 'Query cannot be empty';
    END IF;

    -- Only SELECT and WITH queries are allowed
    IF normalized_query !~ '^(select|with)([[:space:]]|$)' THEN
        RAISE EXCEPTION 'Only SELECT queries are allowed';
    END IF;

    -- After removing the optional trailing semicolon,
    -- any remaining semicolon means multiple statements.
    IF position(';' IN executable_query) > 0 THEN
        RAISE EXCEPTION 'Multiple SQL statements are not allowed';
    END IF;

    -- Block dangerous operations
    IF normalized_query ~ '\m(insert|update|delete|drop|alter|truncate|create|grant|revoke|copy|vacuum|refresh)\M' THEN
        RAISE EXCEPTION 'Only read-only queries are allowed';
    END IF;

    -- Prevent expensive queries
    PERFORM set_config('statement_timeout', '3000', true);

    EXECUTE format(
        'SELECT COALESCE(
            jsonb_agg(to_jsonb(q)),
            ''[]''::jsonb
        )
        FROM (
            SELECT *
            FROM (%s) AS result
            LIMIT 100
        ) AS q',
        executable_query
    )
    INTO result;

    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.execute_readonly_query(TEXT)
TO anon, authenticated, service_role;

SELECT public.execute_readonly_query(
$$
SELECT p.full_name, a.room, a.triage_level
FROM patients p
INNER JOIN admissions a ON p.id = a.patient_id
WHERE a.status = 'waiting'
  AND a.admitted_at > NOW() - INTERVAL '24 hours'
$$
);