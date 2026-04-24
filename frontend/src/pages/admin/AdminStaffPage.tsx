import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, RefreshCw, Shield, UserPlus, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import UserManagementTable from '../../components/admin/UserManagementTable';
import Pagination from '../../components/common/Pagination';
import { adminService, type User } from '../../services/adminService';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminStaffPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const querySearch = (searchParams.get('search') || '').trim().toLowerCase();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);
    const [isAddingStaff, setIsAddingStaff] = useState(false);
    const [newStaff, setNewStaff] = useState({
        name: '',
        email: '',
        phone: '',
        password: 'password123',
        role: 'TECHNICIAN',
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const pageData = await adminService.getUsersPage({ page, size: 20 });
            setUsers(pageData.content || []);
            setTotalPages(pageData.totalPages || 0);
        } catch {
            toast.error('Failed to load staff');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [page]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
        toast.success('Staff synchronized');
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStaff.name.trim() || !newStaff.email.trim()) {
            toast.error('Name and email are required');
            return;
        }
        if ((newStaff.role || '').toUpperCase() === 'ADMIN') {
            toast.error('Admin creation is locked. Only one admin is allowed.');
            return;
        }

        setIsAddingStaff(true);
        try {
            await api.post('/api/admin/staff', newStaff);
            toast.success(`${newStaff.role} added successfully`);
            setShowAddStaffModal(false);
            setNewStaff({ name: '', email: '', phone: '', password: 'password123', role: 'TECHNICIAN' });
            await loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to add staff');
        } finally {
            setIsAddingStaff(false);
        }
    };

    const staffOnly = useMemo(() => users.filter((u) => u.role !== 'PATIENT'), [users]);

    const filteredStaff = useMemo(() => {
        if (!querySearch) return staffOnly;
        return staffOnly.filter((u) =>
            [u.name, u.email, u.role, String(u.id)]
                .join(' ')
                .toLowerCase()
                .includes(querySearch)
        );
    }, [staffOnly, querySearch]);

    return (
        <div className="min-h-screen bg-bg pb-10">
            <div className="max-w-350 mx-auto px-4 lg:px-6 pt-6 space-y-4">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-800/60">
                    <span>Home</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>Staff</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-black text-cyan-700/70 uppercase tracking-[0.25em]">Admin Module</span>
                        </div>
                        <h1 className="text-2xl font-black text-[#164E63] uppercase italic tracking-tight">Staff <span className="text-cyan-600 italic">Management</span></h1>
                    </div>
                    <div className="flex items-center gap-3 md:ml-auto">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/50 border border-primary/10 rounded-lg text-[9px] font-black uppercase tracking-widest hover:text-primary transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={() => setShowAddStaffModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary-dark transition-all"
                        >
                            <UserPlus className="w-3.5 h-3.5" />
                            Add Staff
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center min-h-[32vh]">
                        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                    </div>
                ) : (
                    <section className="bg-white/40 backdrop-blur-xl border border-primary/5 rounded-3xl p-4 shadow-sm">
                        <UserManagementTable users={filteredStaff} />
                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                    </section>
                )}

                {showAddStaffModal && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-100 p-4">
                        <motion.form
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onSubmit={handleAddStaff}
                            className="w-full max-w-lg bg-white rounded-2xl border border-primary/10 shadow-2xl p-5 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-black uppercase text-text tracking-tight">Add Staff Member</h3>
                                <button type="button" onClick={() => setShowAddStaffModal(false)} className="p-2 rounded-lg hover:bg-slate-100">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={newStaff.name}
                                    onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                                    className="px-3.5 py-2.5 rounded-lg border border-primary/10 bg-white outline-none focus:border-primary text-[13px] font-semibold"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={newStaff.email}
                                    onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                                    className="px-3.5 py-2.5 rounded-lg border border-primary/10 bg-white outline-none focus:border-primary text-[13px] font-semibold"
                                />
                                <input
                                    type="text"
                                    placeholder="Phone"
                                    value={newStaff.phone}
                                    onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                                    className="px-3.5 py-2.5 rounded-lg border border-primary/10 bg-white outline-none focus:border-primary text-[13px] font-semibold"
                                />
                                <select
                                    value={newStaff.role}
                                    onChange={(e) => setNewStaff(prev => ({ ...prev, role: e.target.value }))}
                                    className="px-3.5 py-2.5 rounded-lg border border-primary/10 bg-white outline-none focus:border-primary text-[12px] font-black uppercase"
                                >
                                    <option value="TECHNICIAN">TECHNICIAN</option>
                                    <option value="MEDICAL_OFFICER">MEDICAL_OFFICER</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Password"
                                    value={newStaff.password}
                                    onChange={(e) => setNewStaff(prev => ({ ...prev, password: e.target.value }))}
                                    className="md:col-span-2 px-3.5 py-2.5 rounded-lg border border-primary/10 bg-white outline-none focus:border-primary text-[13px] font-semibold"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddStaffModal(false)}
                                    className="px-4 py-2 rounded-lg border border-primary/15 text-[9px] font-black uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAddingStaff}
                                    className="px-4 py-2 rounded-lg bg-primary text-white text-[9px] font-black uppercase tracking-widest disabled:opacity-60"
                                >
                                    {isAddingStaff ? 'Adding...' : 'Add Staff'}
                                </button>
                            </div>
                        </motion.form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminStaffPage;
