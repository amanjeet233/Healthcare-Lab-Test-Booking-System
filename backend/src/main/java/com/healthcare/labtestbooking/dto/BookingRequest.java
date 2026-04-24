package com.healthcare.labtestbooking.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequest {

    @Positive(message = "Patient ID must be positive")
    private Long patientId;

    @JsonProperty("labTestId")
    @JsonAlias({"testId"})
    @Positive(message = "Test ID must be positive")
    private Long testId;

    @Positive(message = "Package ID must be positive")
    private Long packageId;

    @Positive(message = "Family member ID must be positive")
    private Long familyMemberId;

    @JsonAlias({"collectionDate", "scheduledDate"})
    @NotNull(message = "Booking date is required")
    @Future(message = "Booking date must be in the future")
    private LocalDate bookingDate;

    @JsonAlias({"scheduledTime"})
    @NotBlank(message = "Time slot is required")
    @Size(max = 50, message = "Time slot must be at most 50 characters")
    private String timeSlot;

    @Pattern(regexp = "^(HOME|LAB)$", message = "Collection type must be HOME or LAB")
    private String collectionType;

    @JsonAlias({"address"})
    @Size(max = 250, message = "Collection address must be at most 250 characters")
    private String collectionAddress;

    @DecimalMin(value = "0.0", message = "Discount cannot be negative")
    private BigDecimal discount;

    @JsonAlias({"specialNotes"})
    @Size(max = 500, message = "Notes must be at most 500 characters")
    private String notes;
}
