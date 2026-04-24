import api, { cachedGet } from './api';
import type { LabTestResponse, LabTestSearchParams, LabTestPageResponse } from '../types/labTest';

export const labTestService = {
    /**
     * Fetch paginated and filtered lab tests
     */
    getLabTests: async (params: LabTestSearchParams): Promise<{ tests: LabTestResponse[], totalPages: number }> => {
        try {
            const response = await cachedGet('/api/lab-tests', { params });

            // Handle formal Spring Boot Page<LabTestResponse>
            if (response.data?.data?.content) {
                const pageData = response.data.data as LabTestPageResponse;
                return { tests: pageData.content, totalPages: pageData.totalPages || 1 };
            }

            // Handle plain JSON Array if pagination is stripped or simplified
            if (Array.isArray(response.data?.data) || (Array.isArray(response.data?.data) || Array.isArray(response.data))) {
                return { tests: Array.isArray(response.data?.data) ? response.data.data : response.data, totalPages: 1 };
            }

            // Handle embedded objects if it's Spring HATEOAS
            if (response.data && response.data._embedded && response.data._embedded.labTests) {
                return { tests: response.data._embedded.labTests, totalPages: response.data.page?.totalPages || 1 };
            }

            return { tests: [], totalPages: 1 };
        } catch (error) {
            console.error('Error fetching lab tests:', error);
            throw error;
        }
    },

    /**
     * Fetch a single lab test by ID
     */
    getLabTestById: async (id: number): Promise<LabTestResponse> => {
        try {
            const response = await api.get(`/api/lab-tests/${id}`);
            return (response.data?.data || response.data) as LabTestResponse;
        } catch (error) {
            console.error(`Error fetching lab test with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Fetch a single lab test by Slug
     */
    getLabTestBySlug: async (slug: string): Promise<LabTestResponse> => {
        try {
            const response = await api.get(`/api/tests/${slug}`);
            return (response.data?.data || response.data) as LabTestResponse;
        } catch (error) {
            console.error(`Error fetching lab test with slug ${slug}:`, error);
            throw error;
        }
    },

    /**
     * Search tests for autocomplete
     */
    searchTests: async (query: string): Promise<LabTestResponse[]> => {
        try {
            const response = await cachedGet(`/api/tests/search`, { params: { q: query } });
            return (response.data?.data || []) as LabTestResponse[];
        } catch (error) {
            console.error(`Error searching tests with query ${query}:`, error);
            return [];
        }
    }
};


