package com.healthcare.labtestbooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.healthcare.labtestbooking.listener.AuditListener;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@EntityListeners({ AuditingEntityListener.class, AuditListener.class })
@Table(name = "test_parameters")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestParameter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private LabTest test;

    @Column(name = "parameter_name", nullable = false)
    private String parameterName;

    private String unit;

    @Column(name = "normal_range_min", precision = 12, scale = 4)
    private BigDecimal normalRangeMin;

    @Column(name = "normal_range_max", precision = 12, scale = 4)
    private BigDecimal normalRangeMax;

    @Column(name = "critical_low", precision = 12, scale = 4)
    private BigDecimal criticalLow;

    @Column(name = "critical_high", precision = 12, scale = 4)
    private BigDecimal criticalHigh;

    @Column(name = "is_critical", nullable = false)
    @Builder.Default
    private Boolean isCritical = false;

    @Column(name = "normal_range_text", columnDefinition = "TEXT")
    private String normalRangeText;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "category")
    private String category;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
