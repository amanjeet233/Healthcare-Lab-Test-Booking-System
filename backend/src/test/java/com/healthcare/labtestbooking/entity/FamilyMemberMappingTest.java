package com.healthcare.labtestbooking.entity;

import jakarta.persistence.Column;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class FamilyMemberMappingTest {

    @Test
    void firstNameFieldShouldMapToFirstNameColumn() throws NoSuchFieldException {
        Field firstNameField = FamilyMember.class.getDeclaredField("firstName");
        Column column = firstNameField.getAnnotation(Column.class);

        assertNotNull(column, "firstName field must have @Column annotation");
        assertEquals("first_name", column.name(), "firstName should map to first_name DB column");
    }

    @Test
    void syncNameFieldsShouldPopulateFirstNameFromName() throws Exception {
        FamilyMember familyMember = FamilyMember.builder()
                .name("Ankit Kumar")
                .build();

        Method syncMethod = FamilyMember.class.getDeclaredMethod("syncNameFields");
        syncMethod.setAccessible(true);
        syncMethod.invoke(familyMember);

        assertEquals("Ankit", familyMember.getFirstName());
        assertEquals("Ankit Kumar", familyMember.getName());
    }
}
