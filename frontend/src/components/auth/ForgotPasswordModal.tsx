import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

interface Props {
    onBack: () => void;
}

const ForgotPasswordModal: React.FC<Props> = ({ onBack }) => {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await forgotPassword(email);
            setIsSent(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-3"
        >
            <div className="text-center space-y-1">
                <h4 className="text-lg font-black uppercase tracking-[0.08em] text-slate-800">RESET PASSWORD</h4>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-[0.08em] max-w-[280px] mx-auto">
                    {isSent
                        ? "Reset link sent to your email."
                        : "Enter your email to receive a reset link."}
                </p>
            </div>

            {!isSent ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="group space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.12em] mb-1 ml-1 block">Email</label>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors text-xs pointer-events-none text-slate-500">
                                <FaEnvelope />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="YOU@EXAMPLE.COM"
                                className="w-full h-10 bg-white border border-slate-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 rounded-xl py-2 pl-10 pr-3 text-[12px] font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#008080] h-10 rounded-2xl text-white font-bold text-[12px] tracking-[0.08em] uppercase transition-all hover:brightness-95 active:scale-95 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <LoadingSpinner size="sm" /> : <>SEND LINK <FaChevronRight className="text-[10px]" /></>}
                    </button>
                </form>
            ) : (
                <div className="bg-[#008080]/5 border border-[#008080]/20 rounded-2xl p-4 text-center space-y-2">
                    <div className="w-10 h-10 bg-[#008080]/10 rounded-full flex items-center justify-center mx-auto text-[#008080]">
                        <FaEnvelope className="text-lg" />
                    </div>
                    <p className="text-[11px] font-black text-slate-700 uppercase tracking-[0.08em] leading-relaxed">
                        Link Sent. <br />Check your email inbox.
                    </p>
                </div>
            )}

            <button
                onClick={onBack}
                className="w-full text-center text-[10px] font-black uppercase tracking-[0.08em] text-[#008080] hover:underline"
            >
                Back To Login
            </button>
        </motion.div>
    );
};

export default ForgotPasswordModal;
