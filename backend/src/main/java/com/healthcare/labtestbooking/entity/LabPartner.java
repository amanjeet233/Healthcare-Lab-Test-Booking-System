package com.healthcare.labtestbooking.entity;

import com.healthcare.labtestbooking.listener.AuditListener;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.util.List;

@Entity
@EntityListeners({ AuditingEntityListener.class, AuditListener.class })
@Table(name = "lab_partners")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lab_name", nullable = false)
    private String labName;

    @Column(name = "accreditation")
    private String accreditation;

    @Column(name = "rating", precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(name = "home_collection")
    @Builder.Default
    private Boolean homeCollection = false;

    @Column(name = "address")
    private String address;

    @Column(name = "city")
    private String city;

    @Column(name = "contact")
    private String contact;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "website")
    private String website;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "working_hours")
    private String workingHours;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "labPartner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LabTestPricing> pricings;

    /**
     * Alias for labName - used by service layer
     */
    public String getName() {
        return this.labName;
    }

    /**
     * Alias for accreditation as boolean
     */
    public Boolean getAccredited() {
        return this.accreditation != null && !this.accreditation.isEmpty();
    }
}
