package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.LabTestDTO;
import com.healthcare.labtestbooking.dto.TestParameterDTO;
import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.TestCategory;
import com.healthcare.labtestbooking.entity.TestParameter;
import com.healthcare.labtestbooking.entity.enums.TestType;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import com.healthcare.labtestbooking.repository.TestCategoryRepository;
import com.healthcare.labtestbooking.repository.TestParameterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import jakarta.persistence.criteria.Predicate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LabTestService {

        private final LabTestRepository labTestRepository;
        private final TestCategoryRepository testCategoryRepository;
        private final TestParameterRepository testParameterRepository;

        @Cacheable(value = "topBooked", unless = "#result.isEmpty()")
        public List<LabTestDTO> getPopularTests() {
                log.info("Fetching popular lab tests (cached)");
                // Simplified: returns first 5 active tests as popular
                return labTestRepository.findByIsActiveTrue().stream()
                                .limit(5)
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public List<LabTestDTO> getAllActiveTests() {
                log.info("Fetching all active lab tests");
                return labTestRepository.findByIsActiveTrue().stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public LabTestDTO getTestById(Long id) {
                log.info("Fetching test by ID: {}", id);
                LabTest test = labTestRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Test not found with id: " + id));
                return convertToDTO(test);
        }

        public LabTestDTO getTestByCode(String testCode) {
                log.info("Fetching test by code: {}", testCode);
                LabTest test = labTestRepository.findByTestCode(testCode)
                                .orElseThrow(() -> new RuntimeException("Test not found with code: " + testCode));
                return convertToDTO(test);
        }

        public List<LabTestDTO> getTestsByCategory(Long categoryId) {
                log.info("Fetching tests by category ID: {}", categoryId);
                // Note: New schema uses category names as strings, not IDs
                // Return all active tests for now (can filter by name in controller if needed)
                return labTestRepository.findByIsActiveTrue().stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public List<LabTestDTO> getTestsByType(TestType testType) {
                log.info("Fetching tests by type: {}", testType);
                // Note: testType is no longer a persistent field
                // Return all active tests for now
                return labTestRepository.findByIsActiveTrue().stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public List<LabTestDTO> searchTests(String keyword) {
                log.info("Searching tests with keyword: {}", keyword);
                return labTestRepository.searchTests(keyword).stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public List<LabTestDTO> getTestsByPriceRange(BigDecimal min, BigDecimal max) {
                log.info("Fetching tests in price range: {} - {}", min, max);
                return labTestRepository.findByPriceRange(min, max).stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        @Cacheable("typesList")
        public List<String> getAllTestTypes() {
                return labTestRepository.findAllTestTypes();
        }

        // ===== Paginated Methods =====

        public Page<LabTestDTO> getAllActiveTests(Pageable pageable) {
                log.info("Fetching all active lab tests with pagination | Page: {}, Size: {}",
                                pageable.getPageNumber(), pageable.getPageSize());
                return labTestRepository.findByIsActiveTrue(pageable)
                                .map(this::convertToDTO);
        }

        public Page<LabTestDTO> getTestsByCategory(Long categoryId, Pageable pageable) {
                log.info("Fetching tests by category ID: {} with pagination | Page: {}, Size: {}",
                                categoryId, pageable.getPageNumber(), pageable.getPageSize());
                // Note: New schema uses category names as strings, not IDs
                // Return all active tests paginated
                return labTestRepository.findByIsActiveTrue(pageable)
                                .map(this::convertToDTO);
        }

        public Page<LabTestDTO> getTestsByType(TestType testType, Pageable pageable) {
                log.info("Fetching tests by type: {} with pagination | Page: {}, Size: {}",
                                testType, pageable.getPageNumber(), pageable.getPageSize());
                // Note: testType is no longer a persistent field
                // Return all active tests paginated
                return labTestRepository.findByIsActiveTrue(pageable)
                                .map(this::convertToDTO);
        }

        public Page<LabTestDTO> searchTests(String keyword, Pageable pageable) {
                log.info("Searching tests with keyword: {} and pagination | Page: {}, Size: {}",
                                keyword, pageable.getPageNumber(), pageable.getPageSize());
                return labTestRepository.searchTests(keyword, pageable)
                                .map(this::convertToDTO);
        }

        public Page<LabTestDTO> getTestsByPriceRange(BigDecimal min, BigDecimal max, Pageable pageable) {
                log.info("Fetching tests in price range: {} - {} with pagination | Page: {}, Size: {}",
                                min, max, pageable.getPageNumber(), pageable.getPageSize());
                return labTestRepository.findByPriceRange(min, max, pageable)
                                .map(this::convertToDTO);
        }

        @Cacheable(value = "trendingTests", key = "'trending_top12'")
        public List<LabTestDTO> getTrendingTests() {
                log.info("Fetching trending lab tests (cached)");
                return labTestRepository.findByIsTrendingTrueAndIsPackageFalse(PageRequest.of(0, 12)).getContent().stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        @Cacheable(value = "trendingTests", key = "'trending_page_' + #pageable.pageNumber + '_' + #pageable.pageSize")
        public Page<LabTestDTO> getTrendingTests(Pageable pageable) {
                log.info("Fetching trending tests with pagination (cached)");
                return labTestRepository.findByIsTrendingTrueAndIsPackageFalse(pageable)
                                .map(this::convertToDTO);
        }

        private LabTestDTO convertToDTO(LabTest test) {
                List<TestParameterDTO> parameters = testParameterRepository.findByTestOrderByDisplayOrder(test)
                                .stream()
                                .map(this::convertParameterToDTO)
                                .collect(Collectors.toList());

                BigDecimal currentPrice = test.getPrice();
                if (currentPrice == null || currentPrice.compareTo(java.math.BigDecimal.ZERO) == 0) {
                    if (test.getDiscountedPrice() != null && test.getDiscountedPrice().compareTo(java.math.BigDecimal.ZERO) > 0) {
                        currentPrice = test.getDiscountedPrice();
                    } else if (test.getOriginalPrice() != null) {
                        currentPrice = test.getOriginalPrice();
                    } else {
                        // If all are zero/null, default to a sensible fallback for the UI
                        currentPrice = java.math.BigDecimal.ZERO;
                    }
                }

                BigDecimal originalP = test.getOriginalPrice();
                if (originalP == null || originalP.compareTo(java.math.BigDecimal.ZERO) == 0) {
                    originalP = currentPrice;
                }

                return LabTestDTO.builder()
                                .id(test.getId())
                                .testCode(test.getTestCode())
                                .testName(test.getTestName())
                                .categoryId(test.getCategory() != null ? test.getCategory().getId() : null)
                                .categoryName(test.getCategoryName())
                                .testType(test.getTestType() != null ? test.getTestType().name() : null)
                                .methodology(test.getMethodology())
                                .description(test.getDescription())
                                .shortDescription(test.getShortDescription())
                                .unit(test.getUnit())
                                .normalRangeMin(test.getNormalRangeMin())
                                .normalRangeMax(test.getNormalRangeMax())
                                .normalRangeText(test.getNormalRangeText())
                                .fastingRequired(test.getFastingRequired())
                                .fastingHours(test.getFastingHours())
                                .reportTimeHours(test.getReportTimeHours())
                                .turnaroundTime(test.getTurnaroundTime())
                                .price(currentPrice)
                                .originalPrice(originalP)
                                .sampleType(test.getSampleType())
                                .isActive(test.getIsActive())
                                .isTopBooked(test.getIsTopBooked())
                                .isTopDeal(test.getIsTopDeal())
                                .parametersCount(test.getParametersCount())
                                .recommendedFor(test.getRecommendedFor())
                                .discountPercent(test.getDiscountPercent())
                                .iconUrl(test.getIconUrl())
                                .isPackage(test.getIsPackage())
                                .isTrending(test.getIsTrending())
                                .subTests(test.getSubTests())
                                .tags(test.getTags())
                                .parameters(parameters)
                                .build();
        }

        private TestParameterDTO convertParameterToDTO(TestParameter parameter) {
                return TestParameterDTO.builder()
                                .id(parameter.getId())
                                .parameterName(parameter.getParameterName())
                                .unit(parameter.getUnit())
                                .normalRangeMin(parameter.getNormalRangeMin())
                                .normalRangeMax(parameter.getNormalRangeMax())
                                .normalRangeText(parameter.getNormalRangeText())
                                .build();
        }

        // ============= NEW FILTER METHODS FOR INDIVIDUAL TESTS =============

        /**
         * Advanced filtering with multiple criteria
         * Supports category, price range, fasting requirement, search keywords
         */
        @Transactional(readOnly = true)
        public Page<LabTestDTO> filterTests(List<String> categories, BigDecimal minPrice, BigDecimal maxPrice, 
                                           Boolean fasting, String search, Pageable pageable) {
                log.info("Filtering tests: categories={}, priceRange={}..{}, fasting={}, search={}", 
                        categories, minPrice, maxPrice, fasting, search);

                // 1. If search is present, check if it matches a known category for precision
                if (search != null && !search.trim().isEmpty()) {
                        String s = search.trim();
                        log.info("Processing search: {}", s);
                        
                        // If searching for something like "Diabetes", treat as category filter
                        List<String> allCats = labTestRepository.findAllCategories();
                        boolean isCategoryMatch = allCats.stream()
                            .anyMatch(c -> c.equalsIgnoreCase(s) || s.toLowerCase().contains(c.toLowerCase()));
                        
                        if (isCategoryMatch) {
                            log.info("Search keyword '{}' matches a category. Redirecting to category filter.", s);
                            return labTestRepository.findByCategoryOrTag(s, pageable)
                                    .map(this::convertToDTO);
                        }
                        
                        return labTestRepository.searchTests(s, pageable)
                                .map(this::convertToDTO);
                }

                // 2. Multi-Category filter
                if (categories != null && !categories.isEmpty()) {
                        // Filter out "All Lab Tests" and empty/null
                        List<String> cleanCats = categories.stream()
                            .filter(c -> c != null && !c.isBlank() && !c.equalsIgnoreCase("All Lab Tests"))
                            .map(c -> c.replace("-", " ").replace("_", " ").trim())
                            .collect(Collectors.toList());
                        
                        if (!cleanCats.isEmpty()) {
                            log.info("Using {} category filters: {}", cleanCats.size(), cleanCats);
                            // Correctly use the IN query for multiple categories
                            return labTestRepository.findByCategoryNameIn(cleanCats, pageable)
                                    .map(this::convertToDTO);
                        }
                }

                // 3. Price Range
                if (minPrice != null && maxPrice != null) {
                        return labTestRepository.findByPriceRange(minPrice, maxPrice, pageable)
                                .map(this::convertToDTO);
                }

                // Default: all active tests
                return labTestRepository.findByIsActiveTrue(pageable)
                        .map(this::convertToDTO);
        }

        public Page<LabTestDTO> getAdvancedTests(
                String search, 
                List<String> categories, 
                String itemType,
                Boolean isTopBooked,
                Boolean isTopDeal,
                BigDecimal minPrice,
                BigDecimal maxPrice,
                String sortBy,
                Pageable pageable
        ) {
            log.info("Advanced search: categories={}, search={}, itemType={}", categories, search, itemType);
            
            // Build specification for flexible filtering
            Specification<LabTest> spec = (root, query, cb) -> {
                List<Predicate> predicates = new ArrayList<>();
                
                predicates.add(cb.equal(root.get("isActive"), true));
                
                if (search != null && !search.trim().isEmpty()) {
                    String pattern = "%" + search.toLowerCase() + "%";
                    predicates.add(cb.or(
                        cb.like(cb.lower(root.get("testName")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                    ));
                }
                
                if (categories != null && !categories.isEmpty()) {
                    predicates.add(root.get("categoryName").in(categories));
                }
                
                if (itemType != null) {
                    if ("PACKAGE".equalsIgnoreCase(itemType)) {
                        predicates.add(cb.equal(root.get("isPackage"), true));
                    } else if ("TEST".equalsIgnoreCase(itemType)) {
                        predicates.add(cb.equal(root.get("isPackage"), false));
                    }
                }
                
                if (isTopBooked != null) {
                    predicates.add(cb.equal(root.get("isTopBooked"), isTopBooked));
                }
                
                if (isTopDeal != null) {
                    predicates.add(cb.equal(root.get("isTopDeal"), isTopDeal));
                }
                
                if (minPrice != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("discountedPrice"), minPrice));
                }
                
                if (maxPrice != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("discountedPrice"), maxPrice));
                }
                
                return cb.and(predicates.toArray(new Predicate[0]));
            };
            
            // Apply sorting if sortBy provided
            // price_low, price_high, discount, popular
            Pageable sortedPageable = pageable;
            if (sortBy != null) {
                Sort sort = Sort.unsorted();
                switch (sortBy.toLowerCase()) {
                    case "price_low":
                        sort = Sort.by(Sort.Order.asc("discountedPrice"));
                        break;
                    case "price_high":
                        sort = Sort.by(Sort.Order.desc("discountedPrice"));
                        break;
                    case "discount":
                        sort = Sort.by(Sort.Order.desc("discountPercent"));
                        break;
                    case "popular":
                        sort = Sort.by(Sort.Order.desc("id")); // Placeholder for popularity metric
                        break;
                }
                sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
            }
            
            return labTestRepository.findAll(spec, sortedPageable).map(this::convertToDTO);
        }

        public List<LabTestDTO> searchLive(String query) {
            PageRequest pageable = PageRequest.of(0, 8);
            return labTestRepository.searchTests(query, pageable)
                    .getContent()
                    .stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        }

        public LabTestDTO getBySlug(String slug) {
            return labTestRepository.findByTestCode(slug)
                    .map(this::convertToDTO)
                    .orElseThrow(() -> new RuntimeException("Test not found with slug: " + slug));
        }

        public List<LabTestDTO> getSimilarTests(String category, String excludeSlug, int limit) {
             PageRequest pageable = PageRequest.of(0, limit);
             return labTestRepository.findByCategoryNameIn(List.of(category), pageable)
                     .getContent()
                     .stream()
                     .filter(t -> !t.getTestCode().equals(excludeSlug))
                     .map(this::convertToDTO)
                     .collect(Collectors.toList());
        }

        /**
         * Get tests by category name (BLOOD, URINE, IMAGING, PATHOLOGY, etc.)
         */
        @Transactional(readOnly = true)
        @Cacheable(value = "labTests", key = "'cat_' + #categoryName + '_' + #pageable.pageNumber")
        public Page<LabTestDTO> getTestsByCategory(String categoryName, Pageable pageable) {
                log.info("Fetching tests by category: {} | Page: {}, Size: {}",
                        categoryName, pageable.getPageNumber(), pageable.getPageSize());
                // Use LIKE search so "blood-studies" matches "Blood Studies"
                return labTestRepository.findByCategoryNameLike(categoryName, pageable)
                        .map(this::convertToDTO);
        }

        /**
         * Get count of tests in each category
         */
        @Cacheable(value = "categoryCounts")
        public java.util.Map<String, Long> getCategoryCount() {
                log.info("Fetching category counts (cached)");
                java.util.Map<String, Long> counts = new java.util.HashMap<>();
                List<String> categories = labTestRepository.findAllCategories();
                for (String category : categories) {
                        long count = labTestRepository.countByCategory(category);
                        counts.put(category != null ? category : "General", count);
                }
                counts.put("ALL", labTestRepository.count());
                return counts;
        }

        /**
         * Get tests by tag (fever, diabetes, kidney, etc.)
         */
        @Transactional(readOnly = true)
        public Page<LabTestDTO> getTestsByTag(String tag, Pageable pageable) {
                log.info("Fetching tests by tag: {} | Page: {}, Size: {}",
                        tag, pageable.getPageNumber(), pageable.getPageSize());
                
                List<LabTest> allTests = labTestRepository.findByIsActiveTrue();
                List<LabTestDTO> filteredTests = allTests.stream()
                        .filter(test -> test.getTags() != null && test.getTags().stream()
                                .anyMatch(t -> t.equalsIgnoreCase(tag)))
                        .map(this::convertToDTO)
                        .collect(Collectors.toList());
                
                // Manual pagination
                int start = (int) pageable.getOffset();
                int end = Math.min(start + pageable.getPageSize(), filteredTests.size());
                List<LabTestDTO> pageContent = filteredTests.subList(start, end);
                
                return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, filteredTests.size());
        }

        /**
         * Get all tests from a specific list of test codes
         */
        @Transactional(readOnly = true)
        public List<LabTestDTO> getTestsByCodeList(List<String> testCodes) {
                log.info("Fetching {} tests by codes", testCodes.size());
                return testCodes.stream()
                        .map(labTestRepository::findByTestCode)
                        .filter(java.util.Optional::isPresent)
                        .map(java.util.Optional::get)
                        .map(this::convertToDTO)
                        .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        @Cacheable(value = "labTests", key = "T(java.util.Objects).hash(#search, #categories, #subCategory, #isTopDeal, #isTopBooked, #minPrice, #maxPrice, #sortBy, #page, #limit)")
        public Page<LabTestDTO> getAdvancedSearchTests(
                String search, 
                List<String> categories, 
                String subCategory, 
                Boolean isTopDeal, 
                Boolean isTopBooked, 
                BigDecimal minPrice, 
                BigDecimal maxPrice, 
                String sortBy, 
                int page, 
                int limit
        ) {
                log.info("Advanced search with caching enabled for params");
                Specification<LabTest> spec = (root, query, cb) -> {
                        List<Predicate> predicates = new ArrayList<>();
                        
                        // Deduplicate results
                        query.distinct(true);

                        // predicates.add(cb.isTrue(root.get("isActive"))); // TEMP REMOVED TO AUDIT 588 vs 1000+ COUNT
                        log.info("Auditing data: Current table count is {}", labTestRepository.count());
                        
                        if (search != null && !search.trim().isEmpty()) {
                                String[] tokens = search.trim().toLowerCase().split("\\s+");
                                List<Predicate> searchPredicates = new ArrayList<>();
                                
                                for (String token : tokens) {
                                    token = token.replaceAll("[^a-zA-Z0-9]", "").trim();
                                    if (token.length() < 2) continue; // Skip very short tokens
                                    String pattern = "%" + token + "%";
                                    searchPredicates.add(cb.or(
                                        cb.like(cb.lower(root.get("testName")), pattern),
                                        cb.like(cb.lower(root.get("description")), pattern),
                                        cb.like(cb.lower(root.get("categoryName")), pattern),
                                        cb.like(cb.lower(root.get("subCategory")), pattern)
                                    ));
                                }
                                
                                if (!searchPredicates.isEmpty()) {
                                    predicates.add(cb.and(searchPredicates.toArray(new Predicate[0])));
                                }
                        }
                        
                        if (categories != null && !categories.isEmpty()) {
                                List<Predicate> catPredicates = new ArrayList<>();
                                for (String cat : categories) {
                                        if (cat == null || cat.trim().isEmpty()) continue;
                                        String pattern = "%" + cat.trim().toLowerCase() + "%";
                                        catPredicates.add(cb.or(
                                            cb.like(cb.lower(root.get("categoryName")), pattern),
                                            cb.like(cb.lower(root.get("subCategory")), pattern)
                                        ));
                                }
                                if (!catPredicates.isEmpty()) {
                                    predicates.add(cb.or(catPredicates.toArray(new Predicate[0])));
                                }
                        }
                        
                        if (subCategory != null && !subCategory.trim().isEmpty()) {
                                predicates.add(cb.equal(root.get("subCategory"), subCategory));
                        }
                        
                        if (isTopDeal != null) {
                                predicates.add(cb.equal(root.get("isTopDeal"), isTopDeal));
                        }

                        if (isTopBooked != null) {
                                predicates.add(cb.equal(root.get("isTopBooked"), isTopBooked));
                        }

                        // Use discountedPrice for filtering as that is what users see
                        if (minPrice != null) {
                                predicates.add(cb.greaterThanOrEqualTo(root.get("discountedPrice"), minPrice));
                        }

                        if (maxPrice != null) {
                                predicates.add(cb.lessThanOrEqualTo(root.get("discountedPrice"), maxPrice));
                        }
                        
                        return cb.and(predicates.toArray(new Predicate[0]));
                };

                Sort sort = Sort.unsorted();
                if (sortBy != null) {
                        switch (sortBy) {
                                case "price_low":
                                        sort = Sort.by(Sort.Direction.ASC, "discountedPrice");
                                        break;
                                case "price_high":
                                        sort = Sort.by(Sort.Direction.DESC, "discountedPrice");
                                        break;
                                case "discount":
                                        sort = Sort.by(Sort.Direction.DESC, "discountPercent");
                                        break;
                                case "popular":
                                        sort = Sort.by(Sort.Direction.DESC, "isTopBooked");
                                        break;
                                case "newest":
                                        sort = Sort.by(Sort.Direction.DESC, "createdAt");
                                        break;
                        }
                }
                
                int actualPage = page > 0 ? page - 1 : 0;
                Pageable pageable = PageRequest.of(actualPage, limit, sort);
                
                Page<LabTest> resultPage = labTestRepository.findAll(spec, pageable);
                
                return resultPage.map(this::convertToDTO);
        }
}

