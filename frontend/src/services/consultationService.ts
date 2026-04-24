import api from './api';

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    avatar?: string;
    rating: number;
    experience: string;
    education: string;
    bio: string;
}

export interface TimeSlot {
    id: string;
    time: string;
    isAvailable: boolean;
}

export interface DayAvailability {
    date: string;
    slots: TimeSlot[];
}

export interface Consultation {
    id: string;
    doctorId: string;
    doctorName: string;
    date: string;
    time: string;
    type: 'video' | 'audio' | 'chat';
    status: 'upcoming' | 'completed' | 'cancelled';
    patientName: string;
}

export const consultationService = {
    getDoctors: async (): Promise<Doctor[]> => {
        try {
            const response = await api.get('/api/doctors');
            return response.data || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    getDoctorAvailability: async (doctorId: string, date: string): Promise<TimeSlot[]> => {
        try {
            const response = await api.get(`/api/doctors/${doctorId}/availability`, { params: { date } });
            return response.data || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    bookConsultation: async (doctorId: string, date: string, time: string, type: 'video' | 'audio' | 'chat'): Promise<Consultation> => {
        const response = await api.post('/api/consultations', { doctorId, date, time, type });
        return response.data;
    },

    getUpcomingConsultations: async (): Promise<Consultation[]> => {
        try {
            const response = await api.get('/api/consultations/upcoming');
            return response.data || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    cancelConsultation: async (id: string): Promise<void> => {
        await api.delete(`/api/consultations/${id}`);
    },

    updateAvailability: async (doctorId: string, date: string, slots: TimeSlot[]): Promise<void> => {
        await api.put(`/api/doctors/${doctorId}/availability`, { date, slots });
    },

    getDoctorConsultations: async (doctorId: string): Promise<Consultation[]> => {
        try {
            const response = await api.get(`/api/doctors/${doctorId}/consultations`);
            return response.data || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    /**
     * Get doctors by specialization
     */
    getDoctorsBySpecialization: async (specialization: string): Promise<Doctor[]> => {
        try {
            const response = await api.get('/api/doctors', { params: { specialization } });
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching doctors by specialization:', error);
            return [];
        }
    },

    /**
     * Get all available specializations
     */
    getSpecializations: async (): Promise<string[]> => {
        try {
            const response = await api.get('/api/doctors/specializations');
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching specializations:', error);
            return [];
        }
    },

    /**
     * Get consultation history for current patient
     */
    getConsultationHistory: async (params?: { doctorId?: string; status?: string; limit?: number }): Promise<Consultation[]> => {
        try {
            const response = await api.get('/api/consultations/history', { params });
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching consultation history:', error);
            return [];
        }
    },

    /**
     * Get consultation details
     */
    getConsultationDetails: async (id: string): Promise<Consultation> => {
        try {
            const response = await api.get(`/api/consultations/${id}`);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error fetching consultation details:', error);
            throw error;
        }
    }
};
