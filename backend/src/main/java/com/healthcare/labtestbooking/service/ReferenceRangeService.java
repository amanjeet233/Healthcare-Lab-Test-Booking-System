package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.ReferenceRange;
import com.healthcare.labtestbooking.repository.ReferenceRangeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReferenceRangeService {

    private final ReferenceRangeRepository referenceRangeRepository;

    @Transactional
    public ReferenceRange saveReferenceRange(ReferenceRange referenceRange) {
        log.info("Saving reference range for parameter id: {}", referenceRange.getParameter().getId());
        return referenceRangeRepository.save(referenceRange);
    }

    public Optional<ReferenceRange> getReferenceRangeById(Long id) {
        return referenceRangeRepository.findById(id);
    }

    public List<ReferenceRange> getAllReferenceRanges() {
        return referenceRangeRepository.findAll();
    }

    @Transactional
    public void deleteReferenceRange(Long id) {
        log.info("Deleting reference range with id: {}", id);
        referenceRangeRepository.deleteById(id);
    }
}
