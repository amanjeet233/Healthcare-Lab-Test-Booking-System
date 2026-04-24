package com.healthcare.labtestbooking.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.Report;
import com.healthcare.labtestbooking.entity.ReportAiAnalysis;
import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.entity.ReportVerification;
import com.healthcare.labtestbooking.entity.TestParameter;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.repository.ReportAiAnalysisRepository;
import com.healthcare.labtestbooking.repository.ReportResultRepository;
import com.healthcare.labtestbooking.repository.ReportVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HtmlTemplatePdfService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a", Locale.ENGLISH);
    private static final double SCORE_RING = 226.0;

    private final ReportResultRepository reportResultRepository;
    private final ReportVerificationRepository reportVerificationRepository;
    private final ReportAiAnalysisRepository reportAiAnalysisRepository;
    private final ReportGeneratorService reportGeneratorService;
    private final ObjectMapper objectMapper;

    @Value("classpath:templates/report-template-browser.html")
    private Resource htmlTemplate;

    @Value("${app.report.pdf.browser-path:}")
    private String configuredBrowserPath;
    private volatile String resolvedBrowserPath;
    private final Map<Long, CacheEntry> pdfCache = new ConcurrentHashMap<>();

    private static final class CacheEntry {
        private final long fingerprint;
        private final byte[] bytes;
        private CacheEntry(long fingerprint, byte[] bytes) {
            this.fingerprint = fingerprint;
            this.bytes = bytes;
        }
    }

    @Transactional(readOnly = true)
    public byte[] generatePdf(Report report) {
        long fingerprint = buildReportFingerprint(report);
        CacheEntry cached = pdfCache.get(report.getId());
        if (cached != null && cached.fingerprint == fingerprint && cached.bytes != null && cached.bytes.length > 0) {
            return Arrays.copyOf(cached.bytes, cached.bytes.length);
        }

        try {
            String html = buildHtml(report);
            byte[] rendered = renderWithHeadlessBrowser(html);
            if (rendered == null || rendered.length == 0) {
                throw new RuntimeException("HTML renderer returned empty PDF");
            }
            pdfCache.put(report.getId(), new CacheEntry(fingerprint, Arrays.copyOf(rendered, rendered.length)));
            return rendered;
        } catch (Exception ex) {
            log.warn("HTML template PDF render failed for report {}. Falling back to legacy generator. Cause: {}",
                    report.getId(), ex.getMessage());
            byte[] fallback = reportGeneratorService.generatePdfReport(report.getId());
            if (fallback == null || fallback.length == 0) {
                throw new RuntimeException("Both template and fallback PDF generation failed");
            }
            pdfCache.put(report.getId(), new CacheEntry(fingerprint, Arrays.copyOf(fallback, fallback.length)));
            return fallback;
        }
    }

    private long buildReportFingerprint(Report report) {
        long updated = report.getUpdatedAt() != null ? report.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : 0L;
        long generated = report.getGeneratedDate() != null ? report.getGeneratedDate().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : 0L;
        long verified = report.getVerifiedAt() != null ? report.getVerifiedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : 0L;
        return updated ^ generated ^ verified;
    }

    private String buildHtml(Report report) throws IOException {
        Booking booking = report.getBooking();
        User patient = booking != null ? booking.getPatient() : report.getPatient();
        List<ReportResult> results = resolveResults(report);
        Optional<ReportVerification> verificationOpt = booking != null
                ? reportVerificationRepository.findByBookingId(booking.getId())
                : Optional.empty();
        Optional<ReportAiAnalysis> aiOpt = booking != null
                ? reportAiAnalysisRepository.findByBookingId(booking.getId())
                : Optional.empty();

        int overall = resolveOverallScore(aiOpt.orElse(null), results);
        int liver = resolveCategoryScore(results, "liver", List.of("sgot", "sgpt", "bilirubin", "albumin", "alt", "ast"));
        int metabolism = resolveCategoryScore(results, "metabolism", List.of("glucose", "hba1c", "insulin", "cholesterol", "triglyceride"));
        double dashOffset = SCORE_RING - (SCORE_RING * Math.max(0, Math.min(overall, 100)) / 100.0);

        String patientName = patient != null ? safe(patient.getName()) : "Patient";
        String ageGender = buildAgeGender(patient);
        String reportId = booking != null && safe(booking.getBookingReference()).length() > 0
                ? "HL-" + safe(booking.getBookingReference())
                : "HL-" + report.getId();
        String sampleDate = formatDate(booking != null ? booking.getCreatedAt() : null);
        String generatedDate = formatDate(report.getGeneratedDate() != null ? report.getGeneratedDate() : LocalDateTime.now());

        String doctorRemarks = verificationOpt.map(ReportVerification::getClinicalNotes)
                .filter(v -> !safe(v).isBlank())
                .orElse("Clinically stable. Regular monitoring recommended.");
        String doctorName = verificationOpt.map(ReportVerification::getMedicalOfficer)
                .map(User::getName)
                .filter(v -> !safe(v).isBlank())
                .orElseGet(() -> {
                    String verifiedBy = safe(report.getVerifiedBy());
                    return verifiedBy.isBlank() ? "Medical Officer" : verifiedBy;
                });

        List<String> insights = resolveAiInsights(aiOpt.orElse(null));
        String insight1 = insights.size() > 0 ? insights.get(0) : "Maintain a balanced diet and regular exercise.";
        String insight2 = insights.size() > 1 ? insights.get(1) : "Ensure adequate hydration and sleep cycle.";

        String fingerprint = safe(report.getDigitalFingerprint());
        if (fingerprint.isBlank()) {
            fingerprint = "HMAC-SHA256: PENDING-SEAL";
        }

        String template = readTemplate();
        return template
                .replace("{{PATIENT_NAME}}", escapeHtml(patientName))
                .replace("{{AGE_GENDER}}", escapeHtml(ageGender))
                .replace("{{REPORT_ID}}", escapeHtml(reportId))
                .replace("{{SAMPLE_COLLECTION_DATE}}", escapeHtml(sampleDate))
                .replace("{{REPORT_GENERATION_DATE}}", escapeHtml(generatedDate))
                .replace("{{OVERALL_SCORE}}", String.valueOf(overall))
                .replace("{{OVERALL_DASH_OFFSET}}", String.format(Locale.US, "%.2f", dashOffset))
                .replace("{{LIVER_SCORE}}", String.valueOf(liver))
                .replace("{{METABOLISM_SCORE}}", String.valueOf(metabolism))
                .replace("{{RESULT_ROWS}}", buildResultRows(results))
                .replace("{{DOCTOR_REMARKS}}", escapeHtml(doctorRemarks))
                .replace("{{INSIGHT_1}}", escapeHtml(insight1))
                .replace("{{INSIGHT_2}}", escapeHtml(insight2))
                .replace("{{DIGITAL_FINGERPRINT}}", escapeHtml(fingerprint))
                .replace("{{DOCTOR_NAME}}", escapeHtml(doctorName));
    }

    private List<ReportResult> resolveResults(Report report) {
        if (report.getResults() != null && !report.getResults().isEmpty()) {
            return report.getResults();
        }
        if (report.getBooking() != null) {
            List<ReportResult> byBooking = reportResultRepository.findByBookingId(report.getBooking().getId());
            if (!byBooking.isEmpty()) {
                return byBooking;
            }
        }
        return reportResultRepository.findByReportId(report.getId());
    }

    private int resolveOverallScore(ReportAiAnalysis aiAnalysis, List<ReportResult> results) {
        if (aiAnalysis != null && aiAnalysis.getHealthScore() != null) {
            return clamp(aiAnalysis.getHealthScore());
        }
        if (results.isEmpty()) {
            return 85;
        }
        long normalCount = results.stream().filter(r -> !Boolean.TRUE.equals(r.getIsAbnormal())).count();
        return clamp((int) Math.round((normalCount * 100.0) / results.size()));
    }

    private int resolveCategoryScore(List<ReportResult> results, String category, List<String> keywords) {
        List<ReportResult> filtered = results.stream()
                .filter(r -> {
                    String categoryText = r.getParameter() != null ? safe(r.getParameter().getCategory()).toLowerCase(Locale.ROOT) : "";
                    String name = r.getParameter() != null ? safe(r.getParameter().getParameterName()).toLowerCase(Locale.ROOT) : "";
                    if (categoryText.contains(category)) {
                        return true;
                    }
                    for (String keyword : keywords) {
                        if (name.contains(keyword)) {
                            return true;
                        }
                    }
                    return false;
                })
                .collect(Collectors.toList());

        if (filtered.isEmpty()) {
            return 85;
        }
        long normalCount = filtered.stream().filter(r -> !Boolean.TRUE.equals(r.getIsAbnormal())).count();
        return clamp((int) Math.round((normalCount * 100.0) / filtered.size()));
    }

    private List<String> resolveAiInsights(ReportAiAnalysis aiAnalysis) {
        if (aiAnalysis == null || safe(aiAnalysis.getRecommendationsJson()).isBlank()) {
            return List.of();
        }
        try {
            Object parsed = objectMapper.readValue(aiAnalysis.getRecommendationsJson(), Object.class);
            if (parsed instanceof List<?> list) {
                List<String> insights = new ArrayList<>();
                for (Object item : list) {
                    if (item instanceof Map<?, ?> map) {
                        Object text = map.get("text");
                        if (text != null && !safe(text.toString()).isBlank()) {
                            insights.add(text.toString());
                        }
                    } else if (item != null && !safe(item.toString()).isBlank()) {
                        insights.add(item.toString());
                    }
                }
                return insights;
            }
            if (parsed instanceof Map<?, ?> map) {
                List<String> insights = new ArrayList<>();
                Map<String, Object> ordered = new LinkedHashMap<>();
                for (Map.Entry<?, ?> entry : map.entrySet()) {
                    ordered.put(String.valueOf(entry.getKey()), entry.getValue());
                }
                for (Object value : ordered.values()) {
                    if (value instanceof List<?> values) {
                        for (Object item : values) {
                            if (item != null && !safe(item.toString()).isBlank()) {
                                insights.add(item.toString());
                            }
                        }
                    }
                }
                return insights;
            }
        } catch (Exception ex) {
            log.debug("Failed to parse AI recommendations JSON for analysis {}: {}", aiAnalysis.getId(), ex.getMessage());
        }
        return List.of();
    }

    private String buildAgeGender(User patient) {
        if (patient == null) {
            return "";
        }
        String age = "";
        LocalDate dob = patient.getDateOfBirth();
        if (dob != null) {
            int years = java.time.Period.between(dob, LocalDate.now()).getYears();
            if (years > 0) {
                age = years + " Years";
            }
        }
        String gender = patient.getGender() != null ? safe(patient.getGender().name()) : "";
        if (age.isBlank()) {
            return gender;
        }
        if (gender.isBlank()) {
            return age;
        }
        return age + " / " + gender;
    }

    private String buildResultRows(List<ReportResult> results) {
        if (results.isEmpty()) {
            return "<tr class=\"border-b border-slate-100 bg-white\">"
                    + "<td class=\"py-3 px-4 font-bold text-slate-700\">No results available</td>"
                    + "<td class=\"py-3 px-4 text-center font-black\">-</td>"
                    + "<td class=\"py-3 px-4 text-center text-slate-500 font-medium\">-</td>"
                    + "<td class=\"py-3 px-4 text-center text-slate-600 font-mono text-[11px]\">-</td>"
                    + "<td class=\"py-3 px-4 text-right\"><span class=\"text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter bg-slate-100 text-slate-700\">PENDING</span></td>"
                    + "</tr>";
        }

        StringBuilder rows = new StringBuilder();
        for (int i = 0; i < results.size(); i++) {
            ReportResult result = results.get(i);
            String rowClass = i % 2 == 0 ? "bg-white" : "bg-slate-50/50";
            String parameter = escapeHtml(cleanParameter(result.getParameter() != null ? result.getParameter().getParameterName() : "Parameter"));
            String value = escapeHtml(resolveResultValue(result));
            String unit = escapeHtml(safe(result.getUnit()).isBlank() ? "-" : result.getUnit());
            String range = escapeHtml(buildRange(result.getParameter(), result));
            String status = Boolean.TRUE.equals(result.getIsCritical()) ? "CRITICAL" : (Boolean.TRUE.equals(result.getIsAbnormal()) ? "ABNORMAL" : "NORMAL");
            String valueClass = "NORMAL".equals(status) ? "" : " text-rose-600";
            String badgeClass = "NORMAL".equals(status) ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700";

            rows.append("<tr class=\"border-b border-slate-100 ").append(rowClass).append("\">")
                    .append("<td class=\"py-3 px-4 font-bold text-slate-700\">").append(parameter).append("</td>")
                    .append("<td class=\"py-3 px-4 text-center font-black").append(valueClass).append("\">").append(value).append("</td>")
                    .append("<td class=\"py-3 px-4 text-center text-slate-500 font-medium\">").append(unit).append("</td>")
                    .append("<td class=\"py-3 px-4 text-center text-slate-600 font-mono text-[11px]\">").append(range).append("</td>")
                    .append("<td class=\"py-3 px-4 text-right\"><span class=\"text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ")
                    .append(badgeClass).append("\">").append(status).append("</span></td>")
                    .append("</tr>");
        }
        return rows.toString();
    }

    private byte[] renderWithHeadlessBrowser(String html) throws Exception {
        Path tempDir = Files.createTempDirectory("healthcarelab-report-");
        Path htmlPath = tempDir.resolve("report.html");
        Path pdfPath = tempDir.resolve("report.pdf");
        try {
            Files.writeString(htmlPath, html, StandardCharsets.UTF_8);
            runBrowserPrint(htmlPath, pdfPath);
            if (!Files.exists(pdfPath) || Files.size(pdfPath) == 0) {
                throw new RuntimeException("Browser did not produce PDF output");
            }
            return Files.readAllBytes(pdfPath);
        } finally {
            deleteQuietly(pdfPath);
            deleteQuietly(htmlPath);
            deleteQuietly(tempDir);
        }
    }

    private void runBrowserPrint(Path htmlPath, Path pdfPath) throws Exception {
        String htmlUri = htmlPath.toUri().toString();
        List<String> browserCandidates = new ArrayList<>();
        if (!safe(resolvedBrowserPath).isBlank()) {
            browserCandidates.add(resolvedBrowserPath.trim());
        }
        if (!safe(configuredBrowserPath).isBlank()) {
            browserCandidates.add(configuredBrowserPath.trim());
        }
        browserCandidates.add("msedge");
        browserCandidates.add("chrome");
        browserCandidates.add("google-chrome");
        browserCandidates.add("chromium-browser");
        browserCandidates.add("chromium");
        browserCandidates.add("C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe");
        browserCandidates.add("C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe");
        browserCandidates.add("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe");
        browserCandidates.add("C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe");

        Exception lastError = null;
        for (String browser : browserCandidates) {
            if (safe(browser).isBlank()) {
                continue;
            }
            List<String> cmd = List.of(
                    browser,
                    "--headless=new",
                    "--disable-gpu",
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                    "--no-pdf-header-footer",
                    "--print-to-pdf=" + pdfPath.toAbsolutePath(),
                    "--virtual-time-budget=10000",
                    htmlUri
            );
            try {
                execute(cmd);
                if (Files.exists(pdfPath) && Files.size(pdfPath) > 0) {
                    resolvedBrowserPath = browser;
                    log.info("Rendered template PDF using browser: {}", browser);
                    return;
                }
            } catch (Exception ex) {
                lastError = ex;
                log.debug("Browser candidate failed ({}): {}", browser, ex.getMessage());
            }
        }

        if (lastError != null) {
            throw new RuntimeException("No compatible headless browser found for HTML-to-PDF rendering", lastError);
        }
        throw new RuntimeException("No compatible headless browser found for HTML-to-PDF rendering");
    }

    private void execute(List<String> command) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true);
        Process process = pb.start();
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try (InputStream is = process.getInputStream()) {
            is.transferTo(output);
        }
        boolean completed = process.waitFor(60, TimeUnit.SECONDS);
        if (!completed) {
            process.destroyForcibly();
            throw new RuntimeException("PDF render timed out");
        }
        int code = process.exitValue();
        if (code != 0) {
            throw new RuntimeException("Browser render failed: " + output.toString(StandardCharsets.UTF_8));
        }
    }

    private String readTemplate() throws IOException {
        try (InputStream input = htmlTemplate.getInputStream()) {
            return new String(input.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private String cleanParameter(String value) {
        return safe(value).replaceAll("[.。]+$", "").trim();
    }

    private String buildRange(TestParameter parameter, ReportResult result) {
        if (parameter != null && parameter.getNormalRangeMin() != null && parameter.getNormalRangeMax() != null) {
            return parameter.getNormalRangeMin() + " - " + parameter.getNormalRangeMax();
        }
        if (!safe(result.getNormalRange()).isBlank()) {
            return result.getNormalRange();
        }
        if (result.getNormalRangeMin() != null && result.getNormalRangeMax() != null) {
            return result.getNormalRangeMin() + " - " + result.getNormalRangeMax();
        }
        return "-";
    }

    private String resolveResultValue(ReportResult result) {
        if (!safe(result.getResultValue()).isBlank()) {
            return result.getResultValue();
        }
        if (!safe(result.getValue()).isBlank()) {
            return result.getValue();
        }
        return "-";
    }

    private String formatDate(LocalDateTime value) {
        if (value == null) {
            return "";
        }
        return DATE_TIME_FORMATTER.format(value);
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private int clamp(int value) {
        return Math.max(0, Math.min(100, value));
    }

    private String escapeHtml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private void deleteQuietly(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (Exception ignored) {
        }
    }
}
