-- Normalize bookings.status and bookings.payment_status to enum columns expected by Hibernate

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

-- payment_status normalization
CALL ExecSafe("
    UPDATE bookings
    SET payment_status = LOWER(payment_status)
    WHERE payment_status IS NOT NULL
");

CALL ExecSafe("
    UPDATE bookings
    SET payment_status = 'pending'
    WHERE payment_status IS NULL
       OR payment_status = ''
       OR payment_status NOT IN ('pending','paid','success','completed','failed','refunded')
");

CALL ExecSafe("
    ALTER TABLE bookings
    MODIFY COLUMN payment_status ENUM('pending','paid','success','completed','failed','refunded') NOT NULL DEFAULT 'pending'
");

-- status normalization
CALL ExecSafe("
    UPDATE bookings
    SET status = LOWER(status)
    WHERE status IS NOT NULL
");

CALL ExecSafe("
    UPDATE bookings
    SET status = 'booked'
    WHERE status IS NULL
       OR status = ''
       OR status = 'pending'
       OR status NOT IN ('booked','sample_collected','confirmed','processing','pending_verification','verified','completed','cancelled')
");

CALL ExecSafe("
    ALTER TABLE bookings
    MODIFY COLUMN status ENUM('booked','sample_collected','confirmed','processing','pending_verification','verified','completed','cancelled') NOT NULL DEFAULT 'booked'
");

DROP PROCEDURE IF EXISTS ExecSafe;
