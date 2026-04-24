import React from 'react';
import { Home, Building, MapPin, Trash2, Edit3, CheckCircle, Navigation } from 'lucide-react';
import { AddressDTO } from '../../services/addressService';
import GlassCard from '../common/GlassCard';

interface AddressCardProps {
    address: AddressDTO;
    onEdit: (address: AddressDTO) => void;
    onDelete: (id: number) => void;
    onSetDefault?: (id: number) => void;
}

const AddressCard: React.FC<AddressCardProps> = ({ address, onEdit, onDelete, onSetDefault }) => {
    const getIcon = (label: string) => {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes('home')) return <Home className="w-5 h-5" />;
        if (lowerLabel.includes('office') || lowerLabel.includes('work')) return <Building className="w-5 h-5" />;
        return <MapPin className="w-5 h-5" />;
    };

    return (
        <GlassCard className="relative group hover:border-cyan-400/50 transition-all duration-500 !p-0 overflow-hidden">
            {/* Accent Gradient */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-gradient-to-tr from-cyan-600 to-teal-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:rotate-6 transition-transform">
                            {getIcon(address.label)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{address.label}</h3>
                                {address.isDefault && (
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                )}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Deployment Node</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(address)}
                            className="p-3 bg-white/50 hover:bg-cyan-600 hover:text-white rounded-xl transition-all border border-white/80 text-slate-400"
                            title="Edit Node"
                        >
                            <Edit3 size={16} />
                        </button>
                        <button
                            onClick={() => address.id && onDelete(address.id)}
                            className="p-3 bg-white/50 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-white/80 text-slate-400"
                            title="Purge Node"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 p-1 bg-cyan-50 rounded-lg">
                            <Navigation className="w-4 h-4 text-cyan-500" />
                        </div>
                        <p className="text-xs font-bold text-slate-600 leading-relaxed uppercase tracking-wider">
                            {address.street}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/40 rounded-2xl border border-white/60">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Postal Map</p>
                            <p className="text-xs font-black text-slate-800 tracking-tighter">{address.postalCode}</p>
                        </div>
                        <div className="p-4 bg-white/40 rounded-2xl border border-white/60">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Sector</p>
                            <p className="text-xs font-black text-slate-800 tracking-tighter">{address.city || 'Standard'}</p>
                        </div>
                    </div>
                </div>

                {onSetDefault && !address.isDefault && (
                    <button
                        onClick={() => address.id && onSetDefault(address.id)}
                        className="w-full mt-6 py-4 bg-white/60 hover:bg-cyan-50 text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] rounded-2xl border border-cyan-100 transition-all opacity-0 group-hover:opacity-100"
                    >
                        INITIALIZE PRIMARY
                    </button>
                )}

                {address.isDefault && (
                    <div className="mt-6 py-3 bg-emerald-50/50 flex items-center justify-center gap-2 rounded-2xl border border-emerald-100/50">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Baseline</span>
                    </div>
                )}
            </div>
        </GlassCard>
    );
};

export default AddressCard;
