import React from 'react';
import { motion } from 'framer-motion';
import { X, Info, CheckCircle, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';
import type { Notification } from '../../services/notificationService';

interface NotificationToastProps {
    notification: Notification;
    onClose: (id: string) => void;
    onClick?: (notification: Notification) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose, onClick }) => {
    const icons = {
        info: <Info className="w-5 h-5 text-blue-500" />,
        success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        critical: <ShieldAlert className="w-5 h-5 text-red-500" />
    };

    const colors = {
        info: 'border-blue-500/20 bg-blue-50/10',
        success: 'border-emerald-500/20 bg-emerald-50/10',
        warning: 'border-amber-500/20 bg-amber-50/10',
        critical: 'border-red-500/20 bg-red-50/10'
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className={`w-full max-w-sm pointer-events-auto bg-white/80 backdrop-blur-2xl border ${colors[notification.type]} rounded-[1.5rem] shadow-radical-sm p-4 flex gap-4 items-start relative overflow-hidden group hover:shadow-radical transition-all cursor-pointer`}
            onClick={() => onClick?.(notification)}
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-current opacity-20" style={{ color: `var(--notification-${notification.type})` }} />

            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-medical">
                {icons[notification.type]}
            </div>

            <div className="flex-grow space-y-1 pr-6">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-evergreen">{notification.title}</span>
                    <span className="text-[8px] font-bold text-muted-gray opacity-40 uppercase tracking-tighter">Just Now</span>
                </div>
                <p className="text-[11px] text-muted-gray font-medium leading-relaxed line-clamp-2">
                    {notification.message}
                </p>
                {notification.actionLink && (
                    <div className="flex items-center gap-1.5 pt-1 text-primary group-hover:translate-x-1 transition-transform">
                        <span className="text-[9px] font-black uppercase tracking-widest">Protocol Action Required</span>
                        <ArrowRight className="w-3 h-3" />
                    </div>
                )}
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose(notification.id);
                }}
                className="absolute top-4 right-4 text-muted-gray hover:text-evergreen transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

export default NotificationToast;
