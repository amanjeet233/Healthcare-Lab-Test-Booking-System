import api from './api';

export interface HealthScore {
  score: number;
  category: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  lastUpdated: string;
  summary: string;
}

export interface HealthMetric {
  metricName: string;
  value: number;
  unit: string;
  normalMin?: number;
  normalMax?: number;
  lastMeasured: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface HealthTrend {
  metric: string;
  dates: string[];
  values: number[];
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  weeklyChange: number;
}

export interface HealthRecommendation {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  recommendation: string;
  impact: string;
  actionItems: string[];
}

const unwrap = <T>(response: any): T => {
  if (response?.data?.data !== undefined) return response.data.data as T;
  if (response?.data !== undefined) return response.data as T;
  return response as T;
};

const metricStatus = (risk?: string): 'NORMAL' | 'WARNING' | 'CRITICAL' => {
  if (!risk) return 'NORMAL';
  const normalized = risk.toUpperCase();
  if (normalized === 'HIGH') return 'CRITICAL';
  if (normalized === 'MEDIUM') return 'WARNING';
  return 'NORMAL';
};

export const healthScoreService = {
  async getCurrentScore(): Promise<HealthScore> {
    const response = await api.get('/api/users/health-insights');
    const payload = unwrap<any>(response) || {};
    const latest: any[] = payload.latest || [];
    const score = Math.max(
      0,
      Math.round(
        100 -
          latest.reduce((acc, m) => acc + (String(m?.riskLevel || '').toUpperCase() === 'HIGH' ? 20 : String(m?.riskLevel || '').toUpperCase() === 'MEDIUM' ? 10 : 0), 0)
      )
    );
    const category: HealthScore['category'] =
      score >= 85 ? 'EXCELLENT' : score >= 70 ? 'GOOD' : score >= 50 ? 'FAIR' : 'POOR';
    return {
      score,
      category,
      lastUpdated: new Date().toISOString(),
      summary: `Computed from ${latest.length} latest health metrics.`
    };
  },

  async getScoreTrends(_days: number = 30): Promise<HealthTrend[]> {
    const response = await api.get('/api/users/health-insights');
    const payload = unwrap<any>(response) || {};
    const trendsObj = payload.trends || {};
    return Object.entries<any[]>(trendsObj).map(([metric, points]) => {
      const values = points.map((p) => Number(p.metricValue ?? 0));
      const dates = points.map((p) => p.measuredAt || p.updatedAt || new Date().toISOString());
      const first = values[0] ?? 0;
      const last = values[values.length - 1] ?? 0;
      const weeklyChange = first === 0 ? 0 : ((last - first) / first) * 100;
      return {
        metric,
        dates,
        values,
        trend: weeklyChange < -2 ? 'IMPROVING' : weeklyChange > 2 ? 'DECLINING' : 'STABLE',
        weeklyChange
      };
    });
  },

  async getRecommendations(): Promise<HealthRecommendation[]> {
    const response = await api.get('/api/users/health-metrics');
    const metrics = unwrap<any[]>(response) || [];
    return metrics.slice(0, 6).map((m) => ({
      priority: String(m?.riskLevel || '').toUpperCase() === 'HIGH' ? 'HIGH' : String(m?.riskLevel || '').toUpperCase() === 'MEDIUM' ? 'MEDIUM' : 'LOW',
      category: m.metricName || 'General',
      recommendation: m.interpretation || 'Maintain regular monitoring and follow healthy lifestyle guidance.',
      impact: m.trend || 'stable',
      actionItems: ['Track this metric monthly', 'Consult doctor if symptoms persist']
    }));
  },

  async getHealthMetrics(): Promise<HealthMetric[]> {
    const response = await api.get('/api/users/health-metrics');
    const metrics = unwrap<any[]>(response) || [];
    return metrics.map((m) => ({
      metricName: m.metricName || m.metricCode,
      value: Number(m.metricValue ?? 0),
      unit: m.unit || '',
      lastMeasured: m.measuredAt || m.updatedAt || new Date().toISOString(),
      status: metricStatus(m.riskLevel)
    }));
  },

  async getHealthTrends(days: number = 30): Promise<HealthTrend[]> {
    return this.getScoreTrends(days);
  }
};

