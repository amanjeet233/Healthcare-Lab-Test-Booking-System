import React from 'react';

import PropTypes from 'prop-types';

/**
 * Props for the LoadingSpinner component.
 */
export interface LoadingSpinnerProps {
    /** Whether the spinner should cover the full screen with an overlay */
    fullScreen?: boolean;
    /** The size of the spinner (sm, md, lg) */
    size?: 'sm' | 'md' | 'lg';
    /** Whether the spinner should be displayed inline (e.g., inside a button) */
    inline?: boolean;
}

/**
 * A reusable loading spinner component matching the theme's primary color.
 * Supports full screen overlay, inline display, and multiple sizes.
 *
 * @param {LoadingSpinnerProps} props - The component props.
 * @returns {React.ReactElement} The rendered LoadingSpinner component.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = false, size = 'md', inline = false }) => {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
    };

    const spinner = (
        <div
            className={`animate-spin rounded-full ${sizeClasses[size]} border-primary border-t-transparent`}
            role="status"
            aria-label="loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                {spinner}
            </div>
        );
    }

    if (inline) {
        return spinner;
    }

    return <div className="flex justify-center p-4">{spinner}</div>;
};

LoadingSpinner.propTypes = {
    fullScreen: PropTypes.bool,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    inline: PropTypes.bool,
};

export default LoadingSpinner;
