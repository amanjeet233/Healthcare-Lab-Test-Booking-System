-- ===================================================================
-- Healthcare Lab Test Booking System - Database Schema
-- MySQL 8.x
-- ===================================================================

-- IMPORTANT
-- This file is executed by Spring Boot against the database specified in
-- `spring.datasource.url`.
-- Do NOT change the active database here (no `CREATE DATABASE` / `USE`), or you
-- can end up creating tables in a different schema than the application uses.
--
-- Previous (kept for reference):
--   CREATE DATABASE IF NOT EXISTS healthcare_lab_db;
--   USE healthcare_lab_db;

-- ===================================================================
-- 1. USERS
-- ===================================================================
CREATE TABLE IF NOT EXISTS users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(100)    NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    role            ENUM('PATIENT','TECHNICIAN','MEDICAL_OFFICER','ADMIN') NOT NULL DEFAULT 'PATIENT',
    phone           VARCHAR(15)     UNIQUE,
    address         TEXT,
    date_of_birth   DATE,
    gender          ENUM('MALE','FEMALE','OTHER'),
    blood_group     VARCHAR(5),
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    is_verified     BOOLEAN         NOT NULL DEFAULT FALSE,
    reset_password_token        VARCHAR(500),
    reset_password_token_expiry TIMESTAMP       NULL,
    verification_token          VARCHAR(500),
    verification_token_expiry   TIMESTAMP       NULL,
    last_login_at   TIMESTAMP       NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_role (role),
    INDEX idx_users_email (email),
    INDEX idx_users_is_active (is_active),
    INDEX idx_users_verification_token (verification_token(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================================
-- 2. TEST CATEGORIES
-- ===================================================================
CREATE TABLE IF NOT EXISTS test_categories (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name   VARCHAR(100)    NOT NULL UNIQUE,
    description     TEXT,
    display_order   INT             DEFAULT 0,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================================
-- 2B. LAB TESTS (Enhanced)
-- ===================================================================
CREATE TABLE IF NOT EXISTS lab_tests (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    test_code           VARCHAR(50)     UNIQUE,
    test_name           VARCHAR(150)    NOT NULL,
    test_type           VARCHAR(50),
    category            VARCHAR(100),
    category_id         BIGINT,
    description         TEXT,
    methodology         VARCHAR(100),
    unit                VARCHAR(30),
    price               DECIMAL(10,2)   NOT NULL,
    preparation_notes   TEXT,
    
    -- Reference ranges
    normal_range_min    DECIMAL(12,4),
    normal_range_max    DECIMAL(12,4),
    critical_low        DECIMAL(12,4),
    critical_high       DECIMAL(12,4),
    normal_range_text   TEXT,
    pediatric_range     TEXT,
    male_range          TEXT,
    female_range        TEXT,
    
    -- Test characteristics
    fasting_required    BOOLEAN         NOT NULL DEFAULT FALSE,
    fasting_hours       INT,
    report_time_hours   INT,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_lab_tests_category FOREIGN KEY (category_id) REFERENCES test_categories(id) ON DELETE SET NULL,
    INDEX idx_lab_tests_category (category),
    INDEX idx_lab_tests_test_code (test_code),
    INDEX idx_lab_tests_test_type (test_type),
    INDEX idx_lab_tests_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================================
-- 3. LAB PARTNERS
-- ===================================================================
CREATE TABLE IF NOT EXISTS lab_partners (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    lab_name          VARCHAR(200)    NOT NULL,
    accreditation     VARCHAR(100),
    rating            DECIMAL(3,2),
    home_collection   BOOLEAN         NOT NULL DEFAULT FALSE,
    address           TEXT,
    city              VARCHAR(100),
    contact           VARCHAR(15),

    INDEX idx_lab_partners_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================================
-- 4. LAB TEST PRICING  (per lab partner)
-- ===================================================================
CREATE TABLE IF NOT EXISTS lab_test_pricing (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    lab_partner_id    BIGINT          NOT NULL,
    test_id           BIGINT          NOT NULL,
    price             DECIMAL(10,2)   NOT NULL,
    report_time_hours INT,
    is_active         BOOLEAN         NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_pricing_lab_partner FOREIGN KEY (lab_partner_id) REFERENCES lab_partners(id) ON DELETE CASCADE,
    CONSTRAINT fk_pricing_test        FOREIGN KEY (test_id)        REFERENCES lab_tests(id)    ON DELETE CASCADE,

    INDEX idx_pricing_lab_partner (lab_partner_id),
    INDEX idx_pricing_test (test_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================================
-- 5. FAMILY MEMBERS
-- ===================================================================
CREATE TABLE IF NOT EXISTS family_members (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id      BIGINT          NOT NULL,
    name            VARCHAR(100)    NOT NULL,
    relation        VARCHAR(50),
    date_of_birth   DATE,
    gender          ENUM('MALE','FEMALE','OTHER'),
    blood_group     VARCHAR(5),

    CONSTRAINT fk_family_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_family_patient (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================================
-- 6. BOOKINGS
-- ===================================================================
CREATE TABLE IF NOT EXISTS bookings (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_reference       VARCHAR(20)     NOT NULL UNIQUE,
    patient_id              BIGINT          NOT NULL,
    test_id                 BIGINT          NOT NULL,
    package_id              BIGINT,
    booking_date            DATE            NOT NULL,
    time_slot               VARCHAR(20),
    status                  ENUM('BOOKED','SAMPLE_COLLECTED','PROCESSING','REFLEX_PENDING','PENDING_VERIFICATION','VERIFIED','COMPLETED','CANCELLED','CONFIRMED')
                                            NOT NULL DEFAULT 'BOOKED',
    parent_booking_id       BIGINT          NULL,
    technician_id           BIGINT,
    medical_officer_id      BIGINT,
    collection_type         ENUM('HOME','LAB') NOT NULL DEFAULT 'LAB',
    collection_address      TEXT,
    home_collection_charge  DECIMAL(10,2)   DEFAULT 0.00,
    total_amount            DECIMAL(10,2)   NOT NULL,
    discount                DECIMAL(10,2)   DEFAULT 0.00,
    final_amount            DECIMAL(10,2)   NOT NULL,
    payment_status          ENUM('PENDING','PAID','REFUNDED','FAILED') NOT NULL DEFAULT 'PENDING',
    report_available        BOOLEAN         NOT NULL DEFAULT FALSE,
    critical_flag           BOOLEAN         NOT NULL DEFAULT FALSE,
    rejection_reason        VARCHAR(255),
    rejected_at             TIMESTAMP       NULL,
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_patient       FOREIGN KEY (patient_id)         REFERENCES users(id),
    CONSTRAINT fk_booking_test          FOREIGN KEY (test_id)            REFERENCES lab_tests(id),
    CONSTRAINT fk_booking_package       FOREIGN KEY (package_id)         REFERENCES test_packages(id) ON DELETE SET NULL,
    CONSTRAINT fk_booking_technician    FOREIGN KEY (technician_id)      REFERENCES users(id),
    CONSTRAINT fk_booking_officer       FOREIGN KEY (medical_officer_id) REFERENCES users(id),
    CONSTRAINT fk_booking_parent        FOREIGN KEY (parent_booking_id) REFERENCES bookings(id) ON DELETE SET NULL,

    INDEX idx_bookings_patient (patient_id),
    INDEX idx_bookings_patient_status (patient_id, status),
    INDEX idx_bookings_test (test_id),
    INDEX idx_bookings_package (package_id),
    INDEX idx_bookings_status (status),
    INDEX idx_bookings_reference (booking_reference),
    INDEX idx_bookings_date (booking_date),
    INDEX idx_bookings_technician (technician_id),
    INDEX idx_bookings_officer (medical_officer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================================
-- 17. REFLEX RULES
-- ===================================================================
CREATE TABLE IF NOT EXISTS reflex_rules (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    trigger_test_name   VARCHAR(200)    NOT NULL,
    trigger_condition   VARCHAR(40)     NOT NULL,
    trigger_value       DECIMAL(14,4)   NULL,
    reflex_test_name    VARCHAR(200)    NOT NULL,
    reflex_test_slug    VARCHAR(200)    NOT NULL,
    priority            VARCHAR(20)     NOT NULL,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_by          BIGINT          NULL,

    INDEX idx_reflex_rule_trigger (trigger_test_name),
    INDEX idx_reflex_rule_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================================
-- 18. REFLEX SUGGESTIONS
-- ===================================================================
CREATE TABLE IF NOT EXISTS reflex_suggestions (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id          BIGINT          NOT NULL,
    reflex_rule_id      BIGINT          NOT NULL,
    triggered_by        VARCHAR(300)    NOT NULL,
    suggested_test      VARCHAR(200)    NOT NULL,
    suggested_test_slug VARCHAR(200)    NOT NULL,
    priority            VARCHAR(20)     NOT NULL,
    status              VARCHAR(20)     NOT NULL,
    auto_ordered        BOOLEAN         NOT NULL DEFAULT FALSE,
    reflex_booking_id   BIGINT          NULL,
    action_reason       VARCHAR(500)    NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_reflex_suggestion_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_reflex_suggestion_rule FOREIGN KEY (reflex_rule_id) REFERENCES reflex_rules(id) ON DELETE CASCADE,
    CONSTRAINT fk_reflex_suggestion_reflex_booking FOREIGN KEY (reflex_booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    UNIQUE KEY uk_reflex_suggestion_booking_rule (booking_id, reflex_rule_id),
    INDEX idx_reflex_suggestion_booking (booking_id),
    INDEX idx_reflex_suggestion_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================================
-- 7. TEST PARAMETERS  (normal-range definitions per lab test)
-- ===================================================================
CREATE TABLE IF NOT EXISTS test_parameters (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    test_id           BIGINT          NOT NULL,
    parameter_name    VARCHAR(100)    NOT NULL,
    unit              VARCHAR(30),
    normal_range_min  DECIMAL(10,4),
    normal_range_max  DECIMAL(10,4),
    is_critical       BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_param_test FOREIGN KEY (test_id) REFERENCES lab_tests(id) ON DELETE CASCADE,

    INDEX idx_params_test (test_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================================
-- 8. REPORT RESULTS  (actual values recorded per booking + parameter)
-- ===================================================================
CREATE TABLE IF NOT EXISTS report_results (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id      BIGINT          NOT NULL,
    parameter_id    BIGINT          NOT NULL,
    value           VARCHAR(50),
    status          ENUM('NORMAL','HIGH','LOW') NOT NULL DEFAULT 'NORMAL',
    is_abnormal     BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_result_booking   FOREIGN KEY (booking_id)   REFERENCES bookings(id)        ON DELETE CASCADE,
    CONSTRAINT fk_result_parameter FOREIGN KEY (parameter_id) REFERENCES test_parameters(id)  ON DELETE CASCADE,

    INDEX idx_results_booking (booking_id),
    INDEX idx_results_parameter (parameter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================================
-- 9. REPORT VERIFICATION
-- ===================================================================
CREATE TABLE IF NOT EXISTS report_verification (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id            BIGINT          NOT NULL,
    medical_officer_id    BIGINT          NOT NULL,
    verification_date     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    clinical_notes        TEXT,
    critical_flags        TEXT,
    verification_status   ENUM('APPROVED','REJECTED','FLAGGED') NOT NULL,
    digital_signature     TEXT,

    CONSTRAINT fk_verification_booking FOREIGN KEY (booking_id)        REFERENCES bookings(id)  ON DELETE CASCADE,
    CONSTRAINT fk_verification_officer FOREIGN KEY (medical_officer_id) REFERENCES users(id),

    INDEX idx_verification_booking (booking_id),
    INDEX idx_verification_officer (medical_officer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================================
-- 10. RECOMMENDATIONS
-- ===================================================================
CREATE TABLE IF NOT EXISTS recommendations (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id      BIGINT NOT NULL UNIQUE,
    diet_advice     TEXT,
    exercise_advice TEXT,
    lifestyle_advice TEXT,
    doctor_advice   TEXT,
    follow_up_tests TEXT,

    CONSTRAINT fk_recommendation_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================================
-- 11. HEALTH SCORE
-- ===================================================================
CREATE TABLE IF NOT EXISTS health_score (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id              BIGINT          NOT NULL,
    booking_id              BIGINT          NOT NULL,
    overall_score           INT,
    risk_level              ENUM('LOW','MODERATE','HIGH') NOT NULL DEFAULT 'LOW',
    body_system_scores_json JSON,
    calculated_date         DATE            NOT NULL,

    CONSTRAINT fk_health_patient FOREIGN KEY (patient_id) REFERENCES users(id),
    CONSTRAINT fk_health_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,

    INDEX idx_health_patient (patient_id),
    INDEX idx_health_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================================
-- 12. PAYMENTS
-- ===================================================================
CREATE TABLE IF NOT EXISTS payments (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id      BIGINT          NOT NULL,
    transaction_id  VARCHAR(100)    UNIQUE,
    amount          DECIMAL(10,2)   NOT NULL,
    payment_method  VARCHAR(50),
    payment_status  ENUM('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
    payment_date    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,

    INDEX idx_payments_booking (booking_id),
    INDEX idx_payments_transaction (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================================
-- 13. TEST PACKAGES (Bundles of tests)
-- ===================================================================
CREATE TABLE IF NOT EXISTS test_packages (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    package_code        VARCHAR(50)     NOT NULL UNIQUE,
    package_name        VARCHAR(200)    NOT NULL,
    description         TEXT,
    total_tests         INT,
    total_price         DECIMAL(10,2),
    discounted_price    DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_package_code (package_code),
    INDEX idx_package_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================================
-- 14. PACKAGE-TEST MAPPING (Many-to-Many)
-- ===================================================================
CREATE TABLE IF NOT EXISTS package_tests (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    package_id      BIGINT          NOT NULL,
    test_id         BIGINT          NOT NULL,
    display_order   INT             DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_package_tests_package FOREIGN KEY (package_id) REFERENCES test_packages(id) ON DELETE CASCADE,
    CONSTRAINT fk_package_tests_test    FOREIGN KEY (test_id)    REFERENCES lab_tests(id)    ON DELETE CASCADE,
    UNIQUE KEY unique_package_test (package_id, test_id),

    INDEX idx_package_tests_package (package_id),
    INDEX idx_package_tests_test (test_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================================
-- 15. LOGIN ATTEMPTS (Brute-force protection)
-- ===================================================================
CREATE TABLE IF NOT EXISTS login_attempts (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(100)    NOT NULL UNIQUE,
    failed_attempts INT             NOT NULL DEFAULT 0,
    lock_until      TIMESTAMP       NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_login_attempts_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================================
-- 16. NOTIFICATION LOG (Delivery status for email/SMS)
-- ===================================================================
CREATE TABLE IF NOT EXISTS notification_log (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT          NULL,
    booking_id      BIGINT          NOT NULL,
    type            VARCHAR(50)     NOT NULL,
    status          VARCHAR(50)     NOT NULL,
    message         TEXT            NOT NULL,
    sent_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_notification_log_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,

    INDEX idx_notification_log_booking_id (booking_id),
    INDEX idx_notification_log_user_id (user_id),
    INDEX idx_notification_log_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

