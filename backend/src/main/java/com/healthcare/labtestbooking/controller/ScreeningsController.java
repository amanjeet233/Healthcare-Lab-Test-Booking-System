package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/screenings")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"},
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
        allowCredentials = "true")
public class ScreeningsController {

    private static final List<String> DEFAULT_CATEGORIES = List.of(
            "thyroid", "heart", "kidney", "liver", "bone", "lungs", "brain", "full-body"
    );

    private final LabTestRepository labTestRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getScreenings(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "expert-curated") String type
    ) {
        String normalizedCategory = normalize(category);
        log.info("GET /api/screenings?category={}&type={}", normalizedCategory, type);

        Pageable pageable = PageRequest.of(0, 200);
        List<LabTest> source = normalizedCategory.isBlank()
                ? labTestRepository.findByIsActiveTrue(pageable).getContent()
                : labTestRepository.findByCategoryOrTag(normalizedCategory.replace("-", " "), pageable).getContent();

        List<Map<String, Object>> screenings = new ArrayList<>();
        LinkedHashSet<String> derivedCategories = new LinkedHashSet<>();
        for (LabTest test : source) {
            if (Boolean.FALSE.equals(test.getIsActive()) || test.getTestCode() == null || test.getTestCode().isBlank()) {
                continue;
            }
            String organSystem = inferOrganSystem(test);
            if (!normalizedCategory.isBlank() && !matchesRequestedCategory(organSystem, normalizedCategory)) {
                continue;
            }
            derivedCategories.add(organSystem);
            screenings.add(toScreeningItem(test, organSystem));
        }

        LinkedHashSet<String> categories = new LinkedHashSet<>(DEFAULT_CATEGORIES);
        categories.addAll(derivedCategories);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("screenings", screenings);
        payload.put("categories", new ArrayList<>(categories));
        payload.put("totalCount", screenings.size());

        return ResponseEntity.ok(ApiResponse.success("Screenings fetched successfully", payload));
    }

    private Map<String, Object> toScreeningItem(LabTest test, String organSystem) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", test.getTestCode());
        row.put("name", test.getTestName());
        row.put("organSystem", organSystem);
        row.put("icon", iconFor(organSystem));
        row.put("subtitle", firstNonBlank(test.getShortDescription(), test.getDescription(), "Doctor-designed screening panel"));
        row.put("testCount", test.getParametersCount() != null ? test.getParametersCount() : estimateTestCount(test));
        row.put("parameters", test.getSubTests() == null ? List.of() : test.getSubTests());
        row.put("reportTurnaroundHours", test.getReportTimeHours() != null ? test.getReportTimeHours() : 24);
        row.put("fastingRequired", Boolean.TRUE.equals(test.getFastingRequired()) ? "8hr" : "none");
        return row;
    }

    private String inferOrganSystem(LabTest test) {
        String haystack = String.join(" ",
                normalize(test.getCategoryName()),
                normalize(test.getSubCategory()),
                normalize(test.getTestName()),
                normalize(test.getDescription()),
                normalize(test.getTagsJson())
        );
        if (containsAny(haystack, "thyroid")) return "thyroid";
        if (containsAny(haystack, "cardiac", "heart", "lipid", "cholesterol")) return "heart";
        if (containsAny(haystack, "kidney", "renal", "creatinine", "kft")) return "kidney";
        if (containsAny(haystack, "liver", "hepatic", "lft", "bilirubin")) return "liver";
        if (containsAny(haystack, "bone", "vitamin d", "calcium")) return "bone";
        if (containsAny(haystack, "lung", "respiratory", "pft")) return "lungs";
        if (containsAny(haystack, "brain", "neuro", "cognitive")) return "brain";
        return "full-body";
    }

    private boolean matchesRequestedCategory(String organSystem, String requestedCategory) {
        if (requestedCategory == null || requestedCategory.isBlank()) return true;
        if (Objects.equals(organSystem, requestedCategory)) return true;
        return "all".equals(requestedCategory);
    }

    private int estimateTestCount(LabTest test) {
        if (test.getSubTests() != null && !test.getSubTests().isEmpty()) {
            return test.getSubTests().size();
        }
        return 1;
    }

    private String iconFor(String organSystem) {
        return switch (organSystem) {
            case "heart" -> "heart.svg";
            case "kidney" -> "kidney.svg";
            case "liver" -> "liver.svg";
            case "thyroid" -> "thyroid.svg";
            case "bone" -> "bone.svg";
            case "lungs" -> "lungs.svg";
            case "brain" -> "brain.svg";
            default -> "full-body.svg";
        };
    }

    private boolean containsAny(String text, String... needles) {
        String normalized = text == null ? "" : text.toLowerCase(Locale.ROOT);
        return Arrays.stream(needles).anyMatch(normalized::contains);
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) return value;
        }
        return "";
    }

    private String normalize(String value) {
        if (value == null) return "";
        return value.trim().toLowerCase(Locale.ROOT);
    }
}
