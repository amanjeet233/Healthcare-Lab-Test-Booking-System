package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignTechnicianRequest {
    @NotNull(message = "Technician ID is required")
    private Long technicianId;
}
