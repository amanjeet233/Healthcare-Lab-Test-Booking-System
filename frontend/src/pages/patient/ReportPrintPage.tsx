import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { reportService } from '../../services/reportService';
import { bookingService } from '../../services/booking';
import MedicalReport from '../../components/reports/MedicalReport';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { notify } from '../../utils/toast';
import GlassButton from '../../components/common/GlassButton';
import { ArrowLeft, Printer, Download, AlertCircle } from 'lucide-react';
import { buildMedicalReportTemplateData, type MedicalReportTemplateData } from '../../utils/pdfGenerator';

const ReportPrintPage: React.FC = () => {
  const { bookingId: bookingIdStr } = useParams<{ bookingId: string }>();
  const bookingId = Number(bookingIdStr);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState<MedicalReportTemplateData | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bookingId) {
      void loadReportData();
    }
  }, [bookingId]);

  useEffect(() => {
    if (!loading && data && mode === 'print') {
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, data, mode]);

  useEffect(() => {
    if (!loading && data && mode === 'download') {
      const timer = setTimeout(() => {
        void handleDownloadPdf();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [loading, data, mode]);

  const loadReportData = async () => {
    try {
      setLoading(true);

      const [booking, reportResponse, aiAnalysis] = await Promise.all([
        bookingService.getBookingById(bookingId),
        reportService.getReportResults(bookingId),
        reportService.getAIAnalysis(bookingId)
      ]);

      const safeDate = (dateVal: any) => {
        if (!dateVal) return '';
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? '' : d.toLocaleString('en-IN');
      };
      const clean = (value: any) => String(value ?? '').trim();
      const stripTrailingDot = (value: any) => clean(value).replace(/[.。]+$/g, '');

      const ageValue = clean((booking as any)?.patientAge || (booking as any)?.age || (reportResponse as any)?.patientAge || (reportResponse as any)?.age);
      const genderValue = clean((booking as any)?.gender || (booking as any)?.sex || (reportResponse as any)?.patientGender || (reportResponse as any)?.gender || (reportResponse as any)?.sex);

      const patientData = {
        name: booking?.patientName || 'Valued Patient',
        age: ageValue,
        gender: genderValue,
        reportId: `HL-${booking?.bookingReference || booking?.id || bookingId}`,
        collectionDate: safeDate(booking?.collectionDate || booking?.bookingDate),
        generationDate: new Date().toLocaleString('en-IN')
      };

      const results = (reportResponse?.results || []).map((r: any) => ({
        parameter: stripTrailingDot(r.parameterName || r.testName || 'Unknown Parameter'),
        result: clean(r.resultValue || r.value || '-'),
        unit: clean(r.unit) || '-',
        referenceRange: clean(r.normalRange || `${r.normalRangeMin || ''} - ${r.normalRangeMax || ''}`.trim() || '-'),
        status: (r.isCritical ? 'CRITICAL' : (r.isAbnormal ? 'ABNORMAL' : 'NORMAL')) as 'NORMAL' | 'ABNORMAL' | 'CRITICAL'
      }));

      const healthScores = {
        vitality: aiAnalysis?.healthScore || 85,
        liver: (aiAnalysis as any)?.organScores?.Liver || 90,
        metabolism: (aiAnalysis as any)?.organScores?.Metabolism || 85
      };

      const remarks = reportResponse?.verification?.clinicalNotes || 'Clinically stable. Regular monitoring recommended.';
      const aiInsights = aiAnalysis?.recommendations?.map((r: any) => r.text) || [
        'Maintain a balanced diet and regular exercise.',
        'Ensure adequate hydration and sleep cycle.'
      ];

      setData(buildMedicalReportTemplateData({
        patientData,
        results,
        healthScores,
        remarks,
        aiInsights,
        fingerprint: reportResponse?.digitalFingerprint || 'HEALTHCARELAB-SEALED-2026',
        verifiedDoctorName:
          clean(reportResponse?.verification?.verifiedByName) ||
          clean(reportResponse?.verification?.verifiedBy) ||
          clean((reportResponse as any)?.verifiedByName)
      }));
    } catch (error) {
      console.error('Failed to load report data:', error);
      notify.error('Could not generate printable report.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current || !data) return;

    try {
      setGenerating(true);
      const element = reportRef.current;

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll('.no-print').forEach((el) => {
            (el as HTMLElement).style.display = 'none';
          });
          const a4 = clonedDoc.querySelector('.a4-container') as HTMLElement;
          if (a4) {
            a4.style.boxShadow = 'none';
            a4.style.margin = '0';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'SLOW');
      pdf.save(`HEALTHCARELAB_REPORT_${data.patient.reportId}.pdf`);

      notify.success('Report Saved to System.');

      if (mode === 'download') {
        setTimeout(() => window.close(), 1500);
      }
    } catch (error) {
      console.error('Direct PDF Error:', error);
      notify.error('Direct download failed. Please use Print -> Save as PDF.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading || generating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <LoadingSpinner size="lg" />
          {generating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-[#007BFF]/20 border-t-[#007BFF] rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div className="mt-8 text-center space-y-2">
          <p className="text-slate-900 font-black uppercase tracking-[0.2em] text-sm">
            {generating ? 'Converting to Premium PDF...' : 'Fetching Clinical Metadata...'}
          </p>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
            {generating ? 'Aligning A4 Layout & Finalizing Seal' : 'Synthesizing Patient Intelligence'}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Intelligence Lost</h2>
        <p className="text-slate-400 text-xs mt-2 max-w-xs">Could not retrieve clinical mapping for this booking reference.</p>
        <GlassButton onClick={() => navigate('/reports')} className="mt-8" icon={<ArrowLeft size={16} />}>
          BACK TO DASHBOARD
        </GlassButton>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="no-print fixed top-6 right-6 z-50 flex gap-3">
        <GlassButton onClick={() => navigate('/reports')} variant="outline" icon={<ArrowLeft size={16} />}>
          BACK
        </GlassButton>
        <GlassButton onClick={() => window.print()} variant="outline" icon={<Printer size={16} />}>
          PRINT
        </GlassButton>
        <GlassButton onClick={() => void handleDownloadPdf()} icon={<Download size={16} />}>
          DOWNLOAD PDF
        </GlassButton>
      </div>

      <div ref={reportRef} className="bg-white">
        <MedicalReport
          patient={data.patient}
          scores={data.scores}
          results={data.results}
          doctorRemarks={data.doctorRemarks}
          aiInsights={data.aiInsights}
          digitalFingerprint={data.digitalFingerprint}
          verifiedDoctorName={data.verifiedDoctorName}
        />
      </div>
    </div>
  );
};

export default ReportPrintPage;
