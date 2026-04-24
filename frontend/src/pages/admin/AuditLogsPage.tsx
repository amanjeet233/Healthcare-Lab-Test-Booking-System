import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { adminService } from '../../services/adminService';
import { notify } from '../../utils/toast';

interface AuditLog {
  id: number;
  userId?: number;
  userEmail?: string;
  username?: string;
  userRole?: string;
  action: string;
  entityName: string;
  entityId: string;
  newValue?: string;
  timestamp: string;
}

interface AuditPage {
  content: AuditLog[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

const ACTION_OPTIONS = [
  'USER_LOGIN',
  'USER_LOGOUT',
  'ROLE_CHANGED',
  'USER_STATUS_TOGGLED',
  'STAFF_CREATED',
  'STAFF_DELETED',
  'BOOKING_STATUS_CHANGED',
  'REPORT_VERIFIED',
  'REPORT_REJECTED',
  'REPORT_UPLOADED'
];

const ROLE_OPTIONS = ['ADMIN', 'PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER'];

const getActionBadgeClass = (action: string) => {
  const upper = (action || '').toUpperCase();
  if (upper.includes('ROLE_CHANGED')) return 'bg-red-100 text-red-700';
  if (upper.includes('LOGIN') || upper.includes('LOGOUT')) return 'bg-green-100 text-green-700';
  if (upper.includes('REPORT')) return 'bg-teal-100 text-teal-700';
  if (upper.includes('STATUS')) return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-700';
};

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [selectedRole, setSelectedRole] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const query = useMemo(
    () => ({
      page,
      size,
      userRole: selectedRole || undefined,
      action: selectedAction || undefined,
      from: dateFrom || undefined,
      to: dateTo || undefined
    }),
    [page, size, selectedRole, selectedAction, dateFrom, dateTo]
  );

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: AuditPage = await adminService.getAuditLogsPage(query);
      
      // Filter out internal system logs
      const filteredLogs = (data?.content || []).filter(log => {
        const user = (log.userEmail || log.username || 'System').toLowerCase();
        return user !== 'system';
      });

      setLogs(filteredLogs);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch (err: any) {
      const message = err?.message || 'Failed to load audit logs';
      setError(message);
      notify.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [query]);

  const clearFilters = () => {
    setSelectedRole('');
    setSelectedAction('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
    // Explicitly clear logs to show user that a refresh is happening
    setLogs([]);
  };

  const applyFilters = () => {
    setPage(0);
    loadAuditLogs();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-800/60 mb-5">
          <span>Home</span>
          <ChevronRight className="w-3 h-3" />
          <span>Audit Logs</span>
        </div>
        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Audit Logs</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-6 bg-white border-2 border-gray-200 rounded-lg p-5 grid grid-cols-1 md:grid-cols-6 gap-3">
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Roles</option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>

        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Actions</option>
          {ACTION_OPTIONS.map((action) => (
            <option key={action} value={action}>{action}</option>
          ))}
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
        />

        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
        />

        <button
          type="button"
          onClick={applyFilters}
          className="px-4 py-2 bg-[#0D7C7C] text-white rounded-lg text-sm font-bold hover:bg-[#004B87] transition-all"
        >
          Apply
        </button>

        <button
          type="button"
          onClick={clearFilters}
          className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
        >
          Clear
        </button>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Showing <span className="font-bold text-gray-900">{logs.length}</span> records on this page, total{' '}
        <span className="font-bold text-gray-900">{totalElements}</span>
      </div>

      <div className="overflow-x-auto border-2 border-gray-200 rounded-lg mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-black uppercase">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase">Action</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase">Entity</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs">{log.userEmail || log.username || 'System'}</td>
                <td className="px-4 py-3 text-xs">{log.userRole || '-'}</td>
                <td className="px-4 py-3 text-xs">
                  <span className={`inline-flex px-2 py-1 rounded-full font-semibold ${getActionBadgeClass(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  {log.entityName}{log.entityId ? ` (${log.entityId})` : ''}
                </td>
                <td className="px-4 py-3 text-xs">{log.newValue || '-'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                  No audit logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        <div className="flex gap-2">
          <select
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(0);
            }}
            className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
