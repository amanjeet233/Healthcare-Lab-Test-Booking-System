import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, ChevronRight, Inbox, Settings } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

type NotificationBellProps = {
    badgeCountOverride?: number;
};

const NotificationBell: React.FC<NotificationBellProps> = ({ badgeCountOverride }) => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { currentUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const effectiveUnreadCount = typeof badgeCountOverride === 'number' ? badgeCountOverride : unreadCount;

    const notificationHubPath = currentUser?.role === 'ADMIN'
        ? '/admin/notifications'
        : currentUser?.role === 'TECHNICIAN'
            ? '/technician/notifications'
            : currentUser?.role === 'MEDICAL_OFFICER'
                ? '/medical-officer/notifications'
                : '/notifications';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Show unread notifications first in the dropdown
    const notificationsList = Array.isArray(notifications) ? notifications : [];
    const unreadNotifications = notificationsList.filter(n => !n.read);
    const readNotifications = notificationsList.filter(n => n.read);
    // Show up to 5, prioritizing unread
    const recentNotifications = [...unreadNotifications, ...readNotifications].slice(0, 5);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl bg-white border border-primary/10 shadow-radical-sm text-evergreen hover:bg-primary/5 transition-all active:scale-95 cursor-pointer group"
            >
                <Bell className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-12' : 'group-hover:rotate-12'}`} />
                {effectiveUnreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                        {effectiveUnreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-80 bg-white/95 backdrop-blur-2xl border border-primary/10 rounded-[2rem] shadow-2xl z-[100] overflow-hidden"
                    >
                        <div className="p-6 space-y-4">
                            {/* Header */}
                            <div className="flex justify-between items-center border-b border-primary/5 pb-4">
                                <div className="space-y-0.5">
                                    <h4 className="text-[12px] font-black text-evergreen uppercase tracking-widest italic">Notifications</h4>
                                    <p className="text-[8px] font-bold text-muted-gray uppercase opacity-40">{effectiveUnreadCount} Unread</p>
                                </div>
                                <button
                                    onClick={markAllAsRead}
                                    className="p-2 rounded-lg hover:bg-primary/5 text-primary transition-colors cursor-pointer"
                                    title="Mark all as read"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                </button>
                            </div>

                            {/* List */}
                            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                                {recentNotifications.length > 0 ? (
                                    recentNotifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            onClick={() => {
                                                markAsRead(notification.id);
                                                if (notification.actionLink) navigate(notification.actionLink);
                                                setIsOpen(false);
                                            }}
                                            className={`group p-3 rounded-2xl border transition-all cursor-pointer ${notification.read
                                                    ? 'bg-transparent border-transparent opacity-60'
                                                    : 'bg-primary/[0.03] border-primary/5 shadow-sm'
                                                } hover:bg-primary/5 hover:border-primary/10`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-500' :
                                                        notification.type === 'warning' ? 'bg-amber-50 text-amber-500' :
                                                            notification.type === 'critical' ? 'bg-red-50 text-red-500' :
                                                                'bg-blue-50 text-blue-500'
                                                    }`}>
                                                    <Inbox className="w-4 h-4" />
                                                </div>
                                                <div className="space-y-0.5 min-w-0">
                                                    <p className={`text-[10px] font-bold uppercase tracking-tight truncate ${notification.read ? 'text-muted-gray' : 'text-evergreen'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-[8px] text-muted-gray font-medium leading-tight line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-20">
                                        <Inbox className="w-8 h-8" />
                                        <p className="text-[9px] font-black uppercase tracking-widest">No notifications</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="pt-2 flex gap-2">
                                <button
                                    onClick={() => { navigate(notificationHubPath); setIsOpen(false); }}
                                    className="flex-1 py-3 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-evergreen transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    VIEW ALL <ChevronRight className="w-3 h-3" />
                                </button>
                                <button className="w-11 h-11 border border-primary/10 text-muted-gray rounded-xl flex items-center justify-center hover:bg-primary/5 transition-all cursor-pointer">
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
