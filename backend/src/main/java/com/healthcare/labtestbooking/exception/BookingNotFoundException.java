package com.healthcare.labtestbooking.exception;

public class BookingNotFoundException extends RuntimeException {

    public BookingNotFoundException(String message) {
        super(message);
    }

    public BookingNotFoundException(Long bookingId) {
        super("Booking not found with id: " + bookingId);
    }

    public BookingNotFoundException(String fieldName, String fieldValue) {
        super("Booking not found with " + fieldName + ": " + fieldValue);
    }
}
