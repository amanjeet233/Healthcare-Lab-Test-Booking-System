-- Normalize booking status helper columns to enum types expected by Hibernate validation

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

-- Ensure columns exist before enum normalization
CALL ExecSafe("ALTER TABLE bookings ADD COLUMN sample_collection_status VARCHAR(32) NULL");
CALL ExecSafe("ALTER TABLE bookings ADD COLUMN refund_status VARCHAR(32) NULL");

-- Normalize values to expected lowercase domain
CALL ExecSafe("
    UPDATE bookings
    SET sample_collection_status = LOWER(sample_collection_status)
    WHERE sample_collection_status IS NOT NULL
");

CALL ExecSafe("
    UPDATE bookings
    SET refund_status = LOWER(refund_status)
    WHERE refund_status IS NOT NULL
");

CALL ExecSafe("
    UPDATE bookings
    SET sample_collection_status = 'scheduled'
    WHERE sample_collection_status IS NULL
       OR sample_collection_status = ''
       OR sample_collection_status NOT IN ('scheduled','in_transit','collected','received_at_lab','failed','cancelled')
");

CALL ExecSafe("
    UPDATE bookings
    SET refund_status = NULL
    WHERE refund_status = ''
");

CALL ExecSafe("
    UPDATE bookings
    SET refund_status = 'pending'
    WHERE refund_status IS NOT NULL
      AND refund_status NOT IN ('pending','processing','completed','failed','cancelled')
");

-- Convert to enum types that Hibernate is validating against
CALL ExecSafe("
    ALTER TABLE bookings
    MODIFY COLUMN sample_collection_status ENUM('scheduled','in_transit','collected','received_at_lab','failed','cancelled') NULL
");

CALL ExecSafe("
    ALTER TABLE bookings
    MODIFY COLUMN refund_status ENUM('pending','processing','completed','failed','cancelled') NULL
");

DROP PROCEDURE IF EXISTS ExecSafe;
