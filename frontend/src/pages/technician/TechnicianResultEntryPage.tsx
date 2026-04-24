import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, FlaskConical, Upload, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import { getTechnicianBookings, technicianService } from '../../services/technicianService';

const TECH_NODES = [
  { key: 1, label: 'Sample Pending', icon: '🩸' },
  { key: 2, label: 'Collected', icon: '✓' },
  { key: 3, label: 'In Lab', icon: '⚗️' },
  { key: 4, label: 'Results Entered', icon: '📋' },
  { key: 5, label: 'Sent to MO', icon: '📤' },
];

const isAbnormal = (param: any, val: string) => {
  if (!val || !val.trim()) return false;
  const n = parseFloat(val);
  if (isNaN(n)) return false;
  if (param.normalRangeMin != null && n < param.normalRangeMin) return true;
  if (param.normalRangeMax != null && n > param.normalRangeMax) return true;
  return false;
};

const getTechNodeIndex = (status: string, hasResults: boolean) => {
  if (status === 'VERIFIED' || status === 'COMPLETED') return 6;
  if (status === 'PENDING_VERIFICATION') return 6;
  if (status === 'PENDING') return 5;
  if (status === 'PROCESSING' && hasResults) return 4;
  if (status === 'PROCESSING') return 3;
  if (status === 'SAMPLE_COLLECTED') return 2;
  return 1;
};

const TechnicianResultEntryPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const uploadRef = useRef<HTMLInputElement | null>(null);

  const [booking, setBooking] = useState<any>(null);
  const [parameters, setParameters] = useState<any[]>([]);
  const [resultValues, setResultValues] = useState<Record<number, string>>({});
  const [existingResults, setExistingResults] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const parsedBookingId = Number(bookingId);

  useEffect(() => {
    const run = async () => {
      if (!parsedBookingId || Number.isNaN(parsedBookingId)) {
        toast.error('Invalid booking id');
        navigate('/technician');
        return;
      }

      setLoading(true);
      try {
        const bookingResp = await getTechnicianBookings();
        const bookingRows = bookingResp.data?.data || bookingResp.data || [];
        const bookingData = Array.isArray(bookingRows)
          ? bookingRows.find((b: any) => Number(b?.id) === parsedBookingId)
          : null;

        if (!bookingData) {
          toast.error('Booking not found in your assigned tasks');
          navigate('/technician');
          return;
        }

        setBooking(bookingData);

        try {
          const paramsResp = await api.get(`/api/reports/parameters/booking/${parsedBookingId}`);
          const bookingParams = paramsResp.data?.data || [];
          if (Array.isArray(bookingParams) && bookingParams.length > 0) {
            setParameters(bookingParams);
          } else {
            let testId = bookingData?.labTestId || bookingData?.test?.id || bookingData?.testId;
            if (!testId) {
              testId = await technicianService.findTestIdByName(
                bookingData?.testName || bookingData?.labTestName || ''
              );
            }
            if (testId) {
              const singleTestParamsResp = await api.get(`/api/lab-tests/${testId}/parameters`);
              setParameters(singleTestParamsResp.data?.data || []);
            } else {
              setParameters([]);
            }
          }
        } catch {
          let testId = bookingData?.labTestId || bookingData?.test?.id || bookingData?.testId;
          if (!testId) {
            testId = await technicianService.findTestIdByName(
              bookingData?.testName || bookingData?.labTestName || ''
            );
          }
          if (testId) {
            const singleTestParamsResp = await api.get(`/api/lab-tests/${testId}/parameters`);
            setParameters(singleTestParamsResp.data?.data || []);
          } else {
            setParameters([]);
          }
        }

        try {
          const existingResp = await api.get(`/api/reports/results/booking/${parsedBookingId}`);
          const rows = existingResp.data?.data?.results || [];
          setExistingResults(rows);

          if (Array.isArray(rows) && rows.length > 0) {
            const prefill: Record<number, string> = {};
            rows.forEach((row: any) => {
              const pid = Number(row.parameterId);
              if (pid) prefill[pid] = String(row.resultValue ?? '');
            });
            setResultValues(prefill);
          }
        } catch {
          setExistingResults([]);
        }
      } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Failed to load booking details');
        navigate('/technician');
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [navigate, parsedBookingId]);

  const currentNode = getTechNodeIndex(
    String(booking?.status || ''),
    existingResults.length > 0 || Object.values(resultValues).some((v) => String(v).trim().length > 0)
  );

  const persistResults = async () => {
    if (!parsedBookingId) return false;
    const entries = Object.entries(resultValues).filter(([, v]) => String(v).trim() !== '');
    if (entries.length === 0) {
      toast.error('Enter at least one result value');
      return false;
    }

    const results = entries.map(([parameterId, resultValue]) => ({
      parameterId: Number(parameterId),
      resultValue: String(resultValue).trim(),
    }));

    await api.post('/api/reports/results', { bookingId: parsedBookingId, results });

    // Best-effort call to preserve audit trail "results entered" status context.
    try {
      await api.put(`/api/bookings/${parsedBookingId}/status`, null, { params: { status: 'PROCESSING' } });
    } catch {
      // No-op: transition validation may block same-status update.
    }

    return true;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const ok = await persistResults();
      if (!ok) return;
      toast.success('Results saved');
      navigate('/technician');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to save results');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndUpload = async () => {
    setSaving(true);
    try {
      const ok = await persistResults();
      if (!ok) return;
      toast.success('Results saved. Select report file to upload.');
      uploadRef.current?.click();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to save results');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !parsedBookingId) return;
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Only PDF and image files are allowed');
      return;
    }

    setUploading(true);
    try {
      await technicianService.uploadReport(parsedBookingId, file);
      toast.success('Report uploaded');
      navigate('/technician');
    } catch {
      toast.error('Failed to upload report');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-[1140px] w-full mx-auto px-5 md:px-6 lg:px-8 py-5 md:py-6 min-h-screen">
      <div className="mb-4 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-800/55">
        <Link to="/" className="hover:text-cyan-700 transition-colors">Home</Link>
        <span className="mx-1 text-cyan-700/35">›</span>
        <span className="text-cyan-700">Enter Results</span>
      </div>

      <header className="mb-6">
        <h1 className="text-[clamp(1.3rem,1rem+0.95vw,1.95rem)] font-black text-[#164E63] tracking-tight">
          Enter <span className="text-cyan-600">Results</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          {(booking?.testName || booking?.labTestName || booking?.packageName || 'Lab Test')}
          {' • '}
          {(booking?.patientName || 'Patient')}
          {' • '}
          {(booking?.bookingDate || '-')}
        </p>
      </header>

      <GlassCard className="mb-4">
        <div className="flex items-center overflow-x-auto py-1">
          {TECH_NODES.map((node, idx) => {
            const isComplete = currentNode > node.key;
            const isActive = currentNode === node.key;
            const isLast = idx === TECH_NODES.length - 1;
            return (
              <React.Fragment key={node.key}>
                <div className="flex flex-col items-center gap-1 shrink-0 w-[110px]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black border-2 ${
                    isComplete
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : isActive
                        ? 'bg-cyan-600 border-cyan-600 text-white ring-4 ring-cyan-100'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    {isComplete ? '✓' : node.icon}
                  </div>
                  <span className={`text-[9px] font-bold text-center leading-tight ${isActive ? 'text-cyan-700' : isComplete ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {node.label}
                  </span>
                </div>
                {!isLast && (
                  <div className={`flex-1 h-0.5 mx-1 min-w-[30px] ${isComplete ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard>
        {existingResults.length > 0 && (
          <div className="mb-4 p-3 rounded-xl border border-cyan-100 bg-cyan-50/50">
            <p className="text-xs font-black text-cyan-700 uppercase tracking-wider mb-2">Existing Results (Editable)</p>
            <div className="flex flex-wrap gap-2">
              {existingResults.map((row: any, idx: number) => (
                <span
                  key={`${row.parameterId || row.parameterName || 'result'}-${idx}`}
                  className="text-[11px] font-semibold px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600"
                >
                  {row.parameterName || `Parameter ${row.parameterId}`}: {row.resultValue || '-'}
                </span>
              ))}
            </div>
          </div>
        )}
        {loading ? (
          <div className="text-sm font-medium text-slate-500">Loading booking data...</div>
        ) : (parameters == null || parameters.length === 0) ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-100 rounded-3xl">
            <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-pulse" />
            <h3 className="text-base font-black text-slate-700 mb-2 uppercase tracking-tight">No Parameters Configured</h3>
            <p className="text-xs text-slate-500 max-w-[280px] mx-auto leading-relaxed">
              We couldn't find any lab parameters for this test package. This might be due to a configuration gap in the lab test database.
            </p>
            {existingResults.length > 0 ? (
              <div className="mt-6 p-3 bg-cyan-50 rounded-xl inline-block">
                <p className="text-[10px] font-bold text-cyan-700">
                  EXISTING RESULTS DETECTED: You can still view and edit them above.
                </p>
              </div>
            ) : (
              <GlassButton 
                variant="secondary" 
                size="small" 
                className="mt-6"
                onClick={() => window.location.reload()}
              >
                Retry Fetching
              </GlassButton>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {parameters.map((param: any) => (
              <div
                key={param.id}
                className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-slate-100 hover:border-cyan-200"
              >
                <div className="flex-1">
                  <span className="text-sm font-bold text-[#164E63]">
                    {param.parameterName}
                  </span>
                  <span className="ml-2 text-[10px] text-slate-400 font-medium">
                    Normal: {param.normalRangeText || `${param.normalRangeMin}–${param.normalRangeMax}`} {param.unit}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={resultValues[param.id] || ''}
                    onChange={e => {
                      setResultValues(prev => ({ ...prev, [param.id]: e.target.value }));
                    }}
                    className={`w-24 px-3 py-1.5 rounded-lg border text-sm font-medium text-center focus:outline-none focus:ring-2 focus:ring-cyan-200 ${
                      isAbnormal(param, resultValues[param.id])
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : resultValues[param.id]
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white'
                    }`}
                    placeholder="—"
                  />
                  <span className="text-xs text-slate-400 w-12 shrink-0">
                    {param.unit}
                  </span>
                  {isAbnormal(param, resultValues[param.id]) && (
                    <span className="text-[10px] font-black text-red-500">
                      {Number(resultValues[param.id]) > (param.normalRangeMax || Infinity) ? 'HIGH' : 'LOW'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-end">
          <GlassButton
            onClick={handleSave}
            loading={saving}
            icon={<CheckCircle2 className="w-4 h-4" />}
            className="!bg-cyan-600 hover:!bg-cyan-700"
          >
            {existingResults.length > 0 ? 'Save Changes' : 'Save Results'}
          </GlassButton>
          <GlassButton
            onClick={handleSaveAndUpload}
            loading={saving || uploading}
            icon={<Upload className="w-4 h-4" />}
            variant="secondary"
          >
            Save & Upload Report
          </GlassButton>
          <GlassButton
            onClick={() => navigate(-1)}
            icon={<XCircle className="w-4 h-4" />}
            variant="tertiary"
          >
            Cancel
          </GlassButton>
        </div>
      </GlassCard>

      <input
        ref={uploadRef}
        type="file"
        accept="application/pdf,image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
};

export default TechnicianResultEntryPage;
