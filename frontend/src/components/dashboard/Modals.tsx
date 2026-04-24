import React from 'react';
import type { BookingResponse } from '../../types/booking';
import type { User } from '../../types/auth';

interface BookingDetailsModalProps {
    booking: BookingResponse;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-evergreen uppercase tracking-widest">Booking Details</h2>
            <div className="space-y-4">
                <div className="flex justify-between">
                    <span className="text-muted-gray text-sm">Booking ID:</span>
                    <span className="font-bold text-evergreen">{booking.id}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-gray text-sm">Test:</span>
                    <span className="font-bold text-evergreen">{booking.testName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-gray text-sm">Status:</span>
                    <span className="font-bold text-primary uppercase">{booking.status}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-gray text-sm">Date:</span>
                    <span className="font-bold text-evergreen">{booking.bookingDate || booking.createdAt || 'N/A'}</span>
                </div>
                {booking.totalAmount && (
                    <div className="flex justify-between">
                        <span className="text-muted-gray text-sm">Amount:</span>
                        <span className="font-bold text-evergreen">${booking.totalAmount}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

interface ProfileModalProps {
    user: User;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-evergreen uppercase tracking-widest">Profile</h2>
            <div className="space-y-4">
                <div className="flex justify-between">
                    <span className="text-muted-gray text-sm">Name:</span>
                    <span className="font-bold text-evergreen">{user.name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-gray text-sm">Email:</span>
                    <span className="font-bold text-evergreen">{user.email}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-gray text-sm">Role:</span>
                    <span className="font-bold text-primary uppercase">{user.role}</span>
                </div>
            </div>
        </div>
    );
};
