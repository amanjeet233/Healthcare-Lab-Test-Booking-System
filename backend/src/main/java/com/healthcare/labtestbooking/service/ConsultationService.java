package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.Consultation;
import com.healthcare.labtestbooking.repository.ConsultationRepository;
import com.healthcare.labtestbooking.dto.ConsultationRequest;
import com.healthcare.labtestbooking.dto.ConsultationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository repository;

    @Transactional(readOnly = true)
    public List<ConsultationResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ConsultationResponse getById(Long id) {
        Consultation entity = repository.findById(Objects.requireNonNull(id, "Consultation ID must not be null"))
                .orElseThrow(() -> new RuntimeException("Consultation not found with id " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public ConsultationResponse create(ConsultationRequest request) {
        Consultation entity = new Consultation();
        // map request to entity here
        Consultation saved = repository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public ConsultationResponse update(Long id, ConsultationRequest request) {
        Consultation entity = repository.findById(Objects.requireNonNull(id, "Consultation ID must not be null"))
                .orElseThrow(() -> new RuntimeException("Consultation not found with id " + id));
        // update entity from request here
        Consultation updated = repository.save(entity);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(Objects.requireNonNull(id, "Consultation ID must not be null"));
    }

    private ConsultationResponse mapToResponse(Consultation entity) {
        ConsultationResponse response = new ConsultationResponse();
        // Assume Long id field for boilerplate
        try {
            response.setId(entity.getId());
        } catch(Exception e) {
            // Ignore if no getId() exists
        }
        return response;
    }
}
