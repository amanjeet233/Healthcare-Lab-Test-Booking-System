import React, { useState, useEffect } from 'react';
import { X, MapPin, Building, Home, CheckCircle2, ShieldCheck } from 'lucide-react';
import { AddressDTO } from '../../services/addressService';

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (address: AddressDTO) => Promise<void>;
    initialData?: AddressDTO | null;
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState<AddressDTO>({
        label: 'Home',
        street: '',
        city: '',
        state: '',
        country: 'India',
        postalCode: '',
        isDefault: false
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    label: 'Home',
                    street: '',
                    city: '',
                    state: '',
                    country: 'India',
                    postalCode: '',
                    isDefault: false
                });
            }
            setErrors({});
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.label) newErrors.label = 'Label is required';
        if (!formData.street) newErrors.street = 'Street details are required';
        if (!formData.postalCode) newErrors.postalCode = 'Postal code is required';
        else if (!/^\d{6}$/.test(formData.postalCode)) newErrors.postalCode = 'Invalid 6-digit code';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving address:', error);
        } finally {
            setLoading(false);
        }
    };

    const labels = [
        { id: 'Home', icon: Home },
        { id: 'Office', icon: Building },
        { id: 'Other', icon: MapPin }
    ];

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-3 md:p-4">
            <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative w-full max-w-xl bg-white/96 rounded-4xl shadow-[0_28px_90px_rgba(15,23,42,0.20)] border border-white/70 overflow-hidden animate-zoomIn max-h-[92vh] flex flex-col">
                <div className="p-4 md:p-5 overflow-y-auto">
                    <div className="flex justify-between items-start gap-4 mb-4 pb-4 border-b border-slate-100">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700/60 mb-1">Popup Form</p>
                            <h2 className="text-[clamp(1.35rem,1rem+1vw,1.8rem)] font-black text-slate-900 tracking-tight">
                                {initialData ? 'Edit Address' : 'Add New Address'}
                            </h2>
                            <p className="text-sm text-slate-500">Configure your shipping coordinates</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-all">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-4.5">
                        <div className="grid grid-cols-3 gap-2.5 md:gap-3">
                            {labels.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, label: item.id })}
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-2xl border-2 transition-all ${formData.label === item.id
                                        ? 'border-cyan-600 bg-cyan-50 text-cyan-700 shadow-sm'
                                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                >
                                    <item.icon size={18} />
                                    <span className="text-sm font-semibold">{item.id}</span>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.22em]">Street / Locality</label>
                            <textarea
                                value={formData.street}
                                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                placeholder="House no, Building, Street..."
                                rows={2}
                                className={`w-full px-4 py-2.5 bg-slate-50 border-2 rounded-2xl focus:outline-none focus:border-cyan-500 transition-all font-medium text-slate-900 text-sm ${errors.street ? 'border-red-500' : 'border-slate-200'}`}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.22em]">City</label>
                                <input
                                    type="text"
                                    value={formData.city || ''}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-cyan-500 transition-all font-medium text-slate-900 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.22em]">Postal Code</label>
                                <input
                                    type="text"
                                    value={formData.postalCode || ''}
                                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                    className={`w-full px-4 py-2.5 bg-slate-50 border-2 rounded-2xl focus:outline-none focus:border-cyan-500 transition-all font-medium text-slate-900 text-sm ${errors.postalCode ? 'border-red-500' : 'border-slate-200'}`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.22em]">State</label>
                                <input
                                    type="text"
                                    value={formData.state || ''}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-cyan-500 transition-all font-medium text-slate-900 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.22em]">Country</label>
                                <input
                                    type="text"
                                    value={formData.country || 'India'}
                                    disabled
                                    className="w-full px-4 py-2.5 bg-slate-100 border-2 border-slate-200 rounded-2xl font-medium text-slate-400 text-sm cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <label className={`flex items-center justify-between p-3.5 border-2 rounded-2xl cursor-pointer transition-all ${formData.isDefault ? 'border-emerald-500 bg-emerald-50' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${formData.isDefault ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                    <CheckCircle2 size={18} />
                                </div>
                                <span className="text-sm font-semibold text-slate-900">Set as Primary</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="w-5 h-5 text-emerald-600 rounded border-gray-300"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-linear-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:from-cyan-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <ShieldCheck className="w-5 h-5" />
                            {loading ? 'Saving...' : initialData ? 'Update Address' : 'Save Address'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddressModal;
