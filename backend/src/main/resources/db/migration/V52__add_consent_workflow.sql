ALTER TABLE tests
    ADD COLUMN IF NOT EXISTS consent_required BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE tests
SET consent_required = TRUE
WHERE LOWER(COALESCE(category, '')) LIKE '%hiv%'
   OR LOWER(COALESCE(category, '')) LIKE '%genetic%'
   OR LOWER(COALESCE(category, '')) LIKE '%sti%'
   OR LOWER(COALESCE(category, '')) LIKE '%std%'
   OR LOWER(COALESCE(category, '')) LIKE '%drug%'
   OR LOWER(COALESCE(category, '')) LIKE '%cancer%'
   OR LOWER(COALESCE(name, '')) LIKE '%hiv%'
   OR LOWER(COALESCE(name, '')) LIKE '%genetic%'
   OR LOWER(COALESCE(name, '')) LIKE '%sti%'
   OR LOWER(COALESCE(name, '')) LIKE '%std%'
   OR LOWER(COALESCE(name, '')) LIKE '%drug monitoring%'
   OR LOWER(COALESCE(name, '')) LIKE '%cancer marker%';

CREATE TABLE IF NOT EXISTS consent_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    test_name VARCHAR(200) NOT NULL,
    consent_type VARCHAR(40) NOT NULL,
    consent_given BOOLEAN NOT NULL,
    consent_timestamp TIMESTAMP NOT NULL,
    collector_id BIGINT NOT NULL,
    ip_address VARCHAR(80),
    device_info VARCHAR(500),
    patient_signature_hash VARCHAR(128) NOT NULL,

    CONSTRAINT fk_consent_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_consent_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_consent_collector FOREIGN KEY (collector_id) REFERENCES users(id) ON DELETE RESTRICT,

    INDEX idx_consent_booking (booking_id),
    INDEX idx_consent_patient (patient_id),
    INDEX idx_consent_collector (collector_id),
    INDEX idx_consent_timestamp (consent_timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
