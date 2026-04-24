import React from 'react';
import { motion } from 'framer-motion';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
}

const GlassButton: React.FC<GlassButtonProps> = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    loading, 
    icon,
    className = '',
    ...props 
}) => {
    const baseStyles = "relative flex items-center justify-center gap-2 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden";
    
    const variants = {
        primary: "bg-[#0891B2] text-white shadow-lg shadow-cyan-500/20 hover:bg-[#0E7490] hover:shadow-cyan-500/30",
        secondary: "bg-[#059669] text-white shadow-lg shadow-emerald-500/20 hover:bg-[#047857] hover:shadow-emerald-500/30",
        tertiary: "bg-white/40 backdrop-blur-md border border-white/60 text-[#164E63] hover:bg-white/60 hover:shadow-lg hover:shadow-cyan-900/5",
        outline: "bg-white/50 backdrop-blur-md border-2 border-[#0891B2] text-[#0891B2] hover:bg-cyan-50",
        ghost: "bg-transparent text-[#0891B2] hover:bg-cyan-50"
    };

    const sizes = {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base"
    };

    return (
        <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={loading || props.disabled}
            {...(props as any)}
        >
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {!loading && icon && <span className="text-current">{icon}</span>}
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
};

export default GlassButton;
