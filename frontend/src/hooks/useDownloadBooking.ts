import { useState, useCallback } from 'react';
import { BookingResponse } from '../types/booking';
import toast from 'react-hot-toast';
import { downloadPDF, generateBookingReceipt, generateLabReport, sendPDFViaEmail } from '../utils/pdfGenerator';

interface DownloadOptions {
  includeReport?: boolean;
  sendEmail?: boolean;
}

export const useDownloadBooking = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  /**
   * ✅ DOWNLOAD BOOKING RECEIPT
   * Generates and downloads the booking receipt PDF
   */
  const downloadReceipt = useCallback(async (booking: BookingResponse) => {
    setIsDownloading(true);
    try {
      const receiptPdf = generateBookingReceipt(booking);
      const filename = `receipt-${booking.bookingReference || booking.id}.pdf`;
      downloadPDF(receiptPdf, filename);
      toast.success(`Receipt downloaded: ${filename}`);
    } catch (error) {
      console.error('❌ Download failed:', error);
      toast.error('Failed to download receipt. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, []);

  /**
   * ✅ DOWNLOAD LAB REPORT
   * Generates and downloads the lab report PDF
   */
  const downloadReport = useCallback(async (booking: BookingResponse, results?: Record<string, any>) => {
    setIsDownloading(true);
    try {
      const reportPdf = generateLabReport(booking, results);
      const filename = `report-${booking.bookingReference || booking.id}.pdf`;
      downloadPDF(reportPdf, filename);
      toast.success(`Report downloaded: ${filename}`);
    } catch (error) {
      console.error('❌ Download failed:', error);
      toast.error('Failed to download report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, []);

  /**
   * ✅ DOWNLOAD BOTH RECEIPT AND REPORT
   * Downloads both receipt and report PDFs
   */
  const downloadBoth = useCallback(async (booking: BookingResponse, results?: Record<string, any>) => {
    setIsDownloading(true);
    try {
      const receiptPdf = generateBookingReceipt(booking);
      const reportPdf = generateLabReport(booking, results);
      downloadPDF(receiptPdf, `receipt-${booking.bookingReference || booking.id}.pdf`);
      setTimeout(() => {
        downloadPDF(reportPdf, `report-${booking.bookingReference || booking.id}.pdf`);
      }, 150);
      toast.success('Receipt and report downloaded.');
    } catch (error) {
      console.error('❌ Download failed:', error);
      toast.error('Failed to download documents. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, []);

  /**
   * ✅ EMAIL RECEIPT
   * Sends receipt via email
   */
  const emailReceipt = useCallback(async (booking: BookingResponse) => {
    setIsSending(true);
    try {
      const email = booking.patientEmail || '';

      if (!email) {
        toast.error('No email address found in booking.');
        setIsSending(false);
        return;
      }

      const receiptPdf = generateBookingReceipt(booking);
      const sent = await sendPDFViaEmail(
        email,
        `Booking Receipt - ${booking.bookingReference || booking.id}`,
        receiptPdf,
        `receipt-${booking.bookingReference || booking.id}.pdf`
      );
      if (sent) toast.success(`Receipt sent to ${email}`);
      else toast.error('Failed to send receipt via email.');
    } catch (error) {
      console.error('❌ Email send failed:', error);
      toast.error('Failed to send receipt via email.');
    } finally {
      setIsSending(false);
    }
  }, []);

  /**
   * ✅ EMAIL REPORT
   * Sends report via email
   */
  const emailReport = useCallback(async (booking: BookingResponse, results?: Record<string, any>) => {
    setIsSending(true);
    try {
      const email = booking.patientEmail || '';

      if (!email) {
        toast.error('No email address found in booking.');
        setIsSending(false);
        return;
      }

      const reportPdf = generateLabReport(booking, results);
      const sent = await sendPDFViaEmail(
        email,
        `Lab Report - ${booking.bookingReference || booking.id}`,
        reportPdf,
        `report-${booking.bookingReference || booking.id}.pdf`
      );
      if (sent) toast.success(`Report sent to ${email}`);
      else toast.error('Failed to send report via email.');
    } catch (error) {
      console.error('❌ Email send failed:', error);
      toast.error('Failed to send report via email.');
    } finally {
      setIsSending(false);
    }
  }, []);

  return {
    isDownloading,
    isSending,
    downloadReceipt,
    downloadReport,
    downloadBoth,
    emailReceipt,
    emailReport
  };
};
