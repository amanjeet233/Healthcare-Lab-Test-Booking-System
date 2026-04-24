import React, {
  useState, useEffect, useCallback, useRef
} from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown, ChevronRight, ChevronLeft, X, SlidersHorizontal, Home, FlaskConical
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import MedSyncTestCard, { MedSyncTestCardData } from './MedSyncTestCard';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import { SkeletonGrid, TestCardSkeleton } from '../../components/common/SkeletonLoader';

/* ─────────────────────────────────────────────────────────────────
   TestListingLayout — Reusable layout for all test listing routes:
     /lab-tests/all-lab-tests
     /test-listing/top-booked-tests
     /test-listing/women-wellness
     /lab-tests-category/:categorySlug

   @agent: frontend-specialist  @perf: performance-optimizer
 ───────────────────────────────────────────────────────────────── */

const ALL_CATEGORIES = [
  'CBC', 'Diabetes', 'Heart', 'Thyroid', 'Kidney', 'Liver',
  "Women's Health", 'Senior Citizen', 'Pregnancy', 'Bone Health',
  'Cancer Screening', 'Immunity', 'Sexual Health', 'Vitamin',
  'Hormones', 'Joints', 'Allergy', 'Fever', 'Iron Deficiency',
  'Urine', 'Lungs', 'Eye Care', 'Digestion', 'Stress',
  'Nutrition', 'Child Health', 'Anemia', 'Lipid Profile',
  'Full Body Checkup', 'Healthy Wellness',
];

const CATEGORY_DB_MAP: Record<string, string[]> = {
  'Full Body Checkup': ['Full Body'],
  'Full Body': ['Full Body'],
  'Diabetes': ['Endocrinology'],
  'Heart': ['Cardiac & Lipid'],
  'Thyroid': ['Thyroid'],
  'Kidney': ['Nephrology'],
  'Liver': ['Liver Function'],
  'Bone Health': ['Disease Specific', 'Autoimmune'],
  'Bone': ['Disease Specific', 'Autoimmune'],
  'Immunity': ['Autoimmune'],
  'Nutrition': ['Vitamins & Nutrition'],
  'Fever': ['Fever', 'Serology'],
  'Pregnancy': ['Obstetrics'],
  'Eye Care': ['Ophthalmology'],
  'Eye': ['Ophthalmology'],
  'Lungs': ['Pulmonary'],
  'Cancer Screening': ['Oncology'],
  'Cancer': ['Oncology'],
  'Digestion': ['Digestive'],
  'Allergy': ['Autoimmune'],
  'Stress': ['Neurology'],
  'Hormones': ['Hormones'],
  'Hormone Screening': ['Hormones', 'Neurology'],
  'Joints': ['Disease Specific', 'Autoimmune'],
  'Joint Pain': ['Disease Specific', 'Autoimmune'],
  'Anemia': ['Hematology'],
  'Senior Citizen': ['Senior Care'],
  'Senior': ['Senior Care'],
  'Child Health': ['Pediatrics'],
  'ChildCare': ['Pediatrics'],
  'Sexual Health': ['Serology'],
  'STD': ['Serology'],
  "Women's Health": ['Obstetrics', 'Hormones', 'Hematology'],
  'CBC': ['Hematology'],
  'Lipid Profile': ['Cardiac & Lipid'],
  'Vitamin': ['Vitamins & Nutrition'],
  'Imaging': ['Imaging Tests', 'Imaging', 'Radiology', 'X-Ray', 'Ultrasound', 'CT', 'MRI'],
  'Imaging Tests': ['Imaging Tests', 'Imaging', 'Radiology'],
  'Imaging & X-Ray': ['Imaging Tests', 'Imaging', 'Radiology', 'X-Ray'],
  'X-Ray': ['Imaging Tests', 'Imaging', 'Radiology', 'X-Ray'],
  'X Ray': ['Imaging Tests', 'Imaging', 'Radiology', 'X-Ray'],
  'Scan': ['Imaging Tests', 'Imaging', 'Radiology', 'CT', 'MRI', 'Ultrasound'],
  'Urine': ['Urology'],
  'Iron Deficiency': ['Hematology'],
  'Pre-marital': ['Serology'],
  'Healthy Wellness': ['Full Body'],
  'Healthy': ['Full Body'],
  'Brain': ['Neurology'],
  'Weight': ['Endocrinology', 'Vitamins & Nutrition'],
  'Fitness': ['Vitamins & Nutrition', 'Cardiac & Lipid'],
  'Vitality': ['Vitamins & Nutrition'],
  'Skin/Hair': ['Vitamins & Nutrition', 'Hormones'],
  'Skin': ['Vitamins & Nutrition', 'Hormones'],
};

const MUST_HAVE_TESTS = [
  { id: 'cbc', label: 'CBC (Complete Blood Count)' },
  { id: 'lipid', label: 'Lipid Profile' },
  { id: 'thyroid', label: 'Thyroid Profile (TSH)' },
  { id: 'hba1c', label: 'HbA1c (Diabetes)' },
  { id: 'lft', label: 'Liver Function Test' },
  { id: 'kft', label: 'Kidney Function Test' },
  { id: 'vitd', label: 'Vitamin D Total' },
  { id: 'vitb12', label: 'Vitamin B12' },
  { id: 'urine', label: 'Urine Routine' },
  { id: 'psa', label: 'PSA (Prostate)' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Common' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'discount', label: 'Best' },
  { value: 'popular', label: 'Popular' },
];

const ITEMS_PER_PAGE = 18;

/* ── Debounce hook ────────────────────────────────────────────── */
function useDebounce<T>(value: T, delay: number): T {
  const [deb, setDeb] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return deb;
}

/* ── Pagination helper ────────────────────────────────────────── */
const pageNumbers = (current: number, total: number): (number | '…')[] => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, 5];
  if (current >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
  return [current - 2, current - 1, current, current + 1, current + 2];
};

/* ── Props ────────────────────────────────────────────────────── */
export interface TestListingLayoutProps {
  /** Page heading e.g. "Top Booked Tests" */
  title: string;
  /** Breadcrumb label */
  breadcrumb?: string;
  /** Pre-selected category filter (e.g. from /lab-tests-category/:slug) */
  defaultCategory?: string;
  /** When true, only show packages */
  packagesOnly?: boolean;
  /** When true, sort by most_booked by default */
  trendingMode?: boolean;
  /** Accent colour (default teal) */
  accent?: string;
  /** When true, hide Category section in sidebar (already on a category page) */
  hideCategoryFilter?: boolean;
  /** Pre-applied search from URL query string */
  initialSearch?: string;
}

/* ═══════════════════════════════════════════════════════════════
   FILTER SIDEBAR
 ═══════════════════════════════════════════════════════════════ */
interface SidebarProps {
  typeFilter: string[];
  mustHaveFilter: string[];
  categoryFilter: string[];
  priceRange: [number, number];
  onTypeChange: (val: string[]) => void;
  onMustHaveChange: (val: string[]) => void;
  onCategoryChange: (val: string[]) => void;
  onPriceChange: (val: [number, number]) => void;
  onClearAll: () => void;
  accent: string;
  mobileOpen: boolean;
  onMobileClose: () => void;
  hideCategoryFilter?: boolean;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

const FilterSidebar: React.FC<SidebarProps> = ({
  typeFilter, mustHaveFilter, categoryFilter, priceRange,
  onTypeChange, onMustHaveChange, onCategoryChange, onPriceChange,
  onClearAll, accent, mobileOpen, onMobileClose, hideCategoryFilter,
  searchQuery, onSearchChange
}) => {
  const filterFontStyle: React.CSSProperties = {
    fontFamily: "'Figtree', 'Inter', sans-serif",
  };

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const hasFilters = typeFilter.length + mustHaveFilter.length + categoryFilter.length > 0
    || priceRange[0] > 0 || priceRange[1] < 15000;

  const CheckRow: React.FC<{
    id: string; label: string; checked: boolean; onChange: () => void
  }> = ({ id, label, checked, onChange }) => (
    <label
      htmlFor={id}
      className={`flex items-center gap-2 cursor-pointer group py-1 px-2 rounded-lg transition-all duration-200 ${checked ? 'bg-orange-50 border-orange-100' : 'hover:bg-slate-50 border-transparent'
        } border`}
    >
      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${checked ? 'bg-[#C2410C] border-[#C2410C]' : 'border-slate-300 bg-white group-hover:border-[#C2410C]'
        }`}>
        {checked && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <input
        id={id} type="checkbox" checked={checked} onChange={onChange}
        className="sr-only"
      />
      <span className={`text-[11px] font-medium transition-colors leading-tight ${checked ? 'text-[#C2410C]' : 'text-slate-700 group-hover:text-slate-900'
        }`}>
        {label}
      </span>
    </label>
  );

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-b border-slate-100/80 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">{title}</p>
      </div>
      <div className="flex flex-col gap-1">
        {children}
      </div>
    </div>
  );

  const inner = (
    <div className="flex flex-col h-full min-h-0 bg-white" style={filterFontStyle}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0 pb-2 border-b border-slate-50">
        <h2 className="text-[16px] font-extrabold text-slate-800 flex items-center gap-2.5">
          <SlidersHorizontal className="w-4.5 h-4.5" style={{ color: accent }} strokeWidth={2.5} />
          Filters
        </h2>
        <div className="flex items-center gap-3">
          {hasFilters && (
            <button
              onClick={onClearAll}
              className="text-[12px] font-extrabold hover:text-slate-900 transition-colors uppercase tracking-wider"
              style={{ color: accent }}
            >
              Clear All
            </button>
          )}
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Internal Search Box */}
      <div className="mb-3 relative">
        <input
          type="text"
          placeholder="Search tests..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-3.5 pr-10 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-100 placeholder:text-slate-400 transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <button onClick={() => onSearchChange('')} className="p-1 hover:bg-slate-100 rounded-lg">
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto flex-1 min-h-0 pr-1 premium-scrollbar scrollbar-visible scroll-smooth overscroll-contain">
        {/* Type of Tests */}
        <Section title="Format & Category">
          {['Tests', 'Packages', 'Top Deals', 'Special Offers', 'Fastest Report'].map(t => (
            <CheckRow
              key={t} id={`type-${t}`} label={t}
              checked={typeFilter.includes(t)}
              onChange={() => onTypeChange(toggle(typeFilter, t))}
            />
          ))}
        </Section>

        {/* Premium Filters */}
        <Section title="Premium Filters">
          <CheckRow
            id="high-discount" label="High Discount (30%+)"
            checked={typeFilter.includes('Special Offers')}
            onChange={() => onTypeChange(toggle(typeFilter, 'Special Offers'))}
          />
          <CheckRow
            id="fast-reports" label="Express (Under 24h)"
            checked={typeFilter.includes('Fastest Report')}
            onChange={() => onTypeChange(toggle(typeFilter, 'Fastest Report'))}
          />
        </Section>

        {/* Must Have Tests */}
        <Section title="Must Have Tests">
          {MUST_HAVE_TESTS.map(t => (
            <CheckRow
              key={t.id} id={`must-${t.id}`} label={t.label}
              checked={mustHaveFilter.includes(t.id)}
              onChange={() => onMustHaveChange(toggle(mustHaveFilter, t.id))}
            />
          ))}
        </Section>

        {/* Categories — hidden when already on a category page */}
        {!hideCategoryFilter && (
          <Section title="Category">
            {ALL_CATEGORIES.map(cat => (
              <CheckRow
                key={cat} id={`cat-${cat}`} label={cat}
                checked={categoryFilter.includes(cat)}
                onChange={() => onCategoryChange(toggle(categoryFilter, cat))}
              />
            ))}
          </Section>
        )}
      </div>

      {/* Price Range (fixed outside option scroll) */}
      <div className="shrink-0 pt-2.5 mt-2.5 border-t border-slate-100/80">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2.5">Price Range</p>
        <div className="px-1">
          <div className="flex justify-between text-[11px] text-slate-500 font-semibold mb-2">
            <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
            <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
          </div>
          <div className="relative h-5">
            <input
              type="range" min={0} max={15000} step={100}
              value={priceRange[0]}
              onChange={e => {
                const v = Number(e.target.value);
                if (v < priceRange[1]) onPriceChange([v, priceRange[1]]);
              }}
              className="absolute w-full h-1 rounded appearance-none cursor-pointer"
              style={{ accentColor: accent }}
              aria-label="Minimum price"
            />
            <input
              type="range" min={0} max={15000} step={100}
              value={priceRange[1]}
              onChange={e => {
                const v = Number(e.target.value);
                if (v > priceRange[0]) onPriceChange([priceRange[0], v]);
              }}
              className="absolute w-full h-1 rounded appearance-none cursor-pointer"
              style={{ accentColor: accent }}
              aria-label="Maximum price"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 text-center">
            ₹0 – ₹15,000
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 sticky top-[72px] self-start h-[calc(100dvh-72px)] max-h-[calc(100dvh-72px)] overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 p-5" style={filterFontStyle}>
        {inner}
      </aside>

      {/* Mobile overlay drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" onClick={onMobileClose}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div
            className="relative ml-auto w-72 h-full overflow-hidden bg-white shadow-2xl flex flex-col p-5 animate-in slide-in-from-right duration-300"
            style={filterFontStyle}
            onClick={e => e.stopPropagation()}
          >
            {inner}
          </div>
        </div>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ACTIVE FILTER PILLS
 ═══════════════════════════════════════════════════════════════ */
const FilterPills: React.FC<{
  typeFilter: string[];
  categoryFilter: string[];
  mustHaveFilter: string[];
  priceRange: [number, number];
  onRemoveType: (v: string) => void;
  onRemoveCat: (v: string) => void;
  onRemoveMust: (v: string) => void;
  onResetPrice: () => void;
  accent: string;
}> = ({
  typeFilter, categoryFilter, mustHaveFilter, priceRange,
  onRemoveType, onRemoveCat, onRemoveMust, onResetPrice, accent,
}) => {
    const hasPriceFilter = priceRange[0] > 0 || priceRange[1] < 15000;
    const all = [
      ...typeFilter.map(v => ({ label: v, onRemove: () => onRemoveType(v) })),
      ...categoryFilter.map(v => ({ label: v, onRemove: () => onRemoveCat(v) })),
      ...mustHaveFilter.map(id => ({
        label: MUST_HAVE_TESTS.find(t => t.id === id)?.label ?? id,
        onRemove: () => onRemoveMust(id),
      })),
      ...(hasPriceFilter
        ? [{
          label: `₹${priceRange[0]}–₹${priceRange[1]}`,
          onRemove: onResetPrice,
        }]
        : []),
    ];

    if (!all.length) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-6">
        {all.map(({ label, onRemove }) => (
          <span
            key={label}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[12px] font-bold border bg-white shadow-sm transition-all hover:shadow-md group"
            style={{ borderColor: `${accent}20`, color: accent }}
          >
            {label}
            <button
              onClick={onRemove}
              aria-label={`Remove filter ${label}`}
              className="p-0.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              <X className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
            </button>
          </span>
        ))}
      </div>
    );
  };

/* ═══════════════════════════════════════════════════════════════
   MAIN LAYOUT
 ═══════════════════════════════════════════════════════════════ */
const TestListingLayout: React.FC<TestListingLayoutProps> = ({
  title,
  breadcrumb,
  defaultCategory,
  packagesOnly = false,
  trendingMode = false,
  accent = '#0D7C7C',
  hideCategoryFilter = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [urlParams] = useSearchParams();
  const initialSearch = urlParams.get('search') ?? '';
  const initialCategory = urlParams.get('category') ?? '';

  /* ── Filter State ─────────────────────────────────────────── */
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [mustHaveFilter, setMustHaveFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>(
    initialCategory ? [initialCategory] : (defaultCategory ? [defaultCategory] : [])
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000]);
  const [sortBy, setSortBy] = useState(
    trendingMode ? 'most_booked' : 'relevance'
  );
  const [page, setPage] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');

  /* ── Data State ───────────────────────────────────────────── */
  const [items, setItems] = useState<MedSyncTestCardData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [serviceErrorText, setServiceErrorText] = useState('Database service is temporarily unavailable');
  const resultsTopRef = useRef<HTMLDivElement | null>(null);

  /* ── Debounced filters (300ms) ─────────────────────────────── */
  const debType = useDebounce(typeFilter, 300);
  const debMust = useDebounce(mustHaveFilter, 300);
  const debCategory = useDebounce(categoryFilter, 300);
  const debPriceRange = useDebounce(priceRange, 300);
  const debSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (initialCategory) {
      setCategoryFilter(prev => prev.includes(initialCategory) ? prev : [initialCategory]);
    }
  }, [initialCategory]);

  /* ── Fetch ── */
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setServiceUnavailable(false);
    setServiceErrorText('Database service is temporarily unavailable');
    try {
      const p = new URLSearchParams();
      const effectivePage = page;
      const effectiveSortBy = sortBy;
      const unpackResult = (result: any): { raw: any[]; total: number; pages: number } => {
        if (result?.success && result?.data) {
          const raw = result.data.content ?? [];
          return {
            raw,
            total: result.data.totalElements ?? raw.length,
            pages: result.data.totalPages ?? 1,
          };
        }
        if (result?.data && Array.isArray(result.data)) {
          return { raw: result.data, total: result.data.length, pages: 1 };
        }
        if (result?.tests) {
          return {
            raw: result.tests,
            total: result.total_count ?? result.tests.length,
            pages: result.total_pages ?? 1,
          };
        }
        if (Array.isArray(result)) {
          return { raw: result, total: result.length, pages: 1 };
        }
        return { raw: [], total: 0, pages: 1 };
      };
      const normaliseItems = (rawItems: any[]): MedSyncTestCardData[] => rawItems.map((t: any) => ({
        ...t,
        id: t.id ?? Math.random(),
        name: t.testName ?? t.packageName ?? t.name ?? 'Unknown Test',
        originalPrice: t.originalPrice ?? t.mrpPrice ?? t.price,
        parametersCount: t.parametersCount ?? t.totalTests ?? t.testsCount,
        category: t.categoryName ?? t.category ?? 'General',
        canonicalTag: t.testCode ?? t.slug ?? t.canonicalTag ?? String(t.id),
        isTopBooked: t.isTopBooked ?? false,
        isTopDeal: t.isTopDeal ?? false,
      }));

      p.append('page', String(effectivePage));
      p.append('limit', String(ITEMS_PER_PAGE));

      const rawCats = [
        ...(defaultCategory ? [defaultCategory] : []),
        ...debCategory,
      ].filter(c => c && c !== 'All Lab Tests');
      const cats = [...new Set(
        rawCats.flatMap(c => CATEGORY_DB_MAP[c] || [c])
      )];

      if (cats.length > 0) {
        cats.forEach(c => p.append('category', c));
      }

      if (debMust.length > 0) {
        // Must-have is treated as an OR search — pick first selected
        const mustSearch = debMust[0];
        p.append('search', mustSearch);
      }

      if (debSearchQuery) p.append('search', debSearchQuery);

      const showTests = debType.includes('Tests');
      const showPackages = debType.includes('Packages') || packagesOnly;

      if (showTests && !showPackages) p.append('item_type', 'TEST');
      else if (showPackages && !showTests) p.append('item_type', 'PACKAGE');

      if (debType.includes('Top Deals') || debType.includes('Special Offers')) p.append('is_top_deal', 'true');
      if (debType.includes('Top Booked') || trendingMode) p.append('is_top_booked', 'true');
      if (debType.includes('Fastest Report')) p.append('max_turnaround_hours', '24');
      if (debType.includes('Special Offers')) p.append('min_discount_percentage', '30');

      if (effectiveSortBy !== 'relevance') p.append('sort_by', effectiveSortBy);

      if (debPriceRange[0] > 0) p.append('min_price', String(debPriceRange[0]));
      if (debPriceRange[1] < 15000) p.append('max_price', String(debPriceRange[1]));

      const url = `/api/lab-tests/advanced?${p.toString()}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });

      if (!res.ok) {
        setServiceUnavailable(true);
        setServiceErrorText(`Request failed with status code ${res.status}`);
        setItems([]);
        setTotalCount(0);
        setTotalPages(1);
        return;
      }

      const result = await res.json();
      const { raw, total, pages } = unpackResult(result);
      const normalised = normaliseItems(raw);

      setItems(normalised);
      setTotalCount(total);
      setTotalPages(Math.max(1, pages));
    } catch (err) {
      setServiceUnavailable(true);
      setServiceErrorText(getApiErrorMessage(err, 'Database service is temporarily unavailable'));
      setItems([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, debType, debMust, debCategory, debPriceRange, debSearchQuery, packagesOnly, trendingMode, defaultCategory, location.pathname]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    if (page > 1) {
      resultsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [page]);

  const handleSortChange = (val: string) => {
    setSortBy(val);
    setPage(1);
  };

  const clearAll = () => {
    setTypeFilter([]);
    setMustHaveFilter([]);
    setCategoryFilter(defaultCategory ? [defaultCategory] : []);
    setPriceRange([0, 15000]);
    setPage(1);
  };

  const hasBreadcrumb = !!breadcrumb;
  const cleanTitle = title.replace(/^[^\p{L}\p{N}]+/u, '').trim();

  return (
    <div className="min-h-screen bg-background text-smooth">
      <div className="max-w-[1200px] w-full mx-auto px-4 md:px-5 py-8 md:py-9">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3 mb-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1 px-4 py-1 rounded-full border border-[#b8cfdb] text-[#005f7b] text-[10px] font-black uppercase tracking-[0.16em] hover:bg-white/70"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <nav aria-label="Breadcrumb" className="inline-flex items-center text-[11px] font-black uppercase tracking-[0.14em]">
                <span className="inline-flex items-center gap-1 text-[#6f9fb3] cursor-pointer hover:text-[#5c8ea3]" onClick={() => navigate('/')}>
                  <Home className="w-3.5 h-3.5" />
                  Home
                </span>
                <ChevronRight className="w-3.5 h-3.5 mx-1 text-[#a8c0cb] shrink-0" />
                <span className="text-[#8aa0bb] cursor-pointer hover:text-[#6f8fad]" onClick={() => navigate('/lab-tests')}>Lab Tests</span>
                {hasBreadcrumb && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 mx-1 text-[#a8c0cb] shrink-0" />
                    <span className="text-[#005d79]">{breadcrumb}</span>
                  </>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 bg-cyan-500/10 backdrop-blur-md rounded-xl border border-cyan-500/20 shadow-sm">
                <FlaskConical className="w-5 h-5 text-cyan-600" />
              </div>
              <span className="text-[clamp(0.62rem,0.58rem+0.16vw,0.72rem)] font-black uppercase tracking-[0.22em] text-cyan-800/60">
                LAB TESTS / RESULTS
              </span>
            </div>
            <h1 className="text-[clamp(1.7rem,1.2rem+1.7vw,2.7rem)] font-black text-[#164E63] tracking-tight mb-2.5 uppercase">
              {cleanTitle}
              {!loading && (
                <span className="ml-2 text-[clamp(1rem,0.9rem+0.5vw,1.4rem)] font-black text-cyan-700/50">({totalCount.toLocaleString('en-IN')})</span>
              )}
            </h1>
            <p className="text-[clamp(0.84rem,0.8rem+0.3vw,1rem)] text-cyan-900/60 font-medium leading-relaxed">
              Filter and compare lab tests across category, pricing and reporting speed.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex gap-3 p-2 bg-white/40 backdrop-blur-md rounded-xl border border-white/60">
              <div className="px-4 py-2 bg-white/60 rounded-lg border border-white/80 shadow-sm text-center min-w-[84px]">
                <span className="block text-[clamp(1.1rem,0.95rem+0.5vw,1.4rem)] font-black text-cyan-700 tracking-tight">{totalCount}</span>
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</span>
              </div>
            </div>

            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 shadow-sm hover:shadow-md transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={e => handleSortChange(e.target.value)}
                aria-label="Sort tests by"
                className="appearance-none pl-4 pr-9 py-2 rounded-xl border border-slate-200 bg-white text-[13px] font-bold text-slate-700 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-200 hover:shadow-md transition-all"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>
        </header>

        <div className="flex gap-6">
        <FilterSidebar
          typeFilter={typeFilter}
          mustHaveFilter={mustHaveFilter}
          categoryFilter={categoryFilter}
          priceRange={priceRange}
          onTypeChange={v => { setTypeFilter(v); setPage(1); }}
          onMustHaveChange={v => { setMustHaveFilter(v); setPage(1); }}
          onCategoryChange={v => { setCategoryFilter(v); setPage(1); }}
          onPriceChange={v => { setPriceRange(v); setPage(1); }}
          onClearAll={clearAll}
          accent={accent}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          hideCategoryFilter={hideCategoryFilter}
          searchQuery={searchQuery}
          onSearchChange={v => { setSearchQuery(v); setPage(1); }}
        />

        <div className="flex-1 min-w-0">
          <div ref={resultsTopRef} />

          {debSearchQuery && (
            <div className="mb-6 flex items-center justify-between bg-teal-50/50 border border-teal-100 rounded-2xl px-5 py-3 shadow-sm">
              <p className="text-sm text-slate-600 font-medium">
                Showing results for <span className="text-teal-700 font-bold">"{debSearchQuery}"</span>
              </p>
              <button
                onClick={() => { setSearchQuery(''); setPage(1); }}
                className="flex items-center gap-1.5 text-xs font-black text-teal-700 uppercase tracking-wider hover:underline"
              >
                <X className="w-3 h-3" /> Clear Search
              </button>
            </div>
          )}

          <FilterPills
            typeFilter={typeFilter}
            categoryFilter={categoryFilter}
            mustHaveFilter={mustHaveFilter}
            priceRange={priceRange}
            onRemoveType={v => setTypeFilter(typeFilter.filter(x => x !== v))}
            onRemoveCat={v => {
              const nextCats = categoryFilter.filter(x => x !== v);
              setCategoryFilter(nextCats);
              setPage(1);
              if (nextCats.length === 0) {
                navigate('/lab-tests/all-lab-tests');
              }
            }}
            onRemoveMust={v => setMustHaveFilter(mustHaveFilter.filter(x => x !== v))}
            onResetPrice={() => setPriceRange([0, 15000])}
            accent={accent}
          />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={loading ? `loading-${page}` : serviceUnavailable ? `error-${page}` : items.length === 0 ? `empty-${page}` : `data-${page}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {loading ? (
                <SkeletonGrid columns={6} count={18}>
                  <TestCardSkeleton />
                </SkeletonGrid>
              ) : serviceUnavailable ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-white border border-slate-200 rounded-2xl">
                  <span className="text-4xl">⚠️</span>
                  <p className="text-lg font-black text-slate-700">{serviceErrorText}</p>
                  <p className="text-sm text-slate-500 max-w-sm">
                    Please try again in a few minutes.
                  </p>
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                  <span className="text-6xl">🔬</span>
                  <p className="text-lg font-black text-slate-700">No tests found</p>
                  <p className="text-sm text-slate-400 max-w-xs">
                    Try clearing your filters or searching for a different category.
                  </p>
                  <button
                    onClick={clearAll}
                    className="mt-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90"
                    style={{ background: accent }}
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="medsync-test-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {items.map(item => (
                    <MedSyncTestCard key={`${item.itemType ?? 'test'}-${item.id}`} item={item} variant="small" />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {!loading && totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center gap-2.5">
              <p className="text-[11px] font-semibold text-slate-500">
                Page {page} of {totalPages}
              </p>

              <nav
                aria-label="Pagination"
                className="inline-flex items-center justify-center gap-1 p-1.5 rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-all font-bold text-sm"
                  aria-label="Previous page"
                >
                  ‹
                </button>

                {pageNumbers(page, totalPages).map((n, i) =>
                  n === '…' ? (
                    <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs font-semibold">
                      …
                    </span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(Number(n))}
                      aria-current={page === n ? 'page' : undefined}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-extrabold transition-all border"
                      style={
                        page === n
                          ? { background: accent, color: '#fff', borderColor: accent, boxShadow: '0 6px 14px rgba(13, 124, 124, 0.22)' }
                          : { background: '#fff', color: '#334155', borderColor: '#cbd5e1' }
                      }
                    >
                      {n}
                    </button>
                  )
                )}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-all font-bold text-sm"
                  aria-label="Next page"
                >
                  ›
                </button>
              </nav>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default TestListingLayout;
