-- Database Optimization: Unique Constraints
-- Created: 2026-03-18
-- Purpose: Ensure data integrity and prevent duplicate entries
-- Note: Defensive execution to avoid breaking on schema drift.

DROP PROCEDURE IF EXISTS ExecSafe;
DELIMITER //
CREATE PROCEDURE ExecSafe(IN p_sql LONGTEXT)
BEGIN
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
    SET @exec_sql = p_sql;
    PREPARE exec_stmt FROM @exec_sql;
    EXECUTE exec_stmt;
    DEALLOCATE PREPARE exec_stmt;
END //
DELIMITER ;

-- Slot uniqueness: prevent double-booking at same time in same lab
CALL ExecSafe('ALTER TABLE booked_slots ADD CONSTRAINT uq_booked_slot_datetime UNIQUE (slot_config_id, slot_date)');

-- Payment uniqueness: one payment per booking
CALL ExecSafe('ALTER TABLE payments ADD CONSTRAINT uq_payment_booking UNIQUE (booking_id)');

-- Email uniqueness for users
CALL ExecSafe('ALTER TABLE users ADD CONSTRAINT uq_user_email UNIQUE (email)');

-- Lab partner uniqueness
CALL ExecSafe('ALTER TABLE lab_partners ADD CONSTRAINT uq_lab_name_city UNIQUE (name, city)');

-- Test parameter uniqueness
CALL ExecSafe('ALTER TABLE test_parameters ADD CONSTRAINT uq_test_parameter_name UNIQUE (parameter_name)');

-- Slot config uniqueness
CALL ExecSafe('ALTER TABLE slot_configs ADD CONSTRAINT uq_slot_config_datetime UNIQUE (lab_partner_id, day_of_week, slot_start, slot_end)');

-- Technician uniqueness
CALL ExecSafe('ALTER TABLE technicians ADD CONSTRAINT uq_technician_user_id UNIQUE (user_id)');

-- Report result uniqueness
CALL ExecSafe('ALTER TABLE report_results ADD CONSTRAINT uq_report_result_param UNIQUE (booking_id, parameter_id)');

-- Booking uniqueness snapshot
CALL ExecSafe('ALTER TABLE bookings ADD CONSTRAINT uq_booking_test_user UNIQUE (test_id, user_id, scheduled_date)');

-- Additional FK/helper indexes
CALL ExecSafe('ALTER TABLE bookings ADD INDEX idx_fk_bookings_test (test_id)');
CALL ExecSafe('ALTER TABLE reports ADD INDEX idx_fk_reports_test (test_id)');
CALL ExecSafe('ALTER TABLE slot_configs ADD INDEX idx_fk_slot_lab (lab_partner_id)');
CALL ExecSafe('ALTER TABLE booked_slots ADD INDEX idx_fk_booked_slot_booking (booking_id)');
CALL ExecSafe('ALTER TABLE booked_slots ADD INDEX idx_fk_booked_slot_config (slot_config_id)');
CALL ExecSafe('ALTER TABLE payments ADD INDEX idx_fk_payments_booking (booking_id)');
CALL ExecSafe('ALTER TABLE payments ADD INDEX idx_fk_payments_user (user_id)');
CALL ExecSafe('ALTER TABLE notifications ADD INDEX idx_fk_notifications_user (user_id)');
CALL ExecSafe('ALTER TABLE report_results ADD INDEX idx_fk_result_booking (booking_id)');
CALL ExecSafe('ALTER TABLE report_results ADD INDEX idx_fk_result_parameter (parameter_id)');
CALL ExecSafe('ALTER TABLE login_attempts ADD INDEX idx_fk_login_user (user_id)');

DROP PROCEDURE IF EXISTS ExecSafe;
