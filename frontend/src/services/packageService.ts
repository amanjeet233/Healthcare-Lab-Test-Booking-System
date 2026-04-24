import api, { cachedGet } from './api';

export interface TestPackageResponse {
    id: number;
    name: string;
    packageName: string;
    packageCode: string;
    description: string;
    price: number;
    discountedPrice: number;
    discountPercentage: number;
    savings: number;
    totalTests: number;
    tests: { id: number; name: string }[];
    category: string;
    isPopular?: boolean;
}

export interface PopularPackage {
    id: number;
    name: string;
    bookingCount: number;
    rating: number;
    revenue: number;
}

export type TestPackage = TestPackageResponse;

const normalizePackage = (pkg: any): TestPackageResponse => ({
    id: pkg.id || 0,
    name: pkg.name || pkg.packageName || '',
    packageName: pkg.packageName || pkg.name || '',
    packageCode: pkg.packageCode || '',
    description: pkg.description || '',
    price: pkg.price || 0,
    discountedPrice: pkg.discountedPrice ?? pkg.finalPrice ?? pkg.price ?? 0,
    discountPercentage: pkg.discountPercentage || 0,
    savings: pkg.savings || (pkg.price && pkg.discountedPrice ? pkg.price - pkg.discountedPrice : 0),
    totalTests: pkg.totalTests || (pkg.tests?.length || 0),
    tests: pkg.tests || [],
    category: pkg.category || 'General',
    isPopular: pkg.isPopular || false
});

export const packageService = {
    getAllPackages: async (params?: { page?: number; size?: number; category?: string }): Promise<TestPackageResponse[]> => {
        let response;
        try {
            response = await cachedGet('/api/test-packages', { params });
        } catch {
            response = await cachedGet('/api/lab-tests/packages', { params });
        }
        let data: any[] = [];
        if (response.data?.content) {
            data = response.data.content;
        } else if (response.data?.data?.content) {
            data = response.data.data.content;
        } else {
            data = response.data?.data || response.data || [];
        }
        return data.map(normalizePackage);
    },

    getPackageById: async (id: number): Promise<TestPackageResponse> => {
        let response;
        try {
            response = await api.get(`/api/test-packages/${id}`);
        } catch {
            response = await api.get(`/api/lab-tests/packages/${id}`);
        }
        return normalizePackage(response.data?.data || response.data);
    },

    getBestDeals: async (): Promise<TestPackageResponse[]> => {
        try {
            const response = await cachedGet('/api/lab-tests/packages/best-deals');
            const primaryData = response.data?.data || response.data || [];
            const primaryList = Array.isArray(primaryData) ? primaryData : [];
            return primaryList.map(normalizePackage);
        } catch {
            try {
                const response = await cachedGet('/api/test-packages', { params: { size: 4 } });
                const data = response.data?.content || response.data?.data?.content || response.data?.data || response.data || [];
                const list = Array.isArray(data) ? data : [];
                return list
                    .map(normalizePackage)
                    .filter((p) => p.discountPercentage > 0)
                    .sort((a, b) => b.discountPercentage - a.discountPercentage)
                    .slice(0, 4);
            } catch {
                return [];
            }
        }
    },

    /**
     * Get popular packages ranked by bookings
     */
    getPopularPackages: async (limit: number = 10): Promise<PopularPackage[]> => {
        try {
            const response = await cachedGet('/api/test-packages/popular', { params: { limit } });
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching popular packages:', error);
            return [];
        }
    }
};
