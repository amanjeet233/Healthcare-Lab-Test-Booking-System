package com.healthcare.labtestbooking.exception;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standard Error Response Format
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
    
    @JsonProperty("error")
    private boolean error;
    
    @JsonProperty("code")
    private String code;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("timestamp")
    private LocalDateTime timestamp;
    
    @JsonProperty("path")
    private String path;
    
    @JsonProperty("details")
    private Object details;

    public ErrorResponse(boolean error, String code, String message, LocalDateTime timestamp, String path) {
        this.error = error;
        this.code = code;
        this.message = message;
        this.timestamp = timestamp;
        this.path = path;
    }
}
