-- Database Optimization: Performance Indexes
-- Created: 2026-03-18
-- Purpose: Improve query performance for frequent queries

-- Booking Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date ON bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- Report Indexes
CREATE INDEX IF NOT EXISTS idx_reports_booking_id ON reports(booking_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Lab Test Indexes  
CREATE INDEX IF NOT EXISTS idx_lab_tests_category ON lab_tests(category_id);
CREATE INDEX IF NOT EXISTS idx_lab_tests_name ON lab_tests(test_name);
CREATE INDEX IF NOT EXISTS idx_lab_tests_is_active ON lab_tests(is_active);

-- Lab Test Pricing Indexes
CREATE INDEX IF NOT EXISTS idx_lab_test_pricing_test ON lab_test_pricing(test_id);
CREATE INDEX IF NOT EXISTS idx_lab_test_pricing_lab ON lab_test_pricing(lab_partner_id);
CREATE INDEX IF NOT EXISTS idx_lab_test_pricing_composite ON lab_test_pricing(test_id, lab_partner_id);
CREATE INDEX IF NOT EXISTS idx_lab_test_pricing_active ON lab_test_pricing(is_active);

-- Payment Indexes
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Notification Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Slot Configuration Indexes
CREATE INDEX IF NOT EXISTS idx_slot_config_lab ON slot_config(lab_partner_id);
CREATE INDEX IF NOT EXISTS idx_slot_config_active ON slot_config(is_active);

-- Booked Slot Indexes
CREATE INDEX IF NOT EXISTS idx_booked_slot_booking ON booked_slots(booking_id);
CREATE INDEX IF NOT EXISTS idx_booked_slot_slot_config ON booked_slots(slot_config_id);
CREATE INDEX IF NOT EXISTS idx_booked_slot_date ON booked_slots(slot_date);

-- Technician Indexes
CREATE INDEX IF NOT EXISTS idx_technician_user ON technician(user_id);
CREATE INDEX IF NOT EXISTS idx_technician_available ON technician(is_available);

-- Login Attempts Indexes (for brute-force protection)
CREATE INDEX IF NOT EXISTS idx_login_attempts_user ON login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_timestamp ON login_attempts(attempt_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_user_time ON login_attempts(user_id, attempt_timestamp DESC);

-- Report Result Indexes (for smart analysis queries)  
CREATE INDEX IF NOT EXISTS idx_report_result_booking ON report_results(booking_id);
CREATE INDEX IF NOT EXISTS idx_report_result_parameter ON report_results(parameter_id);
CREATE INDEX IF NOT EXISTS idx_report_result_abnormal ON report_results(is_abnormal);
CREATE INDEX IF NOT EXISTS idx_report_result_critical ON report_results(is_critical);
