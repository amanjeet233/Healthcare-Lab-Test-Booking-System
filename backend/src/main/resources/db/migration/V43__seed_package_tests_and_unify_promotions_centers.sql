-- DB parity updates:
-- 1) package_included_tests seed support
-- 2) promotions table + backfill from coupons
-- 3) collection_centers table + backfill from lab_locations/lab_partners

CREATE TABLE IF NOT EXISTS package_included_tests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    package_id BIGINT NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_package_test_name (package_id, test_name),
    INDEX idx_package_included_tests_package (package_id),
    CONSTRAINT fk_package_included_tests_package
        FOREIGN KEY (package_id) REFERENCES test_packages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Base fallback row for any package without explicit included-tests rows
INSERT INTO package_included_tests (package_id, test_name)
SELECT tp.id, 'Panel as per package protocol'
FROM test_packages tp
WHERE NOT EXISTS (
    SELECT 1
    FROM package_included_tests pit
    WHERE pit.package_id = tp.id
);

-- Add detailed rows for core packages from latest catalog (idempotent through unique key)
CREATE TEMPORARY TABLE tmp_package_test_seed (
    package_code VARCHAR(50) NOT NULL,
    test_name VARCHAR(255) NOT NULL
);

INSERT INTO tmp_package_test_seed (package_code, test_name) VALUES
('M1','CBC'),
('M1','FBS'),
('M1','Lipid Profile'),
('M1','LFT'),
('M1','RFT'),
('M1','Urine Routine'),
('M1','TSH'),
('M2','Lipid Profile'),
('M2','hs-CRP'),
('M2','Troponin'),
('M2','ECG'),
('M2','2D Echo'),
('M3','FBS'),
('M3','PPBS'),
('M3','HbA1c'),
('M3','Insulin'),
('M3','Urine Microalbumin'),
('M6','TSH'),
('M6','Free T3'),
('M6','Free T4'),
('M6','Anti-TPO'),
('W1','CBC'),
('W1','FBS'),
('W1','Lipid Profile'),
('W1','LFT'),
('W1','RFT'),
('W1','Urine Routine'),
('W1','TSH'),
('W5','Testosterone'),
('W5','LH'),
('W5','FSH'),
('W5','Prolactin'),
('W5','DHEA-S'),
('W5','Lipid Profile'),
('C1','CBC'),
('C1','Lipid Profile'),
('C1','LFT'),
('C1','RFT'),
('C1','FBS'),
('C1','TSH'),
('CH1','CBC'),
('CH1','Urine Routine'),
('CH1','Vitamin D'),
('CH1','Iron Studies'),
('SM1','CBC'),
('SM1','FBS'),
('SM1','HbA1c'),
('SM1','Lipid Profile'),
('SM1','LFT'),
('SM1','RFT'),
('SM1','Urine Routine'),
('SM1','TSH'),
('SW1','CBC'),
('SW1','FBS'),
('SW1','HbA1c'),
('SW1','Lipid Profile'),
('SW1','LFT'),
('SW1','RFT'),
('SW1','Urine Routine'),
('SW1','TSH'),
('V1','Vitamin D (25-OH)'),
('V1','Vitamin B12'),
('V2','Vitamin B1'),
('V2','Vitamin B2'),
('V2','Vitamin B3'),
('V2','Vitamin B5'),
('V2','Vitamin B6'),
('V2','Vitamin B7'),
('V2','Vitamin B9'),
('V2','Vitamin B12'),
('V4','Iron'),
('V4','TIBC'),
('V4','UIBC'),
('V4','Ferritin'),
('V4','Vitamin B12'),
('V4','Folate');

INSERT IGNORE INTO package_included_tests (package_id, test_name)
SELECT tp.id, LEFT(ts.test_name, 255)
FROM tmp_package_test_seed ts
JOIN test_packages tp ON tp.package_code = ts.package_code;

DROP TEMPORARY TABLE IF EXISTS tmp_package_test_seed;

-- Promotions normalized table
CREATE TABLE IF NOT EXISTS promotions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NULL,
    description TEXT NULL,
    discount_type ENUM('percentage','fixed') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_value DECIMAL(10,2) NULL DEFAULT 0,
    max_discount_amount DECIMAL(10,2) NULL,
    valid_from DATE NULL,
    valid_until DATE NULL,
    applicable_categories JSON NULL,
    usage_limit INT NULL,
    usage_count INT NULL DEFAULT 0,
    user_limit INT NULL DEFAULT 1,
    image_url VARCHAR(500) NULL,
    banner_text VARCHAR(255) NULL,
    active BIT(1) NOT NULL DEFAULT b'1',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_promotions_active (active),
    INDEX idx_promotions_valid_until (valid_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP PROCEDURE IF EXISTS ExecIfTableExists;
DELIMITER //
CREATE PROCEDURE ExecIfTableExists(IN p_table VARCHAR(64), IN p_sql LONGTEXT)
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_name = p_table
    ) THEN
        SET @sql_text = p_sql;
        PREPARE stmt FROM @sql_text;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

-- Backfill promotions from coupons if coupons table exists
CALL ExecIfTableExists(
    'coupons',
    'INSERT INTO promotions
     (code, title, description, discount_type, discount_value, min_order_value, max_discount_amount,
      valid_from, valid_until, usage_limit, usage_count, user_limit, active, banner_text)
     SELECT
       c.coupon_code,
       COALESCE(c.coupon_name, c.coupon_code),
       c.description,
       CASE WHEN c.discount_type = ''PERCENTAGE'' THEN ''percentage'' ELSE ''fixed'' END,
       COALESCE(c.discount_value, 0),
       COALESCE(c.min_order_amount, 0),
       c.max_discount_amount,
       c.start_date,
       c.expiry_date,
       c.max_uses,
       COALESCE(c.current_uses, 0),
       COALESCE(c.max_uses_per_user, 1),
       IF(COALESCE(c.is_active, 1) = 1, b''1'', b''0''),
       c.coupon_name
     FROM coupons c
     ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       description = VALUES(description),
       discount_type = VALUES(discount_type),
       discount_value = VALUES(discount_value),
       min_order_value = VALUES(min_order_value),
       max_discount_amount = VALUES(max_discount_amount),
       valid_from = VALUES(valid_from),
       valid_until = VALUES(valid_until),
       usage_limit = VALUES(usage_limit),
       usage_count = VALUES(usage_count),
       user_limit = VALUES(user_limit),
       active = VALUES(active),
       banner_text = VALUES(banner_text)'
);

-- Collection centers normalized table
CREATE TABLE IF NOT EXISTS collection_centers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    center_code VARCHAR(50) NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    country VARCHAR(100) NULL,
    postal_code VARCHAR(20) NULL,
    phone VARCHAR(30) NULL,
    email VARCHAR(100) NULL,
    latitude DECIMAL(11,8) NULL,
    longitude DECIMAL(11,8) NULL,
    directions VARCHAR(500) NULL,
    home_collection_available BIT(1) NOT NULL DEFAULT b'0',
    active BIT(1) NOT NULL DEFAULT b'1',
    source_table VARCHAR(50) NULL,
    source_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_collection_center_source (source_table, source_id),
    INDEX idx_collection_centers_city (city),
    INDEX idx_collection_centers_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Backfill from lab_locations (if table exists)
CALL ExecIfTableExists(
    'lab_locations',
    'INSERT INTO collection_centers
     (center_code, name, address, city, state, country, postal_code, phone, email, latitude, longitude,
      home_collection_available, active, source_table, source_id)
     SELECT
       CONCAT(''LC-'', ll.id),
       ll.name,
       ll.address,
       ll.city,
       ll.state,
       ll.country,
       ll.pincode,
       ll.phone,
       ll.email,
       ll.latitude,
       ll.longitude,
       IF(COALESCE(ll.is_home_collection_available, 0) = 1, b''1'', b''0''),
       IF(COALESCE(ll.is_active, 1) = 1, b''1'', b''0''),
       ''lab_locations'',
       ll.id
     FROM lab_locations ll
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       address = VALUES(address),
       city = VALUES(city),
       state = VALUES(state),
       country = VALUES(country),
       postal_code = VALUES(postal_code),
       phone = VALUES(phone),
       email = VALUES(email),
       latitude = VALUES(latitude),
       longitude = VALUES(longitude),
       home_collection_available = VALUES(home_collection_available),
       active = VALUES(active)'
);

-- Backfill from lab_partners (if table exists)
CALL ExecIfTableExists(
    'lab_partners',
    'INSERT INTO collection_centers
     (center_code, name, address, city, state, country, postal_code, phone, email, latitude, longitude,
      home_collection_available, active, source_table, source_id)
     SELECT
       CONCAT(''LP-'', lp.id),
       lp.lab_name,
       COALESCE(lp.address, ''Address unavailable''),
       lp.city,
       NULL,
       ''India'',
       NULL,
       lp.phone,
       lp.email,
       lp.latitude,
       lp.longitude,
       IF(COALESCE(lp.home_collection, 0) = 1, b''1'', b''0''),
       IF(COALESCE(lp.is_active, 1) = 1, b''1'', b''0''),
       ''lab_partners'',
       lp.id
     FROM lab_partners lp
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       address = VALUES(address),
       city = VALUES(city),
       phone = VALUES(phone),
       email = VALUES(email),
       latitude = VALUES(latitude),
       longitude = VALUES(longitude),
       home_collection_available = VALUES(home_collection_available),
       active = VALUES(active)'
);

DROP PROCEDURE IF EXISTS ExecIfTableExists;
