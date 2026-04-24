package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ShareReportRequest {
    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String accessType; // view | download
}

