import React from 'react';
import { motion } from 'framer-motion';
import { FaFileAlt, FaDownload, FaEye, FaShareAlt, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import type { ReportDisplay } from '../../services/reportService';
import { notify } from '../../utils/toast';

interface ReportCardProps {
    report: ReportDisplay;
    onView: (report: ReportDisplay) => void;
    onDownload: (report: ReportDisplay) => void;
    index?: number;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onView, onDownload, index = 0 }) => {
    const hasAbnormal = report.report?.results?.some(r => r.isAbnormal) || false;
    const hasCritical = report.report?.results?.some(r => r.isCritical) || false;

    const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
        COMPLETED: { label: 'Report Ready', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        SAMPLE_COLLECTED: { label: 'Processing', color: 'text-amber-600', bg: 'bg-amber-50' },
        BOOKED: { label: 'Awaiting Sample', color: 'text-primary', bg: 'bg-primary/5' },
        CANCELLED: { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-50' }
    };
    const status = statusConfig[report.status] || statusConfig.BOOKED;

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Lab Report — ${report.testName}`,
                    text: `Booking ${report.bookingId}: ${report.testName} report from ${report.bookingDate}`,
                    url: window.location.href
                });
            } else {
                await navigator.clipboard.writeText(`Lab Report — ${report.testName} (${report.bookingDate})`);
                notify.success('Copied to clipboard!');
            }
        } catch {
            // User cancelled share
        }
    };

    const formattedDate = new Date(report.bookingDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            className="group bg-white rounded-[2rem] border-2 border-primary/5 hover:border-primary/15 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
        >
            <div className="p-7 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-grow min-w-0">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${report.hasReport ? 'bg-emerald-50 text-emerald-500' : 'bg-primary/5 text-primary'}`}>
                            <FaFileAlt className="text-lg" />
                        </div>
                        <div className="min-w-0 flex-grow">
                            <h3 className="text-sm font-black text-evergreen uppercase tracking-tight italic leading-tight truncate">
                                {report.testName}
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-gray opacity-40 mt-1">
                                {formattedDate} · Ref #{report.bookingId}
                            </p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${status.color} ${status.bg} flex-shrink-0`}>
                        {status.label}
                    </span>
                </div>

                {/* Result Indicators */}
                {report.hasReport && report.report && (
                    <div className="flex flex-wrap gap-2">
                        <span className="flex items-center space-x-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                            <FaCheckCircle className="text-[8px]" />
                            <span>{report.report.results?.length || 0} Parameters</span>
                        </span>
                        {hasAbnormal && (
                            <span className="flex items-center space-x-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                                <FaExclamationTriangle className="text-[8px]" />
                                <span>Abnormal Values</span>
                            </span>
                        )}
                        {hasCritical && (
                            <span className="flex items-center space-x-1.5 text-[9px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">
                                <FaExclamationTriangle className="text-[8px]" />
                                <span>Critical</span>
                            </span>
                        )}
                    </div>
                )}

                {!report.hasReport && (
                    <div className="flex items-center space-x-3 p-3 bg-primary/[0.02] rounded-xl border border-primary/5">
                        <FaClock className="text-primary/30" />
                        <span className="text-[10px] font-bold text-muted-gray opacity-60">
                            Report will be available once results are submitted.
                        </span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="px-7 pb-6 flex gap-2">
                {report.hasReport ? (
                    <>
                        <button
                            onClick={() => onView(report)}
                            className="flex-1 h-11 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/15 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                        >
                            <FaEye className="text-[9px]" />
                            <span>View</span>
                        </button>
                        <button
                            onClick={() => onDownload(report)}
                            className="h-11 px-4 bg-white border-2 border-primary/10 text-evergreen rounded-xl font-black uppercase tracking-widest text-[10px] hover:border-primary/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                        >
                            <FaDownload className="text-[9px]" />
                            <span>PDF</span>
                        </button>
                        <button
                            onClick={handleShare}
                            className="h-11 w-11 bg-white border-2 border-primary/10 rounded-xl flex items-center justify-center text-primary hover:border-primary/25 transition-all cursor-pointer flex-shrink-0"
                        >
                            <FaShareAlt className="text-xs" />
                        </button>
                    </>
                ) : (
                    <div className="flex-1 h-11 bg-primary/5 rounded-xl flex items-center justify-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-gray opacity-40">Pending</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ReportCard;
