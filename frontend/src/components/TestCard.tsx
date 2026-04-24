import React, { useMemo } from 'react';
import { Microscope, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

type TestCardVariant = 'default' | 'small';

interface TestCardData {
  id: number;
  name: string;
  slug: string;
  category?: string;
  price: number;
  originalPrice?: number;
  parametersCount?: number;
  isPackage?: boolean;
}

interface TestCardProps {
  test: TestCardData;
  onViewDetails: (slug: string) => void;
  onBook: (testId: number) => void;
  variant?: TestCardVariant;
}

// --- Skeleton Component (Error fix karne ke liye) ---
export const TestCardSkeleton: React.FC<{ variant?: TestCardVariant }> = ({ variant = 'default' }) => {
  const cardWidthClass =
    variant === 'small'
      ? 'w-full'
      : 'w-full max-w-[240px]';

  return (
  <div className={`bg-white rounded-2xl p-4 border border-slate-100 animate-pulse ${cardWidthClass}`}>
    <div className="flex justify-between mb-3">
      <div className="w-8 h-8 rounded-full bg-slate-100" />
      <div className="w-12 h-3 bg-slate-50 rounded" />
    </div>
    <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
    <div className="h-3 bg-slate-50 rounded w-1/2 mb-4" />
    <div className="flex justify-between items-center mb-3">
      <div className="w-12 h-5 bg-slate-100 rounded" />
      <div className="w-10 h-4 bg-slate-50 rounded" />
    </div>
    <div className="h-8 bg-slate-100 rounded-lg w-full" />
  </div>
  );
};

// --- Main TestCard Component ---
export const TestCard: React.FC<TestCardProps> = ({ test, onViewDetails, onBook, variant = 'default' }) => {
  const basePrice = Number(test.price) || 0;
  const baseOriginal = Number(test.originalPrice) > 0 ? Number(test.originalPrice) : basePrice;
  const discount = baseOriginal > basePrice
    ? Math.round(((baseOriginal - basePrice) / baseOriginal) * 100)
    : 0;

  const theme = useMemo(() => {
    const cat = (test.category || '').toLowerCase();
    if (cat.includes('blood') || cat.includes('cbc'))
      return { color: 'text-blue-500', bg: 'bg-blue-50', icon: <Activity className="w-4 h-4" /> };
    return { color: 'text-orange-500', bg: 'bg-orange-50', icon: <Microscope className="w-4 h-4" /> };
  }, [test.category]);

  const cardWidthClass =
    variant === 'small'
      ? 'w-full'
      : 'w-full max-w-[240px]';

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer ${cardWidthClass}`}
      onClick={() => onViewDetails(test.slug)}
    >
      {/* Top Section: Icon & Badge */}
      <div className="flex justify-between items-start mb-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme.bg} ${theme.color}`}>
          {theme.icon}
        </div>
        <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded tracking-tight">
          {test.isPackage ? 'PACKAGE' : 'LAB TEST'}
        </span>
      </div>

      {/* Title: Compact & Bold */}
      <h3 className="text-[13px] font-extrabold text-slate-800 leading-tight mb-1 uppercase line-clamp-2 min-h-[32px] break-words">
        {test.name}
      </h3>

      {/* Meta: Category & Params (No extra space) */}
      <div className="flex flex-col gap-0.5 mb-2">
        <div className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${theme.color.replace('text', 'bg')}`}></span>
          <span className="text-[10px] font-bold text-slate-500 uppercase truncate">{test.category || 'General'}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Activity className="w-3 h-3" />
          <span>{test.parametersCount || 1} Parameter</span>
        </div>
      </div>

      {/* Pricing: Small Font size */}
      <div className="flex items-center justify-between mb-3 mt-auto">
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-300 line-through font-medium leading-none">₹{baseOriginal}</span>
          <span className="text-[15px] font-black text-slate-900">₹{basePrice}</span>
        </div>
        <div className="bg-[#e7f9f3] text-[#00b67a] text-[10px] font-black px-1.5 py-0.5 rounded">
          {discount}% OFF
        </div>
      </div>

      {/* Small & Sleek Book Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onBook(test.id);
        }}
        className="w-full bg-[#0f172a] hover:bg-black text-white py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
      >
        <span className="text-sm">+</span> BOOK
      </button>
    </motion.div>
  );
};

export default TestCard;
