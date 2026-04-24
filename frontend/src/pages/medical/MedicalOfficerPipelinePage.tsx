import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import MOBreadcrumbs from '../../components/medical/MOBreadcrumbs';
import MOEmptyState from '../../components/medical/MOEmptyState';
import MOLoadingSkeleton from '../../components/medical/MOLoadingSkeleton';
import MOFiltersBar from '../../components/medical/MOFiltersBar';
import MOStatusTimeline from '../../components/medical/MOStatusTimeline';
import MOTechnicianSearchSelect, { type TechnicianOption } from '../../components/medical/MOTechnicianSearchSelect';

type PipelineStatus = 'BOOKED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'PENDING_VERIFICATION' | 'VERIFIED';

type PipelineBooking = {
  id: number;
  bookingReference?: string;
  reference?: string;
  patientName?: string;
  testName?: string;
  bookingDate?: string;
  timeSlot?: string;
  status: string;
  collectionAddress?: string;
  city?: string;
  address?: string;
  technicianId?: number | null;
  technicianName?: string | null;
  createdAt?: string;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
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

const statuses: PipelineStatus[] = ['BOOKED', 'SAMPLE_COLLECTED', 'PROCESSING', 'PENDING_VERIFICATION', 'VERIFIED'];

const MedicalOfficerPipelinePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<PipelineStatus>(() => {
    const initial = (searchParams.get('status') || 'BOOKED').toUpperCase();
    return statuses.includes(initial as PipelineStatus) ? (initial as PipelineStatus) : 'BOOKED';
  });
  const [bookings, setBookings] = useState<PipelineBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [testFilter, setTestFilter] = useState('');

  const [selectedTech, setSelectedTech] = useState<Record<number, number | ''>>({});
  const [techSearchByBooking, setTechSearchByBooking] = useState<Record<number, string>>({});
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [techniciansByDate, setTechniciansByDate] = useState<Record<string, TechnicianOption[]>>({});
  const [loadingTechByDate, setLoadingTechByDate] = useState<Record<string, boolean>>({});

  const loadBookings = useCallback(async (nextStatus: PipelineStatus = status) => {
    setLoading(true);
    try {
      const resp = await api.get('/api/mo/bookings', { params: { status: nextStatus, page: 0, size: 100 } });
      const pageData = resp.data?.data || {};
      setBookings((pageData.content || []) as PipelineBooking[]);
    } catch {
      toast.error('Failed to load pipeline');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void loadBookings(status);
  }, [status, loadBookings]);

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
      const areaHaystack = [
        booking.collectionAddress,
        booking.city,
        booking.address,
      ]
        .map((value) => String(value || '').toLowerCase())
        .join(' ');
      const matchesSearch =
        !query ||
        searchHaystack.includes(query) || dynamicBlob.includes(query);
      const matchesArea = !areaQuery || areaHaystack.includes(areaQuery) || dynamicBlob.includes(areaQuery);
      const matchesDate = !dateFilter || normalizeDateForFilter(booking.bookingDate) === normalizeDateForFilter(dateFilter);
      const matchesTest = !testQuery || String(booking.testName || '').toLowerCase().includes(testQuery);
      return matchesSearch && matchesArea && matchesDate && matchesTest;
    });
  }, [bookings, search, areaFilter, dateFilter, testFilter]);

  const bookingDates = useMemo(
    () => [...new Set(filteredBookings.map((booking) => booking.bookingDate).filter(Boolean))] as string[],
    [filteredBookings]
  );

  const loadTechsByDate = async (date: string) => {
    if (!date || techniciansByDate[date] || loadingTechByDate[date]) return;

    setLoadingTechByDate((prev) => ({ ...prev, [date]: true }));
    try {
      const resp = await api.get('/api/mo/technicians/available', { params: { date } });
      setTechniciansByDate((prev) => ({ ...prev, [date]: normalizeTechnicianOptions(resp.data?.data || []) }));
    } catch {
      setTechniciansByDate((prev) => ({ ...prev, [date]: [] }));
    } finally {
      setLoadingTechByDate((prev) => ({ ...prev, [date]: false }));
    }
  };

  useEffect(() => {
    if (status !== 'BOOKED') return;
    void Promise.all(bookingDates.map((date) => loadTechsByDate(date)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, bookingDates.join('|')]);

  const getPriorityLabel = (bookingDate?: string) => {
    if (!bookingDate) return { text: 'ROUTINE', className: 'bg-blue-100 text-blue-700' };
    const booking = new Date(`${bookingDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!Number.isNaN(booking.getTime()) && booking < today) {
      return { text: 'URGENT', className: 'bg-red-100 text-red-700' };
    }
    return { text: 'ROUTINE', className: 'bg-blue-100 text-blue-700' };
  };

  const handleAssign = async (booking: PipelineBooking) => {
    const technicianId = selectedTech[booking.id];
    if (!technicianId) {
      toast.error('Select technician first');
      return;
    }

    setAssigningId(booking.id);
    try {
      await api.post(`/api/mo/assign-technician/${booking.id}`, { technicianId });
      toast.success('Technician assigned');
      await loadBookings(status);
      setSelectedTech((prev) => ({ ...prev, [booking.id]: '' }));
      setTechSearchByBooking((prev) => ({ ...prev, [booking.id]: '' }));
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError?.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigningId(null);
    }
  };

  const handleOpenBookingDetails = (booking: PipelineBooking) => {
    navigate(`/medical-officer/bookings/${booking.id}`);
  };

  return (
    <div className="max-w-[1140px] mx-auto px-5 md:px-6 lg:px-8 py-6 space-y-4">
      <MOBreadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Order Tracker' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#164E63]">Order <span className="text-cyan-600">Tracker</span></h1>
          <p className="text-sm text-slate-500 font-semibold">Check the live status of every test booking. Fix delays and track progress.</p>
        </div>
        <button
          onClick={() => loadBookings(status)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-200 text-[11px] font-black uppercase"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black ${status === s ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
          >
            {s.replaceAll('_', ' ')}
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
        rightSlot={<p className="text-xs font-bold text-slate-600">Visible: {filteredBookings.length}</p>}
      />

      {loading ? (
        <MOLoadingSkeleton rows={4} />
      ) : filteredBookings.length === 0 ? (
        <MOEmptyState title="All caught up!" description={`No bookings found in ${status.replaceAll('_', ' ')} for selected filters.`} />
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => {
            const busy = assigningId === booking.id;
            const isBooked = status === 'BOOKED';
            const date = booking.bookingDate || '';
            const options = techniciansByDate[date] || [];
            const selected = selectedTech[booking.id] || '';
            const priority = getPriorityLabel(booking.bookingDate);

            return (
              <div
                key={booking.id}
                role="button"
                tabIndex={0}
                onClick={() => handleOpenBookingDetails(booking)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenBookingDetails(booking);
                  }
                }}
                className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer transition-all hover:border-cyan-300 hover:shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-[#164E63]">#{booking.id} {booking.testName || 'Lab Test'}</p>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md ${priority.className}`}>{priority.text}</span>
                      <span className="text-[10px] font-black px-2 py-1 rounded-md bg-slate-100 text-slate-700">{booking.status}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-semibold">
                      {booking.patientName || 'Patient'} • {booking.bookingDate || '-'} • {booking.timeSlot || '-'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Technician: {booking.technicianName || 'Unassigned'}
                    </p>
                    <MOStatusTimeline
                      status={booking.status}
                      bookingDate={booking.bookingDate}
                      createdAt={booking.createdAt}
                    />
                  </div>

                  {isBooked && (
                    <div className="w-full lg:w-[340px]" onClick={(e) => e.stopPropagation()}>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">
                        Assign Technician
                      </label>
                      <MOTechnicianSearchSelect
                        options={options}
                        value={selected}
                        search={techSearchByBooking[booking.id] || ''}
                        onSearchChange={(value) => setTechSearchByBooking((prev) => ({ ...prev, [booking.id]: value }))}
                        onChange={(value) => setSelectedTech((prev) => ({ ...prev, [booking.id]: value }))}
                        loading={loadingTechByDate[date]}
                        disabled={busy}
                      />

                      <button
                        onClick={() => handleAssign(booking)}
                        disabled={busy || !selected}
                        className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-black uppercase disabled:opacity-50 w-full"
                      >
                        {busy ? 'Assigning...' : 'Assign Technician'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MedicalOfficerPipelinePage;
