import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaFileDownload, FaArrowRight, FaShieldAlt, FaReceipt } from 'react-icons/fa';

interface PaymentSuccessProps {
    transactionId: string;
    bookingReference: string;
    testName: string;
    amount: number;
    paymentMethod: string;
    onViewBooking?: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
    transactionId,
    bookingReference,
    testName,
    amount,
    paymentMethod,
    onViewBooking
}) => {
    const navigate = useNavigate();

    const handleViewBooking = () => {
        if (onViewBooking) {
            onViewBooking();
        } else {
            navigate('/my-bookings');
        }
    };

    const handleDownloadReceipt = () => {
        // Generate a simple receipt in a new tab
        const receiptContent = `
            HEALTHLAB — PAYMENT RECEIPT
            ═══════════════════════════════
            Transaction ID:  ${transactionId}
            Booking Ref:     ${bookingReference}
            Test:            ${testName}
            Amount Paid:     ₹${amount.toFixed(2)}
            Payment Method:  ${paymentMethod}
            Date:            ${new Date().toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })}
            Status:          CONFIRMED
            ═══════════════════════════════
            Thank you for choosing HealthLab.
        `;
        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt-${transactionId}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden">
                    {/* Success Header */}
                    <div className="relative p-10 text-center bg-gradient-to-br from-emerald-50 via-white to-primary/5">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                            className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6"
                        >
                            <FaCheckCircle className="text-4xl text-emerald-500" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-2"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Transaction Verified</span>
                            <h2 className="text-2xl font-black text-evergreen uppercase tracking-tight italic">
                                Payment <span className="text-emerald-500">Confirmed</span>
                            </h2>
                        </motion.div>
                    </div>

                    {/* Transaction Details */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="p-8 space-y-4"
                    >
                        <div className="space-y-3 p-5 bg-primary/[0.03] rounded-2xl border border-primary/5">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-gray">Transaction ID</span>
                                <span className="text-xs font-black text-primary uppercase tracking-wider">{transactionId}</span>
                            </div>
                            <div className="h-px bg-primary/5" />
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-gray">Booking Ref</span>
                                <span className="text-xs font-black text-evergreen uppercase tracking-wider">{bookingReference}</span>
                            </div>
                            <div className="h-px bg-primary/5" />
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-gray">Test Protocol</span>
                                <span className="text-xs font-black text-evergreen uppercase tracking-wider">{testName}</span>
                            </div>
                            <div className="h-px bg-primary/5" />
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-gray">Amount Paid</span>
                                <span className="text-lg font-black text-emerald-500">₹{amount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3 pt-4">
                            <button
                                onClick={handleViewBooking}
                                className="w-full h-14 bg-primary text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 cursor-pointer"
                            >
                                <FaReceipt className="text-white/50" />
                                <span>View Booking Status</span>
                                <FaArrowRight className="text-white/40" />
                            </button>

                            <button
                                onClick={handleDownloadReceipt}
                                className="w-full h-14 bg-white border-2 border-primary/10 text-evergreen rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] hover:border-primary/30 hover:bg-primary/[0.02] transition-all flex items-center justify-center space-x-3 cursor-pointer"
                            >
                                <FaFileDownload className="text-primary" />
                                <span>Download Receipt</span>
                            </button>
                        </div>

                        <div className="flex items-center justify-center space-x-2 pt-2 text-[9px] font-bold uppercase tracking-widest text-muted-gray opacity-40">
                            <FaShieldAlt />
                            <span>Secured by HealthLab Payment Infrastructure</span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentSuccess;
