package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.BookingResponse;
import com.healthcare.labtestbooking.service.BookingService;
import com.healthcare.labtestbooking.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final BookingService bookingService;

    @GetMapping("/patient/stats")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPatientStats() {
        Map<String, Object> stats = dashboardService.getPatientDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/technician/stats")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTechnicianStats() {
        Map<String, Object> stats = dashboardService.getTechnicianDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/technician/rejected")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getTechnicianRejectedSpecimens() {
        List<BookingResponse> rejected = bookingService.getTechnicianRejectedSpecimens();
        return ResponseEntity.ok(ApiResponse.success(rejected));
    }

    @GetMapping({"/medical-officer/stats", "/doctor/stats"})
    @PreAuthorize("hasRole('MEDICAL_OFFICER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMedicalOfficerStats() {
        Map<String, Object> stats = dashboardService.getMedicalOfficerDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminStats() {
        Map<String, Object> stats = dashboardService.getAdminDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}


