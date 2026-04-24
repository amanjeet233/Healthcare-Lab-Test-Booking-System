package com.healthcare.labtestbooking.entity.converter;

import com.healthcare.labtestbooking.entity.Cart;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Locale;

@Converter
public class CartStatusConverter implements AttributeConverter<Cart.CartStatus, String> {

    @Override
    public String convertToDatabaseColumn(Cart.CartStatus attribute) {
        return attribute == null ? null : attribute.name();
    }

    @Override
    public Cart.CartStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return Cart.CartStatus.ACTIVE;
        }

        return Cart.CartStatus.valueOf(dbData.trim().toUpperCase(Locale.ROOT));
    }
}
