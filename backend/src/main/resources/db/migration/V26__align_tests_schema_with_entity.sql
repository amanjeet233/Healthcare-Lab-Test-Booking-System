-- Align tests table with LabTest entity mapping

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

CALL ExecSafe('ALTER TABLE tests ADD COLUMN sub_category VARCHAR(255) NULL');
CALL ExecSafe('ALTER TABLE tests ADD COLUMN report_time_hours INT NULL');
CALL ExecSafe('ALTER TABLE tests ADD COLUMN recommended_for VARCHAR(255) NULL');
CALL ExecSafe('ALTER TABLE tests ADD COLUMN sub_tests JSON NULL');
CALL ExecSafe('ALTER TABLE tests ADD COLUMN tags JSON NULL');
CALL ExecSafe('ALTER TABLE tests ADD COLUMN discounted_price DECIMAL(10,2) NULL');
CALL ExecSafe('ALTER TABLE tests ADD COLUMN discount_percent INT NULL');
CALL ExecSafe('ALTER TABLE tests ADD COLUMN icon_url VARCHAR(500) NULL');
CALL ExecSafe('ALTER TABLE tests ADD COLUMN is_package BIT(1) NULL');
CALL ExecSafe('ALTER TABLE tests ADD COLUMN is_trending BIT(1) NULL');

CALL ExecSafe('UPDATE tests SET discounted_price = price WHERE discounted_price IS NULL');
CALL ExecSafe('UPDATE tests SET discount_percent = CASE WHEN original_price > 0 THEN ROUND((original_price - price) * 100 / original_price) ELSE 0 END WHERE discount_percent IS NULL');
CALL ExecSafe('UPDATE tests SET is_package = b''0'' WHERE is_package IS NULL');
CALL ExecSafe('UPDATE tests SET is_trending = b''0'' WHERE is_trending IS NULL');
CALL ExecSafe('UPDATE tests SET sub_tests = JSON_ARRAY() WHERE sub_tests IS NULL');
CALL ExecSafe('UPDATE tests SET tags = JSON_ARRAY() WHERE tags IS NULL');

CALL ExecSafe('ALTER TABLE tests MODIFY COLUMN is_package BIT(1) NOT NULL DEFAULT b''0''');
CALL ExecSafe('ALTER TABLE tests MODIFY COLUMN is_trending BIT(1) NOT NULL DEFAULT b''0''');

DROP PROCEDURE IF EXISTS ExecSafe;
