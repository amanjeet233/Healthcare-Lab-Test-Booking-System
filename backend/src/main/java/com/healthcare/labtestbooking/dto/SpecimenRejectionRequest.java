package com.healthcare.labtestbooking.dto;

import com.healthcare.labtestbooking.entity.enums.SpecimenRejectionReason;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpecimenRejectionRequest {
    @NotNull(message = "reason is required")
    private SpecimenRejectionReason reason;
    private String notes;
}
