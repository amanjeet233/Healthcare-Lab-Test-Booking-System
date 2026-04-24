package com.healthcare.labtestbooking.entity.converter;

import com.healthcare.labtestbooking.entity.enums.CollectionType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter that handles case-insensitive mapping between
 * MySQL enum('home','lab') and Java CollectionType.HOME/LAB.
 * This prevents "No enum constant" crashes when DB stores lowercase values.
 */
@Converter(autoApply = true)
public class CollectionTypeConverter implements AttributeConverter<CollectionType, String> {

    @Override
    public String convertToDatabaseColumn(CollectionType attribute) {
        return attribute == null ? "lab" : attribute.name().toLowerCase();
    }

    @Override
    public CollectionType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return CollectionType.LAB;
        }
        try {
            return CollectionType.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            return CollectionType.LAB;
        }
    }
}
