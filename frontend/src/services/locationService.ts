import api from './api';

export interface LabLocation {
    id: string;
    name: string;
    address: string;
    city: string;
    lat: number;
    lng: number;
    phone: string;
    email: string;
    workingHours: string;
    distance?: number; // In km
    rating?: number;
}

export const locationService = {
    /**
     * Get user's current coordinates using Browser Geolocation API
     */
    getCurrentLocation: (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        });
    },

    /**
     * Calculate distance between two coordinates in kilometers (Haversine Formula)
     */
    calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    /**
     * Fetch labs near a specific location
     */
    getNearbyLabs: async (lat: number, lng: number, radius: number = 20): Promise<LabLocation[]> => {
        try {
            const response = await api.get('/api/lab-locations/nearby', { params: { lat, lng, radius } });
            // If backend handles distance, just return response.data
            return response.data || [];
        } catch (error) {
            console.error('Error fetching nearby labs:', error);
            return [];
        }
    },

    /**
     * Search labs by city name
     */
    searchLabsByCity: async (city: string): Promise<LabLocation[]> => {
        try {
            const response = await api.get('/api/lab-locations', { params: { city } });
            return response.data?.content || response.data || [];
        } catch (error) {
            console.error('Error searching labs:', error);
            return [];
        }
    },

    /**
     * Get specific lab details by ID
     */
    getLabDetails: async (id: string): Promise<LabLocation | undefined> => {
        try {
            const response = await api.get(`/api/lab-locations/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching lab ${id}:`, error);
            return undefined;
        }
    }
};
