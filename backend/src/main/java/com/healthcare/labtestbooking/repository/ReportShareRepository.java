package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.ReportShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportShareRepository extends JpaRepository<ReportShare, Long> {
    List<ReportShare> findByReportId(Long reportId);
}

