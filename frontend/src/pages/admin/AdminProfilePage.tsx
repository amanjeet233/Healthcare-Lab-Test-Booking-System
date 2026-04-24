import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, ShieldCheck, User, Mail, Save, KeyRound, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { adminService, type SystemStats } from '../../services/adminService';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';

type AdminProfile = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
};

type ChangePasswordForm = {
  currentPassword: string;
  newPassword: string;
};

const unwrapData = <T,>(response: any, fallback: T): T => {
  if (response?.data?.data !== undefined) return response.data.data as T;
  if (response?.data !== undefined) return response.data as T;
  return fallback;
};

const normalizeProfile = (raw: any): AdminProfile => {
  const source = raw?.user ?? raw ?? {};
  return {
    id: source.id,
    name: source.name || '',
    email: source.email || '',
    role: source.role || 'ADMIN'
  };
};

const AdminProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);

  const [profileForm, setProfileForm] = useState({ name: '' });
  const [passwordForm, setPasswordForm] = useState<ChangePasswordForm>({ currentPassword: '', newPassword: '' });

  const [settingsForm, setSettingsForm] = useState({
    defaultSlotDuration: '30',
    homeCollectionCharge: '150',
    labName: 'Healthcare Lab',
    labContact: 'support@healthcarelab.com'
  });

  const roleLabel = useMemo(() => 'SYSTEM ADMIN', []);

  const loadPageData = async () => {
    setLoading(true);
    try {
      const [profileRes, statsRes] = await Promise.all([
        api.get('/api/users/profile'),
        adminService.getSystemStats().catch(() => null)
      ]);

      const profileData = normalizeProfile(unwrapData<any>(profileRes, {}));
      setProfile(profileData);
      setProfileForm({ name: profileData.name || '' });
      setStats(statsRes);
    } catch {
      toast.error('Failed to load admin profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSavingProfile(true);
    try {
      const response = await api.put('/api/users/profile', { name: profileForm.name.trim() });
      const updated = normalizeProfile(unwrapData<any>(response, {}));
      setProfile((prev) => ({ ...(prev || {}), ...updated }));
      toast.success('Admin profile updated');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Both password fields are required');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      await api.post('/api/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '' });
      toast.success('Password changed successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSettingsPlaceholder = (e: React.FormEvent) => {
    e.preventDefault();
    toast('System settings persistence will be added in next phase.', { icon: '⚙️' });
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cyan-800/60 font-black text-[10px] uppercase tracking-widest">Loading admin profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 md:px-5 py-8 md:py-9 min-h-screen">
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-800/50 mb-4">
          <span>Home</span>
          <ChevronRight size={12} className="text-cyan-700/40" />
          <span>Admin Profile</span>
        </div>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 bg-cyan-500/10 backdrop-blur-md rounded-xl border border-cyan-500/20 shadow-sm">
            <User className="w-5 h-5 text-cyan-600" />
          </div>
          <span className="text-[clamp(0.62rem,0.58rem+0.16vw,0.72rem)] font-black uppercase tracking-[0.18em] text-cyan-800/60">
            ADMIN CONTROL
          </span>
        </div>
        <h1 className="text-[clamp(1.7rem,1.2rem+1.7vw,2.7rem)] font-black text-[#164E63] tracking-tight mb-2.5">
          System <span className="text-cyan-600">Admin Profile</span>
        </h1>
        <p className="text-[clamp(0.84rem,0.8rem+0.3vw,1rem)] text-cyan-900/60 font-medium leading-relaxed">
          Manage identity, monitor platform metrics, and control security essentials.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <aside className="lg:col-span-4 space-y-4">
          <GlassCard className="border-cyan-100/40">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#164E63] text-white flex items-center justify-center text-lg font-black">
                  {(profile?.name?.[0] || 'A').toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800 tracking-tight">{profile?.name || 'Admin'}</h2>
                  <p className="text-xs text-cyan-700/70 font-semibold">{profile?.email || '-'}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Mail size={15} className="text-cyan-600" />
                  <span>{profile?.email || '-'}</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-100">
                <ShieldCheck size={14} />
                <span className="text-[11px] font-black tracking-widest uppercase">{roleLabel}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="border-cyan-100/40">
            <div className="flex items-center gap-2 mb-3">
              <Settings size={16} className="text-cyan-600" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Platform Stats</h3>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              <div className="rounded-xl bg-white/70 border border-cyan-100 p-3">
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-black">Total Users</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalUsers ?? 0}</p>
              </div>
              <div className="rounded-xl bg-white/70 border border-cyan-100 p-3">
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-black">Total Bookings</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{stats?.totalBookings ?? 0}</p>
              </div>
              <div className="rounded-xl bg-white/70 border border-cyan-100 p-3">
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-black">Pending Bookings</p>
                <p className="text-2xl font-black text-cyan-700 mt-1">{stats?.pendingBookings ?? 0}</p>
              </div>
            </div>
          </GlassCard>
        </aside>

        <main className="lg:col-span-8 space-y-5">
          <GlassCard className="border-cyan-100/40">
            <div className="mb-4">
              <h3 className="text-lg font-black text-[#164E63] tracking-tight">Admin Identity</h3>
              <p className="text-sm text-slate-500">Update administrator display name.</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Name</label>
                <input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-cyan-100 bg-white/60 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email</label>
                <input
                  value={profile?.email || ''}
                  disabled
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-400"
                />
              </div>

              <div className="md:col-span-2">
                <GlassButton type="submit" disabled={savingProfile} icon={<Save size={15} />} className="px-6 py-3">
                  {savingProfile ? 'Saving...' : 'Save Identity'}
                </GlassButton>
              </div>
            </form>
          </GlassCard>

          <GlassCard className="border-cyan-100/40">
            <div className="mb-4 flex items-center gap-2">
              <KeyRound size={16} className="text-cyan-600" />
              <div>
                <h3 className="text-lg font-black text-[#164E63] tracking-tight">Change Password</h3>
                <p className="text-sm text-slate-500">Update admin credentials securely.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full rounded-xl border border-cyan-100 bg-white/60 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400"
                  placeholder="Current password"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full rounded-xl border border-cyan-100 bg-white/60 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400"
                  placeholder="New password"
                />
              </div>

              <div className="md:col-span-2">
                <GlassButton type="submit" disabled={changingPassword} icon={<KeyRound size={15} />} className="px-6 py-3">
                  {changingPassword ? 'Changing...' : 'Update Password'}
                </GlassButton>
              </div>
            </form>
          </GlassCard>

          <GlassCard className="border-cyan-100/40">
            <div className="mb-4 flex items-center gap-2">
              <Settings size={16} className="text-cyan-600" />
              <div>
                <h3 className="text-lg font-black text-[#164E63] tracking-tight">System Settings (Placeholder)</h3>
                <p className="text-sm text-slate-500">Future-configurable global platform defaults.</p>
              </div>
            </div>

            <form onSubmit={handleSettingsPlaceholder} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Default Slot Duration (min)</label>
                <input
                  value={settingsForm.defaultSlotDuration}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, defaultSlotDuration: e.target.value }))}
                  className="w-full rounded-xl border border-cyan-100 bg-white/60 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Home Collection Charge</label>
                <input
                  value={settingsForm.homeCollectionCharge}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, homeCollectionCharge: e.target.value }))}
                  className="w-full rounded-xl border border-cyan-100 bg-white/60 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Lab Name</label>
                <input
                  value={settingsForm.labName}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, labName: e.target.value }))}
                  className="w-full rounded-xl border border-cyan-100 bg-white/60 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Lab Contact Info</label>
                <input
                  value={settingsForm.labContact}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, labContact: e.target.value }))}
                  className="w-full rounded-xl border border-cyan-100 bg-white/60 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400"
                />
              </div>

              <div className="md:col-span-2">
                <GlassButton type="submit" variant="tertiary" icon={<Settings size={15} />} className="px-6 py-3">
                  Save Settings (Coming Soon)
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </main>
      </div>
    </div>
  );
};

export default AdminProfilePage;
