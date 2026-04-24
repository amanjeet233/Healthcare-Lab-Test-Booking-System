package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.FilterRequestDTO;
import com.healthcare.labtestbooking.dto.FilterResponseDTO;
import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.PackageTest;
import com.healthcare.labtestbooking.entity.TestPackage;
import com.healthcare.labtestbooking.entity.enums.TestType;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import com.healthcare.labtestbooking.repository.PackageTestRepository;
import com.healthcare.labtestbooking.repository.TestPackageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FilterService {

    private static final List<String> GENDER_OPTIONS = Arrays.asList("MALE", "FEMALE", "KIDS");
    private static final List<String> ORGAN_OPTIONS = Arrays.asList("LIVER", "KIDNEY", "HEART", "THYROID");
    private static final List<String> REPORT_TIME_OPTIONS = Arrays.asList(
        "SAME_DAY", "WITHIN_24H", "WITHIN_48H", "WITHIN_72H"
    );
    private static final List<Integer> DISCOUNT_OPTIONS = Arrays.asList(10, 20, 30, 40);

    private final LabTestRepository labTestRepository;
    private final TestPackageRepository testPackageRepository;
    private final PackageTestRepository packageTestRepository;
    private final BookingRepository bookingRepository;

    public FilterResponseDTO filterTests(FilterRequestDTO request) {
        int page = request.getPage() != null && request.getPage() >= 0 ? request.getPage() : 0;
        int size = request.getSize() != null && request.getSize() > 0 ? request.getSize() : 20;

        List<LabTest> tests = labTestRepository.findByIsActiveTrue();
        List<TestPackage> packages = testPackageRepository.findByIsActiveTrue();

        Map<Long, List<LabTest>> packageTests = loadPackageTests(packages);

        List<FilterResponseDTO.ItemDTO> items = new ArrayList<>();
        for (LabTest test : tests) {
            if (matchesFilters(test, request)) {
                items.add(toItem(test));
            }
        }

        for (TestPackage testPackage : packages) {
            List<LabTest> childTests = packageTests.getOrDefault(testPackage.getId(), Collections.emptyList());
            if (matchesFilters(testPackage, childTests, request)) {
                items.add(toItem(testPackage, childTests));
            }
        }

        items = sortItems(items, request.getSortBy());

        int totalCount = items.size();
        int fromIndex = Math.min(page * size, totalCount);
        int toIndex = Math.min(fromIndex + size, totalCount);
        List<FilterResponseDTO.ItemDTO> pagedItems = items.subList(fromIndex, toIndex);

        return FilterResponseDTO.builder()
            .items(pagedItems)
            .totalCount(totalCount)
            .page(page)
            .size(size)
            .totalPages(size == 0 ? 0 : (int) Math.ceil((double) totalCount / size))
            .appliedFilters(buildAppliedFilters(request))
            .availableFilters(buildAvailableFilters(tests, packages))
            .build();
    }

    private Map<Long, List<LabTest>> loadPackageTests(List<TestPackage> packages) {
        Map<Long, List<LabTest>> map = new HashMap<>();
        for (TestPackage testPackage : packages) {
            List<PackageTest> packageTests = packageTestRepository.findByTestPackageOrderByDisplayOrder(testPackage);
            List<LabTest> tests = packageTests.stream()
                .map(PackageTest::getLabTest)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
            map.put(testPackage.getId(), tests);
        }
        return map;
    }

    private FilterResponseDTO.ItemDTO toItem(LabTest test) {
        BigDecimal price = test.getPrice() != null ? test.getPrice() : BigDecimal.ZERO;
        return FilterResponseDTO.ItemDTO.builder()
            .itemType("TEST")
            .id(test.getId())
            .name(test.getTestName())
            .code(test.getTestCode())
            .category(test.getCategory() != null ? test.getCategory().getCategoryName() : null)
            .price(price)
            .discountedPrice(price)
            .discountPercentage(BigDecimal.ZERO)
            .reportTimeHours(test.getReportTimeHours())
            .fastingRequired(test.getFastingRequired())
            .popularity(bookingRepository.countByTestId(test.getId()))
            .build();
    }

    private FilterResponseDTO.ItemDTO toItem(TestPackage testPackage, List<LabTest> tests) {
        BigDecimal totalPrice = testPackage.getTotalPrice() != null ? testPackage.getTotalPrice() : BigDecimal.ZERO;
        BigDecimal discounted = testPackage.getDiscountedPrice() != null ? testPackage.getDiscountedPrice() : totalPrice;
        BigDecimal discountPercentage = testPackage.getDiscountPercentage() != null
            ? testPackage.getDiscountPercentage() : calculateDiscount(totalPrice, discounted);

        Integer reportTime = tests.stream()
            .map(LabTest::getReportTimeHours)
            .filter(Objects::nonNull)
            .max(Integer::compareTo)
            .orElse(null);

        Boolean fastingRequired = tests.stream()
            .map(LabTest::getFastingRequired)
            .filter(Objects::nonNull)
            .anyMatch(Boolean::booleanValue);

        return FilterResponseDTO.ItemDTO.builder()
            .itemType("PACKAGE")
            .id(testPackage.getId())
            .name(testPackage.getPackageName())
            .code(testPackage.getPackageCode())
            .category(null)
            .price(totalPrice)
            .discountedPrice(discounted)
            .discountPercentage(discountPercentage)
            .reportTimeHours(reportTime)
            .fastingRequired(fastingRequired)
            .popularity(bookingRepository.countByTestPackageId(testPackage.getId()))
            .build();
    }

    private boolean matchesFilters(LabTest test, FilterRequestDTO request) {
        if (request.getGender() != null && !matchesGender(test, request.getGender())) {
            return false;
        }
        if (request.getOrgan() != null && !matchesOrgan(test, request.getOrgan())) {
            return false;
        }
        if (request.getTestType() != null && !matchesTestType(test, request.getTestType())) {
            return false;
        }
        if (!matchesPrice(test.getPrice(), request.getMinPrice(), request.getMaxPrice())) {
            return false;
        }
        if (!matchesDiscount(BigDecimal.ZERO, request.getDiscountMin())) {
            return false;
        }
        if (!matchesReportTime(test.getReportTimeHours(), request.getReportTime())) {
            return false;
        }
        return matchesFasting(test.getFastingRequired(), request.getFasting());
    }

    private boolean matchesFilters(TestPackage testPackage, List<LabTest> tests, FilterRequestDTO request) {
        if (request.getGender() != null && !matchesGender(testPackage, tests, request.getGender())) {
            return false;
        }
        if (request.getOrgan() != null && !matchesOrgan(testPackage, tests, request.getOrgan())) {
            return false;
        }
        if (request.getTestType() != null && !matchesTestType(testPackage, tests, request.getTestType())) {
            return false;
        }
        BigDecimal price = effectivePrice(testPackage.getTotalPrice(), testPackage.getDiscountedPrice());
        if (!matchesPrice(price, request.getMinPrice(), request.getMaxPrice())) {
            return false;
        }
        if (!matchesDiscount(testPackage.getDiscountPercentage(), request.getDiscountMin())) {
            return false;
        }
        Integer reportTime = tests.stream()
            .map(LabTest::getReportTimeHours)
            .filter(Objects::nonNull)
            .max(Integer::compareTo)
            .orElse(null);
        if (!matchesReportTime(reportTime, request.getReportTime())) {
            return false;
        }
        Boolean fasting = tests.stream()
            .map(LabTest::getFastingRequired)
            .filter(Objects::nonNull)
            .anyMatch(Boolean::booleanValue);
        return matchesFasting(fasting, request.getFasting());
    }

    private boolean matchesGender(LabTest test, String gender) {
        String text = normalize(textForTest(test));
        switch (gender.toUpperCase(Locale.ROOT)) {
            case "MALE":
                return containsAny(text, "men", "male", "prostate", "andrology");
            case "FEMALE":
                return containsAny(text, "women", "female", "thyroid", "pregnancy", "pcos");
            case "KIDS":
                return containsAny(text, "kids", "child", "pediatric", "paediatric");
            default:
                return true;
        }
    }

    private boolean matchesGender(TestPackage testPackage, List<LabTest> tests, String gender) {
        String text = normalize(testPackage.getPackageName() + " " + nullSafe(testPackage.getDescription()));
        if (matchesGenderText(text, gender)) {
            return true;
        }
        return tests.stream().anyMatch(test -> matchesGender(test, gender));
    }

    private boolean matchesGenderText(String text, String gender) {
        switch (gender.toUpperCase(Locale.ROOT)) {
            case "MALE":
                return containsAny(text, "men", "male");
            case "FEMALE":
                return containsAny(text, "women", "female", "thyroid", "pregnancy", "pcos");
            case "KIDS":
                return containsAny(text, "kids", "child", "pediatric", "paediatric");
            default:
                return true;
        }
    }

    private boolean matchesOrgan(LabTest test, String organ) {
        String text = normalize(textForTest(test));
        return containsAny(text, organ.toLowerCase(Locale.ROOT));
    }

    private boolean matchesOrgan(TestPackage testPackage, List<LabTest> tests, String organ) {
        String text = normalize(testPackage.getPackageName() + " " + nullSafe(testPackage.getDescription()));
        if (text.contains(organ.toLowerCase(Locale.ROOT))) {
            return true;
        }
        return tests.stream().anyMatch(test -> matchesOrgan(test, organ));
    }

    private boolean matchesTestType(LabTest test, String testType) {
        if (test.getTestType() != null && test.getTestType().name().equalsIgnoreCase(testType)) {
            return true;
        }
        return test.getCategory() != null
            && test.getCategory().getCategoryName().equalsIgnoreCase(testType);
    }

    private boolean matchesTestType(TestPackage testPackage, List<LabTest> tests, String testType) {
        return tests.stream().anyMatch(test -> matchesTestType(test, testType));
    }

    private boolean matchesPrice(BigDecimal price, BigDecimal min, BigDecimal max) {
        BigDecimal safePrice = price != null ? price : BigDecimal.ZERO;
        if (min != null && safePrice.compareTo(min) < 0) {
            return false;
        }
        if (max != null && safePrice.compareTo(max) > 0) {
            return false;
        }
        return true;
    }

    private boolean matchesDiscount(BigDecimal discountPercentage, BigDecimal minDiscount) {
        if (minDiscount == null) {
            return true;
        }
        BigDecimal discount = discountPercentage != null ? discountPercentage : BigDecimal.ZERO;
        return discount.compareTo(minDiscount) >= 0;
    }

    private boolean matchesReportTime(Integer hours, String reportTime) {
        if (reportTime == null || hours == null) {
            return true;
        }
        switch (reportTime.toUpperCase(Locale.ROOT)) {
            case "SAME_DAY":
                return hours <= 8;
            case "WITHIN_24H":
                return hours <= 24;
            case "WITHIN_48H":
                return hours <= 48;
            case "WITHIN_72H":
                return hours <= 72;
            default:
                return true;
        }
    }

    private boolean matchesFasting(Boolean fastingRequired, Boolean fastingFilter) {
        if (fastingFilter == null) {
            return true;
        }
        return fastingFilter.equals(Boolean.TRUE.equals(fastingRequired));
    }

    private BigDecimal effectivePrice(BigDecimal total, BigDecimal discounted) {
        if (discounted != null && discounted.compareTo(BigDecimal.ZERO) > 0) {
            return discounted;
        }
        return total != null ? total : BigDecimal.ZERO;
    }

    private BigDecimal calculateDiscount(BigDecimal total, BigDecimal discounted) {
        if (total == null || total.compareTo(BigDecimal.ZERO) == 0 || discounted == null) {
            return BigDecimal.ZERO;
        }
        return total.subtract(discounted)
            .multiply(BigDecimal.valueOf(100))
            .divide(total, 2, RoundingMode.HALF_UP);
    }

    private List<FilterResponseDTO.ItemDTO> sortItems(List<FilterResponseDTO.ItemDTO> items, String sortBy) {
        if (sortBy == null) {
            return items;
        }
        List<FilterResponseDTO.ItemDTO> copy = new ArrayList<>(items);
        switch (sortBy.toUpperCase(Locale.ROOT)) {
            case "POPULARITY":
                copy.sort(Comparator.comparing(FilterResponseDTO.ItemDTO::getPopularity, Comparator.nullsLast(Long::compareTo)).reversed());
                break;
            case "PRICE_LOW":
                copy.sort(Comparator.comparing(FilterResponseDTO.ItemDTO::getDiscountedPrice, Comparator.nullsLast(BigDecimal::compareTo)));
                break;
            case "PRICE_HIGH":
                copy.sort(Comparator.comparing(FilterResponseDTO.ItemDTO::getDiscountedPrice, Comparator.nullsLast(BigDecimal::compareTo)).reversed());
                break;
            case "FASTEST_REPORT":
                copy.sort(Comparator.comparing(FilterResponseDTO.ItemDTO::getReportTimeHours, Comparator.nullsLast(Integer::compareTo)));
                break;
            case "DISCOUNT":
                copy.sort(Comparator.comparing(FilterResponseDTO.ItemDTO::getDiscountPercentage, Comparator.nullsLast(BigDecimal::compareTo)).reversed());
                break;
            default:
                break;
        }
        return copy;
    }

    private Map<String, Object> buildAppliedFilters(FilterRequestDTO request) {
        Map<String, Object> applied = new HashMap<>();
        putIfNotNull(applied, "gender", request.getGender());
        putIfNotNull(applied, "organ", request.getOrgan());
        putIfNotNull(applied, "testType", request.getTestType());
        putIfNotNull(applied, "minPrice", request.getMinPrice());
        putIfNotNull(applied, "maxPrice", request.getMaxPrice());
        putIfNotNull(applied, "discountMin", request.getDiscountMin());
        putIfNotNull(applied, "reportTime", request.getReportTime());
        putIfNotNull(applied, "fasting", request.getFasting());
        putIfNotNull(applied, "sortBy", request.getSortBy());
        return applied;
    }

    private FilterResponseDTO.AvailableFiltersDTO buildAvailableFilters(List<LabTest> tests, List<TestPackage> packages) {
        BigDecimal min = BigDecimal.ZERO;
        BigDecimal max = BigDecimal.ZERO;

        List<BigDecimal> prices = new ArrayList<>();
        tests.stream()
            .map(LabTest::getPrice)
            .filter(Objects::nonNull)
            .forEach(prices::add);
        packages.stream()
            .map(pkg -> effectivePrice(pkg.getTotalPrice(), pkg.getDiscountedPrice()))
            .forEach(prices::add);

        if (!prices.isEmpty()) {
            min = prices.stream().min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
            max = prices.stream().max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        }

        List<String> testTypes = labTestRepository.findAllTestTypes();

        return FilterResponseDTO.AvailableFiltersDTO.builder()
            .genders(GENDER_OPTIONS)
            .organs(ORGAN_OPTIONS)
            .testTypes(testTypes)
            .priceRange(FilterResponseDTO.PriceRangeDTO.builder().min(min).max(max).build())
            .discountOptions(DISCOUNT_OPTIONS)
            .reportTimeOptions(REPORT_TIME_OPTIONS)
            .build();
    }

    private void putIfNotNull(Map<String, Object> map, String key, Object value) {
        if (value != null) {
            map.put(key, value);
        }
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private String textForTest(LabTest test) {
        String category = test.getCategory() != null ? test.getCategory().getCategoryName() : "";
        String description = test.getDescription() != null ? test.getDescription() : "";
        return test.getTestName() + " " + category + " " + description;
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        return value.toLowerCase(Locale.ROOT);
    }

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }
}
