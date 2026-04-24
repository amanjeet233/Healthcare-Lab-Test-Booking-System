import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, ExternalLink, Star } from 'lucide-react';
import type { LabLocation } from '../../services/locationService';

interface LabCardProps {
    lab: LabLocation;
    onViewOnMap: (lab: LabLocation) => void;
}

const LabCard: React.FC<LabCardProps> = ({ lab, onViewOnMap }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ y: -5 }}
            className="group bg-white/60 backdrop-blur-xl border border-primary/10 rounded-[2rem] p-6 shadow-radical-sm hover:shadow-radical transition-all duration-500 relative overflow-hidden"
        >
            {/* Holographic accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />

            <div className="relative z-10 space-y-4">
                {/* Header: Name and Rating */}
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-evergreen uppercase tracking-tighter italic leading-none group-hover:text-primary transition-colors">
                            {lab.name}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
                                {lab.id.padStart(2, '0')}-Node
                            </span>
                            {lab.distance !== undefined && (
                                <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
                                    {lab.distance.toFixed(1)} km away
                                </span>
                            )}
                        </div>
                    </div>
                    {lab.rating && (
                        <div className="bg-primary/5 border border-primary/10 px-2 py-1 rounded-xl flex items-center gap-1.5 shadow-inner-glow">
                            <Star className="w-3 h-3 text-secondary fill-secondary" />
                            <span className="text-[10px] font-black text-evergreen">{lab.rating}</span>
                        </div>
                    )}
                </div>

                {/* Details Grid */}
                <div className="space-y-2.5">
                    <div className="flex items-start gap-3">
                        <div className="bg-primary/5 p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
                            <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-[11px] text-muted-gray uppercase tracking-wider font-bold opacity-70 leading-relaxed mt-1">
                            {lab.address}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-primary/5 p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
                            <Phone className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-[11px] text-muted-gray uppercase tracking-widest font-black opacity-80">
                            {lab.phone}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-primary/5 p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
                            <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-gray uppercase tracking-widest font-black opacity-80">
                                {lab.workingHours}
                            </span>
                            {lab.workingHours === '24/7 Service' && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex gap-3">
                    <button
                        onClick={() => onViewOnMap(lab)}
                        className="flex-1 py-3 bg-primary text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-evergreen transition-all shadow-medical active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <MapPin className="w-3 h-3" />
                        VIEW ON MAP
                    </button>
                    <button
                        className="w-12 h-12 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-center text-primary hover:bg-primary/10 transition-all group/btn cursor-pointer"
                        title="Get Directions"
                    >
                        <ExternalLink className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default LabCard;
