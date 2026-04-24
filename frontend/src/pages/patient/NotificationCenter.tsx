import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Inbox, Trash2, CheckCircle, Search, Filter, Settings, ShieldAlert, ArrowRight, Activity, Calendar, Lock, ChevronRight } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../../services/notificationService';

const NotificationCenter: React.FC = () => {
    const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const { currentUser } = useAuth();
    const [filter, setFilter] = useState<'all' | 'unread' | 'medical' | 'system' | 'appointment' | 'security'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const notificationsList = Array.isArray(notifications) ? notifications : [];
    const role = currentUser?.role;

    const filteredNotifications = notificationsList.filter((n: Notification) => {
        const matchesFilter =
            filter === 'all' ? true :
                filter === 'unread' ? !n.read :
                    filter === 'medical' ? n.category === 'medical' :
                        filter === 'system' ? n.category === 'system' :
                            filter === 'appointment' ? n.category === 'appointment' :
                                filter === 'security' ? n.category === 'security' : true;

        const matchesSearch =
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const categories = role === 'ADMIN'
        ? [
            { id: 'all', label: 'All Events', icon: Inbox },
            { id: 'unread', label: 'Pending', icon: Bell },
            { id: 'system', label: 'System', icon: ShieldAlert },
            { id: 'security', label: 'Security', icon: Lock },
        ]
        : role === 'MEDICAL_OFFICER'
            ? [
                { id: 'all', label: 'All Events', icon: Inbox },
                { id: 'unread', label: 'Pending', icon: Bell },
                { id: 'medical', label: 'Medical', icon: Activity },
                { id: 'appointment', label: 'Bookings', icon: Calendar },
            ]
            : role === 'TECHNICIAN'
                ? [
                    { id: 'all', label: 'All Events', icon: Inbox },
                    { id: 'unread', label: 'Pending', icon: Bell },
                    { id: 'appointment', label: 'Collection', icon: Calendar },
                    { id: 'system', label: 'System', icon: ShieldAlert },
                ]
                : [
                    { id: 'all', label: 'All Events', icon: Inbox },
                    { id: 'unread', label: 'Pending', icon: Bell },
                    { id: 'medical', label: 'Medical', icon: Activity },
                    { id: 'system', label: 'System', icon: ShieldAlert },
                ];

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'success': return 'border-emerald-500/10 bg-emerald-50/5 text-emerald-500';
            case 'warning': return 'border-amber-500/10 bg-amber-50/5 text-amber-500';
            case 'critical': return 'border-red-500/10 bg-red-50/5 text-red-500';
            default: return 'border-blue-500/10 bg-blue-50/5 text-blue-500';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'medical': return <Activity className="w-4 h-4" />;
            case 'system': return <ShieldAlert className="w-4 h-4" />;
            case 'appointment': return <Calendar className="w-4 h-4" />;
            case 'security': return <Lock className="w-4 h-4" />;
            default: return <Inbox className="w-4 h-4" />;
        }
    };

        return (
            <div className="min-h-screen pt-8 pb-8 px-4 md:px-8 max-w-7xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-800/60">
                <span>Home</span>
                <ChevronRight className="w-3 h-3" />
                <span>Notifications</span>
            </div>

            {/* Page Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary shadow-radical-sm">
                            <Bell className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-800/60">Notification Center</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#164E63] uppercase tracking-tighter italic leading-none">
                        <span className="text-cyan-600">Notifications</span>
                    </h1>
                </div>

                <div className="flex bg-white/40 backdrop-blur-xl border border-primary/5 rounded-[2rem] p-4 items-center gap-6 shadow-radical-sm">
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-primary/5 text-primary transition-all cursor-pointer"
                    >
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Mark All Read</span>
                    </button>
                    <div className="w-px h-8 bg-primary/10" />
                    <button className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-gray hover:bg-primary/5 transition-all cursor-pointer text-[10px]" title="Settings" aria-label="Settings">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Sidebar Filters */}
                <aside className="lg:col-span-3 space-y-8">
                    <div className="space-y-4">
                        <span className="text-[9px] font-black text-muted-gray uppercase tracking-[0.3em] opacity-40">Filters</span>
                        <div className="flex flex-col gap-2">
                            {categories.map(cat => {
                                const Icon = cat.icon;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setFilter(cat.id as 'all' | 'unread' | 'medical' | 'system' | 'appointment' | 'security')}
                                        className={`flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer ${filter === cat.id
                                                ? 'bg-primary text-white shadow-radical'
                                                : 'bg-white/40 hover:bg-white text-evergreen opacity-60 hover:opacity-100 hover:shadow-radical-sm'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                                        </div>
                                        {cat.id === 'unread' && notificationsList.filter((n: Notification) => !n.read).length > 0 && (
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${filter === cat.id ? 'bg-white/20' : 'bg-primary text-white'}`}>
                                                {notificationsList.filter((n: Notification) => !n.read).length}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6 bg-secondary/5 rounded-3xl border border-secondary/10 space-y-4">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-secondary" />
                            <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Quick Note</span>
                        </div>
                        <p className="text-[10px] text-muted-gray font-medium leading-relaxed">
                            These notifications show important updates about your account, bookings, and reports.
                        </p>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="lg:col-span-9 space-y-6">
                    {/* Search & Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-grow relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="IDENTIFY PROTOCOL..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/60 border border-primary/5 pl-12 pr-6 py-4 rounded-2xl focus:bg-white focus:shadow-radical-sm outline-none text-[11px] font-bold text-evergreen placeholder:opacity-30 uppercase tracking-widest transition-all"
                            />
                        </div>
                        <button className="px-6 py-4 bg-white/40 border border-primary/5 rounded-2xl flex items-center gap-3 text-muted-gray hover:text-primary transition-all cursor-pointer">
                            <Filter className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">More Filters</span>
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div className="space-y-4 min-h-[500px]">
                        <AnimatePresence mode="popLayout">
                            {filteredNotifications.length > 0 ? (
                                filteredNotifications.map((notification: Notification, i: number) => (
                                    <motion.div
                                        key={notification.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`p-6 rounded-[2rem] border transition-all flex flex-col md:flex-row gap-6 items-start md:items-center relative group ${notification.read
                                                ? 'bg-transparent border-primary/5 opacity-50'
                                                : 'bg-white border-primary/10 shadow-radical-sm hover:shadow-radical hover:border-primary/20'
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${getTypeStyles(notification.type)}`}>
                                            {getCategoryIcon(notification.category)}
                                        </div>

                                        <div className="flex-grow space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-sm font-black text-evergreen uppercase tracking-tight">{notification.title}</h3>
                                                <span className="text-[8px] font-bold text-muted-gray/40 uppercase tracking-tighter">
                                                    {new Date(notification.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-muted-gray font-medium leading-relaxed max-w-2xl">
                                                {notification.message}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 self-end md:self-center">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="p-3 bg-primary/5 text-primary rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer"
                                                    title="Mark as read"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            {notification.actionLink && (
                                                <button
                                                    onClick={() => navigate(notification.actionLink!)}
                                                    className="p-3 bg-secondary/5 text-secondary rounded-xl hover:bg-secondary hover:text-white transition-all cursor-pointer"
                                                    title="Execute protocol"
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification.id)}
                                                className="p-3 hover:bg-red-50 text-muted-gray hover:text-red-500 rounded-xl transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                                    title="Delete notification"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-20 text-center space-y-6 opacity-30"
                                >
                                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center">
                                        <Inbox className="w-10 h-10 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xl font-black uppercase text-evergreen italic">No Notifications</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest">No matching notifications found.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default NotificationCenter;
