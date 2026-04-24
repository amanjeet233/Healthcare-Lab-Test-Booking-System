import React from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, Banknote, ShieldAlert, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { type SystemStats } from '../../services/adminService';

interface Props {
    stats: SystemStats;
}

const SystemStatsCards: React.FC<Props> = ({ stats }) => {
    const cards = [
        {
            label: 'Registered Users',
            value: (stats?.activeUsers ?? 0).toLocaleString(),
            icon: Users,
            trend: '+12%',
            isPositive: true,
            color: 'primary'
        },
        {
            label: 'Total Bookings',
            value: (stats?.totalBookings ?? 0).toLocaleString(),
            icon: Activity,
            trend: '+5.2%',
            isPositive: true,
            color: 'cta'
        },
        {
            label: 'Total Revenue',
            value: `₹${((stats?.totalRevenue ?? 0) / 1000).toFixed(1)}k`,
            icon: Banknote,
            trend: '+8.1%',
            isPositive: true,
            color: 'secondary'
        },
        {
            label: 'Action Required',
            value: (stats?.pendingBookings ?? 0).toString(),
            icon: ShieldAlert,
            trend: '-2.4%',
            isPositive: false,
            color: 'text'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, i) => {
                const Icon = card.icon;
                return (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/40 backdrop-blur-xl border border-primary/5 rounded-4xl p-8 shadow-sm hover:shadow-md hover:border-primary/10 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl bg-${card.color}/10 text-${card.color} group-hover:scale-110 transition-transform`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black italic ${card.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                {card.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {card.trend}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-text/40 uppercase tracking-widest">{card.label}</span>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-black text-text uppercase italic tracking-tighter">
                                    {card.value}
                                </h3>
                                <TrendingUp className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-primary/5">
                            <div className="w-full bg-primary/5 h-1.5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '70%' }}
                                    transition={{ duration: 1.5, delay: i * 0.1 }}
                                    className={`bg-${card.color} h-full rounded-full opacity-60`}
                                />
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default SystemStatsCards;
