import { useState, useCallback } from 'react';
import api from '@/services/api';

export interface LabTest {
  id: number;
  testCode: string;
  testName: string;
  categoryName: string;
  categoryId?: number;
  testType?: string;
  methodology?: string;
  unit?: string;
  normalRangeMin?: number;
  normalRangeMax?: number;
  normalRangeText?: string;
  fastingRequired: boolean;
  fastingHours?: number;
  reportTimeHours?: number;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  parametersCount?: number;
  recommendedFor?: string;
  isTopBooked?: boolean;
  isTopDeal?: boolean;
  isActive?: boolean;
  isPackage?: boolean;
  isTrending?: boolean;
  sampleType?: string;
  turnaroundTime?: string;
  description?: string;
  shortDescription?: string;
  parameters?: any[];
  // Legacy aliases
  name?: string;
  category?: string;
}

interface UseTestsReturn {
  tests: LabTest[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentPage: number;

  // Functions
  fetchTests: (page?: number, size?: number, category?: string, search?: string) => Promise<void>;
  searchTests: (query: string) => Promise<void>;
  getTestById: (id: number) => Promise<LabTest | null>;
  getTrendingTests: () => Promise<void>;
  resetError: () => void;
}

export const useTests = (): UseTestsReturn => {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  // ✅ FETCH TESTS
  const fetchTests = useCallback(async (
    page = 0,
    size = 20,
    category?: string,
    search?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const params: any = { page, size };
      if (category && category !== 'ALL') params.category = category;
      if (search) params.searchTerm = search;

      console.log('🔍 Fetching tests with params:', params);

      const response = await api.get('/api/lab-tests', { params });

      console.log('✅ Tests response:', response.data);

      // ✅ Handle nested Page structure from Spring Data
      const apiResponse = response.data;
      const pageData = apiResponse.data; // The Page object

      // Extract tests array from Page.content or top-level data
      const testsArray = pageData?.content || (Array.isArray(pageData) ? pageData : []);
      const total = pageData?.totalElements || apiResponse.totalElements || 0;
      const pages = pageData?.totalPages || apiResponse.totalPages || 1;

      console.log('📊 Extracted tests:', testsArray.length, 'items');

      setTests(testsArray);
      setTotalElements(total);
      setTotalPages(pages);
      setCurrentPage(page);

    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch tests';
      console.error('❌ Error:', message);
      setError(message);
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ SEARCH TESTS
  const searchTests = useCallback(async (query: string) => {
    if (!query.trim()) {
      await fetchTests();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔎 Searching:', query);

      const response = await api.get('/api/lab-tests/search', {
        params: { keyword: query, page: 0, size: 20 }
      });

      // ✅ Handle nested Page structure from Spring Data
      const apiResponse = response.data;
      const pageData = apiResponse.data;
      const testsArray = pageData?.content || (Array.isArray(pageData) ? pageData : []);
      const total = pageData?.totalElements || apiResponse.totalElements || 0;
      const pages = pageData?.totalPages || apiResponse.totalPages || 1;

      setTests(testsArray);
      setTotalElements(total);
      setTotalPages(pages);
      setCurrentPage(0);

    } catch (err: any) {
      setError('Search failed');
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, [fetchTests]);

  // ✅ GET TEST BY ID
  const getTestById = useCallback(async (id: number): Promise<LabTest | null> => {
    try {
      console.log('📖 Fetching test:', id);

      const response = await api.get(`/api/lab-tests/${id}`);
      return response.data.data;
    } catch (err) {
      setError('Failed to fetch test');
      return null;
    }
  }, []);

  // ✅ GET TRENDING TESTS
  const getTrendingTests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('⭐ Fetching trending tests');

      const response = await api.get('/api/lab-tests/trending');

      // ✅ Trending returns List, not Page - data is directly the array
      const apiResponse = response.data;
      const testsArray = Array.isArray(apiResponse.data) ? apiResponse.data : [];

      console.log('📊 Trending tests:', testsArray.length, 'items');

      setTests(testsArray);
      setTotalElements(testsArray.length);
      setTotalPages(1);

    } catch (err: any) {
      setError('Failed to fetch trending tests');
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ RESET ERROR
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    tests,
    loading,
    error,
    totalElements,
    totalPages,
    currentPage,
    fetchTests,
    searchTests,
    getTestById,
    getTrendingTests,
    resetError
  };
};
