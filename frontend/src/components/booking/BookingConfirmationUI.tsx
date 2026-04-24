import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle, 
    Calendar, 
    Clock, 
    Database, 
    User, 
    Mail, 
    Loader2, 
    ArrowRight,
    ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { sendBookingConfirmationEmail } from '../../services/emailService';

interface BookingConfirmationProps {
    bookingData: {
        toEmail: string;
        patientName: string;
        bookingReference: string;
        testName: string;
        bookingDate: string;
        timeSlot: string;
    };
    onComplete?: () => void;
}

/**
 * Premium Booking Confirmation UI
 * Features: Glassmorphism, Framer Motion animations, Email Trigger integration
 */
const BookingConfirmationUI: React.FC<BookingConfirmationProps> = ({ bookingData, onComplete }) => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleConfirmBooking = async () => {
        setStatus('loading');
        const loadToast = toast.loading('Securing your appointment and sending confirmation...');

        try {
            // Trigger Backend Email Notification API
            await sendBookingConfirmationEmail(bookingData);
            
            setStatus('success');
            toast.success('Booking Successful! Email sent.', { id: loadToast });
            
            if (onComplete) {
                setTimeout(onComplete, 3000);
            }
        } catch (error) {
            console.error('Finalization Error:', error);
            setStatus('error');
            toast.error('Booking confirmed, but email notification failed. Please contact support.', { id: loadToast });
        }
    };

    return (
        <div className="flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl"
            >
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-sky-500 p-8 text-white text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ spring: 0.5, delay: 0.2 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-4"
                    >
                        <ShieldCheck className="w-10 h-10" />
                    </motion.div>
                    <h2 className="text-2xl font-extrabold tracking-tight">HEALTHCARELAB</h2>
                    <p className="text-blue-50 text-sm font-medium opacity-90 uppercase tracking-widest mt-1">Booking Finalization</p>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient</p>
                                    <p className="font-bold text-slate-800">{bookingData.patientName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ref ID</p>
                                <p className="font-mono font-bold text-blue-600">{bookingData.bookingReference}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <Calendar className="w-5 h-5 text-blue-500 mb-2" />
                                <p className="text-xs font-semibold text-slate-400 uppercase">Date</p>
                                <p className="font-bold text-slate-700">{bookingData.bookingDate}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <Clock className="w-5 h-5 text-blue-500 mb-2" />
                                <p className="text-xs font-semibold text-slate-400 uppercase">Time Slot</p>
                                <p className="font-bold text-slate-700">{bookingData.timeSlot}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                <Database className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-blue-400 uppercase">Selected Test</p>
                                <p className="font-extrabold text-slate-800 line-clamp-1">{bookingData.testName}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-10">
                        <AnimatePresence mode="wait">
                            {status === 'success' ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-4 text-green-600"
                                >
                                    <CheckCircle size={48} className="mb-2" />
                                    <p className="font-bold text-lg">Confirmed Successfully!</p>
                                    <p className="text-sm text-slate-500">Redirecting to dashboard...</p>
                                </motion.div>
                            ) : (
                                <motion.button
                                    key="idle"
                                    onClick={handleConfirmBooking}
                                    disabled={status === 'loading'}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <Loader2 className="animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Confirm Booking</span>
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                        <Mail size={14} />
                        <span>A verification email will be sent to {bookingData.toEmail}</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default BookingConfirmationUI;
