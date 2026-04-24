import jsPDF from 'jspdf';
import { BookingResponse } from '../types/booking';

export interface MedicalReportTemplateData {
  patient: {
    name: string;
    age: number | string;
    gender: string;
    reportId: string;
    sampleCollectionDate: string;
    reportGenerationDate: string;
  };
  scores: {
    overall: number;
    liver: number;
    metabolism: number;
  };
  results: Array<{
    parameter: string;
    result: number | string;
    unit: string;
    refRange: string;
    status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
  }>;
  doctorRemarks: string;
  aiInsights: string[];
  digitalFingerprint: string;
  verifiedDoctorName?: string;
}

export const buildMedicalReportTemplateData = (data: {
  patientData: {
    name: string;
    age: string;
    gender: string;
    reportId: string;
    collectionDate: string;
    generationDate: string;
  };
  results: Array<{
    parameter: string;
    result: string;
    unit: string;
    referenceRange: string;
    status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
  }>;
  healthScores: {
    vitality: number;
    liver: number;
    metabolism: number;
  };
  remarks: string;
  aiInsights: string[];
  fingerprint: string;
  verifiedDoctorName?: string;
}): MedicalReportTemplateData => ({
  patient: {
    name: data.patientData.name,
    age: data.patientData.age,
    gender: data.patientData.gender,
    reportId: data.patientData.reportId,
    sampleCollectionDate: data.patientData.collectionDate,
    reportGenerationDate: data.patientData.generationDate
  },
  scores: {
    overall: data.healthScores.vitality,
    liver: data.healthScores.liver,
    metabolism: data.healthScores.metabolism
  },
  results: data.results.map((r) => ({
    parameter: r.parameter,
    result: r.result,
    unit: r.unit,
    refRange: r.referenceRange,
    status: r.status
  })),
  doctorRemarks: data.remarks,
  aiInsights: data.aiInsights,
  digitalFingerprint: data.fingerprint,
  verifiedDoctorName: data.verifiedDoctorName
});

/**
 * ✅ GENERATE BOOKING RECEIPT PDF
 * Creates a professional PDF receipt for a test booking
 */
export const generateBookingReceipt = (booking: BookingResponse): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const formatDate = (value?: string) => {
    if (!value) return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = () => {
    return new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMoney = (value: number) =>
    `Rs ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const fitText = (text: string, maxWidth: number) => {
    const safe = String(text || '').trim();
    if (!safe) return '-';
    if (doc.getTextWidth(safe) <= maxWidth) return safe;
    let value = safe;
    while (value.length > 3 && doc.getTextWidth(`${value}...`) > maxWidth) {
      value = value.slice(0, -1);
    }
    return `${value}...`;
  };

  const amount = Number(booking.amount ?? booking.finalAmount ?? booking.totalAmount ?? 0);
  const discount = Number(booking.discount ?? 0);
  const subtotal = Number(booking.totalAmount ?? amount + discount);
  const testName = booking.testName || booking.labTestName || booking.packageName || 'Diagnostic Test';
  const category = booking.packageName ? 'Package' : 'Pathology';
  const bookingId = booking.bookingReference || booking.reference || `HLAB-${booking.id}`;
  const paid = String(booking.paymentStatus || '').toUpperCase() !== 'FAILED' && String(booking.status || '').toUpperCase() !== 'CANCELLED';

  // page background
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // card container
  const cardX = 16;
  const cardY = 14;
  const cardW = pageWidth - 32;
  const cardH = pageHeight - 28;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(cardX, cardY, cardW, cardH, 5, 5, 'FD');

  // top accent
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(cardX, cardY, cardW, 2.5, 1.2, 1.2, 'F');

  // header brand
  let y_brand = cardY + 14;
  const leftX = cardX + 6;
  const rightX = cardX + cardW - 6;
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  const brandPrefix = 'HEALTHCARE';
  const brandSuffix = 'LAB';
  doc.text(brandPrefix, leftX, y_brand);
  const labX = leftX + doc.getTextWidth(brandPrefix) + 0.8;
  doc.setTextColor(37, 99, 235);
  doc.text(brandSuffix, labX, y_brand);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Smart Diagnostics, Trusted Care', leftX, y_brand + 5.5);

  // receipt label + paid badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text('RECEIPT', rightX, y_brand, { align: 'right' });
  doc.setFillColor(paid ? 220 : 254, paid ? 252 : 242, paid ? 231 : 226);
  doc.roundedRect(rightX - 13, y_brand + 2.2, 13, 6, 3, 3, 'F');
  doc.setTextColor(paid ? 21 : 185, paid ? 128 : 28, paid ? 61 : 28);
  doc.setFontSize(7);
  doc.text(paid ? 'PAID' : 'UNPAID', rightX - 6.5, y_brand + 6.2, { align: 'center' });

  // divider
  doc.setDrawColor(241, 245, 249);
  doc.line(leftX, y_brand + 10, rightX, y_brand + 10);

  // details
  let y_details = y_brand + 18;
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT NAME', leftX, y_details);
  doc.text('BOOKING ID', rightX, y_details, { align: 'right' });

  y_details += 4.6;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9.5);
  const patientValue = fitText(booking.patientName || 'Patient', 70);
  const bookingIdValue = fitText(`#${bookingId}`, 58);
  doc.text(patientValue, leftX, y_details);
  doc.text(bookingIdValue, rightX, y_details, { align: 'right' });

  y_details += 8;
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text('CONTACT', leftX, y_details);
  doc.text('DATE & TIME', rightX, y_details, { align: 'right' });

  y_details += 4.6;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9.5);
  const contactValue = fitText(booking.patientPhone || booking.patientEmail || 'N/A', 70);
  const dateTimeValue = fitText(`${formatDate(booking.bookingDate || booking.collectionDate)} | ${booking.timeSlot || booking.scheduledTime || '09:00 AM'}`, 58);
  doc.text(contactValue, leftX, y_details);
  doc.text(dateTimeValue, rightX, y_details, { align: 'right' });

  y_details += 8.5;
  doc.setDrawColor(241, 245, 249);
  doc.line(leftX, y_details, rightX, y_details);

  // table header
  let y_table = y_details + 9;
  doc.setFillColor(248, 250, 252);
  doc.rect(leftX, y_table - 5.5, cardW - 12, 8, 'F');
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Test Description', cardX + 8, y_table);
  doc.text('Category', cardX + 78, y_table, { align: 'left' });
  doc.text('Amount', rightX - 2, y_table, { align: 'right' });

  // table row
  y_table += 8.2;
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  const wrappedTest = doc.splitTextToSize(testName, 64);
  doc.text(wrappedTest, cardX + 8, y_table);
  doc.text(fitText(category, 28), cardX + 78, y_table);
  doc.text(fitText(formatMoney(amount), 30), rightX - 2, y_table, { align: 'right' });

  y_table += Math.max(7, wrappedTest.length * 4.3) + 8;

  // totals block
  const totalsX = cardX + cardW - 58;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal', totalsX, y_table);
  doc.setTextColor(51, 65, 85);
  doc.text(fitText(formatMoney(subtotal), 30), rightX - 2, y_table, { align: 'right' });

  y_table += 7;
  doc.setTextColor(100, 116, 139);
  doc.text('Discount', totalsX, y_table);
  doc.setTextColor(239, 68, 68);
  doc.text(fitText(`- ${formatMoney(discount)}`, 30), rightX - 2, y_table, { align: 'right' });

  y_table += 5;
  doc.setDrawColor(226, 232, 240);
  doc.line(totalsX, y_table, rightX - 2, y_table);

  y_table += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text('Total Amount', totalsX, y_table);
  doc.text(fitText(formatMoney(amount), 30), rightX - 2, y_table, { align: 'right' });

  // footer
  const fy = cardY + cardH - 20;
  doc.setDrawColor(241, 245, 249);
  doc.line(leftX, fy - 6, rightX, fy - 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated receipt and does not require a physical signature.', cardX + cardW / 2, fy, { align: 'center' });
  doc.text(`Generated: ${formatDateTime()} | support@healthcarelab.com`, cardX + cardW / 2, fy + 4.5, { align: 'center' });

  return doc;
};

/**
 * ✅ GENERATE PREMIUM LAB REPORT PDF
 * Deterministic generation using pure jsPDF drawing (No Canvas)
 * Matches the high-fidelity branding of report-template.html
 */
export const generatePremiumLabReport = (data: {
  patientData: {
    name: string;
    age: string;
    gender: string;
    reportId: string;
    collectionDate: string;
    generationDate: string;
  };
  results: Array<{
    parameter: string;
    result: string;
    unit: string;
    referenceRange: string;
    status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
  }>;
  healthScores: {
    vitality: number;
    liver: number;
    metabolism: number;
  };
  remarks: string;
  aiInsights: string[];
  fingerprint: string;
}): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  const colors = {
    blue: [0, 123, 255] as [number, number, number], // #007BFF
    blueDark: [0, 75, 135] as [number, number, number], // #004B87 (For gradient)
    slate900: [15, 23, 42] as [number, number, number],
    slate600: [71, 85, 105] as [number, number, number],
    slate500: [100, 116, 139] as [number, number, number],
    slate400: [148, 163, 184] as [number, number, number],
    slate300: [203, 213, 225] as [number, number, number],
    slate200: [226, 232, 240] as [number, number, number],
    slate100: [241, 245, 249] as [number, number, number],
    slate50: [248, 250, 252] as [number, number, number],
    green700: [21, 128, 61] as [number, number, number],
    green100: [220, 252, 231] as [number, number, number],
    rose700: [190, 18, 60] as [number, number, number],
    rose100: [255, 228, 230] as [number, number, number],
    teal500: [20, 184, 166] as [number, number, number],
    amber500: [245, 158, 11] as [number, number, number]
  };

  // 1. HEADER SECTION
  let y = margin;
  
  // Header Accent
  doc.setFillColor(...colors.blue);
  doc.rect(margin, y, contentWidth, 1.2, 'F');
  y += 6;

  // Icon Placeholder (Logo Path)
  doc.setFillColor(0, 123, 255, 0.08); 
  doc.roundedRect(margin, y, 16, 16, 2.5, 2.5, 'F');
  
  // Heartbeat Vector Icon (Bold)
  doc.setDrawColor(...colors.blue);
  doc.setLineWidth(1.0);
  doc.path([
    { op: 'm', c: [margin + 2.5, y + 8] },
    { op: 'l', c: [margin + 5.8, y + 8] },
    { op: 'l', c: [margin + 8.0, y + 3.5] },
    { op: 'l', c: [margin + 10.5, y + 12.5] },
    { op: 'l', c: [margin + 13.0, y + 8] },
    { op: 'l', c: [margin + 14.5, y + 8] }
  ]).stroke();

  // Lab Brand
  doc.setTextColor(...colors.blue);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(23); 
  doc.text('HEALTHCARELAB', margin + 20, y + 6);
  
  doc.setTextColor(...colors.slate500);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('ADVANCED DIAGNOSTIC & RESEARCH CENTRE', margin + 20, y + 10);
  
  // Badges
  doc.setFillColor(...colors.slate100); 
  doc.setDrawColor(...colors.slate200);
  doc.setLineWidth(0.1);
  doc.roundedRect(margin + 20, y + 13.5, 38, 4.2, 2.1, 2.1, 'FD');
  doc.roundedRect(margin + 62, y + 13.5, 30, 4.2, 2.1, 2.1, 'FD');
  
  doc.setTextColor(...colors.slate600);
  doc.setFontSize(5.8);
  doc.text('NABL ACCREDITED (MC-1024)', margin + 39, y + 16.5, { align: 'center' });
  doc.text('ISO 15189 CERTIFIED', margin + 77, y + 16.5, { align: 'center' });

  // Verified Badge (Right)
  const badgeRight = margin + contentWidth;
  doc.setDrawColor(...colors.blue, 0.2);
  doc.setFillColor(235, 245, 255); // blue-50
  doc.roundedRect(badgeRight - 42, y, 42, 8, 4, 4, 'FD');
  
  doc.setTextColor(...colors.blue);
  doc.setFontSize(8);
  doc.text('Verified Smart Report', badgeRight - 18, y + 5.2, { align: 'center' });
  doc.setTextColor(...colors.slate400);
  doc.setFontSize(6.5);
  doc.text('Diagnostic Integrity v3.1', badgeRight - 1, y + 12.5, { align: 'right' });

  y += 24;

  // 2. PATIENT DETAILS
  doc.setFillColor(...colors.slate50);
  doc.setDrawColor(...colors.slate100);
  doc.roundedRect(margin, y, contentWidth, 26, 5, 5, 'FD');
  
  const col1 = margin + 8;
  const col2 = margin + (contentWidth / 3) + 2;
  const col3 = margin + contentWidth - 8;

  const drawField = (label: string, value: string, fx: number, fy: number, align: 'left' | 'right' = 'left') => {
    doc.setTextColor(...colors.slate400);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(label.toUpperCase(), fx, fy, { align });
    doc.setTextColor(...colors.slate900);
    doc.setFontSize(10.5);
    doc.text(value || 'N/A', fx, fy + 5.5, { align });
  };

  drawField('Patient Name', data.patientData.name, col1, y + 9);
  drawField('Age / Gender', `${data.patientData.age} / ${data.patientData.gender}`, col2, y + 9);
  
  // Report ID
  doc.setTextColor(...colors.slate400);
  doc.setFontSize(7);
  doc.text('REPORT ID', col3, y + 9, { align: 'right' });
  doc.setTextColor(...colors.blue);
  doc.setFontSize(10.5);
  doc.text(data.patientData.reportId, col3, y + 14.5, { align: 'right' });

  drawField('Sample Collection', data.patientData.collectionDate, col1, y + 19);
  drawField('Report Generated', data.patientData.generationDate, col2, y + 19);

  // Digital Seal with Checkmark icon
  doc.setTextColor(...colors.green700);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  const sealX = col3;
  const sealY = y + 22.5;
  doc.text('DIGITAL SEAL ACTIVE', sealX, sealY, { align: 'right' });
  
  doc.setDrawColor(...colors.green700);
  doc.setLineWidth(0.6);
  doc.path([
    { op: 'm', c: [sealX - 32, sealY - 1.2] },
    { op: 'l', c: [sealX - 30.5, sealY] },
    { op: 'l', c: [sealX - 28.5, sealY - 2.5] }
  ]).stroke();

  y += 34;

  // 3. HEALTH DASHBOARD
  const dashY = y;
  
  // Gradient for Vitality Box
  const steps = 15;
  const stepW = 55 / steps;
  for (let i = 0; i < steps; i++) {
    const ratio = i / steps;
    const r = Math.round(colors.blue[0] * (1 - ratio) + colors.blueDark[0] * ratio);
    const g = Math.round(colors.blue[1] * (1 - ratio) + colors.blueDark[1] * ratio);
    const b = Math.round(colors.blue[2] * (1 - ratio) + colors.blueDark[2] * ratio);
    doc.setFillColor(r, g, b);
    doc.rect(margin + (i * stepW), dashY, stepW + 0.1, 44, 'F');
  }
  doc.setDrawColor(...colors.blue);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, dashY, 55, 44, 5, 5, 'S');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('OVERALL VITALITY', margin + 27.5, dashY + 8, { align: 'center', charSpace: 1.2 });
  
  const rx = margin + 27.5;
  const ry = dashY + 23;
  const vScore = data.healthScores.vitality || 0;
  
  doc.setLineWidth(3.5);
  doc.setDrawColor(255, 255, 255, 0.15);
  doc.circle(rx, ry, 11, 'S');
  doc.setDrawColor(255, 255, 255);
  doc.setLineCap('round');
  
  if ((doc as any).arc && vScore > 0) {
     (doc as any).arc(rx, ry, 11, -Math.PI/2, (-Math.PI/2) + (2 * Math.PI * vScore / 100), false);
     doc.stroke();
  } else {
     doc.setLineWidth(1);
     doc.circle(rx, ry, 11, 'S');
  }
  
  doc.setFontSize(16);
  doc.text(vScore > 0 ? `${vScore}%` : '---', rx, ry + 2, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255, 0.85);
  doc.text(vScore > 75 ? 'EXCELLENT RANGE' : vScore > 50 ? 'GOOD RANGE' : 'MONITORING', rx, dashY + 40, { align: 'center' });

  // Organ Stats
  const statX = margin + 63;
  const statW = (contentWidth - 63) / 2;
  
  const drawOrganTile = (label: string, score: number, sx: number, themeColor: [number, number, number], type: 'liver' | 'metabolism') => {
     doc.setFillColor(...colors.slate100);
     doc.setDrawColor(...colors.slate200);
     doc.roundedRect(sx, dashY, statW - 4, 44, 5, 5, 'FD');
     
     doc.setTextColor(...colors.slate500);
     doc.setFontSize(8);
     doc.text(label.toUpperCase(), sx + 6, dashY + 10);
     
     doc.setTextColor(...colors.slate900);
     doc.setFontSize(22);
     doc.setFont('helvetica', 'bold');
     doc.text(score > 0 ? `${score}%` : '---', sx + 6, dashY + 24);
     
     const ix = sx + statW - 15;
     const iy = dashY + 22;
     
     doc.setLineWidth(2.8);
     doc.setDrawColor(...themeColor, 0.15);
     doc.circle(ix, iy, 7, 'S');
     doc.setDrawColor(...themeColor);
     if ((doc as any).arc && score > 0) {
       (doc as any).arc(ix, iy, 7, -Math.PI/2, (-Math.PI/2) + (2 * Math.PI * score / 100), false);
       doc.stroke();
     }

     doc.setLineWidth(0.8);
     if (type === 'liver') {
       doc.circle(ix, iy - 2, 3, 'S');
       doc.path([
         { op: 'm', c: [ix - 2, iy + 1] }, { op: 'l', c: [ix - 3, iy + 5] }, { op: 'l', c: [ix, iy + 3.5] },
         { op: 'm', c: [ix + 2, iy + 1] }, { op: 'l', c: [ix + 3, iy + 5] }, { op: 'l', c: [ix, iy + 3.5] }
       ]).stroke();
     } else {
       doc.path([
         { op: 'm', c: [ix - 4, iy] }, { op: 'l', c: [ix - 2, iy] }, { op: 'l', c: [ix - 1, iy - 3] },
         { op: 'l', c: [ix + 1, iy + 3] }, { op: 'l', c: [ix + 2, iy] }, { op: 'l', c: [ix + 4, iy] }
       ]).stroke();
     }
  };

  drawOrganTile('Liver Health', data.healthScores.liver, statX, colors.teal500, 'liver');
  drawOrganTile('Metabolism', data.healthScores.metabolism, statX + statW, colors.amber500, 'metabolism');

  y += 52;

  // 4. TEST RESULTS TABLE
  doc.setFillColor(...colors.slate900);
  doc.roundedRect(margin, y, contentWidth, 12, 4, 4, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PARAMETER', margin + 6, y + 7.5);
  doc.text('RESULT', margin + (contentWidth/2.4), y + 7.5, { align: 'center' });
  doc.text('UNIT', margin + (contentWidth/1.85), y + 7.5, { align: 'center' });
  doc.text('REF. RANGE', margin + (contentWidth/1.4), y + 7.5, { align: 'center' });
  doc.text('STATUS', margin + contentWidth - 6, y + 7.5, { align: 'right' });

  y += 12;
  
  data.results.forEach((r, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(...colors.slate50);
      doc.rect(margin, y, contentWidth, 12, 'F');
    }
    
    doc.setTextColor(...colors.slate900);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(r.parameter, margin + 6, y + 7.5);
    
    if (r.status !== 'NORMAL') {
      doc.setTextColor(...colors.rose700);
      doc.setFont('helvetica', 'black');
    } else {
      doc.setTextColor(...colors.slate900);
      doc.setFont('helvetica', 'bold');
    }
    doc.text(String(r.result), margin + (contentWidth/2.4), y + 7.5, { align: 'center' });
    
    doc.setTextColor(...colors.slate500);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(r.unit, margin + (contentWidth/1.85), y + 7.5, { align: 'center' });
    doc.text(r.referenceRange, margin + (contentWidth/1.4), y + 7.5, { align: 'center' });
    
    const isNormal = r.status === 'NORMAL';
    doc.setFillColor(...(isNormal ? colors.green100 : colors.rose100));
    doc.roundedRect(margin + contentWidth - 24, y + 3.5, 20, 5.5, 2.7, 2.7, 'F');
    doc.setTextColor(...(isNormal ? colors.green700 : colors.rose700));
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(r.status, margin + contentWidth - 14, y + 7.5, { align: 'center' });
    
    y += 12;
  });

  y += 10;

  // 5. REMARKS & INSIGHTS
  const boxW = (contentWidth - 10) / 2;
  
  doc.setFillColor(239, 246, 255); 
  doc.setDrawColor(...colors.blue, 0.1);
  doc.roundedRect(margin, y, boxW, 32, 6, 6, 'FD');
  doc.setTextColor(...colors.slate900);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('MEDICAL OFFICER REMARKS', margin + 8, y + 9);
  doc.setTextColor(...colors.slate600);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(doc.splitTextToSize(data.remarks || 'No clinical remarks observed for this report.', boxW - 16), margin + 8, y + 16);

  doc.setFillColor(240, 253, 250); 
  doc.setDrawColor(...colors.teal500, 0.1);
  doc.roundedRect(margin + boxW + 10, y, boxW, 32, 6, 6, 'FD');
  doc.setTextColor(...colors.slate900);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('AI WELLNESS INSIGHTS', margin + boxW + 18, y + 9);
  doc.setTextColor(...colors.slate600);
  doc.setFontSize(8);
  const insights = (data.aiInsights && data.aiInsights.length > 0) ? data.aiInsights : ['Awaiting lifestyle optimization insights.'];
  insights.slice(0, 2).forEach((insight, i) => {
     doc.text(`\u2022 ${insight}`, margin + boxW + 18, y + 16 + (i * 7), { maxWidth: boxW - 20 });
  });

  y += 42;

  // 6. FOOTER
  doc.setTextColor(...colors.slate400);
  doc.setFontSize(7);
  doc.text('DIGITAL FINGERPRINT', margin, y);
  doc.setFillColor(...colors.slate100);
  doc.roundedRect(margin, y + 2.5, contentWidth / 2.2, 12, 3, 3, 'F');
  doc.setTextColor(...colors.blue);
  doc.setFont('courier', 'bold');
  doc.setFontSize(6);
  doc.text(data.fingerprint || 'N/A', margin + 6, y + 9.5, { maxWidth: (contentWidth / 2.2) - 12 });

  doc.setDrawColor(...colors.slate300);
  doc.line(margin + contentWidth - 50, y + 14, margin + contentWidth, y + 14);
  doc.setTextColor(...colors.slate900);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Dr. Sameer Patel', margin + contentWidth, y + 19, { align: 'right' });
  doc.setTextColor(...colors.slate500);
  doc.setFontSize(8);
  doc.text('CONSULTANT PATHOLOGIST', margin + contentWidth, y + 23, { align: 'right' });

  doc.setTextColor(...colors.slate300);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('ISO 15189 CERTIFIED', margin, pageHeight - 14);
  doc.text('ICMR APPROVED', margin + contentWidth/2, pageHeight - 14, { align: 'center' });
  doc.text('NABL ACCREDITED', margin + contentWidth, pageHeight - 14, { align: 'right' });

  return doc;
};


/**
 * ✅ DOWNLOAD PDF HELPER
 * Triggers browser download of PDF file
 */
export const downloadPDF = (doc: jsPDF, filename: string): void => {
  doc.save(filename);
};

/**
 * ✅ SEND EMAIL WITH ATTACHMENT
 * Sends PDF receipt/report via email (integrates with backend)
 */
export const sendPDFViaEmail = async (
  email: string,
  subject: string,
  pdfDoc: jsPDF,
  filename: string
): Promise<boolean> => {
  try {
    const pdfBlob = pdfDoc.output('blob');
    const reader = new FileReader();

    return new Promise((resolve) => {
      reader.onload = async () => {
        const base64PDF = reader.result as string;

        const response = await fetch('/api/email/send-with-attachment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            toEmail: email,
            subject: subject,
            body: `Please find your ${filename} attached.`,
            attachmentBase64: base64PDF,
            attachmentFilename: filename,
            attachmentMimeType: 'application/pdf'
          })
        });

        resolve(response.ok);
      };

      reader.readAsDataURL(pdfBlob);
    });
  } catch (error) {
    console.error('❌ Email send failed:', error);
    return false;
  }
};
