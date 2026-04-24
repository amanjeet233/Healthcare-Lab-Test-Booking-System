import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Shield,
    Droplet,
    Clock,
    Check,
    Plus,
    Minus,
    ChevronLeft,
    Info,
    Activity,
    Copy,
    Share2,
    ExternalLink,
    BadgeCheck
} from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../hooks/useCart';
import './PackageDetailPage.css';

const PackageDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { addPackage, isInCart, setIsCartOpen } = useCart();

    const [pkg, setPkg] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'tests' | 'preparation' | 'compare'>('tests');
    const [expandedTestGroup, setExpandedTestGroup] = useState<string | null>(null);
    const [relatedPackages, setRelatedPackages] = useState<any[]>([]);
    const [loadingRelated, setLoadingRelated] = useState(false);
    const [faqOpen, setFaqOpen] = useState<number | null>(0);
    const [showPriceTip, setShowPriceTip] = useState(false);
    const [bookingNow, setBookingNow] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);

    const normalizePackageDetail = (raw: any) => {
        const fastingRaw = raw?.fastingRequired;
        const fastingRequired =
            typeof fastingRaw === 'string'
                ? fastingRaw.toLowerCase() !== 'none'
                : Boolean(fastingRaw);
        const fastingHours =
            raw?.fastingHours ??
            (typeof fastingRaw === 'string' && fastingRaw.toLowerCase().includes('hr')
                ? Number.parseInt(fastingRaw, 10) || null
                : null);

        const includedTestNames = Array.isArray(raw?.includedTestNames)
            ? raw.includedTestNames
            : Array.isArray(raw?.includedTests)
                ? raw.includedTests
                : Array.isArray(raw?.tests)
                    ? raw.tests.map((t: any) => t?.name || t?.testName).filter(Boolean)
                    : [];

        return {
            ...raw,
            totalTests: Number(raw?.totalTests ?? raw?.testCount ?? includedTestNames.length ?? 0),
            fastingRequired,
            fastingHours,
            includedTestNames,
        };
    };

    useEffect(() => {
        const fetchPkg = async () => {
            try {
                const res = await api.get(`/api/packages/${slug}`);
                const packageData = res.data?.data?.package || res.data?.data;
                if (packageData) {
                    setPkg(normalizePackageDetail(packageData));
                    return;
                }
            } catch (err) {
                console.error('Error fetching package:', err);
            }

            try {
                // Fallback: resolve package from list payload shape when detail endpoint is unavailable.
                const fallbackRes = await api.get('/api/packages?limit=500');
                const rows = fallbackRes.data?.data?.packages || fallbackRes.data?.packages || [];
                const matched = rows.find((row: any) => {
                    const rowCode = String(row.code || row.packageCode || '').toLowerCase();
                    const rowSlug = String(row.slug || '').toLowerCase();
                    const target = String(slug || '').toLowerCase();
                    return rowCode === target || rowSlug === target;
                });

                if (matched) {
                    setPkg(normalizePackageDetail({
                        id: matched.id,
                        packageCode: matched.code || matched.packageCode || slug,
                        packageName: matched.name || matched.packageName || 'Health Package',
                        packageType: matched.category || matched.packageType,
                        packageTier: matched.tier || matched.packageTier,
                        totalTests: matched.testCount ?? matched.totalTests ?? 0,
                        totalPrice: Number((matched.basePriceInPaise ?? matched.totalPrice ?? 0) / (matched.basePriceInPaise ? 100 : 1)),
                        discountedPrice: Number((matched.finalPrice ?? matched.discountedPrice ?? matched.price ?? 0) / (matched.finalPrice ? 100 : 1)),
                        discountPercentage: matched.discountPercentage ?? matched.discountPercent ?? 0,
                        description: matched.description || '',
                        bestFor: matched.description || matched.bestFor || '',
                        fastingRequired: Boolean(matched.fastingRequired),
                        fastingHours: matched.fastingHours ?? null,
                        turnaroundHours: matched.turnaroundHours ?? 48,
                        includedTestNames: Array.isArray(matched.includedTestNames) ? matched.includedTestNames : [],
                        preparations: Array.isArray(matched.preparations) ? matched.preparations : [],
                        features: Array.isArray(matched.features) ? matched.features : [],
                        benefits: Array.isArray(matched.benefits) ? matched.benefits : [],
                        isPopular: Boolean(matched.isPopular),
                        isRecommended: Boolean(matched.isRecommended),
                    }));
                } else {
                    setPkg(null);
                }
            } catch (fallbackErr) {
                console.error('Fallback package fetch failed:', fallbackErr);
                setPkg(null);
            } finally {
                setLoading(false);
            }
        };
        fetchPkg();
        window.scrollTo(0, 0);
    }, [slug]);

    useEffect(() => {
        if (!pkg?.id) return;
        const fetchRelatedPackages = async () => {
            setLoadingRelated(true);
            try {
                const category = String(pkg.packageType || pkg.category || '').toLowerCase();
                const query = new URLSearchParams();
                if (category) query.set('category', category);
                query.set('sort', 'price');
                query.set('limit', '30');

                const res = await api.get(`/api/packages?${query.toString()}`);
                const rows = res.data?.data?.packages || res.data?.packages || [];
                const normalized = rows
                    .map((row: any, index: number) => ({
                        id: Number(row.id),
                        packageName: row.name || row.packageName || 'Health Package',
                        packageCode: row.code || row.packageCode || String(row.id),
                        packageTier: String(row.tier || row.packageTier || 'STANDARD').toUpperCase(),
                        totalTests: Number(row.testCount ?? row.totalTests ?? 0),
                        discountedPrice: Number((row.finalPrice ?? row.discountedPrice ?? row.price ?? 0) / (row.finalPrice ? 100 : 1)),
                        totalPrice: Number((row.basePriceInPaise ?? row.totalPrice ?? row.price ?? 0) / (row.basePriceInPaise ? 100 : 1)),
                        displayOrder: Number(row.displayOrder ?? index + 1),
                    }))
                    .filter((r: any) => r.id && r.id !== Number(pkg.id))
                    .sort((a: any, b: any) => a.displayOrder - b.displayOrder);
                setRelatedPackages(normalized);
            } catch (error) {
                console.error('Failed to fetch related packages:', error);
                setRelatedPackages([]);
            } finally {
                setLoadingRelated(false);
            }
        };
        fetchRelatedPackages();
    }, [pkg?.id, pkg?.packageType, pkg?.category]);

    const inCart = isInCart(undefined, pkg?.id);
    const words = String(pkg?.packageName || 'Health Packages').trim().split(/\s+/);
    const heroPrimary = words[0] || 'Health';
    const heroAccent = words.slice(1).join(' ') || 'Packages';
    const discountPercentage = pkg?.totalPrice > 0 ? Math.max(0, Math.round(100 - (pkg.discountedPrice / pkg.totalPrice) * 100)) : 0;
    const resolvedFastingHours = Number(pkg?.fastingHours ?? 8);
    const formatPrice = (value: any) => {
        const n = Number(value || 0);
        return n.toLocaleString('en-IN', {
            minimumFractionDigits: n % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        });
    };
    const includedTests = useMemo(() => (Array.isArray(pkg?.includedTestNames) ? pkg.includedTestNames : []), [pkg?.includedTestNames]);
    const compareCandidates = useMemo(() => {
        const current = {
            id: Number(pkg?.id || 0),
            packageName: pkg?.packageName || 'Health Package',
            packageTier: pkg?.packageTier || 'STANDARD',
            totalTests: Number(pkg?.totalTests || 0),
            discountedPrice: Number(pkg?.discountedPrice || 0),
            totalPrice: Number(pkg?.totalPrice || 0),
            packageCode: pkg?.packageCode || pkg?.code || pkg?.id
        };
        return [current, ...relatedPackages.slice(0, 2)];
    }, [pkg, relatedPackages]);
    const faqItems = [
        {
            q: 'Is fasting required?',
            a: pkg?.fastingRequired ? `Yes. Please fast for ${resolvedFastingHours} hours before sample collection.` : 'No strict fasting is required for this package.',
        },
        {
            q: 'Is this suitable for this age group?',
            a: 'Yes, this package is suitable for preventive health monitoring. For specific symptoms, consult a doctor before booking.',
        },
        {
            q: 'Can I reschedule my booking?',
            a: 'Yes, you can reschedule before collection slot cut-off from your bookings section.',
        },
        {
            q: 'What is the refund policy?',
            a: 'Refund eligibility depends on booking stage and sample status. Cancelled bookings before collection are generally refundable.',
        },
    ];
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
    };
    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: pkg.packageName,
                    text: `${pkg.packageName} - ₹${formatPrice(pkg?.discountedPrice)}`,
                    url: window.location.href,
                });
                return;
            }
            await handleCopyLink();
        } catch (error) {
            console.error('Share cancelled/failed:', error);
        }
    };

    const resolvePackageForAction = () => {
        const packageId = Number(pkg?.id);
        const packagePrice = Number(pkg?.discountedPrice || pkg?.totalPrice || 0);
        const packageName = String(pkg?.packageName || 'Health Package');
        if (!Number.isFinite(packageId) || packageId <= 0) return null;
        return { packageId, packagePrice, packageName };
    };

    const handleBookNow = async () => {
        const payload = resolvePackageForAction();
        if (!payload || bookingNow) return;
        setBookingNow(true);
        try {
            setIsCartOpen(false);
            navigate('/booking', {
                state: {
                    cartItems: [{
                        packageId: payload.packageId,
                        packageName: payload.packageName,
                        name: payload.packageName,
                        quantity: 1,
                        price: payload.packagePrice
                    }],
                    total: payload.packagePrice
                }
            });
        } finally {
            setBookingNow(false);
        }
    };

    const handleAddToCart = async () => {
        const payload = resolvePackageForAction();
        if (!payload || addingToCart || inCart) return;
        setAddingToCart(true);
        try {
            await addPackage(payload.packageId, payload.packageName, payload.packagePrice);
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return <div className="packages-page packages-loading"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D7C7C]"></div></div>;
    }

    if (!pkg) {
        return (
            <div className="packages-page">
                <div className="empty-packages">
                    <span className="empty-icon">📦</span>
                    <h3>Package not found</h3>
                    <p>The package with code <strong>{slug}</strong> is not available.</p>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Please try browsing available packages.</p>
                    <button
                        onClick={() => navigate('/packages')}
                        style={{
                            marginTop: '16px',
                            padding: '10px 24px',
                            background: '#0D7C7C',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}
                    >
                        View All Packages
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="packages-page compact-ui flex flex-col font-sans">
            <div className="w-full px-4 md:px-6 lg:px-10 mb-2">
                <div className="flex items-center gap-3 text-[11px]">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#c5d7df] text-[#0a6077] text-[10px] font-black uppercase tracking-[0.14em] hover:bg-white"
                    >
                        <ChevronLeft size={14} />
                        Back
                    </button>
                    <nav className="inline-flex items-center text-[11px] font-black uppercase tracking-[0.14em]">
                        <span className="text-[#6f9fb3] cursor-pointer hover:text-[#5c8ea3]" onClick={() => navigate('/')}>Home</span>
                        <span className="mx-2.5 text-[#a8c0cb]">{'>'}</span>
                        <span className="text-[#0a6077] cursor-pointer hover:text-[#084e61]" onClick={() => navigate('/packages')}>Package</span>
                        <span className="mx-2.5 text-[#a8c0cb]">{'>'}</span>
                        <span className="text-[#005d79]">{pkg.packageName || 'Package Details'}</span>
                    </nav>
                </div>
            </div>
            {/* Dynamic Hero Section */}
            <div className="package-details-hero pt-4 pb-4 px-3 md:px-4 relative">
                <div className="max-w-[1080px] mx-auto relative z-10 hero-grid">
                    <div className="flex-1">
                        <div className="details-eyebrow mb-3">
                            <span className="details-eyebrow-icon">
                                <Activity size={22} />
                            </span>
                            <span className="details-eyebrow-text">DIAGNOSTIC / ARSENALS</span>
                        </div>

                        <h1 className="details-hero-title">
                            {heroPrimary} <span>{heroAccent}</span>
                        </h1>
                        <p className="details-hero-subtitle">{pkg.packageName}</p>
                        <p className="details-hero-description">{pkg.bestFor || pkg.description || 'Best for annual basic checkup'}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                                <BadgeCheck size={12} /> NABL Certified
                            </span>
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-full">
                                <Check size={12} /> Home Collection
                            </span>
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
                                <Clock size={12} /> Digital Report
                            </span>
                        </div>

                        <div className="details-chip-row">
                            <div className="details-chip">
                                <Droplet className="w-5 h-5 text-rose-500" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Fasting</span>
                                    <span className="text-xs font-black text-slate-800">{pkg.fastingRequired ? `${resolvedFastingHours} Hours` : 'Not Required'}</span>
                                </div>
                            </div>
                            <div className="details-chip">
                                <Clock className="w-5 h-5 text-cyan-600" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Reports In</span>
                                    <span className="text-xs font-black text-slate-800">{pkg.turnaroundHours} Hours</span>
                                </div>
                            </div>
                            <div className="details-chip">
                                <Shield className="w-5 h-5 text-emerald-600" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Tests Included</span>
                                    <span className="text-xs font-black text-slate-800">{pkg.totalTests} Parameters</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 w-full max-w-[420px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <span>Sample Collected</span>
                                <span>Report Ready ({pkg.turnaroundHours}h)</span>
                            </div>
                            <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full w-[72%] bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full" />
                            </div>
                        </div>
                    </div>

                    <aside className="package-detail-card sticky top-20 self-start">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-black tracking-widest text-[#0d7c7c] uppercase">{pkg.packageTier} Series</span>
                            <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1 rounded-full border border-red-100">
                                SAVE {discountPercentage}%
                            </span>
                        </div>
                        <div className="flex items-end gap-1.5 mb-3.5">
                            <span className="text-[32px] leading-none font-black text-[#0f1f47]">₹{formatPrice(pkg.discountedPrice)}</span>
                            <span className="text-xs text-slate-400 line-through mb-1">₹{formatPrice(pkg.totalPrice)}</span>
                            <div
                                className="relative mb-1"
                                onMouseEnter={() => setShowPriceTip(true)}
                                onMouseLeave={() => setShowPriceTip(false)}
                            >
                                <Info size={14} className="text-slate-400 cursor-help" />
                                <AnimatePresence>
                                    {showPriceTip && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 4 }}
                                            className="absolute right-0 top-5 z-20 min-w-[180px] p-2 rounded-lg border border-slate-200 bg-white shadow-lg text-[10px]"
                                        >
                                            <div className="flex justify-between text-slate-600"><span>MRP</span><span>₹{formatPrice(pkg.totalPrice)}</span></div>
                                            <div className="flex justify-between text-slate-600"><span>Discount</span><span>{discountPercentage}%</span></div>
                                            <div className="mt-1 pt-1 border-t border-slate-100 flex justify-between font-bold text-slate-800"><span>Final</span><span>₹{formatPrice(pkg.discountedPrice)}</span></div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        <div className="space-y-1.5 mb-3">
                            {(pkg.features?.length ? pkg.features.slice(0, 3) : ['Home Sample Collection', 'Smart Report via App', 'NABL Accredited LAB']).map((feat: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-1.5 text-[12px] text-[#334a68] font-medium">
                                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 inline-flex items-center justify-center">
                                        <Check size={12} strokeWidth={3} />
                                    </span>
                                    <span>{feat}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleBookNow}
                            className="w-full h-8 rounded-xl text-[11px] tracking-wider font-black uppercase transition-colors bg-[#0d7c7c] text-white hover:bg-[#0b6868]"
                        >
                            {bookingNow ? 'Processing...' : 'Book Now'}
                        </button>
                        <button
                            onClick={handleAddToCart}
                            disabled={inCart || addingToCart}
                            className="mt-1 w-full h-8 rounded-xl text-[11px] tracking-wider font-black uppercase transition-colors border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {inCart ? 'Added' : addingToCart ? 'Adding...' : 'Add to Cart'}
                        </button>
                        <div className="mt-1 flex items-center gap-1">
                            <button onClick={handleShare} className="flex-1 h-6 rounded-lg border border-slate-200 text-[8px] font-bold text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center gap-1">
                                <Share2 size={13} /> Share
                            </button>
                            <button onClick={handleCopyLink} className="flex-1 h-6 rounded-lg border border-slate-200 text-[8px] font-bold text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center gap-1">
                                <Copy size={13} /> Copy Link
                            </button>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-100">
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Recommended Add-ons</div>
                            <div className="space-y-1.5">
                                {(loadingRelated ? [] : relatedPackages.slice(0, 3)).map((item: any) => (
                                    <div key={item.id} className="rounded-lg border border-slate-200 p-1.5">
                                        <div className="text-[10px] font-bold text-slate-700 leading-tight line-clamp-2">{item.packageName}</div>
                                        <div className="mt-0.5 flex items-center justify-between">
                                            <span className="text-[11px] font-black text-[#164E63]">₹{formatPrice(item.discountedPrice)}</span>
                                            <button
                                                onClick={() => navigate(`/packages/${item.packageCode}`)}
                                                className="text-[9px] font-bold text-cyan-700 inline-flex items-center gap-1"
                                            >
                                                View <ExternalLink size={11} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {!loadingRelated && relatedPackages.length === 0 && (
                                    <p className="text-[11px] text-slate-400">No related add-ons available.</p>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 max-w-[1080px] mx-auto w-full px-3 md:px-4 py-3 pb-8">
                {/* Tabs */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 mb-5">
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                        {['tests', 'preparation', 'compare'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${activeTab === tab ? 'border-[#0D7C7C] text-[#0D7C7C]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                    }`}
                            >
                                {tab === 'tests' ? `Tests Included (${pkg.totalTests})` : tab === 'preparation' ? 'Preparation & Info' : 'Compare'}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setActiveTab('compare')}
                        className="hidden md:inline-flex items-center gap-1 h-7 px-2.5 rounded-lg border border-slate-200 bg-white text-[9px] font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50"
                    >
                        Compare Packages
                    </button>
                </div>

                {/* Tab Content */}
                <div className="max-w-4xl package-detail-flat">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'tests' && (
                                <div className="space-y-3">
                                    <p className="text-xs font-medium text-slate-500 mb-3">This package consists of {pkg.totalTests} individual test parameters. They are organized logically to cover all major functional profiles.</p>
                                    <div className="package-detail-content-card text-left overflow-hidden">
                                        <button
                                            onClick={() => setExpandedTestGroup((prev) => (prev === 'groupA' ? null : 'groupA'))}
                                            className="w-full flex items-center justify-between p-3 bg-transparent border-b border-slate-200"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white text-[#0D7C7C] border border-slate-200 rounded-xl"><Activity size={16} /></div>
                                                <div className="text-left">
                                                    <h3 className="text-sm font-black text-slate-800">Complete Profile</h3>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{includedTests.length} Tests</span>
                                                </div>
                                            </div>
                                            {expandedTestGroup === 'groupA' ? <Minus size={16} className="text-slate-400" /> : <Plus size={16} className="text-slate-400" />}
                                        </button>
                                        <AnimatePresence>
                                            {expandedTestGroup === 'groupA' && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.22 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-3 pt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {includedTests.map((testName: string, idx: number) => (
                                                            <div key={`${testName}-${idx}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-[#0D7C7C]" />
                                                                <span className="text-xs font-medium text-slate-700">{testName}</span>
                                                            </div>
                                                        ))}
                                                        {includedTests.length === 0 && (
                                                            <p className="text-xs text-slate-400 col-span-2 px-2 py-2">No tests available for this package.</p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'preparation' && (
                                <div className="package-detail-content-card text-left p-3 space-y-4">
                                    <div>
                                        <h3 className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-2 flex items-center gap-2"><Droplet size={12} /> Sample Requirements</h3>
                                        <div className="p-2.5 bg-orange-50 border border-orange-100 rounded-lg text-orange-800 text-xs font-medium">
                                            {pkg.fastingRequired
                                                ? `Please ensure you fast for ${resolvedFastingHours} hours before providing the sample. Drinking strictly water is allowed.`
                                                : 'No strict fasting required, but we recommend avoiding heavy meals 2 hours prior.'}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-2 flex items-center gap-2"><Info size={12} /> General Guidelines</h3>
                                        <ul className="space-y-2">
                                            <li className="flex items-start gap-2.5"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300" /> <span className="text-xs text-slate-600">Please inform the phlebotomist about any medications you are currently taking.</span></li>
                                            <li className="flex items-start gap-2.5"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300" /> <span className="text-xs text-slate-600">Wear loose, comfortable clothing for easy access to your arm.</span></li>
                                        </ul>
                                    </div>
                                    <div className="pt-2 border-t border-slate-100">
                                        <h3 className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-2">FAQs</h3>
                                        <div className="space-y-2">
                                            {faqItems.map((item, idx) => (
                                                <div key={idx} className="rounded-lg border border-slate-200 bg-white">
                                                    <button
                                                        onClick={() => setFaqOpen((prev) => (prev === idx ? null : idx))}
                                                        className="w-full p-2.5 text-left flex items-center justify-between gap-3"
                                                    >
                                                        <span className="text-xs font-semibold text-slate-700">{item.q}</span>
                                                        {faqOpen === idx ? <Minus size={14} className="text-slate-400" /> : <Plus size={14} className="text-slate-400" />}
                                                    </button>
                                                    <AnimatePresence>
                                                        {faqOpen === idx && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <p className="px-2.5 pb-2.5 text-xs text-slate-600">{item.a}</p>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'compare' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {compareCandidates.map((item: any, idx: number) => {
                                        const itemDiscount = item.totalPrice > 0 ? Math.round(100 - (item.discountedPrice / item.totalPrice) * 100) : 0;
                                        const isCurrent = Number(item.id) === Number(pkg.id);
                                        return (
                                            <div key={`${item.id}-${idx}`} className={`rounded-xl border p-3 ${isCurrent ? 'border-cyan-400 bg-cyan-50/40' : 'border-slate-200 bg-white'}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-700">{item.packageTier}</span>
                                                    {isCurrent && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700">Current</span>}
                                                </div>
                                                <h4 className="text-sm font-black text-slate-800 line-clamp-2 min-h-[38px]">{item.packageName}</h4>
                                                <p className="mt-1 text-[11px] text-slate-500">{item.totalTests} tests</p>
                                                <div className="mt-2 flex items-end gap-2">
                                                    <span className="text-lg font-black text-[#164E63]">₹{formatPrice(item.discountedPrice)}</span>
                                                    <span className="text-xs text-slate-400 line-through">₹{formatPrice(item.totalPrice)}</span>
                                                </div>
                                                <p className="text-[10px] text-emerald-600 font-bold mt-1">Save {Math.max(0, itemDiscount)}%</p>
                                                {!isCurrent && (
                                                    <button
                                                        onClick={() => navigate(`/packages/${item.packageCode}`)}
                                                        className="mt-3 h-8 w-full rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                                                    >
                                                        Compare This
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default PackageDetailPage;
