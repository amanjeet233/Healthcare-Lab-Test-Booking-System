import React from 'react';
import PropTypes from 'prop-types';
import { FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaCheckDouble, FaSyringe } from 'react-icons/fa';
import { motion } from 'framer-motion';

export type BadgeStatus =
    | 'PENDING'
    | 'PENDING_CONFIRMATION'
    | 'CONFIRMED'
    | 'BOOKED'
    | 'REFLEX_PENDING'
    | 'PROCESSING'
    | 'PENDING_VERIFICATION'
    | 'VERIFIED'
    | 'CANCELLED'
    | 'COMPLETED'
    | 'SAMPLE_COLLECTED';

/**
 * Props for the StatusBadge component.
 */
export interface StatusBadgeProps {
    /** The status to be displayed by the badge */
    status: BadgeStatus;
    /** Extra class names for styling overrides */
    className?: string;
}

/**
 * A reusable badge component for displaying system statuses with matching icons and colors.
 *
 * @param {StatusBadgeProps} props - The component props.
 * @returns {React.ReactElement} The rendered StatusBadge component.
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
    const config: Record<string, { colors: string; icon: React.ReactNode; label: string }> = {
        PENDING: {
            colors: 'bg-amber-50 text-amber-600 border-amber-100',
            icon: <FaHourglassHalf className="mr-1.5 h-3 w-3" />,
            label: 'Pending',
        },
        PENDING_CONFIRMATION: {
            colors: 'bg-amber-50 text-amber-600 border-amber-100',
            icon: <FaHourglassHalf className="mr-1.5 h-3 w-3" />,
            label: 'Awaiting',
        },
        CONFIRMED: {
            colors: 'bg-cyan-50 text-cyan-700 border-cyan-100',
            icon: <FaCheckCircle className="mr-1.5 h-3 w-3" />,
            label: 'Confirmed',
        },
        BOOKED: {
            colors: 'bg-cyan-50 text-cyan-700 border-cyan-100',
            icon: <FaCheckCircle className="mr-1.5 h-3 w-3" />,
            label: 'Booked',
        },
        REFLEX_PENDING: {
            colors: 'bg-violet-50 text-violet-700 border-violet-100',
            icon: <FaHourglassHalf className="mr-1.5 h-3 w-3" />,
            label: 'Reflex',
        },
        PROCESSING: {
            colors: 'bg-indigo-50 text-indigo-700 border-indigo-100',
            icon: <FaSyringe className="mr-1.5 h-3 w-3" />,
            label: 'Processing',
        },
        PENDING_VERIFICATION: {
            colors: 'bg-amber-50 text-amber-700 border-amber-100',
            icon: <FaHourglassHalf className="mr-1.5 h-3 w-3" />,
            label: 'Verify',
        },
        VERIFIED: {
            colors: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            icon: <FaCheckDouble className="mr-1.5 h-3 w-3" />,
            label: 'Verified',
        },
        CANCELLED: {
            colors: 'bg-rose-50 text-rose-600 border-rose-100',
            icon: <FaTimesCircle className="mr-1.5 h-3 w-3" />,
            label: 'Cancelled',
        },
        COMPLETED: {
            colors: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            icon: <FaCheckDouble className="mr-1.5 h-3 w-3" />,
            label: 'Completed',
        },
        SAMPLE_COLLECTED: {
            colors: 'bg-indigo-50 text-indigo-700 border-indigo-100',
            icon: <FaSyringe className="mr-1.5 h-3 w-3" />,
            label: 'Collected',
        },
    };

    const currentConfig = config[status] || config.PENDING;

    return (
        <motion.span
            className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md shadow-sm transition-all ${currentConfig.colors} ${className}`}
            whileHover={{ scale: 1.05 }}
        >
            {currentConfig.icon}
            {currentConfig.label}
        </motion.span>
    );
};

StatusBadge.propTypes = {
    status: PropTypes.oneOf([
        'PENDING',
        'PENDING_CONFIRMATION',
        'CONFIRMED',
        'BOOKED',
        'REFLEX_PENDING',
        'PROCESSING',
        'PENDING_VERIFICATION',
        'VERIFIED',
        'CANCELLED',
        'COMPLETED',
        'SAMPLE_COLLECTED'
    ]).isRequired,
    className: PropTypes.string,
} as any;

export default React.memo(StatusBadge);
