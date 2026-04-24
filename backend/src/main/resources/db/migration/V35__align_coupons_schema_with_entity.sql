-- Align coupons table with Coupon entity additions

DROP PROCEDURE IF EXISTS AddCouponColumnIfMissing;
DELIMITER //
CREATE PROCEDURE AddCouponColumnIfMissing(
    IN p_column_name VARCHAR(64),
    IN p_definition TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'coupons'
          AND column_name = p_column_name
    ) THEN
        SET @sql_text = CONCAT('ALTER TABLE coupons ADD COLUMN ', p_column_name, ' ', p_definition);
        PREPARE stmt FROM @sql_text;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

CALL AddCouponColumnIfMissing('image_url', 'VARCHAR(500) NULL');
CALL AddCouponColumnIfMissing('category', 'VARCHAR(50) NULL');

DROP PROCEDURE IF EXISTS AddCouponColumnIfMissing;
