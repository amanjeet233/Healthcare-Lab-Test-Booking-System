-- Align carts/cart_items tables with Cart and CartItem entities

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

-- carts: rename PK and align columns
CALL ExecSafe('ALTER TABLE cart_items DROP FOREIGN KEY cart_items_ibfk_1');
CALL ExecSafe('ALTER TABLE carts CHANGE COLUMN id cart_id BIGINT NOT NULL AUTO_INCREMENT');
CALL ExecSafe('ALTER TABLE cart_items ADD CONSTRAINT cart_items_ibfk_1 FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE');

CALL ExecSafe('ALTER TABLE carts ADD COLUMN subtotal DECIMAL(10,2) NULL');
CALL ExecSafe('ALTER TABLE carts ADD COLUMN discount_amount DECIMAL(10,2) NULL');
CALL ExecSafe('ALTER TABLE carts ADD COLUMN tax_amount DECIMAL(10,2) NULL');
CALL ExecSafe('ALTER TABLE carts ADD COLUMN total_price DECIMAL(10,2) NULL');
CALL ExecSafe('ALTER TABLE carts ADD COLUMN coupon_code VARCHAR(255) NULL');
CALL ExecSafe('ALTER TABLE carts ADD COLUMN coupon_discount DECIMAL(5,2) NULL');
CALL ExecSafe('ALTER TABLE carts ADD COLUMN status VARCHAR(50) NULL');
CALL ExecSafe('ALTER TABLE carts ADD COLUMN item_count INT NULL');
CALL ExecSafe('ALTER TABLE carts ADD COLUMN expiry_at DATETIME NULL');

CALL ExecSafe('UPDATE carts SET subtotal = 0 WHERE subtotal IS NULL');
CALL ExecSafe('UPDATE carts SET discount_amount = 0 WHERE discount_amount IS NULL');
CALL ExecSafe('UPDATE carts SET tax_amount = 0 WHERE tax_amount IS NULL');
CALL ExecSafe('UPDATE carts SET total_price = 0 WHERE total_price IS NULL');
CALL ExecSafe('UPDATE carts SET item_count = 0 WHERE item_count IS NULL');
CALL ExecSafe('UPDATE carts SET status = ''active'' WHERE status IS NULL OR status = ''''');
CALL ExecSafe('UPDATE carts SET status = LOWER(status)');
CALL ExecSafe('UPDATE carts SET status = ''active'' WHERE status NOT IN (''active'',''checked_out'',''abandoned'',''expired'')');

CALL ExecSafe('ALTER TABLE carts MODIFY COLUMN subtotal DECIMAL(10,2) NOT NULL DEFAULT 0');
CALL ExecSafe('ALTER TABLE carts MODIFY COLUMN discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0');
CALL ExecSafe('ALTER TABLE carts MODIFY COLUMN tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0');
CALL ExecSafe('ALTER TABLE carts MODIFY COLUMN total_price DECIMAL(10,2) NOT NULL DEFAULT 0');
CALL ExecSafe('ALTER TABLE carts MODIFY COLUMN item_count INT NOT NULL DEFAULT 0');
CALL ExecSafe('ALTER TABLE carts MODIFY COLUMN status ENUM(''active'',''checked_out'',''abandoned'',''expired'') DEFAULT ''active''');

-- cart_items: rename PK and align columns
CALL ExecSafe('ALTER TABLE cart_items CHANGE COLUMN id cart_item_id BIGINT NOT NULL AUTO_INCREMENT');
CALL ExecSafe('ALTER TABLE cart_items ADD COLUMN lab_test_id BIGINT NULL');
CALL ExecSafe('ALTER TABLE cart_items ADD COLUMN package_id BIGINT NULL');
CALL ExecSafe('ALTER TABLE cart_items ADD COLUMN item_type VARCHAR(30) NULL');
CALL ExecSafe('ALTER TABLE cart_items ADD COLUMN item_name VARCHAR(255) NULL');
CALL ExecSafe('ALTER TABLE cart_items ADD COLUMN item_code VARCHAR(255) NULL');
CALL ExecSafe('ALTER TABLE cart_items ADD COLUMN description TEXT NULL');
CALL ExecSafe('ALTER TABLE cart_items ADD COLUMN unit_price DECIMAL(10,2) NULL');
CALL ExecSafe('ALTER TABLE cart_items ADD COLUMN original_price DECIMAL(10,2) NULL');
CALL ExecSafe('ALTER TABLE cart_items ADD COLUMN discount_percentage DECIMAL(5,2) NULL');
CALL ExecSafe('ALTER TABLE cart_items ADD COLUMN discount_amount DECIMAL(10,2) NULL');
CALL ExecSafe('ALTER TABLE cart_items ADD COLUMN final_price DECIMAL(10,2) NULL');
CALL ExecSafe('ALTER TABLE cart_items ADD COLUMN tests_included INT NULL');
CALL ExecSafe('ALTER TABLE cart_items ADD COLUMN fasting_required BIT NULL');
CALL ExecSafe('ALTER TABLE cart_items ADD COLUMN sample_type VARCHAR(100) NULL');
CALL ExecSafe('ALTER TABLE cart_items ADD COLUMN turnaround_hours INT NULL');
CALL ExecSafe('ALTER TABLE cart_items ADD COLUMN added_at DATETIME NULL');

CALL ExecSafe('UPDATE cart_items SET lab_test_id = test_id WHERE lab_test_id IS NULL');
CALL ExecSafe('UPDATE cart_items SET unit_price = price_at_add WHERE unit_price IS NULL');
CALL ExecSafe('UPDATE cart_items SET original_price = price_at_add WHERE original_price IS NULL');
CALL ExecSafe('UPDATE cart_items SET discount_amount = discount_at_add WHERE discount_amount IS NULL');
CALL ExecSafe('UPDATE cart_items SET discount_percentage = 0 WHERE discount_percentage IS NULL');
CALL ExecSafe('UPDATE cart_items SET final_price = (COALESCE(price_at_add,0) * COALESCE(quantity,1)) - COALESCE(discount_at_add,0) WHERE final_price IS NULL');
CALL ExecSafe('UPDATE cart_items SET item_type = ''lab_test'' WHERE item_type IS NULL AND lab_test_id IS NOT NULL');
CALL ExecSafe('UPDATE cart_items SET item_type = ''test_package'' WHERE item_type IS NULL AND package_id IS NOT NULL');
CALL ExecSafe('UPDATE cart_items SET item_type = ''lab_test'' WHERE item_type IS NULL');
CALL ExecSafe('UPDATE cart_items ci JOIN tests t ON ci.lab_test_id = t.id SET ci.item_name = t.name WHERE ci.item_name IS NULL');
CALL ExecSafe('UPDATE cart_items SET item_name = ''Cart Item'' WHERE item_name IS NULL');
CALL ExecSafe('UPDATE cart_items SET added_at = created_at WHERE added_at IS NULL');
CALL ExecSafe('UPDATE cart_items SET quantity = 1 WHERE quantity IS NULL OR quantity < 1');
CALL ExecSafe('UPDATE cart_items SET unit_price = 0 WHERE unit_price IS NULL');
CALL ExecSafe('UPDATE cart_items SET discount_amount = 0 WHERE discount_amount IS NULL');

CALL ExecSafe('ALTER TABLE cart_items MODIFY COLUMN item_type ENUM(''lab_test'',''test_package'') NOT NULL');
CALL ExecSafe('ALTER TABLE cart_items MODIFY COLUMN item_name VARCHAR(255) NOT NULL');
CALL ExecSafe('ALTER TABLE cart_items MODIFY COLUMN quantity INT NOT NULL DEFAULT 1');
CALL ExecSafe('ALTER TABLE cart_items MODIFY COLUMN unit_price DECIMAL(10,2) NOT NULL');

CALL ExecSafe('ALTER TABLE cart_items ADD INDEX idx_cart_item_cart (cart_id)');
CALL ExecSafe('ALTER TABLE cart_items ADD INDEX idx_cart_item_test (lab_test_id)');
CALL ExecSafe('ALTER TABLE cart_items ADD INDEX idx_cart_item_package (package_id)');

CALL ExecSafe('ALTER TABLE cart_items ADD CONSTRAINT fk_cart_items_lab_test FOREIGN KEY (lab_test_id) REFERENCES tests(id)');
CALL ExecSafe('ALTER TABLE cart_items ADD CONSTRAINT fk_cart_items_package FOREIGN KEY (package_id) REFERENCES test_packages(id)');

DROP PROCEDURE IF EXISTS ExecSafe;
