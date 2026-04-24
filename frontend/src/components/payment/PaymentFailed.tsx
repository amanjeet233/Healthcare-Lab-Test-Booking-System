import React from 'react';
import { motion } from 'framer-motion';
import { FaTimesCircle, FaRedo, FaCreditCard, FaMobileAlt, FaUniversity, FaHeadset, FaEnvelope, FaExclamationTriangle } from 'react-icons/fa';

interface PaymentFailedProps {
    errorMessage: string;
    bookingReference: string;
    amount: number;
    onRetry: () => void;
    onChangeMethod?: () => void;
    onClose?: () => void;
}

interface AlternativeMethod {
    icon: React.ElementType<{ className?: string }>;
    label: string;
    method: string;
    color: string;
}

const ALTERNATIVE_METHODS: AlternativeMethod[] = [
    { icon: FaCreditCard, label: 'Card', method: 'CARD', color: 'text-primary' },
    { icon: FaMobileAlt, label: 'UPI', method: 'UPI', color: 'text-secondary' },
    { icon: FaUniversity, label: 'NetBanking', method: 'NET_BANKING', color: 'text-evergreen' }
];

const PaymentFailed: React.FC<PaymentFailedProps> = ({
    errorMessage,
    bookingReference,
    amount,
    onRetry,
    onChangeMethod,
    onClose
}) => {
    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden">
                    {/* Error Header */}
                    <div className="relative p-10 text-center bg-gradient-to-br from-red-50 via-white to-orange-50/30">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                            className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6"
                        >
                            <FaTimesCircle className="text-4xl text-red-400" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-2"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Transaction Interrupted</span>
                            <h2 className="text-2xl font-black text-evergreen uppercase tracking-tight italic">
                                Payment <span className="text-red-400">Failed</span>
                            </h2>
                        </motion.div>
                    </div>

                    {/* Error Details */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="p-8 space-y-6"
                    >
                        {/* Error Message */}
                        <div className="p-5 bg-red-50 rounded-2xl border border-red-100 flex items-start space-x-4">
                            <FaExclamationTriangle className="text-red-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Error Diagnostics</p>
                                <p className="text-xs font-bold text-red-500/80 leading-relaxed">{errorMessage}</p>
                            </div>
                        </div>

                        {/* Booking Info */}
                        <div className="p-5 bg-primary/[0.03] rounded-2xl border border-primary/5 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-gray">Booking Ref</span>
                                <span className="text-xs font-black text-evergreen uppercase tracking-wider">{bookingReference}</span>
                            </div>
                            <div className="h-px bg-primary/5" />
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-gray">Amount Pending</span>
                                <span className="text-lg font-black text-primary">₹{amount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Retry Button */}
                        <button
                            onClick={onRetry}
                            className="w-full h-14 bg-primary text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 cursor-pointer"
                        >
                            <FaRedo />
                            <span>Retry Payment</span>
                        </button>

                        {/* Alternative Methods */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-gray">or try another method</span>
                            <div className="grid grid-cols-3 gap-3">
                                {ALTERNATIVE_METHODS.map((method) => {
                                    const Icon = method.icon;
                                    return (
                                        <button
                                            key={method.method}
                                            onClick={onChangeMethod || onRetry}
                                            className="p-4 rounded-xl border-2 border-primary/5 hover:border-primary/20 hover:bg-primary/[0.02] transition-all flex flex-col items-center space-y-2 cursor-pointer group"
                                        >
                                            <Icon className={`text-xl ${method.color} group-hover:scale-110 transition-transform`} />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-gray">{method.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Support Contact */}
                        <div className="p-5 bg-evergreen/[0.03] rounded-2xl border border-evergreen/10 space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-evergreen">Need Assistance?</p>
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-3">
                                    <FaHeadset className="text-primary text-sm" />
                                    <span className="text-xs font-bold text-muted-gray">Helpline: 1800-HEALTH-LAB</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <FaEnvelope className="text-primary text-sm" />
                                    <span className="text-xs font-bold text-muted-gray">support@healthlab.com</span>
                                </div>
                            </div>
                        </div>

                        {/* Close */}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="w-full h-12 bg-white border-2 border-primary/10 text-muted-gray rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:border-primary/20 transition-all cursor-pointer"
                            >
                                Dismiss
                            </button>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentFailed;
