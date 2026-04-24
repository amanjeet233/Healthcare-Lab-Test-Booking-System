package com.healthcare.labtestbooking.exception;

public class InvalidBookingException extends RuntimeException {

    public InvalidBookingException(String message) {
        super(message);
    }

    public InvalidBookingException(String fieldName, String reason) {
        super("Invalid booking - " + fieldName + ": " + reason);
    }
}
