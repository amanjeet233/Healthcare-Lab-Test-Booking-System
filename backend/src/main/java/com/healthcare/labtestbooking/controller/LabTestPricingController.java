package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.healthcare.labtestbooking.dto.LabTestPricingRequest;
import com.healthcare.labtestbooking.dto.LabTestPricingResponse;
import com.healthcare.labtestbooking.dto.LocationPricingRequest;
import com.healthcare.labtestbooking.dto.LocationPricingResponse;
import com.healthcare.labtestbooking.service.LabTestPricingService;
import com.healthcare.labtestbooking.service.LocationPricingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.healthcare.labtestbooking.dto.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/lab-test-pricings")
@RequiredArgsConstructor
public class LabTestPricingController {

    private final LabTestPricingService service;
    private final LocationPricingService locationPricingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LabTestPricingResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Success", service.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LabTestPricingResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Success", service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LabTestPricingResponse>> create(@Valid @RequestBody LabTestPricingRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Created", service.create(request)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LabTestPricingResponse>> update(@PathVariable Long id, @Valid @RequestBody LabTestPricingRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Success", service.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/location-pricings")
    public ResponseEntity<ApiResponse<List<LocationPricingResponse>>> getAllLocationPricings() {
        return ResponseEntity.ok(ApiResponse.success("Success", locationPricingService.getAll()));
    }

    @GetMapping("/location-pricings/{id}")
    public ResponseEntity<ApiResponse<LocationPricingResponse>> getLocationPricingById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Success", locationPricingService.getById(id)));
    }

    @PostMapping("/location-pricings")
    public ResponseEntity<ApiResponse<LocationPricingResponse>> createLocationPricing(@Valid @RequestBody LocationPricingRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Created", locationPricingService.create(request)), HttpStatus.CREATED);
    }

    @PutMapping("/location-pricings/{id}")
    public ResponseEntity<ApiResponse<LocationPricingResponse>> updateLocationPricing(@PathVariable Long id, @Valid @RequestBody LocationPricingRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Success", locationPricingService.update(id, request)));
    }

    @DeleteMapping("/location-pricings/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLocationPricing(@PathVariable Long id) {
        locationPricingService.delete(id);
        return ResponseEntity.noContent().build();
    }
}


