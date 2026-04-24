-- Align bookings table with Booking entity mapping

DROP PROCEDURE IF EXISTS AddColumnSafely;
DELIMITER //
CREATE PROCEDURE AddColumnSafely(
    IN p_table VARCHAR(64),
    IN p_column VARCHAR(64),
    IN p_definition TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = p_table
          AND column_name = p_column
    ) THEN
        SET @col_sql = CONCAT('ALTER TABLE ', p_table, ' ADD COLUMN ', p_column, ' ', p_definition);
        PREPARE col_stmt FROM @col_sql;
        EXECUTE col_stmt;
        DEALLOCATE PREPARE col_stmt;
    END IF;
END //
DELIMITER ;

CALL AddColumnSafely('bookings', 'patient_id', 'BIGINT NULL');
CALL AddColumnSafely('bookings', 'package_id', 'BIGINT NULL');
CALL AddColumnSafely('bookings', 'booking_date', 'DATE NULL');
CALL AddColumnSafely('bookings', 'time_slot', 'VARCHAR(20) NULL');
CALL AddColumnSafely('bookings', 'technician_id', 'BIGINT NULL');
CALL AddColumnSafely('bookings', 'medical_officer_id', 'BIGINT NULL');
CALL AddColumnSafely('bookings', 'collection_type', 'VARCHAR(20) NULL');
CALL AddColumnSafely('bookings', 'collection_address', 'TEXT NULL');
CALL AddColumnSafely('bookings', 'home_collection_charge', 'DECIMAL(10,2) NULL');
CALL AddColumnSafely('bookings', 'discount', 'DECIMAL(10,2) NULL');
CALL AddColumnSafely('bookings', 'final_amount', 'DECIMAL(10,2) NULL');
CALL AddColumnSafely('bookings', 'payment_status', 'VARCHAR(20) NULL');

-- Backfill data from legacy columns where possible
UPDATE bookings
SET patient_id = user_id
WHERE patient_id IS NULL;

UPDATE bookings
SET booking_date = DATE(scheduled_date)
WHERE booking_date IS NULL
  AND scheduled_date IS NOT NULL;

UPDATE bookings
SET booking_date = DATE(created_at)
WHERE booking_date IS NULL
  AND created_at IS NOT NULL;

UPDATE bookings
SET booking_date = CURDATE()
WHERE booking_date IS NULL;

UPDATE bookings
SET collection_type = CASE
    WHEN collection_location IS NOT NULL AND collection_location <> '' THEN 'HOME'
    ELSE 'LAB'
END
WHERE collection_type IS NULL;

UPDATE bookings
SET collection_address = collection_location
WHERE collection_address IS NULL
  AND collection_location IS NOT NULL;

UPDATE bookings
SET home_collection_charge = 0
WHERE home_collection_charge IS NULL;

UPDATE bookings
SET discount = COALESCE(discount_applied, 0)
WHERE discount IS NULL;

UPDATE bookings
SET final_amount = COALESCE(total_amount, 0) - COALESCE(discount, 0)
WHERE final_amount IS NULL;

UPDATE bookings
SET payment_status = 'PENDING'
WHERE payment_status IS NULL;

UPDATE bookings
SET booking_reference = CONCAT('BK', LPAD(id, 8, '0'))
WHERE booking_reference IS NULL;

-- Enforce core not-null constraints expected by entity
ALTER TABLE bookings MODIFY COLUMN patient_id BIGINT NOT NULL;
ALTER TABLE bookings MODIFY COLUMN booking_date DATE NOT NULL;
ALTER TABLE bookings MODIFY COLUMN collection_type VARCHAR(20) NOT NULL;
ALTER TABLE bookings MODIFY COLUMN home_collection_charge DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE bookings MODIFY COLUMN discount DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE bookings MODIFY COLUMN final_amount DECIMAL(10,2) NOT NULL;
ALTER TABLE bookings MODIFY COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING';
ALTER TABLE bookings MODIFY COLUMN booking_reference VARCHAR(20) NOT NULL;

DROP PROCEDURE IF EXISTS AddColumnSafely;
