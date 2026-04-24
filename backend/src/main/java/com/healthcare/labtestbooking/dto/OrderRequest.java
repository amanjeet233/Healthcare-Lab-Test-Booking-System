package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {

    @NotNull(message = "Cart ID is required")
    private Long cartId;

    @NotBlank(message = "Preferred location is required")
    private String preferredLocation;

    @NotNull(message = "Preferred date is required")
    @FutureOrPresent(message = "Preferred date must be today or in the future")
    private LocalDate preferredDate;

    @NotBlank(message = "Preferred time slot is required (e.g., '09:00-10:00')")
    private String preferredTimeSlot;

    private String specialInstructions;

    @Email(message = "Invalid email format")
    private String contactEmail;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String contactPhone;
}
