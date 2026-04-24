-- Align cart_items.item_type DB type with JPA mapping (String converter)
-- Previous schema used MySQL ENUM('lab_test','test_package')
-- Hibernate validation expects VARCHAR for converted enum field.

ALTER TABLE cart_items
    MODIFY COLUMN item_type VARCHAR(255) NOT NULL;

