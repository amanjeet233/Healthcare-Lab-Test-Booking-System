import React, { useState } from 'react';
import { MapPin, Plus, Navigation, LocateFixed } from 'lucide-react';
import type { User as UserType, Address } from '../../../types/auth';
import { addressService } from '../../../services/addressService';
import { notify } from '../../../utils/toast';
import AddressCard from '../AddressCard';
import AddressModal from '../AddressModal';

interface Props {
    user: UserType;
    onUpdate: () => void;
}

const AddressTab: React.FC<Props> = ({ user, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const handleSave = async (address: any) => {
        try {
            await addressService.save(address);
            notify.success(address.id ? 'Address updated.' : 'Address added.');
            onUpdate();
        } catch (error) {
            notify.error('Failed to save address.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this address?')) return;
        try {
            await addressService.delete(id);
            notify.success('Address deleted.');
            onUpdate();
        } catch (error) {
            notify.error('Failed to delete address.');
        }
    };

    const handleSetDefault = async (id: number) => {
        const address = user.addresses?.find(a => a.id === id);
        if (address) {
            try {
                await addressService.save({ ...address, isDefault: true });
                notify.success(`"${address.label}" set as primary.`);
                onUpdate();
            } catch (error) {
                notify.error('Failed to update primary status.');
            }
        }
    };

    return (
        <div className="tab-pane-glass">
            <div className="pane-header">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm">
                        <MapPin className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                        <h2>Addresses</h2>
                        <p>Manage your saved sample collection addresses</p>
                    </div>
                </div>
                <button
                    className="action-btn-primary"
                    onClick={() => { setEditingAddress(null); setIsModalOpen(true); }}
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Address</span>
                </button>
            </div>

            <div className="min-h-[320px]">
                {user.addresses && user.addresses.length > 0 ? (
                    <div className="inventory-grid">
                        {user.addresses.map(addr => (
                            <AddressCard
                                key={addr.id}
                                address={addr}
                                onEdit={(a) => { setEditingAddress(a as Address); setIsModalOpen(true); }}
                                onDelete={handleDelete}
                                onSetDefault={handleSetDefault}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty-node-state">
                        <div className="relative mb-6">
                            <Navigation className="empty-node-icon !mb-0" />
                            <LocateFixed className="w-8 h-8 text-emerald-500 absolute -top-2 -right-2 bg-white rounded-full p-1 border-2 border-slate-50" />
                        </div>
                        <h3>No Addresses Found</h3>
                        <p>Add your first address to use home sample collection.</p>
                        <button className="action-btn-secondary" onClick={() => setIsModalOpen(true)}>
                            <Plus className="w-4 h-4" />
                            <span>Add First Address</span>
                        </button>
                    </div>
                )}
            </div>

            <AddressModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingAddress(null); }}
                onSave={handleSave}
                initialData={editingAddress as any}
            />
        </div>
    );
};

export default AddressTab;
