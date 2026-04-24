import React, { useEffect, useState } from 'react';
import { Loader, Filter, Search, AlertCircle } from 'lucide-react';
import { adminService, AuditLog } from '../../services/adminService';

interface FilterOptions {
  action?: string;
  userId?: number;
  dateRange?: { from: string; to: string };
}

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, filters]);

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.getAuditLogs();
      setLogs(data || []);
    } catch (err) {
      setError((err as any).message || 'Failed to load audit logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...logs];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        log =>
          log.action?.toLowerCase().includes(term) ||
          log.userName?.toLowerCase().includes(term) ||
          log.details?.toLowerCase().includes(term)
      );
    }

    // Action filter
    if (filters.action) {
      result = result.filter(log => log.action === filters.action);
    }

    // User ID filter
    if (filters.userId) {
      result = result.filter(log => log.userId === filters.userId);
    }

    // Date range filter
    if (filters.dateRange) {
      result = result.filter(log => {
        const logDate = new Date(log.timestamp);
        const fromDate = new Date(filters.dateRange!.from);
        const toDate = new Date(filters.dateRange!.to);
        return logDate >= fromDate && logDate <= toDate;
      });
    }

    setFilteredLogs(result);
    setCurrentPage(1);
  };

  const getActionColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('REMOVE')) return 'bg-red-100 text-red-800';
    if (action.includes('CREATE') || action.includes('ADD')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'bg-blue-100 text-blue-800';
    if (action.includes('LOGIN')) return 'bg-emerald-100 text-emerald-800';
    return 'bg-gray-100 text-gray-800';
  };

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filteredLogs.length / pageSize);

  const uniqueActions = Array.from(new Set(logs.map(log => log.action))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by action, user, or details..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-3 gap-3">
          {/* Action Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Action</label>
            <select
              value={filters.action || ''}
              onChange={e => setFilters({ ...filters, action: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateRange?.from || ''}
              onChange={e =>
                setFilters({
                  ...filters,
                  dateRange: { ...filters.dateRange, from: e.target.value } as any
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateRange?.to || ''}
              onChange={e =>
                setFilters({
                  ...filters,
                  dateRange: { ...filters.dateRange, to: e.target.value } as any
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || filters.action || filters.dateRange) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilters({});
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Logs Table */}
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <Filter className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No activity records found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {log.user || log.userName || 'System'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.status === 'SUCCESS' || !log.status
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {log.status || 'SUCCESS'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({filteredLogs.length} total)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-gray-600">Total Records</p>
          <p className="text-lg font-bold text-blue-900">{logs.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <p className="text-xs text-gray-600">Filtered Results</p>
          <p className="text-lg font-bold text-green-900">{filteredLogs.length}</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <p className="text-xs text-gray-600">Success Rate</p>
          <p className="text-lg font-bold text-emerald-900">
            {logs.length > 0
              ? Math.round(
                  ((logs.filter(l => l.status === 'SUCCESS' || !l.status).length / logs.length) * 100)
                )
              : 100}
            %
          </p>
        </div>
      </div>
    </div>
  );
};
