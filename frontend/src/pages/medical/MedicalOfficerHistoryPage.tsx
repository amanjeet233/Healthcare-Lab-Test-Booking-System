import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { History, RefreshCw, CheckCircle2, FileText, Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import MOBreadcrumbs from '../../components/medical/MOBreadcrumbs';
import MOEmptyState from '../../components/medical/MOEmptyState';
import MOLoadingSkeleton from '../../components/medical/MOLoadingSkeleton';
import MOFiltersBar from '../../components/medical/MOFiltersBar';
import GlassCard from '../../components/common/GlassCard';

type HistoryItem = {
  id: number;
  bookingId?: number;
  bookingReference?: string;
  reference?: string;
  patientName?: string;
  testName?: string;
  bookingDate?: string;
  status?: string;
  collectionAddress?: string;
  city?: string;
  address?: string;
  medicalOfficerName?: string;
  createdAt?: string;
  reportAvailable?: boolean;
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

const statusTabs = ['ALL', 'APPROVED', 'REJECTED', 'FLAGGED'] as const;
type HistoryStatus = (typeof statusTabs)[number];

const MedicalOfficerHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [historyStatus, setHistoryStatus] = useState<HistoryStatus>(() => {
    const initial = (searchParams.get('status') || 'ALL').toUpperCase();
    return statusTabs.includes(initial as HistoryStatus) ? (initial as HistoryStatus) : 'ALL';
  });
  const [bookings, setBookings] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [testFilter, setTestFilter] = useState('');

  const loadHistory = useCallback(async (status: HistoryStatus = historyStatus) => {
    setLoading(true);
    try {
      const resp = await api.get('/api/mo/history', {
        params: { status, page: 0, size: 100 },
      });
      const pageData = resp.data?.data || {};
      const rows = Array.isArray(pageData?.content) ? pageData.content : [];
      setBookings(rows as HistoryItem[]);
    } catch {
      toast.error('Failed to load history');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [historyStatus]);

  useEffect(() => {
    void loadHistory(historyStatus);
  }, [historyStatus, loadHistory]);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    const areaQuery = areaFilter.trim().toLowerCase();
    const testQuery = testFilter.trim().toLowerCase();

    return bookings.filter((booking) => {
      const dynamicBlob = JSON.stringify(booking || {}).toLowerCase();
      const searchHaystack = [
        booking.id,
        booking.bookingReference,
        booking.reference,
        booking.patientName,
        booking.testName,
      ]
        .map((value) => String(value || '').toLowerCase())
        .join(' ');
      const areaHaystack = [booking.collectionAddress, booking.city, booking.address]
        .map((value) => String(value || '').toLowerCase())
        .join(' ');
      const matchesSearch = !query || searchHaystack.includes(query) || dynamicBlob.includes(query);
      const matchesArea = !areaQuery || areaHaystack.includes(areaQuery) || dynamicBlob.includes(areaQuery);
      const matchesDate = !dateFilter || normalizeDateForFilter(booking.bookingDate) === normalizeDateForFilter(dateFilter);
      const matchesTest = !testQuery || String(booking.testName || '').toLowerCase().includes(testQuery);
      return matchesSearch && matchesArea && matchesDate && matchesTest;
    });
  }, [bookings, search, areaFilter, dateFilter, testFilter]);

  const summary = useMemo(() => ({
    approved: bookings.filter((booking) => (booking.status || '').toUpperCase() === 'APPROVED').length,
    rejected: bookings.filter((booking) => (booking.status || '').toUpperCase() === 'REJECTED').length,
    flagged: bookings.filter((booking) => (booking.status || '').toUpperCase() === 'FLAGGED').length,
  }), [bookings]);

  const openBooking = (item: HistoryItem) => {
    const actualBookingId = item.bookingId || item.id;
    navigate(`/medical-officer/bookings/${actualBookingId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1140px] mx-auto px-5 md:px-6 lg:px-8 py-6 space-y-4">
        <MOBreadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'History' }]} />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 bg-emerald-500/10 backdrop-blur-md rounded-xl border border-emerald-500/20 shadow-sm">
                <History className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[clamp(0.62rem,0.58rem+0.16vw,0.72rem)] font-black uppercase tracking-[0.22em] text-emerald-800/60">
                MEDICAL OFFICER HISTORY
              </span>
            </div>
            <h1 className="text-[clamp(1.5rem,1.05rem+1.4vw,2.25rem)] font-black text-[#164E63] tracking-tight mb-2">
              Booking <span className="text-emerald-600">History</span>
            </h1>
            <p className="text-[clamp(0.78rem,0.76rem+0.28vw,0.92rem)] text-cyan-900/60 font-medium leading-relaxed">
              Approved and processed verification records are tracked here so you can review finished reports quickly.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadHistory(historyStatus)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-white text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white/80 border border-emerald-100 p-4 shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-1">Visible</div>
            <div className="text-2xl font-black text-[#164E63]">{filteredBookings.length}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">matching the current filters</div>
          </div>
          <div className="rounded-2xl bg-white/80 border border-emerald-100 p-4 shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-1">Approved</div>
            <div className="text-2xl font-black text-emerald-600">{summary.approved}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">reports approved by MO</div>
          </div>
          <div className="rounded-2xl bg-white/80 border border-emerald-100 p-4 shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-1">Rejected</div>
            <div className="text-2xl font-black text-rose-600">{summary.rejected}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">reports rejected by MO</div>
          </div>
          <div className="rounded-2xl bg-white/80 border border-emerald-100 p-4 shadow-sm md:col-span-1 col-span-2">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-1">Flagged</div>
            <div className="text-2xl font-black text-cyan-700">{summary.flagged}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">reports flagged for review</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {statusTabs.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setHistoryStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-[0.08em] transition-all border ${historyStatus === status
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200 hover:text-emerald-700'
                }`}
            >
              {status === 'ALL' ? 'All History' : status.replaceAll('_', ' ')}
            </button>
          ))}
        </div>

        <MOFiltersBar
          search={search}
          onSearchChange={setSearch}
          location={areaFilter}
          onLocationChange={setAreaFilter}
          date={dateFilter}
          onDateChange={setDateFilter}
          test={testFilter}
          onTestChange={setTestFilter}
          rightSlot={
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <Search className="w-4 h-4" />
              {bookings.length} loaded
            </div>
          }
        />

        {loading ? (
          <MOLoadingSkeleton rows={4} />
        ) : filteredBookings.length === 0 ? (
          <MOEmptyState
            title="No history found"
            description="Try changing the status, search, date, or location filters."
            icon={<FileText className="w-5 h-5" />}
          />
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => {
              const displayId = booking.bookingId || booking.id;
              const status = (booking.status || '').toUpperCase();
              const statusClass = status === 'APPROVED'
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                : status === 'REJECTED'
                  ? 'bg-rose-100 text-rose-700 border-rose-200'
                  : 'bg-cyan-100 text-cyan-700 border-cyan-200';

              return (
                <button
                  key={`${booking.id}-${displayId}`}
                  type="button"
                  onClick={() => openBooking(booking)}
                  className="text-left w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 rounded-2xl"
                >
                  <GlassCard className="!p-0 overflow-hidden transition-transform hover:-translate-y-0.5 hover:shadow-xl cursor-pointer" animate={false}>
                    <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs font-black text-slate-400">#{displayId}</span>
                          {booking.bookingReference && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {booking.bookingReference}
                            </span>
                          )}
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${statusClass}`}>
                            {status || 'VERIFIED'}
                          </span>
                        </div>
                        <h3 className="font-black text-[#164E63] tracking-tight text-base md:text-lg">
                          {booking.patientName || 'Patient'} - {booking.testName || 'Lab Test'}
                        </h3>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-500 font-medium">
                          <p>Booking date: {booking.bookingDate || 'N/A'}</p>
                          <p>Location: {booking.city || booking.address || booking.collectionAddress || 'N/A'}</p>
                          <p>MO: {booking.medicalOfficerName || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        View details
                      </div>
                    </div>
                  </GlassCard>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalOfficerHistoryPage;
