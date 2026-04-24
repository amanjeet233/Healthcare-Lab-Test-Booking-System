package com.healthcare.labtestbooking.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.labtestbooking.entity.Report;
import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.entity.TestParameter;
import com.healthcare.labtestbooking.repository.ReportAiAnalysisRepository;
import com.healthcare.labtestbooking.repository.ReportRepository;
import com.healthcare.labtestbooking.repository.ReportResultRepository;
import com.healthcare.labtestbooking.repository.ReportVerificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class ReportGeneratorServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private ReportResultRepository reportResultRepository;

    @Mock
    private ReportVerificationRepository reportVerificationRepository;

    @Mock
    private ReportAiAnalysisRepository reportAiAnalysisRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private ReportGeneratorService reportGeneratorService;

    @Test
    void findPreviousResult_SkipsNullReportEntriesWithoutThrowing() {
        TestParameter parameter = new TestParameter();
        parameter.setId(10L);

        ReportResult nullReportEntry = new ReportResult();
        nullReportEntry.setParameter(parameter);
        nullReportEntry.setReport(null);
        nullReportEntry.setResultValue("101");

        Report currentReport = new Report();
        currentReport.setId(5L);
        ReportResult currentReportEntry = new ReportResult();
        currentReportEntry.setParameter(parameter);
        currentReportEntry.setReport(currentReport);
        currentReportEntry.setResultValue("102");

        Report previousReport = new Report();
        previousReport.setId(4L);
        ReportResult previousReportEntry = new ReportResult();
        previousReportEntry.setParameter(parameter);
        previousReportEntry.setReport(previousReport);
        previousReportEntry.setResultValue("98");

        List<ReportResult> history = List.of(nullReportEntry, currentReportEntry, previousReportEntry);

        ReportResult previous = ReflectionTestUtils.invokeMethod(
                reportGeneratorService,
                "findPreviousResult",
                parameter.getId(),
                history,
                5L
        );

        assertThat(previous).isSameAs(previousReportEntry);
    }
}
