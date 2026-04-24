import React from 'react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

const LiveStats: React.FC = React.memo(() => {
    const stats = React.useMemo(() => [
        { label: "Active Patients", value: 12450, suffix: "+", color: "text-evergreen" },
        { label: "Labs Nationwide", value: 150, suffix: "+", color: "text-primary" },
        { label: "Tests Available", value: 1000, suffix: "+", color: "text-cta" }
    ], []);

    return (
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-12 mt-12">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05, duration: 0.5 }}
                    className="flex flex-col items-center lg:items-start"
                >
                    <span className={`text-4xl font-black tracking-tighter uppercase italic ${stat.color}`}>
                        <CountUp end={stat.value} duration={2.5} suffix={stat.suffix} separator="," />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-gray mt-2.5 opacity-60">
                        {stat.label}
                    </span>
                </motion.div>
            ))}
        </div>
    );
});

export default LiveStats;
