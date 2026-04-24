import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, X, Phone, Mail, Calendar, User, Heart,
    Edit3, ShieldCheck, Fingerprint, MapPin
} from 'lucide-react';
import type { User as UserType } from '../../../types/auth';
import { userService } from '../../../services/userService';
import { notify } from '../../../utils/toast';

interface Props {
    user: UserType;
    onUpdate: () => void;
}

const formatDateForDisplay = (date: string) => {
    if (!date) return 'Not Provided';
    const [yyyy, mm, dd] = date.split('-');
    if (!yyyy || !mm || !dd) return date;
    return `${dd}/${mm}/${yyyy}`;
};

const PersonalInfoTab: React.FC<Props> = ({ user, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        dateOfBirth: user?.dateOfBirth || '',
        gender: user?.gender || '',
        bloodGroup: user?.bloodGroup || '',
        maritalStatus: user?.maritalStatus || ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        try {
            setIsSubmitting(true);
            await userService.updateProfile(formData);
            notify.success('Profile updated successfully.');
            setIsEditing(false);
            onUpdate();
        } catch (error) {
            notify.error('Failed to update profile.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Styles
    const labelStyle = "flex items-center gap-3 text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-1";
    const valueStyle = "text-lg font-semibold text-slate-800 transition-colors";
    const inputStyle = "w-full bg-transparent border-b-2 border-slate-200 py-1 text-lg font-semibold text-cyan-600 focus:border-cyan-500 focus:outline-none transition-all";
    const sectionHeader = "flex items-center gap-3 border-b border-slate-100 pb-3 mb-8";

    return (
        <div className="w-full">
            {/* Header: Simple & Professional */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                        <User className="h-9 w-9 text-slate-700" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Personal Profile</h2>
                        <p className="text-slate-500 font-medium">Manage your identity and contact information</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <AnimatePresence>
                        {isEditing && (
                            <motion.button
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                onClick={() => setIsEditing(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all flex items-center gap-2"
                            >
                                <X className="h-5 w-5" /> Cancel
                            </motion.button>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                        disabled={isSubmitting}
                        className={`px-7 py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2 ${isEditing
                                ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        {isSubmitting ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        ) : isEditing ? <Save className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
                        {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
                    </button>
                </div>
            </div>

            {/* Grid: 2 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-10">

                {/* Basic Information */}
                <div>
                    <div className={sectionHeader}>
                        <Fingerprint className="h-5 w-5 text-cyan-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Basic Information</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div>
                            <label className={labelStyle}>First Name</label>
                            {isEditing ? (
                                <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className={inputStyle} />
                            ) : (
                                <div className={valueStyle}>{formData.firstName || '—'}</div>
                            )}
                        </div>
                        <div>
                            <label className={labelStyle}>Last Name</label>
                            {isEditing ? (
                                <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className={inputStyle} />
                            ) : (
                                <div className={valueStyle}>{formData.lastName || '—'}</div>
                            )}
                        </div>
                    </div>

                    <div className={sectionHeader}>
                        <Mail className="h-5 w-5 text-cyan-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Contact Details</span>
                    </div>
                    <div className="space-y-8">
                        <div>
                            <label className={labelStyle}>Email Address</label>
                            <div className="text-lg font-semibold text-slate-800">{user.email}</div>
                        </div>
                        <div>
                            <label className={labelStyle}>Phone Number</label>
                            {isEditing ? (
                                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputStyle} />
                            ) : (
                                <div className={valueStyle}>{formData.phone || '—'}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Health & Personal Registry */}
                <div className="bg-slate-50/40 p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <div className={sectionHeader}>
                        <Heart className="h-5 w-5 text-rose-500" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Health & Personal</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                        <div>
                            <label className={labelStyle}>Date of Birth</label>
                            {isEditing ? (
                                <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className={inputStyle} />
                            ) : (
                                <div className={valueStyle}>{formatDateForDisplay(formData.dateOfBirth)}</div>
                            )}
                        </div>

                        <div>
                            <label className={labelStyle}>Blood Type</label>
                            {isEditing ? (
                                <select value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} className={inputStyle}>
                                    <option value="">Select</option>
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                </select>
                            ) : (
                                <div className={`${valueStyle} text-rose-600`}>{formData.bloodGroup || 'Not set'}</div>
                            )}
                        </div>

                        <div>
                            <label className={labelStyle}>Gender</label>
                            {isEditing ? (
                                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className={inputStyle}>
                                    <option value="">Select</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            ) : (
                                <div className={valueStyle}>{formData.gender || 'Not set'}</div>
                            )}
                        </div>

                        <div>
                            <label className={labelStyle}>Marital Status</label>
                            {isEditing ? (
                                <select value={formData.maritalStatus} onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })} className={inputStyle}>
                                    <option value="">Select</option>
                                    <option value="SINGLE">Single</option>
                                    <option value="MARRIED">Married</option>
                                    <option value="DIVORCED">Divorced</option>
                                </select>
                            ) : (
                                <div className={valueStyle}>{formData.maritalStatus || 'Not set'}</div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PersonalInfoTab;