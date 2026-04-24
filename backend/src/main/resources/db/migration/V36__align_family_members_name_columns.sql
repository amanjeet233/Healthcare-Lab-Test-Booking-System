-- Align family_members with FamilyMember entity naming fields

DROP PROCEDURE IF EXISTS AddFamilyMemberColumnIfMissing;
DELIMITER //
CREATE PROCEDURE AddFamilyMemberColumnIfMissing(
    IN p_column_name VARCHAR(64),
    IN p_definition TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'family_members'
          AND column_name = p_column_name
    ) THEN
        SET @sql_text = CONCAT('ALTER TABLE family_members ADD COLUMN ', p_column_name, ' ', p_definition);
        PREPARE stmt FROM @sql_text;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

CALL AddFamilyMemberColumnIfMissing('first_name', 'VARCHAR(50) NULL');

UPDATE family_members
SET first_name = TRIM(SUBSTRING_INDEX(name, ' ', 1))
WHERE (first_name IS NULL OR first_name = '')
  AND name IS NOT NULL
  AND name <> '';

UPDATE family_members
SET first_name = 'Member'
WHERE first_name IS NULL OR first_name = '';

ALTER TABLE family_members
    MODIFY COLUMN first_name VARCHAR(50) NOT NULL;

DROP PROCEDURE IF EXISTS AddFamilyMemberColumnIfMissing;
