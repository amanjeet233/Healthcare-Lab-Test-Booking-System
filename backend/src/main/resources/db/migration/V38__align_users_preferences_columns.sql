-- Align users table with new profile preference fields

DROP PROCEDURE IF EXISTS AddUserColumnIfMissing;
DELIMITER //
CREATE PROCEDURE AddUserColumnIfMissing(
    IN p_column_name VARCHAR(64),
    IN p_definition TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'users'
          AND column_name = p_column_name
    ) THEN
        SET @sql_text = CONCAT('ALTER TABLE users ADD COLUMN ', p_column_name, ' ', p_definition);
        PREPARE stmt FROM @sql_text;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

CALL AddUserColumnIfMissing('two_factor_auth', 'TINYINT(1) NULL DEFAULT 0');
CALL AddUserColumnIfMissing('privacy_mode', 'TINYINT(1) NULL DEFAULT 0');
CALL AddUserColumnIfMissing('theme_preference', 'VARCHAR(10) NULL DEFAULT ''light''');

DROP PROCEDURE IF EXISTS AddUserColumnIfMissing;
