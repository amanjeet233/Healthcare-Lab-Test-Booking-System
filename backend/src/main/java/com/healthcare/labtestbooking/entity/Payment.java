package com.healthcare.labtestbooking.entity;

import com.healthcare.labtestbooking.entity.enums.PaymentMethod;
import com.healthcare.labtestbooking.entity.enums.PaymentStatus;
import com.healthcare.labtestbooking.entity.enums.RefundStatus;
import com.healthcare.labtestbooking.entity.converter.PaymentStatusConverter;
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
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "transaction_id", unique = true)
    private String transactionId;

    @Column(name = "amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Convert(converter = PaymentStatusConverter.class)
    @Column(name = "payment_status")
    private PaymentStatus status;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "invoice_number")
    private String invoiceNumber;

    @Column(name = "is_refund")
    @Builder.Default
    private Boolean isRefund = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "refund_status")
    private RefundStatus refundStatus;

    @Column(name = "refund_reason")
    private String refundReason;

    @Column(name = "original_payment_id")
    private Long originalPaymentId;

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "gateway_transaction_id")
    private String gatewayTransactionId;

    @Column(name = "created_at", updatable = false)
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
