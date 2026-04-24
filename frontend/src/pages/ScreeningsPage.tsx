import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../services/api';
import { notify } from '../utils/toast';

type Screening = {
  id: string;
  code?: string;
  name: string;
  organSystem: string;
  icon?: string;
  subtitle?: string;
  testCount?: number;
  parameters?: string[];
  reportTurnaroundHours?: number;
  fastingRequired?: string;
};

const DEFAULT_TYPE = 'expert-curated';
const ALLOWED_TYPES = new Set([DEFAULT_TYPE]);
const VALID_ORGAN_SYSTEMS = new Set([
  'thyroid', 'heart', 'kidney', 'liver', 'bone', 'lungs', 'brain', 'full-body'
]);

const formatLabel = (value: string) =>
  value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (s) => s.toUpperCase());

type RawScreening = {
  id?: unknown;
  code?: unknown;
  name?: unknown;
  organSystem?: unknown;
  icon?: unknown;
  subtitle?: unknown;
  testCount?: unknown;
  parameters?: unknown;
  reportTurnaroundHours?: unknown;
  fastingRequired?: unknown;
};

const normalizeScreening = (raw: RawScreening): Screening | null => {
  const id = String(raw?.id || raw?.code || '').trim();
  const name = String(raw?.name || '').trim();
  if (!id || !name) return null;

  const organSystemRaw = String(raw?.organSystem || '').trim().toLowerCase();
  const organSystem = VALID_ORGAN_SYSTEMS.has(organSystemRaw) ? organSystemRaw : 'full-body';

  const rawParams = Array.isArray(raw?.parameters) ? raw.parameters : [];
  const parameters = rawParams.length > 0 ? rawParams : [id];

  const turnaround = Number(raw?.reportTurnaroundHours);
  const reportTurnaroundHours = Number.isFinite(turnaround)
    ? Math.max(4, Math.min(120, turnaround))
    : 24;

  const fastingRaw = String(raw?.fastingRequired || 'none').toLowerCase();
  const fastingRequired = ['8hr', 'none', 'mixed'].includes(fastingRaw) ? fastingRaw : 'none';

  return {
    id,
    code: id,
    name,
    organSystem,
    icon: String(raw?.icon || ''),
    subtitle: String(raw?.subtitle || 'Doctor-designed screening panel.'),
    testCount: Number(raw?.testCount) > 0 ? Number(raw.testCount) : parameters.length,
    parameters,
    reportTurnaroundHours,
    fastingRequired,
  };
};

const ScreeningsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const clickGuardRef = useRef(0);

  const category = searchParams.get('category')?.trim().toLowerCase() ?? '';
  const rawType = searchParams.get('type')?.trim().toLowerCase() || DEFAULT_TYPE;
  const type = ALLOWED_TYPES.has(rawType) ? rawType : DEFAULT_TYPE;

  useEffect(() => {
    if (rawType && !ALLOWED_TYPES.has(rawType)) {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      params.set('type', DEFAULT_TYPE);
      setSearchParams(params, { replace: true });
      notify.error('Invalid screening type. Showing expert-curated results.');
    }
  }, [rawType, category, setSearchParams]);

  useEffect(() => {
    const fetchScreenings = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (type) params.set('type', type);
        const url = `/api/screenings${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await api.get(url);
        const data = response?.data?.data ?? {};

        const normalized = (Array.isArray(data.screenings) ? data.screenings : [])
          .map(normalizeScreening)
          .filter(Boolean) as Screening[];

        const uniqueById = Array.from(
          new Map(normalized.map((item) => [item.id, item])).values()
        );

        setScreenings(uniqueById);
        setCategories(
          Array.isArray(data.categories)
            ? data.categories.map((c: string) => String(c).toLowerCase()).filter((c: string) => VALID_ORGAN_SYSTEMS.has(c))
            : []
        );
      } catch (err) {
        console.error('Failed to load screenings', err);
        setError('Could not load screenings right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchScreenings();
  }, [category, type]);

  const hasActiveFilters = Boolean(category) || type !== DEFAULT_TYPE;

  const orderedCategories = useMemo(() => {
    if (!categories.length) return [];
    return [...new Set(categories.map((c) => c.toLowerCase()))];
  }, [categories]);

  useEffect(() => {
    if (!loading && category && orderedCategories.length > 0 && !orderedCategories.includes(category)) {
      const params = new URLSearchParams();
      params.set('type', DEFAULT_TYPE);
      setSearchParams(params, { replace: true });
      notify.error('Invalid category filter. Showing all screenings.');
    }
  }, [loading, category, orderedCategories, setSearchParams]);

  const onCategoryToggle = (next: string) => {
    const params = new URLSearchParams();
    const normalized = next.toLowerCase();
    if (category === normalized) {
      params.set('type', DEFAULT_TYPE);
    } else {
      params.set('category', normalized);
      params.set('type', DEFAULT_TYPE);
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    params.set('type', DEFAULT_TYPE);
    setSearchParams(params);
  };

  const openTest = (screeningId: string) => {
    const now = Date.now();
    if (now - clickGuardRef.current < 300 || loading) return;
    clickGuardRef.current = now;
    navigate(`/test/${screeningId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#screenings-grid"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-white focus:text-slate-900 focus:px-3 focus:py-2 focus:rounded-lg focus:ring-4 focus:ring-blue-500"
      >
        Skip to screenings
      </a>

      <div className="max-w-[1210px] mx-auto px-4 md:px-6 py-8">
        <div className="mb-5">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Expert-Curated Screenings</h1>
          <p className="text-sm text-slate-500 mt-1">Path-based test routing with isolated query filters.</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 mb-6">
          <div className="flex flex-wrap gap-2">
            {orderedCategories.map((item) => {
              const active = category === item;
              return (
                <button
                  key={item}
                  onClick={() => onCategoryToggle(item)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-colors border ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {formatLabel(item)}
                </button>
              );
            })}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl px-4 py-3 text-sm">{error}</div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-40 rounded-2xl border border-slate-100 bg-white animate-pulse" />
            ))}
          </div>
        ) : (
          <div id="screenings-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {screenings.map((screening) => (
              <button
                key={screening.id}
                id={`screening-${screening.id}`}
                aria-label={screening.name}
                onClick={() => openTest(screening.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openTest(screening.id);
                  }
                }}
                className="text-left p-5 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/40"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-600">{formatLabel(screening.organSystem || 'general')}</p>
                    <h3 className="text-lg font-black text-slate-800 mt-1">{screening.name}</h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 rounded-full px-2.5 py-1">
                    {screening.testCount ?? 0} Tests
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{screening.subtitle || 'Doctor-designed screening panel.'}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold">
                    {screening.reportTurnaroundHours ?? 24}h report • {screening.fastingRequired || 'none'}
                  </span>
                  <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ArrowRight size={14} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreeningsPage;
