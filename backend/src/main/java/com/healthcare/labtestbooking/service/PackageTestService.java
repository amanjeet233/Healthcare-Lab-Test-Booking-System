package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.PackageTest;
import com.healthcare.labtestbooking.repository.PackageTestRepository;
import com.healthcare.labtestbooking.dto.PackageTestRequest;
import com.healthcare.labtestbooking.dto.PackageTestResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackageTestService {

    private final PackageTestRepository repository;

    @Transactional(readOnly = true)
    public List<PackageTestResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PackageTestResponse getById(Long id) {
        PackageTest entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("PackageTest not found with id " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public PackageTestResponse create(PackageTestRequest request) {
        PackageTest entity = new PackageTest();
        // map request to entity here
        PackageTest saved = repository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public PackageTestResponse update(Long id, PackageTestRequest request) {
        PackageTest entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("PackageTest not found with id " + id));
        // update entity from request here
        PackageTest updated = repository.save(entity);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private PackageTestResponse mapToResponse(PackageTest entity) {
        PackageTestResponse response = new PackageTestResponse();
        // Assume Long id field for boilerplate
        try {
            response.setId(entity.getId());
        } catch(Exception e) {
            // Ignore if no getId() exists
        }
        return response;
    }
}
