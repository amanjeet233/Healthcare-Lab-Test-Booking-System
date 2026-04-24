import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Navigation, List, Map as MapIcon, Globe, ArrowRight } from 'lucide-react';
import { locationService, type LabLocation } from '../../services/locationService';
import LabCard from './LabCard';
import LabMap from './LabMap';
import { notify } from '../../utils/toast';

const NearbyLabsSection: React.FC = () => {
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [labs, setLabs] = useState<LabLocation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchCity, setSearchCity] = useState('');
    const [selectedLab, setSelectedLab] = useState<LabLocation | null>(null);

    // Initial load: Try to detect user location silently
    useEffect(() => {
        handleDetectLocation(true);
    }, []);

    const handleDetectLocation = async (isSilent: boolean = false) => {
        setIsLoading(true);
        try {
            const coords = await locationService.getCurrentLocation();
            const nearbyLabs = await locationService.getNearbyLabs(coords.lat, coords.lng);
            setLabs(nearbyLabs);
            if (!isSilent) notify.success('Geolocation synchronized.');
        } catch (error: any) {
            console.warn('Geolocation failed:', error.message);
            if (!isSilent) notify.error('Location detection failed. Defaulting to Central Node.');
            // Fallback to NY center
            const fallbackLabs = await locationService.getNearbyLabs(40.7128, -74.0060);
            setLabs(fallbackLabs);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchCity.trim()) return;

        setIsLoading(true);
        try {
            const results = await locationService.searchLabsByCity(searchCity);
            setLabs(results);
            if (results.length > 0) {
                notify.success(`Found ${results.length} nodes in ${searchCity}`);
            } else {
                notify.error('No labs found in this sector.');
            }
        } catch (error) {
            notify.error('Search failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section id="nearby-labs" className="py-24 space-y-16">
            {/* Section Header */}
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-end gap-8">
                <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Synthesized Mapping</span>
                    <h2 className="text-4xl md:text-5xl font-black text-evergreen uppercase tracking-tighter italic leading-none">
                        Nearby <span className="text-secondary">Lab Nodes</span>
                    </h2>
                    <p className="text-sm text-muted-gray max-w-xl leading-relaxed uppercase tracking-wider font-bold opacity-70">
                        Synchronize your current coordinates with our decentralized laboratory synthesis infrastructure.
                    </p>
                </div>

                {/* View Toggles */}
                <div className="flex bg-primary/5 rounded-[1.5rem] border border-primary/10 p-1.5 shadow-inner-glow">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${viewMode === 'list' ? 'bg-primary text-white shadow-medical' : 'text-muted-gray hover:text-evergreen'
                            }`}
                    >
                        <List className="w-3.5 h-3.5" />
                        List View
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${viewMode === 'map' ? 'bg-primary text-white shadow-medical' : 'text-muted-gray hover:text-evergreen'
                            }`}
                    >
                        <MapIcon className="w-3.5 h-3.5" />
                        Node Map
                    </button>
                </div>
            </div>

            {/* Interface Controls */}
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* City Search */}
                    <form onSubmit={handleSearch} className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH BY CITY OR SECTORCODE..."
                            value={searchCity}
                            onChange={(e) => setSearchCity(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-white border-2 border-primary/5 rounded-[2rem] text-xs font-black text-evergreen uppercase tracking-widest outline-none focus:border-primary/20 transition-all shadow-radical-sm"
                        />
                        <button
                            type="submit"
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-white p-3 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    {/* Quick Geolocation */}
                    <button
                        onClick={() => handleDetectLocation(false)}
                        className="px-10 py-5 bg-white border-2 border-primary/5 rounded-[2rem] text-[10px] font-black text-primary uppercase tracking-widest hover:border-primary/20 transition-all shadow-radical-sm flex items-center justify-center gap-4 group cursor-pointer"
                    >
                        <Navigation className="w-4 h-4 group-hover:animate-pulse" />
                        Sync Current Geolocation
                    </button>
                </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="max-w-7xl mx-auto px-6 min-h-[500px]">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-[500px] flex flex-col items-center justify-center space-y-6"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full"
                                />
                                <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-6 h-6 animate-pulse" />
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">
                                Acquiring Satellite Context...
                            </span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={viewMode}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="h-full"
                        >
                            {viewMode === 'list' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {labs.length > 0 ? (
                                        labs.map((lab) => (
                                            <LabCard
                                                key={lab.id}
                                                lab={lab}
                                                onViewOnMap={(lab) => {
                                                    setSelectedLab(lab);
                                                    setViewMode('map');
                                                }}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-full h-[400px] flex flex-col items-center justify-center space-y-6 bg-white/40 border-2 border-dashed border-primary/10 rounded-[4rem]">
                                            <MapPin className="w-16 h-16 text-primary/10" />
                                            <div className="text-center">
                                                <h4 className="text-xl font-black text-evergreen uppercase tracking-widest opacity-30 italic">No nodes detected</h4>
                                                <p className="text-[10px] font-bold text-muted-gray uppercase tracking-[0.2em] opacity-40 mt-2">Adjust search parameters or radius</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <LabMap
                                    labs={labs}
                                    selectedLab={selectedLab}
                                    onSelectLab={setSelectedLab}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Summary */}
            <div className="max-w-7xl mx-auto px-6 flex justify-center">
                <div className="bg-white/60 backdrop-blur-xl border border-primary/5 px-10 py-5 rounded-[2rem] flex items-center gap-8 shadow-inner-glow">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-evergreen leading-none">{labs.length}</span>
                        <span className="text-[8px] font-black text-muted-gray uppercase tracking-widest opacity-40">Active Nodes</span>
                    </div>
                    <div className="w-px h-10 bg-primary/10" />
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-emerald leading-none">100%</span>
                        <span className="text-[8px] font-black text-muted-gray uppercase tracking-widest opacity-40">Data Fidelity</span>
                    </div>
                </div>
            </div>
        </section >
    );
};

export default NearbyLabsSection;
