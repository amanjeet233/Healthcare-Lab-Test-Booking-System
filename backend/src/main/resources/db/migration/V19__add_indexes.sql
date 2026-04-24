-- Database Optimization: Performance Indexes
-- Created: 2026-03-18
-- Purpose: Improve query performance for frequent queries
-- Note: This migration is intentionally defensive for schema drift.

DROP PROCEDURE IF EXISTS AddIndexSafely;
DELIMITER //
CREATE PROCEDURE AddIndexSafely(
    IN p_table VARCHAR(64),
    IN p_index VARCHAR(64),
    IN p_create_sql TEXT
)
BEGIN
    DECLARE v_table_exists INT DEFAULT 0;
    DECLARE v_index_exists INT DEFAULT 0;
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;

    SELECT COUNT(*)
      INTO v_table_exists
      FROM information_schema.tables
     WHERE table_schema = DATABASE()
       AND table_name = p_table;

    IF v_table_exists > 0 THEN
        SELECT COUNT(*)
          INTO v_index_exists
          FROM information_schema.statistics
         WHERE table_schema = DATABASE()
           AND table_name = p_table
           AND index_name = p_index;

        IF v_index_exists = 0 THEN
            SET @idx_sql = p_create_sql;
            PREPARE idx_stmt FROM @idx_sql;
            EXECUTE idx_stmt;
            DEALLOCATE PREPARE idx_stmt;
        END IF;
    END IF;
END //
DELIMITER ;

-- Booking indexes
CALL AddIndexSafely('bookings', 'idx_bookings_user_id', 'CREATE INDEX idx_bookings_user_id ON bookings(user_id)');
CALL AddIndexSafely('bookings', 'idx_bookings_status', 'CREATE INDEX idx_bookings_status ON bookings(status)');
CALL AddIndexSafely('bookings', 'idx_bookings_scheduled_date', 'CREATE INDEX idx_bookings_scheduled_date ON bookings(scheduled_date)');
CALL AddIndexSafely('bookings', 'idx_bookings_user_status', 'CREATE INDEX idx_bookings_user_status ON bookings(user_id, status)');
CALL AddIndexSafely('bookings', 'idx_bookings_created_at', 'CREATE INDEX idx_bookings_created_at ON bookings(created_at)');

-- Report indexes
CALL AddIndexSafely('reports', 'idx_reports_booking_id', 'CREATE INDEX idx_reports_booking_id ON reports(booking_id)');
CALL AddIndexSafely('reports', 'idx_reports_status', 'CREATE INDEX idx_reports_status ON reports(status)');
CALL AddIndexSafely('reports', 'idx_reports_user_id', 'CREATE INDEX idx_reports_user_id ON reports(user_id)');
CALL AddIndexSafely('reports', 'idx_reports_created_at', 'CREATE INDEX idx_reports_created_at ON reports(created_at)');

-- Test indexes
CALL AddIndexSafely('tests', 'idx_tests_name', 'CREATE INDEX idx_tests_name ON tests(name)');

-- Payment indexes
CALL AddIndexSafely('payments', 'idx_payments_booking_id', 'CREATE INDEX idx_payments_booking_id ON payments(booking_id)');
CALL AddIndexSafely('payments', 'idx_payments_status', 'CREATE INDEX idx_payments_status ON payments(status)');
CALL AddIndexSafely('payments', 'idx_payments_user_id', 'CREATE INDEX idx_payments_user_id ON payments(user_id)');
CALL AddIndexSafely('payments', 'idx_payments_created_at', 'CREATE INDEX idx_payments_created_at ON payments(created_at)');

-- Notification indexes
CALL AddIndexSafely('notifications', 'idx_notifications_user_unread', 'CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read)');
CALL AddIndexSafely('notifications', 'idx_notifications_created_at', 'CREATE INDEX idx_notifications_created_at ON notifications(created_at)');

-- Slot configuration indexes
CALL AddIndexSafely('slot_configs', 'idx_slot_configs_lab', 'CREATE INDEX idx_slot_configs_lab ON slot_configs(lab_partner_id)');
CALL AddIndexSafely('slot_configs', 'idx_slot_configs_active', 'CREATE INDEX idx_slot_configs_active ON slot_configs(is_active)');

-- Booked slot indexes
CALL AddIndexSafely('booked_slots', 'idx_booked_slots_booking', 'CREATE INDEX idx_booked_slots_booking ON booked_slots(booking_id)');
CALL AddIndexSafely('booked_slots', 'idx_booked_slots_slot_config', 'CREATE INDEX idx_booked_slots_slot_config ON booked_slots(slot_config_id)');
CALL AddIndexSafely('booked_slots', 'idx_booked_slots_date', 'CREATE INDEX idx_booked_slots_date ON booked_slots(slot_date)');

-- Technician indexes
CALL AddIndexSafely('technicians', 'idx_technicians_user', 'CREATE INDEX idx_technicians_user ON technicians(user_id)');
CALL AddIndexSafely('technicians', 'idx_technicians_available', 'CREATE INDEX idx_technicians_available ON technicians(is_available)');

-- Login attempts indexes
CALL AddIndexSafely('login_attempts', 'idx_login_attempts_user', 'CREATE INDEX idx_login_attempts_user ON login_attempts(user_id)');
CALL AddIndexSafely('login_attempts', 'idx_login_attempts_timestamp', 'CREATE INDEX idx_login_attempts_timestamp ON login_attempts(attempt_timestamp)');
CALL AddIndexSafely('login_attempts', 'idx_login_attempts_user_time', 'CREATE INDEX idx_login_attempts_user_time ON login_attempts(user_id, attempt_timestamp)');

-- Report result indexes
CALL AddIndexSafely('report_results', 'idx_report_results_booking', 'CREATE INDEX idx_report_results_booking ON report_results(booking_id)');
CALL AddIndexSafely('report_results', 'idx_report_results_parameter', 'CREATE INDEX idx_report_results_parameter ON report_results(parameter_id)');
CALL AddIndexSafely('report_results', 'idx_report_results_abnormal', 'CREATE INDEX idx_report_results_abnormal ON report_results(is_abnormal)');
CALL AddIndexSafely('report_results', 'idx_report_results_critical', 'CREATE INDEX idx_report_results_critical ON report_results(is_critical)');

DROP PROCEDURE IF EXISTS AddIndexSafely;
