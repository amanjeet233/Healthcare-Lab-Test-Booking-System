import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, ChevronRight, Activity, Star, Zap } from 'lucide-react';
import { TestCard } from '../TestCard';
import { useCart } from '../../hooks/useCart';

/* ─── Data Types ────────────────────────────────────────────────── */
interface WellnessTest {
  id: number;
  name: string;
  subName?: string;
  price: number;
  originalPrice: number;
  discount: string;
  testsIncluded: number;
}

const WELLNESS_TESTS: WellnessTest[] = [
  { id: 901, name: 'HB (Haemoglobin) Test', subName: 'HB (Haemoglobin) Test', price: 219, originalPrice: 548, discount: '60% off', testsIncluded: 1 },
  { id: 902, name: 'TSH Test (Thyroid Stimulating Hormone)', subName: 'TSH Test (Thyroid Stimulating Hormone)', price: 399, originalPrice: 998, discount: '60% off', testsIncluded: 1 },
  { id: 903, name: 'LDH Test (Lactate Dehydrogenase)', subName: 'LDH Test (Lactate Dehydrogenase)', price: 479, originalPrice: 1198, discount: '60% off', testsIncluded: 1 },
  { id: 904, name: 'HbA1c Test (Hemoglobin A1c)', subName: 'HbA1c Test (Hemoglobin A1c)', price: 659, originalPrice: 1647, discount: '60% off', testsIncluded: 3 },
  { id: 905, name: 'Blood Group Test', subName: 'Blood Group Test', price: 259, originalPrice: 647, discount: '60% off', testsIncluded: 9 },
  { id: 906, name: 'Beta HCG Test', subName: 'Beta HCG Test', price: 1129, originalPrice: 2823, discount: '60% off', testsIncluded: 1 },
];

/* ─── Special Package Card (Premium Redesign) ───────────────────── */
const PremiumWellnessPackage: React.FC = () => {
  const navigate = useNavigate();
  const pkgId = 910;
  const pkgName = 'MedSync Hairfall Check Advance Female';
  const pkgPrice = 6249;
  const pkgOriginal = 15622;

  return (
    <div className="w-full bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row group transition-all duration-500 hover:shadow-2xl hover:shadow-pink-200/30">
      {/* Visual Brand Area */}
      <div 
        className="md:w-[35%] p-8 flex flex-col gap-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #831843 0%, #EC4899 100%)' }}
      >
        <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
        
        <div className="relative z-10 flex items-center gap-2">
           <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border border-white/20">
             PREMIUM PACKAGE
           </div>
        </div>
        
        <div className="relative z-10">
          <h3 className="text-2xl font-black leading-tight uppercase tracking-tight mb-2">{pkgName}</h3>
          <p className="text-sm font-bold opacity-80 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            60 Vital Parameters
          </p>
        </div>

        <div className="mt-auto relative z-10 pt-8 flex items-center gap-4 border-t border-white/10">
           <div className="flex items-center gap-2">
             <Clock className="w-4 h-4 opacity-70" />
             <span className="text-[11px] font-bold uppercase tracking-wide opacity-90">24-48h Reports</span>
           </div>
           <div className="flex items-center gap-2">
             <Zap className="w-4 h-4 opacity-70" />
             <span className="text-[11px] font-bold uppercase tracking-wide opacity-90">Expert Audit</span>
           </div>
        </div>
      </div>

      {/* Details & Action Area */}
      <div className="md:w-[65%] p-8 flex flex-col justify-between bg-white">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6">
          {[
            'GLUCOSE', 'IRON', 'VITAMIN B12', 'FERRITIN', 'DHEAS', 'HBA1C', 
            'INSULIN', 'VITAMIN D', 'TESTOSTERONE', '17-OHP', 'FSH', 'LH'
          ].map(t => (
            <div key={t} className="flex items-center gap-2 group/item">
               <div className="w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0 group-hover/item:scale-125 transition-transform" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate">{t}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 cursor-pointer group/more">
            <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest group-hover/more:translate-x-1 transition-transform">+ 48 Markers</span>
            <ChevronRight className="w-3 h-3 text-pink-500" />
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-6 pt-6 border-t border-slate-50">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{pkgPrice}</span>
              <span className="text-sm text-slate-400 line-through font-bold decoration-slate-300">₹{pkgOriginal}</span>
            </div>
            <div className="mt-1">
              <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-black uppercase border border-emerald-100 italic">
                Flat 60% Savings
              </span>
            </div>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
             <button 
               onClick={() => navigate('/packages')}
               className="flex-1 sm:flex-none px-6 h-11 rounded-full border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all"
             >
               Details
             </button>
             <button 
               onClick={() => navigate('/packages')}
               className="flex-1 sm:flex-none px-10 h-11 bg-slate-900 hover:bg-black text-white rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
             >
               <span>Book Package</span>
               <ChevronRight className="w-3.5 h-3.5 opacity-50" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Section ──────────────────────────────────────────────── */
const WomenWellnessSpecifics: React.FC = () => {
  const navigate = useNavigate();
  const { addTest } = useCart();

  return (
    <div className="w-full flex flex-col gap-10 py-8">
      
      {/* Individual Tests Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Featured Wellness Tests</h3>
          <div className="h-px bg-slate-100 flex-1 ml-4" />
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar px-1">
          {WELLNESS_TESTS.map(test => (
            <div key={test.id} className="shrink-0 w-[180px]">
              <TestCard
                variant="small"
                test={{
                  id: test.id,
                  name: test.name,
                  slug: `test-${test.id}`,
                  category: 'Women Health',
                  price: test.price,
                  originalPrice: test.originalPrice,
                  shortDesc: '',
                  sampleType: 'Blood',
                  fastingRequired: false,
                  turnaroundTime: '24 Hours',
                  rating: 4.8,
                  parametersCount: test.testsIncluded,
                  isTopBooked: true,
                  isTopDeal: false
                }}
                onViewDetails={(slug) => navigate(`/test/${slug}`)}
                onBook={async () => {
                  await addTest(test.id, test.name, test.price, 1);
                }}
              />
            </div>
          ))}
          
          <button 
            className="shrink-0 w-24 flex flex-col items-center justify-center gap-3 text-slate-300 hover:text-teal-600 group transition-all"
            onClick={() => navigate('/lab-tests')}
          >
             <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center group-hover:border-teal-500 group-hover:scale-110 transition-all">
                <Plus className="w-6 h-6" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest">More</span>
          </button>
        </div>
      </div>

      {/* Featured Package */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Curated Health Bundle</h3>
          <div className="h-px bg-slate-100 flex-1 ml-4" />
        </div>
        <PremiumWellnessPackage />
      </div>

    </div>
  );
};

export default WomenWellnessSpecifics;
