package com.healthcare.labtestbooking.entity;

import com.healthcare.labtestbooking.entity.enums.RiskLevel;
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
@Table(name = "health_scores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "overall_score", precision = 5, scale = 2)
    private BigDecimal overallScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level")
    private RiskLevel riskLevel;

    @Column(name = "body_system_scores_json", columnDefinition = "JSON")
    private String bodySystemScoresJson;

    @Column(name = "cardiovascular_score", precision = 5, scale = 2)
    private BigDecimal cardiovascularScore;

    @Column(name = "metabolic_score", precision = 5, scale = 2)
    private BigDecimal metabolicScore;

    @Column(name = "renal_score", precision = 5, scale = 2)
    private BigDecimal renalScore;

    @Column(name = "hepatic_score", precision = 5, scale = 2)
    private BigDecimal hepaticScore;

    @Column(name = "endocrine_score", precision = 5, scale = 2)
    private BigDecimal endocrineScore;

    @Column(name = "calculated_date")
    private LocalDateTime calculatedDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.calculatedDate == null) {
            this.calculatedDate = LocalDateTime.now();
        }
    }
}
