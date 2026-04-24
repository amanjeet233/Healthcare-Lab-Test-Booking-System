import api from './api';

export interface PaymentInitiateRequest {
    bookingId: number;
    amount: number;
    paymentMethod: 'CARD' | 'UPI' | 'NET_BANKING';
    transactionId?: string;
}

export interface PaymentResponse {
    id: number;
    transactionId: string;
    status: string;
    amount: number;
    paymentMethod: string;
    bookingId: number;
    createdAt: string;
}

export const paymentService = {
    /**
     * Initiate a payment for a booking
     */
    initiatePayment: async (request: PaymentInitiateRequest): Promise<PaymentResponse> => {
        try {
            const response = await api.post('/api/payments/process', request);
            return (response.data?.data || response.data) as PaymentResponse;
        } catch (error) {
            console.error('Error initiating payment:', error);
            throw error;
        }
    },

    /**
     * Confirm payment after provider callback
     */
    confirmPayment: async (paymentId: number): Promise<PaymentResponse> => {
        try {
            const response = await api.post(`/api/payments/confirm/${paymentId}`);
            return (response.data?.data || response.data) as PaymentResponse;
        } catch (error) {
            console.error('Error confirming payment:', error);
            throw error;
        }
    },

    /**
     * Check payment status
     */
    getPaymentStatus: async (bookingId: number): Promise<PaymentResponse> => {
        try {
            const response = await api.get(`/api/payments/booking/${bookingId}`);
            return (response.data?.data || response.data) as PaymentResponse;
        } catch (error) {
            console.error('Error fetching payment status:', error);
            throw error;
        }
    },

    /**
     * Request refund for a booking
     */
    processRefund: async (bookingId: number): Promise<PaymentResponse> => {
        try {
            const response = await api.post(`/api/payments/refund`, { bookingId });
            return (response.data?.data || response.data) as PaymentResponse;
        } catch (error) {
            console.error('Error processing refund:', error);
            throw error;
        }
    },

    /**
     * Get payment history for the logged-in user
     */
    getPaymentHistory: async (): Promise<PaymentResponse[]> => {
        try {
            const response = await api.get('/api/payments/history');
            const data = response.data?.data || response.data;
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching payment history:', error);
            throw error;
        }
    }
};
