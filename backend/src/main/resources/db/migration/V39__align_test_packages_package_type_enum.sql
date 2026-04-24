-- Align test_packages.package_type enum with PackageType Java enum
-- Includes both legacy and new package families used by HealthPackagesDataLoader.

DELIMITER //

CREATE PROCEDURE AlignTestPackagesPackageTypeEnum()
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'test_packages'
          AND column_name = 'package_type'
    ) THEN
        ALTER TABLE test_packages
            MODIFY COLUMN package_type ENUM(
                'AGE_BASED',
                'GENDER_BASED',
                'PROFESSION_BASED',
                'DISEASE_SPECIFIC',
                'WELLNESS',
                'PREVENTIVE',
                'CORPORATE',
                'FAMILY',
                'MEN',
                'WOMEN',
                'COUPLE',
                'CHILD',
                'SENIOR_MEN',
                'SENIOR_WOMEN',
                'VITAMINS'
            ) NULL;
    END IF;
END //

DELIMITER ;

CALL AlignTestPackagesPackageTypeEnum();
DROP PROCEDURE IF EXISTS AlignTestPackagesPackageTypeEnum;
