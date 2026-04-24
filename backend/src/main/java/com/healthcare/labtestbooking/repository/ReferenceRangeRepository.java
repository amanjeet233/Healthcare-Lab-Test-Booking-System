package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.ReferenceRange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReferenceRangeRepository extends JpaRepository<ReferenceRange, Long> {
    java.util.List<ReferenceRange> findByParameterId(Long parameterId);
}
