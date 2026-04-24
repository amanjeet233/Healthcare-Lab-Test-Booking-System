import api from './api';

export const getTechnicianBookings = async () => {
    return api.get("/api/bookings/technician");
};

export const technicianService = {
    getTechnicianBookings,

    claimBooking: async (bookingId: number, technicianId: number) => {
        const response = await api.put(`/api/bookings/${bookingId}/technician`, { technicianId });
        return response.data?.data || response.data;
    },

    /**
     * Update booking status to SAMPLE_COLLECTED
     */
    updateCollectionStatus: async (id: number) => {
        try {
            const response = await api.put(`/api/bookings/${id}/collection`);
            return response.data;
        } catch (error) {
            console.error(`Error marking collection ${id} as completed:`, error);
            throw error;
        }
    },

    /**
     * Update booking status
     */
    updateBookingStatus: async (id: number, status: string, notes?: string) => {
        try {
            const body = notes ? { notes } : null;
            const response = await api.put(`/api/bookings/${id}/status`, body, { params: { status } });
            return response.data;
        } catch (error) {
            console.error(`Error marking booking ${id} as completed:`, error);
            throw error;
        }
    },

    /**
     * Backward-compatible alias used by existing dashboard code paths.
     */
    updateBookingCompletedStatus: async (id: number, notes?: string) => {
        return technicianService.updateBookingStatus(id, 'COMPLETED', notes);
    },

    /**
     * Get technician dashboard stats
     */
    getDashboardStats: async () => {
        try {
            const response = await api.get('/api/dashboard/technician/stats');
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching technician stats:', error);
            return { todayCollections: 0, pendingCollections: 0, completedToday: 0, weekTotal: 0 };
        }
    },

    getBookingTimeline: async (bookingId: number) => {
        const response = await api.get(`/api/bookings/${bookingId}/timeline`);
        return response.data?.data || [];
    },

    /**
     * Get technician collection history
     */
    getCollectionHistory: async (params?: Record<string, string | number>) => {
        try {
            const response = await api.get('/api/bookings/technician/history', { params: params || {} });

            if (response.data && response.data.content) {
                return response.data.content;
            }
            if (Array.isArray(response.data)) {
                return response.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching collection history:', error);
            return [];
        }
    },

    uploadReport: async (bookingId: number, file: File, onProgress?: (percent: number) => void) => {
        const formData = new FormData();
        formData.append('bookingId', bookingId.toString());
        formData.append('file', file);
        const response = await api.post('/api/reports/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (event) => {
                if (!onProgress || !event.total) return;
                const percent = Math.round((event.loaded * 100) / event.total);
                onProgress(percent);
            }
        });
        return response.data?.data || response.data;
    },

    getTestParameters: async (testId: number) => {
        try {
            const response = await api.get(`/api/lab-tests/${testId}/parameters`);
            const data = response.data?.data;
            if (Array.isArray(data) && data.length > 0) return data;
        } catch {
            // fallback below
        }

        try {
            const fallback = await api.get(`/api/test-parameters/test/${testId}`);
            return fallback.data?.data || [];
        } catch {
            return [];
        }
    },

    findTestIdByName: async (testName: string) => {
        const keyword = String(testName || '').trim();
        if (!keyword) return null;

        try {
            const response = await api.get('/api/lab-tests/search', {
                params: { keyword, page: 0, size: 20 }
            });

            const pageData = response.data?.data;
            const tests = Array.isArray(pageData?.content) ? pageData.content : [];
            if (tests.length === 0) return null;

            const exactMatch = tests.find((t: any) =>
                String(t?.testName || '').trim().toLowerCase() === keyword.toLowerCase()
            );
            const first = exactMatch || tests[0];
            const id = Number(first?.id);
            return Number.isFinite(id) && id > 0 ? id : null;
        } catch {
            return null;
        }
    },

    enterTestResults: async (
        bookingId: number,
        results: Array<{ parameterId: number; resultValue: string }>
    ) => {
        const response = await api.post('/api/reports/results', {
            bookingId,
            results
        });
        return response.data?.data || response.data;
    },

    checkResultsEntered: async (bookingId: number) => {
        try {
            const response = await api.get(`/api/reports/results/booking/${bookingId}`);
            const results = response.data?.data?.results;
            return Array.isArray(results) && results.length > 0;
        } catch {
            return false;
        }
    },

    checkReportExists: async (bookingId: number) => {
        try {
            const response = await api.get(`/api/reports/booking/${bookingId}/exists`);
            return response.data?.data || response.data || null;
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    },

    rejectSpecimen: async (bookingId: number, reason: string, notes?: string) => {
        const response = await api.post(`/api/bookings/${bookingId}/reject-specimen`, {
            reason,
            notes: notes || null
        });
        return response.data?.data || response.data;
    },

    getRejectedSpecimens: async () => {
        const response = await api.get('/api/dashboard/technician/rejected');
        return response.data?.data || response.data || [];
    },

    getConsentStatus: async (bookingId: number) => {
        const response = await api.get(`/api/consent/${bookingId}`);
        return response.data?.data || response.data;
    },

    captureConsent: async (payload: { bookingId: number; consentGiven: boolean; patientSignatureData: string }) => {
        const response = await api.post('/api/consent/capture', payload);
        return response.data?.data || response.data;
    }
};
