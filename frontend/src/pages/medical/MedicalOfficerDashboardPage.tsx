import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Loader2,
  MapPin,
  RefreshCw,
  Send,
  User,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import SmartReportViewer from '../../components/reports/SmartReportViewer';
import GlassButton from '../../components/common/GlassButton';
import GlassCard from '../../components/common/GlassCard';
import MOBreadcrumbs from '../../components/medical/MOBreadcrumbs';
import { WorkboardItemSkeleton } from '../../components/common/SkeletonLoader';
import type { SmartAnalysis } from '../../services/smartReportService';

type PendingVerification = {
  id?: number;
  bookingId?: number;
  bookingReference?: string;
  reference?: string;
  patientId?: number;
  patientName?: string;
  testName?: string;
  bookingDate?: string;
  createdAt?: string;
  status?: string;
  collectionAddress?: string;
  city?: string;
  address?: string;
  criticalFlag?: boolean;
  anyResultAbnormal?: boolean;
  previouslyRejected?: boolean;
  clinicalNotes?: string;
  requiresSpecialistReferral?: boolean;
  verificationDate?: string;
  updatedAt?: string;
  resultItems?: Array<{
    parameterName?: string;
    value?: string;
    resultValue?: string;
    unit?: string;
    normalRange?: string;
    referenceRange?: string;
    status?: string;
    flag?: string;
  }>;
};

type DeltaCheckEntry = {
  bookingId: number;
  bookingDate: string;
  parameterName: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: 'H' | 'L' | 'N' | string;
};

type UnassignedBooking = {
  id: number;
  bookingReference?: string;
  reference?: string;
  patientName: string;
  testName?: string;
  bookingDate: string;
  timeSlot?: string;
  collectionAddress?: string;
  city?: string;
  address?: string;
};

type TechnicianOption = {
  userId: number;
  name: string;
  bookingCountForDate: number;
};

const normalizeTechnicianOptions = (rows: any[]): TechnicianOption[] => {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => {
      const resolvedId = Number(row?.userId ?? row?.technicianId ?? row?.id);
      return {
        userId: resolvedId,
        name: String(row?.name || row?.fullName || '').trim(),
        bookingCountForDate: Number(row?.bookingCountForDate ?? 0),
      };
    })
    .filter((item) => Number.isFinite(item.userId) && item.userId > 0 && item.name.length > 0);
};

const getMONodeIndex = (status: string) => {
  if (status === 'VERIFIED' || status === 'COMPLETED') return 4;
  if (status === 'PENDING_VERIFICATION') return 3;
  if (status === 'PROCESSING') return 2;
  if (status === 'SAMPLE_COLLECTED') return 2;
  return 1;
};

const normalizeMONodeStatus = (rawStatus?: string) => {
  const status = String(rawStatus || '').toUpperCase();
  if (status === 'VERIFIED' || status === 'COMPLETED') return status;
  if (status === 'APPROVED') return 'VERIFIED';
  if (status === 'REJECTED') return 'PROCESSING';
  if (status === 'PENDING' || status === 'PENDING_VERIFICATION') return 'PENDING_VERIFICATION';
  if (status === 'PROCESSING') return 'PROCESSING';
  if (status === 'SAMPLE_COLLECTED') return 'SAMPLE_COLLECTED';
  return 'SAMPLE_COLLECTED';
};

const NODE_LABELS = ['Blood Collected', 'Test Processed', 'MO Verification', 'Report Sent'] as const;

const normalizeDateForFilter = (value: unknown): string => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
    const [dd, mm, yyyy] = raw.split('-');
    return `${yyyy}-${mm}-${dd}`;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [dd, mm, yyyy] = raw.split('/');
    return `${yyyy}-${mm}-${dd}`;
  }
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
  }
  return raw;
};

const isWithinDateRange = (value: string, fromDate: string, toDate: string) => {
  if (!value) return false;
  if (fromDate && value < fromDate) return false;
  if (toDate && value > toDate) return false;
  return true;
};

const getSLATone = (ageDays: number) => {
  if (ageDays >= 3) return { label: 'Overdue', className: 'bg-red-100 text-red-700 border-red-200' };
  if (ageDays >= 2) return { label: 'At Risk', className: 'bg-amber-100 text-amber-700 border-amber-200' };
  return { label: 'On Time', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
};

const getDateAgeDays = (value?: string) => {
  const normalized = normalizeDateForFilter(value);
  if (!normalized) return 0;
  const parsed = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return 0;
  const diff = Date.now() - parsed.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

const getMOPriorityScore = (item: PendingVerification) => {
  const ageDays = getDateAgeDays(item.bookingDate || item.createdAt);
  const isCritical = Boolean(item.criticalFlag || item.anyResultAbnormal);
  const isRecheck = Boolean(item.previouslyRejected);
  const isReadyToVerify = normalizeMONodeStatus(item.status) === 'PENDING_VERIFICATION';

  let score = 0;
  if (isCritical) score += 120;
  if (isRecheck) score += 70;
  if (isReadyToVerify) score += 30;
  score += Math.min(ageDays * 12, 60);
  return score;
};

const getMOPriorityReason = (item: PendingVerification) => {
  const reasons: string[] = [];
  if (item.criticalFlag || item.anyResultAbnormal) reasons.push('Critical result');
  if (item.previouslyRejected) reasons.push('Recheck');
  const ageDays = getDateAgeDays(item.bookingDate || item.createdAt);
  if (ageDays >= 2) reasons.push(`${ageDays} day${ageDays === 1 ? '' : 's'} old`);
  if (reasons.length === 0) reasons.push('Ready for review');
  return reasons.slice(0, 2).join(' · ');
};

const MedicalOfficerDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [pending, setPending] = useState<PendingVerification[]>([]);
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingTotalPages, setPendingTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [stats, setStats] = useState<Record<string, number>>({});

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [actioning, setActioning] = useState<number | null>(null);
  const [rejectModeByBooking, setRejectModeByBooking] = useState<Record<number, boolean>>({});
  const [rejectReasonByBooking, setRejectReasonByBooking] = useState<Record<number, string>>({});
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [testNameQuery, setTestNameQuery] = useState((searchParams.get('search') || '').trim());
  const [areaFilter, setAreaFilter] = useState('');
  const [verifiedLocally, setVerifiedLocally] = useState<Record<number, boolean>>({});
  const [sendingBookingId, setSendingBookingId] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [historySnapshot, setHistorySnapshot] = useState<PendingVerification[]>([]);

  const [deltaByBooking, setDeltaByBooking] = useState<Record<number, DeltaCheckEntry[]>>({});
  const [loadingDeltaByBooking, setLoadingDeltaByBooking] = useState<Record<number, boolean>>({});

  const [unassigned, setUnassigned] = useState<UnassignedBooking[]>([]);
  const [loadingUnassigned, setLoadingUnassigned] = useState(false);
  const [techniciansByDate, setTechniciansByDate] = useState<Record<string, TechnicianOption[]>>({});
  const [loadingTechsByDate, setLoadingTechsByDate] = useState<Record<string, boolean>>({});
  const [selectedTechByBooking, setSelectedTechByBooking] = useState<Record<number, number>>({});
  const [assigningBooking, setAssigningBooking] = useState<number | null>(null);

  const [previewAnalysis, setPreviewAnalysis] = useState<SmartAnalysis | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const activeTab = useMemo<'verification' | 'assignments'>(() => {
    return location.pathname === '/medical-officer/assignments' ? 'assignments' : 'verification';
  }, [location.pathname]);

  const sectionMeta = useMemo(() => {
    if (activeTab === 'assignments') {
      return {
        crumb: 'Staff Tasks',
        kicker: 'ASSIGN TECHNICIANS',
        titleLead: 'Staff',
        titleHighlight: 'Assignments',
        description: 'Assign technicians to new bookings and balance workload by date.',
      };
    }
    return {
      crumb: 'Pending Reviews',
      kicker: 'MEDICAL OFFICER VERIFICATION',
      titleLead: 'Report',
      titleHighlight: 'Verification',
      description: 'Review results, verify reports, and send approved reports to patients.',
    };
  }, [activeTab]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingResp, statsResp, historyResp] = await Promise.all([
        api.get('/api/mo/pending', { params: { page: 0, size: 10, filter: activeFilter } }),
        api.get('/api/dashboard/medical-officer/stats'),
        api.get('/api/mo/history', { params: { status: 'ALL', page: 0, size: 40 } }),
      ]);
      const pendingPageData = pendingResp.data?.data || {};
      const historyPageData = historyResp.data?.data || {};
      setPending(pendingPageData.content || []);
      setPendingPage(pendingPageData.number || 0);
      setPendingTotalPages(pendingPageData.totalPages || 0);
      setStats(statsResp.data?.data || {});
      setHistorySnapshot(historyPageData.content || []);
    } catch {
      toast.error('Failed to load MO data');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  const loadTechniciansForDate = useCallback(async (date: string) => {
    if (!date || techniciansByDate[date] || loadingTechsByDate[date]) return;
    setLoadingTechsByDate((prev) => ({ ...prev, [date]: true }));
    try {
      const resp = await api.get('/api/mo/technicians/available', { params: { date } });
      setTechniciansByDate((prev) => ({ ...prev, [date]: normalizeTechnicianOptions(resp.data?.data || []) }));
    } catch {
      toast.error('Failed to load technicians');
    } finally {
      setLoadingTechsByDate((prev) => ({ ...prev, [date]: false }));
    }
  }, [loadingTechsByDate, techniciansByDate]);

  const loadUnassignedBookings = useCallback(async () => {
    setLoadingUnassigned(true);
    try {
      const resp = await api.get('/api/mo/bookings/unassigned');
      const bookings: UnassignedBooking[] = resp.data?.data || [];
      setUnassigned(bookings);
      const uniqueDates = [...new Set(bookings.map((b) => b.bookingDate).filter(Boolean))];
      await Promise.all(uniqueDates.map((date) => loadTechniciansForDate(date)));
    } catch {
      toast.error('Failed to load unassigned bookings');
    } finally {
      setLoadingUnassigned(false);
    }
  }, [loadTechniciansForDate]);

  useEffect(() => {
    if (activeTab === 'verification') {
      void loadData();
    }
  }, [activeTab, loadData]);

  useEffect(() => {
    if (activeTab === 'assignments') {
      void loadUnassignedBookings();
    }
  }, [activeTab, loadUnassignedBookings]);

  useEffect(() => {
    if (activeTab !== 'verification' || !autoRefresh) return undefined;
    const timer = window.setInterval(() => {
      void loadData();
    }, 30000);
    return () => window.clearInterval(timer);
  }, [activeTab, autoRefresh, loadData]);

  const filteredPending = useMemo(() => {
    const areaQuery = areaFilter.trim().toLowerCase();
    return pending.filter((item) => {
      const id = item.bookingId || item.id;
      const bookingDate = normalizeDateForFilter(item.bookingDate);
      const query = testNameQuery.trim().toLowerCase();
      const status = normalizeMONodeStatus(verifiedLocally[id || 0] ? 'VERIFIED' : item.status);
      const dynamicBlob = JSON.stringify(item || {}).toLowerCase();

      if (!isWithinDateRange(bookingDate, fromDate, toDate)) return false;
      if (query) {
        const haystack = [
          id,
          item.bookingReference,
          item.reference,
          item.patientName,
          item.testName,
        ].map((value) => String(value || '').toLowerCase()).join(' ');
        if (!haystack.includes(query) && !dynamicBlob.includes(query)) return false;
      }

      if (areaQuery) {
        const areaHaystack = [
          item.collectionAddress,
          item.city,
          item.address,
        ].map((value) => String(value || '').toLowerCase()).join(' ');
        if (!areaHaystack.includes(areaQuery) && !dynamicBlob.includes(areaQuery)) return false;
      }

      if (activeFilter === 'CRITICAL') return Boolean(item.criticalFlag || item.anyResultAbnormal);
      if (activeFilter === 'RECHECK') return Boolean(item.previouslyRejected);
      if (activeFilter === 'NEW') return status === 'PENDING_VERIFICATION';
      return true;
    });
  }, [activeFilter, areaFilter, fromDate, pending, testNameQuery, toDate, verifiedLocally]);

  const priorityPending = useMemo(() => {
    return [...filteredPending]
      .sort((a, b) => getMOPriorityScore(b) - getMOPriorityScore(a))
      .slice(0, 4);
  }, [filteredPending]);

  const priorityQueueCount = useMemo(() => {
    return filteredPending.filter((item) => item.criticalFlag || item.anyResultAbnormal || item.previouslyRejected).length;
  }, [filteredPending]);

  const agingQueueCount = useMemo(() => {
    return filteredPending.filter((item) => getDateAgeDays(item.bookingDate || item.createdAt) >= 2).length;
  }, [filteredPending]);

  const filteredUnassigned = useMemo(() => {
    const areaQuery = areaFilter.trim().toLowerCase();
    const query = testNameQuery.trim().toLowerCase();
    return unassigned.filter((item) => {
      const dynamicBlob = JSON.stringify(item || {}).toLowerCase();
      const bookingDate = normalizeDateForFilter(item.bookingDate);
      if (!isWithinDateRange(bookingDate, fromDate, toDate)) return false;
      if (query) {
        const haystack = [
          item.id,
          item.bookingReference,
          item.reference,
          item.patientName,
          item.testName,
        ].map((value) => String(value || '').toLowerCase()).join(' ');
        if (!haystack.includes(query) && !dynamicBlob.includes(query)) return false;
      }
      if (areaQuery) {
        const areaHaystack = [
          item.collectionAddress,
          item.city,
          item.address,
        ].map((value) => String(value || '').toLowerCase()).join(' ');
        if (!areaHaystack.includes(areaQuery) && !dynamicBlob.includes(areaQuery)) return false;
      }
      return true;
    });
  }, [areaFilter, fromDate, testNameQuery, toDate, unassigned]);

  const trendStats = useMemo(() => {
    const today = normalizeDateForFilter(new Date().toISOString());
    const weekAgoDate = new Date();
    weekAgoDate.setDate(weekAgoDate.getDate() - 7);
    const weekAgo = normalizeDateForFilter(weekAgoDate.toISOString());

    const verifiedLike = historySnapshot.filter((item) => {
      const status = String(item.status || '').toUpperCase();
      return status === 'APPROVED' || status === 'VERIFIED' || status === 'COMPLETED';
    });

    const todayVerified = verifiedLike.filter((item) => {
      const verifiedDate = normalizeDateForFilter(item.verificationDate || item.updatedAt || item.createdAt);
      return verifiedDate === today;
    }).length;

    const weeklyVerified = verifiedLike.filter((item) => {
      const verifiedDate = normalizeDateForFilter(item.verificationDate || item.updatedAt || item.createdAt);
      return verifiedDate && verifiedDate >= weekAgo;
    }).length;

    let tatHoursTotal = 0;
    let tatCount = 0;
    verifiedLike.forEach((item) => {
      if (!item.bookingDate || !item.verificationDate) return;
      const start = new Date(`${normalizeDateForFilter(item.bookingDate)}T00:00:00`).getTime();
      const end = new Date(item.verificationDate).getTime();
      if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return;
      tatHoursTotal += (end - start) / (1000 * 60 * 60);
      tatCount += 1;
    });

    const avgTatHours = tatCount > 0 ? Number((tatHoursTotal / tatCount).toFixed(1)) : 0;

    return {
      todayVerified,
      weeklyVerified,
      criticalCases: priorityQueueCount,
      avgTatHours,
    };
  }, [historySnapshot, priorityQueueCount]);

  const recentNotes = useMemo(() => {
    return historySnapshot
      .filter((item) => Boolean(item.clinicalNotes && item.clinicalNotes.trim().length > 0))
      .slice(0, 4);
  }, [historySnapshot]);

  const pendingFollowups = useMemo(() => {
    const specialistRefs = historySnapshot.filter((item) => Boolean(item.requiresSpecialistReferral)).length;
    return priorityQueueCount + specialistRefs;
  }, [historySnapshot, priorityQueueCount]);

  const loadDeltaDataForBooking = async (bookingId: number, patientId?: number, testName?: string) => {
    if (!patientId || !testName) {
      toast.error('Patient or test context missing for delta check');
      return;
    }
    if (deltaByBooking[bookingId]) return;
    setLoadingDeltaByBooking((prev) => ({ ...prev, [bookingId]: true }));
    try {
      const resp = await api.get('/api/mo/delta-check', { params: { patientId, testName } });
      setDeltaByBooking((prev) => ({ ...prev, [bookingId]: resp.data?.data || [] }));
    } catch {
      toast.error('Failed to load delta check');
    } finally {
      setLoadingDeltaByBooking((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const submitVerification = async (bookingId: number, note: string) => {
    if (!note || note.trim().length < 10) {
      toast.error('Clinical notes are mandatory (minimum 10 characters)');
      return;
    }
    setActioning(bookingId);
    try {
      await api.post(`/api/mo/verify/${bookingId}`, {
        clinicalNotes: note,
        digitalSignature: `Digitally signed by ${currentUser?.name || 'Medical Officer'}`,
        approved: true,
        specialistType: 'General',
      });
      setVerifiedLocally((prev) => ({ ...prev, [bookingId]: true }));
      setPending((prev) => prev.map((item) => {
        const id = item.bookingId || item.id;
        return id === bookingId ? { ...item, status: 'VERIFIED' } : item;
      }));
      toast.success('Report verified. You can now send it to the patient.');
    } catch {
      toast.error('Verification failed');
    } finally {
      setActioning(null);
    }
  };

  const handleVerify = async (bookingId: number) => {
    const note = remarks[bookingId];
    await submitVerification(bookingId, note || '');
  };

  const handleQuickVerify = async (bookingId: number) => {
    const fallback = 'Reviewed on dashboard priority queue. Report findings validated.';
    const note = (remarks[bookingId] || '').trim() || fallback;
    if (!remarks[bookingId]) {
      setRemarks((prev) => ({ ...prev, [bookingId]: fallback }));
    }
    await submitVerification(bookingId, note);
  };

  const handleReject = async (bookingId: number) => {
    const reason = (rejectReasonByBooking[bookingId] || '').trim();
    if (!reason) {
      toast.error('Rejection reason is required');
      return;
    }
    setActioning(bookingId);
    try {
      await api.post(`/api/mo/reject/${bookingId}`, { reason });
      toast.success('Report rejected and sent back to processing');
      setPending((prev) => prev.filter((item) => (item.bookingId || item.id) !== bookingId));
      setExpandedId((prev) => (prev === bookingId ? null : prev));
    } catch {
      toast.error('Rejection failed');
    } finally {
      setActioning(null);
    }
  };

  const handleSendToPatient = async (bookingId: number) => {
    setSendingBookingId(bookingId);
    try {
      await api.post(`/api/reports/${bookingId}/send-to-patient`);
      toast.success('Report sent to patient! They will receive email + in-app notification.');
      await loadData();
    } catch (e: unknown) {
      const apiError = e as ApiError;
      toast.error(apiError?.response?.data?.message || 'Failed to send report');
    } finally {
      setSendingBookingId(null);
    }
  };

  const handleFlagCritical = async (bookingId: number) => {
    setActioning(bookingId);
    try {
      await api.put(`/api/mo/flag-critical/${bookingId}`);
      setPending((prev) => prev.map((item) => {
        const id = item.bookingId || item.id;
        return id === bookingId ? { ...item, criticalFlag: true } : item;
      }));
      toast.success('Booking flagged as critical');
    } catch {
      toast.error('Failed to flag critical');
    } finally {
      setActioning(null);
    }
  };

  const handleReferToSpecialist = async (bookingId: number) => {
    setActioning(bookingId);
    try {
      const notes = (remarks[bookingId] || '').trim() || 'Escalated from MO dashboard for specialist review.';
      await api.post(`/api/mo/referral/${bookingId}`, { specialistType: 'General', notes });
      toast.success('Referred to specialist');
      await loadData();
    } catch {
      toast.error('Failed to refer specialist');
    } finally {
      setActioning(null);
    }
  };

  const handleQuickReject = async (bookingId: number) => {
    setActioning(bookingId);
    try {
      await api.post(`/api/mo/reject/${bookingId}`, {
        reason: 'Rejected from priority queue: requires reprocessing before verification.',
      });
      setPending((prev) => prev.filter((item) => (item.bookingId || item.id) !== bookingId));
      toast.success('Report rejected and sent back to processing');
    } catch {
      toast.error('Quick rejection failed');
    } finally {
      setActioning(null);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || pendingPage + 1 >= pendingTotalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = pendingPage + 1;
      const pendingResp = await api.get('/api/mo/pending', {
        params: { page: nextPage, size: 10, filter: activeFilter },
      });
      const pageData = pendingResp.data?.data || {};
      setPending((prev) => [...prev, ...(pageData.content || [])]);
      setPendingPage(pageData.number ?? nextPage);
      setPendingTotalPages(pageData.totalPages || pendingTotalPages);
    } catch {
      toast.error('Failed to load more pending reports');
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePreviewReport = async (bookingId: number) => {
    setLoadingPreview(true);
    try {
      const resp = await api.get(`/api/reports/${bookingId}/ai-analysis`);
      setPreviewAnalysis(resp.data?.data || null);
    } catch {
      toast.error('Failed to load report preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleAssignTechnician = async (bookingId: number) => {
    const technicianId = selectedTechByBooking[bookingId];
    if (!technicianId) {
      toast.error('Please select a technician first');
      return;
    }
    setAssigningBooking(bookingId);
    try {
      await api.post(`/api/mo/assign-technician/${bookingId}`, { technicianId });
      toast.success('Technician assigned successfully');
      setUnassigned((prev) => prev.filter((b) => b.id !== bookingId));
      setSelectedTechByBooking((prev) => {
        const copy = { ...prev };
        delete copy[bookingId];
        return copy;
      });
    } catch (err: unknown) {
      const apiError = err as ApiError;
      toast.error(apiError?.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigningBooking(null);
    }
  };

  const statCards = [
    {
      label: 'Waiting',
      value: stats.pendingVerifications || stats.pendingCount || filteredPending.length,
      icon: Clock,
      className: 'text-amber-700 bg-amber-50 border-amber-200',
      href: '/medical-officer/verification?filter=NEW',
    },
    {
      label: 'In Progress',
      value: stats.processingReports || 0,
      icon: FileText,
      className: 'text-cyan-700 bg-cyan-50 border-cyan-200',
      href: '/medical-officer/pipeline?status=PROCESSING',
    },
    {
      label: 'Urgent',
      value: stats.criticalAlerts || filteredPending.filter((x) => x.criticalFlag || x.anyResultAbnormal).length,
      icon: AlertTriangle,
      className: 'text-red-700 bg-red-50 border-red-200',
      href: '/medical-officer/verification?filter=CRITICAL',
    },
    {
      label: 'Completed',
      value: stats.totalVerified || 0,
      icon: CheckCircle2,
      className: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      href: '/medical-officer/history',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1140px] w-full mx-auto px-5 md:px-6 lg:px-8 py-5 md:py-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="max-w-2xl">
            <MOBreadcrumbs items={[{ label: 'Home', to: '/' }, { label: sectionMeta.crumb }]} />
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 bg-cyan-500/10 backdrop-blur-md rounded-xl border border-cyan-500/20 shadow-sm">
                <FileText className="w-5 h-5 text-cyan-600" />
              </div>
              <span className="text-[clamp(0.62rem,0.58rem+0.16vw,0.72rem)] font-black uppercase tracking-[0.22em] text-cyan-800/60">
                {sectionMeta.kicker}
              </span>
            </div>
            <h1 className="text-[clamp(1.5rem,1.05rem+1.4vw,2.25rem)] font-black text-[#164E63] tracking-tight mb-2">
              {sectionMeta.titleLead} <span className="text-cyan-600">{sectionMeta.titleHighlight}</span>
            </h1>
            <p className="text-[clamp(0.78rem,0.76rem+0.28vw,0.92rem)] text-cyan-900/60 font-medium leading-relaxed">
              {sectionMeta.description}
            </p>
          </div>

          <GlassButton
            onClick={() => {
              if (activeTab === 'verification') {
                void loadData();
              } else {
                void loadUnassignedBookings();
              }
            }}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            REFRESH
          </GlassButton>
        </header>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
          {statCards.map(({ label, value, icon: Icon, className, href }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate(href)}
              className="text-left w-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            >
              <GlassCard className="!p-3 md:!p-3.5 h-full transition-transform hover:-translate-y-0.5 hover:shadow-xl cursor-pointer" animate={false}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 border ${className}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-[clamp(1.05rem,0.95rem+0.45vw,1.35rem)] font-black text-[#164E63] tracking-tight">{value}</div>
                <div className="text-[9px] uppercase font-black text-cyan-800/50 tracking-[0.18em]">{label}</div>
              </GlassCard>
            </button>
          ))}
        </div>

        <GlassCard className="!p-4 md:!p-5 mb-4 border-cyan-100/50" animate={false}>
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-800/50 mb-1.5">Trend Strip</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: 'Today verified', value: trendStats.todayVerified, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                  { label: 'Weekly verified', value: trendStats.weeklyVerified, className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
                  { label: 'Critical cases', value: trendStats.criticalCases, className: 'bg-red-50 text-red-700 border-red-200' },
                  { label: 'Avg TAT (hrs)', value: trendStats.avgTatHours, className: 'bg-amber-50 text-amber-700 border-amber-200' },
                ].map((item) => (
                  <div key={item.label} className={`px-3 py-2 rounded-xl border ${item.className}`}>
                    <div className="text-lg font-black">{item.value}</div>
                    <div className="text-[9px] uppercase font-black tracking-[0.16em] opacity-80">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-[320px] w-full">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-800/50 mb-1.5">Notes & Follow-ups</p>
              <div className="rounded-xl border border-cyan-100 bg-cyan-50/40 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-cyan-800">Pending follow-ups</span>
                  <span className="px-2 py-1 rounded-md bg-white border border-cyan-100 text-cyan-700 text-xs font-black">{pendingFollowups}</span>
                </div>
                {recentNotes.length === 0 ? (
                  <p className="text-xs text-slate-500 font-medium">No recent remarks found.</p>
                ) : (
                  <div className="space-y-2">
                    {recentNotes.map((note, idx) => (
                      <div key={`${note.bookingId || note.id || idx}-${idx}`} className="rounded-lg bg-white border border-slate-200 px-2.5 py-2">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">#{note.bookingId || note.id || '-'} · {String(note.status || 'UPDATED').replaceAll('_', ' ')}</p>
                        <p className="text-xs text-slate-700 line-clamp-2 mt-1">{note.clinicalNotes}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  {[
                    { label: 'Approved', status: 'APPROVED' },
                    { label: 'Rejected', status: 'REJECTED' },
                    { label: 'Completed', status: 'FLAGGED' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => navigate(`/medical-officer/history?status=${item.status}`)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-cyan-100 text-cyan-800 text-[10px] font-black uppercase tracking-[0.12em] hover:border-cyan-300 hover:bg-cyan-50 transition-all"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="!p-4 md:!p-5 mb-4 border-cyan-100/50" animate={false}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-800/50 mb-1.5">Priority Review</p>
              <h2 className="text-[clamp(1rem,0.92rem+0.32vw,1.18rem)] font-black text-[#164E63] tracking-tight">
                Urgent work surfaced first
              </h2>
              <p className="text-xs md:text-sm text-cyan-900/60 font-medium mt-1.5">
                Critical, rejected, and aging reports are pulled to the top so approvals stay moving.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Urgent', value: priorityQueueCount, className: 'bg-red-50 text-red-700 border-red-200' },
                { label: 'Aging', value: agingQueueCount, className: 'bg-amber-50 text-amber-700 border-amber-200' },
                { label: 'Queue', value: filteredPending.length, className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
              ].map((item) => (
                <div key={item.label} className={`px-3 py-2 rounded-xl border text-center min-w-[88px] ${item.className}`}>
                  <div className="text-base font-black">{item.value}</div>
                  <div className="text-[9px] uppercase font-black tracking-[0.16em] opacity-80">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { label: 'Open verification', to: '/medical-officer/verification' },
              { label: 'Pipeline view', to: '/medical-officer/pipeline' },
              { label: 'Assignments', to: '/medical-officer/assignments' },
              { label: 'History', to: '/medical-officer/history' },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="px-3.5 py-2 rounded-xl bg-white border border-cyan-100 text-cyan-800 text-xs font-black uppercase tracking-[0.12em] hover:border-cyan-300 hover:bg-cyan-50 transition-all flex items-center justify-center"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {priorityPending.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
              {priorityPending.map((item) => {
                const id = item.bookingId || item.id || 0;
                const ageDays = getDateAgeDays(item.bookingDate || item.createdAt);
                const isCritical = Boolean(item.criticalFlag || item.anyResultAbnormal);
                const isRecheck = Boolean(item.previouslyRejected);
                const searchTarget = encodeURIComponent(String(item.bookingReference || item.reference || item.bookingId || item.id || item.patientName || ''));
                const slaTone = getSLATone(ageDays);
                return (
                  <div key={id} className="w-full rounded-2xl">
                    <GlassCard className="!p-4 h-full border border-cyan-100 transition-transform hover:-translate-y-0.5 hover:shadow-lg" animate={false}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">#{id}</div>
                          <h3 className="font-black text-[#164E63] tracking-tight mt-1 line-clamp-2">
                            {item.patientName || 'Patient'} - {item.testName || 'Lab Test'}
                          </h3>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${isCritical ? 'bg-red-100 text-red-700' : isRecheck ? 'bg-amber-100 text-amber-700' : 'bg-cyan-100 text-cyan-700'}`}>
                          {isCritical ? 'Critical' : isRecheck ? 'Recheck' : 'Ready'}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-slate-600">
                        <div className="flex items-center justify-between gap-2">
                          <span>Booking date</span>
                          <span className="font-bold text-slate-700">{item.bookingDate || item.createdAt || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span>Priority reason</span>
                          <span className="font-bold text-slate-700 text-right">{getMOPriorityReason(item)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span>Age</span>
                          <span className="font-bold text-slate-700">{ageDays} day{ageDays === 1 ? '' : 's'}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span>SLA</span>
                          <span className={`px-2 py-1 rounded-md border text-[10px] font-black uppercase tracking-wider ${slaTone.className}`}>
                            {slaTone.label}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleQuickVerify(id);
                          }}
                          disabled={actioning === id}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.12em] hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Verify
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleQuickReject(id);
                          }}
                          disabled={actioning === id}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.12em] hover:bg-rose-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleFlagCritical(id);
                          }}
                          disabled={actioning === id}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-600 text-white text-[10px] font-black uppercase tracking-[0.12em] hover:bg-amber-700 disabled:opacity-50"
                        >
                          {actioning === id ? 'Flagging...' : 'Flag Critical'}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleReferToSpecialist(id);
                          }}
                          disabled={actioning === id}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-600 text-white text-[10px] font-black uppercase tracking-[0.12em] hover:bg-cyan-700 disabled:opacity-50"
                        >
                          {actioning === id ? 'Refer...' : 'Specialist'}
                        </button>
                      </div>

                      <Link
                        to={`/medical-officer/verification?search=${searchTarget}`}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-cyan-700"
                      >
                        Open review
                        <ChevronDown className="w-3.5 h-3.5 rotate-[-90deg]" />
                      </Link>
                    </GlassCard>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        <GlassCard className="!p-4 md:!p-5 mb-4" animate={false}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Search Bookings</label>
              <input
                value={testNameQuery}
                onChange={(e) => setTestNameQuery(e.target.value)}
                placeholder="Search by booking ID / patient / test / city"
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Location / Address</label>
              <input
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                placeholder="Filter by city/address"
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex flex-col justify-end gap-2">
              <GlassButton
                variant="tertiary"
                size="sm"
                className="w-full !rounded-xl !font-black !tracking-[0.12em]"
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                  setTestNameQuery('');
                  setAreaFilter('');
                }}
              >
                CLEAR FILTERS
              </GlassButton>
              <button
                type="button"
                onClick={() => setAutoRefresh((prev) => !prev)}
                className={`w-full px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-[0.12em] transition-all ${autoRefresh ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-700 border-slate-200'}`}
              >
                Auto Refresh: {autoRefresh ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </GlassCard>

        {activeTab === 'verification' && (
          <>
            <div className="flex gap-1 bg-cyan-50/80 p-1 rounded-xl mb-4 w-fit">
              {['ALL', 'NEW', 'CRITICAL', 'RECHECK'].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setActiveFilter(f);
                    setPendingPage(0);
                  }}
                  className={`px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-[11px] font-black uppercase tracking-[0.08em] transition-all ${
                    activeFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-[clamp(1rem,0.92rem+0.32vw,1.2rem)] font-black text-[#164E63] uppercase tracking-tight">
                Verification Queue
              </h2>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-cyan-100 text-cyan-700 text-[10px] font-black uppercase tracking-widest">
                {filteredPending.length}
              </span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <WorkboardItemSkeleton key={i} />)}
              </div>
            ) : filteredPending.length === 0 ? (
              <GlassCard className="!p-10 text-center" animate={false}>
                <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No pending verifications found for this filter</p>
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {filteredPending.map((item) => {
                  const id = item.bookingId || item.id || 0;
                  const isExpanded = expandedId === id;
                  const isVerified = Boolean(verifiedLocally[id]);
                  const cardStatus = normalizeMONodeStatus(isVerified ? 'VERIFIED' : item.status);
                  const nodeIndex = getMONodeIndex(cardStatus);
                  const rejectMode = Boolean(rejectModeByBooking[id]);

                  return (
                    <GlassCard key={id} className="!p-0 overflow-hidden" animate={false}>
                      <div className="p-4 cursor-pointer" onClick={() => setExpandedId((prev) => (prev === id ? null : id))}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-black text-slate-400">#{id}</span>
                              {Boolean(item.criticalFlag || item.anyResultAbnormal) && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-red-100 text-red-700">CRITICAL</span>
                              )}
                              {Boolean(item.previouslyRejected) && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">RECHECK</span>
                              )}
                            </div>
                            <h3 className="font-black text-[#164E63] tracking-tight text-base">
                              {item.patientName || 'Patient'} - {item.testName || 'Lab Test'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Booking date: {item.bookingDate || item.createdAt || 'N/A'}</p>
                          </div>
                          <button className="flex items-center gap-1 text-xs font-black text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 bg-white">
                            {isExpanded ? 'Collapse' : 'Expand'}
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <div className="mt-4 overflow-x-auto">
                          <div className="min-w-[640px] flex items-center">
                            {NODE_LABELS.map((label, idx) => {
                              const nodeNo = idx + 1;
                              const done = nodeNo < nodeIndex;
                              const active = nodeNo === nodeIndex;
                              const isVerificationNode = nodeNo === 3;
                              const activeClass = rejectMode && isVerificationNode
                                ? 'bg-red-500 text-white ring-4 ring-red-200'
                                : active && isVerificationNode
                                  ? 'bg-cyan-600 text-white ring-4 ring-cyan-200 shadow-[0_0_0_6px_rgba(8,145,178,0.12)]'
                                  : active
                                    ? 'bg-cyan-600 text-white'
                                    : done
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-200 text-slate-500';

                              return (
                                <React.Fragment key={label}>
                                  <div className="flex flex-col items-center w-[140px]">
                                    <div className={`w-8 h-8 rounded-full text-xs font-black flex items-center justify-center ${activeClass}`}>
                                      {done ? <CheckCircle2 className="w-4 h-4" /> : nodeNo}
                                    </div>
                                    <p className={`mt-1 text-[10px] text-center font-bold ${active || done ? 'text-slate-800' : 'text-slate-500'}`}>
                                      {label}
                                    </p>
                                  </div>
                                  {idx < NODE_LABELS.length - 1 && (
                                    <div className={`h-[2px] flex-1 min-w-[40px] ${done ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>

                        {item.resultItems && item.resultItems.length > 0 && (
                          <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden bg-white">
                            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                              Results
                            </div>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-xs">
                                <thead>
                                  <tr className="border-b border-slate-200 text-slate-500">
                                    <th className="text-left py-2 px-3">Parameter</th>
                                    <th className="text-left py-2 px-3">Value</th>
                                    <th className="text-left py-2 px-3">Unit</th>
                                    <th className="text-left py-2 px-3">Ref Range</th>
                                    <th className="text-left py-2 px-3">Flag</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.resultItems.map((row, idx) => {
                                    const flag = (row.flag || row.status || 'NORMAL').toString().toUpperCase();
                                    return (
                                      <tr key={`${id}-row-${idx}`} className="border-b border-slate-100">
                                        <td className="py-2 px-3 font-semibold text-slate-700">{row.parameterName || '-'}</td>
                                        <td className="py-2 px-3 text-slate-700">{row.value || row.resultValue || '-'}</td>
                                        <td className="py-2 px-3 text-slate-600">{row.unit || '-'}</td>
                                        <td className="py-2 px-3 text-slate-600">{row.normalRange || row.referenceRange || '-'}</td>
                                        <td className="py-2 px-3">
                                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black ${
                                            flag.includes('HIGH') || flag === 'H' || flag.includes('CRITICAL')
                                              ? 'bg-red-100 text-red-700'
                                              : flag.includes('LOW') || flag === 'L'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-emerald-100 text-emerald-700'
                                          }`}>
                                            {flag.replaceAll('_', ' ')}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-5 pt-4 border-t border-slate-100 bg-cyan-50/35 space-y-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <GlassButton
                              variant="tertiary"
                              size="sm"
                              className="!rounded-xl !font-black"
                              onClick={() => loadDeltaDataForBooking(id, item.patientId, item.testName)}
                              loading={loadingDeltaByBooking[id]}
                            >
                              LOAD DELTA CHECK
                            </GlassButton>
                            <GlassButton
                              variant="tertiary"
                              size="sm"
                              className="!rounded-xl !font-black"
                              onClick={() => handlePreviewReport(id)}
                              icon={<FileText className="w-4 h-4" />}
                            >
                              PREVIEW REPORT
                            </GlassButton>
                          </div>

                          {deltaByBooking[id] && (
                            <div className="bg-white border border-slate-200 rounded-xl p-3">
                              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Delta Check</p>
                              {deltaByBooking[id].length === 0 ? (
                                <p className="text-xs text-slate-500">No previous results available.</p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-xs">
                                    <thead>
                                      <tr className="border-b border-slate-200 text-slate-500">
                                        <th className="text-left py-2 pr-3">Parameter</th>
                                        <th className="text-left py-2 pr-3">Date</th>
                                        <th className="text-left py-2 pr-3">Value</th>
                                        <th className="text-left py-2 pr-3">Unit</th>
                                        <th className="text-left py-2 pr-3">Flag</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {deltaByBooking[id].map((entry, idx) => (
                                        <tr key={`${entry.bookingId}-${idx}`} className="border-b border-slate-100">
                                          <td className="py-2 pr-3 font-semibold text-slate-700">{entry.parameterName}</td>
                                          <td className="py-2 pr-3 text-slate-600">{entry.bookingDate}</td>
                                          <td className="py-2 pr-3 text-slate-700">{entry.value}</td>
                                          <td className="py-2 pr-3 text-slate-600">{entry.unit}</td>
                                          <td className="py-2 pr-3 text-slate-700 font-semibold">{entry.flag}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}

                          <div>
                            <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-widest">
                              Clinical Notes (Mandatory - Min 10 chars)
                            </label>
                            <textarea
                              value={remarks[id] || ''}
                              onChange={(e) => setRemarks((prev) => ({ ...prev, [id]: e.target.value }))}
                              placeholder="Enter medical officer clinical notes..."
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/10 min-h-[100px] bg-white"
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleVerify(id)}
                              disabled={actioning === id || (remarks[id]?.trim().length || 0) < 10}
                              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black hover:bg-emerald-700 disabled:opacity-50 transition-all"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Verify ✓
                            </button>
                            <button
                              onClick={() => setRejectModeByBooking((prev) => ({ ...prev, [id]: !prev[id] }))}
                              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-black hover:bg-red-50 transition-all"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject ✗
                            </button>

                            {(cardStatus === 'VERIFIED' || cardStatus === 'COMPLETED') && (
                              <button
                                onClick={() => handleSendToPatient(id)}
                                disabled={sendingBookingId === id || cardStatus === 'COMPLETED'}
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black hover:bg-emerald-700 disabled:opacity-50 transition-all"
                              >
                                {sendingBookingId === id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Send Report to Patient
                              </button>
                            )}
                          </div>

                          {rejectMode && (
                            <div className="pt-2 border-t border-slate-200/50">
                              <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Rejection Reason</label>
                              <input
                                value={rejectReasonByBooking[id] || ''}
                                onChange={(e) => setRejectReasonByBooking((prev) => ({ ...prev, [id]: e.target.value }))}
                                placeholder="Reason for rejection"
                                className="w-full px-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400 bg-white"
                              />
                              <div className="mt-2">
                                <button
                                  onClick={() => handleReject(id)}
                                  disabled={actioning === id}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-700 disabled:opacity-50"
                                >
                                  <XCircle className="w-4 h-4" /> Confirm Rejection
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </GlassCard>
                  );
                })}

                {pendingPage + 1 < pendingTotalPages && (
                  <div className="pt-2">
                    <GlassButton
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      variant="tertiary"
                      size="sm"
                      className="w-full !rounded-xl !font-black !tracking-[0.16em]"
                      icon={loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    >
                      {loadingMore ? 'LOADING DATA...' : 'LOAD MORE'}
                    </GlassButton>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'assignments' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[clamp(1rem,0.92rem+0.32vw,1.2rem)] font-black text-[#164E63] uppercase tracking-tight">
                New Bookings ({filteredUnassigned.length})
              </h2>
              <GlassButton
                onClick={() => loadUnassignedBookings()}
                disabled={loadingUnassigned}
                size="sm"
                icon={<RefreshCw className={`w-4 h-4 ${loadingUnassigned ? 'animate-spin' : ''}`} />}
              >
                REFRESH
              </GlassButton>
            </div>

            {loadingUnassigned ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse h-32" />)}
              </div>
            ) : filteredUnassigned.length === 0 ? (
              <GlassCard className="!p-10 text-center" animate={false}>
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-semibold">All bookings have technicians assigned</p>
                <p className="text-slate-400 text-sm mt-1">No new tasks found.</p>
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {filteredUnassigned.map((booking) => {
                  const techs = techniciansByDate[booking.bookingDate] || [];
                  const isAssigning = assigningBooking === booking.id;
                  const selectedTech = selectedTechByBooking[booking.id];

                  return (
                    <GlassCard key={booking.id} className="!p-0 overflow-hidden" animate={false}>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-black text-slate-400">#{booking.id}</span>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 uppercase tracking-wider">
                                Unassigned
                              </span>
                            </div>
                            <p className="font-extrabold text-[#164E63] text-base tracking-tight mb-2">{booking.testName || 'Lab Test'}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs text-slate-600">
                              <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="font-medium truncate">{booking.patientName || 'Patient'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{booking.bookingDate}{booking.timeSlot ? ` · ${booking.timeSlot}` : ''}</span>
                              </div>
                              {booking.collectionAddress && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{booking.collectionAddress}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 pb-4 pt-0 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex-1 w-full">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Assign Technician</label>
                          {loadingTechsByDate[booking.bookingDate] ? (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading technicians...
                            </div>
                          ) : (
                            <select
                              id={`tech-select-${booking.id}`}
                              value={selectedTech ?? ''}
                              onChange={(e) => setSelectedTechByBooking((prev) => ({ ...prev, [booking.id]: Number(e.target.value) }))}
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                            >
                              <option value="">— Select technician —</option>
                              {techs.length === 0 && <option value="" disabled>No technicians available</option>}
                              {techs.map((tech) => (
                                <option key={tech.userId} value={tech.userId}>
                                  {tech.name}
                                  {tech.bookingCountForDate > 0
                                    ? ` (${tech.bookingCountForDate} booking${tech.bookingCountForDate !== 1 ? 's' : ''} today)`
                                    : ' (free today)'}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        <button
                          id={`assign-btn-${booking.id}`}
                          onClick={() => handleAssignTechnician(booking.id)}
                          disabled={isAssigning || !selectedTech}
                          className="flex items-center gap-2 px-5 py-2 bg-cyan-600 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-cyan-700 disabled:opacity-50 transition-all whitespace-nowrap mt-4 sm:mt-0 self-end sm:self-auto"
                        >
                          {isAssigning ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Assigning...</> : <><UserCheck className="w-3.5 h-3.5" /> Assign</>}
                        </button>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {previewAnalysis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Clinical Report Preview</h3>
              <button onClick={() => setPreviewAnalysis(null)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors" title="Close">
                <XCircle className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              <SmartReportViewer analysis={previewAnalysis} />
            </div>
            <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
              <button
                onClick={() => setPreviewAnalysis(null)}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {loadingPreview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-cyan-600 animate-spin" />
            <span className="text-xs font-black text-cyan-800 uppercase tracking-widest">Generating Live Preview...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalOfficerDashboardPage;
