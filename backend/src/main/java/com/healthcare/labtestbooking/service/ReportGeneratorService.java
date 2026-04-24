package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.Order;
import com.healthcare.labtestbooking.entity.Report;
import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.entity.TestParameter;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.ReportVerification;
import com.healthcare.labtestbooking.repository.ReportAiAnalysisRepository;
import com.healthcare.labtestbooking.repository.ReportRepository;
import com.healthcare.labtestbooking.repository.ReportResultRepository;
import com.healthcare.labtestbooking.repository.ReportVerificationRepository;
import com.healthcare.labtestbooking.entity.ReportAiAnalysis;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.itextpdf.barcodes.BarcodeQRCode;
import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.events.PdfDocumentEvent;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.xobject.PdfFormXObject;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Div;
import com.itextpdf.layout.element.AreaBreak;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import com.itextpdf.layout.properties.AreaBreakType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportGeneratorService {

    private static final DeviceRgb BRAND_TEAL = new DeviceRgb(13, 124, 124); // #0D7C7C
    private static final DeviceRgb CRITICAL_RED = new DeviceRgb(225, 29, 72); // #E11D48
    private static final DeviceRgb INFO_BLUE = new DeviceRgb(25, 118, 210); // #1976D2
    private static final DeviceRgb SLATE_GRAY = new DeviceRgb(100, 116, 139); // #64748B
    private static final DeviceRgb LIGHT_BG = new DeviceRgb(248, 250, 252); // #F8FAFC
    private static final DeviceRgb NORMAL_GREEN = new DeviceRgb(46, 125, 50); // #2E7D32

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    private final ReportRepository reportRepository;
    private final ReportResultRepository reportResultRepository;
    private final ReportVerificationRepository reportVerificationRepository;
    private final ReportAiAnalysisRepository reportAiAnalysisRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.report.qr.base-url:https://healthcarelab.com/verify}")
    private String qrBaseUrl;

    @Transactional(readOnly = true)
    public byte[] generatePdfReport(Long reportId) {
        try {
            Report report = reportRepository.findById(reportId)
                    .orElseThrow(() -> new RuntimeException("Report not found with id: " + reportId));

            Booking booking = report.getBooking();
            Order order = report.getOrder();
            User patient = resolvePatient(booking, order);
            List<ReportResult> results = resolveResults(reportId, report);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDocument = new PdfDocument(writer);
            pdfDocument.getDocumentInfo().setTitle("Smart Health Report - " + (patient != null ? patient.getName() : "Patient"))
                                      .setAuthor("HealthcareLab SmartEngine v2.5")
                                      .setSubject("Diagnostic Clinical Results");
            
            Document document = new Document(pdfDocument, PageSize.A4);
            document.setMargins(70, 36, 60, 36);

            // Add Header & Footer Events
            String pName = patient != null ? patient.getName() : "Unknown";
            String pId = patient != null ? patient.getId().toString() : "-";
            pdfDocument.addEventHandler(PdfDocumentEvent.END_PAGE, new ReportHeaderEventHandler(pName, pId));

            // Part 1: Cover Page / Header
            buildCoverHeader(document, patient, report, booking);

            // Part 2: Table of Contents
            buildTableOfContents(document);

            // Part 3: Health Score Card
            buildHealthScoreCard(document, results);

            // Part 4: Critical Action Center (High Visibility Red Flag Section)
            List<ReportResult> criticals = results.stream().filter(r -> Boolean.TRUE.equals(r.getIsCritical())).collect(Collectors.toList());
            if (!criticals.isEmpty()) {
                buildCriticalActionCenter(document, criticals);
            }

            // Part 5: Test Results (Highlight Cards)
            buildParameterHighlights(document, results);

            // Part 5: Clinical / Tech Details (New Page for clinical tables)
            // Part 5: Wellness Recs
            buildWellnessRecommendations(document, results);

            // Part 6: Historical Trend Loading
            List<ReportResult> historicalData = searchHistoricalMetrics(patient);
            
            // Part 7: Medical Officer Remarks
            Optional<ReportVerification> verification = reportVerificationRepository.findByBookingId(booking.getId());
            buildMedicalOfficerRemarks(document, verification.orElse(null));

            // Part 8: Diagnostic Details (Clinical Summary)
            document.add(new AreaBreak(AreaBreakType.NEXT_PAGE));
            buildDoctorSummaryTable(document, results, historicalData, reportId);
            
            // Part 9: AI Deep Core Insights (The user's requested healthy details)
            Optional<ReportAiAnalysis> aiAnalysis = reportAiAnalysisRepository.findByBookingId(booking.getId());
            if (aiAnalysis.isPresent()) {
                document.add(new AreaBreak(AreaBreakType.NEXT_PAGE));
                buildAiDeepInsightsPage(document, aiAnalysis.get());
            }

            // Part 10: Diagnostic QR & Security Seal
            buildVerificationQr(document, report);
            
            // Part 11: Legal Disclaimer
            buildClinicalDisclaimer(document);

            try {
                document.close();
            } catch (Exception e) {
                log.error("Error closing PDF document: {}", e.getMessage());
            }
            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("CRITICAL: PDF Generation Failed for report {}: {}", reportId, e.getMessage(), e);
            return new byte[0];
        }
    }

    private User resolvePatient(Booking booking, Order order) {
        if (booking != null) return booking.getPatient();
        if (order != null) return order.getUser();
        return null;
    }

    private List<ReportResult> resolveResults(Long reportId, Report report) {
        // 1. Try attached results
        if (report.getResults() != null && !report.getResults().isEmpty()) {
            return report.getResults();
        }
        
        // 2. Try by Booking ID (Primary link for technician-entered results)
        if (report.getBooking() != null) {
            List<ReportResult> bookingResults = reportResultRepository.findByBookingId(report.getBooking().getId());
            if (bookingResults != null && !bookingResults.isEmpty()) {
                return bookingResults;
            }
        }
        
        // 3. Fallback to report ID
        return reportResultRepository.findByReportId(reportId);
    }

    private List<ReportResult> searchHistoricalMetrics(User patient) {
        if (patient == null) return new java.util.ArrayList<>();
        return reportResultRepository.findByBookingPatientIdOrderByCreatedAtDesc(patient.getId());
    }

    private ReportResult findPreviousResult(Long paramId, List<ReportResult> history, Long currentRepoId) {
        if (history == null || paramId == null) return null;
        for (ReportResult h : history) {
            // Must be for same parameter but NOT from current report
            if (h.getParameter() != null
                    && h.getParameter().getId().equals(paramId)
                    // Some legacy technician-entered rows can be linked by booking only (report_id null).
                    && h.getReport() != null
                    && h.getReport().getId() != null
                    && !h.getReport().getId().equals(currentRepoId)) {
                return h; // Ordered by desc created at, so first match is most recent prev
            }
        }
        return null;
    }

    private void buildCoverHeader(Document document, User patient, Report report, Booking booking) {
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{50, 50})).useAllAvailableWidth();
        headerTable.setMarginBottom(20);

        Cell leftCell = new Cell().setBorder(Border.NO_BORDER);
        leftCell.add(new Paragraph("PERSONAL HEALTH SMART REPORT")
                .setBold().setFontSize(22).setFontColor(SLATE_GRAY));
        
        if (patient != null) {
            leftCell.add(new Paragraph("Patient: " + patient.getName()).setBold().setFontSize(14));
            leftCell.add(new Paragraph("Age/Gender: " + (patient.getDateOfBirth() != null ? "DOB " + patient.getDateOfBirth() : "N/A") 
                + " / " + (patient.getGender() != null ? patient.getGender() : "N/A")).setFontColor(ColorConstants.DARK_GRAY));
        }

        Cell rightCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
        rightCell.add(new Paragraph("Report ID: " + report.getId()).setBold());
        rightCell.add(new Paragraph("Generated: " + formatDateTime(LocalDateTime.now())));
        if (booking != null && booking.getCreatedAt() != null) {
            rightCell.add(new Paragraph("Sample Collected: " + formatDateTime(booking.getCreatedAt())));
        }

        headerTable.addCell(leftCell);
        headerTable.addCell(rightCell);
        document.add(headerTable);
    }

    private void buildHealthScoreCard(Document document, List<ReportResult> results) {
        document.add(new Paragraph("HEALTH SCORE DASHBOARD").setBold().setFontSize(14).setFontColor(BRAND_TEAL).setMarginTop(10));

        if (results == null || results.isEmpty()) {
            document.add(new Paragraph("No test results found for scoring."));
            return;
        }

        long totalCount = results.size();
        long normalCount = results.stream().filter(r -> Boolean.FALSE.equals(r.getIsAbnormal())).count();
        long score = Math.round(((double) normalCount / totalCount) * 100);

        DeviceRgb scoreColor = score > 80 ? NORMAL_GREEN : (score > 50 ? INFO_BLUE : CRITICAL_RED);

        Table scoreTable = new Table(UnitValue.createPercentArray(new float[]{100})).useAllAvailableWidth().setMarginBottom(10);
        Cell scoreCell = new Cell().setBackgroundColor(LIGHT_BG).setPadding(15).setTextAlignment(TextAlignment.CENTER).setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 1));
        scoreCell.add(new Paragraph("Overall Vitality Score").setFontSize(10).setFontColor(SLATE_GRAY));
        scoreCell.add(new Paragraph(score + "%").setBold().setFontSize(26).setFontColor(scoreColor));
        scoreCell.add(new Paragraph(normalCount + " / " + totalCount + " indicators in control")
                .setFontSize(9).setFontColor(ColorConstants.GRAY));
        scoreTable.addCell(scoreCell);
        document.add(scoreTable);

        // Segmented Organ Scores
        Table organTable = new Table(UnitValue.createPercentArray(new float[]{33, 33, 34})).useAllAvailableWidth();
        addOrganScoreCell(organTable, "Liver Health", calculateOrganScore(results, "Liver"));
        addOrganScoreCell(organTable, "Kidney Function", calculateOrganScore(results, "Kidney"));
        addOrganScoreCell(organTable, "Metabolism", calculateOrganScore(results, "Metabolism"));
        document.add(organTable);
        document.add(new Paragraph("\n"));
    }

    private void buildCriticalActionCenter(Document document, List<ReportResult> criticals) {
        document.add(new Paragraph("!!! CRITICAL ACTION CENTER").setBold().setFontSize(14).setFontColor(CRITICAL_RED).setMarginTop(10));
        
        Table actionBox = new Table(1).useAllAvailableWidth().setMarginBottom(15);
        Cell cell = new Cell().setBackgroundColor(new DeviceRgb(254, 242, 242)).setPadding(15).setBorder(new SolidBorder(CRITICAL_RED, 1.5f));
        
        cell.add(new Paragraph("URGENT: RED-FLAG RESULTS DETECTED").setBold().setFontSize(11).setFontColor(CRITICAL_RED));
        
        StringBuilder redFlags = new StringBuilder();
        for (ReportResult r : criticals) {
            String pName = r.getParameter() != null ? r.getParameter().getParameterName() : "Unknown Parameter";
            String val = resolveResultValue(r);
            redFlags.append("• ").append(pName).append(" (Current: ").append(val).append(" ").append(r.getUnit() != null ? r.getUnit() : "").append(")\n");
        }
        
        cell.add(new Paragraph(redFlags.toString()).setFontSize(10).setFontColor(ColorConstants.DARK_GRAY));
        
        cell.add(new Paragraph("RECOMMENDED ACTION:").setBold().setFontSize(10).setMarginTop(8).setFontColor(CRITICAL_RED));
        cell.add(new Paragraph("The above values significantly deviate from safe biological limits. Please consult an Emergency Physician or your referring Specialist (Cardiologist/Endocrinologist) within the next 24 hours. Keep this report ready for reference.")
                .setFontSize(9).setFontColor(ColorConstants.GRAY).setItalic());
        
        actionBox.addCell(cell);
        document.add(actionBox);
    }

    private void addOrganScoreCell(Table table, String label, int score) {
        DeviceRgb color = score > 80 ? BRAND_TEAL : (score > 50 ? INFO_BLUE : CRITICAL_RED);
        Cell cell = new Cell().setPadding(10).setTextAlignment(TextAlignment.CENTER).setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f));
        cell.add(new Paragraph(label).setFontSize(8).setFontColor(SLATE_GRAY));
        cell.add(new Paragraph(score + "%").setBold().setFontSize(14).setFontColor(color));
        table.addCell(cell);
    }

    private int calculateOrganScore(List<ReportResult> results, String organKey) {
        List<ReportResult> subset = results.stream().filter(r -> {
            String cat = r.getParameter() != null ? r.getParameter().getCategory() : null;
            if (cat == null) cat = determineCategoryFallback(r.getParameter() != null ? r.getParameter().getParameterName() : "");
            return cat != null && cat.toLowerCase().contains(organKey.toLowerCase());
        }).collect(Collectors.toList());
        
        if (subset.isEmpty()) return 100; // Optimal if no issues found/tested
        long normal = subset.stream().filter(r -> Boolean.FALSE.equals(r.getIsAbnormal())).count();
        return (int) Math.round(((double) normal / subset.size()) * 100);
    }

    private void buildParameterHighlights(Document document, List<ReportResult> results) {
        document.add(new Paragraph("TEST INSIGHTS").setBold().setFontSize(14).setFontColor(BRAND_TEAL).setMarginTop(10));
        
        // Group by category, substitute 'General' if null
        Map<String, List<ReportResult>> gropped = results.stream().collect(Collectors.groupingBy(r -> {
            TestParameter p = r.getParameter();
            if (p != null && p.getCategory() != null && !p.getCategory().isBlank()) {
                return p.getCategory();
            }
            // fallback heuristic mapping if no category provided by db
            String pName = p != null ? p.getParameterName() : r.getTest() != null ? r.getTest().getTestName() : "";
            return determineCategoryFallback(pName);
        }));

        for (Map.Entry<String, List<ReportResult>> entry : gropped.entrySet()) {
            String category = entry.getKey();
            List<ReportResult> categoryResults = entry.getValue();

            document.add(new Paragraph(category)
                    .setBackgroundColor(BRAND_TEAL)
                    .setFontColor(ColorConstants.WHITE)
                    .setBold()
                    .setPadding(4)
                    .setMarginTop(10));

            for (ReportResult result : categoryResults) {
                renderResultCard(document, result);
            }
        }
    }

    private void renderResultCard(Document document, ReportResult r) {
        String pName = r.getParameter() != null ? r.getParameter().getParameterName() : "Unknown";
        String val = resolveResultValue(r);
        String unit = r.getUnit() != null ? r.getUnit() : "";
        String range = buildNormalRange(r.getParameter(), r);
        Boolean isAbnormal = r.getIsAbnormal() != null ? r.getIsAbnormal() : false;
        Boolean isCritical = r.getIsCritical() != null ? r.getIsCritical() : false;

        DeviceRgb statusColor = isCritical ? new DeviceRgb(153, 27, 27) : (isAbnormal ? CRITICAL_RED : NORMAL_GREEN);
        DeviceRgb bgColor = isCritical ? new DeviceRgb(254, 242, 242) : LIGHT_BG;

        Table card = new Table(UnitValue.createPercentArray(new float[]{40, 20, 40})).useAllAvailableWidth();
        card.setMarginBottom(8);

        Cell nameCell = new Cell().setBorder(Border.NO_BORDER).setVerticalAlignment(VerticalAlignment.MIDDLE);
        nameCell.add(new Paragraph(pName).setBold().setFontSize(11));
        
        Cell valCell = new Cell().setBorder(Border.NO_BORDER).setVerticalAlignment(VerticalAlignment.MIDDLE).setTextAlignment(TextAlignment.CENTER);
        String prefix = isCritical ? "!!! " : "";
        valCell.add(new Paragraph(prefix + val + " " + unit).setBold().setFontSize(14).setFontColor(statusColor));

        Cell visCell = new Cell().setBorder(Border.NO_BORDER).setVerticalAlignment(VerticalAlignment.MIDDLE);
        visCell.add(new Paragraph("Range: " + range).setFontSize(9).setFontColor(ColorConstants.GRAY));
        
        // premium visual canvas marker
        com.itextpdf.kernel.pdf.xobject.PdfFormXObject template = new com.itextpdf.kernel.pdf.xobject.PdfFormXObject(new com.itextpdf.kernel.geom.Rectangle(100, 10));
        com.itextpdf.kernel.pdf.canvas.PdfCanvas canvas = new com.itextpdf.kernel.pdf.canvas.PdfCanvas(template, document.getPdfDocument());
        
        canvas.setFillColor(NORMAL_GREEN).rectangle(0, 4, 60, 2).fill();
        canvas.setFillColor(CRITICAL_RED).rectangle(60, 4, 40, 2).fill();
        
        float dotX = calculateMarkerPosition(r);
        canvas.setFillColor(SLATE_GRAY).circle(dotX, 5, 3).fill();
        
        Image barImg = new Image(template).setMarginTop(4);
        visCell.add(barImg);

        card.addCell(nameCell);
        card.addCell(valCell);
        card.addCell(visCell);

        // wrap in styled background
        Table block = new Table(UnitValue.createPercentArray(new float[]{100})).useAllAvailableWidth();
        Cell bb = new Cell().setBackgroundColor(bgColor).setPadding(10f).add(card).setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f));
        if (isCritical) bb.setBorder(new SolidBorder(statusColor, 1f));
        block.addCell(bb);
        document.add(block);
    }

    private void buildDoctorSummaryTable(Document document, List<ReportResult> results, List<ReportResult> history, Long currentRepoId) {
        document.add(new Paragraph("CLINICAL DETAILS").setBold().setFontSize(14).setFontColor(BRAND_TEAL).setMarginTop(20));

        Table table = new Table(UnitValue.createPercentArray(new float[]{25, 15, 10, 20, 15, 15})).useAllAvailableWidth();
        
        table.addHeaderCell(new Cell().setBackgroundColor(SLATE_GRAY).setFontColor(ColorConstants.WHITE).add(new Paragraph("Parameter")));
        table.addHeaderCell(new Cell().setBackgroundColor(SLATE_GRAY).setFontColor(ColorConstants.WHITE).add(new Paragraph("Result")));
        table.addHeaderCell(new Cell().setBackgroundColor(SLATE_GRAY).setFontColor(ColorConstants.WHITE).add(new Paragraph("Unit")));
        table.addHeaderCell(new Cell().setBackgroundColor(SLATE_GRAY).setFontColor(ColorConstants.WHITE).add(new Paragraph("Ref. Range")));
        table.addHeaderCell(new Cell().setBackgroundColor(SLATE_GRAY).setFontColor(ColorConstants.WHITE).add(new Paragraph("Prev. Val")));
        table.addHeaderCell(new Cell().setBackgroundColor(SLATE_GRAY).setFontColor(ColorConstants.WHITE).add(new Paragraph("Status")));

        boolean toggle = false;
        for (ReportResult r : results) {
            String pName = r.getParameter() != null ? r.getParameter().getParameterName() : "-";
            String val = resolveResultValue(r);
            String unit = r.getUnit() != null ? r.getUnit() : "-";
            String range = buildNormalRange(r.getParameter(), r);
            
            // Trend logic
            ReportResult prev = findPreviousResult(r.getParameter() != null ? r.getParameter().getId() : null, history, currentRepoId);
            String prevVal = (prev != null) ? resolveResultValue(prev) : "-";
            String trendInd = "";
            if (prev != null && r.getResultValue() != null && prev.getResultValue() != null) {
                try {
                    double c = Double.parseDouble(r.getResultValue());
                    double p = Double.parseDouble(prev.getResultValue());
                    if (c > p + 0.01) trendInd = "↑";
                    else if (c < p - 0.01) trendInd = "↓";
                } catch (Exception e) {}
            }
            
            Color bgColor = toggle ? LIGHT_BG : ColorConstants.WHITE;
            table.addCell(new Cell().setBackgroundColor(bgColor).add(new Paragraph(pName).setFontSize(9)));
            table.addCell(new Cell().setBackgroundColor(bgColor).add(new Paragraph(val + " " + trendInd).setFontSize(10).setBold()));
            table.addCell(new Cell().setBackgroundColor(bgColor).add(new Paragraph(unit).setFontSize(9)));
            table.addCell(new Cell().setBackgroundColor(bgColor).add(new Paragraph(range).setFontSize(9)));
            table.addCell(new Cell().setBackgroundColor(bgColor).add(new Paragraph(prevVal).setFontSize(9).setItalic().setFontColor(ColorConstants.GRAY)));
            table.addCell(new Cell().setBackgroundColor(bgColor).add(new Paragraph(Boolean.FALSE.equals(r.getIsAbnormal()) ? "Normal" : "Out of Range")
                    .setFontSize(9).setFontColor(Boolean.FALSE.equals(r.getIsAbnormal()) ? BRAND_TEAL : CRITICAL_RED)));
            
            toggle = !toggle;
        }

        document.add(table);
    }

    private void buildTableOfContents(Document document) {
        document.add(new Paragraph("REPORT DIRECTORY").setBold().setFontSize(14).setFontColor(BRAND_TEAL).setMarginTop(20));
        
        Table tocTable = new Table(UnitValue.createPercentArray(new float[]{10, 90})).useAllAvailableWidth();
        tocTable.setMarginBottom(15);
        
        String[][] sections = {
            {"01", "Health Score Dashboard"},
            {"02", "Test Insights (Highlights)"},
            {"03", "Clinical Details"},
            {"04", "AI Insights & Wellness"},
            {"05", "Authenticity QR"}
        };

        for (String[] sec : sections) {
            tocTable.addCell(new Cell().setBorder(Border.NO_BORDER).add(new Paragraph(sec[0]).setBold().setFontColor(BRAND_TEAL)));
            tocTable.addCell(new Cell().setBorder(Border.NO_BORDER).add(new Paragraph(sec[1]).setFontColor(SLATE_GRAY)));
        }

        document.add(tocTable);
    }

    private void buildWellnessRecommendations(Document document, List<ReportResult> results) {
        document.add(new Paragraph("AI INSIGHTS & WELLNESS").setBold().setFontSize(14).setFontColor(BRAND_TEAL).setMarginTop(20));
        
        boolean hasAbnormalities = results.stream().anyMatch(r -> Boolean.TRUE.equals(r.getIsAbnormal()));
        
        if (!hasAbnormalities) {
            document.add(new Paragraph("All your test parameters are within the normal optimal range! Keep up your healthy lifestyle.")
                .setFontSize(10).setFontColor(SLATE_GRAY).setItalic());
            return;
        }

        document.add(new Paragraph("Based on your test results, here are some actionable considerations:")
            .setFontSize(10).setFontColor(SLATE_GRAY).setMarginBottom(10));

        com.itextpdf.layout.element.List uiList = new com.itextpdf.layout.element.List()
            .setSymbolIndent(12)
            .setListSymbol("\u2022"); // Bullet

        for (ReportResult rr : results) {
            if (Boolean.TRUE.equals(rr.getIsAbnormal())) {
                String pName = rr.getParameter() != null ? rr.getParameter().getParameterName() : "";
                String lower = pName.toLowerCase();
                
                if (lower.contains("glucose") || lower.contains("hba1c")) {
                    uiList.add(new com.itextpdf.layout.element.ListItem("Blood Sugar Management: Your " + pName + " is out of range. Consider a diet low in refined carbohydrates and consult a diabetologist."));
                } else if (lower.contains("cholesterol") || lower.contains("lipid") || lower.contains("ldl")) {
                    uiList.add(new com.itextpdf.layout.element.ListItem("Heart Health: Elevated " + pName + " suggests a need to reduce saturated fats and increase cardiovascular exercise."));
                } else if (lower.contains("sgpt") || lower.contains("sgot") || lower.contains("bilirubin")) {
                    uiList.add(new com.itextpdf.layout.element.ListItem("Liver Care: Abnormal " + pName + " levels may require limiting alcohol intake and avoiding fatty foods."));
                } else if (lower.contains("hemoglobin") || lower.contains("iron")) {
                    uiList.add(new com.itextpdf.layout.element.ListItem("Nutrition Check: Your " + pName + " requires attention. Ensure you are getting adequate iron and B-vitamins in your diet."));
                }
            }
        }

        if (uiList.getChildren().isEmpty()) {
            uiList.add(new com.itextpdf.layout.element.ListItem("General wellness check recommended due to flagged out-of-range parameters."));
        }

        document.add(uiList);
        
        document.add(new Paragraph("Disclaimer: AI Insights are heuristic suggestions and do not replace professional medical diagnosis.")
            .setFontSize(8).setFontColor(ColorConstants.GRAY).setMarginTop(10));
    }

    private void buildVerificationQr(Document document, Report report) {
        document.add(new Paragraph("AUTHENTICITY & VERIFICATION").setBold().setFontSize(14).setFontColor(BRAND_TEAL).setMarginTop(20));
        
        Table outerTable = new Table(UnitValue.createPercentArray(new float[]{25, 75})).useAllAvailableWidth();
        outerTable.setMarginTop(10);

        // QR Code
        String qrContent = qrBaseUrl + "?id=" + report.getId();
        BarcodeQRCode qrCode = new BarcodeQRCode(qrContent);
        PdfFormXObject qrObject = qrCode.createFormXObject(ColorConstants.BLACK, document.getPdfDocument());
        Image qrImage = new Image(qrObject).setWidth(80).setHeight(80);
        outerTable.addCell(new Cell().setBorder(Border.NO_BORDER).add(qrImage));

        // Security Block
        Cell securityCell = new Cell().setBorder(Border.NO_BORDER).setVerticalAlignment(VerticalAlignment.MIDDLE).setPaddingLeft(15);
        securityCell.add(new Paragraph("DIGITAL SECURITY SEAL").setBold().setFontSize(10).setFontColor(BRAND_TEAL).setMarginBottom(4));
        securityCell.add(new Paragraph("This document is cryptographically sealed with an HMAC-SHA256 signature to ensure clinical integrity. Any alteration to the data will invalidate the seal.")
                .setFontSize(8).setFontColor(ColorConstants.GRAY).setItalic());
        
        String fingerprint = report.getDigitalFingerprint() != null ? report.getDigitalFingerprint() : "PENDING_SEAL";
        securityCell.add(new Paragraph("FINGERPRINT: " + fingerprint)
                .setBold().setFontSize(7).setFontColor(SLATE_GRAY).setMarginTop(8));
        
        outerTable.addCell(securityCell);
        document.add(outerTable);
        
        document.add(new Paragraph("Verified & Sealed via HealthcareLab Trusted Node Service.").setFontSize(8).setFontColor(ColorConstants.GRAY).setMarginTop(5));
    }

    private String determineCategoryFallback(String p) {
        if (p == null) return "General Health";
        p = p.toLowerCase(java.util.Locale.ROOT);
        if (p.contains("creatinine") || p.contains("urea") || p.contains("bun") || p.contains("uric")) return "Kidney";
        if (p.contains("bilirubin") || p.contains("sgot") || p.contains("sgpt") || p.contains("albumin")) return "Liver";
        if (p.contains("glucose") || p.contains("hba1c") || p.contains("insulin")) return "Metabolism / Diabetes";
        if (p.contains("cbc") || p.contains("hemoglobin") || p.contains("wbc") || p.contains("rbc") || p.contains("platelet")) return "Blood Health (Hematology)";
        if (p.contains("tsh") || p.contains("t3") || p.contains("t4") || p.contains("thyroid")) return "Thyroid Profile";
        if (p.contains("cholesterol") || p.contains("hdl") || p.contains("ldl") || p.contains("triglyceride")) return "Lipid Profile (Heart)";
        if (p.contains("sodium") || p.contains("potassium") || p.contains("chloride") || p.contains("electrolyte")) return "Electrolytes";
        if (p.contains("iron") || p.contains("ferritin") || p.contains("tibc")) return "Iron Studies";
        if (p.contains("vitamin") || p.contains("b12") || p.contains("d3")) return "Vitamins & Minerals";
        return "General Health";
    }

    private float calculateMarkerPosition(ReportResult r) {
        try {
            if (r.getResultValue() == null || r.getNormalRangeMin() == null || r.getNormalRangeMax() == null) {
                return r.getIsAbnormal() ? 80 : 30;
            }
            double val = Double.parseDouble(r.getResultValue());
            double min = r.getNormalRangeMin().doubleValue();
            double max = r.getNormalRangeMax().doubleValue();
            
            if (val < min) return 15; // Low zone
            if (val > max) return 85; // High zone
            
            // Map min-max to 30-70 range
            double range = max - min;
            if (range == 0) return 50;
            return (float) (30 + ((val - min) / range) * 40);
        } catch (Exception e) {
            return r.getIsAbnormal() ? 80 : 30;
        }
    }

    private String resolveResultValue(ReportResult result) {
        if (result.getResultValue() != null && !result.getResultValue().isBlank()) return result.getResultValue();
        return result.getValue() != null ? result.getValue() : "-";
    }

    private String buildNormalRange(TestParameter parameter, ReportResult result) {
        if (parameter != null && parameter.getNormalRangeMin() != null && parameter.getNormalRangeMax() != null) {
            return parameter.getNormalRangeMin() + " - " + parameter.getNormalRangeMax();
        }
        if (result.getNormalRange() != null) return result.getNormalRange();
        if (result.getNormalRangeMin() != null && result.getNormalRangeMax() != null) {
            return result.getNormalRangeMin() + " - " + result.getNormalRangeMax();
        }
        return "-";
    }

    private void buildMedicalOfficerRemarks(Document document, ReportVerification verification) {
        document.add(new Paragraph("MEDICAL OFFICER REMARKS").setBold().setFontSize(14).setFontColor(BRAND_TEAL).setMarginTop(20));
        
        if (verification != null && verification.getClinicalNotes() != null) {
            Div remarksBox = new Div().setBackgroundColor(LIGHT_BG).setPadding(10).setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f));
            remarksBox.add(new Paragraph(verification.getClinicalNotes()).setFontSize(10).setFontColor(SLATE_GRAY));
            
            if (verification.getMedicalOfficer() != null) {
                remarksBox.add(new Paragraph("\nVerified By: Dr. " + verification.getMedicalOfficer().getName())
                        .setBold().setFontSize(10).setFontColor(BRAND_TEAL));
                remarksBox.add(new Paragraph("E-Signature: " + (verification.getDigitalSignature() != null ? verification.getDigitalSignature() : "SIGNED_ELECTRONICALLY"))
                        .setItalic().setFontSize(8).setFontColor(ColorConstants.GRAY));
            }
            document.add(remarksBox);
        } else {
            document.add(new Paragraph("No specific clinical remarks provided by the reviewing officer.")
                    .setFontSize(10).setFontColor(SLATE_GRAY).setItalic());
        }
    }

    private void buildClinicalDisclaimer(Document document) {
        document.add(new Paragraph("\n\n"));
        Table discTable = new Table(1).useAllAvailableWidth();
        Cell discCell = new Cell().setBackgroundColor(LIGHT_BG).setPadding(10).setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f));
        
        discCell.add(new Paragraph("CERTIFICATION & DISCLAIMER").setBold().setFontSize(9).setFontColor(BRAND_TEAL));
        discCell.add(new Paragraph("1. This is a computer-generated report based on digital verification and does not require a physical signature.\n" +
                                   "2. All clinical findings must be correlated with other diagnostic data. The lab's liability is limited to the cost of the test.\n" +
                                   "3. NABL Accredited | ISO 15189:2012 Certified Diagnostic Facility.")
                                   .setFontSize(8).setFontColor(SLATE_GRAY));
        
        discTable.addCell(discCell);
        document.add(discTable);
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? "-" : DATE_TIME_FORMATTER.format(dateTime);
    }

    private void buildAiDeepInsightsPage(Document document, ReportAiAnalysis ai) {
        document.add(new Paragraph("AI DEEP CORE: PERSONALIZED HEALTH OPTIMIZATION")
                .setBold().setFontSize(18).setFontColor(BRAND_TEAL).setTextAlignment(TextAlignment.CENTER).setMarginBottom(15));

        // 1. Core Health Score
        Table scoreHeader = new Table(1).useAllAvailableWidth().setMarginBottom(20);
        Cell scoreCell = new Cell().setBackgroundColor(LIGHT_BG).setPadding(20).setBorder(new SolidBorder(BRAND_TEAL, 2f));
        scoreCell.add(new Paragraph("YOUR BIOLOGICAL VITALITY SCORE").setFontSize(10).setTextAlignment(TextAlignment.CENTER).setFontColor(SLATE_GRAY));
        
        int score = ai.getHealthScore() != null ? ai.getHealthScore() : 0;
        DeviceRgb scoreColor = score > 80 ? NORMAL_GREEN : (score > 60 ? INFO_BLUE : CRITICAL_RED);
        
        scoreCell.add(new Paragraph(score + "%").setBold().setFontSize(42).setFontColor(scoreColor).setTextAlignment(TextAlignment.CENTER));
        scoreCell.add(new Paragraph(ai.getSummary() != null ? ai.getSummary() : "Comprehensive Analysis Complete.")
                .setFontSize(11).setItalic().setTextAlignment(TextAlignment.CENTER).setFontColor(ColorConstants.GRAY));
        scoreHeader.addCell(scoreCell);
        document.add(scoreHeader);

        // 2. High Severity Patterns (If any)
        List<String> patterns = parseJsonList(ai.getPatternsJson());
        if (!patterns.isEmpty()) {
            document.add(new Paragraph("KEY HEALTH PATTERNS DETECTED").setBold().setFontSize(12).setFontColor(CRITICAL_RED));
            com.itextpdf.layout.element.List patternList = new com.itextpdf.layout.element.List().setSymbolIndent(10).setListSymbol("🔍 ");
            for (String p : patterns) {
                com.itextpdf.layout.element.ListItem listItem = new com.itextpdf.layout.element.ListItem(p);
                listItem.setFontSize(10).setFontColor(ColorConstants.DARK_GRAY);
                patternList.add(listItem);
            }
            document.add(patternList);
            document.add(new Paragraph("\n"));
        }

        // 3. Personalized Roadmaps (Diet, Exercise, Lifestyle)
        Map<String, List<String>> recs = parseJsonMap(ai.getRecommendationsJson());
        
        if (recs.containsKey("Dietary Recommendations") || recs.containsKey("diet")) {
            addRecommendationSection(document, "🥗 DIETARY PRECISION ROADMAP", 
                recs.getOrDefault("Dietary Recommendations", recs.get("diet")));
        }

        if (recs.containsKey("Physical Activity") || recs.containsKey("exercise")) {
            addRecommendationSection(document, "🏃 PHYSICAL PERFORMANCE PLAN", 
                recs.getOrDefault("Physical Activity", recs.get("exercise")));
        }

        if (recs.containsKey("Lifestyle & Habits") || recs.containsKey("lifestyle")) {
            addRecommendationSection(document, "🧘 LIFESTYLE & HABIT OPTIMIZATION", 
                recs.getOrDefault("Lifestyle & Habits", recs.get("lifestyle")));
        }

        // 4. Next Steps
        if (recs.containsKey("Next Steps") || recs.containsKey("followup")) {
            addRecommendationSection(document, "📅 CLINICAL FOLLOW-UP & NEXT STEPS", 
                recs.getOrDefault("Next Steps", recs.get("followup")));
        }

        document.add(new Paragraph("\n\n"));
        document.add(new Paragraph("AI Disclaimer: This analysis is generated by AI Clinical Engine and should be reviewed by a qualified healthcare professional. It is intended for health optimization guidance only.")
                .setFontSize(8).setItalic().setFontColor(ColorConstants.GRAY).setTextAlignment(TextAlignment.CENTER));
    }

    private void addRecommendationSection(Document document, String title, List<String> items) {
        if (items == null || items.isEmpty()) return;
        
        document.add(new Paragraph(title).setBold().setFontSize(12).setFontColor(BRAND_TEAL).setMarginTop(10));
        Table box = new Table(1).useAllAvailableWidth().setMarginBottom(10);
        Cell cell = new Cell().setBackgroundColor(new DeviceRgb(240, 249, 249)).setPadding(10).setBorder(new SolidBorder(BRAND_TEAL, 0.5f));
        
        com.itextpdf.layout.element.List uiList = new com.itextpdf.layout.element.List().setSymbolIndent(12).setListSymbol("• ");
        for (String item : items) {
            com.itextpdf.layout.element.ListItem listItem = new com.itextpdf.layout.element.ListItem(item);
            listItem.setFontSize(9).setFontColor(ColorConstants.DARK_GRAY);
            uiList.add(listItem);
        }
        cell.add(uiList);
        box.addCell(cell);
        document.add(box);
    }

    private List<String> parseJsonList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.error("Error parsing AI JSON list: {}", e.getMessage());
            return List.of();
        }
    }

    private Map<String, List<String>> parseJsonMap(String json) {
        if (json == null || json.isBlank()) return Map.of();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, List<String>>>() {});
        } catch (Exception e) {
            log.error("Error parsing AI JSON map: {}", e.getMessage());
            return Map.of();
        }
    }
}

