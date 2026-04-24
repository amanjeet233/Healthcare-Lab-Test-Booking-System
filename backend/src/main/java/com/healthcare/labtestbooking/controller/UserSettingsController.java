package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.UserSettingsDTO;
import com.healthcare.labtestbooking.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/settings")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
public class UserSettingsController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<UserSettingsDTO>> getSettings() {
        return ResponseEntity.ok(ApiResponse.success("Settings fetched successfully", userService.getCurrentUserSettings()));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<UserSettingsDTO>> updateSettings(@RequestBody UserSettingsDTO request) {
        return ResponseEntity.ok(ApiResponse.success("Settings updated successfully",
                userService.updateCurrentUserSettings(request)));
    }
}
