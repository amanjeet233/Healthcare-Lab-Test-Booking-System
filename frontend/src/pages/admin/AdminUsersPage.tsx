import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, RefreshCw, Users } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import UserManagementTable from '../../components/admin/UserManagementTable';
import Pagination from '../../components/common/Pagination';
import { adminService, type User } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminUsersPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const querySearch = (searchParams.get('search') || '').trim().toLowerCase();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const loadData = async () => {
        setLoading(true);
        try {
            const pageData = await adminService.getUsersPage({ page, size: 20 });
            setUsers(pageData.content || []);
            setTotalPages(pageData.totalPages || 0);
        } catch {
            toast.error('Failed to load users');
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
        toast.success('Users synchronized');
    };

    const patientUsers = useMemo(
        () => users.filter((u) => (u.role || '').toUpperCase() === 'PATIENT'),
        [users]
    );

    const filteredUsers = useMemo(() => {
        if (!querySearch) return patientUsers;
        return patientUsers.filter((u) =>
            [u.name, u.email, u.role, String(u.id)]
                .join(' ')
                .toLowerCase()
                .includes(querySearch)
        );
    }, [patientUsers, querySearch]);

    return (
        <div className="min-h-screen bg-bg pb-10">
            <div className="max-w-350 mx-auto px-4 lg:px-6 pt-6 space-y-4">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-800/60">
                    <span>Home</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>Users</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-black text-cyan-700/70 uppercase tracking-[0.25em]">Admin Module</span>
                        </div>
                        <h1 className="text-2xl font-black text-[#164E63] uppercase italic tracking-tight">User <span className="text-cyan-600 italic">Management</span></h1>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/50 border border-primary/10 rounded-lg text-[9px] font-black uppercase tracking-widest hover:text-primary transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center min-h-[32vh]">
                        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                    </div>
                ) : (
                    <>
                        <section className="bg-white/40 backdrop-blur-xl border border-primary/5 rounded-3xl p-4 shadow-sm">
                            <UserManagementTable users={filteredUsers} allowRoleEdit={false} allowStatusEdit={false} />
                            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                        </section>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminUsersPage;
