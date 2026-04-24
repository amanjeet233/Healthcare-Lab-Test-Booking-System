package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.LabTestDTO;
import com.healthcare.labtestbooking.dto.TestPackageDTO;
import com.healthcare.labtestbooking.entity.enums.TestType;
import com.healthcare.labtestbooking.entity.TestPackage;
import com.healthcare.labtestbooking.entity.TestParameter;
import com.healthcare.labtestbooking.service.LabTestService;
import com.healthcare.labtestbooking.service.TestPackageService;
import com.healthcare.labtestbooking.service.TestParameterService;
import com.healthcare.labtestbooking.service.TestPopularityService;
import com.healthcare.labtestbooking.entity.TestPopularity;
import io.swagger.v3.oas.annotations.Operation;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.concurrent.TimeUnit;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.springframework.data.domain.PageRequest;

@RestController
@RequestMapping("/api/lab-tests")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowCredentials = "true")
@Tag(name = "Lab Tests", description = "Lab tests and test packages catalog - Public browsing")
public class LabTestController {
        @GetMapping("/popular")
        @Operation(summary = "Get popular tests", description = "Retrieve a list of most booked lab tests")
        public ResponseEntity<ApiResponse<List<LabTestDTO>>> getPopularTests() {
                log.info("GET /api/lab-tests/popular");
                List<LabTestDTO> tests = labTestService.getPopularTests();
                return ResponseEntity.ok()
                                .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES))
                                .body(ApiResponse.success("Popular tests retrieved", tests));
        }

        private final LabTestService labTestService;
        private final TestPackageService testPackageService;
        private final TestPopularityService testPopularityService;
        private final TestParameterService testParameterService;

        @GetMapping("/{testId}/parameters")
        @PreAuthorize("hasAnyRole('TECHNICIAN','MEDICAL_OFFICER','ADMIN')")
        @Operation(summary = "Get test parameters by test ID", description = "Retrieve the list of test parameters for result entry")
        public ResponseEntity<ApiResponse<List<TestParameter>>> getParametersByTestId(@PathVariable Long testId) {
                log.info("GET /api/lab-tests/{}/parameters", testId);
                return ResponseEntity.ok(ApiResponse.success("Test parameters fetched successfully",
                                testParameterService.getParametersByTestId(testId)));
        }
        
        @GetMapping
        @Operation(summary = "Get all lab tests", description = "Retrieve all active lab tests with pagination")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tests fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<Page<LabTestDTO>>> getAllTests(
                        @PageableDefault(size = 20, sort = "testName") Pageable pageable) {
                log.info("GET /api/lab-tests - Fetching all active tests | Page: {}, Size: {}",
                                pageable.getPageNumber(), pageable.getPageSize());
                Page<LabTestDTO> tests = labTestService.getAllActiveTests(pageable);
                return ResponseEntity.ok()
                                .cacheControl(CacheControl.maxAge(10, TimeUnit.MINUTES))
                                .body(ApiResponse.success("Tests fetched successfully", tests));
        }

        @GetMapping("/advanced")
        @Operation(summary = "Get tests advanced search", description = "Retrieve paginated tests with dynamic filtering and sorting")
        public ResponseEntity<ApiResponse<Page<LabTestDTO>>> getAdvancedTests(
                @RequestParam(required = false) String search,
                @RequestParam(required = false) List<String> category,
                @RequestParam(name = "sub_category", required = false) String subCategory,
                @RequestParam(name = "is_top_deal", required = false) Boolean isTopDeal,
                @RequestParam(name = "is_top_booked", required = false) Boolean isTopBooked,
                @RequestParam(name = "min_price", required = false) BigDecimal minPrice,
                @RequestParam(name = "max_price", required = false) BigDecimal maxPrice,
                @RequestParam(name = "sort_by", required = false) String sortBy,
                @RequestParam(defaultValue = "1") int page,
                @RequestParam(defaultValue = "18") int limit
        ) {
                log.info("GET /api/lab-tests/advanced - Advanced search | categories: {}, min: {}, max: {}", 
                    category, minPrice, maxPrice);
                Page<LabTestDTO> response = labTestService.getAdvancedSearchTests(
                    search, category, subCategory, isTopDeal, isTopBooked, minPrice, maxPrice, sortBy, page, limit);
                return ResponseEntity.ok(ApiResponse.success("Advanced search results retrieved", response));
        }

        @GetMapping("/packages/best-deals")
        @Operation(summary = "Get best deal packages", description = "Retrieve top saving test packages")
        public ResponseEntity<ApiResponse<List<TestPackage>>> getBestDeals() {
                log.info("GET /api/lab-tests/packages/best-deals");
                List<TestPackage> bestDeals = testPackageService.getBestDeals();
                return ResponseEntity.ok()
                                .cacheControl(CacheControl.maxAge(30, TimeUnit.MINUTES))
                                .body(ApiResponse.success("Best deals retrieved successfully", bestDeals));
        }

        @GetMapping("/{id}")
        @Operation(summary = "Get test by ID", description = "Retrieve a specific lab test by its ID")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Test fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Test not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<LabTestDTO>> getTestById(@PathVariable Long id) {
                log.info("GET /api/lab-tests/{}", id);
                LabTestDTO test = labTestService.getTestById(id);
                return ResponseEntity.ok(ApiResponse.success("Test fetched successfully", test));
        }

        @GetMapping("/code/{testCode}")
        @Operation(summary = "Get test by code", description = "Retrieve a lab test by its unique code")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Test fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Test not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<LabTestDTO>> getTestByCode(@PathVariable String testCode) {
                log.info("GET /api/lab-tests/code/{}", testCode);
                LabTestDTO test = labTestService.getTestByCode(testCode);
                return ResponseEntity.ok(ApiResponse.success("Test fetched successfully", test));
        }

        @GetMapping("/slug/{slug}")
        @Operation(summary = "Get test by slug", description = "Retrieve a lab test by its URL-friendly slug")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Test fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Test not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<LabTestDTO>> getTestBySlug(@PathVariable String slug) {
                log.info("GET /api/lab-tests/slug/{}", slug);
                LabTestDTO test = labTestService.getTestByCode(slug);  // slug and code are interchangeable (stored in testCode field)
                return ResponseEntity.ok(ApiResponse.success("Test fetched successfully", test));
        }

        @GetMapping("/category/{categoryId}")
        @Operation(summary = "Get tests by category", description = "Retrieve all lab tests in a specific category")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tests fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Category not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<Page<LabTestDTO>>> getTestsByCategory(
                        @PathVariable Long categoryId,
                        @PageableDefault(size = 20, sort = "testName") Pageable pageable) {
                log.info("GET /api/lab-tests/category/{} | Page: {}, Size: {}", categoryId,
                                pageable.getPageNumber(), pageable.getPageSize());
                Page<LabTestDTO> tests = labTestService.getTestsByCategory(categoryId, pageable);
                return ResponseEntity.ok(ApiResponse.success("Tests fetched successfully", tests));
        }

        @GetMapping("/type/{testType}")
        @Operation(summary = "Get tests by type", description = "Retrieve all lab tests of a specific type")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tests fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<Page<LabTestDTO>>> getTestsByType(
                        @PathVariable TestType testType,
                        @PageableDefault(size = 20, sort = "testName") Pageable pageable) {
                log.info("GET /api/lab-tests/type/{} | Page: {}, Size: {}", testType,
                                pageable.getPageNumber(), pageable.getPageSize());
                Page<LabTestDTO> tests = labTestService.getTestsByType(testType, pageable);
                return ResponseEntity.ok(ApiResponse.success("Tests fetched successfully", tests));
        }

        @GetMapping("/search")
        @Operation(summary = "Search tests", description = "Search lab tests by keyword (name, description, etc.)")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Search results returned"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid search keyword"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<Page<LabTestDTO>>> searchTests(
                        @RequestParam String keyword,
                        @PageableDefault(size = 20, sort = "testName") Pageable pageable) {
                log.info("GET /api/lab-tests/search?keyword={} | Page: {}, Size: {}", keyword,
                                pageable.getPageNumber(), pageable.getPageSize());
                Page<LabTestDTO> tests = labTestService.searchTests(keyword, pageable);
                return ResponseEntity.ok(ApiResponse.success("Search results", tests));
        }

        @GetMapping("/trending")
        @Operation(summary = "Get trending tests", description = "Retrieve top 10 trending lab tests")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Trending tests retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<List<LabTestDTO>>> getTrendingTests() {
                log.info("GET /api/lab-tests/trending - Fetching top trending tests");
                List<LabTestDTO> trendingTests = labTestService.getTrendingTests();
                return ResponseEntity.ok()
                                .cacheControl(CacheControl.maxAge(15, TimeUnit.MINUTES))
                                .body(ApiResponse.success("Trending tests retrieved successfully", trendingTests));
        }

        @GetMapping("/price-range")
        @Operation(summary = "Get tests by price range", description = "Retrieve lab tests within a specific price range")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tests fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid price range"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<Page<LabTestDTO>>> getTestsByPriceRange(
                        @RequestParam BigDecimal min,
                        @RequestParam BigDecimal max,
                        @PageableDefault(size = 20, sort = "basePrice") Pageable pageable) {
                log.info("GET /api/lab-tests/price-range?min={}&max={} | Page: {}, Size: {}", min, max,
                                pageable.getPageNumber(), pageable.getPageSize());
                Page<LabTestDTO> tests = labTestService.getTestsByPriceRange(min, max, pageable);
                return ResponseEntity.ok(ApiResponse.success("Tests fetched successfully", tests));
        }

        @GetMapping("/types")
        @Operation(summary = "Get all test types", description = "Retrieve all available test types")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Test types fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<List<String>>> getAllTestTypes() {
                log.info("GET /api/lab-tests/types");
                List<String> types = labTestService.getAllTestTypes();
                return ResponseEntity.ok(ApiResponse.success("Test types fetched successfully", types));
        }

        @GetMapping("/popularity")
        @Operation(summary = "Get all test popularity stats")
        public ResponseEntity<ApiResponse<List<TestPopularity>>> getPopularityStats() {
                return ResponseEntity.ok(ApiResponse.success("Popularity stats fetched successfully",
                        testPopularityService.getPopularityStats()));
        }

        @PostMapping("/popularity/increment/{testId}")
        @Operation(summary = "Increment popularity for a test")
        public ResponseEntity<ApiResponse<TestPopularity>> incrementPopularity(@PathVariable Long testId) {
                return ResponseEntity
                        .ok(ApiResponse.success("Popularity incremented", testPopularityService.incrementPopularity(testId)));
        }

        @GetMapping("/packages")
        @Operation(summary = "Get all test packages", description = "Retrieve all active test packages")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Packages fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<List<TestPackage>>> getAllPackages() {
                log.info("GET /api/lab-tests/packages - Fetching all packages");
                List<TestPackage> packages = testPackageService.getAllPackages();
                return ResponseEntity.ok()
                                .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES))
                                .body(ApiResponse.success("Packages fetched successfully", packages));
        }

        @GetMapping("/packages/{id}")
        @Operation(summary = "Get package by ID", description = "Retrieve a specific test package by its ID")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Package fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Package not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<TestPackage>> getPackageById(@PathVariable Long id) {
                log.info("GET /api/lab-tests/packages/{}", id);
                return testPackageService.getPackageById(id)
                        .map(pkg -> ResponseEntity.ok(ApiResponse.success("Package fetched successfully", pkg)))
                        .orElse(ResponseEntity.notFound().build());
        }

        // ============= NEW FILTER ENDPOINTS FOR INDIVIDUAL TESTS =============

        @GetMapping("/filter")
        @Operation(summary = "Filter tests with multiple criteria", 
                  description = "Advanced filtering: category, price range, fasting requirement, search keywords, pagination")
        public ResponseEntity<ApiResponse<Page<LabTestDTO>>> filterTests(
                        @RequestParam(required = false) List<String> category,
                        @RequestParam(required = false) BigDecimal minPrice,
                        @RequestParam(required = false) BigDecimal maxPrice,
                        @RequestParam(required = false) Boolean fasting,
                        @RequestParam(required = false) String search,
                        @PageableDefault(size = 12, sort = "price") Pageable pageable) {
                log.info("GET /api/lab-tests/filter?category={}&minPrice={}&maxPrice={}&fasting={}&search={}", 
                        category, minPrice, maxPrice, fasting, search);
                Page<LabTestDTO> tests = labTestService.filterTests(category, minPrice, maxPrice, fasting, search, pageable);
                return ResponseEntity.ok(ApiResponse.success("Filtered tests retrieved", tests));
        }

        @GetMapping("/categories/{categoryName}")
        @Operation(summary = "Get tests by category name",  description = "Retrieve all tests in a specific category (BLOOD, URINE, IMAGING, etc.)")
        public ResponseEntity<ApiResponse<Page<LabTestDTO>>> getTestsByCategoryName(
                        @PathVariable String categoryName,
                        @PageableDefault(size = 12, sort = "testName") Pageable pageable) {
                log.info("GET /api/lab-tests/categories/{} | Page: {}, Size: {}", categoryName,
                        pageable.getPageNumber(), pageable.getPageSize());
                Page<LabTestDTO> tests = labTestService.getTestsByCategory(categoryName, pageable);
                return ResponseEntity.ok(ApiResponse.success("Tests by category retrieved", tests));
        }

        @GetMapping("/category-counts")
        @Operation(summary = "Get test counts by category", description = "Returns count of tests in each category")
        public ResponseEntity<ApiResponse<java.util.Map<String, Long>>> getCategoryCount() {
                log.info("GET /api/lab-tests/category-counts");
                java.util.Map<String, Long> counts = labTestService.getCategoryCount();
                return ResponseEntity.ok()
                                .cacheControl(CacheControl.maxAge(10, TimeUnit.MINUTES))
                                .body(ApiResponse.success("Category counts retrieved", counts));
        }

        @GetMapping("/by-tag/{tag}")
        @Operation(summary = "Find tests by tag", description = "Search tests by tag (fever, diabetes, kidney, etc.)")
        public ResponseEntity<ApiResponse<Page<LabTestDTO>>> getTestsByTag(
                        @PathVariable String tag,
                        @PageableDefault(size = 12) Pageable pageable) {
                log.info("GET /api/lab-tests/by-tag/{}", tag);
                Page<LabTestDTO> tests = labTestService.getTestsByTag(tag, pageable);
                return ResponseEntity.ok(ApiResponse.success("Tests by tag retrieved", tests));
        }
}
