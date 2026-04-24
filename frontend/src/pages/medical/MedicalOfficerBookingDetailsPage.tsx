import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock3, FileText, MapPin, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { reportService } from '../../services/reportService';
import { doctorService } from '../../services/doctorService';
import { useAuth } from '../../hooks/useAuth';
import type { BookingResponse } from '../../types/booking';

type TimelineEntry = {
  action?: string;
  timestamp?: string;
  details?: string;
  status?: string;
  by?: string;
};

type ReportParameter = {
  id?: number | string;
  parameterName?: string;
  resultValue?: string | number;
  unit?: string;
  normalRange?: string;
  isCritical?: boolean;
  isAbnormal?: boolean;
};

type ReportResultsPayload = {
  reportId?: number;
  id?: number;
  results?: ReportParameter[];
  resultItems?: ReportParameter[];
  testName?: string;
};

type VerificationInfo = {
  clinicalNotes?: string;
  digitalSignature?: string;
  status?: string;
  specialistType?: string;
  verificationDate?: string;
};

const toDateLabel = (value?: string) => {
  if (!value) return 'N/A';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const toDateOnly = (value?: string) => {
  if (!value) return 'N/A';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const normalizeBooking = (raw: any): BookingResponse => ({
  ...raw,
  bookingReference: raw?.bookingReference || raw?.reference || `HLAB-${raw?.id}`,
  reference: raw?.reference || raw?.bookingReference || `HLAB-${raw?.id}`,
  testName: raw?.testName || raw?.labTestName || raw?.packageName || 'Lab Test',
  bookingDate: raw?.bookingDate || raw?.collectionDate,
  collectionDate: raw?.collectionDate || raw?.bookingDate,
  timeSlot: raw?.timeSlot || raw?.scheduledTime,
  scheduledTime: raw?.scheduledTime || raw?.timeSlot,
  collectionType: raw?.collectionType || 'LAB',
  collectionAddress: raw?.collectionAddress,
  amount: Number(raw?.amount ?? raw?.totalAmount ?? raw?.finalAmount ?? 0),
  totalAmount: Number(raw?.totalAmount ?? raw?.amount ?? raw?.finalAmount ?? 0),
  finalAmount: Number(raw?.finalAmount ?? raw?.totalAmount ?? raw?.amount ?? 0),
}) as BookingResponse;

const unwrapResponse = <T,>(response: any): T | null => {
  if (response?.data?.data !== undefined) return response.data.data as T;
  if (response?.data !== undefined) return response.data as T;
  return null;
};

const MedicalOfficerBookingDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { bookingId } = useParams<{ bookingId: string }>();

  const parsedBookingId = Number(bookingId);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [reportResults, setReportResults] = useState<ReportResultsPayload | null>(null);
  const [verificationInfo, setVerificationInfo] = useState<VerificationInfo | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [digitalSignature, setDigitalSignature] = useState('');
  const [specialistType, setSpecialistType] = useState('GENERAL');
  const [icdCodes, setIcdCodes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!parsedBookingId || Number.isNaN(parsedBookingId)) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const bookingResponse = await api.get(`/api/mo/bookings/${parsedBookingId}`);
        const bookingData = unwrapResponse<BookingResponse>(bookingResponse);
        setBooking(bookingData ? normalizeBooking(bookingData) : null);

        const timelineResponse = await api.get(`/api/bookings/${parsedBookingId}/timeline`).catch(() => null);
        const timelineData = timelineResponse ? unwrapResponse<TimelineEntry[]>(timelineResponse) : [];
        setTimeline(Array.isArray(timelineData) ? timelineData : []);

        const resultsData = await reportService.getReportResults(parsedBookingId).catch(() => null);
        setReportResults(resultsData as ReportResultsPayload | null);

        const verificationResponse = await api.get(`/api/reports/verifications/booking/${parsedBookingId}`).catch(() => null);
        const verificationData = verificationResponse ? unwrapResponse<VerificationInfo>(verificationResponse) : null;
        setVerificationInfo(verificationData);
        setClinicalNotes(verificationData?.clinicalNotes || '');
        setDigitalSignature(verificationData?.digitalSignature || `Digitally signed by ${currentUser?.name || 'Medical Officer'}`);
        setSpecialistType(verificationData?.specialistType || 'GENERAL');
      } catch {
        toast.error('Failed to load booking details');
        setBooking(null);
        setTimeline([]);
        setReportResults(null);
        setVerificationInfo(null);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [parsedBookingId, currentUser?.name]);

  const displayAddress = useMemo(() => {
    if (!booking) return 'N/A';
    return booking.collectionAddress || booking.reference || 'N/A';
  }, [booking]);

  const statusClass = useMemo(() => {
    const status = String(booking?.status || '').toUpperCase();
    if (status.includes('VERIFIED')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status.includes('PENDING')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (status.includes('PROCESSING')) return 'bg-violet-100 text-violet-700 border-violet-200';
    if (status.includes('CANCELLED')) return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  }, [booking?.status]);

  const parameterRows = useMemo(() => {
    const rows = reportResults?.results || reportResults?.resultItems || [];
    return Array.isArray(rows) ? rows : [];
  }, [reportResults]);

  const handleVerify = async () => {
    if (!clinicalNotes.trim() || clinicalNotes.trim().length < 10) {
      toast.error('Clinical remarks must be at least 10 characters');
      return;
    }

    if (!digitalSignature.trim()) {
      toast.error('Digital signature is required');
      return;
    }

    setSubmitting(true);
    try {
      await doctorService.verifyReport(parsedBookingId, {
        clinicalNotes: clinicalNotes.trim(),
        digitalSignature: digitalSignature.trim(),
        approved: true,
        specialistType: specialistType.trim() || 'GENERAL',
        icdCodes: icdCodes.trim(),
      });
      toast.success('Report approved and signed');
      const refreshed = await api.get(`/api/reports/verifications/booking/${parsedBookingId}`).catch(() => null);
      setVerificationInfo(refreshed?.data?.data ?? verificationInfo);
    } catch {
      toast.error('Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!parsedBookingId || Number.isNaN(parsedBookingId)) {
    return (
      <div className="max-w-[980px] mx-auto px-5 md:px-6 lg:px-8 py-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <p className="text-slate-700 font-semibold">Invalid booking id.</p>
          <button onClick={() => navigate(-1)} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white text-xs font-black uppercase">
            <ArrowLeft className="w-3.5 h-3.5" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1140px] mx-auto px-5 md:px-6 lg:px-8 py-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <Link to="/medical-officer/verification" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-cyan-700 hover:text-cyan-800">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Verification
          </Link>
          <h1 className="text-[clamp(1.6rem,1.05rem+1.6vw,2.5rem)] font-black text-[#164E63] uppercase tracking-tight">
            Booking <span className="text-cyan-600">Verification</span>
          </h1>
          <p className="text-sm text-slate-500 font-semibold">Dedicated verification page for booking #{bookingId}.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-200 text-cyan-700 text-[11px] font-black uppercase"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          <div className="h-48 rounded-2xl bg-white border border-slate-200 animate-pulse" />
        </div>
      ) : !booking ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <p className="text-slate-600 font-semibold">Booking not found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${statusClass}`}>
                  {booking.status || 'UNKNOWN'}
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100 text-[10px] font-black uppercase tracking-widest">
                  {booking.collectionType || 'LAB'} Collection
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Booking Reference</p>
                  <p className="text-lg font-black text-[#164E63]">{booking.bookingReference}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Test</p>
                  <p className="text-lg font-black text-[#164E63]">{booking.testName || 'Lab Test'}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Patient</p>
                  <p className="text-lg font-black text-[#164E63]">{booking.patientName || 'Patient'}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Amount</p>
                  <p className="text-lg font-black text-[#164E63]">{booking.finalAmount || booking.totalAmount || booking.amount || 0}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600 font-semibold">
                <div className="flex items-start gap-2"><Calendar className="w-4 h-4 mt-0.5 text-cyan-600" /> <span>{toDateOnly(booking.bookingDate || booking.collectionDate)}</span></div>
                <div className="flex items-start gap-2"><Clock3 className="w-4 h-4 mt-0.5 text-cyan-600" /> <span>{booking.timeSlot || booking.scheduledTime || 'N/A'}</span></div>
                <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-cyan-600" /> <span>{displayAddress}</span></div>
                <div className="flex items-start gap-2"><Users className="w-4 h-4 mt-0.5 text-cyan-600" /> <span>{booking.patientId ? `Patient ID: ${booking.patientId}` : 'Patient ID not available'}</span></div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Quick Info</h2>
              <div className="space-y-3 text-sm font-semibold text-slate-700">
                <div className="flex items-center justify-between gap-3"><span className="text-slate-500">Booking ID</span><span>{booking.id}</span></div>
                <div className="flex items-center justify-between gap-3"><span className="text-slate-500">Reference</span><span>{booking.reference || booking.bookingReference}</span></div>
                <div className="flex items-center justify-between gap-3"><span className="text-slate-500">Status</span><span className="uppercase">{booking.status || 'N/A'}</span></div>
                <div className="flex items-center justify-between gap-3"><span className="text-slate-500">Payment</span><span>{booking.paymentStatus || 'PENDING'}</span></div>
                <div className="flex items-center justify-between gap-3"><span className="text-slate-500">Technician</span><span>{booking.technicianName || 'Unassigned'}</span></div>
                <div className="flex items-center justify-between gap-3"><span className="text-slate-500">Updated</span><span>{toDateLabel(booking.updatedAt || booking.createdAt)}</span></div>
              </div>

              {(booking.notes || booking.specialNotes) && (
                <div className="mt-4 rounded-xl bg-cyan-50/60 border border-cyan-100 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700 mb-2">Notes</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{booking.notes || booking.specialNotes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-cyan-600" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Test Details & Parameters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm font-semibold text-slate-700">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Test Name</p>
                <p className="font-black text-[#164E63]">{booking.testName || reportResults?.testName || 'Lab Test'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Report Status</p>
                <p className="font-black text-[#164E63]">{verificationInfo?.status || booking.status || 'PENDING_VERIFICATION'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Verification Date</p>
                <p className="font-black text-[#164E63]">{verificationInfo?.verificationDate || 'Not verified yet'}</p>
              </div>
            </div>

            {parameterRows.length === 0 ? (
              <p className="text-sm text-slate-500 font-semibold">No parameters available for this booking.</p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Parameter</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Result</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Reference</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parameterRows.map((result, index) => {
                      const critical = Boolean(result.isCritical);
                      const abnormal = Boolean(result.isAbnormal);
                      return (
                        <tr key={result.id || `${result.parameterName || 'param'}-${index}`} className="border-t border-slate-100">
                          <td className="px-4 py-3">
                            <p className="text-sm font-bold text-slate-800">{result.parameterName || 'Parameter'}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-black ${critical ? 'text-red-600' : abnormal ? 'text-amber-600' : 'text-cyan-700'}`}>
                              {result.resultValue ?? '-'} <span className="text-[10px] font-semibold opacity-60">{result.unit || ''}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500 font-semibold">{result.normalRange || 'N/A'}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${critical ? 'bg-red-100 text-red-700' : abnormal ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {critical ? 'Critical' : abnormal ? 'Abnormal' : 'Normal'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Verification Notes</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Clinical Remarks</label>
                <textarea
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Write the verification remarks before approval..."
                  className="w-full min-h-[160px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-cyan-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Digital Signature</label>
                  <input
                    value={digitalSignature}
                    onChange={(e) => setDigitalSignature(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-cyan-200"
                    placeholder="Digitally signed by..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Specialist Type</label>
                  <select
                    value={specialistType}
                    onChange={(e) => setSpecialistType(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-cyan-200"
                  >
                    <option value="GENERAL">General</option>
                    <option value="PATHOLOGY">Pathology</option>
                    <option value="RADIOLOGY">Radiology</option>
                    <option value="CARDIOLOGY">Cardiology</option>
                    <option value="ENDOCRINOLOGY">Endocrinology</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">ICD Codes</label>
                <input
                  value={icdCodes}
                  onChange={(e) => setIcdCodes(e.target.value)}
                  placeholder="Optional comma-separated ICD codes"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-cyan-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  onClick={() => navigate('/medical-officer/verification')}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerify}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-700 text-white text-[10px] font-black uppercase tracking-widest hover:bg-cyan-800 disabled:opacity-60"
                >
                  <ShieldCheck className="w-4 h-4" /> {submitting ? 'Approving...' : 'Approve & Sign'}
                </button>
              </div>
            </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-cyan-600" />
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Timeline</h2>
              </div>
              {timeline.length === 0 ? (
                <p className="text-sm text-slate-500 font-semibold">No timeline entries available.</p>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                  {timeline.map((entry, index) => (
                    <div key={`${entry.timestamp || entry.action || 'step'}-${index}`} className="flex gap-3 items-start rounded-xl border border-slate-200 p-4 bg-slate-50/70">
                      <div className="mt-1 h-3 w-3 rounded-full bg-cyan-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-black text-[#164E63]">{entry.action || 'Event'}</p>
                          {entry.by && <span className="text-[10px] font-black uppercase tracking-widest text-cyan-700">{entry.by}</span>}
                        </div>
                        <p className="text-xs text-slate-500 font-semibold mt-1">{toDateLabel(entry.timestamp)}</p>
                        {entry.details && <p className="text-sm text-slate-700 mt-2 leading-relaxed">{entry.details}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalOfficerBookingDetailsPage;