package com.healthcare.labtestbooking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "report_shares")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Report report;

    @Column(name = "shared_with_email", nullable = false, length = 120)
    private String sharedWithEmail;

    @Column(name = "access_type", nullable = false, length = 20)
    private String accessType;

    @Column(name = "shared_at", nullable = false)
    private LocalDateTime sharedAt;

    @PrePersist
    protected void onCreate() {
        if (sharedAt == null) {
            sharedAt = LocalDateTime.now();
        }
    }
}

