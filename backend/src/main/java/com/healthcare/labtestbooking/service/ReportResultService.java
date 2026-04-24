package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.repository.ReportResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportResultService {

    private final ReportResultRepository reportResultRepository;

    @Transactional
    public ReportResult saveReportResult(ReportResult reportResult) {
        log.info("Saving report result for booking id: {}", reportResult.getBooking().getId());
        return reportResultRepository.save(reportResult);
    }

    public List<ReportResult> getResultsByBookingId(Long bookingId) {
        return reportResultRepository.findByBookingId(bookingId);
    }

    public Optional<ReportResult> getResultById(Long id) {
        return reportResultRepository.findById(id);
    }

    public List<ReportResult> getAllResults() {
        return reportResultRepository.findAll();
    }
}
