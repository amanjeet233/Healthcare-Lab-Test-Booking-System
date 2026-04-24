package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.TestCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TestCategoryRepository extends JpaRepository<TestCategory, Long> {
    Optional<TestCategory> findByCategoryName(String categoryName);
}
