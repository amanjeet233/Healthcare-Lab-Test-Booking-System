package com.healthcare.labtestbooking.entity;

import com.healthcare.labtestbooking.listener.AuditListener;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@EntityListeners({AuditingEntityListener.class, AuditListener.class})
@Table(name = "panic_alert_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PanicAlertLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "logged_by_id", nullable = false)
    private User loggedBy;

    @Column(name = "notified_physician", nullable = false)
    private String notifiedPhysician;

    @Column(name = "communication_channel")
    private String communicationChannel; // Phone, Email, SMS, In-Person

    @Column(name = "notified_at")
    private LocalDateTime notifiedAt;

    @Column(name = "panic_values", columnDefinition = "TEXT")
    private String panicValues; // JSON or snapshot of critical results

    @Column(name = "physician_instruction", columnDefinition = "TEXT")
    private String physicianInstruction;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.notifiedAt == null) {
            this.notifiedAt = LocalDateTime.now();
        }
    }
}
