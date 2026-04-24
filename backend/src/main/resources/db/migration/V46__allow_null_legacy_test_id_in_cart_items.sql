-- Fix cart package insert failures on legacy schemas.
-- New cart flow uses lab_test_id/package_id, but old test_id column may still be NOT NULL.

SET @has_test_id := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'cart_items'
      AND COLUMN_NAME = 'test_id'
);

SET @alter_sql := IF(
    @has_test_id > 0,
    'ALTER TABLE cart_items MODIFY COLUMN test_id BIGINT NULL',
    'SELECT 1'
);

PREPARE stmt FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
