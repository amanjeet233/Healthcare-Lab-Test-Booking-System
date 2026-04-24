package com.healthcare.labtestbooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.labtestbooking.entity.enums.TestType;
import com.healthcare.labtestbooking.listener.AuditListener;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Entity
@EntityListeners({AuditingEntityListener.class, AuditListener.class})
@Table(name = "tests", indexes = {
    @Index(name = "idx_test_category", columnList = "category"),
    @Index(name = "idx_test_is_top_booked", columnList = "is_top_booked"),
    @Index(name = "idx_test_discounted_price", columnList = "discounted_price"),
    @Index(name = "idx_test_slug", columnList = "slug")
})
@Access(AccessType.FIELD)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "slug", nullable = false, unique = true)
    private String testCode;
    
    @Column(name = "name", nullable = false)
    private String testName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "short_description")
    private String shortDescription;
    
    @Column(name = "category")
    private String categoryName;

    @Column(name = "sub_category")
    private String subCategory;

    
    @Transient
    private TestCategory category;
    
    @Transient
    @Enumerated(EnumType.STRING)
    private TestType testType;
    
    @Transient
    private String methodology;
    
    @Transient
    private String unit;
    
    @Transient
    private BigDecimal normalRangeMin;
    
    @Transient
    private BigDecimal normalRangeMax;
    
    @Transient
    private BigDecimal criticalLow;
    
    @Transient
    private BigDecimal criticalHigh;
    
    @Transient
    private String normalRangeText;
    
    @Transient
    private String pediatricRange;
    
    @Transient
    private String maleRange;
    
    @Transient
    private String femaleRange;
    
    @Column(name = "fasting_required")
    private Boolean fastingRequired;

    @Column(name = "consent_required", nullable = false)
    @Builder.Default
    private Boolean consentRequired = false;
    
    @Transient
    private Integer fastingHours;
    
    @Column(name = "report_time_hours")
    private Integer reportTimeHours;
    
    @Column(name = "recommended_for")
    private String recommendedFor;

    @Column(name = "is_top_booked")
    private Boolean isTopBooked;

    @Column(name = "is_top_deal")
    private Boolean isTopDeal;

    @Column(name = "sub_tests", columnDefinition = "JSON")
    private String subTestsJson;
    
    @Transient
    @Builder.Default
    private List<String> subTests = new ArrayList<>();
    
    @Column(name = "tags", columnDefinition = "JSON")
    private String tagsJson;
    
    @Transient
    @Builder.Default
    private List<String> tags = new ArrayList<>();
    
    @Column(name = "price")
    private BigDecimal price;
    
    @Column(name = "original_price")
    private BigDecimal originalPrice;
    
    @Column(name = "discounted_price")
    private BigDecimal discountedPrice;

    @Column(name = "discount_percent")
    private Integer discountPercent;

    @Column(name = "parameters_count")
    private Integer parametersCount;
    
    @Column(name = "sample_type")
    private String sampleType;
    
    @Column(name = "turnaround_time")
    private String turnaroundTime;
    
    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(name = "is_package")
    private Boolean isPackage;

    @Column(name = "is_trending")
    private Boolean isTrending;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // --- Relationships ---

    @OneToMany(mappedBy = "test", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<TestParameter> parameters = new ArrayList<>();

    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();

    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<LabTestPricing> labTestPricings = new ArrayList<>();

    @ManyToMany(mappedBy = "tests", fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<TestPackage> packages = new ArrayList<>();
    
    // ========== JSON Serialization Methods ==========
    
    @PrePersist
    @PreUpdate
    private void serializeJsonFields() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            enforceConsentRequirementDefaults();

            if (testCode == null || testCode.isBlank()) {
                String base = (testName == null ? "test" : testName)
                        .toLowerCase(Locale.ROOT)
                        .replaceAll("[^a-z0-9]+", "-")
                        .replaceAll("(^-|-$)", "");
                if (base.isBlank()) {
                    base = "test";
                }
                this.testCode = base + "-" + UUID.randomUUID().toString().substring(0, 8);
            }

            if (subTests != null && !subTests.isEmpty()) {
                this.subTestsJson = mapper.writeValueAsString(subTests);
            } else {
                this.subTestsJson = "[]";
            }
            
            if (tags != null && !tags.isEmpty()) {
                this.tagsJson = mapper.writeValueAsString(tags);
            } else {
                this.tagsJson = "[]";
            }
        } catch (JsonProcessingException e) {
            System.err.println("Error serializing JSON fields for test: " + testName + " - " + e.getMessage());
        }
    }

    private void enforceConsentRequirementDefaults() {
        if (Boolean.TRUE.equals(consentRequired)) {
            return;
        }
        String haystack = ((testName != null ? testName : "") + " " + (categoryName != null ? categoryName : ""))
                .toLowerCase(Locale.ROOT);
        if (haystack.contains("hiv")
                || haystack.contains("genetic")
                || haystack.contains("sti")
                || haystack.contains("std")
                || haystack.contains("drug monitoring")
                || haystack.contains("cancer marker")
                || haystack.contains("cancer")) {
            consentRequired = true;
        }
    }
    
    @PostLoad
    private void deserializeJsonFields() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            String normalizedSubTestsJson = normalizeJsonArrayString(subTestsJson);
            if (normalizedSubTestsJson != null && !normalizedSubTestsJson.isEmpty() && !normalizedSubTestsJson.equals("[]")) {
                this.subTests = mapper.readValue(normalizedSubTestsJson,
                    mapper.getTypeFactory().constructCollectionType(List.class, String.class));
            } else {
                this.subTests = new ArrayList<>();
            }
            
            String normalizedTagsJson = normalizeJsonArrayString(tagsJson);
            if (normalizedTagsJson != null && !normalizedTagsJson.isEmpty() && !normalizedTagsJson.equals("[]")) {
                this.tags = mapper.readValue(normalizedTagsJson,
                    mapper.getTypeFactory().constructCollectionType(List.class, String.class));
            } else {
                this.tags = new ArrayList<>();
            }
        } catch (JsonProcessingException e) {
            System.err.println("Error deserializing JSON fields for test: " + testName + " - " + e.getMessage());
            this.subTests = new ArrayList<>();
            this.tags = new ArrayList<>();
        }
    }

    private String normalizeJsonArrayString(String rawJson) throws JsonProcessingException {
        if (rawJson == null) {
            return null;
        }
        String trimmed = rawJson.trim();
        if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
            return new ObjectMapper().readValue(trimmed, String.class);
        }
        return trimmed;
    }
}
