package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "email is required")
    @Size(max = 250, message = "email must be at most 250 characters")
    private String email;

    @NotBlank(message = "password is required")
    @Size(max = 250, message = "password must be at most 250 characters")
    private String password;
}
