package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.LabTestPricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabTestPricingRepository extends JpaRepository<LabTestPricing, Long> {

    List<LabTestPricing> findByLabPartnerId(Long labPartnerId);

    List<LabTestPricing> findByLabPartnerIdAndTestId(Long labPartnerId, Long testId);

    List<LabTestPricing> findByTestId(Long testId);

    List<LabTestPricing> findByTestIdOrderByPrice(Long testId);

    List<LabTestPricing> findByTestIdAndIsActiveTrue(Long testId);
}
