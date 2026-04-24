package com.healthcare.labtestbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabPartnerResponse {

    private Long id;
    private String name;
    private String labName;
    private String address;
    private String city;
    private String phone;
    private String email;
    private String website;
    private String accreditation;
    private BigDecimal rating;
    private Boolean accredited;
    private Boolean isActive;
    private Boolean homeCollection;
    private String workingHours;
    private Double latitude;
    private Double longitude;
}
