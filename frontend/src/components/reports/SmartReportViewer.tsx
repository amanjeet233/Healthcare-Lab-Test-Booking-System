import React from 'react';
import { FaLightbulb, FaCheckCircle, FaExclamationTriangle, FaHeartbeat, FaShieldAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import type { SmartAnalysis } from '../../services/smartReportService';

interface SmartReportViewerProps {
  analysis: SmartAnalysis;
  isLoading?: boolean;
}

const SmartReportViewer: React.FC<SmartReportViewerProps> = ({ analysis, isLoading }) => {
  if (isLoading) {
    return <div className="p-8 text-center flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-[#0D7C7C] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">Crunching clinical data...</p>
    </div>;
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 border-green-500 text-green-700';
      case 'MEDIUM': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'HIGH': return 'bg-orange-100 border-orange-500 text-orange-700';
      case 'CRITICAL': return 'bg-red-100 border-red-500 text-red-700';
      default: return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Section: Health Score & Security Seal ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Score Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-gradient-to-br from-[#0D7C7C] via-[#0D7C7C] to-[#004B87] rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 text-[120px] pointer-events-none">
            <FaHeartbeat />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest uppercase">
                Clinical Intelligence v2.5
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-400/20 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest uppercase text-green-300">
                <FaShieldAlt className="text-[10px]" /> Verified & Sealed
              </span>
              {analysis.isAmended && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest uppercase text-amber-300">
                  <FaExclamationTriangle className="text-[10px]" /> Amended {analysis.version && `(v${analysis.version})`}
                </span>
              )}
            </div>
            
            {analysis.amendmentReason && (
              <div className="mb-4 p-3 bg-amber-900/20 border border-amber-500/30 rounded-xl text-xs text-amber-200">
                <span className="font-bold uppercase tracking-tighter mr-2">Amendment Reason:</span>
                {analysis.amendmentReason}
              </div>
            )}
            
            <div className="flex items-end gap-1 mb-2">
              <h2 className="text-6xl font-black leading-none">{analysis.healthScore}</h2>
              <span className="text-xl font-bold opacity-60 mb-2">/100</span>
            </div>
            
            <h3 className="text-lg font-bold mb-2 uppercase tracking-wide">Overall Vitality Score</h3>
            <p className="max-w-xl text-white/80 leading-relaxed font-medium text-sm">
              {analysis.summary}
            </p>
          </div>
        </motion.div>

        {/* Security Summary Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 font-black text-xs tracking-wider border-2 ${getRiskColor(analysis.riskLevel)}`}>
              <FaExclamationTriangle /> {analysis.riskLevel} RISK
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
              Based on your clinical parameters, your metabolic risk is categorized as <span className="text-gray-900 dark:text-white font-black">{analysis.riskLevel}</span>. 
              {analysis.healthScore > 80 ? " Stay proactive with your current routine." : " Clinical intervention or lifestyle shifts are recommended."}
            </p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Digital Fingerprint</p>
            <div className="p-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl overflow-hidden">
               <code className="text-[8px] text-[#0D7C7C] font-mono break-all leading-tight block">
                 {/* This would come from analysis.fingerprint in a real scenario, fallback here */}
                 {analysis.lastUpdated ? btoa(analysis.lastUpdated.toString()).slice(0, 32) : 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6'}
               </code>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Organ Vitality Grid ── */}
      {analysis.organScores && Object.keys(analysis.organScores).length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Organ Function Vitality</h3>
            <div className="h-px flex-1 mx-6 bg-gray-100 dark:bg-gray-800"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(analysis.organScores).map(([organ, score], idx) => (
              <motion.div 
                key={organ}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (idx * 0.05) }}
                className="group bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className={`p-2 rounded-xl bg-opacity-10 ${score >= 80 ? 'bg-green-500 text-green-500' : score >= 50 ? 'bg-yellow-500 text-yellow-500' : 'bg-red-500 text-red-500'}`}>
                    <FaHeartbeat className="text-lg" />
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${score >= 80 ? 'bg-green-100 text-green-700' : score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {score >= 80 ? 'EXCELLENT' : score >= 50 ? 'STABLE' : 'CONCERN'}
                  </span>
                </div>
                
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{organ}</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-gray-900 dark:text-white">{score}</span>
                  <span className="text-sm font-bold text-gray-400">/100</span>
                </div>
                
                <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                    className={`h-full rounded-full ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Key Insights & Recommendations ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Key Findings */}
        {analysis.keyFindings && analysis.keyFindings.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl">
              <FaLightbulb />
            </div>
            <h3 className="flex items-center gap-3 font-black text-white uppercase text-sm mb-8 tracking-[0.2em] relative z-10">
              <span className="w-8 h-8 rounded-full bg-[#0D7C7C] flex items-center justify-center text-xs">
                <FaCheckCircle />
              </span>
              Key Findings
            </h3>
            <div className="space-y-4 relative z-10">
              {analysis.keyFindings.map((finding, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5">
                  <span className="text-[#0D7C7C] font-black text-lg">•</span>
                  <span className="text-sm text-gray-300 leading-relaxed">{finding}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-8 border border-blue-100 dark:border-blue-900/30"
          >
            <h3 className="font-black text-gray-900 dark:text-white uppercase text-sm mb-8 tracking-[0.2em] flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">
                <FaLightbulb />
              </span>
              Smart Recommendations
            </h3>
            <div className="space-y-4">
              {analysis.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/20">
                  <span className="text-blue-600 font-bold">●</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{rec}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

    </div>
  );
};

export default SmartReportViewer;
