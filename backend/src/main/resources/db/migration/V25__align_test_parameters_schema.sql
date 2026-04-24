-- Align test_parameters table with TestParameter entity

DROP PROCEDURE IF EXISTS ExecSafe;
DELIMITER //
CREATE PROCEDURE ExecSafe(IN p_sql TEXT)
BEGIN
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
    END;

    SET @stmt = p_sql;
    PREPARE s FROM @stmt;
    EXECUTE s;
    DEALLOCATE PREPARE s;
END //
DELIMITER ;

CALL ExecSafe('ALTER TABLE test_parameters ADD COLUMN normal_range_min DECIMAL(12,4) NULL');
CALL ExecSafe('ALTER TABLE test_parameters ADD COLUMN normal_range_max DECIMAL(12,4) NULL');
CALL ExecSafe('ALTER TABLE test_parameters ADD COLUMN critical_low DECIMAL(12,4) NULL');
CALL ExecSafe('ALTER TABLE test_parameters ADD COLUMN critical_high DECIMAL(12,4) NULL');
CALL ExecSafe('ALTER TABLE test_parameters ADD COLUMN updated_at DATETIME NULL');

CALL ExecSafe('UPDATE test_parameters SET updated_at = created_at WHERE updated_at IS NULL');
CALL ExecSafe('UPDATE test_parameters SET is_critical = 0 WHERE is_critical IS NULL');

CALL ExecSafe('ALTER TABLE test_parameters MODIFY COLUMN normal_range_text TEXT NULL');
CALL ExecSafe('ALTER TABLE test_parameters MODIFY COLUMN is_critical BIT(1) NOT NULL DEFAULT b''0''');

DROP PROCEDURE IF EXISTS ExecSafe;
