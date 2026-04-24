import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader, AlertCircle } from 'lucide-react';
import { adminService, ReferenceRange } from '../../services/adminService';
import { ReferenceRangeForm } from '../../components/admin/ReferenceRangeForm';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export const ReferenceRangesPage: React.FC = () => {
  const [ranges, setRanges] = useState<ReferenceRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedRange, setSelectedRange] = useState<ReferenceRange | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ReferenceRange | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadRanges();
  }, []);

  const loadRanges = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.getReferenceRanges();
      setRanges(data || []);
    } catch (err) {
      setError((err as any).message || 'Failed to load reference ranges');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (range: ReferenceRange) => {
    setSelectedRange(range);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      await adminService.deleteReferenceRange(deleteConfirm.id);
      setRanges(ranges.filter(r => r.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      setError((err as any).message || 'Failed to delete reference range');
    } finally {
      setDeleting(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedRange(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    loadRanges();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reference Ranges</h1>
          <p className="text-gray-600 mt-2">Manage normal ranges for test parameters</p>
        </div>
        <button
          onClick={() => {
            setSelectedRange(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Range
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ReferenceRangeForm
              rangeData={selectedRange || undefined}
              onSuccess={handleFormSuccess}
              onClose={handleFormClose}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmationModal
          isOpen={Boolean(deleteConfirm)}
          title="Delete Reference Range"
          description={`Are you sure you want to delete the reference range for "${deleteConfirm.parameterName}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
          confirmText={deleting ? 'Deleting...' : 'Delete'}
          cancelText="Cancel"
          confirmColor="bg-danger hover:bg-red-700 focus:ring-danger"
        />
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : ranges.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No reference ranges found</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first range
          </button>
        </div>
      ) : (
        // Ranges Grid
        <div className="grid gap-4">
          {ranges.map(range => (
            <div
              key={range.id}
              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{range.parameterName}</h3>
                    {range.ageGroup && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        Age: {range.ageGroup}
                      </span>
                    )}
                    {range.gender && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        {range.gender}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Normal Range</p>
                      <p className="font-medium text-gray-900">
                        {range.minValue} - {range.maxValue} {range.unit}
                      </p>
                    </div>
                    {range.normalRange && (
                      <div>
                        <p className="text-gray-500">Description</p>
                        <p className="font-medium text-gray-900">{range.normalRange}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(range)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(range)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {!loading && ranges.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>{ranges.length}</strong> reference range{ranges.length !== 1 ? 's' : ''} configured
          </p>
        </div>
      )}
    </div>
  );
};

export default ReferenceRangesPage;
