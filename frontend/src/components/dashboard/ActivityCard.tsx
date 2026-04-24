import React from 'react';
import { FaFlask, FaChevronRight } from 'react-icons/fa';
import { useModal } from '../../context/ModalContext';
import type { BookingResponse } from '../../types/booking';
import StatusBadge from '../common/StatusBadge';

interface ActivityCardProps {
    booking: BookingResponse;
    role: string | undefined;
    onUploadReport?: (bookingId: number) => void;
    onMarkCollected?: (bookingId: number) => void;
    onVerify?: (bookingId: number) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
    booking,
    role,
    onUploadReport,
    onMarkCollected,
    onVerify
}) => {
    const { openModal } = useModal();

    return (
        <div
            onClick={() => openModal('BOOKING_DETAILS', booking as any)}
            className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/40 backdrop-blur-md rounded-[2rem] border border-primary-teal/5 hover:border-primary-teal/20 transition-all group cursor-pointer shadow-sm relative overflow-hidden hover:bg-white/50"
        >
            {/* Hover Glow */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary-teal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center space-x-6">
                <div className="w-14 h-14 bg-primary-teal/5 rounded-2xl flex items-center justify-center text-primary-teal group-hover:bg-primary-teal group-hover:text-white transition-all shadow-inner-glow relative">
                    <FaFlask className="text-lg" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-primary-teal rounded-full" />
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-black uppercase tracking-widest text-ever-green leading-none">{booking.testName}</h3>
                        <StatusBadge status={booking.status} className="scale-[0.85] origin-left" />
                    </div>
                    </div>
                </div>

            <div className="flex items-center space-x-8 mt-4 md:mt-0">
                <div className="flex flex-col items-end">
                    <span className="text-[11px] font-black uppercase tracking-widest text-ever-green italic leading-none">
                        {new Date(booking.bookingDate || '').toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase()}
                    </span>
                    <span className="text-[10px] font-bold text-muted-gray uppercase tracking-widest opacity-40 mt-1">{booking.timeSlot}</span>
                </div>
                {role === 'TECHNICIAN' && booking.status === 'BOOKED' && onMarkCollected && (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onMarkCollected(booking.id);
                        }}
                        className="h-10 px-4 rounded-xl bg-orange-400 text-white text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Mark Collected
                    </button>
                )}
                {role === 'TECHNICIAN' && booking.status === 'SAMPLE_COLLECTED' && onUploadReport && (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onUploadReport(booking.id);
                        }}
                        className="h-10 px-4 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Upload Report
                    </button>
                )}
                {role === 'MEDICAL_OFFICER' && booking.status === 'COMPLETED' && onVerify && (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onVerify(booking.id, booking.testName || 'Lab Test');
                        }}
                        className="h-10 px-4 rounded-xl bg-green-500 text-white text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Verify Report
                    </button>
                )}
                <div className="w-10 h-10 rounded-full border border-primary-teal/10 flex items-center justify-center text-primary-teal group-hover:bg-primary-teal group-hover:text-white transition-all group-hover:border-transparent">
                    <FaChevronRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
            </div>
        </div>
    );
};

export default ActivityCard;
