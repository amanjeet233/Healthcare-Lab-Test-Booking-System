-- Normalize carts.status values to match Cart.CartStatus enum names used by JPA
-- Fixes runtime error: No enum constant CartStatus.active

UPDATE carts
SET status = CASE LOWER(TRIM(status))
    WHEN 'active' THEN 'ACTIVE'
    WHEN 'checked_out' THEN 'CHECKED_OUT'
    WHEN 'abandoned' THEN 'ABANDONED'
    WHEN 'expired' THEN 'EXPIRED'
    ELSE 'ACTIVE'
END
WHERE status IS NOT NULL;

UPDATE carts
SET status = 'ACTIVE'
WHERE status IS NULL OR TRIM(status) = '';

ALTER TABLE carts
    MODIFY COLUMN status ENUM('ACTIVE','CHECKED_OUT','ABANDONED','EXPIRED') NOT NULL DEFAULT 'ACTIVE';

