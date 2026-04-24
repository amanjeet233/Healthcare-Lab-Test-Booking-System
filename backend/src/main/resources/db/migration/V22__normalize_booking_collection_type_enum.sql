-- Normalize bookings.collection_type to match Hibernate enum expectation

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

-- Normalize existing values before enum conversion
CALL ExecSafe("
    UPDATE bookings
    SET collection_type = 'home'
    WHERE LOWER(collection_type) = 'home'
");

CALL ExecSafe("
    UPDATE bookings
    SET collection_type = 'lab'
    WHERE collection_type IS NULL OR collection_type = '' OR LOWER(collection_type) = 'lab'
");

-- Convert to MySQL enum expected by Hibernate validate mode
CALL ExecSafe("
    ALTER TABLE bookings
    MODIFY COLUMN collection_type ENUM('home','lab') NOT NULL DEFAULT 'lab'
");

DROP PROCEDURE IF EXISTS ExecSafe;
