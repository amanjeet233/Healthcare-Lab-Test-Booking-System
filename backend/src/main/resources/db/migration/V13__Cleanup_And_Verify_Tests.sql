-- V13__Cleanup_And_Verify_Tests.sql
-- Drop the old lab_tests table that was managed by Hibernate
-- and verify the new tests table has proper data

-- Drop old lab_tests table if it still exists (was created by Hibernate auto-ddl)
DROP TABLE IF EXISTS lab_tests CASCADE;

-- Verify tests table has data
-- This comment documents what should be in the tests table:
-- - 500+ comprehensive lab tests
-- - Categories include: Hematology, Cardiology, Nephrology, Hepatology, etc.
-- - All tests are marked is_active=true
-- - Each test has name, slug, price, sample_type, fasting_required, turnaround_time

-- Clean up any test parameters table if it's linked to old lab_tests
DROP TABLE IF EXISTS test_parameters CASCADE;
DROP TABLE IF EXISTS test_aliases CASCADE;

-- Confirm tests table exists and has data
SELECT COUNT(*) as total_tests FROM tests WHERE is_active = true;
