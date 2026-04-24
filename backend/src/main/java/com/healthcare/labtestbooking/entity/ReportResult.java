package com.healthcare.labtestbooking.entity;

import com.healthcare.labtestbooking.entity.enums.AbnormalStatus;
import com.healthcare.labtestbooking.entity.enums.ResultStatus;
import com.healthcare.labtestbooking.listener.AuditListener;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@EntityListeners({AuditingEntityListener.class, AuditListener.class})
@Table(name = "report_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    private Report report;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id")
    private LabTest test;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parameter_id", nullable = false)
    private TestParameter parameter;

    @Column(name = "value")
    private String value;

    @Column(name = "result_value")
    private String resultValue;

    @Column(name = "unit", length = 40)
    private String unit;

    @Column(name = "normal_range_min", precision = 12, scale = 4)
    private BigDecimal normalRangeMin;

    @Column(name = "normal_range_max", precision = 12, scale = 4)
    private BigDecimal normalRangeMax;

    @Column(name = "normal_range")
    private String normalRange;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @Enumerated(EnumType.STRING)
    @Column(name = "abnormal_status")
    private AbnormalStatus abnormalStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ResultStatus status;

    @Column(name = "is_critical")
    @Builder.Default
    private Boolean isCritical = false;

    @Column(name = "is_abnormal")
    @Builder.Default
    private Boolean isAbnormal = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.abnormalStatus == AbnormalStatus.HIGH) {
            this.isAbnormal = true;
        }
    }
}
