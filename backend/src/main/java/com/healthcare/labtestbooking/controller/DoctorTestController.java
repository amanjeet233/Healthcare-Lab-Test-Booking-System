package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.DoctorTestRequest.*;
import com.healthcare.labtestbooking.dto.DoctorTestResponse.*;
import com.healthcare.labtestbooking.service.DoctorTestManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor/tests")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Doctor Test Management", description = "APIs for doctors/lab admins to manage lab tests")
@PreAuthorize("hasAnyRole('DOCTOR', 'LAB_ADMIN', 'ADMIN')")
public class DoctorTestController {

    private final DoctorTestManagementService doctorTestManagementService;

    // ==================== CRUD Operations ====================

    @PostMapping
    @Operation(summary = "Create a new lab test", description = "Create a new lab test with all details")
    public ResponseEntity<ApiResponse<TestDetails>> createTest(
            @Valid @RequestBody CreateTest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.info("Creating new test: {}", request.getTestCode());
        TestDetails created = doctorTestManagementService.createTest(request, userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Test created successfully", created));
    }

    @PutMapping("/{testId}")
    @Operation(summary = "Update an existing lab test", description = "Update test details by ID")
    public ResponseEntity<ApiResponse<TestDetails>> updateTest(
            @PathVariable Long testId,
            @Valid @RequestBody UpdateTest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.info("Updating test ID: {}", testId);
        TestDetails updated = doctorTestManagementService.updateTest(testId, request, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Test updated successfully", updated));
    }

    @DeleteMapping("/{testId}")
    @Operation(summary = "Soft delete a lab test", description = "Mark test as inactive (soft delete)")
    public ResponseEntity<ApiResponse<Void>> deleteTest(
            @PathVariable Long testId,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.info("Soft deleting test ID: {}", testId);
        doctorTestManagementService.deleteTest(testId, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Test deleted successfully", null));
    }

    @DeleteMapping("/{testId}/permanent")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Permanently delete a lab test", description = "Permanently remove test (admin only, no bookings)")
    public ResponseEntity<ApiResponse<Void>> permanentDeleteTest(
            @PathVariable Long testId,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.info("Permanently deleting test ID: {}", testId);
        doctorTestManagementService.permanentDeleteTest(testId, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Test permanently deleted", null));
    }

    // ==================== Retrieve Tests ====================

    @GetMapping("/{testId}")
    @Operation(summary = "Get test by ID", description = "Retrieve detailed information about a specific test")
    public ResponseEntity<ApiResponse<TestDetails>> getTestById(@PathVariable Long testId) {
        log.info("Fetching test ID: {}", testId);
        TestDetails test = doctorTestManagementService.getTestById(testId);
        return ResponseEntity.ok(ApiResponse.success(test));
    }

    @GetMapping
    @Operation(summary = "Get all tests with filtering", description = "Retrieve paginated list of tests with optional filters")
    public ResponseEntity<ApiResponse<Page<TestListItem>>> getAllTests(
            @Parameter(description = "Filter criteria") TestFilter filter,
            @PageableDefault(size = 20, sort = "testName") Pageable pageable) {

        log.info("Fetching all tests with filter");
        Page<TestListItem> tests = doctorTestManagementService.getAllTests(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(tests));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active tests only", description = "Retrieve list of all active tests")
    public ResponseEntity<ApiResponse<List<TestListItem>>> getActiveTests() {
        log.info("Fetching active tests");
        List<TestListItem> tests = doctorTestManagementService.getActiveTests();
        return ResponseEntity.ok(ApiResponse.success(tests));
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get tests by category", description = "Retrieve all active tests in a specific category")
    public ResponseEntity<ApiResponse<List<TestListItem>>> getTestsByCategory(
            @PathVariable Long categoryId) {

        log.info("Fetching tests for category ID: {}", categoryId);
        List<TestListItem> tests = doctorTestManagementService.getTestsByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success(tests));
    }

    // ==================== Price Comparison ====================

    @GetMapping("/{testId}/price-comparison")
    @Operation(summary = "Get price comparison", description = "Compare test price with similar tests in market")
    public ResponseEntity<ApiResponse<List<PriceComparison>>> getPriceComparison(
            @PathVariable Long testId,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.info("Fetching price comparison for test ID: {}", testId);
        List<PriceComparison> comparison = doctorTestManagementService.getPriceComparison(testId, userDetails);
        return ResponseEntity.ok(ApiResponse.success(comparison));
    }

    // ==================== Analytics ====================

    @GetMapping("/{testId}/analytics")
    @Operation(summary = "Get test analytics", description = "Get detailed analytics and statistics for a specific test")
    public ResponseEntity<ApiResponse<TestAnalytics>> getTestAnalytics(
            @PathVariable Long testId,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.info("Fetching analytics for test ID: {}", testId);
        TestAnalytics analytics = doctorTestManagementService.getTestAnalytics(testId, userDetails);
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard stats", description = "Get overall dashboard statistics for all tests")
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboardStats(
            @AuthenticationPrincipal UserDetails userDetails) {

        log.info("Fetching dashboard stats");
        DashboardStats stats = doctorTestManagementService.getDashboardStats(userDetails);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ==================== Bulk Operations ====================

    @PostMapping("/bulk/price")
    @Operation(summary = "Bulk update prices", description = "Update prices for multiple tests at once")
    public ResponseEntity<ApiResponse<BulkUpdateResult>> bulkUpdatePrice(
            @Valid @RequestBody BulkUpdatePrice request,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.info("Bulk updating prices for {} tests", request.getTestIds().size());
        BulkUpdateResult result = doctorTestManagementService.bulkUpdatePrice(request, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Bulk price update completed", result));
    }

    @PostMapping("/bulk/activate")
    @Operation(summary = "Bulk activate tests", description = "Activate multiple tests at once")
    public ResponseEntity<ApiResponse<BulkUpdateResult>> bulkActivate(
            @RequestBody List<Long> testIds,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.info("Bulk activating {} tests", testIds.size());
        BulkUpdateResult result = doctorTestManagementService.bulkToggleActive(testIds, true, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Tests activated successfully", result));
    }

    @PostMapping("/bulk/deactivate")
    @Operation(summary = "Bulk deactivate tests", description = "Deactivate multiple tests at once")
    public ResponseEntity<ApiResponse<BulkUpdateResult>> bulkDeactivate(
            @RequestBody List<Long> testIds,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.info("Bulk deactivating {} tests", testIds.size());
        BulkUpdateResult result = doctorTestManagementService.bulkToggleActive(testIds, false, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Tests deactivated successfully", result));
    }
}
