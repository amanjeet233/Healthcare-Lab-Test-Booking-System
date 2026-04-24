import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationService, type Notification } from '../services/notificationService';
import NotificationToast from '../components/notifications/NotificationToast';
import { AnimatePresence } from 'framer-motion';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    addToast: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [toasts, setToasts] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadData = useCallback(async () => {
        const list = await notificationService.getNotifications();
        const count = await notificationService.getUnreadCount();
        setNotifications(list);
        setUnreadCount(count);
    }, []);

    useEffect(() => {
        loadData();

        // Subscribe to real-time events
        const unsubscribe = notificationService.subscribe((n) => {
            addToast(n);
            loadData();
        });

        return () => unsubscribe();
    }, [loadData]);

    const addToast = (notification: Notification) => {
        setToasts(prev => [notification, ...prev]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== notification.id));
        }, 5000);
    };

    const markAsRead = async (id: string) => {
        await notificationService.markAsRead(id);
        await loadData();
    };

    const markAllAsRead = async () => {
        await notificationService.markAllAsRead();
        await loadData();
    };

    const deleteNotification = async (id: string) => {
        await notificationService.deleteNotification(id);
        await loadData();
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            addToast
        }}>
            {children}

            {/* Global Toasts Registry */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-4 w-full max-w-sm pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <NotificationToast
                            key={toast.id}
                            notification={toast}
                            onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
};
