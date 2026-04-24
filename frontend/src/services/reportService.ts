import api from './api';

export interface ReportDisplay {
    bookingId: number;
    testName: string;
    bookingDate: string;
    reportDate: string;
    status: string;
    downloadUrl: string;
    verifiedByName: string | null;
    hasReport?: boolean;
    report?: {
        id: number;
        results?: Array<{ isAbnormal?: boolean; isCritical?: boolean }>;
    } | null;
}

export interface AIAnalysisFlag {
    testName: string;
    value: string;
    severity: 'NORMAL' | 'MILD' | 'MODERATE' | 'CRITICAL' | string;
    clinicalNote: string;
}

export interface AIAnalysisRecommendation {
    category: 'DIET' | 'LIFESTYLE' | 'FOLLOWUP' | 'CONSULT' | string;
    text: string;
}

export interface AIAnalysis {
    bookingId: number;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | string;
    healthScore: number;
    summary: string;
    flags: AIAnalysisFlag[];
    patterns: string[];
    recommendations: AIAnalysisRecommendation[];
    disclaimer: string;
    generatedAt: string | null;
}

const unwrap = <T>(response: any): T => {
    if (response?.data?.data !== undefined) return response.data.data as T;
    if (response?.data !== undefined) return response.data as T;
    return response as T;
};

const mapApiReportToDisplay = (item: any): ReportDisplay => {
    return {
        bookingId: item?.bookingId ?? 0,
        testName: item?.testName ?? 'Lab Report',
        bookingDate: item?.bookingDate ?? '',
        reportDate: item?.reportDate ?? '',
        status: (item?.status ?? 'PENDING_VERIFICATION').toUpperCase(),
        downloadUrl: item?.downloadUrl ?? `/api/reports/${item?.bookingId}/download`,
        verifiedByName: item?.verifiedByName ?? null,
        hasReport: item?.status === 'VERIFIED' || item?.status === 'COMPLETED',
        report: null
    };
};

const mapAiAnalysis = (item: any): AIAnalysis => ({
    bookingId: item?.bookingId ?? 0,
    status: item?.status ?? 'PENDING',
    healthScore: item?.healthScore ?? 0,
    summary: item?.summary ?? '',
    flags: Array.isArray(item?.flags) ? item.flags : [],
    patterns: Array.isArray(item?.patterns) ? item.patterns : [],
    recommendations: Array.isArray(item?.recommendations) ? item.recommendations : [],
    disclaimer: item?.disclaimer ?? 'AI-generated insights are for informational purposes only and do not replace medical advice.',
    generatedAt: item?.generatedAt ?? null
});

export const reportService = {
    getMyReports: async (): Promise<ReportDisplay[]> => {
        const response = await api.get('/api/reports/my');
        const list = unwrap<any[]>(response) || [];
        return Array.isArray(list) ? list.map(mapApiReportToDisplay) : [];
    },

    getAIAnalysis: async (bookingId: number): Promise<AIAnalysis | null> => {
        try {
            const response = await api.get(`/api/reports/${bookingId}/ai-analysis`);
            return mapAiAnalysis(unwrap<any>(response));
        } catch (error: any) {
            const status = error?.response?.status;
            if (status === 404) {
                await api.post(`/api/reports/${bookingId}/regenerate-analysis`);
                throw new Error('AI_PENDING');
            }
            throw error;
        }
    },

    downloadReport: async (bookingId: number): Promise<void> => {
        const response = await api.get(`/api/reports/${bookingId}/download`, {
            responseType: 'arraybuffer',
            headers: {
                Accept: 'application/pdf'
            }
        });
        const contentType = response.headers['content-type'] || 'application/pdf';
        const buffer = response.data as ArrayBuffer;
        const blob = new Blob([buffer], { type: contentType });
        if (blob.size === 0) {
            throw new Error(`Empty PDF response for booking ${bookingId}`);
        }
        const url = URL.createObjectURL(blob);
        const contentDisposition = response.headers['content-disposition'] as string | undefined;
        const match = contentDisposition?.match(/filename="?([^"]+)"?/i);
        const filename = match?.[1] || `report-booking-${bookingId}.pdf`;

        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
    },

    // Legacy methods retained for existing consumers
    verifyReport: async (reportId: number): Promise<void> => {
        await api.post(`/api/reports/verify/${reportId}`);
    },

    getReportResults: async (bookingId: number): Promise<any> => {
        const response = await api.get(`/api/reports/booking/${bookingId}`);
        return unwrap<any>(response);
    },

    shareUserReport: async (reportId: number, email: string, accessType: 'view' | 'download' = 'view'): Promise<void> => {
        await api.post(`/api/users/reports/${reportId}/share`, { email, accessType });
    },
    
    getTrends: async (): Promise<any[]> => {
        const response = await api.get('/api/users/reports/trends');
        return unwrap<any[]>(response) || [];
    }
};
