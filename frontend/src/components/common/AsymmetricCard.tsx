import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AsymmetricCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

const AsymmetricCard = React.memo<AsymmetricCardProps>(({
    children,
    className = "",
    delay = 0
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
            className={`relative group h-full ${className}`}
        >
            <div className="h-full medical-card p-6 md:p-8 relative overflow-hidden group border border-primary/10 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                {/* Clean Subtle Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex flex-col h-full rounded-[inherit] space-y-4">
                    {children}
                </div>
            </div>
        </motion.div>
    );
});

export default AsymmetricCard;
