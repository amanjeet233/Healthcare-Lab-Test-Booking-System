import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Settings, 
    Bell, 
    Shield, 
    Smartphone, 
    Globe, 
    Mail, 
    MessageCircle, 
    Moon, 
    Sun,
    Trash2,
    Save,
    Lock,
    Eye,
    ShieldCheck,
    CreditCard,
    User,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Zap,
    Key,
    UserCircle,
    Download,
    HelpCircle,
    MessageSquare,
    FileText,
    ShieldIcon,
    Monitor,
    Languages,
    Database,
    Phone,
    UserCheck,
    LockIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { notify } from '../../utils/toast';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('account');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const [profile, currentSettings] = await Promise.all([
                userService.getProfile(),
                userService.getSettings().catch(() => null)
            ]);
            setUser(profile);
            setSettings(currentSettings);
        } catch (error) {
            notify.error('Failed to load settings.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (updatedData: any) => {
        try {
            setIsSaving(true);
            if (updatedData?.notifications || updatedData?.privacy || updatedData?.appearance) {
                const merged = {
                    notifications: { ...(settings?.notifications || {}), ...(updatedData.notifications || {}) },
                    privacy: { ...(settings?.privacy || {}), ...(updatedData.privacy || {}) },
                    appearance: { ...(settings?.appearance || {}), ...(updatedData.appearance || {}) }
                };
                const saved = await userService.updateSettings(merged);
                setSettings(saved);
            } else {
                await userService.updateProfile(updatedData);
            }
            notify.success('Settings saved.');
            setUser((prev: any) => ({ ...prev, ...updatedData }));
        } catch (error) {
            notify.error('Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-cyan-800/60 font-black text-[10px] uppercase tracking-widest animate-pulse">Loading settings...</p>
                </div>
            </div>
        );
    }

    const navItems = [
        { id: 'account', label: 'Account & Security', icon: ShieldCheck },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy', icon: LockIcon },
        { id: 'appearance', label: 'Appearance', icon: Monitor },
        { id: 'help', label: 'Help', icon: HelpCircle },
    ];

    return (
        <div className="max-w-[1200px] w-full mx-auto px-4 md:px-5 py-8 md:py-9 min-h-screen">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
                <div className="max-w-2xl">
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
                            <span className="text-[#005d79]">Settings</span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-2.5 mb-3">
                        <div className="p-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/20 shadow-sm">
                            <Settings className="w-5 h-5 text-cyan-600" />
                        </div>
                        <span className="text-[clamp(0.62rem,0.58rem+0.16vw,0.72rem)] font-extrabold uppercase tracking-[0.16em] text-cyan-800/60">
                            Settings
                        </span>
                    </div>
                    <h1 className="text-[clamp(1.7rem,1.2rem+1.7vw,2.7rem)] font-black text-[#164E63] tracking-tight mb-2.5">
                        <span className="text-cyan-600">Settings</span>
                    </h1>
                    <p className="text-[clamp(0.84rem,0.8rem+0.3vw,1rem)] text-cyan-900/60 font-medium leading-relaxed">
                        Manage your account, notifications, privacy, and app preferences.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Sidebar Navigation */}
                <aside className="lg:col-span-4 lg:sticky lg:top-20 h-fit space-y-4">
                    <GlassCard className="p-0 overflow-hidden border-white/40">
                        <div className="p-5 bg-gradient-to-br from-cyan-500/5 to-transparent border-b border-white/20">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#164E63] flex items-center justify-center text-white text-lg font-black shadow-lg shadow-cyan-900/10">
                                    {user?.firstName?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-[#164E63] tracking-tight">{user?.firstName} {user?.lastName}</h3>
                                    <p className="text-xs font-bold text-cyan-600/60 uppercase tracking-widest">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                        <nav className="p-3">
                            {navItems.map(item => (
                                <button 
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all group ${
                                        activeSection === item.id 
                                        ? 'bg-[#164E63] text-white shadow-xl shadow-cyan-900/20' 
                                        : 'text-slate-500 hover:bg-white/40 hover:text-cyan-600'
                                    }`}
                                >
                                    <item.icon size={18} className={activeSection === item.id ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-500'} />
                                    <span className="flex-1 text-left tracking-tight">{item.label}</span>
                                    <ChevronRight size={14} className={activeSection === item.id ? 'text-cyan-300/40' : 'text-slate-300'} />
                                </button>
                            ))}
                        </nav>
                        <div className="p-3 pt-0">
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black text-rose-500 hover:bg-rose-50/50 transition-all uppercase tracking-widest"
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </GlassCard>

                    <GlassCard className="bg-cyan-900/5 border-dashed border-cyan-200/50">
                        <div className="flex items-center gap-3 mb-2">
                             <Zap size={14} className="text-cyan-600" />
                             <span className="text-[10px] font-black text-cyan-900/40 uppercase tracking-widest">System Status</span>
                        </div>
                        <p className="text-[11px] font-bold text-cyan-800/60 leading-relaxed">
                            v4.2.0-stable | Stable
                            All systems are operational.
                        </p>
                    </GlassCard>
                </aside>

                {/* Main Content Area */}
                <main className="lg:col-span-8 min-h-[460px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <GlassCard className="border-white/40">
                                {activeSection === 'account' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                            <div>
                                                <h2 className="text-xl font-black text-[#164E63] tracking-tight">Account & Security</h2>
                                                <p className="text-xs text-slate-400 font-medium">Manage your account and security settings.</p>
                                            </div>
                                            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-500">
                                                <ShieldCheck size={20} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                    <input 
                                                        type="email" 
                                                        value={user?.email || ''} 
                                                        disabled 
                                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-10 pr-3 py-3 text-sm font-bold text-slate-400 cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                                <div className="relative group">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600/50" size={16} />
                                                    <input 
                                                        type="tel" 
                                                        value={user?.phone || '+919876543210'} 
                                                        className="w-full bg-white/50 border border-white/50 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/5 rounded-xl pl-10 pr-3 py-3 text-sm font-bold text-[#164E63] transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Security Options</h4>
                                            <div className="flex items-center justify-between p-4 bg-slate-50/30 rounded-xl border border-white">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
                                                        <Key className="text-cyan-600" size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-[#164E63]">Multifactor Authentication</p>
                                                        <p className="text-[11px] font-bold text-slate-400">Add an extra layer of biometric security.</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="px-3 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-rose-500/20">Disabled</span>
                                                    <GlassButton variant="tertiary" className="py-2 px-6">ACTIVATE</GlassButton>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'notifications' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                            <div>
                                                <h2 className="text-xl font-black text-[#164E63] tracking-tight">Notifications</h2>
                                                <p className="text-xs text-slate-400 font-medium">Control alerts and reminders.</p>
                                            </div>
                                            <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-500">
                                                <Bell size={20} />
                                            </div>
                                        </div>

                                        <div className="space-y-2.5">
                                            {[
                                                { id: 'emailNotifications', label: 'Email Notifications', desc: 'Get booking and report updates on email.', checked: settings?.notifications?.emailNotifications },
                                                { id: 'smsNotifications', label: 'SMS Notifications', desc: 'Get booking and report updates on SMS.', checked: settings?.notifications?.smsNotifications },
                                                { id: 'reportReady', label: 'Report Ready', desc: 'Get notified when your report is ready.', checked: settings?.notifications?.reportReady },
                                                { id: 'bookingReminder', label: 'Booking Reminders', desc: 'Get reminders before your appointment.', checked: settings?.notifications?.bookingReminder },
                                            ].map(item => (
                                                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/40 transition-all border border-transparent hover:border-white group">
                                                    <div className="flex-1">
                                                        <h4 className="text-xs font-black text-[#164E63] group-hover:text-cyan-600 transition-colors uppercase tracking-tight">{item.label}</h4>
                                                        <p className="text-[11px] font-bold text-slate-400 mt-1">{item.desc}</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            className="sr-only peer"
                                                            checked={item.checked}
                                                            onChange={() => handleSave({ notifications: { [item.id]: !item.checked } })}
                                                        />
                                                        <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 shadow-inner" />
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'privacy' && (
                                    <div className="space-y-6">
                                         <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                            <div>
                                                <h2 className="text-xl font-black text-[#164E63] tracking-tight">Privacy</h2>
                                                <p className="text-xs text-slate-400 font-medium">Control who can view your health data.</p>
                                            </div>
                                            <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-500">
                                                <LockIcon size={20} />
                                            </div>
                                        </div>

                                        <div className="space-y-2.5">
                                            <div className="p-4 bg-slate-50/30 rounded-xl border border-white">
                                                <div className="flex items-center justify-between mb-5">
                                                    <div className="flex items-center gap-4">
                                                        <UserCheck className="text-cyan-600" size={24} />
                                                        <div>
                                                            <h4 className="text-sm font-black text-[#164E63]">Practitioner Access</h4>
                                                            <p className="text-[11px] font-bold text-slate-400">Enable clinical operators to view diagnostic history.</p>
                                                        </div>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            className="sr-only peer"
                                                            checked={settings?.privacy?.shareWithDoctor}
                                                            onChange={() => handleSave({ privacy: { shareWithDoctor: !settings?.privacy?.shareWithDoctor } })}
                                                        />
                                                        <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#164E63]" />
                                                    </label>
                                                </div>

                                                <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3">
                                                    <GlassButton variant="secondary" className="w-full py-4 text-[10px]" icon={<Download size={14} />}>
                                                        EXPORT RAW BIOMETRICS
                                                    </GlassButton>
                                                    <button className="flex items-center justify-center gap-2 w-full py-4 px-6 rounded-2xl bg-rose-500/5 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">
                                                        <Trash2 size={14} />
                                                        PURGE GLOBAL RECORD
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'appearance' && (
                                    <div className="space-y-6">
                                         <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                            <div>
                                                <h2 className="text-xl font-black text-[#164E63] tracking-tight">Appearance</h2>
                                                <p className="text-xs text-slate-400 font-medium">Customize theme, language, and units.</p>
                                            </div>
                                            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500">
                                                <Monitor size={20} />
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Theme</label>
                                                <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
                                                    {[
                                                        { id: 'light', icon: Sun, label: 'Luminescence' },
                                                        { id: 'dark', icon: Moon, label: 'Obsidian' },
                                                        { id: 'auto', icon: Globe, label: 'Adaptive' },
                                                    ].map(theme => (
                                                        <button 
                                                            key={theme.id}
                                                            onClick={() => handleSave({ appearance: { theme: theme.id } })}
                                                            className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
                                                                settings?.appearance?.theme === theme.id 
                                                                ? 'bg-cyan-600 border-cyan-500 text-white shadow-xl shadow-cyan-900/10' 
                                                                : 'bg-white/50 border-white text-slate-500 hover:border-cyan-200'
                                                            }`}
                                                        >
                                                            <theme.icon size={24} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">{theme.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Language</label>
                                                    <div className="relative">
                                                        <Languages className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600/40" size={16} />
                                                        <select className="w-full bg-white/50 border border-white appearance-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/5 rounded-xl pl-10 pr-3 py-3 text-sm font-bold text-[#164E63] cursor-pointer">
                                                            <option value="en">English (Universal)</option>
                                                            <option value="hi">Hindi (Localized)</option>
                                                        </select>
                                                        <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-300 pointer-events-none" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Units</label>
                                                    <div className="relative">
                                                        <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600/40" size={16} />
                                                        <select className="w-full bg-white/50 border border-white appearance-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/5 rounded-xl pl-10 pr-3 py-3 text-sm font-bold text-[#164E63] cursor-pointer">
                                                            <option value="metric">Metric (kg/cm)</option>
                                                            <option value="imperial">Imperial (lb/in)</option>
                                                        </select>
                                                        <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-300 pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'help' && (
                                    <div className="space-y-6">
                                         <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                            <div>
                                                <h2 className="text-xl font-black text-[#164E63] tracking-tight">Help</h2>
                                                <p className="text-xs text-slate-400 font-medium">Get help and support resources.</p>
                                            </div>
                                            <div className="p-2.5 bg-slate-500/10 rounded-xl border border-slate-500/20 text-slate-500">
                                                <HelpCircle size={20} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
                                            {[
                                                { icon: FileText, label: 'Protocols (FAQ)', desc: 'Standard operating procedures.' },
                                                { icon: MessageSquare, label: 'Direct Uplink', desc: 'Secure operator support channel.' },
                                                { icon: Mail, label: 'Dispatch', desc: 'Email technical feedback.' },
                                            ].map((card, i) => (
                                                <button key={i} className="flex flex-col items-center text-center p-5 rounded-[20px] bg-slate-50/30 border border-transparent hover:border-cyan-200 hover:bg-white transition-all group">
                                                    <div className="p-3 rounded-[16px] bg-white border border-slate-100 mb-4 group-hover:scale-110 group-hover:bg-cyan-50 transition-all text-cyan-600">
                                                        <card.icon size={22} />
                                                    </div>
                                                    <h4 className="text-sm font-black text-[#164E63] mb-2">{card.label}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tighter">{card.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </GlassCard>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;
