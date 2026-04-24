package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.TestParameter;
import com.healthcare.labtestbooking.repository.TestParameterRepository;
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
public class TestParameterService {

    private final TestParameterRepository testParameterRepository;

    @Transactional
    public TestParameter saveParameter(TestParameter parameter) {
        log.info("Saving test parameter: {}", parameter.getParameterName());
        return testParameterRepository.save(parameter);
    }

    public List<TestParameter> getParametersByTestId(Long testId) {
        return testParameterRepository.findByTest_IdOrderByDisplayOrder(testId);
    }

    public Optional<TestParameter> getParameterById(Long id) {
        return testParameterRepository.findById(id);
    }

    public List<TestParameter> getAllParameters() {
        return testParameterRepository.findAll();
    }

    @Transactional
    public void deleteParameter(Long id) {
        log.info("Deleting test parameter with id: {}", id);
        testParameterRepository.deleteById(id);
    }
}
