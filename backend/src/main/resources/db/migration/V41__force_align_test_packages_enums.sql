-- Force-align enum definitions for test_packages to match Java enums.
-- Uses direct ALTER statements for deterministic execution under Flyway.

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

ALTER TABLE test_packages
    MODIFY COLUMN package_tier ENUM(
        'BASIC',
        'SILVER',
        'GOLD',
        'PLATINUM',
        'DIAMOND',
        'ADVANCED'
    ) NULL;
