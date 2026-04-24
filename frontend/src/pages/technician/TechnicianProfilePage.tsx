import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, User, Mail, Phone, MapPin, Save, KeyRound, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';

type TechnicianProfile = {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: string;
};

type TechnicianStats = {
  totalAssignedBookings?: number;
  completedToday?: number;
  totalCompleted?: number;
};

type ChangePasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const unwrapData = <T,>(response: any, fallback: T): T => {
  if (response?.data?.data !== undefined) return response.data.data as T;
  if (response?.data !== undefined) return response.data as T;
  return fallback;
};

const normalizeProfile = (raw: any): TechnicianProfile => {
  const source = raw?.user ?? raw ?? {};
  return {
    id: source.id,
    name: source.name || '',
    email: source.email || '',
    phone: source.phone || '',
    address: source.address || '',
    role: source.role || 'TECHNICIAN'
  };
};

const TechnicianProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [stats, setStats] = useState<TechnicianStats>({});

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const [passwordForm, setPasswordForm] = useState<ChangePasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const roleLabel = useMemo(() => {
    const role = (profile?.role || 'TECHNICIAN').toUpperCase();
    return role === 'TECHNICIAN' ? 'TECHNICIAN' : role;
  }, [profile?.role]);

  const loadPageData = async () => {
    setLoading(true);
    try {
      const [profileRes, statsRes] = await Promise.all([
        api.get('/api/users/profile'),
        api.get('/api/dashboard/technician/stats').catch(() => null)
      ]);

      const normalized = normalizeProfile(unwrapData<any>(profileRes, {}));
      setProfile(normalized);
      setForm({
        name: normalized.name || '',
        phone: normalized.phone || '',
        address: normalized.address || ''
      });

      if (statsRes) {
        const statsData = unwrapData<any>(statsRes, {});
        setStats({
          totalAssignedBookings: Number(statsData?.totalAssignedBookings ?? statsData?.totalAssigned ?? 0),
          completedToday: Number(statsData?.completedToday ?? 0),
          totalCompleted: Number(statsData?.totalCompleted ?? statsData?.completedTotal ?? statsData?.weekTotal ?? 0)
        });
      } else {
        setStats({ totalAssignedBookings: 0, completedToday: 0, totalCompleted: 0 });
      }
    } catch {
      toast.error('Failed to load technician profile');
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
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSavingProfile(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim()
      };
      const response = await api.put('/api/users/profile', payload);
      const updated = normalizeProfile(unwrapData<any>(response, {}));
      setProfile((prev) => ({ ...(prev || {}), ...updated }));
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password confirmation does not match');
      return;
    }

    setChangingPassword(true);
    try {
      await api.post('/api/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cyan-800/60 font-black text-[10px] uppercase tracking-widest">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 md:px-5 py-8 md:py-9 min-h-screen">
      <div className="mb-4 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-800/55">
        <Link to="/" className="hover:text-cyan-700 transition-colors">Home</Link>
        <span className="mx-1 text-cyan-700/35">›</span>
        <span className="text-cyan-700">Profile</span>
      </div>

      <header className="mb-8">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 bg-cyan-500/10 backdrop-blur-md rounded-xl border border-cyan-500/20 shadow-sm">
            <User className="w-5 h-5 text-cyan-600" />
          </div>
          <span className="text-[clamp(0.58rem,0.55rem+0.12vw,0.68rem)] font-black uppercase tracking-[0.18em] text-cyan-800/60">
            TECHNICIAN ACCOUNT
          </span>
        </div>
        <h1 className="text-[clamp(1.45rem,1.05rem+1.2vw,2.2rem)] font-black text-[#164E63] tracking-tight mb-2 uppercase">
          Profile <span className="text-cyan-600">Control</span>
        </h1>
        <p className="text-[clamp(0.8rem,0.75rem+0.28vw,0.92rem)] text-cyan-900/60 font-medium leading-relaxed">
          Manage your technician account and track work performance.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <aside className="lg:col-span-4 space-y-4">
          <GlassCard className="border-cyan-100/40">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#164E63] text-white flex items-center justify-center text-lg font-black">
                  {(profile?.name?.[0] || 'T').toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800 tracking-tight">{profile?.name || 'Technician'}</h2>
                  <p className="text-xs text-cyan-700/70 font-semibold">{profile?.email || '-'}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Mail size={15} className="text-cyan-600" />
                  <span>{profile?.email || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Phone size={15} className="text-cyan-600" />
                  <span>{profile?.phone || '-'}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-600 font-medium">
                  <MapPin size={15} className="text-cyan-600 mt-0.5" />
                  <span>{profile?.address || 'No address added'}</span>
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
              <Activity size={16} className="text-cyan-600" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Work Stats</h3>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              <div className="rounded-xl bg-white/70 border border-cyan-100 p-3">
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-black">Assigned Tasks</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalAssignedBookings ?? 0}</p>
              </div>
              <div className="rounded-xl bg-white/70 border border-cyan-100 p-3">
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-black">Completed Today</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{stats.completedToday ?? 0}</p>
              </div>
              <div className="rounded-xl bg-white/70 border border-cyan-100 p-3">
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-black">Total Completed</p>
                <p className="text-2xl font-black text-cyan-700 mt-1">{stats.totalCompleted ?? 0}</p>
              </div>
            </div>
          </GlassCard>
        </aside>

        <main className="lg:col-span-8 space-y-5">
          <GlassCard className="border-cyan-100/40">
            <div className="mb-4">
              <h3 className="text-lg font-black text-[#164E63] tracking-tight">Edit Profile</h3>
              <p className="text-sm text-slate-500">Update your technician identity and contact details.</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
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

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-xl border border-cyan-100 bg-white/60 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full rounded-xl border border-cyan-100 bg-white/60 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 min-h-[100px]"
                  placeholder="Enter address"
                />
              </div>

              <div className="md:col-span-2">
                <GlassButton type="submit" disabled={savingProfile} icon={<Save size={15} />} className="px-6 py-3">
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </GlassButton>
              </div>
            </form>
          </GlassCard>

          <GlassCard className="border-cyan-100/40">
            <div className="mb-4 flex items-center gap-2">
              <KeyRound size={16} className="text-cyan-600" />
              <div>
                <h3 className="text-lg font-black text-[#164E63] tracking-tight">Change Password</h3>
                <p className="text-sm text-slate-500">Keep your account secure with a strong password.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full rounded-xl border border-cyan-100 bg-white/60 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400"
                  placeholder="Confirm password"
                />
              </div>

              <div className="md:col-span-3">
                <GlassButton type="submit" disabled={changingPassword} icon={<KeyRound size={15} />} className="px-6 py-3">
                  {changingPassword ? 'Changing...' : 'Update Password'}
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </main>
      </div>
    </div>
  );
};

export default TechnicianProfilePage;
