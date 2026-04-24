-- Database Optimization: Unique Constraints
-- Created: 2026-03-18
-- Purpose: Ensure data integrity and prevent duplicate entries

-- Slot Uniqueness: Prevent double-booking at same time in same lab
ALTER TABLE booked_slots ADD CONSTRAINT uq_booked_slot_datetime 
UNIQUE (slot_config_id, slot_date);

-- Payment Uniqueness: One payment per booking
ALTER TABLE payments ADD CONSTRAINT uq_payment_booking 
UNIQUE (booking_id);

-- Email Uniqueness for users (already exists but enforcing)
ALTER TABLE users ADD CONSTRAINT uq_user_email UNIQUE (email);

-- Lab Partner: City + Name combination should be unique
ALTER TABLE lab_partner ADD CONSTRAINT uq_lab_name_city 
UNIQUE (lab_name, city);

-- Test Parameters: Name should be unique
ALTER TABLE test_parameters ADD CONSTRAINT uq_test_parameter_name 
UNIQUE (parameter_name);

-- Slot Config: One config per lab-day-time combination
ALTER TABLE slot_config ADD CONSTRAINT uq_slot_config_datetime 
UNIQUE (lab_partner_id, day_of_week, slot_start, slot_end);

-- Technician: One record per user
ALTER TABLE technician ADD CONSTRAINT uq_technician_user_id 
UNIQUE (user_id);

-- Report Results: One result per report per parameter
ALTER TABLE report_results ADD CONSTRAINT uq_report_result_param 
UNIQUE (booking_id, parameter_id);

-- Bookings: Track pricing snapshot
ALTER TABLE bookings ADD CONSTRAINT uq_booking_test_user 
UNIQUE (test_id, user_id, scheduled_date);

-- Add foreign key indexes for better join performance
ALTER TABLE bookings ADD INDEX idx_fk_bookings_test (test_id);
ALTER TABLE bookings ADD INDEX idx_fk_bookings_doctor (doctor_id);

ALTER TABLE reports ADD INDEX idx_fk_reports_test (test_id);
ALTER TABLE reports ADD INDEX idx_fk_reports_technician (technician_id);

ALTER TABLE lab_test_pricing ADD INDEX idx_fk_pricing_test (test_id);
ALTER TABLE lab_test_pricing ADD INDEX idx_fk_pricing_lab (lab_partner_id);

ALTER TABLE slot_config ADD INDEX idx_fk_slot_lab (lab_partner_id);

ALTER TABLE booked_slots ADD INDEX idx_fk_booked_slot_booking (booking_id);
ALTER TABLE booked_slots ADD INDEX idx_fk_booked_slot_config (slot_config_id);

ALTER TABLE payments ADD INDEX idx_fk_payments_booking (booking_id);
ALTER TABLE payments ADD INDEX idx_fk_payments_user (user_id);

ALTER TABLE notifications ADD INDEX idx_fk_notifications_user (user_id);

ALTER TABLE report_results ADD INDEX idx_fk_result_booking (booking_id);
ALTER TABLE report_results ADD INDEX idx_fk_result_parameter (parameter_id);

ALTER TABLE login_attempts ADD INDEX idx_fk_login_user (user_id);

-- Performance optimization: Partition large tables by date (optional - uncomment if needed)
-- PARTITION BY RANGE (YEAR(created_at)) (
--     PARTITION p2024 VALUES LESS THAN (2025),
--     PARTITION p2025 VALUES LESS THAN (2026),
--     PARTITION p2026 VALUES LESS THAN (2027),
--     PARTITION p_future VALUES LESS THAN MAXVALUE
-- );
