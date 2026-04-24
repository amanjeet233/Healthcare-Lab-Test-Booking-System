package com.healthcare.labtestbooking.entity;

import com.healthcare.labtestbooking.entity.enums.AiAnalysisStatus;
import com.healthcare.labtestbooking.listener.AuditListener;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@EntityListeners({AuditingEntityListener.class, AuditListener.class})
@Table(name = "report_ai_analysis")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportAiAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Booking booking;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AiAnalysisStatus status = AiAnalysisStatus.PENDING;

    @Column(name = "health_score")
    private Integer healthScore;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "flags_json", columnDefinition = "LONGTEXT")
    private String flagsJson;

    @Column(name = "patterns_json", columnDefinition = "LONGTEXT")
    private String patternsJson;

    @Column(name = "recommendations_json", columnDefinition = "LONGTEXT")
    private String recommendationsJson;

    @Column(columnDefinition = "TEXT")
    private String disclaimer;

    @Column(name = "raw_response", columnDefinition = "LONGTEXT")
    private String rawResponse;

    @Column(name = "prompt_snapshot", columnDefinition = "LONGTEXT")
    private String promptSnapshot;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
