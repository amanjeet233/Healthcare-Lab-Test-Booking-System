import React, { useState } from 'react';
import {
    Save, Phone, Calendar, Heart, Edit3,
    ShieldAlert, Fingerprint, Activity, Scale, Ruler
} from 'lucide-react';
import type { User as UserType } from '../../../types/auth';
import { userService } from '../../../services/userService';
import { notify } from '../../../utils/toast';

interface Props {
    user: UserType;
    onUpdate: () => void;
}

const HealthcareTab: React.FC<Props> = ({ user, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        medicalHistory: user.medicalHistory || {
            pastSurgeries: '',
            familyHistory: '',
            chronicDiseases: [] as string[]
        },
        emergencyContact: user.emergencyContact || {
            name: '',
            relation: '',
            phone: '',
            address: ''
        }
    });

    const handleSave = async () => {
        try {
            setIsSubmitting(true);
            await userService.updateProfile({
                // @ts-ignore
                medicalHistory: formData.medicalHistory,
                // @ts-ignore
                emergencyContact: formData.emergencyContact
            });
            notify.success('Medical profile synchronized.');
            setIsEditing(false);
            onUpdate();
        } catch (error) {
            notify.error('Failed to sync data.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const labelStyle = "text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5 block";
    const emergencyLabel = "text-[9px] font-black uppercase tracking-[0.16em] text-rose-400/90";
    const emergencyValue = "text-[0.98rem] font-bold text-rose-900 leading-tight";
    const emergencyInput = "w-full bg-transparent border-b border-rose-200 py-1 text-[0.96rem] font-semibold text-rose-900 focus:border-rose-500 outline-none transition-all";

    return (
        <div className="w-full animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                        <Activity className="h-7 w-7 text-cyan-600" />
                    </div>
                    <div>
                        <h2 className="text-[1.95rem] font-black text-slate-900 tracking-tight leading-none">Medical Overview</h2>
                        <p className="text-slate-500 font-medium mt-1.5">Manage clinical records and emergency protocols</p>
                    </div>
                </div>

                <button
                    onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                    disabled={isSubmitting}
                    className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2.5 shadow-lg ${isEditing ? 'bg-slate-900 text-white' : 'bg-cyan-600 text-white hover:bg-cyan-700'
                        }`}
                >
                    {isSubmitting ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" /> : isEditing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                    <span>{isSubmitting ? 'Syncing...' : isEditing ? 'Save Health' : 'Edit Health'}</span>
                </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Weight', val: '72.4', unit: 'KG', icon: Scale, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                    { label: 'Height', val: '178.5', unit: 'CM', icon: Ruler, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Blood Group', val: user.bloodGroup || 'O+', unit: '', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Age', val: '28', unit: 'Yrs', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' }
                ].map((m) => (
                    <div key={m.label} className="rounded-2xl border border-slate-100 bg-white p-4">
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <div className={`p-1.5 rounded-lg ${m.bg} ${m.color}`}><m.icon className="h-3.5 w-3.5" /></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{m.label}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-[2rem] font-black text-slate-800 leading-none">{m.val}</span>
                            <span className={`text-[10px] font-bold ${m.color}`}>{m.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] gap-6 lg:gap-7">
                {/* Clinical History */}
                <div className="space-y-8">
                    <section>
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-5">
                            <ShieldAlert className="h-5 w-5 text-cyan-600" />
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Clinical History</span>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className={labelStyle}>Chronic Conditions</label>
                                <div className="flex flex-wrap gap-2">
                                    {formData.medicalHistory.chronicDiseases?.length > 0 ? (
                                        formData.medicalHistory.chronicDiseases.map((d, i) => (
                                            <span key={i} className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold">{d}</span>
                                        ))
                                    ) : (
                                        <p className="text-slate-400 font-bold">No records found.</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className={labelStyle}>Surgical History</label>
                                {isEditing ? (
                                    <textarea
                                        rows={3}
                                        value={formData.medicalHistory.pastSurgeries}
                                        onChange={(e) => setFormData({ ...formData, medicalHistory: { ...formData.medicalHistory, pastSurgeries: e.target.value } })}
                                        className="w-full rounded-xl bg-slate-50 border-2 border-slate-100 p-3 text-sm font-semibold outline-none focus:border-cyan-500 transition-all"
                                    />
                                ) : (
                                    <p className="text-[1.1rem] font-bold text-slate-800 leading-snug">{formData.medicalHistory.pastSurgeries || 'No clinical events recorded.'}</p>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Emergency Protocol */}
                <div>
                    <div className="rounded-[2rem] bg-rose-50/45 border border-rose-100 p-4.5 md:p-5 w-full">
                        <div className="flex items-center gap-3 pb-4 border-b border-rose-200/60">
                            <ShieldAlert className="h-5 w-5 text-rose-600" />
                            <span className="text-[0.85rem] font-black uppercase tracking-[0.15em] text-rose-900">Emergency Protocol</span>
                        </div>

                        <div className="mt-3 divide-y divide-rose-100">
                            <div className="py-3">
                                <p className={emergencyLabel}>Primary Contact</p>
                                {isEditing ? (
                                    <input type="text" value={formData.emergencyContact.name} onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, name: e.target.value } })} className={emergencyInput} />
                                ) : (
                                    <p className={emergencyValue}>{formData.emergencyContact.name || '---'}</p>
                                )}
                            </div>

                            <div className="py-3">
                                <p className={emergencyLabel}>Relationship</p>
                                {isEditing ? (
                                    <input type="text" value={formData.emergencyContact.relation} onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, relation: e.target.value } })} className={emergencyInput} />
                                ) : (
                                    <p className={emergencyValue}>{formData.emergencyContact.relation || '---'}</p>
                                )}
                            </div>

                            <div className="py-3">
                                <p className={emergencyLabel}>Emergency Line</p>
                                {isEditing ? (
                                    <input type="text" value={formData.emergencyContact.phone} onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, phone: e.target.value } })} className={emergencyInput} />
                                ) : (
                                    <div className="flex items-center gap-2 text-[0.98rem] font-bold text-rose-900 leading-tight">
                                        <Phone className="h-4 w-4 text-rose-500" />
                                        <span>{formData.emergencyContact.phone || '---'}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 p-3.5 bg-white rounded-xl border border-rose-100 shadow-sm flex items-start gap-3 w-full">
                            <Fingerprint className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                            <p className="text-[0.76rem] font-semibold leading-relaxed text-rose-700 text-left">
                                Legal Authorization: Bio-crisis decision management active for this entity.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthcareTab;
