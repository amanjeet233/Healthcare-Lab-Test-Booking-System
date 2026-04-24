import React from 'react';
import PropTypes from 'prop-types';
import { motion, type HTMLMotionProps } from 'framer-motion';

/**
 * Props for the Card component.
 */
export interface CardProps {
    /** The children elements to render inside the card */
    children: React.ReactNode;
    /** Extra CSS classes for styling overrides */
    className?: string;
    /** Whether to include default padding (p-6) */
    noPadding?: boolean;
    /** Optional click handler making the card interactive */
    onClick?: () => void;
}

/**
 * A reusable card container component with a clean white background, shadow, and rounded corners.
 *
 * @param {CardProps} props - The component props.
 * @returns {React.ReactElement} The rendered Card component.
 */
const Card: React.FC<CardProps & HTMLMotionProps<"div">> = ({ children, className = '', noPadding = false, onClick, ...rest }) => {
    const baseClasses = 'bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-radical border border-primary/5 transition-all duration-300 text-evergreen';
    const paddingClasses = noPadding ? '' : 'p-8';
    const interactiveClasses = onClick ? 'cursor-pointer hover:shadow-2xl hover:border-primary/20 hover:-translate-y-1' : '';

    return (
        <motion.div
            className={`${baseClasses} ${paddingClasses} ${interactiveClasses} ${className}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            whileHover={onClick ? { scale: 1.015, y: -2 } : undefined}
            whileTap={onClick ? { scale: 0.98 } : undefined}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            {...rest}
        >
            {children}
        </motion.div>
    );
};

Card.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    noPadding: PropTypes.bool,
    onClick: PropTypes.func,
};

export default React.memo(Card);
