package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;

    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Email(message = "Email should be valid")
    private String email;

    @Size(max = 50, message = "Role must be at most 50 characters")
    private String role;

    @Pattern(regexp = "^[0-9+\\-\\s]{7,20}$", message = "Invalid phone number")
    private String phone;

    @Size(max = 500, message = "Address must be at most 500 characters")
    private String address;

    private String firstName;
    private String lastName;
    private String secondaryPhone;
    private String alternateEmail;
    private String maritalStatus;
    private String dateOfBirth;
    private String bloodGroup;
    private String gender;

    // Notification & preference fields exposed for frontend profile/settings sync
    private Boolean notificationsEnabled;
    private Boolean whatsappNotifications;
    private Boolean marketingEmails;
    private Boolean privacyMode;
    private String themePreference;
}
