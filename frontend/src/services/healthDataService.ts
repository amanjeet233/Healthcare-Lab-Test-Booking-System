import api from './api';

export interface HealthMetrics {
    weight: number;
    height: number;
    bloodPressure: string;
    heartRate: number;
    age: number;
    bmi: number;
}

export interface EmergencyContact {
    name: string;
    phone: string;
    relationship: string;
    relation: string;
}

export interface BloodPressureEntry {
    date: string;
    systolic: number;
    diastolic: number;
}

export interface HealthProfile {
    id?: number;
    bloodType: string;
    allergies: string[];
    chronicConditions: string[];
    medications: string[];
    familyHistory: { condition: string; relation: string }[];
    lastUpdated: string;
    metrics: HealthMetrics;
    emergencyContact: EmergencyContact;
    bloodPressureHistory: BloodPressureEntry[];
}

export type HealthData = HealthProfile;

const normalizeHealthProfile = (raw: any): HealthProfile => {
    const metrics = raw?.metrics || {};
    const emergencyContact = raw?.emergencyContact || {};
    
    return {
        id: raw?.id,
        bloodType: raw?.bloodType || '',
        allergies: raw?.allergies || [],
        chronicConditions: raw?.chronicConditions || [],
        medications: raw?.medications || [],
        familyHistory: raw?.familyHistory || [],
        lastUpdated: raw?.lastUpdated || new Date().toISOString(),
        metrics: {
            weight: metrics.weight || 0,
            height: metrics.height || 0,
            bloodPressure: metrics.bloodPressure || '',
            heartRate: metrics.heartRate || 0,
            age: metrics.age || 0,
            bmi: metrics.bmi || 0
        },
        emergencyContact: {
            name: emergencyContact.name || '',
            phone: emergencyContact.phone || '',
            relationship: emergencyContact.relationship || emergencyContact.relation || '',
            relation: emergencyContact.relation || emergencyContact.relationship || ''
        },
        bloodPressureHistory: raw?.bloodPressureHistory || []
    };
};

export const healthDataService = {
    getHealthData: async (): Promise<HealthProfile> => {
        try {
            const response = await api.get('/api/users/health-data');
            return normalizeHealthProfile(response.data?.data || response.data);
        } catch {
            return normalizeHealthProfile({});
        }
    },

    updateHealthData: async (data: Partial<HealthProfile>): Promise<HealthProfile> => {
        const response = await api.put('/api/users/health-data', data);
        return normalizeHealthProfile(response.data?.data || response.data);
    },

    /**
     * Get historical health metrics
     */
    getHealthMetrics: async (days: number = 30): Promise<any[]> => {
        try {
            const response = await api.get('/api/health/metrics', { params: { days } });
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching health metrics:', error);
            return [];
        }
    },

    /**
     * Get health metrics trends
     */
    getHealthTrends: async (days: number = 30): Promise<any[]> => {
        try {
            const response = await api.get('/api/health/trends', { params: { days } });
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching health trends:', error);
            return [];
        }
    },

    /**
     * Update a single health metric
     */
    updateHealthMetric: async (metricId: number, value: number): Promise<any> => {
        try {
            const response = await api.put(`/api/health/metrics/${metricId}`, { value });
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error updating health metric:', error);
            throw error;
        }
    },

    /**
     * Add blood pressure entry
     */
    addBloodPressureEntry: async (systolic: number, diastolic: number): Promise<any> => {
        try {
            const response = await api.post('/api/health/blood-pressure', { systolic, diastolic });
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error adding blood pressure entry:', error);
            throw error;
        }
    },

    /**
     * Get blood pressure history
     */
    getBloodPressureHistory: async (days: number = 30): Promise<BloodPressureEntry[]> => {
        try {
            const response = await api.get('/api/health/blood-pressure', { params: { days } });
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching blood pressure history:', error);
            return [];
        }
    }
};
