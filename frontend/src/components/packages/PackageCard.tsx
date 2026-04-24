import React from 'react';
import { motion } from 'framer-motion';
import { Package, Receipt, Star, ChevronRight, Activity } from 'lucide-react';
import type { TestPackageResponse } from '../../services/packageService';

interface PackageCardProps {
    pkg: TestPackageResponse;
    onViewDetails: (pkg: TestPackageResponse) => void;
    onBookNow: (pkg: TestPackageResponse) => void;
    index?: number;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, onViewDetails, onBookNow, index = 0 }) => {
    const hasSavings = pkg.savings > 0;
    const discountPercent = Math.round(pkg.discountPercentage || 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="group relative bg-white rounded-2xl border border-slate-100 hover:border-teal-500/30 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full"
            onClick={() => onViewDetails(pkg)}
        >
            {/* Glassmorphism Savings Badge */}
            {hasSavings && (
                <div className="absolute top-3 right-3 z-10">
                    <div className="backdrop-blur-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <Star className="w-3 h-3 fill-emerald-600" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Save ₹{pkg.savings.toFixed(0)}</span>
                    </div>
                </div>
            )}

            <div className="p-5 flex-1 flex flex-col">
                {/* Header Icon & ID */}
                <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 border border-teal-100/50 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                        <Package className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded">
                        {pkg.packageCode}
                    </span>
                </div>

                {/* Name & Desc */}
                <div className="mb-3">
                    <h3 className="text-[14px] font-black text-slate-900 leading-tight mb-1 group-hover:text-teal-700 transition-colors uppercase tracking-tight">
                        {pkg.packageName}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
                        {pkg.description || 'Comprehensive health assessment bundle.'}
                    </p>
                </div>

                {/* Parameters Link */}
                <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50/50 rounded-lg border border-slate-100/50">
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                        {pkg.totalTests} Parameters Included
                    </span>
                </div>

                {/* Test Tags */}
                {pkg.tests && pkg.tests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {pkg.tests.slice(0, 3).map((test, idx) => (
                            <span
                                key={idx}
                                className="text-[9px] font-bold text-slate-500 bg-slate-100/80 px-2 py-1 rounded-md"
                            >
                                {test.name}
                            </span>
                        ))}
                        {pkg.tests.length > 3 && (
                            <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">
                                +{pkg.tests.length - 3} More
                            </span>
                        )}
                    </div>
                )}

                {/* Price & Actions */}
                <div className="mt-auto pt-4 border-t border-slate-50">
                    <div className="flex items-end justify-between mb-4">
                        <div className="flex flex-col">
                            {hasSavings && (
                                <span className="text-[11px] text-slate-400 line-through font-bold decoration-slate-300 mb-0.5">
                                    ₹{pkg.price.toFixed(0)}
                                </span>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="text-[20px] font-black text-slate-900 leading-none">
                                    ₹{pkg.discountedPrice.toFixed(0)}
                                </span>
                                {discountPercent > 0 && (
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                        {discountPercent}% OFF
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onViewDetails(pkg); }}
                            className="flex-1 h-10 bg-white border border-slate-200 text-slate-700 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
                        >
                            Details
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onBookNow(pkg); }}
                            className="flex-1 h-10 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-200 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                            <span>Book Now</span>
                            <ChevronRight className="w-3 h-3 text-white/50" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PackageCard;
