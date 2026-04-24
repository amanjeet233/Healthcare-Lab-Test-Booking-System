package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.*;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResultRequest {
    @NotNull(message = "Booking ID is required")
    @Positive(message = "Booking ID must be positive")
    private Long bookingId;

    @Positive(message = "Technician ID must be positive")
    private Long technicianId;

    @NotNull(message = "Results are required")
    @Size(min = 1, message = "At least one result item is required")
    @Valid
    private List<ResultItem> results;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResultItem {
        @NotNull(message = "Parameter ID is required")
        @Positive(message = "Parameter ID must be positive")
        private Long parameterId;

        @NotBlank(message = "Result value is required")
        @Size(max = 250, message = "Result value must be at most 250 characters")
        private String resultValue;

        @Size(max = 50, message = "Unit must be at most 50 characters")
        private String unit;

        @Size(max = 250, message = "Normal range must be at most 250 characters")
        private String normalRange;

        @Size(max = 250, message = "Notes must be at most 250 characters")
        private String notes;

        private String status;
    }
}
