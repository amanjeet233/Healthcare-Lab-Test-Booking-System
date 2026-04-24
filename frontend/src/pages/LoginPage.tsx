import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, currentUser } = useAuth();

    const [activeTab, setActiveTab] = useState<'login' | 'register'>(
        location.pathname.includes('register') ? 'register' : 'login'
    );

    useEffect(() => {
        if (isAuthenticated && currentUser) {
            const role = currentUser.role;
            if (role === 'ADMIN') navigate('/admin', { replace: true });
            else if (role === 'TECHNICIAN') navigate('/technician', { replace: true });
            else if (role === 'MEDICAL_OFFICER') navigate('/medical-officer', { replace: true });
            else navigate('/', { replace: true });
        }
    }, [isAuthenticated, currentUser, navigate]);

    useEffect(() => {
        setActiveTab(location.pathname.includes('register') ? 'register' : 'login');
    }, [location.pathname]);

    const switchTab = (tab: 'login' | 'register') => {
        setActiveTab(tab);
        navigate(tab === 'login' ? '/login' : '/register');
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <main className={`w-full mx-auto ${activeTab === 'register' ? 'max-w-[720px] p-5' : 'max-w-[340px] p-5'
                } bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-xl max-h-[92vh] overflow-y-auto`}>
                <div className="mb-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700"
                    >
                        <ArrowLeft size={12} />
                        Back To Home
                    </button>
                </div>

                <div className="text-center mb-4">
                    <h1 className="text-[30px] font-black uppercase leading-none tracking-[-0.02em] text-slate-900">
                        HEALTH <span className="text-cyan-500">LAB</span> OS
                    </h1>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">SECURE ACCESS</p>
                </div>

                <div className="flex items-center rounded-2xl bg-slate-100 p-1 mb-4">
                    <button
                        onClick={() => switchTab('login')}
                        className={`flex-1 h-10 rounded-xl text-[11px] font-bold uppercase tracking-[0.12em] transition-all ${activeTab === 'login' ? 'bg-[#008080] text-white' : 'text-slate-600'
                            }`}
                    >
                        LOGIN
                    </button>
                    <button
                        onClick={() => switchTab('register')}
                        className={`flex-1 h-10 rounded-xl text-[11px] font-bold uppercase tracking-[0.12em] transition-all ${activeTab === 'register' ? 'bg-[#008080] text-white' : 'text-slate-600'
                            }`}
                    >
                        REGISTER
                    </button>
                </div>

                <div className="space-y-3">
                    {activeTab === 'login' ? <LoginForm onForgotPassword={() => { }} /> : <RegisterForm />}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                        {activeTab === 'login' ? 'ACCOUNT NOT ESTABLISHED?' : 'ALREADY HAVE AN ACCOUNT?'}{' '}
                        <button
                            onClick={() => switchTab(activeTab === 'login' ? 'register' : 'login')}
                            className="text-[#008080] hover:underline"
                        >
                            {activeTab === 'login' ? 'CREATE ACCOUNT' : 'LOGIN'}
                        </button>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;
