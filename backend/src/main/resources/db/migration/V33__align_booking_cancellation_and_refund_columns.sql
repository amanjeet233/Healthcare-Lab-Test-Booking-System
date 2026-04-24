-- Align bookings table with Booking entity fields used by cancellation/refund/report flows

DROP PROCEDURE IF EXISTS AddOrModifyBookingColumn;
DELIMITER //
CREATE PROCEDURE AddOrModifyBookingColumn(
    IN p_column_name VARCHAR(64),
    IN p_add_definition TEXT,
    IN p_modify_definition TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'bookings'
          AND column_name = p_column_name
    ) THEN
        SET @add_sql = CONCAT('ALTER TABLE bookings ADD COLUMN ', p_column_name, ' ', p_add_definition);
        PREPARE add_stmt FROM @add_sql;
        EXECUTE add_stmt;
        DEALLOCATE PREPARE add_stmt;
    ELSE
        SET @modify_sql = CONCAT('ALTER TABLE bookings MODIFY COLUMN ', p_column_name, ' ', p_modify_definition);
        PREPARE modify_stmt FROM @modify_sql;
        EXECUTE modify_stmt;
        DEALLOCATE PREPARE modify_stmt;
    END IF;
END //
DELIMITER ;

CALL AddOrModifyBookingColumn('sample_collection_status', 'VARCHAR(32) NULL', 'VARCHAR(32) NULL');
CALL AddOrModifyBookingColumn('cancellation_reason', 'TEXT NULL', 'TEXT NULL');
CALL AddOrModifyBookingColumn('refund_status', 'VARCHAR(32) NULL', 'VARCHAR(32) NULL');
CALL AddOrModifyBookingColumn('refund_amount', 'DECIMAL(10,2) NULL', 'DECIMAL(10,2) NULL');

DROP PROCEDURE IF EXISTS AddOrModifyBookingColumn;
