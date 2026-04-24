package com.healthcare.labtestbooking.entity.converter;

import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter that handles case-insensitive mapping between
 * MySQL enum('booked','sample_collected',...) and Java BookingStatus.BOOKED etc.
 */
@Converter(autoApply = true)
public class BookingStatusConverter implements AttributeConverter<BookingStatus, String> {

    @Override
    public String convertToDatabaseColumn(BookingStatus attribute) {
        return attribute == null ? "booked" : attribute.name().toLowerCase();
    }

    @Override
    public BookingStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return BookingStatus.BOOKED;
        }
        try {
            return BookingStatus.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            return BookingStatus.BOOKED;
        }
    }
}
