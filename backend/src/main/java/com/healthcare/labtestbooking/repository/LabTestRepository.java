package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.LabTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface LabTestRepository extends JpaRepository<LabTest, Long>, JpaSpecificationExecutor<LabTest> {
    Optional<LabTest> findByTestCode(String testCode);

    // Legacy methods - kept for backward compatibility but may not work with new
    // schema
    // List<LabTest> findByCategory(TestCategory category);
    // Page<LabTest> findByCategory(TestCategory category, Pageable pageable);
    // List<LabTest> findByTestType(TestType testType);
    // Page<LabTest> findByTestType(TestType testType, Pageable pageable);

    // Active query methods - these work with the new tests table
    List<LabTest> findByIsActiveTrue();

    Page<LabTest> findByIsActiveTrue(Pageable pageable);

    // Category query using string field
    @Query("SELECT t FROM LabTest t WHERE t.categoryName = :categoryName AND t.isActive = true")
    List<LabTest> findByCategoryNameAndIsActiveTrue(@Param("categoryName") String categoryName);

    @Query("SELECT t FROM LabTest t WHERE t.categoryName = :categoryName AND t.isActive = true")
    Page<LabTest> findByCategoryNameAndIsActiveTrue(@Param("categoryName") String categoryName, Pageable pageable);

    @Query("SELECT t FROM LabTest t WHERE t.categoryName IN :categories AND t.isActive = true")
    Page<LabTest> findByCategoryNameIn(@Param("categories") List<String> categories, Pageable pageable);

    @Query("SELECT t FROM LabTest t WHERE (t.testName LIKE %:keyword% OR t.testCode LIKE %:keyword% OR t.tagsJson LIKE %:keyword%) AND t.isActive = true")
    Page<LabTest> searchTests(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT t FROM LabTest t WHERE (t.testName LIKE %:keyword% OR t.testCode LIKE %:keyword% OR t.tagsJson LIKE %:keyword%) AND t.isActive = true")
    List<LabTest> searchTests(@Param("keyword") String keyword);

    @Query("SELECT t FROM LabTest t WHERE (t.categoryName = :category OR LOWER(t.categoryName) LIKE LOWER(CONCAT('%', :category, '%')) OR t.tagsJson LIKE %:category%) AND t.isActive = true")
    Page<LabTest> findByCategoryOrTag(@Param("category") String category, Pageable pageable);

    @Query("SELECT t FROM LabTest t WHERE t.price BETWEEN :minPrice AND :maxPrice")
    List<LabTest> findByPriceRange(@Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice);

    @Query("SELECT t FROM LabTest t WHERE t.price BETWEEN :minPrice AND :maxPrice")
    Page<LabTest> findByPriceRange(@Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable);

    @Query("SELECT DISTINCT COALESCE(t.categoryName, 'General') FROM LabTest t WHERE t.isActive = true")
    List<String> findAllCategories();

    @Query("SELECT DISTINCT t.categoryName FROM LabTest t")
    List<String> findAllTestTypes();

    @Query("SELECT COUNT(t) FROM LabTest t WHERE t.categoryName = :categoryName")
    long countByCategory(@Param("categoryName") String categoryName);

    // Case-insensitive category search (handles slug -> name mismatches)
    @Query("SELECT t FROM LabTest t WHERE LOWER(t.categoryName) LIKE LOWER(CONCAT('%', :categoryName, '%')) AND t.isActive = true")
    Page<LabTest> findByCategoryNameLike(@Param("categoryName") String categoryName, Pageable pageable);

    // Doctor Test Management queries
    boolean existsByTestCode(String testCode);

    @Query("SELECT t FROM LabTest t WHERE t.categoryName = :categoryName AND t.isActive = true")
    List<LabTest> findByCategoryNameAndIsActiveTrueQuery(@Param("categoryName") String categoryName);

    @Query("SELECT t FROM LabTest t WHERE LOWER(t.testName) LIKE LOWER(CONCAT('%', :testName, '%')) AND t.isActive = true")
    List<LabTest> findByTestNameContainingIgnoreCaseAndIsActiveTrue(@Param("testName") String testName);

    Page<LabTest> findByIsTrendingTrue(Pageable pageable);

    Page<LabTest> findByIsTrendingTrueAndIsPackageFalse(Pageable pageable);
}