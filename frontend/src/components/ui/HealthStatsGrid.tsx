import React from 'react';
import { motion } from 'framer-motion';

const stats = [
    { label: "Sequences Analyzed", value: "125.8M+", color: "#22D3EE" }, // Cyan from system
    { label: "Precision Rate", value: "99.98%", color: "#059669" }, // Health Green
    { label: "Active Nodes", value: "482", color: "#83B2BF" }, // Secondary Blue
    { label: "Neural Link", value: "24/7", color: "#0891B2", animate: true }, // Primary Cyan
];

const HealthStatsGrid: React.FC = React.memo(() => {
    return (
        <div className="w-full py-12 bg-gradient-to-br from-[#08555F] to-[#0D2320] rounded-[2.5rem] border border-white/10 overflow-hidden relative shadow-radical">
            {/* Grid Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10 relative z-10">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="px-8 lg:px-10 py-10 space-y-3 text-center lg:text-left"
                    >
                        <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                            {stat.label}
                        </div>
                        <div
                            className="text-4xl lg:text-[42px] font-black tracking-tighter font-mono flex items-center justify-center lg:justify-start gap-4 transition-all duration-300 italic"
                            style={{ color: stat.color, textShadow: `0 0 30px ${stat.color}40` }}
                        >
                            {stat.value}
                            {stat.animate && (
                                <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: stat.color, boxShadow: `0 0 15px ${stat.color}` }} />
                            )}
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: '85%' }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-transparent to-current opacity-80"
                                style={{ color: stat.color }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
});

export default HealthStatsGrid;
