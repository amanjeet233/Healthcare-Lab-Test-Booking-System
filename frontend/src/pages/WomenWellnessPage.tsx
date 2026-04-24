import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import MedSyncTestCard, { MedSyncTestCardData, MedSyncTestCardSkeleton } from '../components/ui/MedSyncTestCard';

/* ──────────────────────────────────────────────────────────────────
   WOMEN WELLNESS PAGE
   Route: /test-listing/women-wellness

   Two sections:
     1. Women Wellness Tests  (individual tests, isPackage=false)
     2. Women Wellness Packages (isPackage=true)

   Filter sidebar:
     - "Tests" checkbox  → show only tests
     - "Packages" checkbox → show only packages
     - (both checked or neither) → show both

   Data source: GET /api/lab-tests?category=womens-health (mixed)
   + fallback GET /api/packages?category=womens-health for packages
──────────────────────────────────────────────────────────────────*/

const ACCENT = '#BE185D';
const WOMEN_DB_CATEGORIES = ['Obstetrics', 'Hormones', 'Hematology'];
const WOMEN_CATEGORY_OPTIONS = [
  'PCOD / PCOS', 'Pregnancy', 'Hormones', 'Thyroid',
  'Bone Health', 'Iron Studies', 'Fertility', 'STI Screening',
];
const ITEMS_PER_PAGE = 18; // 6 columns x 3 rows on desktop

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'PCOD / PCOS': ['pcod', 'pcos', 'ovary', 'androgen', 'hormone'],
  'Pregnancy': ['pregnancy', 'obstetric', 'hcg', 'beta-hcg', 'antenatal'],
  'Hormones': ['hormone', 'endocrine', 'estrogen', 'progesterone', 'testosterone', 'fsh', 'lh'],
  'Thyroid': ['thyroid', 'tsh', 't3', 't4'],
  'Bone Health': ['bone', 'calcium', 'vitamin d', 'd3'],
  'Iron Studies': ['iron', 'ferritin', 'hemoglobin', 'anaemia', 'anemia'],
  'Fertility': ['fertility', 'amh', 'semen', 'sperm', 'ovarian'],
  'STI Screening': ['sti', 'std', 'hiv', 'syphilis', 'vdrl', 'hepatitis'],
};

const safeIdString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'bigint') return String(value);
  return '0';
};

const toFiniteNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  if (typeof value === 'bigint') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const normalizeCurrency = (value: unknown): number => {
  const raw = toFiniteNumber(value, 0);
  // Backend package APIs may return paise values (e.g. 149900) for 1499 INR.
  return raw >= 100000 ? Math.round(raw / 100) : raw;
};

/* ── Debounce ────────────────────────────────────────────────── */
function useDebounce<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/* ── Section heading ─────────────────────────────────────────── */
const SectionHeading: React.FC<{ label: string; count: number }> = ({ label, count }) => (
  <div className="flex items-center gap-3 mb-5">
    <h2 className="text-lg font-black text-slate-800">
      {label}
      <span className="ml-2 text-base font-semibold text-slate-400">({count})</span>
    </h2>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

/* ── Filter sidebar (inline, lighter than full TestListingLayout) */
interface SidebarProps {
  typeFilter: string[];
  categoryFilter: string[];
  onTypeChange: (v: string[]) => void;
  onCategoryChange: (v: string[]) => void;
  onClearAll: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const toggle = (arr: string[], val: string) =>
  arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

const WomenSidebar: React.FC<SidebarProps> = ({
  typeFilter, categoryFilter, onTypeChange, onCategoryChange, onClearAll, mobileOpen, onMobileClose,
}) => {
  const hasFilters = typeFilter.length > 0 || categoryFilter.length > 0;

  const inner = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" style={{ color: ACCENT }} />
          Filters
        </h2>
        <div className="flex items-center gap-3">
          {hasFilters && (
            <button
              onClick={onClearAll}
              className="text-[12px] font-bold hover:underline"
              style={{ color: ACCENT }}
            >
              Clear All
            </button>
          )}
          <button onClick={onMobileClose} className="md:hidden p-1 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Type section */}
      <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3">
        Type of Tests
      </p>
      <div className="flex flex-col gap-2">
        {['Tests', 'Packages'].map(t => (
          <label key={t} className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              id={`women-type-${t}`}
              checked={typeFilter.includes(t)}
              onChange={() => onTypeChange(toggle(typeFilter, t))}
              className="w-4 h-4 rounded cursor-pointer"
              style={{ accentColor: ACCENT }}
            />
            <span className="text-[13px] text-slate-600 group-hover:text-slate-900 transition-colors">
              {t}
            </span>
          </label>
        ))}
      </div>

      {/* Women-specific filters */}
      <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3 mt-5">
        Category
      </p>
      <div className="flex flex-col gap-2">
        {WOMEN_CATEGORY_OPTIONS.map(cat => (
          <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              id={`women-cat-${cat}`}
              checked={categoryFilter.includes(cat)}
              onChange={() => onCategoryChange(toggle(categoryFilter, cat))}
              className="w-4 h-4 rounded cursor-pointer"
              style={{ accentColor: ACCENT }}
            />
            <span className="text-[13px] text-slate-600 group-hover:text-slate-900 transition-colors">
              {cat}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 sticky top-20 self-start max-h-[calc(100vh-88px)] bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-y-auto no-scrollbar">
        {inner}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" onClick={onMobileClose}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative ml-auto w-72 h-full bg-white shadow-2xl p-5 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {inner}
          </div>
        </div>
      )}
    </>
  );
};

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */
const WomenWellnessPage: React.FC = () => {
  const [allItems, setAllItems] = useState<MedSyncTestCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [testPage, setTestPage] = useState(1);
  const [packagePage, setPackagePage] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ── SEO ──────────────────────────────────────────────────── */
  useEffect(() => {
    document.title = 'Women Wellness Tests — MedSync Lab Tests';
  }, []);

  /* ── Fetch ────────────────────────────────────────────────── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const parseTestRows = (result: any): any[] => {
        if (result?.success && result?.data) return result.data.content ?? [];
        if (result?.tests) return result.tests;
        if (Array.isArray(result?.data)) return result.data;
        if (Array.isArray(result)) return result;
        return [];
      };

      const parsePackageRows = (result: any): any[] => {
        if (Array.isArray(result?.data?.packages)) return result.data.packages;
        if (Array.isArray(result?.packages)) return result.packages;
        if (Array.isArray(result?.data?.content)) return result.data.content;
        if (Array.isArray(result?.content)) return result.content;
        if (Array.isArray(result?.data)) return result.data;
        if (Array.isArray(result)) return result;
        return [];
      };

      const p = new URLSearchParams();
      p.append('page', '1');
      p.append('limit', '180');
      WOMEN_DB_CATEGORIES.forEach((c) => p.append('category', c));
      p.append('sort_by', 'popular');

      const res = await fetch(`/api/lab-tests/advanced?${p.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`Women advanced fetch failed: ${res.status}`);
      const result = await res.json();

      let rawTests: any[] = parseTestRows(result);

      // Fallback: text search when category mapping gives sparse rows
      if (rawTests.length === 0) {
        const fb = new URLSearchParams();
        fb.append('page', '1');
        fb.append('limit', '180');
        fb.append('search', 'women hormones pregnancy pcod fertility');
        const fbRes = await fetch(`/api/lab-tests/advanced?${fb.toString()}`, {
          headers: { Accept: 'application/json' },
        });
        if (fbRes.ok) {
          const fbResult = await fbRes.json();
          rawTests = parseTestRows(fbResult);
        }
      }

      // Women packages: primary endpoint + fallback endpoint
      let rawPackages: any[] = [];
      try {
        const pkgRes = await fetch('/api/packages?category=women&limit=180', {
          headers: { Accept: 'application/json' },
        });
        if (pkgRes.ok) {
          const pkgResult = await pkgRes.json();
          rawPackages = parsePackageRows(pkgResult);
        }
      } catch {
        // Ignore and use fallback endpoint below
      }

      if (rawPackages.length === 0) {
        try {
          const fbPkgRes = await fetch('/api/lab-tests/packages?page=0&size=180&category=women', {
            headers: { Accept: 'application/json' },
          });
          if (fbPkgRes.ok) {
            const fbPkgResult = await fbPkgRes.json();
            rawPackages = parsePackageRows(fbPkgResult);
          }
        } catch {
          rawPackages = [];
        }
      }

      // Normalize tests
      const normalizedTests: MedSyncTestCardData[] = rawTests.map((t: any) => ({
        ...t,
        name:            t.testName       ?? t.packageName ?? t.name ?? 'Unknown',
        originalPrice:   t.originalPrice  ?? t.mrpPrice    ?? t.price,
        parametersCount: t.parametersCount ?? t.totalTests ?? t.testsCount,
        category:        t.categoryName   ?? t.category,
        canonicalTag:    t.canonicalTag   ?? t.slug        ?? t.testCode ?? safeIdString(t.id),
        isPackage:       t.isPackage      ?? (t.itemType === 'PACKAGE'),
        itemType:        t.itemType       ?? (t.isPackage ? 'PACKAGE' : 'TEST'),
      }));

      // Normalize packages
      const normalizedPackages: MedSyncTestCardData[] = rawPackages.map((pkg: any) => {
        const originalPrice = normalizeCurrency(
          pkg.originalPrice ??
          pkg.price ??
          pkg.totalPrice ??
          pkg.basePriceInPaise ??
          pkg.mrpPrice
        );
        const discountedPrice = normalizeCurrency(
          pkg.discountedPrice ??
          pkg.finalPrice ??
          pkg.salePrice ??
          pkg.price ??
          pkg.totalPrice
        );

        return {
          ...pkg,
          id: toFiniteNumber(pkg.id ?? pkg.packageId, 0),
          name: pkg.packageName ?? pkg.name ?? 'Women Wellness Package',
          price: discountedPrice || originalPrice,
          originalPrice: originalPrice || discountedPrice,
          parametersCount: toFiniteNumber(pkg.totalTests ?? pkg.testCount ?? pkg.testsCount, 1),
          category: pkg.categoryName ?? pkg.category ?? 'Women Wellness',
          canonicalTag: pkg.packageCode ?? pkg.slug ?? `package-${safeIdString(pkg.id ?? pkg.packageId)}`,
          isPackage: true,
          itemType: 'PACKAGE',
        };
      });

      const deduped = [...normalizedTests, ...normalizedPackages].filter((item, index, arr) => {
        const itemType = item.isPackage || item.itemType === 'PACKAGE' ? 'PACKAGE' : 'TEST';
        const key = `${itemType}:${item.canonicalTag ?? item.id ?? item.name}`.toLowerCase();
        return arr.findIndex((x) => {
          const xType = x.isPackage || x.itemType === 'PACKAGE' ? 'PACKAGE' : 'TEST';
          const xKey = `${xType}:${x.canonicalTag ?? x.id ?? x.name}`.toLowerCase();
          return xKey === key;
        }) === index;
      });

      setAllItems(deduped);
    } catch {
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Split by type ────────────────────────────────────────── */
  const tests    = useMemo(() => allItems.filter(i => !i.isPackage && i.itemType !== 'PACKAGE'), [allItems]);
  const packages = useMemo(() => allItems.filter(i => i.isPackage || i.itemType === 'PACKAGE'), [allItems]);

  const matchesWomenCategory = useCallback((item: MedSyncTestCardData): boolean => {
    if (categoryFilter.length === 0) return true;
    const haystack = [
      item.name,
      item.category,
      (item as any).description,
      (item as any).testCode,
      (item as any).canonicalTag,
    ].filter(Boolean).join(' ').toLowerCase();

    return categoryFilter.some((selected) => {
      const keys = CATEGORY_KEYWORDS[selected] ?? [selected.toLowerCase()];
      return keys.some((k) => haystack.includes(k.toLowerCase()));
    });
  }, [categoryFilter]);

  const filteredTests = useMemo(
    () => tests.filter(matchesWomenCategory),
    [tests, matchesWomenCategory]
  );
  const filteredPackages = useMemo(
    () => packages.filter(matchesWomenCategory),
    [packages, matchesWomenCategory]
  );

  /* ── Visibility based on type filter ─────────────────────── */
  const showTests    = typeFilter.length === 0 || typeFilter.includes('Tests');
  const showPackages = typeFilter.length === 0 || typeFilter.includes('Packages');

  const clearAll = () => {
    setTypeFilter([]);
    setCategoryFilter([]);
    setTestPage(1);
    setPackagePage(1);
  };

  /* ── Active pills ─────────────────────────────────────────── */
  const pills = [
    ...typeFilter.filter(t => t === 'Tests' || t === 'Packages'),
    ...categoryFilter,
  ];

  const totalTestPages = Math.max(1, Math.ceil(filteredTests.length / ITEMS_PER_PAGE));
  const totalPackagePages = Math.max(1, Math.ceil(filteredPackages.length / ITEMS_PER_PAGE));
  const paginatedTests = filteredTests.slice((testPage - 1) * ITEMS_PER_PAGE, testPage * ITEMS_PER_PAGE);
  const paginatedPackages = filteredPackages.slice((packagePage - 1) * ITEMS_PER_PAGE, packagePage * ITEMS_PER_PAGE);

  useEffect(() => {
    setTestPage(1);
    setPackagePage(1);
  }, [typeFilter, categoryFilter]);

  useEffect(() => {
    if (testPage > totalTestPages) setTestPage(totalTestPages);
  }, [testPage, totalTestPages]);

  useEffect(() => {
    if (packagePage > totalPackagePages) setPackagePage(totalPackagePages);
  }, [packagePage, totalPackagePages]);

  const skeletonGrid = (n = 6, isPkg = false) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: n }).map((_, i) => (
        <MedSyncTestCardSkeleton key={i} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero header ─────────────────────────────────────── */}
      <div
        className="w-full px-4 md:px-8 pt-6 pb-6"
        style={{
          background: `linear-gradient(135deg, ${ACCENT}12 0%, white 70%)`,
          borderBottom: `2px solid ${ACCENT}22`,
        }}
      >
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-slate-400 font-medium flex-wrap">
            <li>
              <Link to="/" className="hover:text-slate-700 transition-colors flex items-center gap-1">
                <Home className="w-3 h-3" />Home
              </Link>
            </li>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            <li>
              <Link to="/lab-tests" className="hover:text-slate-700 transition-colors">Lab Tests</Link>
            </li>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            <li className="font-semibold text-slate-700">Women Wellness</li>
          </ol>
        </nav>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-800 leading-tight">
              💜 Women Wellness
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Comprehensive health panels for PCOD, hormones, pregnancy & more
            </p>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden self-start flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="flex gap-6 px-4 md:px-8 py-6">

        {/* Filter sidebar */}
        <WomenSidebar
          typeFilter={typeFilter}
          categoryFilter={categoryFilter}
          onTypeChange={v => setTypeFilter(v)}
          onCategoryChange={v => setCategoryFilter(v)}
          onClearAll={clearAll}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* Right pane */}
        <div className="flex-1 min-w-0">

          {/* Active filter pills */}
          {pills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {pills.map(p => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold border"
                  style={{ borderColor: `${ACCENT}44`, color: ACCENT, background: `${ACCENT}10` }}
                >
                  {p}
                  <button
                    onClick={() => {
                      setTypeFilter(typeFilter.filter(x => x !== p));
                      setCategoryFilter(categoryFilter.filter(x => x !== p));
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* ── Tests section ─────────────────────────────── */}
          {showTests && (
            <section className="mb-10">
              {loading ? (
                <>
                  <div className="h-7 w-56 bg-slate-200 rounded animate-pulse mb-5" />
                  {skeletonGrid(6, false)}
                </>
              ) : (
                <>
                  <SectionHeading label="Women Wellness Tests" count={filteredTests.length} />
                  {filteredTests.length > 0 ? (
                    <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {paginatedTests.map(item => (
                        <MedSyncTestCard key={`test-${item.id}`} item={item} />
                      ))}
                    </div>
                    {totalTestPages > 1 && (
                      <div className="mt-5 flex items-center justify-center gap-2">
                        <button
                          onClick={() => setTestPage(p => Math.max(1, p - 1))}
                          disabled={testPage === 1}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 disabled:opacity-40"
                        >
                          Prev
                        </button>
                        <span className="text-xs font-semibold text-slate-500">
                          Page {testPage} of {totalTestPages}
                        </span>
                        <button
                          onClick={() => setTestPage(p => Math.min(totalTestPages, p + 1))}
                          disabled={testPage === totalTestPages}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    )}
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <p className="text-4xl mb-3">🔬</p>
                      <p className="text-sm font-bold">No individual tests found</p>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {/* Divider between sections */}
          {showTests && showPackages && !loading && packages.length > 0 && (
            <div className="border-t border-slate-100 mb-10" />
          )}

          {/* ── Packages section ──────────────────────────── */}
          {showPackages && (
            <section>
              {loading ? (
                <>
                  <div className="h-7 w-56 bg-slate-200 rounded animate-pulse mb-5" />
                  {skeletonGrid(3, true)}
                </>
              ) : (
                <>
                <SectionHeading label="Women Wellness Packages" count={filteredPackages.length} />
                  {filteredPackages.length > 0 ? (
                    <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {paginatedPackages.map(item => (
                        <MedSyncTestCard key={`pkg-${item.id}`} item={item} />
                      ))}
                    </div>
                    {totalPackagePages > 1 && (
                      <div className="mt-5 flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPackagePage(p => Math.max(1, p - 1))}
                          disabled={packagePage === 1}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 disabled:opacity-40"
                        >
                          Prev
                        </button>
                        <span className="text-xs font-semibold text-slate-500">
                          Page {packagePage} of {totalPackagePages}
                        </span>
                        <button
                          onClick={() => setPackagePage(p => Math.min(totalPackagePages, p + 1))}
                          disabled={packagePage === totalPackagePages}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    )}
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <p className="text-4xl mb-3">📦</p>
                      <p className="text-sm font-bold">No packages found</p>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {/* Empty state when both types are filtered out */}
          {!loading && !showTests && !showPackages && (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">💜</p>
              <p className="text-lg font-black text-slate-700">No results</p>
              <button
                onClick={clearAll}
                className="mt-4 px-6 py-2.5 rounded-xl text-white text-sm font-bold"
                style={{ background: ACCENT }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WomenWellnessPage;
