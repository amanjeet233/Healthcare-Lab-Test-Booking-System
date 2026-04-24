-- src/main/resources/db/migration/V10__Create_Tests_Tables.sql

-- ===== TESTS TABLE =====
CREATE TABLE tests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    sample_type VARCHAR(100) NOT NULL,
    fasting_required INT DEFAULT 0,
    turnaround_time VARCHAR(100) NOT NULL,
    tests_included INT DEFAULT 1,
    rating DECIMAL(2, 1) DEFAULT 4.5,
    booked_recently VARCHAR(50),
    preparation_text TEXT,
    why_booked TEXT,
    understanding_text TEXT,
    collection_text VARCHAR(255),
    collection_subtext VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_slug (slug)
);

-- ===== TEST ALIASES TABLE =====
CREATE TABLE test_aliases (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    test_id BIGINT NOT NULL,
    alias_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
    INDEX idx_test_id (test_id)
);

-- ===== TEST PARAMETERS TABLE =====
CREATE TABLE test_parameters (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    test_id BIGINT NOT NULL,
    parameter_name VARCHAR(255) NOT NULL,
    normal_range VARCHAR(255),
    unit VARCHAR(50),
    sample_type VARCHAR(100),
    `order` INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
    INDEX idx_test_id (test_id)
);

-- ===== TEST ACCREDITATIONS TABLE =====
CREATE TABLE test_accreditations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    test_id BIGINT NOT NULL,
    accreditation_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
    INDEX idx_test_id (test_id)
);

-- ===== CART TABLE =====
CREATE TABLE carts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id)
);

-- ===== CART ITEMS TABLE =====
CREATE TABLE cart_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cart_id BIGINT NOT NULL,
    test_id BIGINT NOT NULL,
    quantity INT DEFAULT 1,
    price_at_add DECIMAL(10, 2) NOT NULL,
    discount_at_add DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id),
    INDEX idx_cart_id (cart_id),
    INDEX idx_test_id (test_id),
    UNIQUE KEY unique_cart_test (cart_id, test_id)
);

-- ===== BOOKINGS TABLE =====
CREATE TABLE bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    test_id BIGINT,
    booking_reference VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_applied DECIMAL(10, 2) DEFAULT 0,
    fasting_required INT,
    sample_type VARCHAR(100),
    turnaround_time VARCHAR(100),
    scheduled_date DATETIME,
    collection_location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (test_id) REFERENCES tests(id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_reference (booking_reference)
);

-- ===== BOOKING ITEMS (For multiple tests) =====
CREATE TABLE booking_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    test_id BIGINT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id),
    INDEX idx_booking_id (booking_id)
);

-- ===== INSERT SAMPLE DATA =====
INSERT INTO tests (
    name, slug, category, description, short_description, 
    price, original_price, sample_type, fasting_required, 
    turnaround_time, tests_included, rating, booked_recently,
    preparation_text, why_booked, understanding_text,
    collection_text, collection_subtext
) VALUES
('Complete Blood Count (CBC)', 'cbc', 'blood', 
    'The CBC test provides important information about the blood components, including red blood cells, white blood cells, and platelets.',
    'Checks RBC, WBC, platelets - detects anemia, infections',
    299, 399, 'Blood', 0, '24 hours', 21, 4.8, '170,691+',
    'No special preparation required.',
    'Screen overall blood health and detect infections',
    'Blood is a specialized body fluid with four main components: plasma, red blood cells, white blood cells, and platelets.',
    'Who will collect your samples?', 'Tata 1mg certified phlebotomists'),

('Lipid Profile', 'lipid-profile', 'cardio',
    'Lipid Profile measures various types of cholesterol and triglycerides for heart health assessment.',
    'Measures cholesterol - HDL, LDL, triglycerides for heart health',
    399, 599, 'Blood', 12, '24 hours', 15, 4.9, '250,000+',
    '12 hour fast required before test.',
    'Check heart health and cholesterol levels',
    'Cholesterol is a fatty substance in blood. High levels increase heart disease risk.',
    'Who will collect your samples?', 'Tata 1mg certified phlebotomists'),

('Thyroid Profile', 'thyroid-profile', 'blood',
    'Thyroid Profile measures TSH, Free T4 to assess thyroid function.',
    'Checks thyroid hormones - detects thyroid disorders',
    449, 599, 'Blood', 0, '24 hours', 12, 4.7, '120,000+',
    'No special preparation required.',
    'Check thyroid function and hormone levels',
    'The thyroid is a small gland that produces hormones regulating metabolism.',
    'Who will collect your samples?', 'Tata 1mg certified phlebotomists'),

('Fasting Blood Sugar', 'fasting-blood-sugar', 'general',
    'Measures glucose levels after 8 hours of fasting.',
    'Measures glucose levels - screens for diabetes',
    149, 249, 'Blood', 8, '24 hours', 1, 4.8, '500,000+',
    '8 hour fast required. No food or drinks except water.',
    'Screen for diabetes and prediabetes',
    'Blood glucose is measured after fasting. Normal levels are less than 100 mg/dL.',
    'Who will collect your samples?', 'Tata 1mg certified phlebotomists'),

('Liver Function Tests', 'liver-function', 'blood',
    'Measures liver enzymes and proteins to assess liver health.',
    'ALT, AST, bilirubin - checks liver health & function',
    349, 499, 'Blood', 0, '24 hours', 18, 4.6, '180,000+',
    'No special preparation required. Fasting recommended.',
    'Check liver health and detect liver disease',
    'The liver performs vital functions including detoxification and metabolism.',
    'Who will collect your samples?', 'Tata 1mg certified phlebotomists');

-- Insert aliases for CBC
INSERT INTO test_aliases (test_id, alias_name) 
SELECT id, 'Full blood examination' FROM tests WHERE slug = 'cbc'
UNION ALL
SELECT id, 'Full blood cell count' FROM tests WHERE slug = 'cbc'
UNION ALL
SELECT id, 'Complete blood picture' FROM tests WHERE slug = 'cbc';

-- Insert parameters for CBC
INSERT INTO test_parameters (test_id, parameter_name, normal_range, unit, sample_type, `order`)
SELECT id, 'Red Blood Cells (RBC)', '4.5-5.5', 'million cells/μL', 'Blood', 1 FROM tests WHERE slug = 'cbc'
UNION ALL
SELECT id, 'White Blood Cells (WBC)', '4.5-11', 'K/μL', 'Blood', 2 FROM tests WHERE slug = 'cbc'
UNION ALL
SELECT id, 'Hemoglobin', '13.5-17.5', 'g/dL', 'Blood', 3 FROM tests WHERE slug = 'cbc'
UNION ALL
SELECT id, 'Hematocrit', '40-50', '%', 'Blood', 4 FROM tests WHERE slug = 'cbc'
UNION ALL
SELECT id, 'Platelets', '150-400', 'K/μL', 'Blood', 5 FROM tests WHERE slug = 'cbc';

-- Insert accreditations
INSERT INTO test_accreditations (test_id, accreditation_name)
SELECT id, 'Accredited labs' FROM tests
UNION ALL
SELECT id, 'Highly skilled Phlebotomists' FROM tests
UNION ALL
SELECT id, 'Verified reports' FROM tests;