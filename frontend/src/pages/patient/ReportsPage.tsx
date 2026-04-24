import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity,
    AlertTriangle,
    Brain,
    Calendar,
    CalendarDays,
    CheckCircle2,
    Download,
    FileText,
    RefreshCcw,
    Search,
    Stethoscope,
    XCircle,
    UtensilsCrossed,
    Loader2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { reportService, type AIAnalysis, type ReportDisplay } from '../../services/reportService';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import { ReportCardSkeleton } from '../../components/common/SkeletonLoader';
import { notify } from '../../utils/toast';

const STATUS_BADGE: Record<string, string> = {
    PENDING_VERIFICATION: 'bg-amber-50 text-amber-700 border-amber-200',
    VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    COMPLETED: 'bg-teal-50 text-teal-700 border-teal-200'
};

const canDownload = (status: string) => status === 'VERIFIED' || status === 'COMPLETED';

type ReportStatusFilter = 'ALL' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'COMPLETED';

const getHealthScoreClass = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (score >= 60) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (score >= 40) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-rose-100 text-rose-700 border-rose-200';
};

const getSeverityClass = (severity: string) => {
    switch (severity?.toUpperCase()) {
        case 'CRITICAL':
            return 'bg-rose-50 text-rose-700 border-rose-200';
        case 'MODERATE':
            return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'MILD':
            return 'bg-amber-50 text-amber-700 border-amber-200';
        default:
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
};

const recommendationIcon = (category: string) => {
    switch ((category ?? '').toUpperCase()) {
        case 'DIET':
            return <UtensilsCrossed size={14} />;
        case 'LIFESTYLE':
            return <Activity size={14} />;
        case 'FOLLOWUP':
            return <CalendarDays size={14} />;
        case 'CONSULT':
            return <Stethoscope size={14} />;
        default:
            return <Brain size={14} />;
    }
};

const ReportsPage: React.FC = () => {
    const MAX_AI_RETRIES = 10;
    const AI_RETRY_DELAY_MS = 3000;

    const navigate = useNavigate();
    const [reports, setReports] = useState<ReportDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<ReportStatusFilter>('ALL');
    const [aiAnalysisByBooking, setAiAnalysisByBooking] = useState<Record<number, AIAnalysis | null>>({});
    const [aiLoadingByBooking, setAiLoadingByBooking] = useState<Record<number, boolean>>({});
    const [showAiByBooking, setShowAiByBooking] = useState<Record<number, boolean>>({});
    const [downloadingByBooking, setDownloadingByBooking] = useState<Record<number, boolean>>({});
    const [activeDownloadId, setActiveDownloadId] = useState<number | null>(null);
    const [downloadStatus, setDownloadStatus] = useState<string>('');
    const aiRetryCountRef = useRef<Record<number, number>>({});
    const aiRetryTimerRef = useRef<Record<number, number>>({});

    useEffect(() => {
        void loadReports();
    }, []);

    useEffect(() => {
        return () => {
            Object.values(aiRetryTimerRef.current).forEach((timerId) => window.clearTimeout(timerId));
            aiRetryTimerRef.current = {};
        };
    }, []);

    const loadReports = async () => {
        setLoading(true);
        try {
            const data = await reportService.getMyReports();
            setReports(data);
        } catch (error) {
            console.error(error);
            notify.error('Failed to load reports.');
        } finally {
            setLoading(false);
        }
    };

    const refreshReports = async () => {
        setRefreshing(true);
        try {
            const data = await reportService.getMyReports();
            setReports(data);
            notify.success('Reports updated.');
        } catch (error) {
            console.error(error);
            notify.error('Failed to refresh reports.');
        } finally {
            setRefreshing(false);
        }
    };

    const filtered = useMemo(() => {
        if (!search.trim()) return reports;
        const q = search.toLowerCase();
        return reports.filter((r) => {
            const matchSearch = r.testName.toLowerCase().includes(q) || String(r.bookingId).includes(q);
            const matchStatus = statusFilter === 'ALL' ? true : r.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [reports, search, statusFilter]);

    const verifiedCount = reports.filter((r) => r.status === 'VERIFIED' || r.status === 'COMPLETED').length;
    const pendingCount = reports.filter((r) => r.status === 'PENDING_VERIFICATION').length;
    const verifiedReports = reports.filter((r) => r.status === 'VERIFIED' || r.status === 'COMPLETED');

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('ALL');
    };

    const hasFilters = search.trim().length > 0 || statusFilter !== 'ALL';

    const handleDownload = async (bookingId: number) => {
        if (downloadingByBooking[bookingId]) return;
        
        setDownloadingByBooking(prev => ({ ...prev, [bookingId]: true }));
        setActiveDownloadId(bookingId);
        setDownloadStatus('Preparing download...');

        try {
            setDownloadStatus('Downloading PDF...');
            await reportService.downloadReport(bookingId);
            notify.success('Report downloaded successfully.');
        } catch (error: any) {
            console.error("Report Download Failed:", error);
            notify.error(`Download Error: ${error.message || 'Unable to download report'}`);
        } finally {
            setDownloadingByBooking(prev => ({ ...prev, [bookingId]: false }));
            setActiveDownloadId(null);
            setDownloadStatus('');
        }
    };

    const clearAiRetryTimer = (bookingId: number) => {
        const timer = aiRetryTimerRef.current[bookingId];
        if (timer) {
            window.clearTimeout(timer);
            delete aiRetryTimerRef.current[bookingId];
        }
    };

    const loadAiAnalysis = async (bookingId: number, isRetry = false) => {
        if (!isRetry) {
            aiRetryCountRef.current[bookingId] = 0;
            clearAiRetryTimer(bookingId);
        }
        setAiLoadingByBooking((prev) => ({ ...prev, [bookingId]: true }));
        try {
            const analysis = await reportService.getAIAnalysis(bookingId);
            if (!analysis) {
                throw new Error('AI_PENDING');
            }
            setAiAnalysisByBooking((prev) => ({ ...prev, [bookingId]: analysis }));
            aiRetryCountRef.current[bookingId] = 0;
            clearAiRetryTimer(bookingId);
        } catch (error) {
            const message = String((error as Error)?.message || '');
            if (message === 'AI_PENDING') {
                const attempts = (aiRetryCountRef.current[bookingId] || 0) + 1;
                aiRetryCountRef.current[bookingId] = attempts;
                if (attempts >= MAX_AI_RETRIES) {
                    notify.error('AI insights are taking longer than expected. Please retry.');
                    setAiLoadingByBooking((prev) => ({ ...prev, [bookingId]: false }));
                    return;
                }
                clearAiRetryTimer(bookingId);
                aiRetryTimerRef.current[bookingId] = window.setTimeout(() => {
                    void loadAiAnalysis(bookingId, true);
                }, AI_RETRY_DELAY_MS);
                return;
            }
            console.error(error);
            notify.error('Failed to load AI insights.');
        } finally {
            const hasPendingTimer = Boolean(aiRetryTimerRef.current[bookingId]);
            if (!hasPendingTimer) {
                setAiLoadingByBooking((prev) => ({ ...prev, [bookingId]: false }));
            }
        }
    };

    const toggleInsights = async (bookingId: number) => {
        const isOpen = Boolean(showAiByBooking[bookingId]);
        setShowAiByBooking((prev) => ({ ...prev, [bookingId]: !isOpen }));
        if (isOpen) {
            clearAiRetryTimer(bookingId);
            setAiLoadingByBooking((prev) => ({ ...prev, [bookingId]: false }));
            return;
        }
        if (!isOpen && aiAnalysisByBooking[bookingId] === undefined) {
            await loadAiAnalysis(bookingId);
        }
    };

    if (loading) {
        return (
            <div className="max-w-[1200px] w-full mx-auto px-4 md:px-5 py-8 md:py-9 min-h-screen space-y-4">
                {[1, 2, 3].map((idx) => (
                    <ReportCardSkeleton key={idx} />
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] w-full mx-auto px-4 md:px-5 py-8 md:py-9 min-h-screen">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <nav className="inline-flex items-center text-[11px] font-black uppercase tracking-[0.14em]">
                            <span className="text-[#6f9fb3] cursor-pointer hover:text-[#5c8ea3]" onClick={() => navigate('/')}>Home</span>
                            <ChevronRight className="w-3.5 h-3.5 mx-1 text-[#a8c0cb]" />
                            <span className="text-[#005d79]">My Reports</span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-2.5 mb-3">
                        <div className="p-2 bg-cyan-500/10 backdrop-blur-md rounded-xl border border-cyan-500/20 shadow-sm">
                            <FileText className="w-5 h-5 text-cyan-600" />
                        </div>
                        <span className="text-[clamp(0.62rem,0.58rem+0.16vw,0.72rem)] font-black uppercase tracking-[0.22em] text-cyan-800/60">
                            REPORTS / INSIGHTS
                        </span>
                    </div>
                    <h1 className="text-[clamp(1.7rem,1.2rem+1.7vw,2.7rem)] font-black text-[#164E63] tracking-tight mb-2.5 uppercase">
                        My <span className="text-cyan-600">Reports</span>
                    </h1>
                    <p className="text-[clamp(0.84rem,0.8rem+0.3vw,1rem)] text-cyan-900/60 font-medium leading-relaxed">
                        View verified reports, download files, and review AI-based health insights.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex gap-3 p-2 bg-white/40 backdrop-blur-md rounded-xl border border-white/60">
                        <div className="px-4 py-2 bg-white/60 rounded-lg border border-white/80 shadow-sm text-center min-w-[84px]">
                            <span className="block text-[clamp(1.1rem,0.95rem+0.5vw,1.4rem)] font-black text-cyan-700 tracking-tight">{reports.length}</span>
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                        </div>
                        <div className="px-4 py-2 bg-white/60 rounded-lg border border-white/80 shadow-sm text-center min-w-[84px]">
                            <span className="block text-[clamp(1.1rem,0.95rem+0.5vw,1.4rem)] font-black text-emerald-600 tracking-tight">{verifiedCount}</span>
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Verified</span>
                        </div>
                        <div className="px-4 py-2 bg-white/60 rounded-lg border border-white/80 shadow-sm text-center min-w-[84px]">
                            <span className="block text-[clamp(1.1rem,0.95rem+0.5vw,1.4rem)] font-black text-amber-600 tracking-tight">{pendingCount}</span>
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Pending</span>
                        </div>
                    </div>

                    <GlassButton
                        onClick={() => void refreshReports()}
                        className="h-full px-6 py-3.5"
                        icon={<RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} />}
                        loading={refreshing}
                    >
                        REFRESH
                    </GlassButton>
                </div>
            </header>

            {verifiedReports.length > 0 && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-emerald-800">
                            {verifiedReports.length === 1
                                ? 'Your report is ready!'
                                : `${verifiedReports.length} reports are ready!`}
                        </p>
                        <p className="text-xs text-emerald-600 mt-0.5">
                            Verified by Medical Officer. Click Download to save your report.
                        </p>
                    </div>
                </div>
            )}

            <GlassCard className="mb-7 border-cyan-100/30">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[240px]">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Search</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600/50" size={18} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by test name or booking ID"
                                className="w-full bg-white/50 border border-white/50 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-500/5 rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium transition-all"
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-auto">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Status Filter</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as ReportStatusFilter)}
                            className="w-full bg-white/50 border border-white/50 focus:border-cyan-400/50 rounded-xl px-4 py-2.5 text-sm font-black uppercase tracking-wider text-slate-700 appearance-none cursor-pointer"
                        >
                            <option value="ALL">All</option>
                            <option value="PENDING_VERIFICATION">Pending Verification</option>
                            <option value="VERIFIED">Verified</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    {hasFilters && (
                        <div className="pt-6">
                            <button
                                onClick={clearFilters}
                                className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                title="Clear Filters"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>
                    )}
                </div>
            </GlassCard>

            {filtered.length === 0 ? (
                <div className="py-24 text-center">
                    <div className="inline-flex p-10 bg-cyan-50/50 backdrop-blur-md rounded-[50px] text-cyan-200 mb-8 border border-cyan-100/30 shadow-inner">
                        <FileText size={72} strokeWidth={1} />
                    </div>
                    <h3 className="text-3xl font-black text-[#164E63] tracking-tight mb-3 uppercase">No Reports Found</h3>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest max-w-sm mx-auto">
                        No reports match your current filters.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((report) => {
                        const badgeClass = STATUS_BADGE[report.status] ?? 'bg-slate-50 text-slate-600 border-slate-200';
                        const bookingDate = report.bookingDate ? new Date(report.bookingDate).toLocaleDateString('en-IN') : 'N/A';
                        const reportDate = report.reportDate ? new Date(report.reportDate).toLocaleString('en-IN') : 'Pending';

                        return (
                            <div 
                                key={report.bookingId} 
                                onClick={() => navigate(`/smart-reports/${report.bookingId}`)}
                                className="bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-5 shadow-lg shadow-cyan-900/5 cursor-pointer hover:bg-white/90 transition-all hover:shadow-cyan-900/10"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-black text-[#164E63] tracking-tight uppercase">{report.testName}</h3>
                                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-600">
                                            <p className="flex items-center gap-2 font-semibold">
                                                <Calendar size={14} />
                                                Booking Date: {bookingDate}
                                            </p>
                                            <p className="font-semibold">Booking ID: {report.bookingId}</p>
                                            <p className="font-semibold">Verified By: {report.verifiedByName || 'Pending'}</p>
                                            <p className="font-semibold">Report Date: {reportDate}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-start md:items-end gap-3">
                                        <span className={`px-3 py-1 rounded-md border text-xs font-black uppercase tracking-wider ${badgeClass}`}>
                                            {report.status}
                                        </span>

                                        {canDownload(report.status) ? (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 border border-red-200 text-red-700 text-[11px] font-black uppercase tracking-wider">
                                                    <FileText size={14} />
                                                    PDF
                                                </span>

                                                <GlassButton
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/smart-reports/${report.bookingId}`);
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                    icon={<Brain size={15} />}
                                                    className="!rounded-lg !px-3"
                                                >
                                                    AI Insights
                                                </GlassButton>

                                                <GlassButton
                                                    onClick={(e) => { e.stopPropagation(); void handleDownload(report.bookingId); }}
                                                    size="sm"
                                                    icon={<Download size={16} />}
                                                    className="!rounded-lg !px-4"
                                                    loading={downloadingByBooking[report.bookingId]}
                                                >
                                                    Download
                                                </GlassButton>
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold">
                                                Pending PDF
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {showAiByBooking[report.bookingId] && (
                                    <div className="mt-4 border-t border-slate-200/60 pt-4 space-y-4">
                                        {aiLoadingByBooking[report.bookingId] ? (
                                            <div className="text-sm text-cyan-700 font-semibold">Generating your health insights...</div>
                                        ) : aiAnalysisByBooking[report.bookingId] ? (
                                            <>
                                                <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-4">
                                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                                        <h4 className="text-sm font-black uppercase tracking-wider text-cyan-800">AI Health Insights</h4>
                                                        <span className={`px-3 py-1 rounded-md border text-xs font-black ${getHealthScoreClass(aiAnalysisByBooking[report.bookingId]!.healthScore)}`}>
                                                            Health Score: {aiAnalysisByBooking[report.bookingId]!.healthScore}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-700">{aiAnalysisByBooking[report.bookingId]!.summary}</p>
                                                </div>

                                                {aiAnalysisByBooking[report.bookingId]!.flags.length > 0 && (
                                                    <div>
                                                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Risk Flags</h5>
                                                        <div className="grid gap-2">
                                                            {aiAnalysisByBooking[report.bookingId]!.flags.map((flag, idx) => (
                                                                <div key={`${flag.testName}-${idx}`} className="rounded-lg border border-slate-200 bg-white p-3">
                                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                        <span className="text-sm font-bold text-slate-800">{flag.testName}</span>
                                                                        <span className="text-xs text-slate-600">Value: {flag.value}</span>
                                                                        <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${getSeverityClass(flag.severity)}`}>
                                                                            {flag.severity}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-slate-600">{flag.clinicalNote}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {aiAnalysisByBooking[report.bookingId]!.patterns.length > 0 && (
                                                    <div>
                                                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Detected Patterns</h5>
                                                        <div className="space-y-2">
                                                            {aiAnalysisByBooking[report.bookingId]!.patterns.map((pattern, idx) => (
                                                                <div key={`${report.bookingId}-pattern-${idx}`} className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                                                                    <div className="flex items-start gap-2">
                                                                        <AlertTriangle size={14} className="mt-0.5 text-amber-600" />
                                                                        <span>{pattern}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {aiAnalysisByBooking[report.bookingId]!.recommendations.length > 0 && (
                                                    <div>
                                                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Recommendations</h5>
                                                        <div className="grid gap-2">
                                                            {aiAnalysisByBooking[report.bookingId]!.recommendations.map((rec, idx) => (
                                                                <div key={`${report.bookingId}-rec-${idx}`} className="rounded-lg border border-slate-200 bg-white p-3">
                                                                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-800 mb-1">
                                                                        {recommendationIcon(rec.category)}
                                                                        {rec.category}
                                                                    </div>
                                                                    <p className="text-sm text-slate-700">{rec.text}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                                    {aiAnalysisByBooking[report.bookingId]!.disclaimer || 'AI-generated insights are for informational purposes only and do not replace medical advice.'}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2 text-sm text-cyan-800 font-semibold">
                                                Generating your health insights...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            {/* Global Download Overlay */}
            {activeDownloadId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-cyan-900/40 backdrop-blur-md pointer-events-none">
                    <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center max-w-xs w-full border border-cyan-100 animate-in fade-in zoom-in duration-300 pointer-events-auto">
                        <div className="relative mb-6">
                            <Loader2 size={48} className="text-cyan-600 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FileText size={20} className="text-cyan-800" />
                            </div>
                        </div>
                        <h3 className="text-lg font-black text-cyan-900 uppercase tracking-tight mb-2">Generating Report</h3>
                        <p className="text-xs text-cyan-700 font-bold uppercase tracking-widest text-center animate-pulse">
                            {downloadStatus}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
