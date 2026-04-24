package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.ReportVerification;
import com.healthcare.labtestbooking.repository.ReportVerificationRepository;
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
public class ReportVerificationService {

    private final ReportVerificationRepository reportVerificationRepository;

    @Transactional
    public ReportVerification saveVerification(ReportVerification verification) {
        log.info("Saving report verification for booking id: {}", verification.getBooking().getId());
        return reportVerificationRepository.save(verification);
    }

    public Optional<ReportVerification> getVerificationByBookingId(Long bookingId) {
        return reportVerificationRepository.findByBookingId(bookingId);
    }

    public List<ReportVerification> getAllVerifications() {
        return reportVerificationRepository.findAll();
    }
}
