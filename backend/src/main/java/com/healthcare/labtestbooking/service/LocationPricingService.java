package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.LocationPricing;
import com.healthcare.labtestbooking.repository.LocationPricingRepository;
import com.healthcare.labtestbooking.dto.LocationPricingRequest;
import com.healthcare.labtestbooking.dto.LocationPricingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationPricingService {

    private final LocationPricingRepository repository;

    @Transactional(readOnly = true)
    public List<LocationPricingResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LocationPricingResponse getById(Long id) {
        LocationPricing entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("LocationPricing not found with id " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public LocationPricingResponse create(LocationPricingRequest request) {
        LocationPricing entity = new LocationPricing();
        // map request to entity here
        LocationPricing saved = repository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public LocationPricingResponse update(Long id, LocationPricingRequest request) {
        LocationPricing entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("LocationPricing not found with id " + id));
        // update entity from request here
        LocationPricing updated = repository.save(entity);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private LocationPricingResponse mapToResponse(LocationPricing entity) {
        LocationPricingResponse response = new LocationPricingResponse();
        // Assume Long id field for boilerplate
        try {
            response.setId(entity.getId());
        } catch(Exception e) {
            // Ignore if no getId() exists
        }
        return response;
    }
}
