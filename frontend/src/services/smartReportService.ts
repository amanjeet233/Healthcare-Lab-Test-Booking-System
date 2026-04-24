import api from './api';

export interface SmartAnalysis {
  aiStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  analysisError?: string;
  healthScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  keyFindings: string[];
  recommendations: string[];
  summary: string;
  lastUpdated: string;
  organScores?: Record<string, number>;
  hasCriticalResults?: boolean;
  version?: number;
  isAmended?: boolean;
  amendmentReason?: string;
}

export interface ParameterTrend {
  parameterName: string;
  values: number[];
  dates: string[];
  referenceMin?: number;
  referenceMax?: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface CriticalValue {
  parameterName: string;
  value: number;
  referenceRange: string;
  severity: 'WARNING' | 'CRITICAL';
  recommendation: string;
}

interface BackendAiFlag {
  testName?: string;
  value?: string;
  severity?: string;
  clinicalNote?: string;
}

interface BackendAiRecommendation {
  category?: string;
  text?: string;
}

interface BackendAiAnalysis {
  status?: 'PENDING' | 'COMPLETED' | 'FAILED';
  healthScore?: number;
  summary?: string;
  flags?: BackendAiFlag[];
  recommendations?: BackendAiRecommendation[];
  organScores?: Record<string, number>;
  hasCriticalResults?: boolean;
  generatedAt?: string;
  errorMessage?: string;
}

interface BackendTrendPoint {
  date?: string;
  value?: number | string;
}

interface BackendTrend {
  parameter?: string;
  data?: BackendTrendPoint[];
}

interface BackendReportResult {
  parameterName?: string;
  resultValue?: string | number;
  normalRange?: string;
  isAbnormal?: boolean;
  isCritical?: boolean;
}

interface BackendReportResponse {
  results?: BackendReportResult[];
}

const normalizeAiErrorMessage = (message?: string): string | undefined => {
  if (!message) return undefined;
  const normalized = message.toLowerCase();
  if (
    normalized.includes('<eol>') ||
    normalized.includes('"error"') ||
    normalized.includes('service unavailable') ||
    normalized.includes('status: 503') ||
    normalized.includes('status 503') ||
    normalized.includes('too many requests') ||
    normalized.includes('status: 429') ||
    normalized.includes('status 429')
  ) {
    return 'AI service is currently busy. Please try again in a minute.';
  }
  return message;
};

const toRiskLevel = (score: number, hasCriticalResults?: boolean): SmartAnalysis['riskLevel'] => {
  if (hasCriticalResults) return 'CRITICAL';
  if (score >= 75) return 'LOW';
  if (score >= 60) return 'MEDIUM';
  if (score >= 40) return 'HIGH';
  return 'CRITICAL';
};

const toSmartAnalysis = (data: BackendAiAnalysis): SmartAnalysis => {
  const safeErrorMessage = normalizeAiErrorMessage(data.errorMessage);

  if (data.status === 'PENDING') {
    return {
      aiStatus: 'PENDING',
      healthScore: 0,
      riskLevel: 'MEDIUM',
      keyFindings: [],
      recommendations: ['Your AI analysis is being generated. Please wait a moment and refresh.'],
      summary: data.summary || 'AI analysis is in progress.',
      lastUpdated: data.generatedAt || new Date().toISOString(),
      organScores: data.organScores || {},
      hasCriticalResults: Boolean(data.hasCriticalResults),
      analysisError: safeErrorMessage
    };
  }

  if (data.status === 'FAILED') {
    return {
      aiStatus: 'FAILED',
      analysisError: safeErrorMessage || 'AI analysis failed to generate. Please try again.',
      healthScore: 0,
      riskLevel: 'MEDIUM',
      keyFindings: [],
      recommendations: ['AI analysis failed due to temporary provider issues. Please retry shortly.'],
      summary: safeErrorMessage || 'AI analysis failed to generate. Please try again.',
      lastUpdated: data.generatedAt || new Date().toISOString(),
      organScores: data.organScores || {},
      hasCriticalResults: Boolean(data.hasCriticalResults)
    };
  }

  const healthScore = typeof data.healthScore === 'number' ? data.healthScore : 0;
  const flags = Array.isArray(data.flags) ? data.flags : [];
  const recommendations = Array.isArray(data.recommendations) ? data.recommendations : [];

  return {
    aiStatus: 'COMPLETED',
    healthScore,
    riskLevel: toRiskLevel(healthScore, data.hasCriticalResults),
    keyFindings: flags.map((flag) => {
      const title = flag.testName?.trim() || 'Finding';
      const detail = flag.clinicalNote?.trim() || flag.value?.trim() || 'Out-of-range marker detected';
      return `${title}: ${detail}`;
    }),
    recommendations: recommendations
      .map((item) => item.text?.trim())
      .filter((text): text is string => Boolean(text)),
    summary: data.summary || 'AI analysis is being generated for this report.',
    lastUpdated: data.generatedAt || new Date().toISOString(),
    organScores: data.organScores || {},
    hasCriticalResults: Boolean(data.hasCriticalResults),
    analysisError: safeErrorMessage
  };
};

const toTrendDirection = (values: number[]): ParameterTrend['trend'] => {
  if (values.length < 2) return 'STABLE';
  const first = values[0];
  const last = values[values.length - 1];
  if (Math.abs(last - first) < 0.001) return 'STABLE';
  return last > first ? 'UP' : 'DOWN';
};

const toParameterTrend = (trend: BackendTrend): ParameterTrend | null => {
  const points = Array.isArray(trend.data) ? trend.data : [];
  const normalized = points
    .map((point) => ({
      date: point.date || '',
      value: typeof point.value === 'number' ? point.value : Number(point.value)
    }))
    .filter((point) => point.date && Number.isFinite(point.value));

  if (normalized.length === 0) return null;

  const dates = normalized.map((point) => point.date);
  const values = normalized.map((point) => point.value);

  return {
    parameterName: trend.parameter || 'Unknown Parameter',
    dates,
    values,
    trend: toTrendDirection(values)
  };
};

const fallbackAnalysisFromResults = (results: BackendReportResult[]): SmartAnalysis => {
  const criticalCount = results.filter((item) => item.isCritical).length;
  const abnormalCount = results.filter((item) => item.isAbnormal).length;

  const penalty = criticalCount * 25 + Math.max(0, abnormalCount - criticalCount) * 8;
  const healthScore = Math.max(0, 100 - penalty);

  return {
    aiStatus: 'COMPLETED',
    healthScore,
    riskLevel: toRiskLevel(healthScore, criticalCount > 0),
    keyFindings: results
      .filter((item) => item.isAbnormal || item.isCritical)
      .slice(0, 6)
      .map((item) => `${item.parameterName || 'Parameter'} is outside the normal range`),
    recommendations: criticalCount > 0
      ? [
          'One or more critical markers were detected. Consult your doctor immediately.',
          'Repeat testing and clinical evaluation are recommended as soon as possible.'
        ]
      : abnormalCount > 0
        ? [
            'Some values are outside the reference range. Discuss these with your doctor.',
            'Follow-up testing is recommended to confirm trends.'
          ]
        : ['All captured values appear within expected ranges. Maintain routine monitoring.'],
    summary: criticalCount > 0
      ? 'Preliminary analysis indicates critical lab markers requiring urgent clinical review.'
      : abnormalCount > 0
        ? 'Preliminary analysis indicates abnormal markers. A doctor review is advised.'
        : 'Preliminary analysis indicates stable lab values based on available report results.',
    lastUpdated: new Date().toISOString(),
    organScores: {},
    hasCriticalResults: criticalCount > 0
  };
};

export const smartReportService = {
  /**
   * Get AI-powered smart analysis for a report
   */
  async getSmartAnalysis(bookingId: number): Promise<SmartAnalysis> {
    try {
      const response = await api.get(`/api/reports/${bookingId}/ai-analysis`);
      const data = response.data?.data || {};

      if (data.status === 'FAILED') {
        // AI specifically failed. We show fallback data but keep status FAILED to allow retry
        const reportResponse = await api.get(`/api/reports/booking/${bookingId}`);
        const reportData: BackendReportResponse = reportResponse.data?.data || {};
        const reportResults = Array.isArray(reportData.results) ? reportData.results : [];
        const fallback = fallbackAnalysisFromResults(reportResults);
        
        return {
          ...fallback,
          aiStatus: 'FAILED',
          analysisError: normalizeAiErrorMessage(data.errorMessage) || 'AI analysis failed to generate. Please try again.'
        };
      }

      return toSmartAnalysis(data);
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      
      try {
        // Fetch report data for fallback in any error case
        const reportResponse = await api.get(`/api/reports/booking/${bookingId}`);
        const reportData: BackendReportResponse = reportResponse.data?.data || {};
        const reportResults = Array.isArray(reportData.results) ? reportData.results : [];
        const fallback = fallbackAnalysisFromResults(reportResults);

        if (status === 404) {
          // Simply return fallback if not found (default behavior)
          return fallback;
        }

        // For network errors / 500s from our own backend
        return {
          ...fallback,
          aiStatus: 'FAILED',
          analysisError: 'AI service is currently busy. Please try again in a minute.'
        };
      } catch (fallbackError) {
        // If even the fallback fails, throw the original error
        throw error;
      }
    }
  },

  async requestSmartAnalysis(bookingId: number): Promise<void> {
    await api.post(`/api/reports/${bookingId}/request-analysis`);
  },

  /**
   * Get historical trends for a specific test parameter
   */
  async getParameterTrends(bookingId: number, testId: number): Promise<ParameterTrend[]> {
    void bookingId;
    void testId;
    const response = await api.get('/api/users/reports/trends');
    const rawTrends: BackendTrend[] = Array.isArray(response.data?.data) ? response.data.data : [];
    return rawTrends
      .map(toParameterTrend)
      .filter((trend): trend is ParameterTrend => trend !== null);
  },

  /**
   * Get all critical and abnormal values from a report
   */
  async getCriticalValues(bookingId: number): Promise<CriticalValue[]> {
    const response = await api.get(`/api/reports/booking/${bookingId}`);
    const results: BackendReportResult[] = Array.isArray(response.data?.data?.results) ? response.data.data.results : [];

    return results
      .filter((item) => item.isAbnormal || item.isCritical)
      .map((item) => ({
        parameterName: item?.parameterName || 'Unknown Parameter',
        value: Number(item?.resultValue),
        referenceRange: item?.normalRange || 'N/A',
        severity: item?.isCritical ? 'CRITICAL' : 'WARNING',
        recommendation: item?.isCritical
          ? 'Immediate medical consultation is recommended.'
          : 'Monitor this value and discuss in your next consultation.'
      }))
      .filter((item: CriticalValue) => Number.isFinite(item.value));
  }
};
