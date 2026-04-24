package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.LabPartnerNearbyResponse;
import com.healthcare.labtestbooking.dto.LabPartnerResponse;
import com.healthcare.labtestbooking.dto.LabTestPricingResponse;
import com.healthcare.labtestbooking.entity.LabPartner;
import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.LabTestPricing;
import com.healthcare.labtestbooking.repository.LabPartnerRepository;
import com.healthcare.labtestbooking.repository.LabTestPricingRepository;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LabPartnerService {

    private final LabPartnerRepository labPartnerRepository;
    private final LabTestPricingRepository labTestPricingRepository;
    private final LabTestRepository labTestRepository;

    public List<LabPartnerResponse> getAllLabs() {
        return labPartnerRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public LabPartnerResponse getLabPartnerById(Long id) {
        LabPartner labPartner = labPartnerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab partner not found with id: " + id));
        return mapToResponse(labPartner);
    }

    public List<LabTestPricingResponse> comparePrices(Long testId) {
        LabTest labTest = labTestRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found with id: " + testId));

        List<LabTestPricing> pricings = labTestPricingRepository.findByTestId(testId);

        return pricings.stream()
                .map(pricing -> LabTestPricingResponse.builder()
                        .labPartnerId(pricing.getLabPartner().getId())
                        .labPartnerName(pricing.getLabPartner().getName())
                        .testId(pricing.getTest().getId())
                        .testName(pricing.getTest().getTestName())
                        .price(pricing.getPrice())
                        .discount(pricing.getDiscount())
                        .finalPrice(pricing.getFinalPrice())
                        .turnaroundTimeHours(pricing.getTurnaroundTimeHours())
                        .build())
                .sorted(Comparator.comparing(LabTestPricingResponse::getFinalPrice))
                .collect(Collectors.toList());
    }

    public LabTestPricingResponse getBestDeal(Long testId) {
        List<LabTestPricingResponse> priceComparisons = comparePrices(testId);

        if (priceComparisons.isEmpty()) {
            throw new RuntimeException("No pricing available for test with id: " + testId);
        }

        LabTestPricingResponse bestPrice = priceComparisons.get(0);

        List<LabTestPricingResponse> fastestOptions = priceComparisons.stream()
                .filter(pricing -> pricing.getTurnaroundTimeHours() != null)
                .sorted(Comparator.comparing(LabTestPricingResponse::getTurnaroundTimeHours))
                .collect(Collectors.toList());

        LabTestPricingResponse bestDeal = bestPrice;
        if (!fastestOptions.isEmpty()) {
            LabTestPricingResponse fastest = fastestOptions.get(0);
            if (fastest.getFinalPrice()
                    .compareTo(bestPrice.getFinalPrice().multiply(java.math.BigDecimal.valueOf(1.1))) <= 0) {
                bestDeal = fastest;
            }
        }

        return bestDeal;
    }

    public List<LabPartnerNearbyResponse> getNearbyLabs(double lat, double lng, double radiusKm) {
        log.info("Finding labs near ({}, {}) within {} km", lat, lng, radiusKm);
        List<Object[]> rawResults = labPartnerRepository.findNearbyLabs(lat, lng, radiusKm);
        List<LabPartnerNearbyResponse> results = new ArrayList<>();

        for (Object[] row : rawResults) {
            results.add(LabPartnerNearbyResponse.builder()
                    .id(((Number) row[0]).longValue())
                    .name((String) row[1])
                    .address((String) row[5])
                    .city((String) row[6])
                    .phone((String) row[8])
                    .email((String) row[9])
                    .website((String) row[10])
                    .rating(row[3] != null ? new BigDecimal(row[3].toString()) : null)
                    .accredited(row[2] != null && !row[2].toString().isEmpty())
                    .homeCollection(row[4] != null && (Boolean) row[4])
                    .latitude(row[11] != null ? ((Number) row[11]).doubleValue() : null)
                    .longitude(row[12] != null ? ((Number) row[12]).doubleValue() : null)
                    .workingHours((String) row[13])
                    .distanceKm(row[row.length - 1] != null ? ((Number) row[row.length - 1]).doubleValue() : null)
                    .build());
        }
        return results;
    }

    public List<LabPartnerResponse> searchByCity(String city) {
        log.info("Searching labs in city: {}", city);
        return labPartnerRepository.findByCityIgnoreCase(city).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private LabPartnerResponse mapToResponse(LabPartner labPartner) {
        return LabPartnerResponse.builder()
                .id(labPartner.getId())
                .name(labPartner.getName())
                .address(labPartner.getAddress())
                .city(labPartner.getCity())
                .phone(labPartner.getPhone())
                .email(labPartner.getEmail())
                .website(labPartner.getWebsite())
                .rating(labPartner.getRating())
                .accredited(labPartner.getAccredited())
                .isActive(labPartner.getIsActive())
                .homeCollection(labPartner.getHomeCollection())
                .workingHours(labPartner.getWorkingHours())
                .latitude(labPartner.getLatitude())
                .longitude(labPartner.getLongitude())
                .build();
    }
}
