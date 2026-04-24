package com.healthcare.labtestbooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.healthcare.labtestbooking.entity.enums.VerificationStatus;
import com.healthcare.labtestbooking.listener.AuditListener;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity
@EntityListeners({AuditingEntityListener.class, AuditListener.class})
@Table(name = "report_verification")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_officer_id", nullable = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User medicalOfficer;

    @Column(nullable = false)
    private LocalDateTime verificationDate;

    @Column(columnDefinition = "TEXT")
    private String clinicalNotes;

    @Column(columnDefinition = "TEXT")
    private String criticalFlags;

    @Builder.Default  // ✅ FIXED: @Builder.Default pehle aayega
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus status = VerificationStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String digitalSignature;

    @Column(columnDefinition = "TEXT")
    private String icdCodes;

    @Builder.Default  // ✅ FIXED: Add for boolean field too
    @Column
    private Boolean requiresSpecialistReferral = false;

    @Column
    private String specialistType;

    @Column(name = "previously_rejected")
    @Builder.Default
    private Boolean previouslyRejected = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (verificationDate == null) {
            verificationDate = LocalDateTime.now();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}