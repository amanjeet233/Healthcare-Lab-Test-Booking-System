import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/booking';
import type { BookingResponse, BookingStatus } from '../../types/booking';
import { 
    Calendar, 
    FlaskConical, 
    Clock, 
    MapPin, 
    ExternalLink, 
    Phone, 
    RefreshCcw, 
    XCircle, 
    FileText, 
    Search,
    ChevronLeft,
    ChevronRight,
    Plus,
    Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { List, type RowComponentProps } from 'react-window';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { notify } from '../../utils/toast';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import { BookingCardSkeleton } from '../../components/common/SkeletonLoader';
import './MyBookingsPage.css';

const getPatientNodeIndex = (status: string) => {
    if (status === 'VERIFIED' || status === 'COMPLETED') return 3;
    if (['SAMPLE_COLLECTED', 'PROCESSING', 'PENDING_VERIFICATION'].includes(status)) return 2;
    return 1;
};

const PATIENT_NODES = [
    { key: 1, label: 'Booked' },
    { key: 2, label: 'Sample Collected' },
    { key: 3, label: 'Report Ready' },
];

const MyBookingsPage: React.FC = () => {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState<BookingResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [page, setPage] = useState(0);

    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<number | null>(null);
    const [isCanceling, setIsCanceling] = useState(false);
    
    const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleTime, setRescheduleTime] = useState('');
    const [bookingToReschedule, setBookingToReschedule] = useState<number | null>(null);
    const [isRescheduling, setIsRescheduling] = useState(false);

    const mergeWithLocalBookings = (
        serverBookings: BookingResponse[],
        statusFilter: string,
        searchValue: string,
        from: string,
        to: string
    ): BookingResponse[] => {
        let merged = [...(serverBookings || [])];

        if (statusFilter !== 'All') {
            const expected = statusFilter.toUpperCase();
            merged = merged.filter((b) => String(b.status || '').toUpperCase() === expected);
        }

        const term = searchValue.trim().toLowerCase();
        if (term) {
            merged = merged.filter((b) =>
                String(b.bookingReference || b.reference || '').toLowerCase().includes(term) ||
                String(b.testName || b.packageName || '').toLowerCase().includes(term)
            );
        }

        if (from) {
            merged = merged.filter((b) => {
                const d = b.bookingDate || b.collectionDate || '';
                return !d || d >= from;
            });
        }

        if (to) {
            merged = merged.filter((b) => {
                const d = b.bookingDate || b.collectionDate || '';
                return !d || d <= to;
            });
        }

        return merged;
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        const fetchBookings = async () => {
            setIsLoading(true);
            try {
                const params: any = {
                    page: page,
                    size: 5,
                    sort: 'collectionDate,desc'
                };

                // Always show all statuses unless a filter is selected
                if (activeTab !== 'All') {
                    params.status = activeTab.toUpperCase();
                }
                if (debouncedSearch) {
                    params.search = debouncedSearch;
                }
                if (fromDate) {
                    params.fromDate = fromDate;
                }
                if (toDate) {
                    params.toDate = toDate;
                }

                const response = await bookingService.getMyBookings(params);
                const serverList = ((response as any).content || []) as BookingResponse[];
                setBookings(mergeWithLocalBookings(serverList, activeTab, debouncedSearch, fromDate, toDate));
                setTotalPages(response.totalPages || 1);
            } catch (error) {
                console.error(error);
                setBookings([]);
                setTotalPages(1);
                notify.error('Could not load bookings from server.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, [debouncedSearch, activeTab, fromDate, toDate, page]);

    const upcomingBookings = useMemo(() => {
        return bookings.filter(b => 
            b.status === 'BOOKED' || b.status === 'CONFIRMED' || b.status === 'REFLEX_PENDING' || b.status === 'SAMPLE_COLLECTED' || b.status === 'PROCESSING' || b.status === 'PENDING_VERIFICATION'
        );
    }, [bookings]);

    const completedBookings = useMemo(() => {
        return bookings.filter(b => 
            b.status === 'COMPLETED' || b.status === 'VERIFIED' || b.status === 'CANCELLED'
        );
    }, [bookings]);

    const confirmedCount = bookings.filter(b =>
        b.status === 'BOOKED' || b.status === 'CONFIRMED' || b.status === 'REFLEX_PENDING' || b.status === 'SAMPLE_COLLECTED' || b.status === 'PROCESSING' || b.status === 'PENDING_VERIFICATION'
    ).length;
    const completedCount = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'VERIFIED').length;

    const handleCancelBooking = async () => {
        if (!bookingToCancel) {
            notify.error('No booking selected to cancel.');
            return;
        }
        setIsCanceling(true);
        try {
            await bookingService.cancelBooking(bookingToCancel);
            notify.success('Booking cancelled successfully.');
            setCancelModalVisible(false);
            setBookingToCancel(null);
            const response = await bookingService.getMyBookings({ page: 0, size: 20 });
            const serverList = ((response as any).content || []) as BookingResponse[];
            setBookings(mergeWithLocalBookings(serverList, activeTab, debouncedSearch, fromDate, toDate));
        } catch (error) {
            console.error(error);
            const backendMessage = (error as any)?.response?.data?.message
                || (error as any)?.response?.data?.error
                || (error as any)?.message
                || 'Failed to cancel booking.';
            notify.error(backendMessage);
        } finally {
            setIsCanceling(false);
        }
    };

    const handleReschedule = async () => {
        if (!bookingToReschedule || !rescheduleDate || !rescheduleTime) return;
        setIsRescheduling(true);
        try {
            await bookingService.rescheduleBooking(bookingToReschedule, rescheduleDate, rescheduleTime);
            notify.success('Booking rescheduled successfully.');
            setRescheduleModalVisible(false);
            setBookingToReschedule(null);
            setRescheduleDate('');
            setRescheduleTime('');
            const response = await bookingService.getMyBookings({ page: 0, size: 20 });
            const serverList = ((response as any).content || []) as BookingResponse[];
            setBookings(mergeWithLocalBookings(serverList, activeTab, debouncedSearch, fromDate, toDate));
        } catch (error) {
            console.error(error);
            notify.error('Failed to reschedule booking.');
        } finally {
            setIsRescheduling(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFromDate('');
        setToDate('');
        setActiveTab('All');
    };

    const hasActiveFilters = searchTerm || fromDate || toDate || activeTab !== 'All';

    const renderUpcomingCard = (booking: BookingResponse) => {
        const canCancel = booking.status === 'BOOKED' || booking.status === 'CONFIRMED';
        const currentNode = getPatientNodeIndex(String(booking.status || '').toUpperCase());

        return (
            <GlassCard key={booking.id} className="group hover:border-cyan-400 transition-all !p-0 overflow-hidden glass-pane hover:shadow-2xl hover:shadow-cyan-500/10">
            <div className="flex flex-col lg:flex-row items-stretch h-full">
                <div className="p-5 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <StatusBadge status={booking.status as any} />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">REF: {booking.bookingReference}</span>
                            </div>
                            <h3 className="text-[clamp(1.05rem,0.94rem+0.6vw,1.5rem)] font-black text-[#164E63] tracking-tight group-hover:text-cyan-600 transition-colors uppercase leading-tight mb-2">
                                {booking.testName || booking.packageName || 'Diagnostic Test'}
                            </h3>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-black text-cyan-600 bg-cyan-50 px-3 py-1 rounded-lg inline-block mb-1">
                                {booking.collectionType}
                            </div>
                            <div className="text-xs font-bold text-slate-400">{booking.collectionDate}</div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-5">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                            <MapPin size={16} className="text-cyan-500" />
                            {booking.collectionAddress || 'Lab Collection'}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                            <Activity size={16} className="text-cyan-500" />
                            Booking Details
                        </div>
                    </div>

                    <div className="mt-3 mb-3">
                        <div className="flex items-center max-w-xs">
                            {PATIENT_NODES.map((node, idx) => {
                                const isComplete = currentNode > node.key;
                                const isActive = currentNode === node.key;
                                const isLast = idx === PATIENT_NODES.length - 1;

                                return (
                                    <React.Fragment key={node.key}>
                                        <div className="flex flex-col items-center gap-1 shrink-0">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black border-2 ${
                                                isComplete
                                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                                    : isActive
                                                    ? 'bg-teal-600 border-teal-600 text-white ring-3 ring-teal-100'
                                                    : 'bg-slate-100 border-slate-200 text-slate-400'
                                            }`}>
                                                {isComplete ? '✓' : node.key}
                                            </div>
                                            <span className={`text-[9px] font-bold text-center leading-tight max-w-[60px] ${
                                                isComplete
                                                    ? 'text-emerald-600'
                                                    : isActive
                                                    ? 'text-teal-700'
                                                    : 'text-slate-400'
                                            }`}>
                                                {node.label}
                                            </span>
                                        </div>
                                        {!isLast && (
                                            <div className={`flex-1 h-0.5 mx-1 ${isComplete ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        {booking.technicianName && (
                            <p className="text-[10px] text-slate-400 font-medium mt-1.5">
                                Technician: {booking.technicianName}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {booking.collectionAddress && (
                            <a href={`https://maps.google.com/?q=${encodeURIComponent(booking.collectionAddress)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-cyan-50 rounded-xl text-xs font-black text-slate-600 hover:text-cyan-700 border border-slate-100 hover:border-cyan-200 transition-all">
                                <ExternalLink size={14} /> DIRECTIONS
                            </a>
                        )}
                        <button
                            onClick={() => { setBookingToReschedule(booking.id); setRescheduleModalVisible(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-cyan-50 rounded-xl text-xs font-black text-slate-600 hover:text-cyan-700 border border-slate-100 hover:border-cyan-200 transition-all"
                        >
                            <RefreshCcw size={14} /> RESCHEDULE
                        </button>
                        {canCancel && (
                            <button
                                onClick={() => { setBookingToCancel(booking.id); setCancelModalVisible(true); }}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-black text-rose-500 transition-all"
                            >
                                <XCircle size={14} /> CANCEL
                            </button>
                        )}
                        {booking.reportAvailable && (
                            <button
                                onClick={() => navigate('/reports')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all"
                            >
                                <FileText className="w-3 h-3" />
                                VIEW REPORT
                            </button>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/booking/${booking.id}`)}
                    className="lg:w-12 bg-slate-50/50 hover:bg-cyan-600 group-hover:bg-cyan-600 border-l border-white/50 flex items-center justify-center text-slate-300 hover:text-white group-hover:text-white transition-all"
                >
                    <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
            </GlassCard>
        );
    };

    const UpcomingVirtualRow = ({ index, style, rows }: RowComponentProps<{ rows: BookingResponse[] }>) => {
        const booking = rows[index];
        return (
            <div style={style} className="pr-2 pb-4">
                {renderUpcomingCard(booking)}
            </div>
        );
    };

    return (
        <div className="max-w-[1200px] w-full mx-auto px-4 md:px-5 py-6 min-h-screen bg-background">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-4">
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
                        <nav className="inline-flex items-center text-[11px] font-black uppercase tracking-[0.14em]">
                            <span className="text-[#6f9fb3] cursor-pointer hover:text-[#5c8ea3]" onClick={() => navigate('/')}>Home</span>
                            <ChevronRight className="w-3.5 h-3.5 mx-1 text-[#a8c0cb]" />
                            <span className="text-[#005d79]">My Bookings</span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-2.5 mb-3">
                        <div className="p-2 bg-cyan-500/10 backdrop-blur-md rounded-xl border border-cyan-500/20 shadow-sm">
                            <Clock className="w-5 h-5 text-cyan-600" />
                        </div>
                        <span className="text-[clamp(0.62rem,0.58rem+0.16vw,0.72rem)] font-black uppercase tracking-[0.22em] text-cyan-800/60">
                            Bookings / Timeline
                        </span>
                    </div>
                    <h1 className="text-[clamp(1.7rem,1.2rem+1.7vw,2.7rem)] font-black text-[#164E63] tracking-tight mb-2 uppercase">
                        My <span className="text-cyan-600">Bookings</span>
                    </h1>
                    <p className="text-[clamp(0.84rem,0.8rem+0.3vw,1rem)] text-cyan-900/60 font-medium leading-relaxed">
                        Track your active and past bookings.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="flex gap-3 p-2 bg-white/40 backdrop-blur-md rounded-xl border border-white/60">
                        <div className="px-4 py-2 bg-white/60 rounded-lg border border-white/80 shadow-sm text-center min-w-[84px]">
                            <span className="block text-[clamp(1.1rem,0.95rem+0.5vw,1.4rem)] font-black text-cyan-700 tracking-tight">{confirmedCount}</span>
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Bookings</span>
                        </div>
                        <div className="px-4 py-2 bg-white/60 rounded-lg border border-white/80 shadow-sm text-center min-w-[84px]">
                            <span className="block text-[clamp(1.1rem,0.95rem+0.5vw,1.4rem)] font-black text-emerald-600 tracking-tight">{completedCount}</span>
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Completed</span>
                        </div>
                    </div>
                    
                    <GlassButton 
                        onClick={() => navigate('/tests')}
                        className="h-full px-6 py-3.5"
                        icon={<Plus size={16} />}
                    >
                        NEW RESERVATION
                    </GlassButton>
                </div>
            </header>

            <GlassCard className="mb-4 border-cyan-100/30">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[240px]">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Search</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600/50" size={18} />
                            <input
                                type="text"
                                placeholder="Patient or Test ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/50 border border-white/50 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-500/5 rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium transition-all"
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-auto">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Status Filter</label>
                        <select 
                            value={activeTab} 
                            onChange={(e) => { setActiveTab(e.target.value); setPage(0); }}
                            className="w-full bg-white/50 border border-white/50 focus:border-cyan-400/50 rounded-xl px-4 py-2.5 text-sm font-black uppercase tracking-wider text-slate-700 appearance-none cursor-pointer"
                        >
                            <option value="All">All Status</option>
                            <option value="Booked">Booked</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="flex-1 min-w-[250px]">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Date Range</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="date" 
                                value={fromDate} 
                                onChange={(e) => { setFromDate(e.target.value); setPage(0); }} 
                                className="flex-1 bg-white/50 border border-white/50 rounded-xl px-3 py-2.5 text-xs font-bold font-mono"
                            />
                            <span className="text-slate-300 font-black">—</span>
                            <input
                                type="date" 
                                value={toDate} 
                                onChange={(e) => { setToDate(e.target.value); setPage(0); }} 
                                className="flex-1 bg-white/50 border border-white/50 rounded-xl px-3 py-2.5 text-xs font-bold font-mono"
                            />
                        </div>
                    </div>

                    {hasActiveFilters && (
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

            <div className="space-y-6">
                {isLoading ? (
                    <div className="grid grid-cols-1 gap-4">
                        {[1, 2, 3].map(i => (
                            <BookingCardSkeleton key={i} />
                        ))}
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="inline-flex p-10 bg-cyan-50/50 backdrop-blur-md rounded-[50px] text-cyan-200 mb-8 border border-cyan-100/30 shadow-inner">
                            <Calendar size={72} strokeWidth={1} />
                        </div>
                        <h3 className="text-3xl font-black text-[#164E63] tracking-tight mb-3 uppercase">No Bookings Found</h3>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-12 max-w-sm mx-auto">You have no bookings yet. Book a test to get started.</p>
                        <GlassButton className="px-12 py-5" onClick={() => navigate('/tests')}>BOOK A TEST</GlassButton>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {upcomingBookings.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-5">
                                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-600/70">Upcoming Sessions</h2>
                                    <div className="flex-1 h-px bg-gradient-to-r from-cyan-100 to-transparent" />
                                </div>
                                {upcomingBookings.length > 8 ? (
                                    <div className="h-[760px] w-full">
                                        <AutoSizer>
                                            {({ height, width }) => (
                                                <List
                                                    rowCount={upcomingBookings.length}
                                                    rowHeight={320}
                                                    rowComponent={UpcomingVirtualRow}
                                                    rowProps={{ rows: upcomingBookings }}
                                                    style={{ height, width }}
                                                />
                                            )}
                                        </AutoSizer>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {upcomingBookings.map(renderUpcomingCard)}
                                    </div>
                                )}
                            </section>
                        )}

                        {completedBookings.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-5">
                                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600/70">Completed Bookings</h2>
                                    <div className="flex-1 h-px bg-gradient-to-r from-emerald-100 to-transparent" />
                                </div>
                                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
                                    {completedBookings.map(booking => (
                                        <GlassCard key={booking.id} className="!p-4 hover:shadow-xl transition-all border-emerald-100/30 flex flex-col h-full">
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                                                        <FlaskConical size={24} />
                                                    </div>
                                                    <StatusBadge status={booking.status as any} />
                                                </div>
                                                <h3 className="text-lg font-black text-slate-800 mb-2 truncate">{booking.testName}</h3>
                                                <p className="text-xs font-bold text-slate-400 mb-4 flex items-center gap-2">
                                                    <Calendar size={14} /> {booking.collectionDate}
                                                </p>

                                                <div className="mt-2 mb-4">
                                                    <div className="flex items-center max-w-xs">
                                                        {PATIENT_NODES.map((node, idx) => {
                                                            const currentNode = getPatientNodeIndex(String(booking.status || '').toUpperCase());
                                                            const isComplete = currentNode > node.key;
                                                            const isActive = currentNode === node.key;
                                                            const isLast = idx === PATIENT_NODES.length - 1;

                                                            return (
                                                                <React.Fragment key={node.key}>
                                                                    <div className="flex flex-col items-center gap-1 shrink-0">
                                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black border-2 ${
                                                                            isComplete
                                                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                                                : isActive
                                                                                ? 'bg-teal-600 border-teal-600 text-white ring-3 ring-teal-100'
                                                                                : 'bg-slate-100 border-slate-200 text-slate-400'
                                                                        }`}>
                                                                            {isComplete ? '✓' : node.key}
                                                                        </div>
                                                                        <span className={`text-[9px] font-bold text-center leading-tight max-w-[60px] ${
                                                                            isComplete
                                                                                ? 'text-emerald-600'
                                                                                : isActive
                                                                                ? 'text-teal-700'
                                                                                : 'text-slate-400'
                                                                        }`}>
                                                                            {node.label}
                                                                        </span>
                                                                    </div>
                                                                    {!isLast && (
                                                                        <div className={`flex-1 h-0.5 mx-1 ${isComplete ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                                                                    )}
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                    </div>

                                                    {booking.technicianName && (
                                                        <p className="text-[10px] text-slate-400 font-medium mt-1.5">
                                                            Technician: {booking.technicianName}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-2 mt-auto pt-4 border-t border-slate-50">
                                                {booking.reportAvailable && (
                                                    <GlassButton 
                                                        size="sm" 
                                                        variant="secondary" 
                                                        className="flex-1"
                                                        onClick={() => navigate('/reports')}
                                                        icon={<FileText size={16} />}
                                                    >
                                                        VIEW REPORT
                                                    </GlassButton>
                                                )}
                                                <GlassButton 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="flex-1"
                                                    onClick={() => navigate('/tests')}
                                                    icon={<RefreshCcw size={16} />}
                                                >
                                                    REORDER
                                                </GlassButton>
                                            </div>
                                        </GlassCard>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-9">
                    <button
                        onClick={() => setPage(page > 0 ? page - 1 : 0)}
                        disabled={page === 0}
                        className={`px-4 py-2 rounded-lg font-black uppercase text-xs transition-all ${page === 0 ? 'bg-cyan-100 text-cyan-400 cursor-not-allowed' : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}
                    >
                        Prev
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button 
                            key={i} 
                            onClick={() => setPage(i)} 
                            className={`h-2 rounded-full transition-all ${page === i ? 'w-12 bg-cyan-600' : 'w-2 bg-cyan-100 hover:bg-cyan-200'}`} 
                        />
                    ))}
                    <button
                        onClick={() => setPage(page < totalPages - 1 ? page + 1 : totalPages - 1)}
                        disabled={page === totalPages - 1}
                        className={`px-4 py-2 rounded-lg font-black uppercase text-xs transition-all ${page === totalPages - 1 ? 'bg-cyan-100 text-cyan-400 cursor-not-allowed' : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}
                    >
                        Next
                    </button>
                </div>
            )}

            <ConfirmationModal
                isOpen={cancelModalVisible}
                onCancel={() => setCancelModalVisible(false)}
                onConfirm={handleCancelBooking}
                title="Cancel Booking"
                description="Are you sure you want to cancel this booking?"
                confirmText={isCanceling ? "CANCELING..." : "CONFIRM CANCEL"}
                cancelText="KEEP BOOKING"
            />

            <AnimatePresence>
                {rescheduleModalVisible && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#083344]/40 backdrop-blur-md" onClick={() => setRescheduleModalVisible(false)}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-white rounded-[24px] overflow-hidden shadow-2xl border border-white/50"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-5 border-b border-slate-50">
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Reschedule Booking</h3>
                                <p className="text-xs font-medium text-slate-400 mt-1">Select a new date and time.</p>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Target Date</label>
                                    <input 
                                        type="date" 
                                        value={rescheduleDate} 
                                        onChange={(e) => setRescheduleDate(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 focus:border-cyan-400/50 rounded-xl px-4 py-3 text-sm font-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Time Slot</label>
                                    <select 
                                        value={rescheduleTime} 
                                        onChange={(e) => setRescheduleTime(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 focus:border-cyan-400/50 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-widest appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Slot</option>
                                        {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="p-5 bg-slate-50 flex gap-4">
                                <button onClick={() => setRescheduleModalVisible(false)} className="flex-1 px-5 py-3 rounded-xl text-xs font-black text-slate-500 hover:text-slate-800 transition-colors">CANCEL</button>
                                <GlassButton 
                                    onClick={handleReschedule} 
                                    disabled={isRescheduling || !rescheduleDate || !rescheduleTime}
                                    className="flex-1"
                                    loading={isRescheduling}
                                >
                                    CONFIRM RESCHEDULE
                                </GlassButton>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyBookingsPage;
