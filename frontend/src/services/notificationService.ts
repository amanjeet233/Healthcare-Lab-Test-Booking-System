import api from './api';

type BackendNotification = {
    id?: number | string;
    title?: string;
    message?: string;
    type?: string;
    createdAt?: string;
    timestamp?: string;
    isRead?: boolean;
    read?: boolean;
    referenceType?: string;
    referenceId?: number | string;
};

const toNotificationType = (value: unknown): Notification['type'] => {
    const type = String(value || '').toLowerCase();
    if (type === 'success') return 'success';
    if (type === 'warning') return 'warning';
    if (type === 'critical') return 'critical';
    return 'info';
};

const toNotificationCategory = (value: unknown): Notification['category'] => {
    const ref = String(value || '').toUpperCase();
    if (ref.includes('SECURITY')) return 'security';
    if (ref.includes('APPOINTMENT') || ref.includes('BOOKING')) return 'appointment';
    if (ref.includes('MEDICAL') || ref.includes('REPORT') || ref.includes('RESULT')) return 'medical';
    return 'system';
};

const mapNotification = (payload: BackendNotification): Notification => {
    const actionLink = payload.referenceType && payload.referenceId
        ? `/booking/${payload.referenceId}`
        : undefined;

    return {
        id: String(payload.id ?? ''),
        title: payload.title || 'Notification',
        message: payload.message || '',
        type: toNotificationType(payload.type),
        timestamp: payload.createdAt || payload.timestamp || new Date().toISOString(),
        read: Boolean(payload.isRead ?? payload.read),
        category: toNotificationCategory(payload.referenceType),
        actionLink
    };
};

const extractNotificationArray = (payload: unknown): BackendNotification[] => {
    if (Array.isArray(payload)) {
        return payload as BackendNotification[];
    }

    if (payload && typeof payload === 'object') {
        const obj = payload as Record<string, unknown>;

        if (Array.isArray(obj.content)) {
            return obj.content as BackendNotification[];
        }

        if (Array.isArray(obj.data)) {
            return obj.data as BackendNotification[];
        }

        if (obj.data && typeof obj.data === 'object') {
            const data = obj.data as Record<string, unknown>;
            if (Array.isArray(data.content)) {
                return data.content as BackendNotification[];
            }
            if (Array.isArray(data.data)) {
                return data.data as BackendNotification[];
            }
        }
    }

    return [];
};

const normalizeNotificationList = (payload: unknown): Notification[] => {
    return extractNotificationArray(payload).map(mapNotification);
};

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'critical';
    timestamp: string;
    read: boolean;
    category: 'system' | 'medical' | 'appointment' | 'security';
    actionLink?: string;
}

export interface NotificationPreference {
    category: 'system' | 'medical' | 'appointment' | 'security';
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
}

export const notificationService = {
    /**
     * Get all notifications
     */
    getNotifications: async (): Promise<Notification[]> => {
        try {
            // Request up to 200 notifications per page
            const response = await api.get('/api/notifications', { params: { size: 200 } });
            return normalizeNotificationList(response.data);
        } catch (error) {
            console.error('Error fetching notifications', error);
            return [];
        }
    },

    /**
     * Get unread count
     */
    getUnreadCount: async (): Promise<number> => {
        try {
            const response = await api.get('/api/notifications/unread-count');
            // Backend returns Map.of("unreadCount", count) inside ApiResponse.success
            const data = response.data?.data;
            if (data && typeof data === 'object' && 'unreadCount' in data) {
                return data.unreadCount;
            }
            return typeof data === 'number' ? data : (response.data?.unreadCount ?? 0);
        } catch (error) {
            console.error('Error fetching unread count', error);
            return 0;
        }
    },

    /**
     * Mark a notification as read
     */
    markAsRead: async (id: string): Promise<void> => {
        await api.put(`/api/notifications/${id}/read`);
    },

    /**
     * Mark all as read
     */
    markAllAsRead: async (): Promise<void> => {
        await api.put('/api/notifications/read-all');
    },

    /**
     * Delete a notification
     */
    deleteNotification: async (id: string): Promise<void> => {
        await api.delete(`/api/notifications/${id}`);
    },

    /**
     * Subscribe to real-time notifications via MSE (stubbed for future WebSocket)
     */
    subscribe: (_onNotification: (n: Notification) => void) => {
        // Here you would connect an EventSource or WebSocket.
        // For now, poll or return a no-op unsubscribe
        return () => {};
    },

    /**
     * Get notification preferences
     */
    getNotificationPreferences: async (): Promise<NotificationPreference[]> => {
        try {
            const response = await api.get('/api/notifications/preferences');
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching notification preferences:', error);
            return [];
        }
    },

    /**
     * Update notification preferences
     */
    updateNotificationPreferences: async (preferences: NotificationPreference[]): Promise<NotificationPreference[]> => {
        try {
            const response = await api.put('/api/notifications/preferences', { preferences });
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            throw error;
        }
    },

    /**
     * Update preference for a single category
     */
    updateCategoryPreference: async (category: string, preference: Partial<NotificationPreference>): Promise<NotificationPreference> => {
        try {
            const response = await api.put(`/api/notifications/preferences/${category}`, preference);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error updating category preference:', error);
            throw error;
        }
    },

    /**
     * Get notification history/archive
     */
    getNotificationHistory: async (params?: { days?: number; limit?: number }): Promise<Notification[]> => {
        try {
            const response = await api.get('/api/notifications/history', { params });
            return normalizeNotificationList(response.data);
        } catch (error) {
            console.error('Error fetching notification history:', error);
            return [];
        }
    }
};
