import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface GlassCardProps {
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    backTo?: string;
    children: React.ReactNode;
    className?: string;
    animate?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
    title, 
    subtitle,
    showBack, 
    backTo = -1, 
    children, 
    className = '',
    animate = true 
}) => {
    const navigate = useNavigate();

    const content = (
        <div className={`glass-card-container overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl p-6 ${className}`}>
            {(showBack || title || subtitle) && (
                <div className="flex flex-col gap-1 mb-6">
                    <div className="flex items-center gap-4">
                        {showBack && (
                            <button 
                                onClick={() => typeof backTo === 'string' ? navigate(backTo) : navigate(-1)} 
                                className="p-2 hover:bg-cyan-50 text-cyan-700 rounded-xl transition-all active:scale-95 group"
                                aria-label="Go back"
                            >
                                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                        )}
                        {title && (
                            <h2 className="text-2xl font-extrabold text-[#164E63] tracking-tight">
                                {title}
                            </h2>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-sm text-cyan-600/80 font-medium ml-12">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
            <div className="glass-card-content">
                {children}
            </div>
        </div>
    );

    if (animate) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
                {content}
            </motion.div>
        );
    }

    return content;
};

export default GlassCard;
