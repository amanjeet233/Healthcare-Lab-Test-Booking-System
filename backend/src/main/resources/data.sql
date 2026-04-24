-- =============================================================
-- DATA.SQL - Initial Seed Data for Lab Test Booking System
-- =============================================================
-- This file is executed by Spring Boot before running tests
-- It ensures the database has initial test data for development/testing

-- NOTE: Lab tests are now loaded from DB migrations (V10, V11)
-- Do NOT insert duplicate test data here

-- ========== INSERT USERS WITH CORRECT ROLES ==========
-- Patient user for testing booking creation
INSERT INTO users (name, email, password, role, phone, address, gender, blood_group, date_of_birth, is_active, created_at, updated_at)
VALUES ('Patient User', 'patient@test.com', '$2a$10$slYQmyNdGziq3wjgkkAL.e8VLdHdnI1OJ1lIuggdP70Y80vQiKRh2', 'PATIENT', '9876543210', '123 Patient Street', 'MALE', 'O+', '1990-01-15', true, NOW(), NOW());

-- Technician user for testing report submission (CORRECT ROLE)
INSERT INTO users (name, email, password, role, phone, address, gender, blood_group, date_of_birth, is_active, created_at, updated_at)
VALUES ('Technician User', 'technician@test.com', '$2a$10$slYQmyNdGziq3wjgkkAL.e8VLdHdnI1OJ1lIuggdP70Y80vQiKRh2', 'TECHNICIAN', '9876543211', '456 Lab Tech Avenue', 'FEMALE', 'B+', '1992-05-20', true, NOW(), NOW());

-- Medical Officer user for testing approvals (CORRECT ROLE)
INSERT INTO users (name, email, password, role, phone, address, gender, blood_group, date_of_birth, is_active, created_at, updated_at)
VALUES ('Medical Officer User', 'doctor@test.com', '$2a$10$slYQmyNdGziq3wjgkkAL.e8VLdHdnI1OJ1lIuggdP70Y80vQiKRh2', 'MEDICAL_OFFICER', '9876543212', '789 Doctor Plaza', 'MALE', 'AB+', '1985-08-30', true, NOW(), NOW());

-- ========== NOTES ==========
-- Password hash is for "password123" using BCrypt
-- Admin password hash is for "admin" using BCrypt
-- Roles: PATIENT, TECHNICIAN, MEDICAL_OFFICER, ADMIN
-- All users have is_active=true
-- All lab tests are loaded from V10 (create tests table) and V11 (insert 500+ tests)

-- ========== ADMIN USER ==========
-- Admin user for system administration (password: admin)
INSERT INTO users (name, email, password, role, phone, address, gender, blood_group, date_of_birth, is_active, is_verified, created_at, updated_at)
SELECT 'System Admin', 'admin@healthcarelab.com',
       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhXe',
       'ADMIN', '9000000000', 'Admin HQ', 'MALE', 'O+', '1990-01-01',
       true, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@healthcarelab.com'
);

