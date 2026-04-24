package com.healthcare.labtestbooking.entity;

import com.healthcare.labtestbooking.listener.AuditListener;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;

@Entity
@EntityListeners({AuditingEntityListener.class, AuditListener.class})
@Table(name = "lab_test_pricing")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTestPricing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_partner_id", nullable = false)
    private LabPartner labPartner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    private LabTest test;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "discount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "final_price", precision = 10, scale = 2)
    private BigDecimal finalPrice;

    @Column(name = "report_time_hours")
    private Integer reportTimeHours;

    @Column(name = "turnaround_time_hours")
    private Integer turnaroundTimeHours;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @PrePersist
    @PreUpdate
    protected void calculateFinalPrice() {
        if (this.price != null && this.discount != null) {
            this.finalPrice = this.price.subtract(this.discount);
        } else if (this.price != null) {
            this.finalPrice = this.price;
        }
        if (this.turnaroundTimeHours == null && this.reportTimeHours != null) {
            this.turnaroundTimeHours = this.reportTimeHours;
        }
    }
}
