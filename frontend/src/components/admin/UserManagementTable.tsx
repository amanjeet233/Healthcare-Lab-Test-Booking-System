import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Shield, User as UserIcon, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { type User, adminService } from '../../services/adminService';
import { notify } from '../../utils/toast';

interface Props {
    users: User[];
    allowRoleEdit?: boolean;
    allowStatusEdit?: boolean;
}

const UserManagementTable: React.FC<Props> = ({
    users: initialUsers,
    allowRoleEdit = true,
    allowStatusEdit = true,
}) => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [roleDraftByUser, setRoleDraftByUser] = useState<Record<number, string>>({});
    const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null);
    const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

    useEffect(() => {
        setUsers(initialUsers);
        const drafts: Record<number, string> = {};
        initialUsers.forEach((u) => {
            drafts[u.id] = (u.role || '').toUpperCase();
        });
        setRoleDraftByUser(drafts);
    }, [initialUsers]);

    const normalizeStatus = (status?: string) => (status || '').toUpperCase();

    const filteredUsers = users.filter(user =>
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (roleFilter === 'all' || user.role?.toString().toUpperCase() === roleFilter.toUpperCase())
    );

    const handleRoleChange = async (userId: number, newRole: string) => {
        if (!newRole) return;
        if ((newRole || '').toUpperCase() === 'ADMIN') {
            notify.error('Admin role assignment is locked.');
            return;
        }
        setUpdatingRoleId(userId);
        try {
            await adminService.updateUserRole(userId, newRole);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            notify.success(`User permissions updated.`);
        } catch (error) {
            notify.error('Update failed to synchronize.');
        } finally {
            setUpdatingRoleId(null);
        }
    };

    const handleStatusToggle = async (userId: number) => {
        setUpdatingStatusId(userId);
        try {
            await adminService.toggleUserStatus(userId.toString());
            setUsers(prev => prev.map(u => {
                if (u.id !== userId) return u;
                const current = normalizeStatus(u.status);
                return { ...u, status: current === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' };
            }));
            notify.success(`User status modified.`);
        } catch (error) {
            notify.error('Status check failed.');
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const getRoleColor = (role: string) => {
        const r = (role || '').toUpperCase();
        if (r === 'ADMIN') return 'text-red-600 bg-red-50 border-red-100';
        if (r === 'MEDICAL_OFFICER') return 'text-teal-700 bg-teal-50 border-teal-100';
        if (r === 'TECHNICIAN') return 'text-blue-700 bg-blue-50 border-blue-100';
        return 'text-slate-600 bg-slate-50 border-slate-100';
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full max-w-md group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text/30 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search patient or staff records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/40 border border-primary/5 rounded-xl pl-10 pr-4 py-2.5 text-[10px] font-bold text-text outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text/30 uppercase tracking-widest"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0">
                        <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text/30" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full bg-white/40 border border-primary/5 rounded-xl pl-10 pr-8 py-2.5 text-[9px] font-black text-text uppercase tracking-[0.18em] outline-none appearance-none cursor-pointer hover:bg-white/60 transition-all"
                        >
                            <option value="all">All Roles</option>
                            <option value="PATIENT">Patients</option>
                            <option value="TECHNICIAN">Technicians</option>
                            <option value="MEDICAL_OFFICER">Medical Officers</option>
                            <option value="ADMIN">Admins</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white/40 backdrop-blur-xl border border-primary/5 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-primary/5">
                                <th className="px-5 py-3 text-[9px] font-black text-text/40 uppercase tracking-[0.18em]">Name / Contact</th>
                                <th className="px-5 py-3 text-[9px] font-black text-text/40 uppercase tracking-[0.18em]">Designation / Role</th>
                                <th className="px-5 py-3 text-[9px] font-black text-text/40 uppercase tracking-[0.18em]">Joined Date</th>
                                <th className="px-5 py-3 text-[9px] font-black text-text/40 uppercase tracking-[0.18em]">Status</th>
                                <th className="px-5 py-3 text-[9px] font-black text-text/40 uppercase tracking-[0.18em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {filteredUsers.map((user, i) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="border-b border-primary/5 hover:bg-primary/5 transition-colors group"
                                    >
                                        {(() => {
                                            const isAdminUser = (user.role || '').toUpperCase() === 'ADMIN';
                                            const isPatientUser = (user.role || '').toUpperCase() === 'PATIENT';
                                            const selectedRole = roleDraftByUser[user.id] || (user.role || '').toUpperCase();
                                            const canEditRole = allowRoleEdit && !isAdminUser && !isPatientUser;
                                            const canEditStatus = allowStatusEdit && !isAdminUser && !isPatientUser;

                                            return (
                                                <>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8.5 h-8.5 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                                                    <UserIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[12px] font-black text-text uppercase italic">{user.name}</h4>
                                                    <p className="text-[9px] font-medium text-text/40">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${getRoleColor(user.role)}`}>
                                                <Shield className="w-2.5 h-2.5" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">{user.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-[10px] font-bold text-text/60 uppercase tracking-tighter">
                                            {user.joinDate || user.createdAt || '-'}
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className={`flex items-center gap-2 ${normalizeStatus(user.status) === 'ACTIVE' ? 'text-cta' : 'text-red-400'}`}>
                                                {normalizeStatus(user.status) === 'ACTIVE' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                                <span className="text-[9px] font-black uppercase tracking-widest italic">{normalizeStatus(user.status) || 'UNKNOWN'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <select
                                                    value={selectedRole}
                                                    onChange={(e) => setRoleDraftByUser(prev => ({ ...prev, [user.id]: e.target.value }))}
                                                    disabled={!canEditRole}
                                                    className="px-2.5 py-1.5 text-[8px] font-black uppercase tracking-wider border border-primary/15 rounded-md bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {canEditRole ? (
                                                        <>
                                                            <option value="PATIENT">PATIENT</option>
                                                            <option value="TECHNICIAN">TECHNICIAN</option>
                                                            <option value="MEDICAL_OFFICER">MEDICAL_OFFICER</option>
                                                        </>
                                                    ) : (
                                                        <option value={(user.role || '').toUpperCase()}>{(user.role || '').toUpperCase() || 'PATIENT'}</option>
                                                    )}
                                                </select>
                                                <button
                                                    onClick={() => handleRoleChange(user.id, selectedRole)}
                                                    disabled={!canEditRole || updatingRoleId === user.id || selectedRole === (user.role || '').toUpperCase()}
                                                    className="px-2.5 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-white text-[8px] font-black uppercase tracking-wider transition-all disabled:opacity-50"
                                                    title={isAdminUser ? 'Admin role is locked' : isPatientUser ? 'Patient role is locked' : 'Update Role'}
                                                >
                                                    {updatingRoleId === user.id ? 'Updating...' : 'Update'}
                                                </button>
                                                <button
                                                    onClick={() => handleStatusToggle(user.id)}
                                                    disabled={!canEditStatus || updatingStatusId === user.id}
                                                    className="px-2.5 py-1.5 rounded-md bg-white border border-primary/20 hover:bg-primary/5 text-[8px] font-black uppercase tracking-wider transition-all disabled:opacity-50"
                                                    title={isAdminUser ? 'Admin status is locked' : isPatientUser ? 'Patient status is locked' : 'Toggle Status'}
                                                >
                                                    {updatingStatusId === user.id ? 'Updating...' : normalizeStatus(user.status) === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                                </button>
                                            </div>
                                        </td>
                                                </>
                                            );
                                        })()}
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="py-16 text-center space-y-3 opacity-20">
                        <Activity className="w-9 h-9 mx-auto" />
                        <p className="text-[10px] font-black uppercase tracking-[0.22em]">No records found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagementTable;
