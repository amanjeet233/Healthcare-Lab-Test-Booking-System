package com.healthcare.labtestbooking.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Generic API Response Wrapper
 * ✅ Standardized response format for all endpoints
 * ✅ Supports simple and paginated responses
 * ✅ Flexible with generic type T
 * ✅ Helper methods for creating responses
 */
@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)  // ✅ Exclude null fields from JSON
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private Long totalElements;  // For paginated responses
    private Integer totalPages;  // For paginated responses
    private Integer currentPage; // For paginated responses

    /**
     * ✅ Constructor for simple non-paginated responses
     */
    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    /**
     * ✅ Constructor for paginated responses
     */
    public ApiResponse(boolean success, String message, T data,
                      Long totalElements, Integer totalPages) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
    }

    /**
     * ✅ Constructor for paginated responses with current page
     */
    public ApiResponse(boolean success, String message, T data,
                      Long totalElements, Integer totalPages, Integer currentPage) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.currentPage = currentPage;
    }

    // ============ HELPER STATIC METHODS ============

    /**
     * ✅ Create successful simple response
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    /**
     * ✅ Create successful response (default message)
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Success", data);
    }

    /**
     * ✅ Create successful paginated response
     */
    public static <T> ApiResponse<T> successPaginated(String message, T data,
                                                       Long totalElements,
                                                       Integer totalPages,
                                                       Integer currentPage) {
        return new ApiResponse<>(true, message, data, totalElements, totalPages, currentPage);
    }

    /**
     * ✅ Create error response
     */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }

    /**
     * ✅ Create error response with data
     */
    public static <T> ApiResponse<T> error(String message, T errorData) {
        return new ApiResponse<>(false, message, errorData);
    }

    /**
     * ✅ Create validation error response
     */
    public static <T> ApiResponse<T> validationError(String message, T errors) {
        ApiResponse<T> response = new ApiResponse<>(false, message, errors);
        return response;
    }
}
