import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Activity, Bell, RefreshCw, AlertTriangle, Eye, X, Clock3, Users } from 'lucide-react';
import SystemStatsCards from '../../components/admin/SystemStatsCards';
import GrowthChart from '../../components/admin/charts/GrowthChart';
import RevenueChart from '../../components/admin/charts/RevenueChart';
import BookingTrendChart from '../../components/admin/charts/BookingTrendChart';
import { adminService, type SystemStats, type ChartDataPoint, type AuditLog, type CriticalBooking } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const querySearch = (searchParams.get('search') || '').trim();

    const [stats, setStats] = useState<SystemStats | null>(null);
    const [growthData, setGrowthData] = useState<ChartDataPoint[]>([]);
    const [revenueData, setRevenueData] = useState<ChartDataPoint[]>([]);
    const [bookingData, setBookingData] = useState<ChartDataPoint[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [criticalBookings, setCriticalBookings] = useState<CriticalBooking[]>([]);
    const [showCriticalPanel, setShowCriticalPanel] = useState(false);
    const [criticalLoading, setCriticalLoading] = useState(false);
    const [selectedCritical, setSelectedCritical] = useState<CriticalBooking | null>(null);
    const [opsBookings, setOpsBookings] = useState<any[]>([]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const results = await Promise.allSettled([
                adminService.getSystemStats(),
                adminService.getChartData('growth'),
                adminService.getChartData('revenue'),
                adminService.getChartData('bookings'),
                adminService.getAuditLogs(),
                adminService.getAllBookingsPage({ page: 0, size: 80 }),
            ]);

            const [statsRes, growthRes, revenueRes, bookingsRes, logsRes, allBookingsRes] = results;

            if (statsRes.status === 'fulfilled') {
                setStats(statsRes.value);
            }
            if (growthRes.status === 'fulfilled') {
                setGrowthData(growthRes.value || []);
            }
            if (revenueRes.status === 'fulfilled') {
                setRevenueData(revenueRes.value || []);
            }
            if (bookingsRes.status === 'fulfilled') {
                setBookingData(bookingsRes.value || []);
            }
            if (logsRes.status === 'fulfilled') {
                setAuditLogs(logsRes.value || []);
            }
            if (allBookingsRes.status === 'fulfilled') {
                setOpsBookings(allBookingsRes.value?.content || []);
            }
        } catch (err) {
            console.error('Failed to load admin dashboard data:', err);
            toast.error('Failed to load dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    const loadCriticalBookings = async () => {
        setCriticalLoading(true);
        try {
            const data = await adminService.getCriticalBookings();
            setCriticalBookings(data);
        } catch {
            // Fallback keeps panel usable even if critical endpoint fails.
            const fallback = opsBookings
                .filter((b) => !isClosedStatus(b.status))
                .filter((b) => normalizeStatus(b.status) === 'PENDING_VERIFICATION' || !b.technicianId || b.technicianName === 'Unassigned')
                .slice(0, 20)
                .map((b) => ({
                    id: b.id,
                    bookingReference: b.bookingReference,
                    patientName: b.patientName,
                    testName: b.testName,
                    flaggedDate: b.flaggedDate || b.updatedAt || b.createdAt || b.bookingDate,
                    status: b.status,
                    bookingDate: b.bookingDate,
                    timeSlot: b.timeSlot,
                    technicianName: b.technicianName,
                    collectionType: b.collectionType,
                    collectionAddress: b.collectionAddress,
                }));

            setCriticalBookings(fallback as CriticalBooking[]);
            toast.error('Critical API unavailable, showing fallback alerts');
        } finally {
            setCriticalLoading(false);
        }
    };

    const handleOpenCriticalPanel = async () => {
        setShowCriticalPanel(true);
        await loadCriticalBookings();
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadData();
        if (showCriticalPanel) {
            await loadCriticalBookings();
        }
        setIsRefreshing(false);
        toast.success('Telemetry synchronized');
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (querySearch) {
            navigate(`/admin/bookings?search=${encodeURIComponent(querySearch)}`, { replace: true });
        }
    }, [querySearch, navigate]);

    const normalizeStatus = (status?: string) => (status || '').toUpperCase();

    const isClosedStatus = (status?: string) => {
        const value = normalizeStatus(status);
        return value === 'COMPLETED' || value === 'CANCELLED';
    };

    const parseRecordDate = (booking: any): Date | null => {
        const directKeys = ['createdAt', 'updatedAt', 'flaggedDate'];
        for (const key of directKeys) {
            if (booking?.[key]) {
                const parsed = new Date(booking[key]);
                if (!Number.isNaN(parsed.getTime())) return parsed;
            }
        }

        if (booking?.bookingDate) {
            const combined = booking?.timeSlot
                ? new Date(`${booking.bookingDate} ${booking.timeSlot}`)
                : new Date(booking.bookingDate);
            if (!Number.isNaN(combined.getTime())) return combined;
        }

        return null;
    };

    const getAgeHours = (booking: any) => {
        const date = parseRecordDate(booking);
        if (!date) return 0;
        return Math.max(0, (Date.now() - date.getTime()) / (1000 * 60 * 60));
    };

    const alertSummary = useMemo(() => {
        const openBookings = opsBookings.filter((b) => !isClosedStatus(b.status));

        const unassigned = openBookings.filter((b) => !b.technicianId || b.technicianName === 'Unassigned').length;
        const overdueVerification = openBookings.filter((b) => normalizeStatus(b.status) === 'PENDING_VERIFICATION' && getAgeHours(b) > 8).length;
        const processingBreach = openBookings.filter((b) => ['SAMPLE_COLLECTED', 'PROCESSING'].includes(normalizeStatus(b.status)) && getAgeHours(b) > 12).length;
        const criticalOpen = criticalBookings.filter((b) => !isClosedStatus(b.status)).length;

        return {
            unassigned,
            overdueVerification,
            processingBreach,
            criticalOpen,
            total: unassigned + overdueVerification + processingBreach + criticalOpen,
        };
    }, [opsBookings, criticalBookings]);

    const tatMetrics = useMemo(() => {
        const openBookings = opsBookings.filter((b) => !isClosedStatus(b.status));

        const collectionPool = openBookings.filter((b) => normalizeStatus(b.status) === 'BOOKED');
        const processingPool = openBookings.filter((b) => ['SAMPLE_COLLECTED', 'PROCESSING'].includes(normalizeStatus(b.status)));
        const verificationPool = openBookings.filter((b) => normalizeStatus(b.status) === 'PENDING_VERIFICATION');

        const collectionBreached = collectionPool.filter((b) => getAgeHours(b) > 6).length;
        const processingBreached = processingPool.filter((b) => getAgeHours(b) > 12).length;
        const verificationBreached = verificationPool.filter((b) => getAgeHours(b) > 8).length;

        const safePct = (breached: number, total: number) => {
            if (!total) return 0;
            return Math.min(100, Math.round((breached / total) * 100));
        };

        return [
            {
                id: 'collection',
                label: 'Collection TAT',
                breached: collectionBreached,
                total: collectionPool.length,
                threshold: '6h',
                pct: safePct(collectionBreached, collectionPool.length),
            },
            {
                id: 'processing',
                label: 'Processing TAT',
                breached: processingBreached,
                total: processingPool.length,
                threshold: '12h',
                pct: safePct(processingBreached, processingPool.length),
            },
            {
                id: 'verification',
                label: 'Verification TAT',
                breached: verificationBreached,
                total: verificationPool.length,
                threshold: '8h',
                pct: safePct(verificationBreached, verificationPool.length),
            },
        ];
    }, [opsBookings]);

    const delayedCases = useMemo(() => {
        return opsBookings
            .filter((b) => !isClosedStatus(b.status))
            .map((b) => ({
                ...b,
                ageHours: getAgeHours(b),
            }))
            .sort((a, b) => b.ageHours - a.ageHours)
            .slice(0, 5);
    }, [opsBookings]);

    const staffLoad = useMemo(() => {
        const workloadMap = new Map<string, { assigned: number; completed: number; overdue: number }>();

        opsBookings.forEach((b) => {
            const techName = (b.technicianName || '').trim();
            if (!techName || techName.toLowerCase() === 'unassigned') return;

            const row = workloadMap.get(techName) || { assigned: 0, completed: 0, overdue: 0 };
            row.assigned += 1;
            if (normalizeStatus(b.status) === 'COMPLETED') row.completed += 1;
            if (!isClosedStatus(b.status) && getAgeHours(b) > 8) row.overdue += 1;
            workloadMap.set(techName, row);
        });

        return Array.from(workloadMap.entries())
            .map(([name, value]) => {
                const active = Math.max(0, value.assigned - value.completed);
                const completionRate = value.assigned ? Math.round((value.completed / value.assigned) * 100) : 0;
                return {
                    name,
                    assigned: value.assigned,
                    completed: value.completed,
                    overdue: value.overdue,
                    active,
                    completionRate,
                };
            })
            .sort((a, b) => b.active - a.active || b.overdue - a.overdue)
            .slice(0, 6);
    }, [opsBookings]);

    const bookingFunnel = useMemo(() => {
        const counts = {
            booked: 0,
            collected: 0,
            processing: 0,
            verified: 0,
            completed: 0,
        };

        opsBookings.forEach((b) => {
            const status = normalizeStatus(b.status);
            if (status === 'BOOKED' || status === 'REFLEX_PENDING') counts.booked += 1;
            if (status === 'SAMPLE_COLLECTED') counts.collected += 1;
            if (status === 'PROCESSING') counts.processing += 1;
            if (status === 'PENDING_VERIFICATION' || status === 'VERIFIED') counts.verified += 1;
            if (status === 'COMPLETED') counts.completed += 1;
        });

        const base = counts.booked || 1;
        return [
            { key: 'booked', label: 'Booked', value: counts.booked, pct: 100 },
            { key: 'collected', label: 'Collected', value: counts.collected, pct: Math.min(100, Math.round((counts.collected / base) * 100)) },
            { key: 'processing', label: 'Processing', value: counts.processing, pct: Math.min(100, Math.round((counts.processing / base) * 100)) },
            { key: 'verified', label: 'Verified', value: counts.verified, pct: Math.min(100, Math.round((counts.verified / base) * 100)) },
            { key: 'completed', label: 'Completed', value: counts.completed, pct: Math.min(100, Math.round((counts.completed / base) * 100)) },
        ];
    }, [opsBookings]);

    const financePulse = useMemo(() => {
        const paidStatuses = new Set(['PAID', 'SUCCESS', 'COMPLETED']);
        const paidBookings = opsBookings.filter((b) => paidStatuses.has(String(b.paymentStatus || '').toUpperCase()) && normalizeStatus(b.status) !== 'CANCELLED');
        const cancelledBookings = opsBookings.filter((b) => normalizeStatus(b.status) === 'CANCELLED');
        const revenue7d = revenueData.reduce((sum, item) => sum + Number(item.value || 0), 0);

        return {
            paidCount: paidBookings.length,
            cancelledCount: cancelledBookings.length,
            revenue7d,
        };
    }, [opsBookings, revenueData]);

    const getTatColor = (pct: number) => {
        if (pct >= 40) return 'text-red-600 bg-red-500';
        if (pct >= 20) return 'text-amber-600 bg-amber-500';
        return 'text-emerald-600 bg-emerald-500';
    };

    if (isLoading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-bg">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-sm font-black uppercase tracking-widest text-text/40">Initializing Command Center...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg pb-8">
            <div className="max-w-[1200px] w-full mx-auto px-5 md:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3 pt-5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-black text-cyan-700/70 uppercase tracking-[0.24em]">Admin Dashboard</span>
                        </div>
                        <h1 className="text-2xl font-black text-[#164E63] uppercase italic tracking-tight flex items-center gap-2.5">
                            System <span className="text-cyan-600 italic">Status</span>
                            <span className="bg-red-500 text-white text-[7px] px-2 py-0.5 rounded-full not-italic tracking-widest animate-pulse font-black shadow-lg shadow-red-500/20">OPERATIONAL</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/promo-codes')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/20"
                        >
                            Promo Codes
                        </button>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/40 border border-primary/5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:text-primary transition-all active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span>Sync Data</span>
                        </button>
                        <button
                            onClick={() => navigate('/admin/notifications')}
                            className="p-2.5 bg-white/40 border border-primary/5 rounded-lg text-text/40 hover:text-primary transition-all relative"
                            title="Notifications"
                            aria-label="Open notifications"
                        >
                            <Bell className="w-3.5 h-3.5" />
                            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-cta rounded-full border-2 border-white" />
                        </button>
                    </div>
                </div>

                <div className="mb-3">
                    <div className="inline-flex gap-2 p-1.5 bg-white/40 backdrop-blur-md rounded-lg border border-white/60">
                        <div className="px-3 py-1.5 bg-white/60 rounded-lg border border-white/80 shadow-sm text-center min-w-20">
                            <span className="block text-[clamp(1.1rem,0.95rem+0.5vw,1.4rem)] font-black text-cyan-700 tracking-tight">{stats?.totalUsers ?? 0}</span>
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Users</span>
                        </div>
                        <div className="px-3 py-1.5 bg-white/60 rounded-lg border border-white/80 shadow-sm text-center min-w-20">
                            <span className="block text-[clamp(1.1rem,0.95rem+0.5vw,1.4rem)] font-black text-amber-600 tracking-tight">{stats?.pendingBookings ?? 0}</span>
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Pending</span>
                        </div>
                        <div className="px-3 py-1.5 bg-white/60 rounded-lg border border-white/80 shadow-sm text-center min-w-20">
                            <span className="block text-[clamp(1.1rem,0.95rem+0.5vw,1.4rem)] font-black text-rose-600 tracking-tight">{stats?.criticalCount ?? 0}</span>
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Critical</span>
                        </div>
                    </div>
                </div>

                {stats && <SystemStatsCards stats={stats} />}

                <div className="mt-4">
                    <section className="bg-red-50 border border-red-200 rounded-xl p-3.5">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-xl">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-[12px] font-black uppercase tracking-widest text-red-700">Critical Alerts</h2>
                                    <p className="text-[10px] font-bold text-red-600/80">Bookings marked critical and not completed</p>
                                </div>
                            </div>
                            <button
                                onClick={handleOpenCriticalPanel}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all"
                            >
                                <span className="px-2 py-0.5 rounded-lg bg-white/20">{stats?.criticalCount ?? 0}</span>
                                View Alerts
                            </button>
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                    <section className="lg:col-span-2 bg-white/50 border border-primary/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text">Critical Alerts Snapshot</h3>
                            <button
                                onClick={() => navigate('/admin/bookings?status=PENDING_VERIFICATION')}
                                className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary-dark"
                            >
                                Investigate
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-red-600">Unassigned</p>
                                <p className="text-lg font-black text-red-700 leading-tight">{alertSummary.unassigned}</p>
                            </div>
                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-600">Verification Breach</p>
                                <p className="text-lg font-black text-amber-700 leading-tight">{alertSummary.overdueVerification}</p>
                            </div>
                            <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2">
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-orange-600">Processing Breach</p>
                                <p className="text-lg font-black text-orange-700 leading-tight">{alertSummary.processingBreach}</p>
                            </div>
                            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2">
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-rose-600">Critical Open</p>
                                <p className="text-lg font-black text-rose-700 leading-tight">{alertSummary.criticalOpen}</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-text text-white rounded-2xl p-4 border border-white/10">
                        <p className="text-[8px] font-black uppercase tracking-[0.23em] text-primary">Alert Volume</p>
                        <p className="text-3xl font-black mt-1">{alertSummary.total}</p>
                        <p className="text-[10px] font-bold text-white/70 mt-1">Total active operational alerts</p>
                        <button
                            onClick={handleOpenCriticalPanel}
                            className="mt-4 w-full py-2 rounded-lg bg-white text-text text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                        >
                            Open Critical Panel
                        </button>
                    </section>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                    <section className="lg:col-span-1 bg-white/50 border border-primary/10 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock3 className="w-4 h-4 text-primary" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text">SLA / TAT Tracker</h3>
                        </div>
                        <div className="space-y-3">
                            {tatMetrics.map((metric) => {
                                const tone = getTatColor(metric.pct);
                                const barColor = tone.split(' ')[1];
                                return (
                                    <div key={metric.id} className="rounded-xl border border-primary/10 p-2.5">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-[10px] font-black uppercase tracking-wide text-text">{metric.label}</p>
                                            <span className={`text-[9px] font-black ${tone.split(' ')[0]}`}>{metric.breached}/{metric.total || 0}</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${barColor}`} style={{ width: `${metric.pct}%` }} />
                                        </div>
                                        <p className="text-[8px] font-bold text-text/50 mt-1 uppercase tracking-wider">Threshold {metric.threshold}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="lg:col-span-2 bg-white/50 border border-primary/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text">Top Delayed Cases</h3>
                            <button
                                onClick={() => navigate('/admin/bookings')}
                                className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary-dark"
                            >
                                Open Queue
                            </button>
                        </div>
                        <div className="space-y-2.5">
                            {delayedCases.length === 0 ? (
                                <p className="text-[10px] font-bold text-text/50">No delayed cases right now.</p>
                            ) : (
                                delayedCases.map((item) => (
                                    <div key={item.id} className="rounded-xl border border-primary/10 bg-white/70 px-3 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                                        <div>
                                            <p className="text-[11px] font-black text-text uppercase tracking-tight">{item.patientName || 'Unknown Patient'}</p>
                                            <p className="text-[10px] font-bold text-text/60">{item.testName || 'Unknown Test'} · {item.bookingReference || `#${item.id}`}</p>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-amber-100 text-amber-700 border border-amber-200">
                                                {Math.round(item.ageHours)}h old
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                                                {normalizeStatus(item.status) || 'UNKNOWN'}
                                            </span>
                                            <button
                                                onClick={() => navigate(`/admin/bookings?search=${encodeURIComponent(item.bookingReference || item.patientName || '')}`)}
                                                className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-md bg-text text-white hover:bg-primary transition-all"
                                            >
                                                Take Action
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                    <section className="lg:col-span-2 bg-white/50 border border-primary/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text">Staff Load</h3>
                            </div>
                            <button
                                onClick={() => navigate('/admin/staff')}
                                className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary-dark"
                            >
                                Manage Staff
                            </button>
                        </div>

                        <div className="space-y-2.5">
                            {staffLoad.length === 0 ? (
                                <p className="text-[10px] font-bold text-text/50">No technician workload data available.</p>
                            ) : (
                                staffLoad.map((member) => (
                                    <div key={member.name} className="rounded-xl border border-primary/10 bg-white/70 px-3 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                                        <div>
                                            <p className="text-[11px] font-black text-text uppercase tracking-tight">{member.name}</p>
                                            <p className="text-[9px] font-bold text-text/60">{member.completed}/{member.assigned} completed</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${member.active >= 6 ? 'bg-red-100 text-red-700 border-red-200' : member.active >= 3 ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                                                Active {member.active}
                                            </span>
                                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${member.overdue > 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-primary/5 text-primary border-primary/20'}`}>
                                                Overdue {member.overdue}
                                            </span>
                                            <span className="text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-md border bg-slate-50 text-slate-600 border-slate-200">
                                                {member.completionRate}% done
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <section className="bg-white/50 border border-primary/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text">Booking Funnel</h3>
                            <button
                                onClick={() => navigate('/admin/bookings')}
                                className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary-dark"
                            >
                                Open Bookings
                            </button>
                        </div>

                        <div className="space-y-2.5">
                            {bookingFunnel.map((stage, idx) => (
                                <div key={stage.key} className="rounded-xl border border-primary/10 p-2.5 bg-white/70">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[10px] font-black uppercase tracking-wide text-text">{stage.label}</p>
                                        <span className="text-[9px] font-black text-primary">{stage.value}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${stage.pct}%` }} />
                                    </div>
                                    <div className="mt-1 flex items-center justify-between">
                                        <span className="text-[8px] font-bold uppercase tracking-wider text-text/50">Conversion</span>
                                        <span className="text-[8px] font-black uppercase tracking-wider text-text/70">{stage.pct}%</span>
                                    </div>
                                    {idx < bookingFunnel.length - 1 && <div className="mt-2 h-px bg-primary/10" />}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {showCriticalPanel && (
                    <section className="mt-4 bg-white/70 backdrop-blur-xl border border-red-100 rounded-4xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-black uppercase text-red-700 tracking-widest">Critical Bookings</h3>
                            <button onClick={() => setShowCriticalPanel(false)} className="p-2 rounded-lg hover:bg-red-50 text-red-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {criticalLoading ? (
                            <div className="text-sm font-bold text-text/60">Loading critical alerts...</div>
                        ) : criticalBookings.length === 0 ? (
                            <div className="text-sm font-bold text-text/60">No critical bookings found.</div>
                        ) : (
                            <div className="space-y-3">
                                {criticalBookings.map((item) => (
                                    <div key={item.id} className="border border-red-100 bg-red-50/50 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-text">{item.patientName}</p>
                                            <p className="text-xs font-bold text-text/70">{item.testName}</p>
                                            <p className="text-[11px] font-bold text-text/60">
                                                Flagged: {item.flaggedDate ? new Date(item.flaggedDate).toLocaleString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black px-3 py-1 rounded-lg bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider">
                                                {item.status}
                                            </span>
                                            <button
                                                onClick={() => setSelectedCritical(item)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-red-200 text-[10px] font-black uppercase tracking-widest text-red-700 hover:bg-red-50"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                View
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <RevenueChart data={revenueData} />
                    <GrowthChart data={growthData} />
                    <BookingTrendChart data={bookingData} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
                    <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl border border-primary/5 rounded-3xl p-4 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2.5">
                                <Activity className="w-4 h-4 text-primary" />
                                <h3 className="text-sm font-black uppercase italic">Activity <span className="text-primary italic">Logs</span></h3>
                            </div>
                            <button
                                onClick={() => navigate('/admin/audit-logs')}
                                className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-colors"
                            >
                                View History →
                            </button>
                        </div>
                        <div className="space-y-2">
                            {auditLogs.slice(0, 5).map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-2.5 bg-primary/5 rounded-lg border border-primary/5 hover:border-primary/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'success' ? 'bg-cta' : log.status === 'warning' ? 'bg-amber-400' : 'bg-red-400'}`} />
                                        <div>
                                            <p className="text-[9px] font-black uppercase italic text-text">{log.action}</p>
                                            <p className="text-[8px] font-bold text-text/40">{log.timestamp}</p>
                                        </div>
                                    </div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-text/60 px-2.5 py-1 bg-white rounded-lg border border-primary/5">
                                        {log.user}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-cyan-600 to-cyan-400 rounded-3xl p-5 text-white relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-3xl -mr-8 -mt-8" />
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="space-y-1.5">
                                <span className="text-[8px] font-black uppercase tracking-[0.22em] text-white/75">Finance Pulse</span>
                                <h3 className="text-lg font-black uppercase italic leading-none">Revenue <span className="text-white/80">Overview</span></h3>
                                <p className="text-[10px] text-white/80 font-semibold">Live paid-booking economics.</p>
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="rounded-lg border border-white/25 bg-white/15 px-3 py-2">
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/80">Revenue (Last 7 Days)</p>
                                    <p className="text-base font-black tracking-tight">₹{Math.round(financePulse.revenue7d).toLocaleString()}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-2">
                                        <p className="text-[8px] font-black uppercase tracking-wider text-white/75">Paid</p>
                                        <p className="text-sm font-black">{financePulse.paidCount}</p>
                                    </div>
                                    <div className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-2">
                                        <p className="text-[8px] font-black uppercase tracking-wider text-white/75">Cancelled</p>
                                        <p className="text-sm font-black">{financePulse.cancelledCount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-text text-white rounded-3xl p-5 space-y-3 shadow-xl relative overflow-hidden">
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                        <div className="relative z-10 space-y-2.5">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Operations Control</span>
                            <h3 className="text-lg font-black uppercase italic leading-none">Quick <span className="text-primary italic">Actions</span></h3>
                            <p className="text-[10px] text-white/55 font-medium leading-relaxed">Jump to the most-used admin operations.</p>
                            <div className="space-y-2 pt-1">
                                <button
                                    onClick={() => navigate('/admin/bookings?status=PENDING_VERIFICATION')}
                                    className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border border-white/10"
                                >
                                    Open Verification Queue
                                </button>
                                <button
                                    onClick={() => navigate('/admin/bookings?status=BOOKED')}
                                    className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border border-white/10"
                                >
                                    Review New Bookings
                                </button>
                                <button
                                    onClick={() => navigate('/admin/audit-logs')}
                                    className="w-full py-2.5 bg-white text-text rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                                >
                                    Open Audit Logs
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {selectedCritical && (
                    <div className="fixed inset-0 bg-text/40 backdrop-blur-md flex items-center justify-center z-110 p-6">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-4xl p-7 max-w-lg w-full shadow-2xl border border-red-100"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-black uppercase text-red-700 tracking-widest">Critical Booking Detail</h3>
                                <button onClick={() => setSelectedCritical(null)} className="p-2 rounded-lg hover:bg-red-50 text-red-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-black text-text/70 uppercase text-[10px] tracking-wider">Reference:</span> {selectedCritical.bookingReference}</p>
                                <p><span className="font-black text-text/70 uppercase text-[10px] tracking-wider">Patient:</span> {selectedCritical.patientName}</p>
                                <p><span className="font-black text-text/70 uppercase text-[10px] tracking-wider">Test:</span> {selectedCritical.testName}</p>
                                <p><span className="font-black text-text/70 uppercase text-[10px] tracking-wider">Flagged:</span> {selectedCritical.flaggedDate ? new Date(selectedCritical.flaggedDate).toLocaleString() : 'N/A'}</p>
                                <p><span className="font-black text-text/70 uppercase text-[10px] tracking-wider">Status:</span> {selectedCritical.status}</p>
                                <p><span className="font-black text-text/70 uppercase text-[10px] tracking-wider">Booking Date:</span> {selectedCritical.bookingDate || 'N/A'}</p>
                                <p><span className="font-black text-text/70 uppercase text-[10px] tracking-wider">Time Slot:</span> {selectedCritical.timeSlot || 'N/A'}</p>
                                <p><span className="font-black text-text/70 uppercase text-[10px] tracking-wider">Technician:</span> {selectedCritical.technicianName || 'Unassigned'}</p>
                                <p><span className="font-black text-text/70 uppercase text-[10px] tracking-wider">Collection:</span> {selectedCritical.collectionType || 'N/A'}</p>
                                <p><span className="font-black text-text/70 uppercase text-[10px] tracking-wider">Address:</span> {selectedCritical.collectionAddress || 'N/A'}</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
