package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.Technician;
import com.healthcare.labtestbooking.repository.TechnicianRepository;
import com.healthcare.labtestbooking.dto.TechnicianRequest;
import com.healthcare.labtestbooking.dto.TechnicianResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TechnicianService {

    private final TechnicianRepository repository;

    @Transactional(readOnly = true)
    public List<TechnicianResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TechnicianResponse getById(Long id) {
        Technician entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Technician not found with id " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public TechnicianResponse create(TechnicianRequest request) {
        Technician entity = new Technician();
        // map request to entity here
        Technician saved = repository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public TechnicianResponse update(Long id, TechnicianRequest request) {
        Technician entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Technician not found with id " + id));
        // update entity from request here
        Technician updated = repository.save(entity);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private TechnicianResponse mapToResponse(Technician entity) {
        TechnicianResponse response = new TechnicianResponse();
        // Assume Long id field for boilerplate
        try {
            response.setId(entity.getId());
        } catch(Exception e) {
            // Ignore if no getId() exists
        }
        return response;
    }
}
