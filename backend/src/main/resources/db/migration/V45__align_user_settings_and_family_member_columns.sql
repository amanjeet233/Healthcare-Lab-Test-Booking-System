-- Align users and family_members columns with current API contracts

DROP PROCEDURE IF EXISTS AddColumnIfMissing;
DELIMITER //
CREATE PROCEDURE AddColumnIfMissing(
    IN p_table_name VARCHAR(64),
    IN p_column_name VARCHAR(64),
    IN p_definition TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = p_table_name
          AND column_name = p_column_name
    ) THEN
        SET @sql_text = CONCAT('ALTER TABLE ', p_table_name, ' ADD COLUMN ', p_column_name, ' ', p_definition);
        PREPARE stmt FROM @sql_text;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

-- users settings/profile compatibility
CALL AddColumnIfMissing('users', 'first_name', 'VARCHAR(100) NULL');
CALL AddColumnIfMissing('users', 'last_name', 'VARCHAR(100) NULL');
CALL AddColumnIfMissing('users', 'secondary_phone', 'VARCHAR(20) NULL');
CALL AddColumnIfMissing('users', 'alternate_email', 'VARCHAR(100) NULL');
CALL AddColumnIfMissing('users', 'marital_status', 'VARCHAR(50) NULL');
CALL AddColumnIfMissing('users', 'language_preference', 'VARCHAR(10) NULL DEFAULT ''en''');
CALL AddColumnIfMissing('users', 'communication_channel', 'VARCHAR(20) NULL DEFAULT ''both''');
CALL AddColumnIfMissing('users', 'notifications_enabled', 'TINYINT(1) NULL DEFAULT 1');
CALL AddColumnIfMissing('users', 'marketing_emails', 'TINYINT(1) NULL DEFAULT 0');
CALL AddColumnIfMissing('users', 'whatsapp_notifications', 'TINYINT(1) NULL DEFAULT 1');
CALL AddColumnIfMissing('users', 'two_factor_auth', 'TINYINT(1) NULL DEFAULT 0');
CALL AddColumnIfMissing('users', 'privacy_mode', 'TINYINT(1) NULL DEFAULT 0');
CALL AddColumnIfMissing('users', 'theme_preference', 'VARCHAR(10) NULL DEFAULT ''light''');

-- family_members form compatibility
CALL AddColumnIfMissing('family_members', 'phone_number', 'VARCHAR(20) NULL');
CALL AddColumnIfMissing('family_members', 'email', 'VARCHAR(120) NULL');
CALL AddColumnIfMissing('family_members', 'medical_history', 'TEXT NULL');

DROP PROCEDURE IF EXISTS AddColumnIfMissing;
