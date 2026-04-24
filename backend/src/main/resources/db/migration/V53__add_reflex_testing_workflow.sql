ALTER TABLE bookings
    MODIFY COLUMN status ENUM('BOOKED','SAMPLE_COLLECTED','PROCESSING','PENDING_VERIFICATION','VERIFIED','COMPLETED','CANCELLED','REFLEX_PENDING','CONFIRMED') NOT NULL DEFAULT 'BOOKED';

ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS parent_booking_id BIGINT NULL,
    ADD CONSTRAINT fk_bookings_parent_booking FOREIGN KEY (parent_booking_id) REFERENCES bookings(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS reflex_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trigger_test_name VARCHAR(200) NOT NULL,
    trigger_condition VARCHAR(40) NOT NULL,
    trigger_value DECIMAL(14,4) NULL,
    reflex_test_name VARCHAR(200) NOT NULL,
    reflex_test_slug VARCHAR(200) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT NULL,
    INDEX idx_reflex_rule_trigger (trigger_test_name),
    INDEX idx_reflex_rule_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reflex_suggestions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    reflex_rule_id BIGINT NOT NULL,
    triggered_by VARCHAR(300) NOT NULL,
    suggested_test VARCHAR(200) NOT NULL,
    suggested_test_slug VARCHAR(200) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    auto_ordered BOOLEAN NOT NULL DEFAULT FALSE,
    reflex_booking_id BIGINT NULL,
    action_reason VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reflex_suggestions_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_reflex_suggestions_rule FOREIGN KEY (reflex_rule_id) REFERENCES reflex_rules(id) ON DELETE CASCADE,
    CONSTRAINT fk_reflex_suggestions_reflex_booking FOREIGN KEY (reflex_booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    CONSTRAINT uk_reflex_suggestion_booking_rule UNIQUE (booking_id, reflex_rule_id),
    INDEX idx_reflex_suggestion_booking (booking_id),
    INDEX idx_reflex_suggestion_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO reflex_rules (trigger_test_name, trigger_condition, trigger_value, reflex_test_name, reflex_test_slug, priority, is_active, created_by)
SELECT 'TSH', 'GREATER_THAN', 4.1700, 'Free T3', 'free-t3', 'SUGGESTED', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM reflex_rules WHERE trigger_test_name='TSH' AND reflex_test_slug='free-t3');

INSERT INTO reflex_rules (trigger_test_name, trigger_condition, trigger_value, reflex_test_name, reflex_test_slug, priority, is_active, created_by)
SELECT 'TSH', 'GREATER_THAN', 4.1700, 'Free T4', 'free-t4', 'SUGGESTED', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM reflex_rules WHERE trigger_test_name='TSH' AND reflex_test_slug='free-t4');

INSERT INTO reflex_rules (trigger_test_name, trigger_condition, trigger_value, reflex_test_name, reflex_test_slug, priority, is_active, created_by)
SELECT 'HbA1c', 'GREATER_THAN', 6.5000, 'Fasting Glucose', 'fasting-glucose', 'AUTOMATIC', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM reflex_rules WHERE trigger_test_name='HbA1c' AND reflex_test_slug='fasting-glucose');

INSERT INTO reflex_rules (trigger_test_name, trigger_condition, trigger_value, reflex_test_name, reflex_test_slug, priority, is_active, created_by)
SELECT 'HbA1c', 'GREATER_THAN', 6.5000, 'Post Prandial Glucose', 'post-prandial-glucose', 'AUTOMATIC', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM reflex_rules WHERE trigger_test_name='HbA1c' AND reflex_test_slug='post-prandial-glucose');

INSERT INTO reflex_rules (trigger_test_name, trigger_condition, trigger_value, reflex_test_name, reflex_test_slug, priority, is_active, created_by)
SELECT 'Uric Acid', 'GREATER_THAN', 7.2000, '24-hour Urine Uric Acid', '24-hour-urine-uric-acid', 'SUGGESTED', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM reflex_rules WHERE trigger_test_name='Uric Acid' AND reflex_test_slug='24-hour-urine-uric-acid');

INSERT INTO reflex_rules (trigger_test_name, trigger_condition, trigger_value, reflex_test_name, reflex_test_slug, priority, is_active, created_by)
SELECT 'Hemoglobin', 'LESS_THAN', 11.0000, 'Serum Ferritin', 'serum-ferritin', 'AUTOMATIC', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM reflex_rules WHERE trigger_test_name='Hemoglobin' AND reflex_test_slug='serum-ferritin');

INSERT INTO reflex_rules (trigger_test_name, trigger_condition, trigger_value, reflex_test_name, reflex_test_slug, priority, is_active, created_by)
SELECT 'Hemoglobin', 'LESS_THAN', 11.0000, 'Iron Studies', 'iron-studies', 'AUTOMATIC', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM reflex_rules WHERE trigger_test_name='Hemoglobin' AND reflex_test_slug='iron-studies');

INSERT INTO reflex_rules (trigger_test_name, trigger_condition, trigger_value, reflex_test_name, reflex_test_slug, priority, is_active, created_by)
SELECT 'Bilirubin Direct', 'GREATER_THAN', 0.3000, 'Hepatitis B', 'hepatitis-b', 'SUGGESTED', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM reflex_rules WHERE trigger_test_name='Bilirubin Direct' AND reflex_test_slug='hepatitis-b');

INSERT INTO reflex_rules (trigger_test_name, trigger_condition, trigger_value, reflex_test_name, reflex_test_slug, priority, is_active, created_by)
SELECT 'Bilirubin Direct', 'GREATER_THAN', 0.3000, 'Hepatitis C', 'hepatitis-c', 'SUGGESTED', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM reflex_rules WHERE trigger_test_name='Bilirubin Direct' AND reflex_test_slug='hepatitis-c');

INSERT INTO reflex_rules (trigger_test_name, trigger_condition, trigger_value, reflex_test_name, reflex_test_slug, priority, is_active, created_by)
SELECT 'Vitamin B12', 'LESS_THAN', 200.0000, 'Folate', 'folate', 'SUGGESTED', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM reflex_rules WHERE trigger_test_name='Vitamin B12' AND reflex_test_slug='folate');

INSERT INTO reflex_rules (trigger_test_name, trigger_condition, trigger_value, reflex_test_name, reflex_test_slug, priority, is_active, created_by)
SELECT 'Vitamin B12', 'LESS_THAN', 200.0000, 'MMA', 'methylmalonic-acid', 'SUGGESTED', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM reflex_rules WHERE trigger_test_name='Vitamin B12' AND reflex_test_slug='methylmalonic-acid');

INSERT INTO reflex_rules (trigger_test_name, trigger_condition, trigger_value, reflex_test_name, reflex_test_slug, priority, is_active, created_by)
SELECT 'Creatinine', 'GREATER_THAN', 1.3000, 'eGFR calculated', 'egfr', 'SUGGESTED', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM reflex_rules WHERE trigger_test_name='Creatinine' AND reflex_test_slug='egfr');

INSERT INTO reflex_rules (trigger_test_name, trigger_condition, trigger_value, reflex_test_name, reflex_test_slug, priority, is_active, created_by)
SELECT 'Creatinine', 'GREATER_THAN', 1.3000, 'Cystatin C', 'cystatin-c', 'SUGGESTED', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM reflex_rules WHERE trigger_test_name='Creatinine' AND reflex_test_slug='cystatin-c');

INSERT INTO reflex_rules (trigger_test_name, trigger_condition, trigger_value, reflex_test_name, reflex_test_slug, priority, is_active, created_by)
SELECT 'PSA', 'GREATER_THAN', 4.0000, 'Free PSA', 'free-psa', 'AUTOMATIC', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM reflex_rules WHERE trigger_test_name='PSA' AND reflex_test_slug='free-psa');

INSERT INTO reflex_rules (trigger_test_name, trigger_condition, trigger_value, reflex_test_name, reflex_test_slug, priority, is_active, created_by)
SELECT 'PSA', 'GREATER_THAN', 4.0000, 'PSA Ratio', 'psa-ratio', 'AUTOMATIC', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM reflex_rules WHERE trigger_test_name='PSA' AND reflex_test_slug='psa-ratio');

INSERT INTO reflex_rules (trigger_test_name, trigger_condition, trigger_value, reflex_test_name, reflex_test_slug, priority, is_active, created_by)
SELECT 'Platelet', 'LESS_THAN', 100.0000, 'Peripheral Blood Smear', 'peripheral-blood-smear', 'AUTOMATIC', TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM reflex_rules WHERE trigger_test_name='Platelet' AND reflex_test_slug='peripheral-blood-smear');
