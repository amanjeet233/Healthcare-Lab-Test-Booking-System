package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.DoctorAvailability;
import com.healthcare.labtestbooking.repository.DoctorAvailabilityRepository;
import com.healthcare.labtestbooking.dto.DoctorAvailabilityRequest;
import com.healthcare.labtestbooking.dto.DoctorAvailabilityResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository repository;

    @Transactional(readOnly = true)
    public List<DoctorAvailabilityResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DoctorAvailabilityResponse getById(Long id) {
        DoctorAvailability entity = repository.findById(Objects.requireNonNull(id, "DoctorAvailability ID must not be null"))
                .orElseThrow(() -> new RuntimeException("DoctorAvailability not found with id " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public DoctorAvailabilityResponse create(DoctorAvailabilityRequest request) {
        DoctorAvailability entity = new DoctorAvailability();
        // map request to entity here
        DoctorAvailability saved = repository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public DoctorAvailabilityResponse update(Long id, DoctorAvailabilityRequest request) {
        DoctorAvailability entity = repository.findById(Objects.requireNonNull(id, "DoctorAvailability ID must not be null"))
                .orElseThrow(() -> new RuntimeException("DoctorAvailability not found with id " + id));
        // update entity from request here
        DoctorAvailability updated = repository.save(entity);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(Objects.requireNonNull(id, "DoctorAvailability ID must not be null"));
    }

    private DoctorAvailabilityResponse mapToResponse(DoctorAvailability entity) {
        DoctorAvailabilityResponse response = new DoctorAvailabilityResponse();
        // Assume Long id field for boilerplate
        try {
            response.setId(entity.getId());
        } catch(Exception e) {
            // Ignore if no getId() exists
        }
        return response;
    }
}
