package com.healthcare.labtestbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilterResponseDTO {

    private List<ItemDTO> items;
    private long totalCount;
    private int page;
    private int size;
    private int totalPages;
    private Map<String, Object> appliedFilters;
    private AvailableFiltersDTO availableFilters;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemDTO {
        private String itemType;
        private Long id;
        private String name;
        private String code;
        private String category;
        private BigDecimal price;
        private BigDecimal discountedPrice;
        private BigDecimal discountPercentage;
        private Integer reportTimeHours;
        private Boolean fastingRequired;
        private Long popularity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvailableFiltersDTO {
        private List<String> genders;
        private List<String> organs;
        private List<String> testTypes;
        private PriceRangeDTO priceRange;
        private List<Integer> discountOptions;
        private List<String> reportTimeOptions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriceRangeDTO {
        private BigDecimal min;
        private BigDecimal max;
    }
}
