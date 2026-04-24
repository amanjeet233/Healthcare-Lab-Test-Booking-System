package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {

    @NotBlank(message = "token is required")
    @Size(max = 250, message = "token must be at most 250 characters")
    private String token;

    @NotBlank(message = "newPassword is required")
    @Size(max = 250, message = "newPassword must be at most 250 characters")
    private String newPassword;
}
