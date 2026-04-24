import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaLock, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

interface Props {
    onSuccess: () => void;
}

const ResetPasswordModal: React.FC<Props> = ({ onSuccess }) => {
    const { resetPassword } = useAuth();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) return;
        setIsSubmitting(true);
        try {
            await resetPassword('placeholder-token', password);
            onSuccess();
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
            className="space-y-3"
        >
            <div className="text-center space-y-1">
                <h4 className="text-lg font-black uppercase tracking-[0.08em] text-slate-800">SET NEW PASSWORD</h4>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-[0.08em] max-w-[280px] mx-auto">
                    Enter your new password and confirm it.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="group space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.12em] mb-1 ml-1 block">Password</label>
                    <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors text-xs pointer-events-none text-slate-500">
                            <FaLock />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-10 bg-white border border-slate-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 rounded-xl py-2 pl-10 pr-3 text-[12px] font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div className="group space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.12em] mb-1 ml-1 block">Confirm Password</label>
                    <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors text-xs pointer-events-none text-slate-500">
                            <FaLock />
                        </div>
                        <input
                            type="password"
                            required
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-10 bg-white border border-slate-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 rounded-xl py-2 pl-10 pr-3 text-[12px] font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || password !== confirm}
                    className="w-full bg-[#008080] h-10 rounded-2xl text-white font-bold text-[12px] tracking-[0.08em] uppercase transition-all hover:brightness-95 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isSubmitting ? <LoadingSpinner size="sm" /> : <>UPDATE PASSWORD <FaChevronRight className="text-[10px]" /></>}
                </button>
            </form>
        </motion.div>
    );
};

export default ResetPasswordModal;
