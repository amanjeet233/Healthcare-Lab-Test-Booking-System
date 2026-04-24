import React from 'react';
import { FaArrowUp, FaArrowDown, FaArrowRight } from 'react-icons/fa';
import type { ParameterTrend } from '../../services/smartReportService';

interface ParameterTrendsProps {
  trends: ParameterTrend[];
  isLoading?: boolean;
}

const ParameterTrends: React.FC<ParameterTrendsProps> = ({ trends, isLoading }) => {
  if (isLoading) {
    return <div className="p-8 text-center">Loading trends...</div>;
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No trend data available</p>
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'UP':
        return <FaArrowUp className="text-red-500" />;
      case 'DOWN':
        return <FaArrowDown className="text-green-500" />;
      case 'STABLE':
        return <FaArrowRight className="text-blue-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'UP':
        return 'bg-red-50 border-red-200';
      case 'DOWN':
        return 'bg-green-50 border-green-200';
      case 'STABLE':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-black text-gray-900 uppercase tracking-tight">Parameter Trends</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trends.map((trend, idx) => (
          <div key={idx} className={`border-2 rounded-lg p-6 ${getTrendColor(trend.trend)}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-black text-gray-900 text-sm uppercase tracking-wider">
                {trend.parameterName}
              </h4>
              <div className="flex items-center gap-2">
                {getTrendIcon(trend.trend)}
                <span className="text-xs font-600 uppercase">{trend.trend}</span>
              </div>
            </div>

            {/* Current Value */}
            <div className="mb-4">
              <p className="text-xs text-gray-600 opacity-70">Current Value</p>
              <p className="text-2xl font-black text-gray-900">
                {trend.values[trend.values.length - 1]?.toFixed(2)}
              </p>
            </div>

            {/* Reference Range */}
            {trend.referenceMin && trend.referenceMax && (
              <div className="mb-4 p-3 bg-white/50 rounded border border-current">
                <p className="text-xs text-gray-600 opacity-70">Reference Range</p>
                <p className="text-sm font-600 text-gray-700">
                  {trend.referenceMin} - {trend.referenceMax}
                </p>
              </div>
            )}

            {/* Trend Chart (Simple */}
            <div className="bg-white/50 rounded p-3">
              <p className="text-xs text-gray-600 opacity-70 mb-2">Recent Values</p>
              <div className="flex items-end justify-between h-12 gap-1">
                {trend.values.slice(-5).map((value, i) => {
                  const maxVal = Math.max(...trend.values.slice(-5));
                  const minVal = Math.min(...trend.values.slice(-5));
                  const range = maxVal - minVal || 1;
                  const height = ((value - minVal) / range) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-[#0D7C7C] to-[#4ECDC4] rounded-t opacity-70 hover:opacity-100 transition-opacity"
                      style={{ height: `${Math.max(20, height)}%` }}
                      title={value.toFixed(2)}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">Last 5 readings</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParameterTrends;
