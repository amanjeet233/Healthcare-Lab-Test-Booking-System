package com.healthcare.labtestbooking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.labtestbooking.dto.ReportResultRequest;
import com.healthcare.labtestbooking.dto.ReportResultDTO;
import com.healthcare.labtestbooking.dto.PatientReportItemDto;
import com.healthcare.labtestbooking.security.JwtUtil;
import com.healthcare.labtestbooking.security.UserDetailsServiceImpl;
import com.healthcare.labtestbooking.service.ReportGeneratorService;
import com.healthcare.labtestbooking.service.ReportResultService;
import com.healthcare.labtestbooking.service.ReportService;
import com.healthcare.labtestbooking.service.ReportVerificationService;
import com.healthcare.labtestbooking.service.AuditService;
import com.healthcare.labtestbooking.service.AIAnalysisService;
import com.healthcare.labtestbooking.service.TokenBlacklistService;
import com.healthcare.labtestbooking.entity.Report;
import com.healthcare.labtestbooking.repository.ReportRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import com.healthcare.labtestbooking.config.TestSecurityConfig;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
@WebMvcTest(ReportController.class)
@Import(TestSecurityConfig.class)
@ExtendWith(SpringExtension.class)
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReportService reportService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @MockBean
    private ReportGeneratorService reportGeneratorService;

    @MockBean
    private ReportResultService reportResultService;

    @MockBean
    private ReportVerificationService reportVerificationService;

    @MockBean
    private AuditService auditService;

    @MockBean
    private ReportRepository reportRepository;

    @MockBean
    private AIAnalysisService aiAnalysisService;

    @MockBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    @WithMockUser(roles = "TECHNICIAN")
    void submitReportResults_Success() throws Exception {
        // Given - Create request
        ReportResultRequest request = ReportResultRequest.builder()
            .bookingId(1L)
            .technicianId(1L)
            .results(List.of(
                ReportResultRequest.ResultItem.builder()
                    .parameterId(1L)
                    .resultValue("5.5")
                    .unit("mg/dL")
                    .notes("Normal range")
                    .build()
            ))
            .build();

        // Mock service response
        ReportResultDTO expectedResult = new ReportResultDTO();
        when(reportService.enterReportResults(any(ReportResultRequest.class)))
            .thenReturn(expectedResult);

        // When/Then - Perform request and verify
        mockMvc.perform(post("/api/reports/results")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void submitReportResults_Forbidden_WrongRole() throws Exception {
        // Given
        ReportResultRequest request = ReportResultRequest.builder()
            .bookingId(1L)
            .technicianId(1L)
            .results(List.of(
                ReportResultRequest.ResultItem.builder()
                    .parameterId(1L)
                    .resultValue("5.5")
                    .unit("mg/dL")
                    .notes("Normal range")
                    .build()
            ))
            .build();

        // When/Then
        mockMvc.perform(post("/api/reports/results")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());  // Expect 403
    }

    @Test
    void submitReportResults_Unauthorized_NoAuthentication() throws Exception {
        // Given
        ReportResultRequest request = ReportResultRequest.builder()
            .bookingId(1L)
            .technicianId(1L)
            .results(List.of(
                ReportResultRequest.ResultItem.builder()
                    .parameterId(1L)
                    .resultValue("5.5")
                    .unit("mg/dL")
                    .notes("Normal range")
                    .build()
            ))
            .build();

        // When/Then
        mockMvc.perform(post("/api/reports/results")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());  // Expect 401
    }

    @Test
    @WithMockUser(roles = "TECHNICIAN")
    void uploadReport_Success_ForTechnician() throws Exception {
        Report report = new Report();
        report.setId(7L);
        when(reportService.uploadReport(any(Long.class), any())).thenReturn(report);

        mockMvc.perform(multipart("/api/reports/upload")
                        .file("file", "fake-pdf".getBytes())
                        .param("bookingId", "1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void uploadReport_Forbidden_ForNonTechnician() throws Exception {
        mockMvc.perform(multipart("/api/reports/upload")
                        .file("file", "fake-pdf".getBytes())
                        .param("bookingId", "1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "TECHNICIAN")
    void checkReportExists_Returns404_WhenMissing() throws Exception {
        when(reportRepository.findByBookingId(99L)).thenReturn(java.util.Optional.empty());

        mockMvc.perform(get("/api/reports/booking/99/exists"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void getMyReports_ReturnsPatientReportList() throws Exception {
        PatientReportItemDto dto = PatientReportItemDto.builder()
                .bookingId(1L)
                .testName("CBC")
                .status("VERIFIED")
                .downloadUrl("/api/reports/1/download")
                .verifiedByName("Dr. Rao")
                .build();
        when(reportService.getMyPatientReports()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/reports/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].bookingId").value(1))
                .andExpect(jsonPath("$.data[0].status").value("VERIFIED"));
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void downloadReportByBooking_ReturnsBinaryAttachment() throws Exception {
        Report report = new Report();
        report.setReportPdf("pdf-bytes".getBytes());
        report.setReportPdfPath("uploaded_report_1_report.pdf");
        when(reportService.getDownloadableReportByBooking(1L)).thenReturn(report);

        mockMvc.perform(get("/api/reports/1/download"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, org.hamcrest.Matchers.containsString("attachment")))
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, org.hamcrest.Matchers.containsString(MediaType.APPLICATION_PDF_VALUE)));
    }

    @Test
    @WithMockUser(roles = "GUEST")
    void downloadReportByBooking_ForbiddenForUnauthorizedRole() throws Exception {
        mockMvc.perform(get("/api/reports/1/download"))
                .andExpect(status().isForbidden());
    }
}
