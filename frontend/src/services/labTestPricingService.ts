import api from './api';

export interface TestPrice {
    id: number;
    testId: number;
    testName: string;
    basePrice: number;
    discountedPrice: number;
    discountPercentage: number;
    homeCollectionFee: number;
    totalPrice: number;
    currency: string;
    validFrom: string;
    validTo?: string;
}

export interface PricingHistory {
    testId: number;
    testName: string;
    priceHistory: Array<{
        date: string;
        price: number;
        discount: number;
    }>;
}

export interface PricingTemplate {
    id: number;
    name: string;
    baseDiscount: number;
    applicableTo: number[];
    active: boolean;
    createdAt: string;
}

export const labTestPricingService = {
    /**
     * Get current price for a specific test
     */
    getTestPrice: async (testId: number): Promise<TestPrice> => {
        try {
            const response = await api.get(`/api/pricing/tests/${testId}`);
            return response.data?.data || response.data;
        } catch (error) {
            console.error(`Error fetching price for test ${testId}:`, error);
            throw error;
        }
    },

    /**
     * Get prices for multiple tests
     */
    getTestPrices: async (testIds: number[]): Promise<TestPrice[]> => {
        try {
            const response = await api.post('/api/pricing/tests', { testIds });
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching test prices:', error);
            return [];
        }
    },

    /**
     * Get all pricing data
     */
    getAllPricing: async (params?: { category?: string; page?: number; size?: number }): Promise<TestPrice[]> => {
        try {
            const response = await api.get('/api/pricing', { params });
            return response.data?.data || response.data?.content || [];
        } catch (error) {
            console.error('Error fetching all pricing:', error);
            return [];
        }
    },

    /**
     * Get price history for a test
     */
    getPriceHistory: async (testId: number, days?: number): Promise<PricingHistory> => {
        try {
            const response = await api.get(`/api/pricing/tests/${testId}/history`, {
                params: days ? { days } : {}
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error(`Error fetching price history for test ${testId}:`, error);
            throw error;
        }
    },

    /**
     * Update test price (admin)
     */
    updateTestPrice: async (testId: number, data: Partial<TestPrice>): Promise<TestPrice> => {
        try {
            const response = await api.put(`/api/pricing/tests/${testId}`, data);
            return response.data?.data || response.data;
        } catch (error) {
            console.error(`Error updating price for test ${testId}:`, error);
            throw error;
        }
    },

    /**
     * Apply bulk pricing (admin)
     */
    applyBulkPricing: async (data: { testIds: number[]; discount: number; newPrice?: number }): Promise<any> => {
        try {
            const response = await api.post('/api/pricing/bulk', data);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error applying bulk pricing:', error);
            throw error;
        }
    },

    /**
     * Get pricing templates (admin)
     */
    getPricingTemplates: async (): Promise<PricingTemplate[]> => {
        try {
            const response = await api.get('/api/pricing/templates');
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching pricing templates:', error);
            return [];
        }
    },

    /**
     * Create pricing template (admin)
     */
    createPricingTemplate: async (data: Omit<PricingTemplate, 'id' | 'createdAt'>): Promise<PricingTemplate> => {
        try {
            const response = await api.post('/api/pricing/templates', data);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error creating pricing template:', error);
            throw error;
        }
    },

    /**
     * Apply pricing template (admin)
     */
    applyPricingTemplate: async (templateId: number, testIds: number[]): Promise<any> => {
        try {
            const response = await api.post(`/api/pricing/templates/${templateId}/apply`, { testIds });
            return response.data?.data || response.data;
        } catch (error) {
            console.error(`Error applying pricing template ${templateId}:`, error);
            throw error;
        }
    },

    /**
     * Get pricing statistics (admin)
     */
    getPricingStats: async (): Promise<any> => {
        try {
            const response = await api.get('/api/pricing/stats');
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error fetching pricing statistics:', error);
            return null;
        }
    },

    /**
     * Export pricing data (admin)
     */
    exportPricing: async (params?: { category?: string; format?: 'csv' | 'json' }): Promise<Blob> => {
        try {
            const response = await api.get('/api/pricing/export', {
                params,
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error exporting pricing:', error);
            throw error;
        }
    }
};
