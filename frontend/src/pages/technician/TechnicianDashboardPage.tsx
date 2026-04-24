import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin, Clock, CheckCircle2,
  AlertCircle, User, Phone, RefreshCw, Search, XCircle, FlaskConical
} from 'lucide-react';
import { technicianService, getTechnicianBookings } from '../../services/technicianService';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import SkeletonBlock from '../../components/common/SkeletonBlock';

// Status badge config
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  BOOKED: { label: 'Pending', bg: '#FFF7ED', color: '#C2410C' },
  CONFIRMED: { label: 'Pending', bg: '#FFF7ED', color: '#C2410C' },
  REFLEX_PENDING: { label: 'Reflex Pending', bg: '#EEF2FF', color: '#3730A3' },
  SAMPLE_COLLECTED: { label: 'Collected', bg: '#F0FDF4', color: '#16A34A' },
  PROCESSING: { label: 'Processing', bg: '#F5F3FF', color: '#7C3AED' },
  PENDING_VERIFICATION: { label: 'Pending Review', bg: '#FFFBEB', color: '#D97706' },
  VERIFIED: { label: 'MO Verified', bg: '#F0FDF4', color: '#15803D' },
  COMPLETED: { label: 'Completed', bg: '#F0FDF4', color: '#15803D' },
  CANCELLED: { label: 'Cancelled', bg: '#FFF1F2', color: '#BE123C' },
};

const REJECTION_REASONS = [
  'HEMOLYZED',
  'INSUFFICIENT_VOLUME',
  'LABELING_MISMATCH',
  'CLOTTED',
  'WRONG_CONTAINER',
  'PATIENT_UNAVAILABLE',
  'ADDRESS_MISMATCH',
  'OTHER'
] as const;

const TECH_NODES = [
  { key: 1, label: 'Sample\nPending', icon: '🩸' },
  { key: 2, label: 'Collected', icon: '✓' },
  { key: 3, label: 'In Lab', icon: '⚗️' },
  { key: 4, label: 'Results\nEntered', icon: '📋' },
  { key: 5, label: 'Sent to MO', icon: '📤' },
];

const getTechNodeIndex = (status: string, resultsEntered: boolean) => {
  if (status === 'VERIFIED' || status === 'COMPLETED') return 6;
  if (status === 'PENDING_VERIFICATION') return 6;
  if (status === 'PENDING') return 5;
  if (status === 'PROCESSING' && resultsEntered) return 4;
  if (status === 'PROCESSING') return 3;
  if (status === 'SAMPLE_COLLECTED') return 2;
  return 1;
};

const isTechNodeLate = (booking: any, nodeIndex: number, currentNode: number) => {
  if (nodeIndex > currentNode) return false;
  if (!booking.bookingDate) return false;
  const bookingDay = new Date(booking.bookingDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return bookingDay < today && nodeIndex === currentNode;
};

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

const getDateAgeDays = (value?: string) => {
  const normalized = normalizeDateForFilter(value);
  if (!normalized) return 0;
  const parsed = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return 0;
  const diff = Date.now() - parsed.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

const getAreaGroupKey = (booking: any) => {
  const area = String(
    booking?.city ||
    booking?.address?.city ||
    booking?.collectionAddress ||
    booking?.address ||
    'Unknown Area'
  ).trim();
  if (!area) return 'Unknown Area';
  return area.split(',')[0].trim() || 'Unknown Area';
};

const getTechnicianPriorityScore = (booking: any, hasEnteredResults: boolean, consentRequired: boolean, consentCaptured: boolean) => {
  const ageDays = getDateAgeDays(booking.bookingDate);
  const status = String(booking.status || '').toUpperCase();
  let score = 0;

  if (ageDays >= 2) score += 40;
  if (booking.criticalFlag || booking.anyResultAbnormal) score += 40;
  if (consentRequired && !consentCaptured) score += 35;

  if (status === 'BOOKED' || status === 'REFLEX_PENDING') score += 55;
  if (status === 'SAMPLE_COLLECTED') score += 45;
  if (status === 'PROCESSING' && !hasEnteredResults) score += 60;
  if (status === 'PROCESSING' && hasEnteredResults) score += 20;
  if (status === 'PENDING_VERIFICATION' || status === 'VERIFIED') score += 10;

  return score;
};

const getTechnicianPriorityReason = (booking: any, hasEnteredResults: boolean, consentRequired: boolean, consentCaptured: boolean) => {
  const reasons: string[] = [];
  const ageDays = getDateAgeDays(booking.bookingDate);
  const status = String(booking.status || '').toUpperCase();

  if (consentRequired && !consentCaptured) reasons.push('Consent pending');
  if (status === 'BOOKED' || status === 'REFLEX_PENDING') reasons.push('Ready for collection');
  if (status === 'SAMPLE_COLLECTED') reasons.push('Move to processing');
  if (status === 'PROCESSING' && !hasEnteredResults) reasons.push('Enter results');
  if (status === 'PROCESSING' && hasEnteredResults) reasons.push('Send to MO');
  if (booking.criticalFlag || booking.anyResultAbnormal) reasons.push('Critical case');
  if (ageDays >= 2) reasons.push(`${ageDays} day${ageDays === 1 ? '' : 's'} old`);

  if (reasons.length === 0) reasons.push('In progress');
  return reasons.slice(0, 2).join(' · ');
};

type ConsentStatus = {
  bookingId: number;
  testName: string;
  consentRequired: boolean;
  consentCaptured: boolean;
  consentGiven: boolean;
  consentTimestamp?: string;
  collectorId?: number;
  collectorName?: string;
};

type TechnicianDashboardPageProps = {
  forcedTab?: 'today' | 'pending' | 'inlab' | 'review' | 'completed';
  lockTab?: boolean;
  pageHeading?: React.ReactNode;
  breadcrumbLabel?: string;
  pageSubtext?: string;
};

const TechnicianDashboardPage: React.FC<TechnicianDashboardPageProps> = ({
  forcedTab,
  lockTab = false,
  pageHeading,
  breadcrumbLabel,
  pageSubtext
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const querySearch = searchParams.get('search') || '';
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [resultModal, setResultModal] = useState<{
    bookingId: number;
    testId: number | null;
    testName: string;
  } | null>(null);
  const [parameters, setParameters] = useState<any[]>([]);
  const [resultValues, setResultValues] = useState<Record<number, string>>({});
  const [savingResults, setSavingResults] = useState(false);
  const [resultsEnteredMap, setResultsEnteredMap] = useState<Record<number, boolean>>({});
  const [sendingToMOId, setSendingToMOId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [consentByBookingId, setConsentByBookingId] = useState<Record<number, ConsentStatus>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [areaFilter, setAreaFilter] = useState('');
  const [timeline, setTimeline] = useState<Record<number, Record<number, string>>>({});
  const [historyPage, setHistoryPage] = useState(1);
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(null);
  const [selectedBookingIds, setSelectedBookingIds] = useState<number[]>([]);
  const [batchUpdating, setBatchUpdating] = useState(false);
  const [groupByMode, setGroupByMode] = useState<'DATE' | 'AREA'>('DATE');
  const [exceptionQueue, setExceptionQueue] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, bookingsResp, rejectedResp] = await Promise.all([
        technicianService.getDashboardStats(),
        getTechnicianBookings(),
        technicianService.getRejectedSpecimens(),
      ]);
      setStats(statsData || {});
      const raw = bookingsResp.data?.data || bookingsResp.data || [];
      const normalizedBookings = Array.isArray(raw) ? raw : [];
      setBookings(normalizedBookings);
      setExceptionQueue(Array.isArray(rejectedResp) ? rejectedResp : []);
      setSelectedBookingIds([]);

      const timelineFetches = await Promise.allSettled(
        normalizedBookings.map(async (b: any) => {
          try {
            const resp = await technicianService.getBookingTimeline(b.id);
            const logs = resp || [];
            const map: Record<number, string> = {};
            logs.forEach((l: any) => {
              if (l.action === 'BOOKED') map[1] = l.timestamp;
              if (String(l.details || '').includes('SAMPLE_COLLECTED')) map[2] = l.timestamp;
              if (String(l.details || '').includes('PROCESSING') &&
                !String(l.details || '').includes('results')) map[3] = l.timestamp;
              if (String(l.details || '').includes('results entered')) map[4] = l.timestamp;
              if (String(l.details || '').includes('PENDING_VERIFICATION')) map[5] = l.timestamp;
            });
            return { id: b.id, map };
          } catch {
            return { id: b.id, map: {} };
          }
        })
      );

      const timelineMap: Record<number, Record<number, string>> = {};
      timelineFetches.forEach((r) => {
        if (r.status === 'fulfilled') timelineMap[r.value.id] = r.value.map;
      });
      setTimeline(timelineMap);

      const processingBookings = normalizedBookings.filter((b: any) => b.status === 'PROCESSING');
      if (processingBookings.length === 0) {
        setResultsEnteredMap({});
      } else {
        const resultsChecks = await Promise.allSettled(
          processingBookings.map(async (b: any) => ({
            id: b.id,
            hasResults: await technicianService.checkResultsEntered(b.id)
          }))
        );

        const resultsMap: Record<number, boolean> = {};

        resultsChecks.forEach((r) => {
          if (r.status === 'fulfilled') {
            resultsMap[r.value.id] = r.value.hasResults;
          }
        });

        setResultsEnteredMap(resultsMap);
      }

      const collectibleBookings = normalizedBookings.filter((b: any) =>
        b.status === 'BOOKED' || b.status === 'REFLEX_PENDING'
      );
      if (collectibleBookings.length === 0) {
        setConsentByBookingId({});
      } else {
        const consentChecks = await Promise.all(
          collectibleBookings.map(async (b: any) => {
            try {
              const status = await technicianService.getConsentStatus(b.id);
              return { bookingId: b.id, status };
            } catch {
              return { bookingId: b.id, status: null };
            }
          })
        );
        const consentMap: Record<number, ConsentStatus> = {};
        consentChecks.forEach(({ bookingId, status }) => {
          if (status) {
            consentMap[bookingId] = status as ConsentStatus;
          }
        });
        setConsentByBookingId(consentMap);
      }
    } catch (err) {
      toast.error('Failed to load bookings');
      setBookings([]);
      setResultsEnteredMap({});
      setConsentByBookingId({});
      setTimeline({});
      setExceptionQueue([]);
      setSelectedBookingIds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    setSearchTerm(querySearch);
  }, [querySearch]);

  useEffect(() => {
    if (lockTab) {
      setStatusFilter('ALL');
    }
  }, [lockTab, forcedTab]);

  const scopeLabel = useMemo(() => {
    if (forcedTab === 'pending') return 'My Tasks';
    if (forcedTab === 'inlab') return 'Results';
    if (forcedTab === 'review') return 'Sent to MO';
    if (forcedTab === 'completed') return 'History';
    if (forcedTab === 'today') return 'Today Tasks';
    return 'Active Cases';
  }, [forcedTab]);

  const currentPageLabel = useMemo(() => {
    if (breadcrumbLabel) return breadcrumbLabel;
    if (forcedTab === 'today') return 'Today';
    if (forcedTab === 'pending') return 'My Tasks';
    if (forcedTab === 'inlab') return 'Results';
    if (forcedTab === 'review') return 'Sent to MO';
    if (forcedTab === 'completed') return 'History';
    return 'Dashboard';
  }, [breadcrumbLabel, forcedTab]);

  const scopedStatusSet = useMemo<Set<string> | null>(() => {
    if (forcedTab === 'pending') {
      return new Set(['BOOKED', 'CONFIRMED', 'REFLEX_PENDING', 'SAMPLE_COLLECTED', 'PROCESSING']);
    }
    if (forcedTab === 'inlab') {
      return new Set(['PROCESSING']);
    }
    if (forcedTab === 'review') {
      return new Set(['PENDING_VERIFICATION', 'PENDING', 'VERIFIED']);
    }
    if (forcedTab === 'completed') {
      // History page should show full history: old/new/all statuses.
      return null;
    }
    if (forcedTab === 'today') {
      return new Set(['BOOKED', 'CONFIRMED', 'REFLEX_PENDING', 'SAMPLE_COLLECTED', 'PROCESSING', 'PENDING_VERIFICATION']);
    }
    // Default dashboard shows actionable work only.
    return new Set(['BOOKED', 'CONFIRMED', 'REFLEX_PENDING', 'SAMPLE_COLLECTED', 'PROCESSING']);
  }, [forcedTab]);

  const findAssignedBookingById = useCallback((bookingId: number) => {
    return bookings.find((b: any) => b.id === bookingId);
  }, [bookings]);

  const handleMarkCollected = async (bookingId: number) => {
    const booking = findAssignedBookingById(bookingId);
    if (!booking || !['BOOKED', 'REFLEX_PENDING'].includes(String(booking.status))) {
      toast.error('Invalid transition: only booked/reflex pending samples can be collected');
      return;
    }
    setUpdating(bookingId);
    try {
      await technicianService.updateCollectionStatus(bookingId);
      toast.success('Sample marked as collected!');
      loadData();
    } catch {
      toast.error('Failed to update status');
    } finally { setUpdating(null); }
  };

  const handleMarkProcessing = async (bookingId: number) => {
    const booking = findAssignedBookingById(bookingId);
    if (!booking || String(booking.status) !== 'SAMPLE_COLLECTED') {
      toast.error('Invalid transition: only collected samples can move to processing');
      return;
    }
    setUpdating(bookingId);
    try {
      await technicianService.updateBookingStatus(bookingId, 'PROCESSING');
      toast.success('Booking marked as processing!');
      loadData();
    } catch {
      toast.error('Failed to update status');
    } finally { setUpdating(null); }
  };

  const resolveBookingTestId = (booking: any): number | null => {
    const candidates = [
      booking?.labTestId,
      booking?.testId,
      booking?.test?.id,
      booking?.labTest?.id,
      booking?.report?.testId
    ];

    for (const value of candidates) {
      const id = Number(value);
      if (Number.isFinite(id) && id > 0) return id;
    }
    return null;
  };

  const handleOpenResultEntry = async (booking: any) => {
    let testId = resolveBookingTestId(booking);

    // Fallback: map by name when booking payload misses test id.
    if (!testId) {
      testId = await technicianService.findTestIdByName(
        booking.testName || booking.labTestName || ''
      );
    }

    const params = testId
      ? await technicianService.getTestParameters(testId)
      : [];

    if (!testId) {
      toast.error('Test mapping missing for this booking. Contact admin to map lab test.');
    }

    setParameters(Array.isArray(params) ? params : []);
    setResultValues({});
    setResultModal({
      bookingId: booking.id,
      testId,
      testName: booking.testName || booking.labTestName || booking.packageName || 'Lab Test'
    });
  };

  const handleSaveResults = async () => {
    if (!resultModal) return;

    const entries = Object.entries(resultValues).filter(([, value]) => String(value).trim() !== '');
    if (entries.length === 0) {
      toast.error('Enter at least one result value');
      return;
    }

    const results = entries.map(([parameterId, resultValue]) => ({
      parameterId: Number(parameterId),
      resultValue: String(resultValue).trim()
    }));

    setSavingResults(true);
    try {
      await technicianService.enterTestResults(resultModal.bookingId, results);
      setResultsEnteredMap(prev => ({ ...prev, [resultModal.bookingId]: true }));
      toast.success('✅ Results saved. Now click "Send to MO".');
      setResultModal(null);
      setParameters([]);
      setResultValues({});
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to save results');
    } finally {
      setSavingResults(false);
    }
  };

  const handleSendToMO = async (bookingId: number) => {
    if (!resultsEnteredMap[bookingId]) {
      toast.error('Save results before sending to Medical Officer');
      return;
    }

    setSendingToMOId(bookingId);
    try {
      await technicianService.updateBookingStatus(bookingId, 'PENDING_VERIFICATION');
      toast.success('✅ Sent to Medical Officer for verification.');
      setBookings((prev) => prev.map((b) =>
        b.id === bookingId ? { ...b, status: 'PENDING_VERIFICATION' } : b
      ));
      await loadData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to send to Medical Officer');
    } finally {
      setSendingToMOId(null);
    }
  };

  const handleRejectSpecimen = async (bookingId: number, reason: string, notes?: string) => {
    const booking = findAssignedBookingById(bookingId);
    if (!booking || !['BOOKED', 'SAMPLE_COLLECTED'].includes(String(booking.status))) {
      toast.error('Invalid transition: rejection is allowed only for booked/collected samples');
      return;
    }

    setRejectingId(bookingId);
    try {
      await technicianService.rejectSpecimen(bookingId, reason, notes);
      toast.success('Sample rejected — patient and admin notified');
      await loadData();
    } catch {
      toast.error('Failed to reject sample');
    } finally {
      setRejectingId(null);
    }
  };

  const handleQuickReject = async (bookingId: number) => {
    const rawReason = window.prompt(
      `Enter reason code:\n${REJECTION_REASONS.join(', ')}`,
      'OTHER'
    );
    if (rawReason === null) return;
    const normalized = rawReason.trim().toUpperCase().replace(/\s+/g, '_');
    const reason = REJECTION_REASONS.includes(normalized as any) ? normalized : 'OTHER';
    const notes = reason === 'OTHER'
      ? rawReason.trim()
      : (window.prompt('Optional notes for rejection:', '') || '').trim();
    await handleRejectSpecimen(bookingId, reason, notes);
  };

  const toggleSelectedBooking = (bookingId: number) => {
    setSelectedBookingIds((prev) => (
      prev.includes(bookingId)
        ? prev.filter((id) => id !== bookingId)
        : [...prev, bookingId]
    ));
  };

  const handleBatchMarkCollected = async () => {
    const eligible = selectedBookings.filter((booking: any) => {
      const status = String(booking.status || '').toUpperCase();
      return status === 'BOOKED' || status === 'REFLEX_PENDING';
    });

    if (eligible.length === 0) {
      toast.error('No selected bookings are eligible for batch collection');
      return;
    }

    setBatchUpdating(true);
    try {
      await Promise.all(eligible.map((booking: any) => technicianService.updateCollectionStatus(booking.id)));
      toast.success(`Marked ${eligible.length} sample(s) as collected`);
      await loadData();
    } catch {
      toast.error('Batch collection update failed');
    } finally {
      setBatchUpdating(false);
    }
  };

  const handleBatchStartProcessing = async () => {
    const eligible = selectedBookings.filter((booking: any) => String(booking.status || '').toUpperCase() === 'SAMPLE_COLLECTED');

    if (eligible.length === 0) {
      toast.error('No selected bookings are eligible for processing');
      return;
    }

    setBatchUpdating(true);
    try {
      await Promise.all(eligible.map((booking: any) => technicianService.updateBookingStatus(booking.id, 'PROCESSING')));
      toast.success(`Moved ${eligible.length} sample(s) to processing`);
      await loadData();
    } catch {
      toast.error('Batch processing update failed');
    } finally {
      setBatchUpdating(false);
    }
  };

  const pendingBookings = bookings.filter((b) =>
    b.status === 'BOOKED' || b.status === 'CONFIRMED' || b.status === 'REFLEX_PENDING' || b.status === 'SAMPLE_COLLECTED' || b.status === 'PROCESSING'
  );
  const collectedBookings = bookings.filter((b) => b.status === 'SAMPLE_COLLECTED');
  const processingBookings = bookings.filter((b) => b.status === 'PROCESSING');
  const sentForReviewBookings = bookings.filter((b) =>
    b.status === 'PENDING_VERIFICATION' || b.status === 'VERIFIED'
  );
  const completedBookings = bookings.filter((b) =>
    b.status === 'COMPLETED' || b.status === 'VERIFIED' || b.status === 'SAMPLE_COLLECTED'
  );

  const statusSelectDisabled = Boolean(lockTab && scopedStatusSet);
  const isMainDashboard = !forcedTab;
  const showHero = isMainDashboard;
  const showDefaultFilters = forcedTab !== 'today' && forcedTab !== 'completed';
  const showHistorySearch = forcedTab === 'completed';

  const displayBookings = bookings.filter((b: any) => {
    const q = searchTerm.trim().toLowerCase();
    const area = areaFilter.trim().toLowerCase();
    const dynamicBlob = JSON.stringify(b || {}).toLowerCase();
    const normalizedAddress = typeof b.address === 'object'
      ? [
        b.address?.line1,
        b.address?.line2,
        b.address?.street,
        b.address?.city,
        b.address?.state,
        b.address?.pincode,
      ].filter(Boolean).join(' ')
      : b.address;
    const searchHaystack = [
      b.id,
      b.bookingId,
      b.bookingReference,
      b.reference,
      b.patientName,
      b.patientId,
      b.patient?.name,
      b.patientPhone,
      b.phone,
      b.testName,
      b.labTestName,
      b.packageName,
      b.bookingDate,
      b.status,
      b.collectionAddress,
      b.city,
      normalizedAddress,
      b.pincode,
    ]
      .map((x) => String(x || '').toLowerCase())
      .join(' ');
    const searchMatch = !q || searchHaystack.includes(q) || dynamicBlob.includes(q);
    const dateMatch = !dateFilter || normalizeDateForFilter(b.bookingDate) === normalizeDateForFilter(dateFilter);
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayMatch = forcedTab !== 'today' || String(b.bookingDate || '').startsWith(todayStr);
    const scopeMatch = !scopedStatusSet || scopedStatusSet.has(String(b.status || ''));
    const statusMatch = statusSelectDisabled || statusFilter === 'ALL' || String(b.status || '') === statusFilter;
    const areaValue = [
      b.collectionAddress,
      b.city,
      b.address?.city,
      normalizedAddress,
      b.pincode,
    ]
      .map((x) => String(x || '').toLowerCase())
      .join(' ');
    const areaMatch = !area || areaValue.includes(area) || dynamicBlob.includes(area);
    return searchMatch && dateMatch && todayMatch && statusMatch && areaMatch && scopeMatch;
  });

  const selectedBookings = useMemo(() => {
    return displayBookings.filter((booking: any) => selectedBookingIds.includes(booking.id));
  }, [displayBookings, selectedBookingIds]);

  const priorityBookings = useMemo(() => {
    return [...displayBookings]
      .filter((booking: any) => String(booking.status || '').toUpperCase() !== 'COMPLETED' && String(booking.status || '').toUpperCase() !== 'CANCELLED')
      .sort((a: any, b: any) => {
        const aConsent = consentByBookingId[a.id];
        const bConsent = consentByBookingId[b.id];
        const aScore = getTechnicianPriorityScore(a, Boolean(resultsEnteredMap[a.id]), Boolean(aConsent?.consentRequired), Boolean(aConsent?.consentCaptured && aConsent?.consentGiven));
        const bScore = getTechnicianPriorityScore(b, Boolean(resultsEnteredMap[b.id]), Boolean(bConsent?.consentRequired), Boolean(bConsent?.consentCaptured && bConsent?.consentGiven));
        return bScore - aScore;
      })
      .slice(0, 4);
  }, [consentByBookingId, displayBookings, resultsEnteredMap]);

  const overdueBookings = useMemo(() => {
    return displayBookings.filter((booking: any) => {
      const status = String(booking.status || '').toUpperCase();
      const ageDays = getDateAgeDays(booking.bookingDate);
      return ageDays >= 2 && !['COMPLETED', 'CANCELLED'].includes(status);
    });
  }, [displayBookings]);

  const productivityStats = useMemo(() => {
    const todayKey = normalizeDateForFilter(new Date().toISOString());
    const handledToday = displayBookings.filter((booking: any) => {
      const bookingDate = normalizeDateForFilter(booking.bookingDate);
      const status = String(booking.status || '').toUpperCase();
      return bookingDate === todayKey && !['BOOKED', 'CONFIRMED', 'CANCELLED'].includes(status);
    }).length;

    const completedLike = displayBookings.filter((booking: any) => {
      const status = String(booking.status || '').toUpperCase();
      return status === 'COMPLETED' || status === 'PENDING_VERIFICATION' || status === 'VERIFIED';
    });

    const avgTurnaroundDays = completedLike.length > 0
      ? Number((completedLike.reduce((sum: number, booking: any) => sum + getDateAgeDays(booking.bookingDate), 0) / completedLike.length).toFixed(1))
      : 0;

    const onTimeRate = completedLike.length > 0
      ? Math.round((completedLike.filter((booking: any) => getDateAgeDays(booking.bookingDate) <= 2).length / completedLike.length) * 100)
      : 0;

    return { handledToday, avgTurnaroundDays, onTimeRate };
  }, [displayBookings]);

  const exceptionStats = useMemo(() => {
    const rejected = exceptionQueue.length;
    const rerun = displayBookings.filter((booking: any) => {
      const status = String(booking.status || '').toUpperCase();
      return status === 'REFLEX_PENDING' || Boolean(booking.previouslyRejected);
    }).length;
    const damaged = exceptionQueue.filter((entry: any) => String(entry?.reason || entry?.status || '').toUpperCase().includes('DAMAGED')).length;
    return { rejected, rerun, damaged };
  }, [displayBookings, exceptionQueue]);

  const HISTORY_PAGE_SIZE = 5;
  const totalHistoryPages = Math.max(1, Math.ceil(displayBookings.length / HISTORY_PAGE_SIZE));
  const pagedBookings = useMemo(() => {
    if (forcedTab !== 'completed') return displayBookings;
    const start = (historyPage - 1) * HISTORY_PAGE_SIZE;
    return displayBookings.slice(start, start + HISTORY_PAGE_SIZE);
  }, [displayBookings, forcedTab, historyPage]);

  const groupedBookings = useMemo(() => {
    const groups = pagedBookings.reduce((acc: Record<string, any[]>, booking: any) => {
      const key = groupByMode === 'AREA'
        ? getAreaGroupKey(booking)
        : (booking.bookingDate || 'No Date');
      if (!acc[key]) acc[key] = [];
      acc[key].push(booking);
      return acc;
    }, {});
    const sorted = Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
    if (forcedTab === 'completed') {
      return sorted.reverse();
    }
    return sorted;
  }, [forcedTab, groupByMode, pagedBookings]);

  useEffect(() => {
    setHistoryPage(1);
  }, [searchTerm, dateFilter, areaFilter, statusFilter, forcedTab]);

  return (
    <div className="max-w-[1140px] w-full mx-auto px-5 md:px-6 lg:px-8 py-5 md:py-6 min-h-screen">
      {showHero && (
        <header className="mb-6">
          <div className="rounded-2xl px-2 md:px-0 py-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-800/55 mb-2">
                Staff Tasks
              </p>
              <h2 className="text-[clamp(1.55rem,1.05rem+1.35vw,2.35rem)] font-black text-[#164E63] tracking-tight uppercase leading-none">
                Welcome, <span className="text-cyan-600">
                  {currentUser?.name?.split(' ')[0] || currentUser?.email?.split('@')[0]}
                </span>
              </h2>
              <p className="text-[clamp(0.82rem,0.76rem+0.35vw,0.96rem)] text-cyan-900/60 font-medium mt-2">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long'
                })}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Pending', value: pendingBookings.length, color: 'text-amber-300', status: 'BOOKED' },
                { label: 'Collected', value: collectedBookings.length, color: 'text-emerald-300', status: 'SAMPLE_COLLECTED' },
                { label: 'In Lab', value: processingBookings.length, color: 'text-violet-300', status: 'PROCESSING' },
                { label: 'Completed', value: completedBookings.length, color: 'text-cyan-300', status: 'COMPLETED' },
              ].map((s) => (
                <button
                  type="button"
                  key={s.label}
                  onClick={() => {
                    if (!isMainDashboard) return;
                    setStatusFilter(s.status);
                  }}
                  className={`text-center px-4 py-2 bg-white/80 rounded-xl border border-cyan-100 shadow-sm transition-all ${isMainDashboard ? 'hover:border-cyan-300 cursor-pointer' : 'cursor-default'
                    }`}
                >
                  <div className={`text-xl font-black ${s.color}`}>
                    {loading ? '—' : s.value}
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                    {s.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </header>
      )}

      {!isMainDashboard && (
        <header className="mb-6">
          <div className="mb-4 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-800/55">
            <Link to="/" className="hover:text-cyan-700 transition-colors">Home</Link>
            <span className="mx-1 text-cyan-700/35">›</span>
            <span className="text-cyan-700">{currentPageLabel}</span>
          </div>
          <h1 className="text-[clamp(1.45rem,1.05rem+1.2vw,2.2rem)] font-black text-[#164E63] tracking-tight mb-2 uppercase">
            {pageHeading || <>{scopeLabel}</>}
          </h1>
          <p className="text-[clamp(0.8rem,0.75rem+0.28vw,0.92rem)] text-cyan-900/60 font-medium leading-relaxed">
            {pageSubtext || `Manage ${scopeLabel.toLowerCase()} and booking workflow.`}
          </p>
        </header>
      )}

      <div>
        <div className="flex justify-end mb-4">
          <GlassButton onClick={loadData} className="h-full px-4.5 py-2.5" icon={<RefreshCw className="w-3.5 h-3.5" />}>
            REFRESH
          </GlassButton>
        </div>

        {showDefaultFilters && (
          <GlassCard className="mb-4 border-cyan-100/30">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[260px]">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Search Bookings</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600/50" size={18} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by patient, booking ID or test"
                    className="w-full bg-white/50 border border-white/50 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-500/5 rounded-xl pl-10 pr-3 py-2 text-[13px] font-medium transition-all"
                  />
                </div>
              </div>
              <div className="min-w-[160px]">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full bg-white/50 border border-white/50 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-500/5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all"
                />
              </div>
              {(searchTerm.trim() || dateFilter) && (
                <div>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setDateFilter('');
                    }}
                    className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    title="Clear Filters"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {showHistorySearch && (
          <GlassCard className="mb-4 border-cyan-100/30">
            <div className="flex items-end gap-4">
              <div className="w-full md:w-[420px]">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Search History</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600/50" size={18} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by patient, booking ID or test"
                    className="w-full bg-white/50 border border-white/50 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-500/5 rounded-xl pl-10 pr-3 py-2 text-[13px] font-medium transition-all"
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {selectedBookingIds.length > 0 && (
          <GlassCard className="mb-4 border-cyan-100/30" animate={false}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-800/50 mb-1">Batch Actions</p>
                <p className="text-sm font-semibold text-slate-700">{selectedBookingIds.length} booking(s) selected</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleBatchMarkCollected()}
                  disabled={batchUpdating}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-[11px] font-black uppercase tracking-[0.12em] hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                  {batchUpdating ? 'Updating...' : 'Mark Collected'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleBatchStartProcessing()}
                  disabled={batchUpdating}
                  className="px-3.5 py-2 rounded-xl bg-violet-600 text-white text-[11px] font-black uppercase tracking-[0.12em] hover:bg-violet-700 transition-all disabled:opacity-50"
                >
                  {batchUpdating ? 'Updating...' : 'Start Processing'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBookingIds([])}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-[0.12em] hover:bg-slate-50 transition-all"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </GlassCard>
        )}

        <GlassCard className="mb-4 border-cyan-100/30" animate={false}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-800/50 mb-1.5">Priority Queue</p>
              <h2 className="text-[clamp(1rem,0.92rem+0.32vw,1.18rem)] font-black text-[#164E63] tracking-tight">
                Work that needs attention first
              </h2>
              <p className="text-xs md:text-sm text-cyan-900/60 font-medium mt-1.5">
                Overdue collection, processing, and result-entry items are surfaced before routine cases.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Overdue', value: overdueBookings.length, className: 'bg-red-50 text-red-700 border-red-200' },
                { label: 'Pending', value: pendingBookings.length, className: 'bg-amber-50 text-amber-700 border-amber-200' },
                { label: 'In Lab', value: processingBookings.length, className: 'bg-violet-50 text-violet-700 border-violet-200' },
                { label: 'Sent to MO', value: sentForReviewBookings.length, className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
              ].map((item) => (
                <div key={item.label} className={`px-3 py-2 rounded-xl border text-center min-w-[88px] ${item.className}`}>
                  <div className="text-base font-black">{loading ? '—' : item.value}</div>
                  <div className="text-[9px] uppercase font-black tracking-[0.16em] opacity-80">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {priorityBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
              {priorityBookings.map((booking: any) => {
                const status = String(booking.status || '').toUpperCase();
                const hasEnteredResults = Boolean(resultsEnteredMap[booking.id]);
                const canCollect = status === 'BOOKED' || status === 'REFLEX_PENDING';
                const canProcess = status === 'SAMPLE_COLLECTED';
                const canSendToMO = status === 'PROCESSING' && hasEnteredResults;
                const isCritical = Boolean(booking.criticalFlag || booking.anyResultAbnormal);
                const ageDays = getDateAgeDays(booking.bookingDate);
                const priorityReason = getTechnicianPriorityReason(booking, hasEnteredResults, false, false);
                const primaryAction = canCollect
                  ? { label: 'Mark collected', run: () => void handleMarkCollected(booking.id) }
                  : canProcess
                    ? { label: 'Start processing', run: () => void handleMarkProcessing(booking.id) }
                    : status === 'PROCESSING' && !hasEnteredResults
                      ? { label: 'Enter results', run: () => navigate(`/technician/results/${booking.id}`) }
                      : canSendToMO
                        ? { label: 'Send to MO', run: () => void handleSendToMO(booking.id) }
                        : { label: 'View details', run: () => setExpandedBookingId(booking.id) };

                return (
                  <GlassCard key={booking.id} className="!p-4 h-full border border-cyan-100 transition-transform hover:-translate-y-0.5 hover:shadow-lg" animate={false}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">#{booking.id}</div>
                        <h3 className="font-black text-[#164E63] tracking-tight mt-1 line-clamp-2">
                          {booking.testName || booking.packageName || 'Lab Test'}
                        </h3>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${isCritical ? 'bg-red-100 text-red-700' : status === 'PROCESSING' ? 'bg-violet-100 text-violet-700' : 'bg-cyan-100 text-cyan-700'}`}>
                        {isCritical ? 'Critical' : String(booking.status || 'BOOKED').replaceAll('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between gap-2">
                        <span>Patient</span>
                        <span className="font-bold text-slate-700 text-right">{booking.patientName || 'Patient'}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span>Priority reason</span>
                        <span className="font-bold text-slate-700 text-right">{priorityReason}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span>Age</span>
                        <span className="font-bold text-slate-700">{ageDays} day{ageDays === 1 ? '' : 's'}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          primaryAction.run();
                        }}
                        disabled={updating === booking.id || sendingToMOId === booking.id}
                        className="px-3.5 py-2 rounded-xl bg-cyan-600 text-white text-[11px] font-black uppercase tracking-[0.12em] hover:bg-cyan-700 transition-all disabled:opacity-50"
                      >
                        {updating === booking.id || sendingToMOId === booking.id ? (
                          <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          primaryAction.label
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedBookingId((prev) => (prev === booking.id ? null : booking.id))}
                        className="px-3.5 py-2 rounded-xl bg-white border border-cyan-100 text-cyan-800 text-[11px] font-black uppercase tracking-[0.12em] hover:border-cyan-300 hover:bg-cyan-50 transition-all"
                      >
                        Toggle details
                      </button>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/50 px-4 py-5 text-sm text-cyan-900/70 font-medium">
              No urgent cases right now. The current work queue is up to date.
            </div>
          )}
        </GlassCard>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <SkeletonBlock key={i} className="h-24 border border-white/30" />
            ))}
          </div>
        ) : displayBookings.length === 0 ? (
          <div className="bg-white/70 rounded-xl border border-white/50 p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No records found in {scopeLabel}.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedBookings.map(([groupDate, dayBookings]) => (
              <section key={groupDate}>
                <h3 className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 mb-3">
                  {groupByMode === 'AREA'
                    ? groupDate
                    : (groupDate === 'No Date'
                      ? 'No Date'
                      : new Date(groupDate).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }))}
                </h3>
                <div className="space-y-3">
                  {dayBookings.map((booking: any) => {
                    const s = STATUS_CONFIG[booking.status] || STATUS_CONFIG.BOOKED;
                    const canCollect = booking.status === 'BOOKED' || booking.status === 'REFLEX_PENDING';
                    const canProcess = booking.status === 'SAMPLE_COLLECTED';
                    const canReject = booking.status === 'BOOKED' || booking.status === 'SAMPLE_COLLECTED';
                    const showMarkCollected = canCollect;
                    const hasEnteredResults = Boolean(resultsEnteredMap[booking.id]);
                    const canSendToMO = booking.status === 'PROCESSING' && hasEnteredResults;
                    const mustEnterResultsFirst = booking.status === 'PROCESSING' && !hasEnteredResults;
                    const displayTimeSlot = booking.timeSlot || booking.preferredTime || 'N/A';
                    const displayAddress = booking.collectionAddress || booking.address?.city || booking.address || 'N/A';
                    const currentNode = getTechNodeIndex(String(booking.status || ''), hasEnteredResults);

                    return (
                      <div
                        key={booking.id}
                        onClick={() => setExpandedBookingId((prev) => prev === booking.id ? null : booking.id)}
                        className={`bg-white/70 backdrop-blur-md rounded-xl border p-4 hover:shadow-md transition-all cursor-pointer ${expandedBookingId === booking.id
                            ? 'border-cyan-300 ring-2 ring-cyan-100'
                            : 'border-white/60'
                          }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <input
                                type="checkbox"
                                checked={selectedBookingIds.includes(booking.id)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => toggleSelectedBooking(booking.id)}
                                className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                              />
                              <span className="text-xs font-black text-slate-400 uppercase tracking-wide">#{booking.id}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: s.bg, color: s.color }}>
                                {s.label}
                              </span>
                            </div>
                            <div className="font-bold text-slate-800 text-sm truncate mb-1">
                              {booking.testName || booking.packageName || 'Lab Test'}
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1"><User className="w-3 h-3" />{booking.patientName || 'Patient'}</span>
                              {booking.patientPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{booking.patientPhone}</span>}
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{displayTimeSlot}</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{displayAddress}</span>
                            </div>

                            <div className="mt-3 mb-2">
                              <div className="flex items-center">
                                {TECH_NODES.map((node, idx) => {
                                  const isComplete = currentNode > node.key;
                                  const isActive = currentNode === node.key;
                                  const isLate = isTechNodeLate(booking, node.key, currentNode);
                                  const isLast = idx === TECH_NODES.length - 1;

                                  return (
                                    <React.Fragment key={node.key}>
                                      <div className="flex flex-col items-center gap-1 shrink-0">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${isLate
                                            ? 'bg-red-100 border-red-400 text-red-600'
                                            : isComplete
                                              ? 'bg-emerald-500 border-emerald-500 text-white'
                                              : isActive
                                                ? 'bg-cyan-600 border-cyan-600 text-white ring-4 ring-cyan-100'
                                                : 'bg-slate-100 border-slate-200 text-slate-400'
                                          }`}>
                                          {isComplete ? '✓' : isLate ? '!' : node.icon}
                                        </div>
                                        <span className={`text-[9px] font-bold text-center leading-tight max-w-[52px] whitespace-pre-line ${isLate ? 'text-red-500' : isComplete ? 'text-emerald-600' : isActive ? 'text-cyan-700' : 'text-slate-400'
                                          }`}>
                                          {node.label}
                                        </span>
                                        {timeline[booking.id]?.[node.key] && (
                                          <span className="text-[8px] text-slate-400 font-medium">
                                            {new Date(timeline[booking.id][node.key]).toLocaleString('en-IN', {
                                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                          </span>
                                        )}
                                      </div>

                                      {!isLast && (
                                        <div className={`flex-1 h-0.5 mx-1 transition-all ${isComplete ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                            {showMarkCollected && (
                              <button
                                onClick={() => handleMarkCollected(booking.id)}
                                disabled={updating === booking.id}
                                className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition-all disabled:opacity-50">
                                {updating === booking.id ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                Mark Collected
                              </button>
                            )}
                            {canReject && (
                              <button
                                onClick={() => void handleQuickReject(booking.id)}
                                disabled={rejectingId === booking.id}
                                className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-all">
                                {rejectingId === booking.id ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <AlertCircle className="w-3 h-3" />}
                                {rejectingId === booking.id ? 'Rejecting...' : 'Reject Sample'}
                              </button>
                            )}
                            {canProcess && (
                              <button
                                onClick={() => handleMarkProcessing(booking.id)}
                                disabled={updating === booking.id}
                                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-50">
                                {updating === booking.id ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Clock className="w-3 h-3" />}
                                Start Processing
                              </button>
                            )}
                            {booking.status === 'PROCESSING' && !hasEnteredResults && (
                              <Link
                                to={`/technician/results/${booking.id}`}
                                className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-700 transition-all flex items-center justify-center inline-flex"
                              >
                                <FlaskConical className="w-3 h-3" />
                                Enter Results
                              </Link>
                            )}
                            {booking.status === 'PROCESSING' && hasEnteredResults && (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                                <CheckCircle2 className="w-3 h-3" />
                                Results Saved
                              </div>
                            )}
                            {canSendToMO && (
                              <button
                                onClick={() => handleSendToMO(booking.id)}
                                disabled={sendingToMOId === booking.id}
                                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
                              >
                                {sendingToMOId === booking.id ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                Send to MO
                              </button>
                            )}
                            {mustEnterResultsFirst && (
                              <div className="text-[10px] text-amber-600 font-bold mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Enter results before sending to MO
                              </div>
                            )}
                          </div>
                        </div>

                        {expandedBookingId === booking.id && (
                          <div className="mt-4 border-t border-slate-200 pt-4" onClick={(e) => e.stopPropagation()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="rounded-lg bg-slate-50/80 border border-slate-200 p-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Booking Info</p>
                                <p className="text-xs text-slate-700 font-semibold">Booking ID: #{booking.id}</p>
                                <p className="text-xs text-slate-600 mt-1">Date: {booking.bookingDate || 'N/A'}</p>
                                <p className="text-xs text-slate-600 mt-1">Time: {displayTimeSlot}</p>
                                <p className="text-xs text-slate-600 mt-1">Status: {String(booking.status || 'BOOKED').replaceAll('_', ' ')}</p>
                              </div>
                              <div className="rounded-lg bg-slate-50/80 border border-slate-200 p-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Patient Info</p>
                                <p className="text-xs text-slate-700 font-semibold">{booking.patientName || 'Patient'}</p>
                                <p className="text-xs text-slate-600 mt-1">Phone: {booking.patientPhone || 'N/A'}</p>
                                <p className="text-xs text-slate-600 mt-1 break-words">Address: {displayAddress}</p>
                                <p className="text-xs text-slate-600 mt-1">Test: {booking.testName || booking.packageName || 'Lab Test'}</p>
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                onClick={() => navigate(`/technician/results/${booking.id}`)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-cyan-600 text-white rounded-lg text-xs font-bold hover:bg-cyan-700 transition-all"
                              >
                                <FlaskConical className="w-3 h-3" />
                                Open Full Details
                              </button>
                              <button
                                onClick={() => setExpandedBookingId(null)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
            {forcedTab === 'completed' && totalHistoryPages > 1 && (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-slate-500 px-2">
                  Page {historyPage} / {totalHistoryPages}
                </span>
                <button
                  onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
                  disabled={historyPage === totalHistoryPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {resultModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setResultModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-slate-100 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-800">
                    Enter Test Results
                  </h2>
                  <p className="text-xs text-violet-600 font-medium mt-0.5">
                    {resultModal.testName} · Booking #{resultModal.bookingId}
                  </p>
                </div>
                <button
                  onClick={() => setResultModal(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {parameters.length === 0 ? (
                <div className="text-center py-10">
                  <FlaskConical className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-500">
                    No parameters configured for this test
                  </p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    You can still upload the PDF report directly
                  </p>
                  <button
                    onClick={() => setResultModal(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                  >
                    Close & Upload PDF
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-400 pb-1">
                    Enter values for each parameter below. Leave blank to skip.
                  </p>
                  {parameters.map((param: any) => (
                    <div key={param.id} className="p-3 bg-slate-50 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-700">
                          {param.parameterName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium bg-white px-2 py-0.5 rounded-full border border-slate-100">
                          Normal: {param.normalRangeText || `${param.normalRangeMin ?? '—'}–${param.normalRangeMax ?? '—'}`}
                          {param.unit ? ` ${param.unit}` : ''}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="Value..."
                          value={resultValues[param.id] || ''}
                          onChange={(e) => setResultValues(prev => ({ ...prev, [param.id]: e.target.value }))}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50"
                        />
                        <span className="flex items-center text-xs text-slate-400 px-2 shrink-0 min-w-10">
                          {param.unit || ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {parameters.length > 0 && (
              <div className="px-5 pb-5 flex gap-2">
                <button
                  onClick={handleSaveResults}
                  disabled={savingResults}
                  className="flex-1 py-3 bg-violet-600 text-white rounded-xl text-sm font-black hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingResults ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Save Results
                    </>
                  )}
                </button>
                <button
                  onClick={() => setResultModal(null)}
                  className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboardPage;
