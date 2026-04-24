package com.healthcare.labtestbooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.healthcare.labtestbooking.entity.enums.Gender;
import com.healthcare.labtestbooking.listener.AuditListener;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDate;

@Entity
@EntityListeners({AuditingEntityListener.class, AuditListener.class})
@Table(name = "family_members")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User patient;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(length = 50)
    private String relation;

    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(length = 5)
    private String bloodGroup;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(length = 120)
    private String email;

    @Column(name = "medical_history", columnDefinition = "TEXT")
    private String medicalHistory;

    @PrePersist
    @PreUpdate
    private void syncNameFields() {
        String normalizedName = normalize(name);
        String normalizedFirstName = normalize(firstName);

        if (normalizedName == null && normalizedFirstName == null) {
            normalizedName = "Member";
            normalizedFirstName = "Member";
        } else {
            if (normalizedFirstName == null) {
                normalizedFirstName = extractFirstName(normalizedName);
            }
            if (normalizedName == null) {
                normalizedName = normalizedFirstName;
            }
        }

        this.name = normalizedName;
        this.firstName = normalizedFirstName;
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String extractFirstName(String fullName) {
        if (fullName == null) {
            return "Member";
        }
        String[] parts = fullName.trim().split("\\s+");
        return parts.length == 0 || parts[0].isBlank() ? "Member" : parts[0];
    }
}
