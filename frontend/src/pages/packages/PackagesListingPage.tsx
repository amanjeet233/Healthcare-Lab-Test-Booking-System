import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Shield,
    Sparkles,
    Diamond,
    Medal,
    Activity,
    Check,
    Heart,
    User,
    Users,
    Baby,
    ChevronRight,
    ChevronLeft,
    Search,
    Filter,
    ArrowRight,
    Zap,
    FlaskConical,
    Clock,
    ShoppingBag,
    ArrowUpDown
} from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../hooks/useCart';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import SkeletonBlock from '../../components/common/SkeletonBlock';
import { notify } from '../../utils/toast';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';

const PackageType = {
    MEN: "MEN", WOMEN: "WOMEN", COUPLE: "COUPLE",
    CHILD: "CHILD", SENIOR_MEN: "SENIOR_MEN",
    SENIOR_WOMEN: "SENIOR_WOMEN", VITAMINS: "VITAMINS"
} as const;

const PackageTier = {
    SILVER: "SILVER", GOLD: "GOLD", PLATINUM: "PLATINUM", ADVANCED: "ADVANCED"
} as const;

const CATEGORIES = [
    { id: 'ALL', label: 'All Protocols', icon: Activity },
    { id: PackageType.MEN, label: "Men", icon: User },
    { id: PackageType.WOMEN, label: "Women", icon: Heart },
    { id: PackageType.COUPLE, label: 'Couple', icon: Users },
    { id: PackageType.CHILD, label: 'Child', icon: Baby },
    { id: 'SENIOR', label: 'Senior', icon: Users },
    { id: PackageType.VITAMINS, label: 'Vitamins', icon: Sparkles }
];

const TIERS = [
    { id: 'ALL', label: 'All Series', icon: Activity, color: 'text-slate-500' },
    { id: PackageTier.SILVER, label: 'Silver', icon: Medal, color: 'text-slate-400' },
    { id: PackageTier.GOLD, label: 'Gold', icon: Medal, color: 'text-amber-500' },
    { id: PackageTier.PLATINUM, label: 'Platinum', icon: Diamond, color: 'text-cyan-500' },
    { id: PackageTier.ADVANCED, label: 'Advanced', icon: Shield, color: 'text-rose-500' }
];

const SORT_OPTIONS = [
    { id: 'relevance', label: 'Relevance' },
    { id: 'price_asc', label: 'Price: Low to High' },
    { id: 'price_desc', label: 'Price: High to Low' },
    { id: 'discount_desc', label: 'Discount %' },
    { id: 'most_booked', label: 'Most Booked' }
] as const;

const PackagesListingPage: React.FC = () => {
    const { pathTier, pathCategory } = useParams<{ pathTier?: string; pathCategory?: string }>();
    const [packages, setPackages] = useState<any[]>([]);
    const [totalPackages, setTotalPackages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>(
        pathCategory ? CATEGORIES.find(c => c.id.toString().toLowerCase() === pathCategory.toLowerCase())?.id || 'ALL' : 'ALL'
    );
    const [activeTier, setActiveTier] = useState<string>(
        pathTier ? TIERS.find(t => t.id.toString().toLowerCase() === pathTier.toLowerCase())?.id || 'ALL' : 'ALL'
    );
    const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]['id']>('relevance');
    const [currentPage, setCurrentPage] = useState(1);

    const navigate = useNavigate();
    const { addPackage, isInCart } = useCart();
    const pageSize = 8;

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (activeCategory !== 'ALL') query.set('category', activeCategory.toLowerCase());
            if (activeTier !== 'ALL') query.set('tier', activeTier.toLowerCase());
            query.set('sort', 'price');
            query.set('limit', '500');

            const res = await api.get(`/api/packages?${query.toString()}`);
            const rows = res.data?.data?.packages || res.data?.packages || [];
            setTotalPackages(Number(res.data?.data?.total ?? rows.length ?? 0));
            const normalized = rows.map((row: any, index: number) => ({
                id: Number(row.id),
                packageCode: row.code || row.packageCode || String(row.id),
                packageName: row.name,
                packageTier: (row.tier || '').toUpperCase(),
                totalTests: row.testCount ?? 0,
                turnaroundHours: row.turnaroundHours ?? 48,
                totalPrice: Number((row.basePriceInPaise ?? 0) / 100),
                discountedPrice: Number((row.finalPrice ?? 0) / 100),
                discountPercentage: Number(row.discountPercentage ?? 0),
                bookingCount: Number(row.bookingCount ?? 0),
                displayOrder: Number(row.displayOrder ?? index + 1),
                bestFor: row.description,
                isPopular: Boolean(row.isPopular ?? (index % 7 === 0))
            }));
            setPackages(normalized);
        } catch (error) {
            console.error('Failed to fetch packages:', error);
            setTotalPackages(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
        window.scrollTo(0, 0);
    }, [activeCategory, activeTier]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, activeTier, sortBy]);

    useEffect(() => {
        setCurrentPage((prev) => {
            const maxPage = Math.max(1, Math.ceil(sortedPackages.length / pageSize));
            return prev > maxPage ? maxPage : prev;
        });
    }, [packages.length, sortBy]);

    const sortedPackages = [...packages].sort((a, b) => {
        switch (sortBy) {
            case 'price_asc':
                return a.discountedPrice - b.discountedPrice;
            case 'price_desc':
                return b.discountedPrice - a.discountedPrice;
            case 'discount_desc':
                return b.discountPercentage - a.discountPercentage;
            case 'most_booked':
                return (b.bookingCount - a.bookingCount) || Number(b.isPopular) - Number(a.isPopular) || a.displayOrder - b.displayOrder;
            case 'relevance':
            default:
                return a.displayOrder - b.displayOrder;
        }
    });

    const totalPages = Math.max(1, Math.ceil(sortedPackages.length / pageSize));
    const paginatedPackages = sortedPackages.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const pageWindowStart = Math.max(1, currentPage - 2);
    const pageWindowEnd = Math.min(totalPages, pageWindowStart + 4);
    const visiblePages: number[] = [];
    for (let p = pageWindowStart; p <= pageWindowEnd; p += 1) {
        visiblePages.push(p);
    }

    return (
        <div className="min-h-screen pb-10 pt-4">
            <header className="max-w-[1200px] mx-auto px-4 md:px-5 mb-5">
                <div className="inline-flex flex-wrap items-center gap-3 mb-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#a9c4d2] text-[#005f7b] text-[10px] font-black uppercase tracking-[0.16em] hover:bg-white/70 transition-colors"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Back
                    </button>
                    <nav className="inline-flex items-center text-[11px] font-black uppercase tracking-[0.14em]">
                        <span className="text-[#6f9fb3] cursor-pointer hover:text-[#5c8ea3]" onClick={() => navigate('/')}>Home</span>
                        <ChevronRight className="w-3.5 h-3.5 mx-1 text-[#a8c0cb]" />
                        <span className="text-[#005d79]">Health Packages</span>
                    </nav>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/20 shadow-sm">
                                <FlaskConical className="w-5 h-5 text-cyan-600" />
                            </div>
                            <span className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-cyan-800/60">
                                Diagnostic / Arsenals
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-text tracking-tighter mb-2">
                            Health <span className="text-cyan-600">Packages</span>
                        </h1>
                        <p className="text-base md:text-lg text-cyan-900/60 font-medium leading-relaxed">
                            Multivariate biomarker screening protocols designed for systemic analysis and longevity optimization.
                        </p>
                    </div>

                    <div className="flex items-center gap-5 px-7 py-4 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60">
                        <div className="text-center">
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Available Units</span>
                            <span className="text-2xl font-black text-[#164E63] tracking-tighter">{totalPackages}</span>
                        </div>
                        <div className="h-10 w-px bg-slate-200/50" />
                        <div className="text-center">
                            <Zap className="w-6 h-6 text-cyan-500 mx-auto" />
                            <span className="block text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">Operational</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1200px] mx-auto px-4 md:px-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Filters Sidebar */}
                <aside className="lg:col-span-3 space-y-4">
                    <GlassCard className="p-6 border-white/40 sticky top-20">
                        <div className="space-y-7">
                            <div>
                                <div className="flex items-center gap-2 mb-6">
                                    <Filter size={14} className="text-cyan-600" />
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Taxonomy / Type</h3>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {CATEGORIES.map(cat => {
                                        const Icon = cat.icon;
                                        const isActive = activeCategory === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => {
                                                    setActiveCategory(cat.id);
                                                    navigate(cat.id === 'ALL' ? '/packages' : `/packages/category/${cat.id.toLowerCase()}`, { replace: true });
                                                }}
                                                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${isActive
                                                    ? 'bg-[#164E63] text-white shadow-xl shadow-cyan-900/20 translate-x-1'
                                                    : 'text-slate-500 hover:bg-white/50 hover:text-cyan-600'
                                                    }`}
                                            >
                                                <Icon size={16} className={isActive ? 'text-cyan-300' : 'text-slate-300'} />
                                                <span className="flex-1 text-left">{cat.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-5 border-t border-slate-100/50">
                                <div className="flex items-center gap-2 mb-6">
                                    <ArrowUpDown size={14} className="text-cyan-600" />
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Series / Tier</h3>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {TIERS.map(tier => {
                                        const Icon = tier.icon;
                                        const isActive = activeTier === tier.id;
                                        return (
                                            <button
                                                key={tier.id}
                                                onClick={() => {
                                                    setActiveTier(tier.id);
                                                    navigate(tier.id === 'ALL' ? '/packages' : `/packages/tier/${tier.id.toLowerCase()}`, { replace: true });
                                                }}
                                                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${isActive
                                                    ? 'bg-[#164E63] text-white shadow-xl shadow-cyan-900/20 translate-x-1'
                                                    : 'text-slate-500 hover:bg-white/50 hover:text-cyan-600'
                                                    }`}
                                            >
                                                <Icon size={16} className={isActive ? 'text-cyan-300' : tier.color} />
                                                <span className="flex-1 text-left">{tier.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </aside>

                {/* Results Grid */}
                <section className="lg:col-span-9">
                    {!loading && packages.length > 0 && (
                        <div className="mb-4 flex justify-end">
                            <div className="relative min-w-[220px]">
                                <ArrowUpDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as (typeof SORT_OPTIONS)[number]['id'])}
                                    className="w-full h-11 pl-10 pr-4 rounded-2xl border-2 border-cyan-300/70 bg-white/70 text-sm font-bold text-[#164E63] focus:outline-none focus:border-cyan-500"
                                >
                                    {SORT_OPTIONS.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <SkeletonBlock key={i} className="h-[320px] rounded-[24px] border border-white/30" />
                            ))}
                        </div>
                    ) : packages.length === 0 ? (
                        <GlassCard className="py-24 text-center border-dashed border-2 border-slate-200">
                            <Search size={48} className="text-slate-200 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-[#164E63] tracking-tight">No Protocol Alignment</h3>
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-tighter mt-2">Try recalibrating your search parameters.</p>
                            <GlassButton className="mt-8" onClick={() => { setActiveCategory('ALL'); setActiveTier('ALL'); }}>CLEAR FILTERS</GlassButton>
                        </GlassCard>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <AnimatePresence mode="popLayout">
                                    {paginatedPackages.map((pkg, idx) => {
                                        const inCart = isInCart(undefined, pkg.id);
                                        return (
                                            <motion.div
                                                key={pkg.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                <GlassCard className="h-full p-0 overflow-hidden flex flex-col group hover:border-cyan-200/50 border-white/40 transition-all">
                                                    <div className="p-3.5 lg:p-4 flex-1 flex flex-col">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <span className="px-3 py-1 rounded-lg bg-[#164E63]/5 text-[9px] font-black tracking-widest uppercase text-[#164E63]">
                                                                {pkg.packageTier} SERIES
                                                            </span>
                                                            {pkg.isPopular && (
                                                                <span className="flex items-center gap-1 text-[8px] font-black tracking-widest uppercase text-rose-500 bg-rose-50 px-2 py-1 rounded-full border border-rose-100 italic">
                                                                    <Zap fill="currentColor" size={8} /> Popular Choice
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className="text-lg font-black text-[#164E63] tracking-tight mb-1 leading-tight min-h-[2.8rem] group-hover:text-cyan-600 transition-colors uppercase cursor-pointer break-words" onClick={() => navigate(`/packages/${pkg.packageCode}`)}>
                                                            {pkg.packageName}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <Activity size={10} className="text-cyan-600" />
                                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{pkg.totalTests} PARAMETERS</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Clock size={10} className="text-cyan-600" />
                                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{pkg.turnaroundHours}H TAT</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] font-medium text-slate-400 leading-relaxed mb-4">
                                                            {pkg.bestFor || "Comprehensive diagnostic panel for complete physiological baseline synchronization."}
                                                        </p>
                                                    </div>

                                                    <div className="p-3.5 lg:p-4 bg-gradient-to-br from-cyan-500/5 to-transparent border-t border-white/20 mt-auto">
                                                        <div className="flex items-end justify-between gap-2 overflow-hidden">
                                                            <div className="flex flex-col min-w-0 flex-1">
                                                                <span className="text-[10px] text-slate-400 font-black line-through tracking-widest decoration-rose-500/30">₹{pkg.totalPrice}</span>
                                                                <span className="text-xl md:text-2xl font-black text-[#164E63] tracking-tighter leading-none whitespace-nowrap">₹{pkg.discountedPrice}</span>
                                                            </div>
                                                            <div className="flex items-center justify-end gap-1 shrink-0">
                                                                <GlassButton
                                                                    size="sm"
                                                                    onClick={async () => {
                                                                        try {
                                                                            if (!inCart) {
                                                                                await addPackage(Number(pkg.id), pkg.packageName, pkg.discountedPrice);
                                                                            }
                                                                        } catch (error: any) {
                                                                            notify.error(getApiErrorMessage(error, 'Failed to add package to cart'));
                                                                        }
                                                                    }}
                                                                    className={`h-8 w-8 !p-0 shrink-0 rounded-xl ${inCart ? 'bg-[#164E63] text-white' : ''}`}
                                                                    icon={inCart ? <Check size={14} /> : <ShoppingBag size={14} />}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </GlassCard>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                            {totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="h-9 w-9 rounded-xl border border-slate-200 bg-white/70 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    {visiblePages.map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`h-9 min-w-9 px-3 rounded-xl text-xs font-black tracking-wider transition-all ${page === currentPage
                                                ? 'bg-[#164E63] text-white shadow-lg shadow-cyan-900/20'
                                                : 'border border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="h-9 w-9 rounded-xl border border-slate-200 bg-white/70 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                                        aria-label="Next page"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>
        </div>
    );
};

export default PackagesListingPage;
