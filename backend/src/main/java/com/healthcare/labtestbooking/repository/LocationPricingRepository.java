package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.LocationPricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationPricingRepository extends JpaRepository<LocationPricing, Long> {
}
