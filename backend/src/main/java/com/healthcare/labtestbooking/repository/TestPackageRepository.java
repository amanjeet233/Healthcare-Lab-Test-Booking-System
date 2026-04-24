package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.TestPackage;
import com.healthcare.labtestbooking.entity.enums.AgeGroup;
import com.healthcare.labtestbooking.entity.enums.Gender;
import com.healthcare.labtestbooking.entity.enums.PackageTier;
import com.healthcare.labtestbooking.entity.enums.PackageType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TestPackageRepository extends JpaRepository<TestPackage, Long> {

    List<TestPackage> findByIsActiveTrue();

    Optional<TestPackage> findByPackageCode(String packageCode);

    // Find by package type
    List<TestPackage> findByPackageTypeAndIsActiveTrueOrderByDisplayOrderAsc(PackageType packageType);

    Page<TestPackage> findByPackageTypeAndIsActiveTrue(PackageType packageType, Pageable pageable);

    // Find by package tier
    List<TestPackage> findByPackageTierAndIsActiveTrueOrderByDiscountedPriceAsc(PackageTier packageTier);

    // Find by age group
    List<TestPackage> findByAgeGroupAndIsActiveTrueOrderByDisplayOrderAsc(AgeGroup ageGroup);

    @Query("SELECT p FROM TestPackage p WHERE p.ageGroup = :ageGroup OR p.ageGroup = 'ALL' AND p.isActive = true ORDER BY p.displayOrder")
    List<TestPackage> findByAgeGroupIncludingAll(@Param("ageGroup") AgeGroup ageGroup);

    // Find by gender
    List<TestPackage> findByGenderApplicableAndIsActiveTrueOrderByDisplayOrderAsc(Gender gender);

    @Query("SELECT p FROM TestPackage p WHERE (p.genderApplicable = :gender OR p.genderApplicable = 'ALL') AND p.isActive = true ORDER BY p.displayOrder")
    List<TestPackage> findByGenderIncludingAll(@Param("gender") Gender gender);

    // Find by profession
    List<TestPackage> findByProfessionApplicableAndIsActiveTrueOrderByDisplayOrderAsc(String profession);

    @Query("SELECT p FROM TestPackage p WHERE p.professionApplicable LIKE %:profession% AND p.isActive = true")
    List<TestPackage> findByProfessionContaining(@Param("profession") String profession);

    // Find by health condition
    List<TestPackage> findByHealthConditionAndIsActiveTrueOrderByDisplayOrderAsc(String healthCondition);

    @Query("SELECT p FROM TestPackage p WHERE p.healthCondition LIKE %:condition% AND p.isActive = true")
    List<TestPackage> findByHealthConditionContaining(@Param("condition") String condition);

    // Find popular packages
    List<TestPackage> findByIsPopularTrueAndIsActiveTrueOrderByDisplayOrderAsc();

    // Find recommended packages
    List<TestPackage> findByIsRecommendedTrueAndIsActiveTrueOrderByDisplayOrderAsc();

    // Find packages by price range
    @Query("SELECT p FROM TestPackage p WHERE p.discountedPrice BETWEEN :minPrice AND :maxPrice AND p.isActive = true ORDER BY p.discountedPrice")
    List<TestPackage> findByPriceRange(@Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice);

    // Find packages by number of tests
    @Query("SELECT p FROM TestPackage p WHERE p.totalTests >= :minTests AND p.isActive = true ORDER BY p.totalTests")
    List<TestPackage> findByMinTests(@Param("minTests") Integer minTests);

    // Search packages
    @Query("SELECT p FROM TestPackage p WHERE (LOWER(p.packageName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND p.isActive = true")
    Page<TestPackage> searchPackages(@Param("keyword") String keyword, Pageable pageable);

    // Combined filter query
    @Query("SELECT p FROM TestPackage p WHERE " +
           "(:packageType IS NULL OR p.packageType = :packageType) AND " +
           "(:packageTier IS NULL OR p.packageTier = :packageTier) AND " +
           "(:ageGroup IS NULL OR p.ageGroup = :ageGroup OR p.ageGroup = 'ALL') AND " +
           "(:gender IS NULL OR p.genderApplicable = :gender OR p.genderApplicable = 'ALL') AND " +
           "(:minPrice IS NULL OR p.discountedPrice >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.discountedPrice <= :maxPrice) AND " +
           "p.isActive = true " +
           "ORDER BY p.displayOrder")
    Page<TestPackage> findByFilters(
        @Param("packageType") PackageType packageType,
        @Param("packageTier") PackageTier packageTier,
        @Param("ageGroup") AgeGroup ageGroup,
        @Param("gender") Gender gender,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        Pageable pageable
    );

    // Count by type
    long countByPackageTypeAndIsActiveTrue(PackageType packageType);

    // Find top saving packages
    @Query("SELECT p FROM TestPackage p WHERE p.isActive = true ORDER BY p.savingsAmount DESC")
    List<TestPackage> findTopSavingPackages(Pageable pageable);

    // Find packages with home collection
    List<TestPackage> findByHomeCollectionAvailableTrueAndIsActiveTrueOrderByDiscountedPriceAsc();
}
