package com.healthcare.labtestbooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.healthcare.labtestbooking.entity.enums.AgeGroup;
import com.healthcare.labtestbooking.entity.enums.Gender;
import com.healthcare.labtestbooking.entity.enums.PackageTier;
import com.healthcare.labtestbooking.entity.enums.PackageType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.healthcare.labtestbooking.listener.AuditListener;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@EntityListeners({AuditingEntityListener.class, AuditListener.class})
@Table(name = "test_packages", indexes = {
    @Index(name = "idx_package_type", columnList = "package_type"),
    @Index(name = "idx_package_tier", columnList = "package_tier"),
    @Index(name = "idx_age_group", columnList = "age_group"),
    @Index(name = "idx_gender", columnList = "gender_applicable"),
    @Index(name = "idx_is_active", columnList = "is_active"),
    @Index(name = "idx_is_popular", columnList = "is_popular")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestPackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "package_code", nullable = false, unique = true)
    private String packageCode;

    @Column(name = "package_name", nullable = false)
    private String packageName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "package_type")
    private PackageType packageType;

    @Enumerated(EnumType.STRING)
    @Column(name = "package_tier")
    private PackageTier packageTier;

    @Enumerated(EnumType.STRING)
    @Column(name = "age_group")
    private AgeGroup ageGroup;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender_applicable")
    private Gender genderApplicable;

    @Column(name = "profession_applicable")
    private String professionApplicable;

    @Column(name = "health_condition")
    private String healthCondition;

    @Column(name = "total_tests")
    private Integer totalTests;

    @Column(name = "base_price", precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "discounted_price", precision = 10, scale = 2)
    private BigDecimal discountedPrice;

    @Column(name = "discount_percentage", precision = 5, scale = 2)
    private BigDecimal discountPercentage;

    @Column(name = "savings_amount", precision = 10, scale = 2)
    private BigDecimal savingsAmount;

    @Column(name = "turnaround_hours")
    private Integer turnaroundHours;

    @Column(name = "sample_types")
    private String sampleTypes;

    @Column(name = "fasting_required")
    private Boolean fastingRequired;

    @Column(name = "fasting_hours")
    private Integer fastingHours;

    @Column(name = "home_collection_available")
    private Boolean homeCollectionAvailable;

    @Column(name = "home_collection_charges", precision = 10, scale = 2)
    private BigDecimal homeCollectionCharges;

    @ElementCollection
    @CollectionTable(name = "package_benefits", joinColumns = @JoinColumn(name = "package_id"))
    @Column(name = "benefit", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> benefits = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "package_preparations", joinColumns = @JoinColumn(name = "package_id"))
    @Column(name = "preparation", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> preparations = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "package_included_tests", joinColumns = @JoinColumn(name = "package_id"))
    @Column(name = "test_name")
    @Builder.Default
    private List<String> includedTestNames = new ArrayList<>();

    @Column(name = "doctor_consultations")
    private Integer doctorConsultations;

    @Column(name = "imaging_included")
    private Boolean imagingIncluded;

    @Column(name = "genetic_testing")
    private Boolean geneticTesting;

    @Column(name = "best_for", columnDefinition = "TEXT")
    private String bestFor;

    @ElementCollection
    @CollectionTable(name = "package_features", joinColumns = @JoinColumn(name = "package_id"))
    @Column(name = "feature", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> features = new ArrayList<>();

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_popular")
    @Builder.Default
    private Boolean isPopular = false;

    @Column(name = "is_recommended")
    @Builder.Default
    private Boolean isRecommended = false;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "badge_text")
    private String badgeText;

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(name = "image_url")
    private String imageUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "testPackage", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<PackageTest> packageTests;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "package_tests",
        joinColumns = @JoinColumn(name = "package_id"),
        inverseJoinColumns = @JoinColumn(name = "test_id")
    )
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<LabTest> tests = new ArrayList<>();

    @OneToMany(mappedBy = "testPackage", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();

    // Calculated method to get effective price
    public BigDecimal getEffectivePrice() {
        return discountedPrice != null ? discountedPrice : totalPrice;
    }

    // Calculate savings
    public BigDecimal calculateSavings() {
        if (totalPrice != null && discountedPrice != null) {
            return totalPrice.subtract(discountedPrice);
        }
        return BigDecimal.ZERO;
    }
}
