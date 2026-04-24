import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, ClipboardList, RefreshCw, Search, UserCheck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Pagination from '../../components/common/Pagination';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminBookingsPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const querySearch = searchParams.get('search') || '';
    const queryStatus = searchParams.get('status') || '';

    const [bookingsList, setBookingsList] = useState<any[]>([]);
    const [bookingsPage, setBookingsPage] = useState(0);
    const [bookingsTotalPages, setBookingsTotalPages] = useState(0);
    const [patientSearch, setPatientSearch] = useState(querySearch);
    const [statusFilter, setStatusFilter] = useState(queryStatus);
    const [technicians, setTechnicians] = useState<any[]>([]);
    const [isAssigning, setIsAssigning] = useState<number | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [bookingsRes, techsRes] = await Promise.all([
                adminService.getAllBookingsPage({
                    page: bookingsPage,
                    size: 10,
                    patientName: patientSearch || undefined,
                    status: statusFilter || undefined,
                }),
                adminService.getTechniciansOnly(),
            ]);

            setBookingsList(bookingsRes.content || []);
            setBookingsTotalPages(bookingsRes.totalPages || 0);
            setTechnicians(techsRes || []);
        } catch {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [bookingsPage, statusFilter]);

    useEffect(() => {
        setPatientSearch(querySearch);
    }, [querySearch]);

    useEffect(() => {
        setStatusFilter(queryStatus);
        setBookingsPage(0);
    }, [queryStatus]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (bookingsPage !== 0) {
                setBookingsPage(0);
            } else {
                loadData();
            }
        }, 450);
        return () => clearTimeout(timer);
    }, [patientSearch]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
        toast.success('Bookings synchronized');
    };

    const handleAssignTechnician = async (bookingId: number, technicianId: number) => {
        if (!technicianId) return;
        try {
            await adminService.assignTechnician(bookingId, technicianId);
            toast.success('Technician assigned successfully');
            setIsAssigning(null);
            loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to assign technician');
        }
    };

    const handleForceStatusUpdate = async (bookingId: number, status: string) => {
        setIsUpdatingStatus(bookingId);
        try {
            await adminService.adminUpdateBookingStatus(bookingId, status);
            toast.success(`Booking status updated to ${status}`);
            loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        } finally {
            setIsUpdatingStatus(null);
        }
    };

    const queuedCount = useMemo(() => bookingsList.length || 0, [bookingsList]);

    return (
        <div className="min-h-screen bg-bg pb-10">
            <div className="max-w-350 mx-auto px-4 lg:px-6 pt-6 space-y-4">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-800/60">
                    <span>Home</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>Bookings</span>
                </div>

                <section className="bg-white/60 backdrop-blur-2xl border border-primary/10 rounded-3xl p-4 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />

                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg">
                                <ClipboardList className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-base font-black text-[#164E63] uppercase italic leading-none">Bookings <span className="text-cyan-600 italic">Operations</span></h1>
                                <span className="text-[7px] font-bold text-cyan-700/70 uppercase tracking-widest mt-0.5">Live Tracking</span>
                            </div>
                            <span className="ml-1.5 bg-cta text-white text-[7px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">LIVE</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/50 border border-primary/10 rounded-lg text-[9px] font-black uppercase tracking-widest disabled:opacity-60"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <div className="flex items-center gap-2 bg-white/40 border border-primary/10 rounded-lg px-3 py-1.5 shadow-inner group-focus-within:border-primary transition-all">
                                <Search className="w-3 h-3 text-text/30" />
                                <input
                                    type="text"
                                    placeholder="SEARCH..."
                                    value={patientSearch}
                                    onChange={(e) => setPatientSearch(e.target.value)}
                                    className="bg-transparent border-none outline-none text-[9px] font-black uppercase placeholder:text-text/40 w-32 tracking-widest"
                                />
                            </div>
                            <div className="flex items-center gap-2 bg-white/40 border border-primary/10 rounded-lg px-3 py-1.5 shadow-inner">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-transparent border-none outline-none text-[9px] font-black uppercase tracking-widest text-text"
                                >
                                    <option value="">STATUS</option>
                                    <option value="BOOKED">BOOKED</option>
                                    <option value="REFLEX_PENDING">REFLEX_PENDING</option>
                                    <option value="SAMPLE_COLLECTED">SAMPLE_COLLECTED</option>
                                    <option value="PROCESSING">PROCESSING</option>
                                    <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                                    <option value="VERIFIED">VERIFIED</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                </select>
                            </div>
                            <div className="bg-text text-white px-3.5 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl">
                                {queuedCount || 'NO'} QUEUED
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center min-h-[32vh]">
                            <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    ) : (
                        <>
                            <div className="bg-white/40 backdrop-blur-xl border border-primary/10 rounded-3xl overflow-hidden shadow-sm">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-primary/10 bg-primary/5">
                                            <th className="text-left px-5 py-3.5 text-[9px] font-black text-text uppercase tracking-widest">Patient Details</th>
                                            <th className="text-left px-5 py-3.5 text-[9px] font-black text-text uppercase tracking-widest">Test Information</th>
                                            <th className="text-left px-5 py-3.5 text-[9px] font-black text-text uppercase tracking-widest">Schedule</th>
                                            <th className="text-left px-5 py-3.5 text-[9px] font-black text-text uppercase tracking-widest">Assigned Staff</th>
                                            <th className="text-left px-5 py-3.5 text-[9px] font-black text-text uppercase tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookingsList.map((b: any) => (
                                            <tr key={b.id} className="border-b border-primary/5 hover:bg-primary/5 transition-all group">
                                                <td className="px-5 py-3.5">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">ID #{b.id} · {b.bookingReference}</span>
                                                        <span className="font-extrabold text-text text-[13px]">{b.patientName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-[13px] font-bold text-text/80">{b.testName}</td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex flex-col">
                                                        <span className="font-extrabold text-text/80 text-[13px]">{b.bookingDate}</span>
                                                        <span className="text-[9px] font-black text-text/40 tracking-widest uppercase mt-0.5">{b.timeSlot}</span>
                                                        <span className="text-[9px] font-black text-primary tracking-widest uppercase mt-0.5">₹{Number(b.amount ?? b.finalAmount ?? 0).toLocaleString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {(() => {
                                                        const isUnassigned = !b.technicianId || b.technicianName === 'Unassigned';
                                                        if (isAssigning === b.id) {
                                                            return (
                                                                <div className="flex items-center gap-2">
                                                                    <select
                                                                        className="text-[9px] font-black uppercase tracking-widest bg-white border border-primary/30 rounded-lg px-3 py-1.5 outline-none focus:border-primary text-text shadow-sm"
                                                                        onChange={(e) => handleAssignTechnician(b.id, parseInt(e.target.value, 10))}
                                                                        defaultValue=""
                                                                    >
                                                                        <option value="" disabled>SELECT AGENT</option>
                                                                        {technicians.map((t: any) => (
                                                                            <option key={t.id} value={t.id}>{t.name}</option>
                                                                        ))}
                                                                    </select>
                                                                    <button
                                                                        onClick={() => setIsAssigning(null)}
                                                                        className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline"
                                                                    >
                                                                        Ignore
                                                                    </button>
                                                                </div>
                                                            );
                                                        }

                                                        if (!isUnassigned) {
                                                            return (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-extrabold text-text/80 uppercase text-[11px] tracking-tight">{b.technicianName}</span>
                                                                        <button
                                                                            onClick={() => setIsAssigning(b.id)}
                                                                            className="text-[8px] font-black text-primary uppercase tracking-widest hover:text-primary-dark hover:underline text-left mt-0.5"
                                                                        >
                                                                            Reassign Agent
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <button
                                                                onClick={() => setIsAssigning(b.id)}
                                                                className="inline-flex min-w-[96px] justify-center items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white border border-primary-dark/20 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary-dark transition-all shadow-md active:scale-95"
                                                            >
                                                                <UserCheck className="w-3 h-3" /> ASSIGN
                                                            </button>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="mb-2">
                                                        <span className={`inline-flex text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border ${
                                                            b.status === 'COMPLETED' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                                            'bg-primary/10 text-primary border-primary/20'
                                                        }`}>
                                                            {b.status}
                                                        </span>
                                                    </div>
                                                    <div className="relative w-fit">
                                                        <select
                                                            value={b.status}
                                                            disabled={isUpdatingStatus === b.id}
                                                            onChange={(e) => handleForceStatusUpdate(b.id, e.target.value)}
                                                            className="text-[9px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-lg outline-none appearance-none cursor-pointer border shadow-sm transition-all focus:ring-2 focus:ring-primary/20 bg-primary/10 text-primary border-primary/20"
                                                        >
                                                            <option value="BOOKED">BOOKED</option>
                                                            <option value="REFLEX_PENDING">REFLEX_PENDING</option>
                                                            <option value="PROCESSING">PROCESSING</option>
                                                            <option value="SAMPLE_COLLECTED">COLLECTED</option>
                                                            <option value="PENDING_VERIFICATION">VERIFICATION</option>
                                                            <option value="VERIFIED">VERIFIED</option>
                                                            <option value="COMPLETED">COMPLETED</option>
                                                        </select>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {bookingsList.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-5 py-14 text-center text-text/30 text-[10px] font-black uppercase tracking-widest">
                                                    No active bookings found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination currentPage={bookingsPage} totalPages={bookingsTotalPages} onPageChange={setBookingsPage} />
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default AdminBookingsPage;
