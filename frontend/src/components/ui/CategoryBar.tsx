import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Moon, Heart, Stethoscope, HeartPulse } from 'lucide-react';

const categories = [
    { id: 'cardiac', label: 'Cardiac', icon: <Heart className="w-3.5 h-3.5" />, color: '#FF6B6B', glow: 'rgba(255,107,107,0.5)' },
    { id: 'metabolic', label: 'Metabolic', icon: <Scale className="w-3.5 h-3.5" />, color: '#10B981', glow: 'rgba(16,185,129,0.5)' },
    { id: 'neurology', label: 'Neurology', icon: <Moon className="w-3.5 h-3.5" />, color: '#8B5CF6', glow: 'rgba(139,92,246,0.5)' },
    { id: 'checkup', label: 'Checkup', icon: <Stethoscope className="w-3.5 h-3.5" />, color: '#08555F', glow: 'rgba(8,85,95,0.5)' },
    { id: 'vitality', label: 'Vitality', icon: <HeartPulse className="w-3.5 h-3.5" />, color: '#3B82F6', glow: 'rgba(59,130,246,0.5)' },
];

const CategoryBar: React.FC = () => {
    const navigate = useNavigate();
    const [active, setActive] = useState('cardiac');

    const handleCategoryClick = (id: string) => {
        setActive(id);
        const categoryMap: { [key: string]: string } = {
            'cardiac': 'heart',
            'metabolic': 'diabetes',
            'neurology': 'hormones',
            'checkup': 'full-body-checkup',
            'vitality': 'vitamin'
        };
        const slug = categoryMap[id] || id;
        navigate(`/lab-tests-category/${slug}`);
    };

    return (
        <section className="relative py-2 md:py-4 z-10">
            <div className="max-w-[1000px] mx-auto px-4 md:px-6">
                <div className="text-center mb-4 md:mb-6">
                    <span className="inline-block text-[9px] font-black uppercase tracking-[0.2em] text-primary opacity-80 bg-white/40 backdrop-blur-md border border-white/60 px-3 py-1 rounded-full shadow-sm mb-3">
                        Specialized Nodes
                    </span>
                    <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tighter">
                        HEALTH <span className="text-primary italic">CATEGORIES</span>
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className={`
                                group relative flex flex-col items-center justify-center p-4 md:p-5 rounded-2xl transition-all duration-300 overflow-hidden bg-white
                                ${active === cat.id
                                    ? 'shadow-[0_8px_30px_rgba(13,124,124,0.15)] border-2 border-primary/20 scale-105'
                                    : 'shadow-sm border-2 border-transparent hover:shadow-md hover:border-primary/10 hover:-translate-y-1'
                                }
                            `}
                        >
                            <div
                                className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white shadow-sm border border-slate-50 flex items-center justify-center mb-3 transition-transform duration-500 z-10 group-hover:scale-110"
                                style={{ color: cat.color }}
                            >
                                <div className="scale-110">
                                    {cat.icon}
                                </div>
                            </div>

                            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest z-10 text-slate-900 group-hover:text-primary transition-colors">
                                {cat.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryBar;
