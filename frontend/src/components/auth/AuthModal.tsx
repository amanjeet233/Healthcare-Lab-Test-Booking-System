import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../../context/ModalContext';
import ForgotPasswordModal from './ForgotPasswordModal';
import ResetPasswordModal from './ResetPasswordModal';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthModal: React.FC = () => {
    const { activeModal, closeModal, authModalTab, setAuthModalTab } = useModal();
    const isOpen = activeModal === 'AUTH';
    const isRegisterTab = authModalTab === 'register';
    const navigate = useNavigate();

    useEffect(() => {
        const handleLoginSuccess = (e: Event) => {
            const role = (e as CustomEvent).detail?.role;
            if (role === 'ADMIN') navigate('/admin');
            else if (role === 'TECHNICIAN') navigate('/technician');
            else if (role === 'MEDICAL_OFFICER') navigate('/medical-officer');
            else navigate('/');
            closeModal();
        };
        window.addEventListener('auth:login:success', handleLoginSuccess);
        return () => window.removeEventListener('auth:login:success', handleLoginSuccess);
    }, [navigate, closeModal]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, closeModal]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeModal}
                    className="absolute inset-0 bg-[#F0F9F9]/90 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.96, opacity: 0, y: 8 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.96, opacity: 0, y: 8 }}
                    transition={{ type: 'spring', damping: 26, stiffness: 360 }}
                    className={`relative w-full ${isRegisterTab ? 'max-w-[720px] max-h-[94vh] overflow-y-auto p-5' : 'max-w-[340px] max-h-[92vh] overflow-y-auto p-5'
                        } rounded-3xl border border-white bg-white/80 shadow-xl backdrop-blur-md`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={closeModal}
                        className="absolute right-3 top-3 rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition-all hover:text-slate-700"
                        aria-label="Close modal"
                    >
                        <FaTimes className="text-xs" />
                    </button>

                    <div className="mb-3 text-center">
                        <h3 className="text-[30px] font-black uppercase leading-none tracking-[-0.02em] text-slate-900">
                            HEALTH <span className="text-cyan-500">LAB</span> OS
                        </h3>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                            SECURE ACCESS
                        </p>
                    </div>

                    {['login', 'register'].includes(authModalTab) && (
                        <div className="mb-3 flex items-center rounded-2xl bg-slate-100 p-1">
                            <button
                                onClick={() => setAuthModalTab('login')}
                                className={`h-9 flex-1 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] transition-all ${authModalTab === 'login' ? 'bg-[#008080] text-white' : 'text-slate-600'
                                    }`}
                            >
                                LOGIN
                            </button>
                            <button
                                onClick={() => setAuthModalTab('register')}
                                className={`h-9 flex-1 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] transition-all ${authModalTab === 'register' ? 'bg-[#008080] text-white' : 'text-slate-600'
                                    }`}
                            >
                                REGISTER
                            </button>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {authModalTab === 'login' ? (
                            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <LoginForm onForgotPassword={() => setAuthModalTab('forgot-password')} />
                            </motion.div>
                        ) : authModalTab === 'register' ? (
                            <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <RegisterForm />
                            </motion.div>
                        ) : authModalTab === 'forgot-password' ? (
                            <ForgotPasswordModal onBack={() => setAuthModalTab('login')} />
                        ) : authModalTab === 'reset-password' ? (
                            <ResetPasswordModal onSuccess={() => setAuthModalTab('login')} />
                        ) : null}
                    </AnimatePresence>

                    {['login', 'register'].includes(authModalTab) && (
                        <div className="mt-4 border-t border-slate-200 pt-4 text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                                {authModalTab === 'login' ? 'ACCOUNT NOT ESTABLISHED?' : 'ALREADY HAVE AN ACCOUNT?'}{' '}
                                <button
                                    onClick={() => setAuthModalTab(authModalTab === 'login' ? 'register' : 'login')}
                                    className="text-[#008080] hover:underline"
                                >
                                    {authModalTab === 'login' ? 'CREATE ACCOUNT' : 'LOGIN'}
                                </button>
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AuthModal;
