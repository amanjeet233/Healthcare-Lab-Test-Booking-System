package com.healthcare.labtestbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FamilyMemberDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String relation;
    private String dateOfBirth;
    private String gender;
    private String bloodGroup;
    private Boolean isEmergencyContact;
}
