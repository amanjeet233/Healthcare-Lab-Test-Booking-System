-- Normalize legacy integer flags to boolean-compatible BIT columns

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

CALL ExecSafe('UPDATE tests SET fasting_required = 0 WHERE fasting_required IS NULL');
CALL ExecSafe('ALTER TABLE tests MODIFY COLUMN fasting_required BIT(1) NULL');

DROP PROCEDURE IF EXISTS ExecSafe;
