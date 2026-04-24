package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.TestPackage;
import com.healthcare.labtestbooking.entity.enums.PackageTier;
import com.healthcare.labtestbooking.entity.enums.PackageType;
import com.healthcare.labtestbooking.repository.TestPackageRepository;
import com.healthcare.labtestbooking.service.TestPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"},
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
        allowCredentials = "true")
public class PackagesController {

    private final TestPackageService testPackageService;
    private final TestPackageRepository testPackageRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPackages(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tier,
            @RequestParam(defaultValue = "price") String sort,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        Sort resolvedSort = resolveSort(sort);

        List<TestPackage> packages = getPackagesByOptionalFilters(category, tier);
        packages = packages.stream().sorted(comparatorFromSort(resolvedSort)).toList();

        int from = Math.min(offset, packages.size());
        int to = Math.min(from + Math.max(1, limit), packages.size());
        List<Map<String, Object>> items = packages.subList(from, to).stream()
                .map(this::toPackageListItem)
                .collect(Collectors.toList());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("packages", items);
        payload.put("total", packages.size());
        payload.put("availableTiers", Arrays.stream(PackageTier.values()).map(Enum::name).map(String::toLowerCase).toList());
        payload.put("limit", Math.max(1, limit));
        payload.put("offset", Math.max(0, offset));
        return ResponseEntity.ok(ApiResponse.success("Packages fetched successfully", payload));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPackagesByCategory(
            @PathVariable String category,
            @RequestParam(required = false) String tier,
            @RequestParam(defaultValue = "price") String sort,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        return getPackages(category, tier, sort, limit, offset);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPackageById(@PathVariable String id) {
        TestPackage pkg = resolvePackage(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));
        return ResponseEntity.ok(ApiResponse.success("Package fetched successfully", Map.of("package", toPackageDetail(pkg))));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPackageDetails(@PathVariable String id) {
        return getPackageById(id);
    }

    @GetMapping("/compare")
    public ResponseEntity<ApiResponse<Map<String, Object>>> comparePackages(@RequestParam String ids) {
        List<TestPackage> packages = Arrays.stream(ids.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(this::resolvePackage)
                .flatMap(Optional::stream)
                .distinct()
                .collect(Collectors.toList());

        if (packages.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("No valid package ids provided"));
        }

        List<Map<String, Object>> packageRows = packages.stream()
                .map(this::toCompareRow)
                .collect(Collectors.toList());

        List<Integer> testCounts = packages.stream().map(TestPackage::getTotalTests).filter(Objects::nonNull).toList();
        List<BigDecimal> prices = packages.stream()
                .map(p -> Optional.ofNullable(p.getDiscountedPrice()).orElse(p.getTotalPrice()))
                .filter(Objects::nonNull)
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Package comparison generated", Map.of(
                "packages", packageRows,
                "comparison", Map.of(
                        "testCountDifference", testCounts,
                        "priceDifference", prices
                )
        )));
    }

    private List<TestPackage> getPackagesByOptionalFilters(String category, String tier) {
        List<TestPackage> filtered;
        PackageType packageType = toPackageType(category);
        if (packageType != null) {
            filtered = switch (packageType) {
                case SENIOR_MEN, SENIOR_WOMEN -> {
                    List<TestPackage> merged = new ArrayList<>(testPackageService.getPackagesByType(PackageType.SENIOR_MEN));
                    merged.addAll(testPackageService.getPackagesByType(PackageType.SENIOR_WOMEN));
                    yield merged;
                }
                default -> testPackageService.getPackagesByType(packageType);
            };
        } else {
            filtered = testPackageService.getActivePackages();
        }

        PackageTier packageTier = toPackageTier(tier);
        if (packageTier != null) {
            filtered = filtered.stream()
                    .filter(p -> packageTier.equals(p.getPackageTier()))
                    .collect(Collectors.toList());
        }

        return filtered;
    }

    private Optional<TestPackage> resolvePackage(String idOrCode) {
        Long numericId = toLong(idOrCode);
        if (numericId != null) {
            return testPackageService.getPackageById(numericId);
        }
        return testPackageService.getPackageByCode(idOrCode);
    }

    private Map<String, Object> toPackageListItem(TestPackage p) {
        BigDecimal base = Optional.ofNullable(p.getTotalPrice()).orElse(p.getBasePrice());
        BigDecimal finalPrice = Optional.ofNullable(p.getDiscountedPrice()).orElse(base);
        BigDecimal discount = p.getDiscountPercentage() != null ? p.getDiscountPercentage() : BigDecimal.ZERO;

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", p.getId());
        row.put("code", p.getPackageCode());
        row.put("name", p.getPackageName());
        row.put("tier", p.getPackageTier() != null ? p.getPackageTier().name().toLowerCase() : nullSafe(""));
        row.put("category", p.getPackageType() != null ? p.getPackageType().name().toLowerCase() : nullSafe(""));
        row.put("basePriceInPaise", toPaise(base));
        row.put("discountPercentage", discount);
        row.put("finalPrice", toPaise(finalPrice));
        row.put("testCount", Optional.ofNullable(p.getTotalTests()).orElse(0));
        row.put("turnaroundHours", Optional.ofNullable(p.getTurnaroundHours()).orElse(48));
        row.put("fastingRequired", Boolean.TRUE.equals(p.getFastingRequired()) ? "8hr" : "none");
        row.put("icon", p.getIconUrl());
        return row;
    }

    private Map<String, Object> toPackageDetail(TestPackage p) {
        Map<String, Object> base = new LinkedHashMap<>(toPackageListItem(p));
        List<String> resolvedIncludedTests = resolveIncludedTests(p);
        base.put("description", p.getDescription());
        base.put("sampleType", p.getSampleTypes());
        base.put("benefits", Optional.ofNullable(p.getBenefits()).orElse(List.of()));
        base.put("features", Optional.ofNullable(p.getFeatures()).orElse(List.of()));
        base.put("includedTests", resolvedIncludedTests);
        base.put("includedTestNames", resolvedIncludedTests);
        if ((p.getTotalTests() == null || p.getTotalTests() == 0) && !resolvedIncludedTests.isEmpty()) {
            base.put("totalTests", resolvedIncludedTests.size());
            base.put("testCount", resolvedIncludedTests.size());
        }
        base.put("doctorConsultations", p.getDoctorConsultations());
        base.put("imagingIncluded", p.getImagingIncluded());
        base.put("geneticTesting", p.getGeneticTesting());
        base.put("bestFor", p.getBestFor());
        return base;
    }

    private List<String> resolveIncludedTests(TestPackage p) {
        LinkedHashSet<String> names = new LinkedHashSet<>();
        List<String> stored = Optional.ofNullable(p.getIncludedTestNames()).orElse(List.of());
        stored.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .forEach(names::add);

        try {
            List<LabTest> tests = Optional.ofNullable(p.getTests()).orElse(List.of());
            tests.stream()
                    .map(t -> Optional.ofNullable(t.getTestName()).orElse(""))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .forEach(names::add);
        } catch (Exception ignored) {
            // If lazy-loading fails, keep stored names only.
        }

        return new ArrayList<>(names);
    }

    private Map<String, Object> toCompareRow(TestPackage p) {
        BigDecimal price = Optional.ofNullable(p.getDiscountedPrice()).orElse(p.getTotalPrice());
        return Map.of(
                "id", p.getId(),
                "name", p.getPackageName(),
                "tier", p.getPackageTier() != null ? p.getPackageTier().name().toLowerCase() : nullSafe(""),
                "price", price != null ? price : BigDecimal.ZERO,
                "testCount", Optional.ofNullable(p.getTotalTests()).orElse(0),
                "imaging", Boolean.TRUE.equals(p.getImagingIncluded()) ? List.of("imaging-included") : List.of()
        );
    }

    private PackageType toPackageType(String category) {
        if (category == null || category.isBlank() || "all".equalsIgnoreCase(category)) return null;
        String normalized = category.trim().toUpperCase().replace('-', '_').replace(' ', '_');
        return switch (normalized) {
            case "MEN" -> PackageType.MEN;
            case "WOMEN" -> PackageType.WOMEN;
            case "COUPLE", "COUPLES" -> PackageType.COUPLE;
            case "CHILD", "CHILDREN" -> PackageType.CHILD;
            case "SENIOR", "SENIORS", "SENIOR_CITIZEN" -> PackageType.SENIOR_MEN;
            case "SENIOR_MEN" -> PackageType.SENIOR_MEN;
            case "SENIOR_WOMEN" -> PackageType.SENIOR_WOMEN;
            case "VITAMINS", "VITAMIN" -> PackageType.VITAMINS;
            default -> {
                try {
                    yield PackageType.valueOf(normalized);
                } catch (Exception ex) {
                    yield null;
                }
            }
        };
    }

    private PackageTier toPackageTier(String tier) {
        if (tier == null || tier.isBlank() || "all".equalsIgnoreCase(tier)) return null;
        String normalized = tier.trim().toUpperCase();
        try {
            return PackageTier.valueOf(normalized);
        } catch (Exception ex) {
            return null;
        }
    }

    private Sort resolveSort(String sort) {
        if ("name".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.ASC, "packageName");
        }
        if ("test-count".equalsIgnoreCase(sort) || "testCount".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "totalTests");
        }
        return Sort.by(Sort.Direction.ASC, "discountedPrice");
    }

    private Comparator<TestPackage> comparatorFromSort(Sort sort) {
        Sort.Order order = sort.stream().findFirst().orElse(Sort.Order.asc("discountedPrice"));
        Comparator<TestPackage> comparator;
        if ("packageName".equals(order.getProperty())) {
            comparator = Comparator.comparing(p -> Optional.ofNullable(p.getPackageName()).orElse(""), String.CASE_INSENSITIVE_ORDER);
        } else if ("totalTests".equals(order.getProperty())) {
            comparator = Comparator.comparing(p -> Optional.ofNullable(p.getTotalTests()).orElse(0));
        } else {
            comparator = Comparator.comparing(p -> Optional.ofNullable(p.getDiscountedPrice())
                    .orElse(Optional.ofNullable(p.getTotalPrice()).orElse(BigDecimal.ZERO)));
        }
        return order.isDescending() ? comparator.reversed() : comparator;
    }

    private long toPaise(BigDecimal amount) {
        if (amount == null) return 0L;
        return amount.multiply(new BigDecimal("100"))
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();
    }

    private Long toLong(String value) {
        try {
            return Long.parseLong(value);
        } catch (Exception ex) {
            return null;
        }
    }

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }
}
