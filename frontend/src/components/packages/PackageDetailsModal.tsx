import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaFlask, FaTag, FaChevronRight, FaPercentage, FaShareAlt, FaCheck, FaClock } from 'react-icons/fa';
import type { TestPackageResponse } from '../../services/packageService';
import { notify } from '../../utils/toast';

interface PackageDetailsModalProps {
    isOpen: boolean;
    pkg: TestPackageResponse | null;
    onClose: () => void;
    onBookPackage: (pkg: TestPackageResponse) => void;
}

const PackageDetailsModal: React.FC<PackageDetailsModalProps> = ({ isOpen, pkg, onClose, onBookPackage }) => {
    if (!isOpen || !pkg) return null;

    const hasSavings = pkg.savings > 0;
    const discountPercent = Math.round(pkg.discountPercentage || 0);

    const handleShare = async () => {
        const shareData = {
            title: pkg.packageName,
            text: `Check out ${pkg.packageName} — ${pkg.totalTests} tests for just ₹${pkg.discountedPrice.toFixed(0)}!`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                notify.success('Link copied to clipboard!');
            }
        } catch {
            notify.error('Failed to share');
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-evergreen/60 backdrop-blur-md" onClick={onClose} />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm p-8 pb-6 border-b border-primary/5 rounded-t-[2rem]">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-5 flex-grow">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0">
                                    <FaFlask className="text-xl" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Package Protocol</span>
                                    <h2 className="text-xl font-black text-evergreen uppercase tracking-tight italic leading-tight mt-1">
                                        {pkg.packageName}
                                    </h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-gray opacity-40 mt-1">
                                        {pkg.packageCode}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleShare}
                                    className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary hover:bg-primary/10 transition-all cursor-pointer"
                                >
                                    <FaShareAlt className="text-sm" />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-xl bg-white border border-primary/10 flex items-center justify-center text-muted-gray hover:text-evergreen hover:bg-gray-50 transition-all cursor-pointer"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-8 space-y-8">
                        {/* Description */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-gray">About This Package</span>
                            <p className="text-sm text-muted-gray leading-relaxed">
                                {pkg.description || 'A comprehensive health package combining multiple diagnostic tests for a thorough health assessment at a discounted price.'}
                            </p>
                        </div>

                        {/* Price Breakdown */}
                        <div className="p-6 bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] rounded-2xl border border-primary/5 space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-gray">Price Synthesis</span>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-gray">Individual Test Total</span>
                                    <span className="text-lg font-black text-muted-gray line-through opacity-50">₹{pkg.price.toFixed(0)}</span>
                                </div>

                                {hasSavings && (
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-2">
                                            <FaPercentage className="text-secondary text-xs" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
                                                Package Discount ({discountPercent}%)
                                            </span>
                                        </div>
                                        <span className="text-lg font-black text-secondary">-₹{pkg.savings.toFixed(0)}</span>
                                    </div>
                                )}

                                <div className="pt-3 border-t border-primary/10 flex justify-between items-end">
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-evergreen">Package Price</span>
                                    <span className="text-3xl font-black text-primary">₹{pkg.discountedPrice.toFixed(0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tests Included */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-gray">
                                    Tests Included
                                </span>
                                <div className="flex items-center space-x-2 px-3 py-1.5 bg-primary/5 rounded-lg">
                                    <FaTag className="text-primary text-[10px]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">{pkg.totalTests} Tests</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {pkg.tests && pkg.tests.length > 0 ? (
                                    pkg.tests.map((test, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="flex items-center space-x-4 p-4 bg-white border border-primary/5 rounded-xl hover:border-primary/10 hover:bg-primary/[0.01] transition-all"
                                        >
                                            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FaCheck className="text-emerald-500 text-xs" />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <p className="text-xs font-black uppercase tracking-wider text-evergreen truncate">{test.name}</p>
                                            </div>
                                            <div className="flex items-center space-x-1 text-muted-gray">
                                                <FaClock className="text-[10px] opacity-40" />
                                                <span className="text-[9px] font-bold uppercase tracking-wider opacity-40">
                                                    24h
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-gray opacity-40">
                                        <FaFlask className="mx-auto text-2xl mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Test details loading...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="sticky bottom-0 p-8 pt-6 border-t border-primary/5 bg-white/95 backdrop-blur-sm rounded-b-[2rem]">
                        <button
                            onClick={() => onBookPackage(pkg)}
                            className="w-full h-16 bg-primary text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 cursor-pointer"
                        >
                            <span>Book This Package</span>
                            <FaChevronRight className="text-white/40" />
                        </button>

                        {hasSavings && (
                            <p className="text-center mt-3 text-[9px] font-black uppercase tracking-widest text-secondary">
                                You save ₹{pkg.savings.toFixed(0)} with this package
                            </p>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PackageDetailsModal;
