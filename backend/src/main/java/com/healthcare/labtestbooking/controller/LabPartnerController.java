package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.LabPartnerNearbyResponse;
import com.healthcare.labtestbooking.dto.LabPartnerResponse;
import com.healthcare.labtestbooking.dto.LabTestPricingResponse;
import com.healthcare.labtestbooking.service.LabPartnerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/labs")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowCredentials = "true")
@RequiredArgsConstructor
@Tag(name = "Lab Partners", description = "Lab partner locations, pricing, and proximity search")
public class LabPartnerController {

    private final LabPartnerService labPartnerService;

    @GetMapping
    @Operation(summary = "Get all lab partners", description = "Retrieve all active lab partners")
    public ResponseEntity<ApiResponse<List<LabPartnerResponse>>> getAllLabPartners() {
        List<LabPartnerResponse> labs = labPartnerService.getAllLabs();
        return ResponseEntity.ok(ApiResponse.success(labs));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get lab partner by ID", description = "Retrieve a specific lab partner")
    public ResponseEntity<ApiResponse<LabPartnerResponse>> getLabPartnerById(@PathVariable Long id) {
        LabPartnerResponse lab = labPartnerService.getLabPartnerById(id);
        return ResponseEntity.ok(ApiResponse.success(lab));
    }

    @GetMapping("/nearby")
    @Operation(summary = "Find nearby labs", description = "Find active labs within a given radius using Haversine distance")
    public ResponseEntity<ApiResponse<List<LabPartnerNearbyResponse>>> getNearbyLabs(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double radius) {
        List<LabPartnerNearbyResponse> labs = labPartnerService.getNearbyLabs(lat, lng, radius);
        return ResponseEntity.ok(ApiResponse.success("Found " + labs.size() + " labs nearby", labs));
    }

    @GetMapping("/city/{city}")
    @Operation(summary = "Search labs by city", description = "Retrieve all active labs in a specific city")
    public ResponseEntity<ApiResponse<List<LabPartnerResponse>>> getLabsByCity(@PathVariable String city) {
        List<LabPartnerResponse> labs = labPartnerService.searchByCity(city);
        return ResponseEntity.ok(ApiResponse.success(labs));
    }

    @GetMapping("/compare/{testId}")
    @Operation(summary = "Compare lab prices", description = "Compare prices for a specific test across all lab partners")
    public ResponseEntity<ApiResponse<List<LabTestPricingResponse>>> getLabPricesForTest(@PathVariable Long testId) {
        List<LabTestPricingResponse> prices = labPartnerService.comparePrices(testId);
        return ResponseEntity.ok(ApiResponse.success(prices));
    }

    @GetMapping("/best-deal/{testId}")
    @Operation(summary = "Get best deal", description = "Get the best price-to-speed deal for a specific test")
    public ResponseEntity<ApiResponse<LabTestPricingResponse>> getBestDeal(@PathVariable Long testId) {
        LabTestPricingResponse bestDeal = labPartnerService.getBestDeal(testId);
        return ResponseEntity.ok(ApiResponse.success(bestDeal));
    }
}


