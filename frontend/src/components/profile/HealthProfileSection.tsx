import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Ruler, Weight, AlertTriangle, Pill, Phone, Edit3, ChevronRight, TrendingUp } from 'lucide-react';
import type { HealthProfile } from '../../services/healthDataService';

interface HealthProfileSectionProps {
    profile: HealthProfile;
    onEdit: () => void;
}

const HealthProfileSection: React.FC<HealthProfileSectionProps> = ({ profile, onEdit }) => {
    return (
        <div className="space-y-8">
            {/* HUD: Primary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { icon: Activity, label: 'Age', value: profile.metrics.age, unit: 'Years', color: 'primary' },
                    { icon: Ruler, label: 'Height', value: profile.metrics.height, unit: 'CM', color: 'secondary' },
                    { icon: Weight, label: 'Weight', value: profile.metrics.weight, unit: 'KG', color: 'emerald' },
                    { icon: Heart, label: 'BMI', value: profile.metrics.bmi, unit: 'Index', color: 'amber' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/60 backdrop-blur-xl border border-primary/5 rounded-[2.5rem] p-8 shadow-radical-sm hover:shadow-radical transition-all group overflow-hidden relative"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 blur-3xl rounded-full translate-x-12 -translate-y-12`} />
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className={`w-14 h-14 bg-white border border-primary/5 rounded-2xl flex items-center justify-center text-${stat.color}-600 shadow-medical`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="text-center space-y-1">
                                <span className="text-[9px] font-black text-muted-gray uppercase tracking-[0.3em] opacity-40">{stat.label}</span>
                                <div className="flex items-baseline justify-center gap-1">
                                    <h4 className="text-3xl font-black text-evergreen tracking-tighter italic leading-none">{stat.value}</h4>
                                    <span className="text-[10px] font-black text-primary uppercase">{stat.unit}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Medical Context */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Health Status Dashboard */}
                    <div className="bg-white/60 backdrop-blur-xl border border-primary/5 rounded-[3rem] p-10 shadow-radical relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

                        <div className="relative z-10 space-y-8">
                            <div className="flex justify-between items-center">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Biometric Synthesis</span>
                                    <h3 className="text-3xl font-black text-evergreen uppercase tracking-tighter italic leading-none">Medical <span className="text-secondary">Environment</span></h3>
                                </div>
                                <button
                                    onClick={onEdit}
                                    className="p-4 bg-primary text-white rounded-2xl shadow-medical hover:bg-evergreen transition-all active:scale-90"
                                >
                                    <Edit3 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Allergies & Conditions */}
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                                            <span className="text-[10px] font-black text-evergreen uppercase tracking-widest">Active Sensitivities</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.allergies.map(allergy => (
                                                <span key={allergy} className="px-4 py-2 bg-amber-500/5 border border-amber-500/10 text-amber-600 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                                    {allergy}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Activity className="w-4 h-4 text-emerald-500" />
                                            <span className="text-[10px] font-black text-evergreen uppercase tracking-widest">Chronic Status</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.chronicConditions.map(condition => (
                                                <span key={condition} className="px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest text-shadow-sm">
                                                    {condition}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Medications & Supplements */}
                                <div className="bg-primary/[0.02] border border-primary/5 rounded-[2rem] p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Pill className="w-5 h-5 text-primary" />
                                            <span className="text-[10px] font-black text-evergreen uppercase tracking-widest italic">Current Protocol</span>
                                        </div>
                                        <span className="text-[9px] font-black text-primary bg-primary/10 px-3 py-1 rounded-lg uppercase tracking-widest">Verified</span>
                                    </div>
                                    <div className="space-y-4">
                                        {profile.medications.map(med => (
                                            <div key={med} className="flex justify-between items-center group/med">
                                                <span className="text-[11px] font-bold text-muted-gray uppercase tracking-wider">{med}</span>
                                                <button className="w-6 h-6 border border-primary/10 rounded-lg flex items-center justify-center text-primary opacity-0 group-hover/med:opacity-100 transition-opacity">
                                                    <ChevronRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Telemetry: BP History */}
                    <div className="bg-white/60 backdrop-blur-xl border border-primary/5 rounded-[3rem] p-10 shadow-radical">
                        <div className="flex justify-between items-center mb-8">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-secondary uppercase tracking-[0.4em]">Neural Link Telemetry</span>
                                <h4 className="text-2xl font-black text-evergreen uppercase tracking-tighter italic">Vascular <span className="text-primary">Timeline</span></h4>
                            </div>
                            <div className="hidden sm:flex items-center gap-4">
                                <span className="flex items-center gap-2 text-[9px] font-black text-muted-gray uppercase tracking-widest">
                                    <span className="w-2 h-2 rounded-full bg-primary" /> Systolic
                                </span>
                                <span className="flex items-center gap-2 text-[9px] font-black text-muted-gray uppercase tracking-widest">
                                    <span className="w-2 h-2 rounded-full bg-secondary" /> Diastolic
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {profile.bloodPressureHistory.map((entry) => (
                                <div key={entry.date} className="flex items-center gap-6 p-4 hover:bg-primary/[0.02] rounded-2xl transition-colors">
                                    <span className="text-[10px] font-black text-muted-gray uppercase tracking-widest w-24 opacity-60 italic">{entry.date}</span>
                                    <div className="flex-1 h-3 bg-primary/5 rounded-full relative overflow-hidden">
                                        <div
                                            className="absolute inset-y-0 left-0 bg-primary/40 rounded-full"
                                            style={{ width: `${(entry.systolic / 200) * 100}%` }}
                                        />
                                        <div
                                            className="absolute inset-y-0 left-0 bg-secondary/60 rounded-full"
                                            style={{ width: `${(entry.diastolic / 150) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 min-w-[100px] justify-end">
                                        <span className="text-sm font-black text-evergreen italic">{entry.systolic}/{entry.diastolic}</span>
                                        <span className="text-[9px] font-bold text-muted-gray uppercase opacity-40">MMHG</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Col: Context & Emergency */}
                <div className="space-y-8">
                    {/* Emergency Protocol */}
                    <div className="bg-red-500 rounded-[3rem] p-10 text-white shadow-xl shadow-red-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full -translate-x-8 -translate-y-8" />
                        <div className="relative z-10 space-y-8">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-white animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Lifeline Node</span>
                                </div>
                                <h4 className="text-3xl font-black uppercase tracking-tighter italic">Emergency <span className="text-white/60">Contact</span></h4>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/10 space-y-4">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Primary Guardian</span>
                                        <div className="text-xl font-black italic">{profile.emergencyContact.name}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">{profile.emergencyContact.relation}</div>
                                    </div>
                                    <button className="w-full py-4 bg-white text-red-600 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                                        {profile.emergencyContact.phone}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Health Summary */}
                    <div className="bg-evergreen dark-primary rounded-[3rem] p-10 text-white shadow-radical relative overflow-hidden flex-1 min-h-[400px]">
                        <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                                <TrendingUp className="w-6 h-6 text-secondary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">Vitality Index</span>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <span className="text-[54px] font-black text-white italic leading-none tracking-tighter">98%</span>
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                                        Your neural telemetry suggests optimal biological synthesis. Maintain current hydration protocols.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="space-y-1">
                                        <div className="text-xl font-black italic text-secondary">0.8s</div>
                                        <div className="text-[8px] font-black uppercase tracking-widest opacity-40">Sync Latency</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xl font-black italic text-emerald-400">NOMINAL</div>
                                        <div className="text-[8px] font-black uppercase tracking-widest opacity-40">System Status</div>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-5 border border-white/20 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3 group">
                                Deep Diagnostic
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthProfileSection;
