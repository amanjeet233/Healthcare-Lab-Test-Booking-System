import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle, History } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import MOBreadcrumbs from '../../components/medical/MOBreadcrumbs';
import MOEmptyState from '../../components/medical/MOEmptyState';
import MOLoadingSkeleton from '../../components/medical/MOLoadingSkeleton';
import MOFiltersBar from '../../components/medical/MOFiltersBar';
import MOStatusTimeline from '../../components/medical/MOStatusTimeline';

type VerificationItem = {
  id?: number;
  bookingId?: number;
  bookingReference?: string;
  reference?: string;
  patientName?: string;
  patientId?: number;
  testName?: string;
  bookingDate?: string;
  collectionAddress?: string;
  city?: string;
  address?: string;
  status?: string;
  criticalFlag?: boolean;
  anyResultAbnormal?: boolean;
  verificationDate?: string;
  createdAt?: string;
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

type CurrentResultItem = {
  parameterName: string;
  resultValue: string;
  unit: string;
  abnormalStatus?: string;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

type GenericRow = Record<string, unknown>;

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

const MedicalOfficerVerificationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<number | null>(null);

  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [rejectReason, setRejectReason] = useState<Record<number, string>>({});

  const [activeFilter, setActiveFilter] = useState(() => {
    const value = (searchParams.get('filter') || 'ALL').toUpperCase();
    return ['ALL', 'NEW', 'CRITICAL', 'RECHECK'].includes(value) ? value : 'ALL';
  });
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [testFilter, setTestFilter] = useState('');

  const [expandedById, setExpandedById] = useState<Record<number, boolean>>({});
  const [loadingComparisonById, setLoadingComparisonById] = useState<Record<number, boolean>>({});
  const [deltaById, setDeltaById] = useState<Record<number, DeltaCheckEntry[]>>({});
  const [currentById, setCurrentById] = useState<Record<number, CurrentResultItem[]>>({});

  const getId = (item: VerificationItem) => Number(item.bookingId || item.id || 0);

  const handleOpenBookingDetails = (item: VerificationItem) => {
    navigate(`/medical-officer/bookings/${getId(item)}`);
  };

  const loadPending = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/api/mo/pending', { params: { page: 0, size: 50, filter: activeFilter } });
      const pageData = resp.data?.data || {};
      const pendingRows = Array.isArray(pageData?.content) ? pageData.content : [];

      if (pendingRows.length > 0) {
        setItems(pendingRows);
        return;
      }

      // Fallback: show bookings that are waiting for verification.
      const bookingResp = await api.get('/api/mo/bookings', {
        params: { status: 'PENDING_VERIFICATION', page: 0, size: 50 },
      });
      const bookingData = bookingResp.data?.data || {};
      const bookingRows = Array.isArray(bookingData?.content)
        ? bookingData.content
        : Array.isArray(bookingData)
          ? bookingData
          : [];

      setItems(
        bookingRows.map((raw) => {
          const b = raw as Record<string, unknown>;
          return {
            id: b.id as number | undefined,
            bookingId: b.id as number | undefined,
            patientName: b.patientName as string | undefined,
            patientId: b.patientId as number | undefined,
            testName: (b.testName as string | undefined) || (b.packageName as string | undefined),
            bookingDate: b.bookingDate as string | undefined,
            bookingReference: b.bookingReference as string | undefined,
            reference: b.reference as string | undefined,
            collectionAddress: b.collectionAddress as string | undefined,
            city: b.city as string | undefined,
            address: b.address as string | undefined,
            status: (b.status as string | undefined) || 'PENDING_VERIFICATION',
            criticalFlag: Boolean(b.criticalFlag),
            anyResultAbnormal: Boolean(b.anyResultAbnormal),
            createdAt: b.createdAt as string | undefined,
            verificationDate: b.verificationDate as string | undefined,
          };
        })
      );
    } catch {
      toast.error('Failed to load verification queue');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPending();
  }, [activeFilter]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const areaQuery = areaFilter.trim().toLowerCase();
    const testQuery = testFilter.trim().toLowerCase();

    return items.filter((item) => {
      const id = getId(item);
      const dynamicBlob = JSON.stringify(item || {}).toLowerCase();
      const searchHaystack = [
        id,
        item.bookingReference,
        item.reference,
        item.patientName,
        item.testName,
      ]
        .map((value) => String(value || '').toLowerCase())
        .join(' ');
      const areaHaystack = [
        item.collectionAddress,
        item.city,
        item.address,
      ]
        .map((value) => String(value || '').toLowerCase())
        .join(' ');
      const matchesSearch =
        !query ||
        searchHaystack.includes(query) || dynamicBlob.includes(query);
      const matchesArea = !areaQuery || areaHaystack.includes(areaQuery) || dynamicBlob.includes(areaQuery);
      const matchesDate = !dateFilter || normalizeDateForFilter(item.bookingDate) === normalizeDateForFilter(dateFilter);
      const matchesTest = !testQuery || String(item.testName || '').toLowerCase().includes(testQuery);
      return matchesSearch && matchesArea && matchesDate && matchesTest;
    });
  }, [items, search, areaFilter, dateFilter, testFilter]);

  const criticalCount = useMemo(
    () => filteredItems.filter((item) => item.criticalFlag || item.anyResultAbnormal).length,
    [filteredItems]
  );

  const loadComparisonData = async (item: VerificationItem) => {
    const id = getId(item);
    if (!id || loadingComparisonById[id] || (deltaById[id] && currentById[id])) return;

    setLoadingComparisonById((prev) => ({ ...prev, [id]: true }));
    try {
      const requests: Promise<unknown>[] = [api.get(`/api/reports/booking/${id}`)];
      if (item.patientId && item.testName) {
        requests.push(api.get('/api/mo/delta-check', { params: { patientId: item.patientId, testName: item.testName } }));
      }

      const [currentResp, deltaResp] = await Promise.all(requests);
      const currentResponseData = currentResp as {
        data?: {
          data?: {
            results?: GenericRow[];
            resultItems?: GenericRow[];
          };
        };
      };
      const deltaResponseData = (deltaResp || {}) as { data?: { data?: DeltaCheckEntry[] } };

      const resultRows = (currentResponseData.data?.data?.results || currentResponseData.data?.data?.resultItems || []) as GenericRow[];
      const currentRows = resultRows.map((row) => ({
        parameterName: String(row.parameterName || '-'),
        resultValue: String(row.resultValue || '-'),
        unit: String(row.unit || '-'),
        abnormalStatus: String(row.abnormalStatus || 'NORMAL'),
      })) as CurrentResultItem[];

      const deltaRows = (deltaResponseData?.data?.data || []) as DeltaCheckEntry[];

      setCurrentById((prev) => ({ ...prev, [id]: currentRows }));
      setDeltaById((prev) => ({ ...prev, [id]: deltaRows }));
    } catch {
      toast.error('Unable to load comparison data');
    } finally {
      setLoadingComparisonById((prev) => ({ ...prev, [id]: false }));
    }
  };

  const toggleComparison = async (item: VerificationItem) => {
    const id = getId(item);
    const next = !expandedById[id];
    setExpandedById((prev) => ({ ...prev, [id]: next }));
    if (next) {
      await loadComparisonData(item);
    }
  };

  const handleVerify = async (item: VerificationItem) => {
    const id = getId(item);
    const note = (remarks[id] || '').trim();
    if (note.length < 10) {
      toast.error('Clinical remarks minimum 10 characters required');
      return;
    }

    setActioningId(id);
    try {
      await api.post(`/api/mo/verify/${id}`, {
        clinicalNotes: note,
        digitalSignature: `Digitally signed by ${currentUser?.name || 'Medical Officer'}`,
        approved: true,
        specialistType: 'General',
      });
      toast.success('Report approved and signed');
      setItems((prev) => prev.filter((x) => getId(x) !== id));
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError?.response?.data?.message || 'Verification failed');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (item: VerificationItem) => {
    const id = getId(item);
    const reason = (rejectReason[id] || '').trim();
    if (!reason) {
      toast.error('Rejection reason required');
      return;
    }

    setActioningId(id);
    try {
      await api.post(`/api/mo/reject/${id}`, { reason });
      toast.success('Report rejected');
      setItems((prev) => prev.filter((x) => getId(x) !== id));
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError?.response?.data?.message || 'Reject failed');
    } finally {
      setActioningId(null);
    }
  };

  const handleFlagCritical = async (item: VerificationItem) => {
    const id = getId(item);
    setActioningId(id);
    try {
      await api.put(`/api/mo/flag-critical/${id}`);
      toast.success('Marked as critical');
      setItems((prev) => prev.map((x) => (getId(x) === id ? { ...x, criticalFlag: true } : x)));
    } catch {
      toast.error('Unable to flag critical');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="max-w-[1140px] mx-auto px-5 md:px-6 lg:px-8 py-6 space-y-4">
      <MOBreadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Pending Reviews' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#164E63]">Pending <span className="text-cyan-600">Reviews</span></h1>
          <p className="text-sm text-slate-500 font-semibold">Check results and sign off reports.</p>
        </div>
        <button
          onClick={loadPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-200 text-[11px] font-black uppercase"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
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
        rightSlot={<p className="text-xs font-bold text-slate-600">Visible: {filteredItems.length}</p>}
      />

      {criticalCount > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2 text-red-700 text-sm font-semibold">
          <AlertTriangle className="w-4 h-4" />
          Critical alerts: {criticalCount} report{criticalCount === 1 ? '' : 's'} need urgent attention.
        </div>
      )}

      {loading ? (
        <MOLoadingSkeleton rows={4} />
      ) : filteredItems.length === 0 ? (
        <MOEmptyState title="All caught up!" description="No pending verification items for current filters." />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const id = getId(item);
            const busy = actioningId === id;
            const expanded = !!expandedById[id];
            const loadingComparison = !!loadingComparisonById[id];
            const currentRows = currentById[id] || [];
            const deltaRows = deltaById[id] || [];

            return (
              <div
                key={id}
                role="button"
                tabIndex={0}
                onClick={() => handleOpenBookingDetails(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenBookingDetails(item);
                  }
                }}
                className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 cursor-pointer transition-all hover:border-cyan-300 hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-black text-[#164E63]">#{id} {item.testName || 'Lab Test'}</p>
                      {(item.criticalFlag || item.anyResultAbnormal) && (
                        <span className="text-[10px] font-black px-2 py-1 rounded-md bg-red-100 text-red-700">CRITICAL</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">{item.patientName || 'Patient'} • {item.bookingDate || '-'}</p>
                  </div>

                  <button
                    onClick={() => toggleComparison(item)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClickCapture={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-[11px] font-black uppercase"
                  >
                    <History className="w-3.5 h-3.5" /> {expanded ? 'Hide History' : 'Previous History'}
                  </button>
                </div>

                <MOStatusTimeline
                  status={item.status || 'PENDING_VERIFICATION'}
                  bookingDate={item.bookingDate}
                  createdAt={item.createdAt}
                  verificationDate={item.verificationDate}
                />

                {expanded && (
                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 space-y-2">
                    {loadingComparison ? (
                      <p className="text-xs text-slate-500 font-semibold">Loading comparison data...</p>
                    ) : (
                      <>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">Current Report Values</p>
                          {currentRows.length === 0 ? (
                            <p className="text-xs text-slate-500">Current report values are not available from API.</p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-left text-slate-500">
                                    <th className="py-1.5 pr-2">Parameter</th>
                                    <th className="py-1.5 pr-2">Value</th>
                                    <th className="py-1.5 pr-2">Unit</th>
                                    <th className="py-1.5">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {currentRows.map((row, idx) => (
                                    <tr key={`${row.parameterName}-${idx}`} className="border-t border-slate-200">
                                      <td className="py-1.5 pr-2 font-semibold text-slate-700">{row.parameterName}</td>
                                      <td className="py-1.5 pr-2">{row.resultValue}</td>
                                      <td className="py-1.5 pr-2">{row.unit}</td>
                                      <td className="py-1.5">{row.abnormalStatus || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">Previous History (Delta Check)</p>
                          {deltaRows.length === 0 ? (
                            <p className="text-xs text-slate-500">No previous history available for this patient/test.</p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-left text-slate-500">
                                    <th className="py-1.5 pr-2">Date</th>
                                    <th className="py-1.5 pr-2">Parameter</th>
                                    <th className="py-1.5 pr-2">Value</th>
                                    <th className="py-1.5 pr-2">Range</th>
                                    <th className="py-1.5">Flag</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {deltaRows.map((row, idx) => (
                                    <tr key={`${row.parameterName}-${row.bookingDate}-${idx}`} className="border-t border-slate-200">
                                      <td className="py-1.5 pr-2">{row.bookingDate}</td>
                                      <td className="py-1.5 pr-2 font-semibold text-slate-700">{row.parameterName}</td>
                                      <td className="py-1.5 pr-2">{row.value} {row.unit}</td>
                                      <td className="py-1.5 pr-2">{row.referenceRange}</td>
                                      <td className="py-1.5">{row.flag}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                <textarea
                  value={remarks[id] || ''}
                  onChange={(e) => setRemarks((prev) => ({ ...prev, [id]: e.target.value }))}
                  placeholder="Clinical remarks (min 10 chars)"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  value={rejectReason[id] || ''}
                  onChange={(e) => setRejectReason((prev) => ({ ...prev, [id]: e.target.value }))}
                  placeholder="Rejection reason"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />

                <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleVerify(item)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-black uppercase disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> {busy ? 'Processing...' : 'Approve & Sign'}
                  </button>
                  <button
                    onClick={() => handleReject(item)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-black uppercase disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                  {!item.criticalFlag && (
                    <button
                      onClick={() => handleFlagCritical(item)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-amber-300 text-amber-700 rounded-lg text-xs font-black uppercase disabled:opacity-50"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Flag Critical
                    </button>
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

export default MedicalOfficerVerificationPage;
