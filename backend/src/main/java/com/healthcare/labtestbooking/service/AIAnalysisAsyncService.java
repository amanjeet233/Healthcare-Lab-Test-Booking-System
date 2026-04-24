package com.healthcare.labtestbooking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AIAnalysisAsyncService {

    private final AIAnalysisService aiAnalysisService;

    @Async
    public void analyzeReportAsync(Long bookingId) {
        aiAnalysisService.analyzeReport(bookingId);
    }
}
