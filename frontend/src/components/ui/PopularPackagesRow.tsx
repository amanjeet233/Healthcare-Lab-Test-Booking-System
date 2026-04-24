import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, FileBarChart2, Users, Check } from 'lucide-react';
import api from '../../services/api';
import { TestPackageResponse } from '../../services/packageService';
import { useCart } from '../../hooks/useCart';

/* ─── Tier Config ────────────────────────────────────────────────── */
const TIER_CONFIG: Record<string, { label: string; badgeBg: string; badgeText: string; gradient: string }> = {
  SILVER:   { label: 'SILVER',   badgeBg: '#94A3B8', badgeText: '#fff', gradient: 'linear-gradient(135deg,#334155 0%,#64748B 100%)' },
  GOLD:     { label: 'GOLD',     badgeBg: '#F59E0B', badgeText: '#fff', gradient: 'linear-gradient(135deg,#92400E 0%,#F59E0B 100%)' },
  PLATINUM: { label: 'PLATINUM', badgeBg: '#9333EA', badgeText: '#fff', gradient: 'linear-gradient(135deg,#4C1D95 0%,#A855F7 100%)' },
  ADVANCED: { label: 'ADVANCED', badgeBg: '#0D7C7C', badgeText: '#fff', gradient: 'linear-gradient(135deg,#004E4E 0%,#2DD4BF 100%)' },
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  "Men's Health":    'linear-gradient(135deg,#1E3A5F 0%,#2563EB 100%)',
  "Women's Health":  'linear-gradient(135deg,#831843 0%,#EC4899 100%)',
  'Couple':          'linear-gradient(135deg,#7C2D12 0%,#F97316 100%)',
  'Child':           'linear-gradient(135deg,#14532D 0%,#4ADE80 100%)',
  'Senior Citizen':  'linear-gradient(135deg,#1E1B4B 0%,#6366F1 100%)',
  'Vitamins':        'linear-gradient(135deg,#713F12 0%,#EAB308 100%)',
};

const normalizeCurrency = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value >= 10000 ? Number((value / 100).toFixed(2)) : value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) return parsed >= 10000 ? Number((parsed / 100).toFixed(2)) : parsed;
  }
  return 0;
};

const formatPrice = (value: number): string => {
  const safe = Number(value || 0);
  return safe.toLocaleString('en-IN', {
    minimumFractionDigits: safe % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

const normalizePackage = (row: any): TestPackageResponse => {
  const price = normalizeCurrency(row.price ?? row.totalPrice ?? row.basePriceInPaise);
  const discountedPrice = normalizeCurrency(row.discountedPrice ?? row.finalPrice ?? row.salePrice ?? row.price ?? row.totalPrice);
  const safeDiscounted = discountedPrice || price;
  const computedDiscount = price > safeDiscounted ? Math.round(((price - safeDiscounted) / price) * 100) : 0;
  return {
    id: Number(row.id || 0),
    name: row.name || row.packageName || 'Health Package',
    packageName: row.packageName || row.name || 'Health Package',
    packageCode: row.packageCode || row.code || String(row.id || ''),
    description: row.description || '',
    price,
    discountedPrice: safeDiscounted,
    discountPercentage: Number(row.discountPercentage ?? computedDiscount),
    savings: Number(row.savings ?? Math.max(0, price - safeDiscounted)),
    totalTests: Number(row.totalTests ?? row.testCount ?? row.testsCount ?? 0),
    tests: row.tests || [],
    category: row.category || row.packageType || 'General',
    isPopular: Boolean(row.isPopular ?? row.popular ?? false),
  };
};

const getGradient = (pkg: TestPackageResponse): string => {
  if (CATEGORY_GRADIENTS[pkg.category]) return CATEGORY_GRADIENTS[pkg.category];
  const tier = pkg.name?.toUpperCase().match(/SILVER|GOLD|PLATINUM|ADVANCED/)?.[0];
  return (tier && TIER_CONFIG[tier]?.gradient) ?? 'linear-gradient(135deg,#006D77 0%,#2DD4BF 100%)';
};

const getTier = (name: string): keyof typeof TIER_CONFIG | null => {
  const match = name?.toUpperCase().match(/SILVER|GOLD|PLATINUM|ADVANCED/);
  return match ? (match[0] as keyof typeof TIER_CONFIG) : null;
};

const PackageCard: React.FC<{ pkg: TestPackageResponse }> = ({ pkg }) => {
  const navigate = useNavigate();
  const { addPackage, isInCart } = useCart();
  const inCart = isInCart(undefined, pkg.id);
  const tier = getTier(pkg.name || pkg.packageName);
  const tierCfg = tier ? TIER_CONFIG[tier] : null;
  const gradient = getGradient(pkg);
  const discount = pkg.discountPercentage || (pkg.price ? Math.round(((pkg.price - pkg.discountedPrice) / pkg.price) * 100) : 0);

  return (
    <div className="shrink-0 w-[270px] rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer bg-white">
      {/* Top gradient section */}
      <div
        className="relative p-5 flex flex-col gap-2"
        style={{ background: gradient, minHeight: '120px' }}
        onClick={() => navigate(`/packages/${pkg.packageCode || pkg.id}`)}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none translate-x-8 -translate-y-8" />
        {tierCfg && (
          <span className="self-start text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full" style={{ background: tierCfg.badgeBg, color: tierCfg.badgeText }}>
            {tierCfg.label}
          </span>
        )}
        <h3 className="text-[15px] font-black text-white leading-tight pr-2 line-clamp-2">{pkg.name || pkg.packageName}</h3>
        <p className="text-[11px] text-white/75 font-semibold">{pkg.totalTests} Tests Included</p>
      </div>
      {/* Bottom white section */}
      <div className="p-4 flex flex-col gap-3">
        <div className="space-y-1.5">
          {[{ icon: <Home className="w-3 h-3" />, text: 'Home Collection' }, { icon: <FileBarChart2 className="w-3 h-3" />, text: 'Smart Digital Report' }, { icon: <Users className="w-3 h-3" />, text: 'Doctor Consultation' },].map((h) => (
            <div key={h.text} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: '#D1FAE5' }}>
                <Check className="w-2.5 h-2.5 text-green-700" strokeWidth={3} />
              </div>
              <span className="text-[11px] text-slate-600 font-medium">{h.text}</span>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <span className="text-lg font-black" style={{ color: '#0D7C7C' }}>₹{formatPrice(pkg.discountedPrice || pkg.price)}</span>
          {pkg.price > (pkg.discountedPrice || 0) && <span className="text-[11px] text-slate-400 line-through font-medium mb-0.5">₹{formatPrice(pkg.price)}</span>}
          {discount > 0 && <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">{discount}% OFF</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/packages/${pkg.packageCode || pkg.id}`)} className="flex-1 py-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-wide transition-all active:scale-95" style={{ borderColor: '#0D7C7C', color: '#0D7C7C' }}>View Details</button>
          <button onClick={() => { if (!inCart) addPackage(pkg.id, pkg.name || pkg.packageName, pkg.discountedPrice || pkg.price); }} className="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide text-white transition-all active:scale-95 shadow-sm" style={{ background: '#0D7C7C' }}>{inCart ? 'Added ✓' : 'Add to Cart'}</button>
        </div>
      </div>
    </div>
  );
};

const PopularPackagesRow: React.FC = () => {
  const [packages, setPackages] = useState<TestPackageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);

  // Auto-scroll logic with infinite loop support
  useEffect(() => {
    const timer = setInterval(() => {
      if (scrollRef.current && !isHovered.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // If we reached the end of the duplicated list, jump back to start seamlessly
        if (scrollLeft + clientWidth >= scrollWidth - 2) {
          scrollRef.current.scrollLeft = 0;
        } else {
          scrollRef.current.scrollLeft += 1.2; // Slightly faster for premium feel
        }
      }
    }, 30); // Higher frequency for smoother motion
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchRealPackages = async () => {
      setLoading(true);
      setLoadError(false);
      const tryEndpoint = async (url: string): Promise<TestPackageResponse[]> => {
        try {
          const res = await api.get(url);
          const payload = res.data;
          const rows =
            payload?.data?.packages
            || payload?.packages
            || payload?.data?.content
            || payload?.content
            || payload?.data
            || payload;
          if (!Array.isArray(rows)) return [];
          return rows.map(normalizePackage).filter((p: TestPackageResponse) => p.id > 0);
        } catch {
          return [];
        }
      };

      const sources = [
        '/api/lab-tests/packages?page=0&size=12',
        '/api/lab-tests/packages/best-deals',
        '/api/packages?limit=12&sort=price',
        '/api/packages/popular?limit=12',
        'http://localhost:8080/api/lab-tests/packages?page=0&size=12',
      ];

      for (const src of sources) {
        const rows = await tryEndpoint(src);
        if (rows.length > 0) {
          setPackages(rows.slice(0, 10));
          setLoading(false);
          return;
        }
      }

      setPackages([]);
      setLoadError(true);
      setLoading(false);
    };

    fetchRealPackages();
  }, []);

  const scroll = (dir: 'left' | 'right') => scrollRef.current?.scrollBy({ left: dir === 'right' ? 570 : -570, behavior: 'smooth' });

  return (
    <div className="w-full">
      <div className="relative" onMouseEnter={() => (isHovered.current = true)} onMouseLeave={() => (isHovered.current = false)}>
        <button onClick={() => scroll('left')} aria-label="Scroll left" className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all hover:scale-110 active:scale-95">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 no-scrollbar"
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[270px] rounded-2xl overflow-hidden animate-pulse border border-slate-100">
                  <div className="h-[120px] bg-slate-100" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-slate-50 rounded w-3/4" />
                    <div className="h-3 bg-slate-50 rounded w-1/2" />
                    <div className="h-10 bg-slate-50 rounded-xl" />
                  </div>
                </div>
              ))
            : packages.length > 0
            ? [...packages, ...packages].map((pkg, idx) => (
                <PackageCard key={`${pkg.id}-${idx}`} pkg={pkg} />
              ))
            : (
                <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center">
                  <p className="text-sm font-bold text-slate-500">
                    {loadError ? 'Unable to load real packages right now.' : 'No packages available.'}
                  </p>
                </div>
              )
          }
        </div>

        <button onClick={() => scroll('right')} aria-label="Scroll right" className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all hover:scale-110 active:scale-95">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
        </button>
      </div>
    </div>
  );
};

export default PopularPackagesRow;
