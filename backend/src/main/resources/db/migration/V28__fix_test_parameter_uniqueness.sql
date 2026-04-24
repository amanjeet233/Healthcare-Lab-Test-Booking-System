-- Parameter names should be unique per test, not globally across all tests

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

CALL ExecSafe('ALTER TABLE test_parameters DROP INDEX uq_test_parameter_name');
CALL ExecSafe('ALTER TABLE test_parameters ADD CONSTRAINT uq_test_parameter_per_test UNIQUE (test_id, parameter_name)');

DROP PROCEDURE IF EXISTS ExecSafe;
