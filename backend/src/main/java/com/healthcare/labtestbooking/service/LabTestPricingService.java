package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.LabTestPricing;
import com.healthcare.labtestbooking.repository.LabTestPricingRepository;
import com.healthcare.labtestbooking.dto.LabTestPricingRequest;
import com.healthcare.labtestbooking.dto.LabTestPricingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabTestPricingService {

    private final LabTestPricingRepository repository;

    @Transactional(readOnly = true)
    public List<LabTestPricingResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LabTestPricingResponse getById(Long id) {
        LabTestPricing entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("LabTestPricing not found with id " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public LabTestPricingResponse create(LabTestPricingRequest request) {
        LabTestPricing entity = new LabTestPricing();
        // map request to entity here
        LabTestPricing saved = repository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public LabTestPricingResponse update(Long id, LabTestPricingRequest request) {
        LabTestPricing entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("LabTestPricing not found with id " + id));
        // update entity from request here
        LabTestPricing updated = repository.save(entity);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private LabTestPricingResponse mapToResponse(LabTestPricing entity) {
        LabTestPricingResponse response = new LabTestPricingResponse();
        // Assume Long id field for boilerplate
        try {
            // response.setId(entity.getId());
        } catch(Exception e) {
            // Ignore if no getId() exists
        }
        return response;
    }
}
