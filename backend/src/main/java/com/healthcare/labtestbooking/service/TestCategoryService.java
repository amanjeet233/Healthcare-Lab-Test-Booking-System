package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.TestCategory;
import com.healthcare.labtestbooking.repository.TestCategoryRepository;
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
public class TestCategoryService {

    private final TestCategoryRepository testCategoryRepository;

    @Transactional
    public TestCategory saveCategory(TestCategory category) {
        log.info("Saving test category: {}", category.getCategoryName());
        return testCategoryRepository.save(category);
    }

    public Optional<TestCategory> getCategoryById(Long id) {
        return testCategoryRepository.findById(id);
    }

    public List<TestCategory> getAllCategories() {
        return testCategoryRepository.findAll();
    }

    @Transactional
    public void deleteCategory(Long id) {
        log.info("Deleting test category with id: {}", id);
        testCategoryRepository.deleteById(id);
    }
}
