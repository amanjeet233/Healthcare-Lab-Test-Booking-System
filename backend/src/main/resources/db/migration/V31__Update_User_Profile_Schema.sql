-- V21__Update_User_Profile_Schema.sql
-- Modernizes the user schema to support extended profile, family details, and medical history.

-- 1. Update Users Table
ALTER TABLE users 
ADD COLUMN first_name VARCHAR(100),
ADD COLUMN last_name VARCHAR(100),
ADD COLUMN secondary_phone VARCHAR(20),
ADD COLUMN alternate_email VARCHAR(100),
ADD COLUMN marital_status VARCHAR(50);

-- Migrate existing names (Split at first space)
UPDATE users SET first_name = SUBSTRING_INDEX(name, ' ', 1), 
                 last_name = SUBSTRING(name, LENGTH(SUBSTRING_INDEX(name, ' ', 1)) + 2)
WHERE name IS NOT NULL AND name LIKE '% %';

UPDATE users SET first_name = name, last_name = '' 
WHERE name IS NOT NULL AND name NOT LIKE '% %';

-- 2. Update User Addresses Table
ALTER TABLE user_addresses
ADD COLUMN street VARCHAR(255),
ADD COLUMN state VARCHAR(100),
ADD COLUMN country VARCHAR(100) DEFAULT 'India',
ADD COLUMN postal_code VARCHAR(20);

-- 3. Update Family Members Table
ALTER TABLE family_members
ADD COLUMN last_name VARCHAR(100),
ADD COLUMN account_status VARCHAR(50) DEFAULT 'unlinked',
ADD COLUMN linked_user_id BIGINT,
ADD COLUMN invitation_token VARCHAR(255),
ADD COLUMN invitation_expires_at TIMESTAMP NULL,
ADD COLUMN medical_conditions TEXT, -- Stored as comma-separated or JSON string
ADD COLUMN allergies TEXT;

-- 4. Create Medical History Table (Relationship: One-to-One with User)
CREATE TABLE IF NOT EXISTS medical_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    past_surgeries TEXT, -- JSON structure
    chronic_diseases TEXT, -- Tag list
    family_history TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Create Medications Table (Relationship: One-to-Many with User)
CREATE TABLE IF NOT EXISTS user_medications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    reason VARCHAR(255),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Create Emergency Contact Table (Relationship: One-to-One with User)
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    relation VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Add User Preferences
ALTER TABLE users
ADD COLUMN language_preference VARCHAR(10) DEFAULT 'en',
ADD COLUMN communication_channel VARCHAR(20) DEFAULT 'both',
ADD COLUMN notifications_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN marketing_emails BOOLEAN DEFAULT FALSE,
ADD COLUMN whatsapp_notifications BOOLEAN DEFAULT TRUE;

-- Update migration history metadata (Optional reference)
-- This ensures existing data is preserved while structure is expanded.
