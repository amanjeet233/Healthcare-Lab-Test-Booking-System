package com.healthcare.labtestbooking.exception;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(String message) {
        super(message);
    }

    public UserNotFoundException(Long userId) {
        super("User not found with id: " + userId);
    }

    public UserNotFoundException(String fieldName, String fieldValue) {
        super("User not found with " + fieldName + ": " + fieldValue);
    }
}
