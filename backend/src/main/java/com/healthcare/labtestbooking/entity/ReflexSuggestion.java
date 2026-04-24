package com.healthcare.labtestbooking.entity;

import com.healthcare.labtestbooking.entity.enums.ReflexPriority;
import com.healthcare.labtestbooking.entity.enums.ReflexSuggestionStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reflex_suggestions", indexes = {
        @Index(name = "idx_reflex_suggestion_booking", columnList = "booking_id"),
        @Index(name = "idx_reflex_suggestion_status", columnList = "status")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_reflex_suggestion_booking_rule", columnNames = {"booking_id", "reflex_rule_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReflexSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "reflex_rule_id", nullable = false)
    private Long reflexRuleId;

    @Column(name = "triggered_by", nullable = false, length = 300)
    private String triggeredBy;

    @Column(name = "suggested_test", nullable = false, length = 200)
    private String suggestedTest;

    @Column(name = "suggested_test_slug", nullable = false, length = 200)
    private String suggestedTestSlug;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private ReflexPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private ReflexSuggestionStatus status = ReflexSuggestionStatus.PENDING;

    @Column(name = "auto_ordered", nullable = false)
    @Builder.Default
    private Boolean autoOrdered = false;

    @Column(name = "reflex_booking_id")
    private Long reflexBookingId;

    @Column(name = "action_reason", length = 500)
    private String actionReason;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
