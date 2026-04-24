package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.PackageTestRequest;
import com.healthcare.labtestbooking.dto.PackageTestResponse;
import com.healthcare.labtestbooking.entity.TestPackage;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.*;
import com.healthcare.labtestbooking.service.TestPackageService;
import com.healthcare.labtestbooking.service.PackageTestService;
import com.healthcare.labtestbooking.repository.UserRepository;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test-packages")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowCredentials = "true")
@Tag(name = "Test Packages", description = "Comprehensive test package management with dynamic pricing")
public class TestPackageController {

    private final TestPackageService testPackageService;
    private final PackageTestService packageTestService;
    private final UserRepository userRepository;

    // ==================== Basic CRUD ====================

    @GetMapping
    @Operation(summary = "Get all active test packages")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllPackages() {
        List<Map<String, Object>> packages = testPackageService.getActivePackages().stream()
                .map(this::toPackageMap)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Packages fetched successfully", packages));
    }

    @GetMapping("/paged")
    @Operation(summary = "Get all packages with pagination")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllPackagesPaged(
            @PageableDefault(size = 20) Pageable pageable) {
        org.springframework.data.domain.Page<TestPackage> page = testPackageService.getActivePackages(pageable);
        List<Map<String, Object>> packages = page.getContent().stream()
                .map(this::toPackageMap)
                .collect(java.util.stream.Collectors.toList());
        java.util.Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("packages", packages);
        result.put("totalPages", page.getTotalPages());
        result.put("totalElements", page.getTotalElements());
        result.put("currentPage", page.getNumber());
        result.put("pageSize", page.getSize());
        return ResponseEntity.ok(ApiResponse.success("Packages fetched", result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get test package by ID")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPackageById(@PathVariable Long id) {
        return testPackageService.getPackageById(id)
                .map(p -> ResponseEntity.ok(ApiResponse.success("Package found", toPackageMap(p))))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get test package by code")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPackageByCode(@PathVariable String code) {
        return testPackageService.getPackageByCode(code)
                .map(p -> {
                    Map<String, Object> packageData = new java.util.LinkedHashMap<>();
                    packageData.put("id", p.getId());
                    packageData.put("packageCode", p.getPackageCode());
                    packageData.put("packageName", p.getPackageName());
                    packageData.put("packageType", p.getPackageType() != null ? p.getPackageType().name() : null);
                    packageData.put("packageTier", p.getPackageTier() != null ? p.getPackageTier().name() : null);
                    packageData.put("totalTests", p.getTotalTests());
                    packageData.put("totalPrice", p.getTotalPrice());
                    packageData.put("discountedPrice", p.getDiscountedPrice());
                    packageData.put("discountPercentage", p.getDiscountPercentage());
                    packageData.put("description", p.getDescription());
                    packageData.put("bestFor", p.getBestFor());
                    packageData.put("fastingRequired", p.getFastingRequired());
                    packageData.put("fastingHours", p.getFastingHours());
                    packageData.put("sampleTypes", p.getSampleTypes());
                    packageData.put("turnaroundHours", p.getTurnaroundHours());
                    packageData.put("benefits", p.getBenefits() != null ? p.getBenefits() : new java.util.ArrayList<>());
                    packageData.put("features", p.getFeatures() != null ? p.getFeatures() : new java.util.ArrayList<>());
                    packageData.put("preparations", p.getPreparations() != null ? p.getPreparations() : new java.util.ArrayList<>());
                    packageData.put("includedTestNames", p.getIncludedTestNames() != null ? p.getIncludedTestNames() : new java.util.ArrayList<>());
                    packageData.put("ageGroup", p.getAgeGroup() != null ? p.getAgeGroup().name() : null);
                    packageData.put("genderApplicable", p.getGenderApplicable() != null ? p.getGenderApplicable().name() : null);
                    packageData.put("doctorConsultations", p.getDoctorConsultations());
                    packageData.put("imagingIncluded", p.getImagingIncluded());
                    packageData.put("geneticTesting", p.getGeneticTesting());
                    packageData.put("isActive", p.getIsActive());
                    packageData.put("isPopular", p.getIsPopular());
                    packageData.put("isRecommended", p.getIsRecommended());
                    packageData.put("displayOrder", p.getDisplayOrder());
                    packageData.put("badgeText", p.getBadgeText());
                    packageData.put("iconUrl", p.getIconUrl());
                    packageData.put("imageUrl", p.getImageUrl());
                    return ResponseEntity.ok(ApiResponse.success("Package found", packageData));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ==================== Filtering Endpoints ====================

    @GetMapping("/type/{type}")
    @Operation(summary = "Get packages by type", description = "Filter packages by AGE_BASED, GENDER_BASED, PROFESSION_BASED, DISEASE_SPECIFIC, WELLNESS, etc.")
    public ResponseEntity<ApiResponse<List<TestPackage>>> getPackagesByType(
            @PathVariable PackageType type) {
        return ResponseEntity.ok(ApiResponse.success("Packages fetched",
                testPackageService.getPackagesByType(type)));
    }

    @GetMapping("/tier/{tier}")
    @Operation(summary = "Get packages by tier", description = "Filter packages by BASIC, SILVER, GOLD, PLATINUM, DIAMOND")
    public ResponseEntity<ApiResponse<List<TestPackage>>> getPackagesByTier(
            @PathVariable PackageTier tier) {
        return ResponseEntity.ok(ApiResponse.success("Packages fetched",
                testPackageService.getPackagesByTier(tier)));
    }

    @GetMapping("/age/{age}")
    @Operation(summary = "Get packages suitable for age", description = "Returns top packages recommended for the given age")
    public ResponseEntity<ApiResponse<List<TestPackage>>> getPackagesByAge(
            @PathVariable int age,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(ApiResponse.success("Age-appropriate packages",
                testPackageService.getTopPackagesByAge(age, limit)));
    }

    @GetMapping("/gender/{gender}")
    @Operation(summary = "Get packages by gender")
    public ResponseEntity<ApiResponse<List<TestPackage>>> getPackagesByGender(
            @PathVariable Gender gender) {
        return ResponseEntity.ok(ApiResponse.success("Gender-specific packages",
                testPackageService.getPackagesByGender(gender)));
    }

    @GetMapping("/profession")
    @Operation(summary = "Get packages by profession", description = "Search packages suitable for a profession")
    public ResponseEntity<ApiResponse<List<TestPackage>>> getPackagesByProfession(
            @RequestParam String profession) {
        return ResponseEntity.ok(ApiResponse.success("Profession-based packages",
                testPackageService.getPackagesByProfession(profession)));
    }

    @GetMapping("/health-condition")
    @Operation(summary = "Get packages by health condition", description = "Find packages for managing specific health conditions")
    public ResponseEntity<ApiResponse<List<TestPackage>>> getPackagesByHealthCondition(
            @RequestParam String condition) {
        return ResponseEntity.ok(ApiResponse.success("Condition-specific packages",
                testPackageService.getPackagesByHealthCondition(condition)));
    }

    @GetMapping("/popular")
    @Operation(summary = "Get popular packages")
    public ResponseEntity<ApiResponse<List<TestPackage>>> getPopularPackages() {
        return ResponseEntity.ok(ApiResponse.success("Popular packages",
                testPackageService.getPopularPackages()));
    }

    @GetMapping("/recommended")
    @Operation(summary = "Get recommended packages")
    public ResponseEntity<ApiResponse<List<TestPackage>>> getRecommendedPackages() {
        return ResponseEntity.ok(ApiResponse.success("Recommended packages",
                testPackageService.getRecommendedPackages()));
    }

    @GetMapping("/price-range")
    @Operation(summary = "Get packages within price range")
    public ResponseEntity<ApiResponse<List<TestPackage>>> getPackagesByPriceRange(
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice) {
        return ResponseEntity.ok(ApiResponse.success("Packages in price range",
                testPackageService.getPackagesByPriceRange(minPrice, maxPrice)));
    }

    @GetMapping("/top-savings")
    @Operation(summary = "Get packages with highest savings")
    public ResponseEntity<ApiResponse<List<TestPackage>>> getTopSavingPackages(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success("Top saving packages",
                testPackageService.getTopSavingPackages(limit)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search packages by keyword")
    public ResponseEntity<ApiResponse<Page<TestPackage>>> searchPackages(
            @RequestParam String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Search results",
                testPackageService.searchPackages(keyword, pageable)));
    }

    @GetMapping("/filter")
    @Operation(summary = "Advanced package filtering", description = "Filter packages with multiple criteria")
    public ResponseEntity<ApiResponse<Page<TestPackage>>> filterPackages(
            @RequestParam(required = false) PackageType type,
            @RequestParam(required = false) PackageTier tier,
            @RequestParam(required = false) AgeGroup ageGroup,
            @RequestParam(required = false) Gender gender,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Filtered packages",
                testPackageService.filterPackages(type, tier, ageGroup, gender, minPrice, maxPrice, pageable)));
    }

    // ==================== Smart Recommendations ====================

    @GetMapping("/recommended-for-me")
    @Operation(summary = "Get personalized package recommendations", description = "AI-powered recommendations based on user profile")
    public ResponseEntity<ApiResponse<List<TestPackage>>> getPersonalizedRecommendations(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(ApiResponse.success("Personalized recommendations",
                testPackageService.getRecommendedPackages(user)));
    }

    @PostMapping("/best-value")
    @Operation(summary = "Find best value package for selected tests", description = "Finds the package that provides best value for your selected tests")
    public ResponseEntity<ApiResponse<TestPackage>> getBestValuePackage(
            @RequestBody List<Long> testIds) {
        TestPackage bestPackage = testPackageService.getBestValuePackage(testIds);
        if (bestPackage != null) {
            return ResponseEntity.ok(ApiResponse.success("Best value package found", bestPackage));
        }
        return ResponseEntity.ok(ApiResponse.success("No matching package found", null));
    }

    // ==================== Dynamic Pricing ====================

    @PostMapping("/calculate-price")
    @Operation(summary = "Calculate dynamic price for tests", description = "Calculates discounted price based on number of tests selected")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateDynamicPrice(
            @RequestBody List<Long> testIds) {
        return ResponseEntity.ok(ApiResponse.success("Price calculated",
                testPackageService.getPackageSavings(testIds)));
    }

    @PostMapping("/compare-with-packages")
    @Operation(summary = "Compare individual tests with available packages", description = "Shows how much you can save by choosing a package instead of individual tests")
    public ResponseEntity<ApiResponse<Map<String, Object>>> compareTestsWithPackages(
            @RequestBody List<Long> testIds) {
        return ResponseEntity.ok(ApiResponse.success("Comparison complete",
                testPackageService.compareTestsWithPackages(testIds)));
    }

    @PostMapping("/bundle-price")
    @Operation(summary = "Calculate bundle price for multiple packages", description = "Get additional discount when purchasing multiple packages")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateBundlePrice(
            @RequestBody List<Long> packageIds) {
        return ResponseEntity.ok(ApiResponse.success("Bundle price calculated",
                testPackageService.calculateBundlePrice(packageIds)));
    }

    // ==================== Statistics ====================

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get package statistics", description = "Admin-only: Get statistics about packages")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPackageStatistics() {
        return ResponseEntity.ok(ApiResponse.success("Statistics fetched",
                testPackageService.getPackageStatistics()));
    }

    // ==================== Admin Operations ====================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new test package")
    public ResponseEntity<ApiResponse<TestPackage>> createPackage(
            @Valid @RequestBody TestPackage testPackage) {
        return new ResponseEntity<>(ApiResponse.success("Package created",
                testPackageService.savePackage(testPackage)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a test package")
    public ResponseEntity<ApiResponse<TestPackage>> updatePackage(
            @PathVariable Long id,
            @Valid @RequestBody TestPackage testPackage) {
        testPackage.setId(id);
        return ResponseEntity.ok(ApiResponse.success("Package updated",
                testPackageService.savePackage(testPackage)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a test package")
    public ResponseEntity<ApiResponse<Void>> deletePackage(@PathVariable Long id) {
        testPackageService.deletePackage(id);
        return ResponseEntity.ok(ApiResponse.success("Package deleted", null));
    }

    // ==================== Package-Test Relationships ====================

    @GetMapping("/package-tests")
    @Operation(summary = "Get all package-test relationships")
    public ResponseEntity<ApiResponse<List<PackageTestResponse>>> getAllPackageTests() {
        return ResponseEntity.ok(ApiResponse.success("Success", packageTestService.getAll()));
    }

    @GetMapping("/package-tests/{id}")
    @Operation(summary = "Get package-test relationship by ID")
    public ResponseEntity<ApiResponse<PackageTestResponse>> getPackageTestById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Success", packageTestService.getById(id)));
    }

    @PostMapping("/package-tests")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create package-test relationship")
    public ResponseEntity<ApiResponse<PackageTestResponse>> createPackageTest(
            @Valid @RequestBody PackageTestRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Created",
                packageTestService.create(request)), HttpStatus.CREATED);
    }

    @PutMapping("/package-tests/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update package-test relationship")
    public ResponseEntity<ApiResponse<PackageTestResponse>> updatePackageTest(
            @PathVariable Long id,
            @Valid @RequestBody PackageTestRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                packageTestService.update(id, request)));
    }

    @DeleteMapping("/package-tests/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete package-test relationship")
    public ResponseEntity<ApiResponse<Void>> deletePackageTest(@PathVariable Long id) {
        packageTestService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Helper Methods ====================
    
    private Map<String, Object> toPackageMap(TestPackage p) {
        Map<String, Object> packageData = new java.util.LinkedHashMap<>();
        packageData.put("id", p.getId());
        packageData.put("packageCode", p.getPackageCode());
        packageData.put("packageName", p.getPackageName());
        packageData.put("packageType", p.getPackageType() != null ? p.getPackageType().name() : null);
        packageData.put("packageTier", p.getPackageTier() != null ? p.getPackageTier().name() : null);
        packageData.put("totalTests", p.getTotalTests());
        packageData.put("totalPrice", p.getTotalPrice());
        packageData.put("discountedPrice", p.getDiscountedPrice());
        packageData.put("discountPercentage", p.getDiscountPercentage());
        packageData.put("description", p.getDescription());
        packageData.put("bestFor", p.getBestFor());
        packageData.put("fastingRequired", p.getFastingRequired());
        packageData.put("fastingHours", p.getFastingHours());
        packageData.put("sampleTypes", p.getSampleTypes());
        packageData.put("turnaroundHours", p.getTurnaroundHours());
        packageData.put("benefits", p.getBenefits() != null ? p.getBenefits() : new java.util.ArrayList<>());
        packageData.put("features", p.getFeatures() != null ? p.getFeatures() : new java.util.ArrayList<>());
        packageData.put("preparations", p.getPreparations() != null ? p.getPreparations() : new java.util.ArrayList<>());
        packageData.put("includedTestNames", p.getIncludedTestNames() != null ? p.getIncludedTestNames() : new java.util.ArrayList<>());
        packageData.put("ageGroup", p.getAgeGroup() != null ? p.getAgeGroup().name() : null);
        packageData.put("genderApplicable", p.getGenderApplicable() != null ? p.getGenderApplicable().name() : null);
        packageData.put("doctorConsultations", p.getDoctorConsultations());
        packageData.put("imagingIncluded", p.getImagingIncluded());
        packageData.put("geneticTesting", p.getGeneticTesting());
        packageData.put("isActive", p.getIsActive());
        packageData.put("isPopular", p.getIsPopular());
        packageData.put("isRecommended", p.getIsRecommended());
        packageData.put("displayOrder", p.getDisplayOrder());
        packageData.put("badgeText", p.getBadgeText());
        packageData.put("iconUrl", p.getIconUrl());
        packageData.put("imageUrl", p.getImageUrl());
        return packageData;
    }
}
