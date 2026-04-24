ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS report_available BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE bookings
SET report_available = FALSE
WHERE report_available IS NULL;

ALTER TABLE reports
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP NULL;
