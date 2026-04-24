import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, HeartPulse, Activity, ChevronRight, ChevronLeft } from 'lucide-react';
import { userService } from '../../services/userService';
import type { User as UserType } from '../../types/auth';
import { notify } from '../../utils/toast';
import PersonalInfoTab from '../../components/profile/tabs/PersonalInfoTab';
import HealthcareTab from '../../components/profile/tabs/HealthcareTab';
import GlassCard from '../../components/common/GlassCard';
import '../../styles/SecondaryPages.css';

type ProfileTab = 'personal' | 'medical';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserType | null>(null);
    const [activeTab, setActiveTab] = useState<ProfileTab>('personal');

    const tabs: Array<{ id: ProfileTab; label: string; icon: any; description: string }> = [
        { id: 'personal', label: 'Identity', icon: User, description: 'Basic personal details' },
        { id: 'medical', label: 'Health', icon: HeartPulse, description: 'Medical history' }
    ];

    const loadUser = async () => {
        try {
            setLoading(true);
            const data = await userService.getProfile();
            setUser(data);
        } catch (error) {
            notify.error('Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-vh-100 bg-[#ECFEFF]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-cyan-100 border-t-cyan-600 rounded-full animate-spin" />
                    <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-600 animate-pulse" size={20} />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] w-full mx-auto px-4 md:px-5 py-8 md:py-9 min-h-screen">
            <header className="mb-8">
                <div className="inline-flex items-center gap-3 mb-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-1 px-4 py-1 rounded-full border border-[#b8cfdb] text-[#005f7b] text-[10px] font-black uppercase tracking-[0.16em] hover:bg-white/70"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Back
                    </button>
                    <nav className="inline-flex items-center text-[11px] font-black uppercase tracking-[0.14em]">
                        <span className="text-[#6f9fb3] cursor-pointer hover:text-[#5c8ea3]" onClick={() => navigate('/')}>Home</span>
                        <ChevronRight className="w-3.5 h-3.5 mx-1 text-[#a8c0cb]" />
                        <span className="text-[#005d79]">My Profile</span>
                    </nav>
                </div>
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="p-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/20 shadow-sm">
                        <User className="w-5 h-5 text-cyan-600" />
                    </div>
                    <span className="text-[clamp(0.62rem,0.58rem+0.15vw,0.72rem)] font-extrabold uppercase tracking-[0.16em] text-cyan-800/60">
                        Personal Details
                    </span>
                </div>
                <h1 className="text-[clamp(1.75rem,1.28rem+1.6vw,2.7rem)] font-black text-[#164E63] tracking-tight mb-2.5">
                    My <span className="text-cyan-600">Profile</span>
                </h1>
                <p className="text-[clamp(0.84rem,0.78rem+0.3vw,1rem)] text-cyan-900/60 max-w-2xl font-medium leading-relaxed">
                    Manage your personal details and health information in one place.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <aside className="lg:col-span-4 sticky top-5">
                    <GlassCard className="p-3.5 border-cyan-100/30">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50 to-white border border-cyan-100 mb-4 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-cyan-600 flex items-center justify-center text-white text-lg font-black border-2 border-white shadow-md">
                                    {(user.name?.[0] || user.firstName?.[0] || 'U').toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-[clamp(0.98rem,0.92rem+0.3vw,1.15rem)] font-black text-slate-800 tracking-tight">
                                        {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
                                    </h3>
                                    <p className="text-[0.72rem] font-bold text-cyan-600/70">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const active = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group ${active
                                            ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 translate-x-2'
                                            : 'bg-white/40 text-slate-600 hover:bg-white/80 hover:translate-x-1 border border-transparent hover:border-cyan-100'
                                            }`}
                                    >
                                        <div className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-cyan-500' : 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100'}`}>
                                            <Icon size={16} />
                                        </div>
                                        <div>
                                            <span className="block text-[0.72rem] font-black uppercase tracking-wider">{tab.label}</span>
                                            <span className={`block text-[0.58rem] font-bold ${active ? 'text-cyan-100' : 'text-slate-400'}`}>
                                                {tab.description}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </GlassCard>
                </aside>

                <main className="lg:col-span-8">
                    <GlassCard className="min-h-[420px] border-cyan-100/30">
                        {activeTab === 'personal' && <PersonalInfoTab user={user as any} onUpdate={loadUser} />}
                        {activeTab === 'medical' && <HealthcareTab user={user as any} onUpdate={loadUser} />}
                    </GlassCard>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;
