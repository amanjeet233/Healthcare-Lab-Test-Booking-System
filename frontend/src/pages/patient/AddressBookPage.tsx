import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, 
    Navigation, 
    Satellite,
    Map as MapIcon,
    Plus,
    Activity,
    Compass,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addressService, AddressDTO } from '../../services/addressService';
import { notify } from '../../utils/toast';
import AddressCard from '../../components/profile/AddressCard';
import AddressModal from '../../components/profile/AddressModal';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';

const LOCAL_ADDRESSES_KEY = 'healthlab.localAddresses';

const AddressBookPage: React.FC = () => {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState<AddressDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<AddressDTO | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const getLocalAddresses = (): AddressDTO[] => {
        try {
            const parsed = JSON.parse(localStorage.getItem(LOCAL_ADDRESSES_KEY) || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const persistLocalAddresses = (items: AddressDTO[]) => {
        localStorage.setItem(LOCAL_ADDRESSES_KEY, JSON.stringify(items));
    };

    const mergeAddresses = (server: AddressDTO[], local: AddressDTO[]) => {
        const merged = [...server];
        local.forEach((addr) => {
            if (!merged.some((s) => s.id === addr.id)) {
                merged.push(addr);
            }
        });
        return merged;
    };

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const local = getLocalAddresses();
            const data = await addressService.getAll().catch(() => []);
            setAddresses(mergeAddresses(data, local));
        } catch (error) {
            notify.error('Failed to load addresses.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleSave = async (address: AddressDTO) => {
        try {
            const saved = await addressService.save(address);
            notify.success(address.id ? 'Address updated.' : 'Address added.');
            const local = getLocalAddresses().filter((a) => a.id !== saved.id);
            persistLocalAddresses(local);
            await fetchAddresses();
            setIsModalOpen(false);
            setEditingAddress(null);
        } catch (error) {
            const localId = address.id ?? -Date.now();
            const localAddress: AddressDTO = { ...address, id: localId };
            const local = getLocalAddresses().filter((a) => a.id !== localId);
            persistLocalAddresses([localAddress, ...local]);
            setAddresses((prev) => {
                const withoutSame = prev.filter((a) => a.id !== localId);
                return [localAddress, ...withoutSame];
            });
            notify('Address saved locally.', { icon: '📍' });
            setIsModalOpen(false);
            setEditingAddress(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            if (id < 0) {
                const local = getLocalAddresses().filter((a) => a.id !== id);
                persistLocalAddresses(local);
                setAddresses((prev) => prev.filter((a) => a.id !== id));
                notify.success('Address deleted.');
                return;
            }
            await addressService.delete(id);
            notify.success('Address deleted.');
            const local = getLocalAddresses().filter((a) => a.id !== id);
            persistLocalAddresses(local);
            fetchAddresses();
        } catch (error) {
            notify.error('Failed to delete address.');
        }
    };

    const handleSetDefault = async (id: number) => {
        const address = addresses.find(a => a.id === id);
        if (address) {
            try {
                if (id < 0) {
                    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
                    setAddresses(updated);
                    persistLocalAddresses(updated.filter((a) => Number(a.id) < 0));
                    notify.success(`${address.label} set as default address.`);
                    return;
                }
                await addressService.save({ ...address, isDefault: true });
                notify.success(`${address.label} set as default address.`);
                fetchAddresses();
            } catch (error) {
                notify.error('Failed to update default address.');
            }
        }
    };

    const filteredAddresses = addresses.filter(addr => 
        addr.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        addr.street.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-[1200px] w-full mx-auto px-4 md:px-5 py-8 md:py-9 min-h-screen">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-1 px-4 py-1 rounded-full border border-[#b8cfdb] text-[#005f7b] text-[10px] font-black uppercase tracking-[0.16em] hover:bg-white/70"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Back
                        </button>
                        <nav className="inline-flex items-center text-[11px] font-black uppercase tracking-[0.14em]">
                            <span className="text-[#6f9fb3] cursor-pointer hover:text-[#5c8ea3]" onClick={() => navigate('/')}>Home</span>
                            <ChevronRight className="w-3.5 h-3.5 mx-1 text-[#a8c0cb]" />
                            <span className="text-[#005d79]">My Addresses</span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-2.5 mb-3">
                        <div className="p-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/20 shadow-sm">
                            <Satellite className="w-5 h-5 text-cyan-600" />
                        </div>
                        <span className="text-[clamp(0.62rem,0.58rem+0.16vw,0.72rem)] font-extrabold uppercase tracking-[0.16em] text-cyan-800/60">
                            Address / Book
                        </span>
                    </div>
                    <h1 className="text-[clamp(1.7rem,1.2rem+1.7vw,2.6rem)] font-black text-[#164E63] tracking-tight mb-2.5">
                        My <span className="text-cyan-600">Addresses</span>
                    </h1>
                    <p className="text-[clamp(0.84rem,0.8rem+0.3vw,1rem)] text-cyan-900/60 font-medium leading-relaxed">
                        Manage your saved sample collection addresses.
                    </p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <GlassButton 
                        onClick={() => { setEditingAddress(null); setIsModalOpen(true); }}
                        icon={<Plus size={18} />}
                    >
                        ADD ADDRESS
                    </GlassButton>
                </div>
            </header>

            <GlassCard className="mb-7 border-cyan-100/30">
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex-1 min-w-[250px]">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Search Address</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600/50" size={18} />
                            <input 
                                type="text"
                                placeholder="Search by label or street..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/50 border border-white/50 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-500/5 rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 px-5 py-3 bg-white/40 rounded-xl border border-white/60">
                        <div className="text-center">
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Saved</span>
                            <span className="text-[clamp(1.05rem,0.92rem+0.5vw,1.4rem)] font-black text-[#164E63] tracking-tight">{addresses.length}</span>
                        </div>
                        <div className="h-10 w-px bg-slate-200/50" />
                        <div className="text-center">
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Type</span>
                            <span className="text-[clamp(1.05rem,0.92rem+0.5vw,1.4rem)] font-black text-cyan-600 tracking-tight">GPS</span>
                        </div>
                        <div className="h-10 w-px bg-slate-200/50" />
                        <div className="text-center">
                            <Activity className="w-5 h-5 text-cyan-500 mx-auto" />
                            <span className="block text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">Active</span>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {loading ? (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-52 bg-white/40 rounded-[22px] animate-pulse border border-white/30" />
                    ))}
                </div>
            ) : (
                <AnimatePresence mode="popLayout">
                    {filteredAddresses.length > 0 ? (
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
                            {filteredAddresses.map((addr, index) => (
                                <motion.div
                                    key={addr.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <AddressCard
                                        address={addr}
                                        onEdit={(a) => { setEditingAddress(a); setIsModalOpen(true); }}
                                        onDelete={() => addr.id && handleDelete(addr.id)}
                                        onSetDefault={() => addr.id && handleSetDefault(addr.id)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-16 text-center glass-card bg-white/20 border-dashed border-2 border-slate-200 rounded-[24px]"
                        >
                             <div className="inline-flex p-5 bg-cyan-50 rounded-[24px] text-cyan-200 mb-5 border border-cyan-100/50">
                                 <Compass size={42} />
                             </div>
                             <h3 className="text-2xl font-black text-[#164E63] tracking-tight mb-2">No Addresses Found</h3>
                             <p className="text-sm text-slate-500 font-medium mb-7 max-w-sm mx-auto">You have not added any address yet.</p>
                             <GlassButton onClick={() => setIsModalOpen(true)}>ADD FIRST ADDRESS</GlassButton>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            <AddressModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingAddress(null); }}
                onSave={handleSave}
                initialData={editingAddress}
            />
        </div>
    );
};

export default AddressBookPage;
