import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const HealthOptimizationPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId?: string }>();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="rounded-3xl border border-cyan-100 bg-white p-8 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0D7C7C]/70">
          AI Prescriptive Planning
        </p>
        <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-[#164E63]">
          Health Optimization Plan
        </h1>
        <p className="mt-3 text-gray-600">
          Personalized optimization planning is being prepared for booking{' '}
          <span className="font-bold">{bookingId || 'new'}</span>.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/reports')}
            className="rounded-xl bg-[#0D7C7C] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0B6666]"
          >
            Back to Reports
          </button>
          <button
            onClick={() => navigate(bookingId ? `/smart-reports/${bookingId}` : '/smart-reports')}
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            Back to Smart Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthOptimizationPage;
