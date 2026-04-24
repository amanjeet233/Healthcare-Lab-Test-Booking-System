package com.healthcare.labtestbooking.entity.converter;

import com.healthcare.labtestbooking.entity.enums.PaymentStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Locale;

/**
 * Case-insensitive mapping for payment status columns.
 * Reads legacy lowercase values such as "pending" and writes canonical uppercase names.
 */
@Converter(autoApply = true)
public class PaymentStatusConverter implements AttributeConverter<PaymentStatus, String> {

    @Override
    public String convertToDatabaseColumn(PaymentStatus attribute) {
        return attribute == null ? null : attribute.name();
    }

    @Override
    public PaymentStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return PaymentStatus.PENDING;
        }

        try {
            return PaymentStatus.valueOf(dbData.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return PaymentStatus.PENDING;
        }
    }
}