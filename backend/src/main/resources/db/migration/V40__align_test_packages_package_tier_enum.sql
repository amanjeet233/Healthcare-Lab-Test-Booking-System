-- Align test_packages.package_tier enum with PackageTier Java enum.

DELIMITER //

CREATE PROCEDURE AlignTestPackagesPackageTierEnum()
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'test_packages'
          AND column_name = 'package_tier'
    ) THEN
        ALTER TABLE test_packages
            MODIFY COLUMN package_tier ENUM(
                'BASIC',
                'SILVER',
                'GOLD',
                'PLATINUM',
                'DIAMOND',
                'ADVANCED'
            ) NULL;
    END IF;
END //

DELIMITER ;

CALL AlignTestPackagesPackageTierEnum();
DROP PROCEDURE IF EXISTS AlignTestPackagesPackageTierEnum;
