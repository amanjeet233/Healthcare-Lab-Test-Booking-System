import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, TrendingUp, ChevronDown, Filter } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { toast } from 'react-hot-toast';

interface TrendData {
  parameter: String;
  data: {
    date: string;
    value: number;
    unit: string;
  }[];
}

const HealthTrendsCard: React.FC = () => {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [selectedParam, setSelectedParam] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    try {
      const data = await reportService.getTrends();
      setTrends(data);
      if (data.length > 0) {
        setSelectedParam(data[0].parameter);
      }
    } catch (error) {
      console.error('Failed to load trends:', error);
      toast.error('Could not load health trends');
    } finally {
      setLoading(false);
    }
  };

  const activeTrend = trends.find(t => t.parameter === selectedParam);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Analyzing your clinical history...</p>
        </div>
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No trend data available yet.</p>
          <p className="text-sm text-slate-400">Complete more tests to see your health journey.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp size={18} />
            </span>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Health Trends</h3>
          </div>
          <p className="text-sm text-slate-500 ml-10">Historical clinical parameter tracking</p>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all duration-300 border border-slate-200/50 group"
          >
            <Filter size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
            <span className="text-sm font-semibold text-slate-700">{selectedParam}</span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowDropdown(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-30 overflow-hidden"
                >
                  <div className="max-h-64 overflow-y-auto py-2">
                    {trends.map(t => (
                      <button
                        key={t.parameter as string}
                        onClick={() => {
                          setSelectedParam(t.parameter as string);
                          setShowDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                          selectedParam === t.parameter 
                            ? 'bg-blue-50 text-blue-600 font-bold' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t.parameter}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="h-[300px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activeTrend?.data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              labelStyle={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#2563eb" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Selected Insight</span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-slate-800">{activeTrend?.data[activeTrend.data.length - 1].value}</span>
          <span className="text-xs font-bold text-slate-400 ml-1 uppercase">{activeTrend?.data[activeTrend.data.length - 1].unit}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default HealthTrendsCard;
