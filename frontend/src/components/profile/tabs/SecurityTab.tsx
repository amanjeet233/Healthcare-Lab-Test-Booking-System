import React, { useState } from 'react';
import { ShieldCheck, Lock, Bell, Smartphone, Mail, Save, AlertCircle, ShieldAlert } from 'lucide-react';
import type { User as UserType } from '../../../types/auth';
import { userService } from '../../../services/userService';
import { notify } from '../../../utils/toast';

interface Props {
    user: UserType;
    onUpdate: () => void;
}

const SecurityTab: React.FC<Props> = ({ user, onUpdate }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [settings, setSettings] = useState({
        notificationsEnabled: user.notificationsEnabled ?? true,
        whatsappNotifications: user.whatsappNotifications ?? false,
        marketingEmails: user.marketingEmails ?? false
    });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            notify.error('Protocol mismatch: Passwords do not align.');
            return;
        }

        try {
            setIsSubmitting(true);
            await userService.changePassword({
                oldPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            notify.success('Security protocol authorized: Password synchronized.');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            notify.error('Access denied: Authentication sequence failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleSetting = async (field: keyof typeof settings) => {
        const newSettings = { ...settings, [field]: !settings[field] };
        setSettings(newSettings);
        try {
            await userService.updateSettings({
                notifications: {
                    emailNotifications: newSettings.notificationsEnabled,
                    whatsappNotifications: newSettings.whatsappNotifications,
                    marketingEmails: newSettings.marketingEmails
                }
            });
            notify.success('Communication node updated.');
            onUpdate();
        } catch (error) {
            notify.error('Node synchronization failed.');
            setSettings(settings); // Revert
        }
    };

    return (
        <div className="tab-pane-glass">
            <div className="pane-header">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm">
                        <ShieldAlert className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                        <h2>Security Protocols</h2>
                        <p>Manage access keys and communication nodes</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Level 3 Clearance</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Credentials Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="security-vault-section !mb-0">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                            <Lock className="w-5 h-5 text-cyan-600" />
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Authentication Override</h3>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-8">
                            <div className="form-group-glass">
                                <label>Current Access Key</label>
                                <input
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                />
                                <span className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wider">Required for verification sequence</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-group-glass">
                                    <label>New Access Key</label>
                                    <input
                                        type="password"
                                        placeholder="Min 8 characters"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    />
                                </div>
                                <div className="form-group-glass">
                                    <label>Confirm Sequence</label>
                                    <input
                                        type="password"
                                        placeholder="Repeat new key"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="action-btn-primary w-full md:w-auto mt-4"
                                disabled={isSubmitting || !passwordData.newPassword}
                            >
                                {isSubmitting ? (
                                    <div className="btn-spinner"></div>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Update Credentials</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="p-5 bg-cyan-50/30 border border-cyan-100 rounded-[1.2rem] flex gap-4">
                        <AlertCircle className="w-6 h-6 text-cyan-600 shrink-0" />
                        <div>
                            <h4 className="text-[11px] font-black text-cyan-800 uppercase tracking-widest mb-2">Security Intelligence</h4>
                            <p className="text-[12px] text-cyan-700 font-medium leading-relaxed">
                                Rotate your primary access key every 90 diagnostic cycles for maximum data integrity. Avoid using predictable sequences.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Nodes Section */}
                <div className="space-y-6">
                    <div className="security-vault-section !mb-0">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                            <Bell className="w-5 h-5 text-cyan-600" />
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Data Feeds</h3>
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center border border-cyan-100">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.1em]">Email Node</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reports & Results</p>
                                    </div>
                                </div>
                                <button
                                    className={`w-12 h-6 rounded-full transition-all relative ${settings.notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                    onClick={() => handleToggleSetting('notificationsEnabled')}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.notificationsEnabled ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                                        <Smartphone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.1em]">WhatsApp</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Instant Alerts</p>
                                    </div>
                                </div>
                                <button
                                    className={`w-12 h-6 rounded-full transition-all relative ${settings.whatsappNotifications ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                    onClick={() => handleToggleSetting('whatsappNotifications')}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.whatsappNotifications ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityTab;
