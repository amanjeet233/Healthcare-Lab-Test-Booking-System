package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.LabLocation;
import com.healthcare.labtestbooking.repository.LabLocationRepository;
import com.healthcare.labtestbooking.dto.LabLocationRequest;
import com.healthcare.labtestbooking.dto.LabLocationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabLocationService {

    private final LabLocationRepository repository;

    @Transactional(readOnly = true)
    public List<LabLocationResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LabLocationResponse getById(Long id) {
        LabLocation entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("LabLocation not found with id " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public LabLocationResponse create(LabLocationRequest request) {
        LabLocation entity = new LabLocation();
        // map request to entity here
        LabLocation saved = repository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public LabLocationResponse update(Long id, LabLocationRequest request) {
        LabLocation entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("LabLocation not found with id " + id));
        // update entity from request here
        LabLocation updated = repository.save(entity);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private LabLocationResponse mapToResponse(LabLocation entity) {
        LabLocationResponse response = new LabLocationResponse();
        // Assume Long id field for boilerplate
        try {
            response.setId(entity.getId());
        } catch(Exception e) {
            // Ignore if no getId() exists
        }
        return response;
    }
}
