-- Seed full package catalog (Men, Women, Couple, Child, Senior, Vitamins)
-- Idempotent via package_code unique key + ON DUPLICATE KEY UPDATE

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

CALL AddColumnSafely('test_packages', 'age_group', 'VARCHAR(20) NULL');
CALL AddColumnSafely('test_packages', 'gender_applicable', 'VARCHAR(20) NULL');
CALL AddColumnSafely('test_packages', 'base_price', 'DECIMAL(10,2) NULL');
CALL AddColumnSafely('test_packages', 'savings_amount', 'DECIMAL(10,2) NULL');
CALL AddColumnSafely('test_packages', 'turnaround_hours', 'INT NULL');
CALL AddColumnSafely('test_packages', 'sample_types', 'VARCHAR(255) NULL');
CALL AddColumnSafely('test_packages', 'fasting_required', 'BIT(1) NULL');
CALL AddColumnSafely('test_packages', 'fasting_hours', 'INT NULL');
CALL AddColumnSafely('test_packages', 'home_collection_available', 'BIT(1) NULL');
CALL AddColumnSafely('test_packages', 'home_collection_charges', 'DECIMAL(10,2) NULL');
CALL AddColumnSafely('test_packages', 'doctor_consultations', 'INT NULL');
CALL AddColumnSafely('test_packages', 'imaging_included', 'BIT(1) NULL');
CALL AddColumnSafely('test_packages', 'genetic_testing', 'BIT(1) NULL');
CALL AddColumnSafely('test_packages', 'best_for', 'TEXT NULL');
CALL AddColumnSafely('test_packages', 'is_popular', 'BIT(1) NULL');
CALL AddColumnSafely('test_packages', 'is_recommended', 'BIT(1) NULL');
CALL AddColumnSafely('test_packages', 'display_order', 'INT NULL');
CALL AddColumnSafely('test_packages', 'badge_text', 'VARCHAR(100) NULL');
CALL AddColumnSafely('test_packages', 'health_condition', 'VARCHAR(255) NULL');
CALL AddColumnSafely('test_packages', 'profession_applicable', 'VARCHAR(255) NULL');

CREATE TEMPORARY TABLE tmp_package_seed (
    package_code VARCHAR(50) PRIMARY KEY,
    package_name VARCHAR(255) NOT NULL,
    package_type VARCHAR(30) NOT NULL,
    package_tier VARCHAR(20) NOT NULL,
    discounted_price DECIMAL(10,2) NOT NULL,
    turnaround_hours INT NOT NULL,
    fasting_required TINYINT(1) NOT NULL,
    fasting_hours INT NULL,
    total_tests INT NOT NULL,
    age_group VARCHAR(20) NOT NULL,
    gender_applicable VARCHAR(20) NOT NULL,
    display_order INT NOT NULL
);

INSERT INTO tmp_package_seed
(package_code, package_name, package_type, package_tier, discounted_price, turnaround_hours, fasting_required, fasting_hours, total_tests, age_group, gender_applicable, display_order)
VALUES
-- MEN (25)
('M1','Men''s Basic Silver Package','MEN','SILVER',999,48,1,8,20,'YOUNG_ADULT','MALE',1001),
('M2','Men''s Cardiac Silver Package','MEN','SILVER',1499,48,1,8,20,'YOUNG_ADULT','MALE',1002),
('M3','Men''s Diabetes Silver Package','MEN','SILVER',1299,48,1,8,20,'YOUNG_ADULT','MALE',1003),
('M4','Men''s Liver Silver Package','MEN','SILVER',1199,48,1,8,20,'YOUNG_ADULT','MALE',1004),
('M5','Men''s Kidney Silver Package','MEN','SILVER',999,48,1,8,20,'YOUNG_ADULT','MALE',1005),
('M6','Men''s Thyroid Silver Package','MEN','SILVER',899,48,0,NULL,20,'YOUNG_ADULT','MALE',1006),
('M7','Men''s Sexual Health Silver','MEN','SILVER',1499,48,0,NULL,20,'YOUNG_ADULT','MALE',1007),
('M8','Men''s Fitness Silver Package','MEN','SILVER',1299,48,1,8,20,'YOUNG_ADULT','MALE',1008),
('M9','Men''s Health Gold Package','MEN','GOLD',2499,48,1,8,35,'YOUNG_ADULT','MALE',1009),
('M10','Men''s Cardiac Gold Package','MEN','GOLD',2999,48,1,8,35,'YOUNG_ADULT','MALE',1010),
('M11','Men''s Diabetes Gold Package','MEN','GOLD',2799,48,1,8,35,'YOUNG_ADULT','MALE',1011),
('M12','Men''s Liver Gold Package','MEN','GOLD',2499,48,1,8,35,'YOUNG_ADULT','MALE',1012),
('M13','Men''s Kidney Gold Package','MEN','GOLD',2299,48,1,8,35,'YOUNG_ADULT','MALE',1013),
('M14','Men''s Hormone Gold Package','MEN','GOLD',3499,48,0,NULL,35,'YOUNG_ADULT','MALE',1014),
('M15','Men''s Fertility Gold Package','MEN','GOLD',3999,48,0,NULL,35,'YOUNG_ADULT','MALE',1015),
('M16','Men''s Prostate Gold Package','MEN','GOLD',2999,48,0,NULL,35,'YOUNG_ADULT','MALE',1016),
('M17','Men''s Complete Platinum Package','MEN','PLATINUM',4999,72,1,8,60,'YOUNG_ADULT','MALE',1017),
('M18','Men''s Executive Platinum Package','MEN','PLATINUM',6999,72,1,8,60,'YOUNG_ADULT','MALE',1018),
('M19','Men''s Cardiac Platinum Package','MEN','PLATINUM',5999,72,1,8,60,'YOUNG_ADULT','MALE',1019),
('M20','Men''s Anti-Aging Platinum','MEN','PLATINUM',6499,72,1,8,60,'MIDDLE_AGE','MALE',1020),
('M21','Men''s Ultimate Advanced Package','MEN','ADVANCED',8999,96,1,8,100,'MIDDLE_AGE','MALE',1021),
('M22','Men''s Sports Advanced Package','MEN','ADVANCED',7999,72,1,8,100,'YOUNG_ADULT','MALE',1022),
('M23','Men''s Corporate Advanced','MEN','ADVANCED',7499,72,1,8,100,'MIDDLE_AGE','MALE',1023),
('M24','Men''s Wellness Advanced','MEN','ADVANCED',6999,72,1,8,100,'MIDDLE_AGE','MALE',1024),
('M25','Men''s Preventive Advanced','MEN','ADVANCED',7999,72,1,8,100,'MIDDLE_AGE','MALE',1025),

-- WOMEN (28)
('W1','Women''s Basic Silver Package','WOMEN','SILVER',999,48,1,8,20,'YOUNG_ADULT','FEMALE',2001),
('W2','Women''s Cardiac Silver Package','WOMEN','SILVER',1499,48,1,8,20,'YOUNG_ADULT','FEMALE',2002),
('W3','Women''s Thyroid Silver Package','WOMEN','SILVER',899,48,0,NULL,20,'YOUNG_ADULT','FEMALE',2003),
('W4','Women''s Anemia Silver Package','WOMEN','SILVER',999,48,1,8,20,'YOUNG_ADULT','FEMALE',2004),
('W5','Women''s PCOS Silver Package','WOMEN','SILVER',1499,48,0,NULL,20,'YOUNG_ADULT','FEMALE',2005),
('W6','Women''s Fertility Silver Package','WOMEN','SILVER',1999,48,0,NULL,20,'YOUNG_ADULT','FEMALE',2006),
('W7','Women''s Pregnancy Silver Package','WOMEN','SILVER',1499,24,0,NULL,20,'YOUNG_ADULT','FEMALE',2007),
('W8','Women''s Bone Health Silver','WOMEN','SILVER',999,48,0,NULL,20,'YOUNG_ADULT','FEMALE',2008),
('W9','Women''s Health Gold Package','WOMEN','GOLD',2799,48,1,8,35,'YOUNG_ADULT','FEMALE',2009),
('W10','Women''s Cardiac Gold Package','WOMEN','GOLD',2999,48,1,8,35,'YOUNG_ADULT','FEMALE',2010),
('W11','Women''s PCOS Gold Package','WOMEN','GOLD',3499,48,0,NULL,35,'YOUNG_ADULT','FEMALE',2011),
('W12','Women''s Fertility Gold Package','WOMEN','GOLD',3999,48,0,NULL,35,'YOUNG_ADULT','FEMALE',2012),
('W13','Women''s Pregnancy Gold Package','WOMEN','GOLD',2999,48,0,NULL,35,'YOUNG_ADULT','FEMALE',2013),
('W14','Women''s Menopause Gold Package','WOMEN','GOLD',3499,48,1,8,35,'MIDDLE_AGE','FEMALE',2014),
('W15','Women''s Breast Health Gold','WOMEN','GOLD',2499,48,0,NULL,35,'YOUNG_ADULT','FEMALE',2015),
('W16','Women''s Bone Health Gold','WOMEN','GOLD',2799,48,0,NULL,35,'YOUNG_ADULT','FEMALE',2016),
('W17','Women''s Complete Platinum Package','WOMEN','PLATINUM',5499,72,1,8,60,'YOUNG_ADULT','FEMALE',2017),
('W18','Women''s Executive Platinum Package','WOMEN','PLATINUM',7499,72,1,8,60,'MIDDLE_AGE','FEMALE',2018),
('W19','Women''s PCOS Platinum Package','WOMEN','PLATINUM',6499,72,0,NULL,60,'YOUNG_ADULT','FEMALE',2019),
('W20','Women''s Pregnancy Platinum Package','WOMEN','PLATINUM',5999,72,0,NULL,60,'YOUNG_ADULT','FEMALE',2020),
('W21','Women''s Oncology Platinum Package','WOMEN','PLATINUM',6999,72,0,NULL,60,'MIDDLE_AGE','FEMALE',2021),
('W22','Women''s Anti-Aging Platinum','WOMEN','PLATINUM',6499,72,1,8,60,'MIDDLE_AGE','FEMALE',2022),
('W23','Women''s Ultimate Advanced Package','WOMEN','ADVANCED',9999,96,1,8,100,'MIDDLE_AGE','FEMALE',2023),
('W24','Women''s Maternity Advanced','WOMEN','ADVANCED',8999,96,0,NULL,100,'YOUNG_ADULT','FEMALE',2024),
('W25','Women''s Corporate Advanced','WOMEN','ADVANCED',7999,72,1,8,100,'MIDDLE_AGE','FEMALE',2025),
('W26','Women''s Wellness Advanced','WOMEN','ADVANCED',7499,72,1,8,100,'MIDDLE_AGE','FEMALE',2026),
('W27','Women''s Preventive Advanced','WOMEN','ADVANCED',8499,72,1,8,100,'MIDDLE_AGE','FEMALE',2027),
('W28','Women''s Postnatal Advanced','WOMEN','ADVANCED',6999,72,1,8,100,'YOUNG_ADULT','FEMALE',2028),

-- COUPLE (15)
('C1','Couple Basic Silver Package','COUPLE','SILVER',2999,48,1,8,20,'YOUNG_ADULT','ALL',3001),
('C2','Couple Cardiac Silver','COUPLE','SILVER',3499,48,1,8,20,'YOUNG_ADULT','ALL',3002),
('C3','Couple Diabetes Silver','COUPLE','SILVER',3299,48,1,8,20,'YOUNG_ADULT','ALL',3003),
('C4','Couple Thyroid Silver','COUPLE','SILVER',2999,48,0,NULL,20,'YOUNG_ADULT','ALL',3004),
('C5','Couple Vitamin Silver','COUPLE','SILVER',2799,48,1,8,20,'YOUNG_ADULT','ALL',3005),
('C6','Couple Health Gold Package','COUPLE','GOLD',5999,48,1,8,35,'YOUNG_ADULT','ALL',3006),
('C7','Couple Fertility Gold Package','COUPLE','GOLD',6999,48,0,NULL,35,'YOUNG_ADULT','ALL',3007),
('C8','Couple Pre-Marriage Gold','COUPLE','GOLD',6499,48,1,8,35,'YOUNG_ADULT','ALL',3008),
('C9','Couple Lifestyle Gold','COUPLE','GOLD',5499,48,1,8,35,'YOUNG_ADULT','ALL',3009),
('C10','Couple Complete Platinum Package','COUPLE','PLATINUM',9999,72,1,8,60,'YOUNG_ADULT','ALL',3010),
('C11','Couple Fertility Platinum','COUPLE','PLATINUM',12999,72,0,NULL,60,'YOUNG_ADULT','ALL',3011),
('C12','Couple Wellness Platinum','COUPLE','PLATINUM',8999,72,1,8,60,'YOUNG_ADULT','ALL',3012),
('C13','Couple Ultimate Advanced','COUPLE','ADVANCED',14999,96,1,8,100,'MIDDLE_AGE','ALL',3013),
('C14','Couple Prenatal Advanced','COUPLE','ADVANCED',12999,96,0,NULL,100,'YOUNG_ADULT','ALL',3014),
('C15','Couple Executive Advanced','COUPLE','ADVANCED',13999,72,1,8,100,'MIDDLE_AGE','ALL',3015),

-- CHILD (18)
('CH1','Child Basic Silver (1-5 years)','CHILD','SILVER',599,24,0,NULL,20,'PEDIATRIC','ALL',4001),
('CH2','Child Basic Silver (6-12 years)','CHILD','SILVER',799,24,0,NULL,20,'PEDIATRIC','ALL',4002),
('CH3','Child Basic Silver (13-17 years)','CHILD','SILVER',999,24,1,8,20,'PEDIATRIC','ALL',4003),
('CH4','Child Growth Silver','CHILD','SILVER',999,24,0,NULL,20,'PEDIATRIC','ALL',4004),
('CH5','Child Nutrition Silver','CHILD','SILVER',799,24,0,NULL,20,'PEDIATRIC','ALL',4005),
('CH6','Child Immunity Silver','CHILD','SILVER',899,24,0,NULL,20,'PEDIATRIC','ALL',4006),
('CH7','Child Health Gold (1-5 years)','CHILD','GOLD',1499,48,0,NULL,35,'PEDIATRIC','ALL',4007),
('CH8','Child Health Gold (6-12 years)','CHILD','GOLD',1999,48,1,8,35,'PEDIATRIC','ALL',4008),
('CH9','Child Health Gold (13-17 years)','CHILD','GOLD',2499,48,1,8,35,'PEDIATRIC','ALL',4009),
('CH10','Child Sports Gold','CHILD','GOLD',1999,48,1,8,35,'PEDIATRIC','ALL',4010),
('CH11','Child Allergy Gold','CHILD','GOLD',2499,48,0,NULL,35,'PEDIATRIC','ALL',4011),
('CH12','Child Development Gold','CHILD','GOLD',2799,48,0,NULL,35,'PEDIATRIC','ALL',4012),
('CH13','Child Complete Platinum (1-5 years)','CHILD','PLATINUM',2999,48,0,NULL,60,'PEDIATRIC','ALL',4013),
('CH14','Child Complete Platinum (6-12 years)','CHILD','PLATINUM',3999,48,1,8,60,'PEDIATRIC','ALL',4014),
('CH15','Child Complete Platinum (13-17 years)','CHILD','PLATINUM',4999,48,1,8,60,'PEDIATRIC','ALL',4015),
('CH16','Child Ultimate Advanced','CHILD','ADVANCED',6999,72,1,8,100,'PEDIATRIC','ALL',4016),
('CH17','Child Special Needs Advanced','CHILD','ADVANCED',5999,72,0,NULL,100,'PEDIATRIC','ALL',4017),
('CH18','Child Obesity Advanced','CHILD','ADVANCED',5499,48,1,8,100,'PEDIATRIC','ALL',4018),

-- SENIOR MEN (15)
('SM1','Senior Men Basic Silver (60+ years)','SENIOR_MEN','SILVER',1499,48,1,8,20,'SENIOR','MALE',5001),
('SM2','Senior Men Cardiac Silver','SENIOR_MEN','SILVER',1999,48,1,8,20,'SENIOR','MALE',5002),
('SM3','Senior Men Diabetes Silver','SENIOR_MEN','SILVER',1799,48,1,8,20,'SENIOR','MALE',5003),
('SM4','Senior Men Kidney Silver','SENIOR_MEN','SILVER',1599,48,1,8,20,'SENIOR','MALE',5004),
('SM5','Senior Men Prostate Silver','SENIOR_MEN','SILVER',1999,48,0,NULL,20,'SENIOR','MALE',5005),
('SM6','Senior Men Bone Silver','SENIOR_MEN','SILVER',1499,48,0,NULL,20,'SENIOR','MALE',5006),
('SM7','Senior Men Thyroid Silver','SENIOR_MEN','SILVER',999,48,0,NULL,20,'SENIOR','MALE',5007),
('SM8','Senior Men Health Gold','SENIOR_MEN','GOLD',3499,48,1,8,35,'SENIOR','MALE',5008),
('SM9','Senior Men Cardiac Gold','SENIOR_MEN','GOLD',3999,48,1,8,35,'SENIOR','MALE',5009),
('SM10','Senior Men Comprehensive Gold','SENIOR_MEN','GOLD',4499,48,1,8,35,'SENIOR','MALE',5010),
('SM11','Senior Men Complete Platinum','SENIOR_MEN','PLATINUM',5999,72,1,8,60,'SENIOR','MALE',5011),
('SM12','Senior Men Executive Platinum','SENIOR_MEN','PLATINUM',6999,72,1,8,60,'SENIOR','MALE',5012),
('SM13','Senior Men Wellness Platinum','SENIOR_MEN','PLATINUM',5499,72,1,8,60,'SENIOR','MALE',5013),
('SM14','Senior Men Ultimate Advanced','SENIOR_MEN','ADVANCED',8999,96,1,8,100,'SENIOR','MALE',5014),
('SM15','Senior Men Preventive Advanced','SENIOR_MEN','ADVANCED',7999,72,1,8,100,'SENIOR','MALE',5015),

-- SENIOR WOMEN (15)
('SW1','Senior Women Basic Silver (60+ years)','SENIOR_WOMEN','SILVER',1499,48,1,8,20,'SENIOR','FEMALE',6001),
('SW2','Senior Women Cardiac Silver','SENIOR_WOMEN','SILVER',1999,48,1,8,20,'SENIOR','FEMALE',6002),
('SW3','Senior Women Diabetes Silver','SENIOR_WOMEN','SILVER',1799,48,1,8,20,'SENIOR','FEMALE',6003),
('SW4','Senior Women Bone Silver','SENIOR_WOMEN','SILVER',1699,48,0,NULL,20,'SENIOR','FEMALE',6004),
('SW5','Senior Women Menopause Silver','SENIOR_WOMEN','SILVER',1999,48,0,NULL,20,'SENIOR','FEMALE',6005),
('SW6','Senior Women Thyroid Silver','SENIOR_WOMEN','SILVER',999,48,0,NULL,20,'SENIOR','FEMALE',6006),
('SW7','Senior Women Breast Silver','SENIOR_WOMEN','SILVER',1499,48,0,NULL,20,'SENIOR','FEMALE',6007),
('SW8','Senior Women Health Gold','SENIOR_WOMEN','GOLD',3499,48,1,8,35,'SENIOR','FEMALE',6008),
('SW9','Senior Women Cardiac Gold','SENIOR_WOMEN','GOLD',3999,48,1,8,35,'SENIOR','FEMALE',6009),
('SW10','Senior Women Bone Gold','SENIOR_WOMEN','GOLD',3999,48,0,NULL,35,'SENIOR','FEMALE',6010),
('SW11','Senior Women Comprehensive Gold','SENIOR_WOMEN','GOLD',4499,48,1,8,35,'SENIOR','FEMALE',6011),
('SW12','Senior Women Complete Platinum','SENIOR_WOMEN','PLATINUM',5999,72,1,8,60,'SENIOR','FEMALE',6012),
('SW13','Senior Women Executive Platinum','SENIOR_WOMEN','PLATINUM',6999,72,1,8,60,'SENIOR','FEMALE',6013),
('SW14','Senior Women Wellness Platinum','SENIOR_WOMEN','PLATINUM',5499,72,1,8,60,'SENIOR','FEMALE',6014),
('SW15','Senior Women Ultimate Advanced','SENIOR_WOMEN','ADVANCED',8999,96,1,8,100,'SENIOR','FEMALE',6015),

-- VITAMINS (20)
('V1','Basic Vitamin Silver Package','VITAMINS','SILVER',799,48,1,8,20,'ALL','ALL',7001),
('V2','Complete Vitamin B Silver','VITAMINS','SILVER',999,48,1,8,20,'ALL','ALL',7002),
('V3','Fat-Soluble Vitamin Silver','VITAMINS','SILVER',1299,48,1,8,20,'ALL','ALL',7003),
('V4','Iron & Anemia Silver','VITAMINS','SILVER',899,48,1,8,20,'ALL','ALL',7004),
('V5','Bone Health Silver','VITAMINS','SILVER',999,48,0,NULL,20,'ALL','ALL',7005),
('V6','Immunity Booster Silver','VITAMINS','SILVER',999,48,0,NULL,20,'ALL','ALL',7006),
('V7','Complete Vitamin Gold Package','VITAMINS','GOLD',1999,48,1,8,35,'ALL','ALL',7007),
('V8','Mineral Complete Gold','VITAMINS','GOLD',1999,48,0,NULL,35,'ALL','ALL',7008),
('V9','Nutrition Complete Gold','VITAMINS','GOLD',2499,48,1,8,35,'ALL','ALL',7009),
('V10','Antioxidant Gold Package','VITAMINS','GOLD',1799,48,0,NULL,35,'ALL','ALL',7010),
('V11','Energy & Metabolism Gold','VITAMINS','GOLD',1999,48,1,8,35,'ALL','ALL',7011),
('V12','Hair, Skin & Nails Gold','VITAMINS','GOLD',1799,48,0,NULL,35,'ALL','ALL',7012),
('V13','Advanced Nutrition Platinum','VITAMINS','PLATINUM',3999,48,1,8,60,'ALL','ALL',7013),
('V14','Sports Nutrition Platinum','VITAMINS','PLATINUM',4499,48,1,8,60,'ALL','ALL',7014),
('V15','Prenatal Nutrition Platinum','VITAMINS','PLATINUM',4499,48,1,8,60,'ALL','ALL',7015),
('V16','Senior Nutrition Platinum','VITAMINS','PLATINUM',3999,48,1,8,60,'ALL','ALL',7016),
('V17','Complete Nutrition Advanced','VITAMINS','ADVANCED',5999,72,1,8,100,'ALL','ALL',7017),
('V18','Clinical Nutrition Advanced','VITAMINS','ADVANCED',6999,72,1,8,100,'ALL','ALL',7018),
('V19','Weight Management Advanced','VITAMINS','ADVANCED',5499,72,1,8,100,'ALL','ALL',7019),
('V20','Therapeutic Nutrition Advanced','VITAMINS','ADVANCED',7999,72,1,8,100,'ALL','ALL',7020);

INSERT INTO test_packages
(
    package_code, package_name, description, package_type, package_tier, age_group, gender_applicable,
    total_tests, base_price, total_price, discounted_price, discount_percentage, savings_amount,
    turnaround_hours, sample_types, fasting_required, fasting_hours, home_collection_available,
    doctor_consultations, imaging_included, genetic_testing, best_for, is_active, is_popular, is_recommended,
    display_order, badge_text, health_condition, profession_applicable
)
SELECT
    t.package_code,
    t.package_name,
    CONCAT(t.package_name, ' - Auto-seeded complete catalog package'),
    t.package_type,
    t.package_tier,
    t.age_group,
    t.gender_applicable,
    t.total_tests,
    ROUND(
        t.discounted_price / (
            1 - (CASE t.package_tier
                    WHEN 'SILVER' THEN 0.20
                    WHEN 'GOLD' THEN 0.30
                    WHEN 'PLATINUM' THEN 0.35
                    WHEN 'ADVANCED' THEN 0.45
                    ELSE 0.20
                END)
        ),
        2
    ) AS base_price,
    ROUND(
        t.discounted_price / (
            1 - (CASE t.package_tier
                    WHEN 'SILVER' THEN 0.20
                    WHEN 'GOLD' THEN 0.30
                    WHEN 'PLATINUM' THEN 0.35
                    WHEN 'ADVANCED' THEN 0.45
                    ELSE 0.20
                END)
        ),
        2
    ) AS total_price,
    t.discounted_price,
    CASE t.package_tier
        WHEN 'SILVER' THEN 20.00
        WHEN 'GOLD' THEN 30.00
        WHEN 'PLATINUM' THEN 35.00
        WHEN 'ADVANCED' THEN 45.00
        ELSE 20.00
    END AS discount_percentage,
    ROUND(
        (
            t.discounted_price / (
                1 - (CASE t.package_tier
                        WHEN 'SILVER' THEN 0.20
                        WHEN 'GOLD' THEN 0.30
                        WHEN 'PLATINUM' THEN 0.35
                        WHEN 'ADVANCED' THEN 0.45
                        ELSE 0.20
                    END)
            )
        ) - t.discounted_price,
        2
    ) AS savings_amount,
    t.turnaround_hours,
    'Blood,Urine',
    IF(t.fasting_required = 1, b'1', b'0'),
    t.fasting_hours,
    b'1',
    CASE t.package_tier
        WHEN 'SILVER' THEN 0
        WHEN 'GOLD' THEN 1
        WHEN 'PLATINUM' THEN 2
        WHEN 'ADVANCED' THEN 3
        ELSE 0
    END,
    CASE WHEN t.package_tier IN ('PLATINUM','ADVANCED') THEN b'1' ELSE b'0' END,
    CASE WHEN t.package_tier = 'ADVANCED' THEN b'1' ELSE b'0' END,
    CASE t.package_tier
        WHEN 'SILVER' THEN 'Best for annual basic checkup'
        WHEN 'GOLD' THEN 'Best for comprehensive annual checkup'
        WHEN 'PLATINUM' THEN 'Best for executive screening and risk users'
        WHEN 'ADVANCED' THEN 'Best for high-risk preventive healthcare'
        ELSE 'Best for preventive health'
    END,
    b'1',
    CASE WHEN t.package_tier IN ('GOLD','PLATINUM','ADVANCED') THEN b'1' ELSE b'0' END,
    CASE WHEN t.package_tier IN ('PLATINUM','ADVANCED') THEN b'1' ELSE b'0' END,
    t.display_order,
    t.package_tier,
    NULL,
    NULL
FROM tmp_package_seed t
ON DUPLICATE KEY UPDATE
    package_name = VALUES(package_name),
    description = VALUES(description),
    package_type = VALUES(package_type),
    package_tier = VALUES(package_tier),
    age_group = VALUES(age_group),
    gender_applicable = VALUES(gender_applicable),
    total_tests = VALUES(total_tests),
    base_price = VALUES(base_price),
    total_price = VALUES(total_price),
    discounted_price = VALUES(discounted_price),
    discount_percentage = VALUES(discount_percentage),
    savings_amount = VALUES(savings_amount),
    turnaround_hours = VALUES(turnaround_hours),
    sample_types = VALUES(sample_types),
    fasting_required = VALUES(fasting_required),
    fasting_hours = VALUES(fasting_hours),
    home_collection_available = VALUES(home_collection_available),
    doctor_consultations = VALUES(doctor_consultations),
    imaging_included = VALUES(imaging_included),
    genetic_testing = VALUES(genetic_testing),
    best_for = VALUES(best_for),
    is_active = VALUES(is_active),
    is_popular = VALUES(is_popular),
    is_recommended = VALUES(is_recommended),
    display_order = VALUES(display_order),
    badge_text = VALUES(badge_text),
    updated_at = CURRENT_TIMESTAMP;

DROP TEMPORARY TABLE IF EXISTS tmp_package_seed;
DROP PROCEDURE IF EXISTS AddColumnSafely;
