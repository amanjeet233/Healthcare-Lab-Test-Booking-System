package com.healthcare.labtestbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDTO {

    private Long testId;
    private String testName;
    private String testCode;
    private String category;
    private Integer matchScore;
    private Boolean isPopular;
}
