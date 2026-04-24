package com.healthcare.labtestbooking.entity;

import com.healthcare.labtestbooking.listener.AuditListener;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@EntityListeners({ AuditingEntityListener.class, AuditListener.class })
@Table(name = "test_popularity", indexes = {
        @Index(name = "idx_test_popularity_test", columnList = "test_id"),
        @Index(name = "idx_test_popularity_package", columnList = "package_id"),
        @Index(name = "idx_test_popularity_last_viewed", columnList = "last_viewed")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestPopularity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id")
    private LabTest test;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id")
    private TestPackage testPackage;

    @Builder.Default
    @Column(name = "view_count", nullable = false)
    private Long viewCount = 0L;

    @Builder.Default
    @Column(name = "booking_count", nullable = false)
    private Long bookingCount = 0L;

    @Column(name = "last_viewed")
    private LocalDateTime lastViewed;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
