package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.TestPopularity;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import com.healthcare.labtestbooking.repository.TestPopularityRepository;
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
public class TestPopularityService {

    private final TestPopularityRepository testPopularityRepository;
    private final LabTestRepository labTestRepository;

    @Transactional
    public TestPopularity incrementPopularity(Long testId) {
        log.info("Incrementing popularity for test id: {}", testId);
        TestPopularity popularity = testPopularityRepository.findByTestId(testId)
                .orElse(TestPopularity.builder()
                        .test(labTestRepository.findById(testId).orElse(null))
                        .bookingCount(0L)
                        .build());
        popularity.setBookingCount(popularity.getBookingCount() + 1);
        return testPopularityRepository.save(popularity);
    }

    public List<TestPopularity> getPopularityStats() {
        return testPopularityRepository.findAll();
    }
}
