import React from 'react';
import Card from '../common/Card';

interface DashboardStatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({ icon, label, value, color }) => (
    <Card className="hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group bg-white/60 backdrop-blur-md border-primary-teal/5 shadow-sm p-7 rounded-[2rem]">
        <div className="flex items-center space-x-6">
            <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6 duration-300"
                style={{ backgroundColor: color }}
            >
                <span className="text-xl">{icon}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-gray opacity-50">{label}</span>
                <span className="text-4xl font-black text-ever-green tracking-tighter leading-none mt-1">{value}</span>
            </div>
        </div>
    </Card>
);

export default DashboardStatCard;
