import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCreditCard, FaMobileAlt, FaUniversity, FaShieldAlt, FaLock, FaTimes, FaChevronRight, FaSpinner } from 'react-icons/fa';
import { paymentService } from '../../services/paymentService';
import { notify } from '../../utils/toast';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: number;
    bookingReference: string;
    testName: string;
    amount: number;
    onSuccess: (transactionId: string) => void;
    onFailure: (errorMessage: string) => void;
}

type PaymentMethod = 'CARD' | 'UPI' | 'NET_BANKING';

interface PaymentMethodOption {
    id: PaymentMethod;
    label: string;
    sublabel: string;
    icon: React.ElementType<{ className?: string }>;
    color: string;
    bgColor: string;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
    {
        id: 'CARD',
        label: 'Debit / Credit Card',
        sublabel: 'Visa, Mastercard, RuPay',
        icon: FaCreditCard,
        color: 'text-primary',
        bgColor: 'bg-primary/10'
    },
    {
        id: 'UPI',
        label: 'UPI Gateway',
        sublabel: 'GPay, PhonePe, Paytm',
        icon: FaMobileAlt,
        color: 'text-secondary',
        bgColor: 'bg-secondary/10'
    },
    {
        id: 'NET_BANKING',
        label: 'Net Banking',
        sublabel: 'All Major Banks',
        icon: FaUniversity,
        color: 'text-evergreen',
        bgColor: 'bg-evergreen/10'
    }
];

const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    bookingId,
    bookingReference,
    testName,
    amount,
    onSuccess,
    onFailure
}) => {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState('');

    const handlePayment = async () => {
        if (!selectedMethod) {
            notify.error('Select a payment method');
            return;
        }

        setIsProcessing(true);

        try {
            // Step 1: Initiating
            setProcessingStep('Encrypting transaction data...');
            await new Promise(r => setTimeout(r, 800));

            // Step 2: Processing
            setProcessingStep('Simulating gateway handshake...');
            const result = await paymentService.initiatePayment({
                bookingId,
                amount,
                paymentMethod: selectedMethod,
                paymentGateway: 'MOCK',
                transactionId: 'MOCK_TXN_' + Math.random().toString(36).substring(7).toUpperCase()
            });

            // Step 3: Confirming
            setProcessingStep('Verifying transaction integrity...');
            await new Promise(r => setTimeout(r, 600));

            if (result.transactionId) {
                onSuccess(result.transactionId);
            } else {
                onFailure('Transaction verification failed');
            }
        } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : 'Payment processing failed. Please try again.';
            onFailure(errorMsg);
        } finally {
            setIsProcessing(false);
            setProcessingStep('');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-evergreen/60 backdrop-blur-md" onClick={!isProcessing ? onClose : undefined} />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="relative p-8 pb-6 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center text-muted-gray hover:text-evergreen hover:bg-white transition-all cursor-pointer disabled:opacity-30"
                        >
                            <FaTimes />
                        </button>

                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Secure Transaction</span>
                            <h2 className="text-2xl font-black text-evergreen uppercase tracking-tight italic">
                                Payment <span className="text-secondary">Gateway</span>
                            </h2>
                        </div>
                    </div>

                    {/* Booking Summary */}
                    <div className="px-8 py-5 border-b border-primary/5">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-gray">Test Protocol</p>
                                <p className="text-sm font-black text-evergreen uppercase tracking-wide mt-1">{testName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-gray">Ref</p>
                                <p className="text-xs font-black text-primary uppercase tracking-widest mt-1">{bookingReference}</p>
                            </div>
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="px-8 py-6 border-b border-primary/5 bg-primary/[0.02]">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-gray">Total Synthesis</span>
                            <span className="text-3xl font-black text-primary">₹{amount.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="px-8 py-6 space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-gray">Select Payment Node</span>

                        <div className="space-y-3 mt-4">
                            {PAYMENT_METHODS.map((method) => {
                                const Icon = method.icon;
                                const isSelected = selectedMethod === method.id;
                                return (
                                    <motion.button
                                        key={method.id}
                                        onClick={() => !isProcessing && setSelectedMethod(method.id)}
                                        whileTap={{ scale: 0.98 }}
                                        className={`w-full p-5 rounded-2xl border-2 flex items-center space-x-5 transition-all cursor-pointer ${isSelected
                                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                                : 'border-primary/5 bg-white hover:border-primary/20 hover:bg-primary/[0.02]'
                                            } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        <div className={`w-12 h-12 ${method.bgColor} rounded-xl flex items-center justify-center ${method.color}`}>
                                            <Icon className="text-xl" />
                                        </div>
                                        <div className="text-left flex-grow">
                                            <p className="text-xs font-black uppercase tracking-widest text-evergreen">{method.label}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-gray opacity-60 mt-0.5">
                                                {method.sublabel}
                                            </p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-primary bg-primary' : 'border-primary/20'
                                            }`}>
                                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action */}
                    <div className="px-8 pb-8 pt-2 space-y-4">
                        <button
                            onClick={handlePayment}
                            disabled={!selectedMethod || isProcessing}
                            className="w-full h-16 bg-primary text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none cursor-pointer"
                        >
                            {isProcessing ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    <span>{processingStep}</span>
                                </>
                            ) : (
                                <>
                                    <FaLock className="text-white/40" />
                                    <span>Authorize Payment</span>
                                    <FaChevronRight className="text-white/40" />
                                </>
                            )}
                        </button>

                        <div className="flex items-center justify-center space-x-2 text-[9px] font-bold uppercase tracking-widest text-muted-gray opacity-40">
                            <FaShieldAlt />
                            <span>256-bit SSL Encrypted · PCI DSS Compliant</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PaymentModal;
