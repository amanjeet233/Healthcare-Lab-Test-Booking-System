package com.healthcare.labtestbooking.dto;

import com.healthcare.labtestbooking.entity.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FamilyMemberRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Relation is required")
    private String relation;
    
    private LocalDate dateOfBirth;
    
    @NotNull(message = "Gender is required")
    private Gender gender;
    
    private String bloodGroup;

    private String phoneNumber;

    private String email;

    private String medicalHistory;
}
