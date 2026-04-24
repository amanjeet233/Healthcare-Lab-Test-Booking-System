import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AsymmetricCard from '../common/AsymmetricCard';
import { FlaskConical, Shield, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { packageService } from '../../services/packageService';
import type { TestPackageResponse } from '../../services/packageService';

const TestCarousel: React.FC = React.memo(() => {
    const navigate = useNavigate();
    const [packages, setPackages] = useState<(TestPackageResponse & { color: string, badge: string })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true);
                // Fetch up to 3 packages - prioritize popular/best deals
                const data = await packageService.getAllPackages({ size: 3 });
                
                if (data && data.length > 0) {
                    // Map real packages with color and badge configuration
                    const colors = ["#0891B2", "#10B981", "#059669"];
                    const badges = ["Top Rated", "Best Seller", "Best Value"];
                    
                    const enrichedPackages = data.map((pkg, idx) => ({
                        ...pkg,
                        color: colors[idx % colors.length],
                        badge: badges[idx % badges.length]
                    }));
                    setPackages(enrichedPackages);
                } else {
                    // Fallback to empty state if no packages available
                    setPackages([]);
                }
            } catch (error) {
                console.error('Error fetching packages:', error);
                setPackages([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchPackages();
    }, []);

    // Use default icon - all packages now use FlaskConical
    const getPackageIcon = (index: number) => {
        const icons = [Shield, FlaskConical, Users];
        const Icon = icons[index % icons.length];
        return <Icon className="w-5 h-5" />;
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pt-6 lg:pt-8 items-stretch">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (packages.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No packages available at the moment</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pt-6 lg:pt-8 items-stretch cursor-pointer">
            {packages.map((pkg, i) => (
                <div key={pkg.id} onClick={() => navigate('/packages')} className="h-full block group">
                    <AsymmetricCard
                        delay={i * 0.1}
                        className="h-full"
                    >
                        <div className="flex flex-col h-full space-y-4">
                            <div className="flex justify-between items-center">
                                <div
                                    className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/10 shadow-sm group-hover:border-primary/20 transition-colors"
                                    style={{ color: pkg.color }}
                                >
                                    {getPackageIcon(i)}
                                </div>
                                <span className="bg-primary/5 border border-primary/10 px-3 py-1 rounded-full text-[9px] font-black tracking-widest text-primary uppercase shadow-inner">
                                    {pkg.badge}
                                </span>
                            </div>

                            <div className="flex-1 space-y-2 mt-2">
                                <h3 className="text-xl font-black text-slate-800 leading-tight tracking-tighter uppercase italic group-hover:text-primary transition-colors">
                                    {pkg.packageName}
                                </h3>
                                <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.2em] flex items-center gap-2 opacity-80">
                                    <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: pkg.color }} />
                                    {pkg.totalTests}+ Tests • {pkg.category}
                                </p>
                            </div>

                            <div className="pt-4 mt-auto border-t border-primary/10">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <span className="text-[8px] block font-black text-slate-400 uppercase tracking-[0.3em]">Value Tier</span>
                                        <span className="text-2xl font-black text-primary leading-none italic tracking-tighter">₹{pkg.discountedPrice}</span>
                                        {pkg.discountPercentage > 0 && (
                                            <span className="text-[8px] text-green-600 font-bold">Save {pkg.discountPercentage}%</span>
                                        )}
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05, x: 2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg shadow-primary/20 group-hover:scale-105"
                                    >
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </AsymmetricCard>
                </div>
            ))}
        </div>
    );
});

export default TestCarousel;
