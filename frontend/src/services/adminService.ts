import api, { cachedGet } from './api';

export interface SystemStats {
    totalUsers?: number;
    totalBookings?: number;
    totalTests?: number;
    totalRevenue?: number;
    pendingBookings?: number;
    activeUsers?: number;
    completedBookings?: number;
    processingBookings?: number;
    criticalCount?: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    joinDate?: string;
}

export type AdminUser = User;

export interface ChartDataPoint {
    date: string;
    value: number;
    label?: string;
}

export interface AuditLog {
    id: number;
    action: string;
    userId: number;
    userName: string;
    user?: string;
    details: string;
    timestamp: string;
    status?: string;
}

export interface CriticalBooking {
    id: number;
    bookingReference: string;
    patientName: string;
    testName: string;
    flaggedDate: string;
    status: string;
    bookingDate?: string;
    timeSlot?: string;
    technicianName?: string;
    collectionType?: string;
    collectionAddress?: string;
}

export interface RevenueData {
    date: string;
    amount: number;
}

export interface ReferenceRange {
    id: number;
    testParameterId: number;
    parameterName: string;
    minValue: number;
    maxValue: number;
    unit: string;
    normalRange: string;
    ageGroup?: string;
    gender?: string;
}

export interface DoctorTestAssignment {
    id: number;
    doctorId: number;
    doctorName: string;
    testId: number;
    testName: string;
    assignedDate: string;
    status: string;
}

export interface PaginatedData<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}

const unwrapPage = <T>(response: any): PaginatedData<T> => {
    const page = response?.data?.data || response?.data || {};
    return {
        content: page.content || [],
        totalPages: page.totalPages || 0,
        totalElements: page.totalElements || 0,
        number: page.number || 0,
        size: page.size || 20
    };
};

export const adminService = {
    getSystemStats: async (): Promise<SystemStats> => {
        const response = await api.get('/api/admin/stats');
        return response.data?.data || response.data || {
            totalUsers: 0, totalBookings: 0, totalTests: 0, totalRevenue: 0, pendingBookings: 0, activeUsers: 0
        };
    },

    getUsersPage: async (params?: { page?: number; size?: number; role?: string }): Promise<PaginatedData<User>> => {
        const response = await api.get('/api/admin/users', { params });
        const page = unwrapPage<User>(response);
        return {
            ...page,
            content: page.content.map((u: any) => ({ ...u, joinDate: u.joinDate || u.createdAt }))
        };
    },

    getAllUsers: async (params?: { page?: number; size?: number; role?: string }): Promise<User[]> => {
        const page = await adminService.getUsersPage(params);
        return page.content;
    },

    getUsers: async (params?: { page?: number; size?: number; role?: string }): Promise<{ users: User[]; totalPages: number }> => {
        const response = await api.get('/api/admin/users', { params });
        if (response.data?.content) {
            return { users: response.data.content, totalPages: response.data.totalPages || 1 };
        }
        return { users: response.data?.data || [], totalPages: 1 };
    },

    updateUserRole: async (userId: number, role: string): Promise<User> => {
        const response = await api.put(`/api/admin/users/${userId}/role`, { role });
        return response.data?.data || response.data;
    },

    toggleUserStatus: async (userId: string | number): Promise<User> => {
        const response = await api.put(`/api/admin/users/${userId}/toggle-status`);
        return response.data?.data || response.data;
    },

    getRevenueData: async (period?: string): Promise<RevenueData[]> => {
        const response = await api.get('/api/admin/revenue', { params: { period } });
        return response.data?.data || response.data || [];
    },

    getBookingTrends: async (): Promise<{ date: string; count: number }[]> => {
        const response = await api.get('/api/admin/bookings/trends');
        return response.data?.data || response.data || [];
    },

    getChartData: async (type: string): Promise<ChartDataPoint[]> => {
        const response = await cachedGet(`/api/admin/charts/${type}`);
        return response.data?.data || response.data || [];
    },

    getAuditLogsPage: async (params?: {
        page?: number;
        size?: number;
        action?: string;
        userRole?: string;
        from?: string;
        to?: string;
    }): Promise<PaginatedData<AuditLog>> => {
        const response = await api.get('/api/admin/audit-logs', { params });
        return unwrapPage<AuditLog>(response);
    },

    getAuditLogs: async (): Promise<AuditLog[]> => {
        const page = await adminService.getAuditLogsPage({ page: 0, size: 20 });
        return page.content;
    },

    // ============ REFERENCE RANGE MANAGEMENT ============

    /**
     * Get all reference ranges for all tests
     */
    getReferenceRanges: async (params?: { testId?: number; parameterId?: number }): Promise<ReferenceRange[]> => {
        const response = await api.get('/api/reference-ranges', { params });
        return response.data?.data || response.data || [];
    },

    // ============ BOOKING MANAGEMENT ============

    /**
     * Get all bookings for admin with filters
     */
    getAllBookingsPage: async (params?: { 
        page?: number; 
        size?: number; 
        patientName?: string; 
        status?: string 
    }): Promise<PaginatedData<any>> => {
        const response = await api.get('/api/bookings/admin/all', { params });
        return unwrapPage<any>(response);
    },

    getAllBookings: async (params?: { 
        page?: number; 
        size?: number; 
        patientName?: string; 
        status?: string 
    }): Promise<any[]> => {
        const page = await adminService.getAllBookingsPage(params);
        return page.content;
    },

    assignTechnician: async (bookingId: number, technicianId: number): Promise<any> => {
        const response = await api.put(`/api/bookings/${bookingId}/technician`, { technicianId });
        return response.data?.data || response.data;
    },

    adminUpdateBookingStatus: async (id: number, status: string, cancellationReason?: string): Promise<any> => {
        const response = await api.put(`/api/bookings/admin/${id}/status`, { status, cancellationReason });
        return response.data?.data || response.data;
    },

    getTechniciansOnly: async (): Promise<any[]> => {
        const response = await api.get('/api/admin/staff/technicians-only');
        return response.data?.data || response.data || [];
    },

    getCriticalBookings: async (): Promise<CriticalBooking[]> => {
        const response = await api.get('/api/admin/bookings/critical');
        return response.data?.data || response.data || [];
    },

    /**
     * Get reference range by ID
     */
    getReferenceRangeById: async (id: number): Promise<ReferenceRange> => {
        const response = await api.get(`/api/reference-ranges/${id}`);
        return response.data?.data || response.data;
    },

    /**
     * Update reference range values
     */
    updateReferenceRange: async (id: number, data: Partial<ReferenceRange>): Promise<ReferenceRange> => {
        const response = await api.put(`/api/reference-ranges/${id}`, data);
        return response.data?.data || response.data;
    },

    /**
     * Delete reference range
     */
    deleteReferenceRange: async (id: number): Promise<void> => {
        await api.delete(`/api/reference-ranges/${id}`);
    },

    /**
     * Create new reference range
     */
    createReferenceRange: async (data: Omit<ReferenceRange, 'id'>): Promise<ReferenceRange> => {
        const response = await api.post('/api/reference-ranges', data);
        return response.data?.data || response.data;
    },

    // ============ DOCTOR TEST ASSIGNMENTS ============

    /**
     * Get all doctor-test assignments
     */
    getDoctorTestAssignments: async (params?: { doctorId?: number; testId?: number }): Promise<DoctorTestAssignment[]> => {
        const response = await api.get('/api/doctor-tests', { params });
        return response.data?.data || response.data || [];
    },

    /**
     * Assign a test to a doctor
     */
    assignTestToDoctor: async (doctorId: number, testId: number): Promise<DoctorTestAssignment> => {
        const response = await api.post('/api/doctor-tests', { doctorId, testId });
        return response.data?.data || response.data;
    },

    /**
     * Remove test assignment from doctor
     */
    removeTestAssignment: async (assignmentId: number): Promise<void> => {
        await api.delete(`/api/doctor-tests/${assignmentId}`);
    },

    /**
     * Get tests assigned to a specific doctor
     */
    getDocorAssignedTests: async (doctorId: number): Promise<{ testId: number; testName: string }[]> => {
        const response = await api.get(`/api/doctors/${doctorId}/tests`);
        return response.data?.data || response.data || [];
    },

    /**
     * Get doctors assigned to a specific test
     */
    getTestAssignedDoctors: async (testId: number): Promise<{ doctorId: number; doctorName: string }[]> => {
        const response = await api.get(`/api/tests/${testId}/doctors`);
        return response.data?.data || response.data || [];
    }
};
