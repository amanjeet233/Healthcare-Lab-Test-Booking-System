import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClipboardList, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { bookingService } from '../../services/booking';
import { doctorService } from '../../services/doctorService';
import { technicianService, getTechnicianBookings } from '../../services/technicianService';
import type { BookingResponse } from '../../types/booking';
import Card from '../common/Card';
import { useModal } from '../../context/ModalContext';
import ReportUploadModal from '../reports/ReportUploadModal';
import { notify } from '../../utils/toast';
import DashboardStatCard from './DashboardStatCard';
import ActivityCard from './ActivityCard';

const UserDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { openModal } = useModal();
    const { currentUser, isAuthenticated } = useAuth();
    const [bookings, setBookings] = useState<BookingResponse[]>([]);
    const [stats, setStats] = useState<Record<string, number> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadBookingId, setUploadBookingId] = useState<number | null>(null);

    const fetchData = async () => {
        if (!isAuthenticated) return;
        setIsLoading(true);
        setError(null);
        try {
            if (currentUser?.role === 'PATIENT') {
                const response = await bookingService.getMyBookings({ size: 5, sort: 'bookingDate,desc' });
                setBookings(response.bookings || []);
                setStats({
                    upcoming: response.bookings.filter(b => b.status === 'BOOKED' || b.status === 'REFLEX_PENDING').length,
                    completed: response.bookings.filter(b => b.status === 'COMPLETED' || b.status === 'SAMPLE_COLLECTED').length,
                    reports: response.bookings.filter(b => b.status === 'COMPLETED' || b.status === 'VERIFIED').length
                });
            } else if (currentUser?.role === 'MEDICAL_OFFICER') {
                try {
                    const [statsData, pendingResponse] = await Promise.all([
                        doctorService.getDashboardStats(),
                        doctorService.getPendingRequests()
                    ]);
                    setStats(statsData);
                    const bookingsData = pendingResponse.data?.data?.content || pendingResponse.data?.content || pendingResponse.data || [];
                    setBookings(Array.isArray(bookingsData) ? bookingsData : []);
                } catch (error) {
                    console.error("Failed to fetch pending requests:", error);
                    setBookings([]);
                }
            } else if (currentUser?.role === 'TECHNICIAN') {
                const [statsData, collectionsResponse] = await Promise.all([
                    technicianService.getDashboardStats(),
                    getTechnicianBookings()
                ]);
                setStats(statsData);
                const collectionsData = collectionsResponse.data.data || collectionsResponse.data;
                setBookings(collectionsData || []);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            setError("Failed to load dashboard data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isAuthenticated, currentUser]);

    const handleOpenUploadModal = (bookingId: number) => {
        setUploadBookingId(bookingId);
        setShowUploadModal(true);
    };

    const handleMarkCollected = async (bookingId: number) => {
        try {
            await technicianService.updateCollectionStatus(bookingId);
            notify.success('Sample collection marked as complete.');
            await fetchData();
        } catch (error) {
            console.error('Error marking collection:', error);
            notify.error('Failed to mark sample as collected.');
        }
    };

    const handleVerifyReport = (bookingId: number, testName: string) => {
        openModal('CLINICAL_VERIFICATION', { bookingId, testName });
    };

    const handleUploadSuccess = async () => {
        if (!uploadBookingId) return;

        try {
            await technicianService.updateBookingCompletedStatus(uploadBookingId);
            notify.success('Booking marked as COMPLETED.');
            await fetchData();
        } catch (statusError) {
            console.error(statusError);
            notify.error('Report uploaded but failed to update booking status.');
        } finally {
            setShowUploadModal(false);
            setUploadBookingId(null);
        }
    };

    if (!isAuthenticated) return null;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[400px] text-red-500">
                <FaCheckCircle className="text-4xl mb-4 opacity-50" />
                <p className="font-semibold">{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 px-4 py-2 border rounded-xl border-red-200 hover:bg-red-50 transition-colors text-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <section className="py-12 px-6 max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Grid - Enhanced with standardized colors */}

                {/* Main Activity Area - Modernized Feed */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl md:text-2xl font-black text-ever-green uppercase tracking-tighter italic">
                            {currentUser?.role === 'PATIENT' ? 'RECENT ACTIVITY' : 'REQUIRES ATTENTION'}
                        </h2>
                        <button 
                            onClick={() => navigate('/my-bookings')}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-teal hover:text-ever-green transition-colors"
                        >
                            History &rarr;
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {bookings.length > 0 ? (
                            bookings.map((booking) => (
                                <ActivityCard
                                    key={booking.id}
                                    booking={booking}
                                    role={currentUser?.role}
                                    onUploadReport={handleOpenUploadModal}
                                    onMarkCollected={handleMarkCollected}
                                    onVerify={handleVerifyReport}
                                />
                            ))
                        ) : (
                            <div className="text-center py-24 bg-white/30 backdrop-blur-sm rounded-[2.5rem] border border-dashed border-primary-teal/20">
                                <p className="text-[10px] font-black uppercase text-muted-gray opacity-40 tracking-widest">No recent activity found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ReportUploadModal
                isOpen={showUploadModal}
                initialBookingId={uploadBookingId || undefined}
                onClose={() => {
                    setShowUploadModal(false);
                    setUploadBookingId(null);
                }}
                onSuccess={handleUploadSuccess}
            />
        </section>
    );
};

export default UserDashboard;
