package com.healthcare.labtestbooking.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.events.Event;
import com.itextpdf.kernel.events.IEventHandler;
import com.itextpdf.kernel.events.PdfDocumentEvent;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.layout.Canvas;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;

public class ReportHeaderEventHandler implements IEventHandler {

    private static final DeviceRgb BRAND_TEAL = new DeviceRgb(13, 124, 124); // #008080 (Updated to 0D7C7C)
    private static final DeviceRgb SLATE_GRAY = new DeviceRgb(100, 116, 139); // #1E293B (Updated to 64748B)

    private final String patientName;
    private final String patientId;

    public ReportHeaderEventHandler(String patientName, String patientId) {
        this.patientName = patientName;
        this.patientId = patientId;
    }

    @Override
    public void handleEvent(Event event) {
        PdfDocumentEvent docEvent = (PdfDocumentEvent) event;
        PdfDocument pdfDoc = docEvent.getDocument();
        PdfPage page = docEvent.getPage();
        int pageNumber = pdfDoc.getPageNumber(page);

        PdfCanvas pdfCanvas = new PdfCanvas(page.newContentStreamBefore(), page.getResources(), pdfDoc);

        // Header Area
        float width = page.getPageSize().getWidth();
        float top = page.getPageSize().getTop();
        
        // Draw minimalist vector logo (pill shape)
        pdfCanvas.saveState()
                 .setFillColor(BRAND_TEAL)
                 .roundRectangle(36, top - 45, 12, 18, 6)
                 .fill()
                 .setFillColor(ColorConstants.WHITE)
                 .circle(42, top - 36, 3)
                 .fill()
                 .restoreState();

        Canvas headerCanvas = new Canvas(pdfCanvas,
                new com.itextpdf.kernel.geom.Rectangle(55, top - 60, width - 91, 50));
        
        headerCanvas.add(new Paragraph("HEALTHCARELAB")
                .setFontColor(BRAND_TEAL)
                .setBold()
                .setFontSize(16));
        
        // Horizontal line under header
        pdfCanvas.setStrokeColor(BRAND_TEAL)
                 .setLineWidth(0.5f)
                 .moveTo(36, top - 65)
                 .lineTo(width - 36, top - 65)
                 .stroke();

        // Footer Area
        Canvas footerCanvas = new Canvas(pdfCanvas,
                new com.itextpdf.kernel.geom.Rectangle(36, 20, width - 72, 40));

        footerCanvas.add(new Paragraph("NABL ISO 15189 Accredited Lab | Registration: HCL-1092834")
                .setFontColor(BRAND_TEAL)
                .setFontSize(8)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER));

        footerCanvas.add(new Paragraph("Patient: " + (patientName != null ? patientName : "Unknown") 
                + " | ID: " + (patientId != null ? patientId : "-")
                + " | Page " + pageNumber)
                .setFontColor(SLATE_GRAY)
                .setFontSize(8)
                .setTextAlignment(TextAlignment.CENTER));

        // Security Watermark (Verfied Official Report)
        pdfCanvas.saveState();
        com.itextpdf.kernel.pdf.extgstate.PdfExtGState gs1 = new com.itextpdf.kernel.pdf.extgstate.PdfExtGState().setFillOpacity(0.05f);
        pdfCanvas.setExtGState(gs1);
        try {
            com.itextpdf.kernel.font.PdfFont font = com.itextpdf.kernel.font.PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA_BOLD);
            pdfCanvas.beginText()
                     .setFontAndSize(font, 60)
                     .moveText(width / 4, top / 3)
                     .showText("VERIFIED OFFICIAL REPORT")
                     .endText();
        } catch (Exception e) {}
        pdfCanvas.restoreState();

        headerCanvas.close();
        footerCanvas.close();
    }
}
