package com.healthcare.labtestbooking.entity;

import jakarta.persistence.Column;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class UserAddressMappingTest {

    @Test
    void streetFieldShouldMapToAddressLineColumn() throws NoSuchFieldException {
        Field streetField = UserAddress.class.getDeclaredField("street");
        Column column = streetField.getAnnotation(Column.class);

        assertNotNull(column, "street field must have @Column annotation");
        assertEquals("address_line", column.name(), "street should map to legacy address_line DB column");
    }
}
