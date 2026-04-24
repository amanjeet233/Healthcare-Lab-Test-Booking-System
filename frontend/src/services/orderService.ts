import api from './api';

export interface OrderItem {
    id: number;
    testId: number;
    testName: string;
    quantity: number;
    price: number;
    discount: number;
}

export interface Order {
    id: number;
    orderId: string;
    userId: number;
    items: OrderItem[];
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    createdAt: string;
    updatedAt: string;
}

export interface OrderSummary {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
}

const normalizeOrder = (raw: any): Order => ({
    id: raw.id || 0,
    orderId: raw.orderId || `ORD-${raw.id}`,
    userId: raw.userId || 0,
    items: raw.items || [],
    totalAmount: raw.totalAmount || 0,
    discountAmount: raw.discountAmount || 0,
    finalAmount: raw.finalAmount || raw.totalAmount || 0,
    status: raw.status || 'PENDING',
    paymentStatus: raw.paymentStatus || 'PENDING',
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString()
});

export const orderService = {
    /**
     * Get all orders for current user
     */
    getMyOrders: async (params?: { page?: number; size?: number; status?: string }): Promise<{ orders: Order[], totalPages: number }> => {
        try {
            const response = await api.get('/api/orders', { params });
            const orders = (response.data?.content || response.data?.data || []).map(normalizeOrder);
            return {
                orders,
                totalPages: response.data?.totalPages || 1
            };
        } catch (error) {
            console.error('Error fetching orders:', error);
            return { orders: [], totalPages: 1 };
        }
    },

    /**
     * Get specific order details
     */
    getOrderById: async (orderId: number): Promise<Order> => {
        try {
            const response = await api.get(`/api/orders/${orderId}`);
            return normalizeOrder(response.data?.data || response.data);
        } catch (error) {
            console.error(`Error fetching order ${orderId}:`, error);
            throw error;
        }
    },

    /**
     * Create new order from cart
     */
    createOrder: async (items: Array<{ testId: number; quantity: number }>, promoCode?: string): Promise<Order> => {
        try {
            const response = await api.post('/api/orders', { items, promoCode });
            return normalizeOrder(response.data?.data || response.data);
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    /**
     * Cancel order
     */
    cancelOrder: async (orderId: number, reason?: string): Promise<Order> => {
        try {
            const response = await api.post(`/api/orders/${orderId}/cancel`, { reason });
            return normalizeOrder(response.data?.data || response.data);
        } catch (error) {
            console.error(`Error cancelling order ${orderId}:`, error);
            throw error;
        }
    },

    /**
     * Get order summary for dashboard
     */
    getOrderSummary: async (): Promise<OrderSummary> => {
        try {
            const response = await api.get('/api/orders/summary');
            return response.data?.data || response.data || {
                totalOrders: 0,
                pendingOrders: 0,
                completedOrders: 0,
                totalRevenue: 0,
                averageOrderValue: 0
            };
        } catch (error) {
            console.error('Error fetching order summary:', error);
            return {
                totalOrders: 0,
                pendingOrders: 0,
                completedOrders: 0,
                totalRevenue: 0,
                averageOrderValue: 0
            };
        }
    },

    /**
     * Update order status (admin)
     */
    updateOrderStatus: async (orderId: number, status: string): Promise<Order> => {
        try {
            const response = await api.put(`/api/orders/${orderId}/status`, { status });
            return normalizeOrder(response.data?.data || response.data);
        } catch (error) {
            console.error(`Error updating order ${orderId} status:`, error);
            throw error;
        }
    },

    /**
     * Get all orders (admin)
     */
    getAllOrders: async (params?: { page?: number; size?: number; userId?: number; status?: string }): Promise<{ orders: Order[], totalPages: number }> => {
        try {
            const response = await api.get('/api/admin/orders', { params });
            const orders = (response.data?.content || response.data?.data || []).map(normalizeOrder);
            return {
                orders,
                totalPages: response.data?.totalPages || 1
            };
        } catch (error) {
            console.error('Error fetching all orders:', error);
            return { orders: [], totalPages: 1 };
        }
    },

    /**
     * Export orders to CSV (admin)
     */
    exportOrders: async (params?: { fromDate?: string; toDate?: string }): Promise<Blob> => {
        try {
            const response = await api.get('/api/orders/export', {
                params,
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error exporting orders:', error);
            throw error;
        }
    },

    /**
     * Get order analytics (admin)
     */
    getOrderAnalytics: async (params?: { period?: string }): Promise<any> => {
        try {
            const response = await api.get('/api/orders/analytics', { params });
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error fetching order analytics:', error);
            return null;
        }
    }
};
