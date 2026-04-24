package com.healthcare.labtestbooking.dto;

import com.healthcare.labtestbooking.entity.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FamilyMemberResponse {
    private Long id;
    private String name;
    private String relation;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String bloodGroup;
    private String phoneNumber;
    private String email;
    private String medicalHistory;
    private Long patientId;
}
