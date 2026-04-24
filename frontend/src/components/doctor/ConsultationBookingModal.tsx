import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, MessageSquare, Phone, CreditCard, ShieldCheck, ArrowRight, Activity, CheckCircle } from 'lucide-react';
import { consultationService, type Doctor, type TimeSlot } from '../../services/consultationService';
import { notify } from '../../utils/toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    doctor: Doctor;
    date: string;
    slot: TimeSlot | null;
}

const ConsultationBookingModal: React.FC<Props> = ({ isOpen, onClose, doctor, date, slot }) => {
    const [step, setStep] = useState<'type' | 'payment' | 'success'>('type');
    const [type, setType] = useState<'video' | 'audio' | 'chat'>('video');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirmBooking = async () => {
        if (!slot) return;
        setIsSubmitting(true);
        try {
            await consultationService.bookConsultation(doctor.id, date, slot.time, type);
            setStep('success');
            notify.success('Consultation protocol initialized.');
        } catch (error) {
            notify.error('Network failure in booking synthesis.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const consultationTypes = [
        { id: 'video', label: 'Neural Vision (Video)', icon: Video, price: '₹999', desc: 'Full ocular and clinical visualization.' },
        { id: 'audio', label: 'Voice Relay (Audio)', icon: Phone, price: '₹599', desc: 'Secure audio-only diagnostic link.' },
        { id: 'chat', label: 'Secure Text (Chat)', icon: MessageSquare, price: '₹299', desc: 'Asynchronous clinical messaging.' },
    ];

    if (!isOpen || !slot) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-text/40 backdrop-blur-md"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-xl bg-white border border-primary/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-xl text-text/40 hover:text-primary hover:bg-primary/5 transition-all z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-10 space-y-8">
                    {/* Progress Indicator */}
                    <div className="flex items-center gap-4">
                        <div className={`h-1 flex-grow rounded-full transition-all duration-500 ${step !== 'success' ? 'bg-primary' : 'bg-cta'}`} />
                        <div className={`h-1 flex-grow rounded-full transition-all duration-500 ${step === 'payment' ? 'bg-primary' : step === 'success' ? 'bg-cta' : 'bg-primary/10'}`} />
                        <div className={`h-1 flex-grow rounded-full transition-all duration-500 ${step === 'success' ? 'bg-cta' : 'bg-primary/10'}`} />
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'type' && (
                            <motion.div
                                key="step-type"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-text uppercase italic">Select <span className="text-primary italic">Protocol Type</span></h3>
                                    <p className="text-[11px] text-text/60 font-medium">Choose the synthesis method for your encounter with {doctor.name}.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {consultationTypes.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setType(item.id as any)}
                                                className={`p-6 rounded-2xl border transition-all text-left flex items-center gap-6 group cursor-pointer ${type === item.id
                                                    ? 'bg-primary/5 border-primary shadow-md'
                                                    : 'bg-white border-primary/5 hover:border-primary/20 hover:shadow-sm'
                                                    }`}
                                            >
                                                <div className={`p-4 rounded-xl transition-all ${type === item.id ? 'bg-primary text-white' : 'bg-primary/5 text-primary'}`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className={`text-sm font-black uppercase ${type === item.id ? 'text-primary' : 'text-text'}`}>{item.label}</span>
                                                        <span className="text-[12px] font-black text-cta italic">{item.price}</span>
                                                    </div>
                                                    <p className="text-[10px] text-text/60 font-medium">{item.desc}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setStep('payment')}
                                    className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
                                >
                                    Review Synchronization
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>
                        )}

                        {step === 'payment' && (
                            <motion.div
                                key="step-payment"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-text uppercase italic">Payment <span className="text-primary italic">Synthesis</span></h3>
                                    <p className="text-[11px] text-text/60 font-medium">Confirm the details for your medical neural link.</p>
                                </div>

                                <div className="bg-background rounded-3xl p-8 space-y-6 border border-primary/5">
                                    <div className="flex items-center gap-4 border-b border-primary/5 pb-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                            <Activity className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-bold text-text/40 uppercase tracking-widest">Target Node</span>
                                            <p className="text-[12px] font-black text-text uppercase">{doctor.name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-text/60">
                                            <span>Temporal Slot</span>
                                            <span className="text-text">{date} @ {slot.time}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-text/60">
                                            <span>Link Protocol</span>
                                            <span className="text-text">{type.toUpperCase()} CONNECTION</span>
                                        </div>
                                        <div className="pt-3 border-t border-primary/5 flex justify-between items-center">
                                            <span className="text-[11px] font-black text-text uppercase">Total Energy Cost</span>
                                            <span className="text-xl font-black text-cta italic">
                                                {consultationTypes.find(t => t.id === type)?.price}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">HIPAA Compliant Encryption Active</span>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep('type')}
                                        className="flex-grow py-5 border border-primary/10 text-text/60 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary/5 transition-all"
                                    >
                                        Calibrate
                                    </button>
                                    <button
                                        onClick={handleConfirmBooking}
                                        disabled={isSubmitting}
                                        className="flex-[2] py-5 bg-cta text-white rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-lg shadow-cta/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {isSubmitting ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                                            />
                                        ) : (
                                            <>
                                                Initialize Booking
                                                <CreditCard className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div
                                key="step-success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8 space-y-6"
                            >
                                <div className="w-24 h-24 bg-cta/10 rounded-full flex items-center justify-center mx-auto relative">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute inset-0 border-4 border-cta rounded-full animate-ping opacity-20"
                                    />
                                    <CheckCircle className="w-12 h-12 text-cta" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-text uppercase italic">Link <span className="text-cta italic">Established</span></h3>
                                    <p className="text-[12px] text-text/60 font-medium">Your medical synchronization with {doctor.name} is scheduled for {date} at {slot.time}.</p>
                                </div>

                                <div className="p-6 bg-cta/5 rounded-3xl border border-cta/10">
                                    <p className="text-[10px] text-cta font-black uppercase tracking-[0.2em]">Protocol Credentials generated in Neural Inbox.</p>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="w-full py-5 bg-text text-white rounded-2xl font-black uppercase tracking-widest text-[12px] hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Dismiss HUD
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default ConsultationBookingModal;
