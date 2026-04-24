import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaExclamationTriangle, FaFileAlt, FaLightbulb } from 'react-icons/fa';
import { smartReportService, type SmartAnalysis, type ParameterTrend, type CriticalValue } from '../../services/smartReportService';
import { reportService } from '../../services/reportService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SmartReportViewer from '../../components/reports/SmartReportViewer';
import ParameterTrends from '../../components/reports/ParameterTrends';
import api from '../../services/api';
import { notify } from '../../utils/toast';

interface ReportSummary {
  id: number;
  bookingReference: string;
  testName: string;
  reportDate: string;
}

const parseRange = (rangeText: string) => {
  if (!rangeText) return null;
  const parts = rangeText.match(/(\d+(\.\d+)?)/g);
  if (parts && parts.length >= 2) {
    return { min: parseFloat(parts[0]), max: parseFloat(parts[1]) };
  }
  return null;
};

const RangeBar: React.FC<{ value: string; range: string; isAbnormal: boolean }> = ({ value, range, isAbnormal }) => {
  const resultVal = parseFloat(value);
  const bounds = parseRange(range);

  if (isNaN(resultVal) || !bounds) {
    return <div className="h-1.5 w-full bg-gray-100 rounded-full opacity-30"></div>;
  }

  const { min, max } = bounds;
  const rangeSpan = max - min;
  // Calculate position: 0% is min, 100% is max. We add padding for better visualization.
  const padding = rangeSpan * 0.5;
  const visualMin = min - padding;
  const visualMax = max + padding;
  const visualSpan = visualMax - visualMin;

  const percentage = ((resultVal - visualMin) / visualSpan) * 100;
  const normalStart = ((min - visualMin) / visualSpan) * 100;
  const normalWidth = ((max - min) / visualSpan) * 100;

  return (
    <div className="relative w-full h-8 flex items-center">
      {/* Background Track */}
      <div className="absolute w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        {/* Normal Range Highlight */}
        <div
          className="absolute h-full bg-emerald-500/20 dark:bg-emerald-500/10 border-x border-emerald-500/20"
          style={{ left: `${normalStart}%`, width: `${normalWidth}%` }}
        />
      </div>

      {/* Min/Max Labels */}
      <div className="absolute -bottom-1 left-0 right-0 flex justify-between px-0.5">
        <span className="text-[8px] font-black text-gray-400">{min}</span>
        <span className="text-[8px] font-black text-gray-400">{max}</span>
      </div>

      {/* Result Value Pointer */}
      <div
        className="absolute transition-all duration-1000 ease-out"
        style={{ left: `${Math.min(Math.max(percentage, 0), 100)}%`, transform: 'translateX(-50%)' }}
      >
        <div className={`w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 shadow-sm ${isAbnormal ? 'bg-rose-500 scale-125' : 'bg-[#0D7C7C]'}`} />
        <div className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black ${isAbnormal ? 'text-rose-600' : 'text-[#0D7C7C]'}`}>
          {value}
        </div>
      </div>
    </div>
  );
};

const SmartReportsPage: React.FC = () => {

  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId?: string }>();

  // Data States
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [smartAnalysis, setSmartAnalysis] = useState<SmartAnalysis | null>(null);
  const [trends, setTrends] = useState<ParameterTrend[]>([]);
  const [rawResults, setRawResults] = useState<any | null>(null);

  // UI States
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isRequestingAi, setIsRequestingAi] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Load reports on mount
  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (selectedReportId) {
      loadAnalysis(selectedReportId);
    }
  }, [selectedReportId]);

  // Handle direct selection from URL
  useEffect(() => {
    if (bookingId && reports.length > 0) {
      const bId = Number(bookingId);
      if (!isNaN(bId)) {
        setSelectedReportId(bId);
      }
    }
  }, [bookingId, reports]);

  // Handle auto-redirect if no ID specified
  useEffect(() => {
    if (!bookingId && !isLoadingReports && reports.length > 0) {
      // If we landed here without an ID, just go back to the main reports page
      navigate('/reports');
    }
  }, [bookingId, isLoadingReports, reports, navigate]);

  const fetchReports = async () => {
    try {
      setIsLoadingReports(true);
      setError(null);
      const data = await reportService.getMyReports();
      // Only keep reports that are VERIFIED or COMPLETED
      const readyReports = data
        .filter(r => r.status === 'VERIFIED' || r.status === 'COMPLETED')
        .map(r => ({
          id: r.bookingId,
          bookingReference: `BK-${r.bookingId}`,
          testName: r.testName,
          reportDate: r.reportDate
        }));
      setReports(readyReports);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
      notify.error('Failed to load reports');
    } finally {
      setIsLoadingReports(false);
    }
  };

  const loadAnalysis = async (reportId: number) => {
    try {
      setIsLoadingAnalysis(true);
      setError(null);

      // Load smart analysis
      const analysis = await smartReportService.getSmartAnalysis(reportId);
      setSmartAnalysis(analysis);
      if (analysis.aiStatus === 'FAILED') {
        setError(analysis.analysisError || 'AI analysis failed to generate. Please try again.');
      }

      // Load raw results
      try {
        const results = await reportService.getReportResults(reportId);
        setRawResults(results);
      } catch (err) {
        console.warn('Failed to load raw results:', err);
      }

      // Load parameter trends
      const paramTrends = await smartReportService.getParameterTrends(reportId, reportId);
      setTrends(paramTrends);
    } catch (err: any) {
      console.error('Error loading analysis:', err);
      const errorMsg = err.message || 'Failed to load analysis';
      setError(errorMsg);
      notify.error(errorMsg);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleAnalyzeWithAi = async () => {
    if (!selectedReportId) return;

    try {
      setIsRequestingAi(true);
      setError(null);
      await smartReportService.requestSmartAnalysis(selectedReportId);

      let latest: SmartAnalysis | null = null;
      for (let attempt = 0; attempt < 6; attempt++) {
        latest = await smartReportService.getSmartAnalysis(selectedReportId);
        setSmartAnalysis(latest);
        if (latest.aiStatus !== 'PENDING') {
          break;
        }
        await sleep(1200);
      }

      await loadAnalysis(selectedReportId);

      if (latest?.aiStatus === 'FAILED') {
        const message = latest.analysisError || 'AI analysis failed to generate. Please try again.';
        setError(message);
        notify.error(message);
      } else if (latest?.aiStatus === 'PENDING') {
        notify.info('AI analysis is still running. Please check again in a moment.');
      } else {
        notify.success('AI analysis generated successfully');
      }
    } catch (err: unknown) {
      console.error('Error requesting AI analysis:', err);
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Failed to trigger AI analysis';
      setError(message);
      notify.error(message);
    } finally {
      setIsRequestingAi(false);
    }
  };

  // If loading initial reports
  if (isLoadingReports) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!selectedReportId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Pattern from Screenshot */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-cyan-50 rounded-full flex items-center justify-center text-[#0D7C7C] shadow-sm border border-cyan-100">
            <FaFileAlt className="text-xl" />
          </div>
          <div className="text-[10px] font-black text-[#0D7C7C]/60 uppercase tracking-[0.2em]">
            Reports / AI Insights
          </div>
        </div>

        <h1 className="text-5xl font-black text-[#164E63] uppercase tracking-tight mb-3">
          Smart Analysis
        </h1>
        <p className="text-gray-500 text-lg font-medium max-w-2xl leading-relaxed">
          View your deep clinical intelligence, laboratory biomarker mapping, and long-term health trends.
        </p>
        <div className="mt-5">
          <button
            onClick={handleAnalyzeWithAi}
            disabled={isRequestingAi || isLoadingAnalysis}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0D7C7C] to-[#004B87] text-white text-sm font-black uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
            {isRequestingAi ? 'Analyzing...' : 'Analyze Report with AI'}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-600">{error}</p>
        </div>
      )}
      {!error && smartAnalysis?.aiStatus === 'PENDING' && (
        <div className="mb-8 p-4 bg-cyan-50 border-l-4 border-cyan-500 text-cyan-800 rounded">
          <p className="font-600">AI analysis is in progress. You can refresh in a few seconds.</p>
        </div>
      )}

      {/* Loading or Content State */}
      {isLoadingAnalysis ? (
        <div className="text-center py-24">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Analyzing Laboratory Data...</p>
        </div>
      ) : !smartAnalysis ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">Analysis unavailable for this report.</p>
          <button
            onClick={() => selectedReportId && loadAnalysis(selectedReportId)}
            className="mt-6 px-5 py-2.5 bg-[#0D7C7C] text-white rounded-lg text-sm font-bold hover:bg-[#0B6666] transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Integrated Vertical View */}
          <div className="space-y-12 pb-8">
            {/* Section 1: AI CORE ANALYSIS (The "Page" Style Section) */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 shadow-2xl">
              <div className="bg-[#164E63] p-8 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">✨</div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest uppercase border border-white/20">
                    Clinical Intelligence Center
                  </span>
                  <div className="h-px w-12 bg-white/20"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">AI CORE V3.1.0</span>
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tight mb-2">Diagnostic Narrative</h2>
                <p className="text-cyan-100/70 font-medium max-w-xl">Deep physiological correlation and systemic health interpretation powered by advanced clinical logic.</p>
              </div>

              <div className="p-8 space-y-8">
                <SmartReportViewer analysis={smartAnalysis} />

                {/* Deep Optimization Trigger */}
                <div className="mt-8">
                  <button
                    onClick={() => {
                      setIsOptimizing(true);
                      setTimeout(() => {
                        navigate(`/health-plan/${selectedReportId}`);
                        setIsOptimizing(false);
                      }, 2500);
                    }}
                    className="w-full relative group overflow-hidden bg-gradient-to-r from-[#0D7C7C] to-[#004B87] p-5 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl animate-pulse">
                          <FaLightbulb />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Prescriptive Analysis Available</p>
                          <h4 className="text-xl font-black uppercase italic tracking-tighter">Generate Deep AI Optimization Plan</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black uppercase tracking-widest opacity-60">Consulting AI Engine</span>
                        <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                      </div>
                    </div>
                  </button>
                  <p className="mt-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    AI will analyze {rawResults?.results?.length || 0} biomarkers to build your diet & exercise roadmap
                  </p>
                </div>

                {/* Additional "Page" Section: Systematic Correlation */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                      <FaLightbulb />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Systemic Health Roadmap</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { title: 'Immediate Focus', icon: '🎯', desc: 'Prioritize stabilization of key inflammatory markers identified in this screening.' },
                      { title: 'Monitoring Path', icon: '📊', desc: 'Secondary follow-up recommended in 90 days to verify metabolic adaptation.' },
                      { title: 'Optimal State', icon: '⛰️', desc: 'Projected achievement of optimal vitality index within 6 months of adherence.' }
                    ].map((step, idx) => (
                      <div key={idx} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-colors">
                        <div className="text-2xl mb-3">{step.icon}</div>
                        <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-2">{step.title}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Laboratory Markers */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-2xl shadow-sm">📋</div>
                  <div>
                    <h3 className="text-2xl font-black text-[#164E63] dark:text-white tracking-tighter uppercase">Laboratory Markers</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Direct Biomarker Analysis & Reference Mapping</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Normal range
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-600 uppercase tracking-wider bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-full border border-rose-100 dark:border-rose-800">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Abnormal
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {rawResults?.results?.map((res: any, idx: number) => (
                  <div
                    key={idx}
                    className={`group bg-white dark:bg-gray-800 rounded-2xl border-l-4 p-6 shadow-xl shadow-cyan-900/5 hover:shadow-cyan-900/10 transition-all duration-300 transform hover:-translate-y-0.5 ${res.isAbnormal
                      ? (res.isCritical ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-amber-500 ring-1 ring-amber-500/20')
                      : 'border-[#0D7C7C] border-opacity-40 ring-1 ring-black/[0.02]'
                      }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                      {/* Parameter Identity */}
                      <div className="lg:w-1/4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Parameter</p>
                        <h4 className="text-base font-black text-gray-900 dark:text-white uppercase leading-tight group-hover:text-[#0D7C7C] transition-colors">{res.parameterName}</h4>
                      </div>

                      {/* Result Value */}
                      <div className="lg:w-1/5 flex items-baseline gap-2">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 text-center lg:text-left text-nowrap">Testing Result</p>
                          <div className="flex items-baseline gap-1.5">
                            <span className={`text-3xl font-black italic tracking-tighter ${res.isAbnormal ? (res.isCritical ? 'text-rose-600' : 'text-amber-600') : 'text-[#0D7C7C]'}`}>
                              {res.resultValue}
                            </span>
                            <span className="text-xs font-bold text-gray-400 uppercase">{res.unit}</span>
                          </div>
                        </div>
                      </div>

                      {/* Visual Mapping */}
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Reference Mapping</p>
                        <div className="pt-2">
                          <RangeBar value={res.resultValue} range={res.normalRange} isAbnormal={res.isAbnormal} />
                        </div>
                        <div className="flex justify-center mt-3">
                          <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest italic">Normal Range: {res.normalRange} {res.unit}</span>
                        </div>
                      </div>

                      {/* Status Action */}
                      <div className="lg:w-48 flex justify-end">
                        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase border-2 shadow-sm ${res.isAbnormal
                          ? (res.isCritical ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-amber-50 border-amber-200 text-amber-600')
                          : 'bg-emerald-50 border-emerald-100 text-emerald-600 font-bold'
                          }`}>
                          {res.isAbnormal ? (res.isCritical ? 'Critical Block' : 'Monitor Value') : 'Optimal State'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!rawResults?.results?.length && (
                <div className="p-24 bg-white/40 backdrop-blur-md rounded-3xl border border-dashed border-gray-200 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl text-gray-300">🧬</div>
                  <div>
                    <h4 className="font-black text-gray-900 uppercase text-sm tracking-widest">No Markers Available</h4>
                    <p className="text-xs text-gray-400 mt-1 font-bold">This test does not contain individual parameter findings.</p>
                  </div>
                </div>
              )}
            </section>

            {/* Section 3: History & Trends */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-2xl shadow-sm">📈</div>
                <div>
                  <h3 className="text-2xl font-black text-[#164E63] dark:text-white tracking-tighter uppercase">History & Trends</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Longitudinal Progress & Metric Analysis</p>
                </div>
              </div>
              {trends.length > 0 ? (
                <ParameterTrends trends={trends} />
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-20 text-center border border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No historical trends available for these parameters</p>
                </div>
              )}
            </section>
          </div>

          <div className="mt-12">
            {/* Header copy moved above tabs, so we just show content here */}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-8 border-t border-gray-200">
            <button
              onClick={() => navigate('/reports')}
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-[#0D7C7C] to-[#004B87] text-white font-600 rounded-lg hover:shadow-lg transition-all"
            >
              Download Full Report
            </button>
            <button
              onClick={async () => {
                try {
                  const resp = await api.post(`/api/reports/${selectedReportId}/share`);
                  const link = `${window.location.origin}/public/view-report/${resp.data.data}`;
                  await navigator.clipboard.writeText(link);
                  notify.success('Sharing link copied to clipboard! (Expires in 7 days)');
                } catch (err) {
                  notify.error('Failed to generate sharing link');
                }
              }}
              className="flex-1 px-6 py-2.5 bg-gray-100 text-gray-700 font-600 rounded-lg hover:bg-gray-200 transition-all"
            >
              Share Report
            </button>
            <button
              onClick={async () => {
                try {
                  await api.delete(`/api/reports/share/${selectedReportId}/revoke`);
                  notify.success('Sharing access revoked successfully');
                } catch (err) {
                  notify.error('Failed to revoke sharing link');
                }
              }}
              className="flex-1 px-6 py-2.5 bg-red-50 text-red-600 font-600 rounded-lg hover:bg-red-100 transition-all border border-red-200"
            >
              Revoke Access
            </button>
          </div>
        </>
      )}

      {/* Global Optimization Overlay */}
      {isOptimizing && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-xl">
          <div className="w-32 h-32 mb-8 relative">
            <div className="absolute inset-0 border-4 border-[#0D7C7C]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#0D7C7C] border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-4xl text-[#0D7C7C] animate-pulse">
              ✨
            </div>
          </div>
          <h2 className="text-3xl font-black text-[#164E63] uppercase tracking-tight mb-2">Analyzing Clinical Context</h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Constructing Your Biological Health Roadmap...</p>

          <div className="mt-12 flex gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-[#0D7C7C]" style={{ animation: `bounce 1s infinite ${i * 0.2}s` }} />
            ))}
          </div>

          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          `}} />
        </div>
      )}
    </div>
  );
};

export default SmartReportsPage;
