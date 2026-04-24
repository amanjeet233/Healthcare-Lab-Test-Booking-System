package com.healthcare.labtestbooking.entity;

import com.healthcare.labtestbooking.entity.enums.ConsentType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "consent_records", indexes = {
        @Index(name = "idx_consent_booking", columnList = "booking_id"),
        @Index(name = "idx_consent_patient", columnList = "patient_id"),
        @Index(name = "idx_consent_collector", columnList = "collector_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "test_name", nullable = false, length = 200)
    private String testName;

    @Enumerated(EnumType.STRING)
    @Column(name = "consent_type", nullable = false, length = 40)
    private ConsentType consentType;

    @Column(name = "consent_given", nullable = false)
    private Boolean consentGiven;

    @Column(name = "consent_timestamp", nullable = false)
    private LocalDateTime consentTimestamp;

    @Column(name = "collector_id", nullable = false)
    private Long collectorId;

    @Column(name = "ip_address", length = 80)
    private String ipAddress;

    @Column(name = "device_info", length = 500)
    private String deviceInfo;

    @Column(name = "patient_signature_hash", nullable = false, length = 128)
    private String patientSignatureHash;
}
