import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Info, ExternalLink, X } from 'lucide-react';
import type { LabLocation } from '../../services/locationService';

interface LabMapProps {
    labs: LabLocation[];
    selectedLab: LabLocation | null;
    onSelectLab: (lab: LabLocation | null) => void;
}

const LabMap: React.FC<LabMapProps> = ({ labs, selectedLab, onSelectLab }) => {
    const [hoveredLab, setHoveredLab] = useState<LabLocation | null>(null);

    // Simulated "Map" coordinates to screen space
    // Assumes New York area as center
    const getScreenCoords = (lat: number, lng: number) => {
        const centerLat = 40.7128;
        const centerLng = -74.0060;
        const scale = 1500; // Arbitrary scale factor

        return {
            x: 50 + (lng - centerLng) * scale,
            y: 50 - (lat - centerLat) * scale
        };
    };

    return (
        <div className="w-full h-[500px] md:h-full bg-gradient-to-br from-[#08555F] to-[#0D2320] rounded-[2.5rem] relative overflow-hidden border border-white/10 group shadow-radical">
            {/* Medical Grid Background */}
            <div
                className="absolute inset-x-[-50%] inset-y-[-50%] opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0, 245, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 245, 255, 0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Neural Scanning Animation */}
            <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] bg-electric-cyan/5 blur-[120px] rounded-full animate-pulse" />

            {/* User Location Marker (Simulated at NY Center) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="relative">
                    {[1, 2, 3].map((ring) => (
                        <motion.div
                            key={ring}
                            animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                            transition={{ duration: 4, repeat: Infinity, delay: ring * 1.3 }}
                            className="absolute inset-[-40px] border border-secondary/30 rounded-full"
                        />
                    ))}
                    <div className="relative w-10 h-10 bg-secondary/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-secondary/40 shadow-cyan-glow">
                        <div className="w-4 h-4 bg-secondary rounded-full animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Map UI Elements */}
            <div className="absolute top-6 left-6 z-30 flex flex-col gap-3">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                    <Navigation className="w-4 h-4 text-electric-cyan" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest italic">
                        Node Network Active
                    </span>
                </div>
            </div>

            <div className="absolute top-6 right-6 z-30 flex flex-col gap-2">
                <button className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer">
                    <span className="text-sm font-black">+</span>
                </button>
                <button className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer">
                    <span className="text-sm font-black">-</span>
                </button>
            </div>

            {/* Lab Markers */}
            <div className="absolute inset-0 z-10">
                {labs.map((lab) => {
                    const coords = getScreenCoords(lab.lat, lab.lng);
                    const isSelected = selectedLab?.id === lab.id;
                    const isHovered = hoveredLab?.id === lab.id;

                    return (
                        <motion.div
                            key={lab.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                top: `${coords.y}%`,
                                left: `${coords.x}%`
                            }}
                            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                            onMouseEnter={() => setHoveredLab(lab)}
                            onMouseLeave={() => setHoveredLab(null)}
                            onClick={() => onSelectLab(lab)}
                        >
                            <div className="relative cursor-pointer group/pin">
                                <motion.div
                                    animate={{
                                        scale: isSelected || isHovered ? 1.2 : 1,
                                        backgroundColor: isSelected ? 'rgba(0, 245, 255, 0.4)' : 'rgba(0, 245, 255, 0.2)'
                                    }}
                                    className="absolute inset-[-10px] blur-md rounded-full transition-colors"
                                />
                                <motion.div
                                    animate={{ rotate: isSelected ? 225 : 45 }}
                                    className={`relative w-10 h-10 bg-[#08555F] border-2 ${isSelected ? 'border-secondary' : 'border-electric-cyan'} rounded-xl flex items-center justify-center shadow-radical transition-all`}
                                >
                                    <MapPin className={`w-5 h-5 ${isSelected ? 'text-secondary' : 'text-electric-cyan'} -rotate-45 group-hover/pin:scale-110 transition-transform`} />
                                </motion.div>

                                {/* Tooltip */}
                                <AnimatePresence>
                                    {(isSelected || isHovered) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 bg-white/95 backdrop-blur-3xl rounded-2xl border border-primary/10 p-3 shadow-radical-sm z-50 overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-xl rounded-full" />
                                            <h4 className="text-[10px] font-black text-evergreen uppercase tracking-tighter leading-tight italic truncate">
                                                {lab.name}
                                            </h4>
                                            <p className="text-[8px] text-muted-gray uppercase tracking-widest font-bold opacity-60 mt-1 truncate">
                                                {lab.address}
                                            </p>
                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-primary/5">
                                                <span className="text-[8px] font-black text-primary uppercase">
                                                    {lab.distance?.toFixed(1)} KM
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
                                                    <span className="text-[7px] font-black text-emerald uppercase">Online</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Selected Lab Details Overlay */}
            <AnimatePresence>
                {selectedLab && (
                    <motion.div
                        initial={{ x: 340, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 340, opacity: 0 }}
                        className="absolute right-6 top-6 bottom-6 w-[300px] bg-white/95 backdrop-blur-3xl rounded-[2rem] border border-primary/10 shadow-radical-lg z-40 p-6 flex flex-col"
                    >
                        <button
                            onClick={() => onSelectLab(null)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-muted-gray hover:text-red-500 transition-all cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                                    <Info className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Node Protocol</span>
                                    <h3 className="text-2xl font-black text-evergreen uppercase tracking-tighter italic leading-none">
                                        {selectedLab.name}
                                    </h3>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-start gap-4 p-4 bg-primary/[0.02] border border-primary/5 rounded-2xl">
                                    <MapPin className="w-5 h-5 text-primary shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-muted-gray uppercase opacity-40">Location Coordinates</p>
                                        <p className="text-[10px] font-bold text-evergreen uppercase leading-relaxed">{selectedLab.address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-primary/[0.02] border border-primary/5 rounded-2xl">
                                    <Navigation className="w-5 h-5 text-secondary shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-muted-gray uppercase opacity-40">Proximity Buffer</p>
                                        <p className="text-[10px] font-black text-secondary uppercase italic">{selectedLab.distance?.toFixed(2)} Kilometers</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <p className="text-[9px] text-muted-gray uppercase tracking-widest font-bold opacity-60 leading-relaxed italic">
                                    This node is validated for high-fidelity data acquisition and medical synthesis operations.
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 space-y-3">
                            <button className="w-full py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-evergreen transition-all shadow-medical active:scale-95 flex items-center justify-center gap-3 cursor-pointer">
                                <Navigation className="w-4 h-4" />
                                GET DIRECTIONS
                            </button>
                            <button className="w-full py-4 bg-primary/5 border border-primary/10 text-evergreen rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:border-primary/20 transition-all flex items-center justify-center gap-3 cursor-pointer">
                                <ExternalLink className="w-4 h-4" />
                                NODE CONTEXT
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hint Overlay */}
            {!selectedLab && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-evergreen/90 backdrop-blur-md border border-white/10 px-6 py-2.5 rounded-full shadow-radical"
                    >
                        <span className="text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-4">
                            Select a node for deep context analysis
                        </span>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default LabMap;
