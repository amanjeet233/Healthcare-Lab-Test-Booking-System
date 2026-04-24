package com.healthcare.labtestbooking.entity;

import com.healthcare.labtestbooking.entity.enums.AssignmentType;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import com.healthcare.labtestbooking.entity.enums.CollectionType;
import com.healthcare.labtestbooking.entity.enums.PaymentStatus;
import com.healthcare.labtestbooking.entity.converter.PaymentStatusConverter;
import com.healthcare.labtestbooking.listener.AuditListener;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@EntityListeners({AuditingEntityListener.class, AuditListener.class})
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String bookingReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User patient;

    /**
     * Legacy column retained in DB schema for backward compatibility.
     * Keep it synchronized with patient_id to satisfy NOT NULL constraint.
     */
    @Column(name = "user_id", nullable = false)
    private Long legacyUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private LabTest test;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private TestPackage testPackage;

    @Column(nullable = false)
    private LocalDate bookingDate;

    @Column(length = 20)
    private String timeSlot;

    @Column(name = "family_member_id")
    private Long familyMemberId;

    @Column(name = "parent_booking_id")
    private Long parentBookingId;

    @Column(name = "patient_display_name", length = 150)
    private String patientDisplayName;

    @Column(nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.BOOKED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User technician;

    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_type", length = 20)
    private AssignmentType assignmentType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_officer_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User medicalOfficer;

    @Column(nullable = false)
    @Builder.Default
    private CollectionType collectionType = CollectionType.LAB;

    @Column(columnDefinition = "TEXT")
    private String collectionAddress;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal homeCollectionCharge = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal finalAmount;

    @Convert(converter = PaymentStatusConverter.class)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "report_available", nullable = false)
    @Builder.Default
    private Boolean reportAvailable = false;

    @Column(name = "critical_flag")
    @Builder.Default
    private Boolean criticalFlag = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // --- Relationships ---

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<ReportResult> reportResults = new ArrayList<>();

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ReportVerification reportVerification;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Recommendation recommendation;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "rejection_reason", length = 255)
    private String rejectionReason;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @PrePersist
    protected void onCreate() {
        if (legacyUserId == null && patient != null) {
            legacyUserId = patient.getId();
        }
        createdAt = LocalDateTime.now();
    }
}
