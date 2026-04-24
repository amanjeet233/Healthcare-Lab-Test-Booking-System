import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, Loader } from 'lucide-react';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { List, type RowComponentProps } from 'react-window';
import { TestParameterForm } from '../../components/admin/TestParameterForm';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { testParameterService, type TestParameter } from '../../services/testParameterService';
import { labTestService } from '../../services/labTest';
import type { LabTestResponse } from '../../types/labTest';

export const TestParametersPage: React.FC = () => {
  const [tests, setTests] = useState<LabTestResponse[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<number>(0);
  const [parameters, setParameters] = useState<TestParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedParam, setSelectedParam] = useState<TestParameter | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<TestParameter | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    if (selectedTestId > 0) {
      loadParameters(selectedTestId);
    } else {
      setParameters([]);
    }
  }, [selectedTestId]);

  const loadTests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await labTestService.getLabTests({ page: 0, size: 200, sort: 'testName,asc' });
      const loadedTests = response.tests || [];
      setTests(loadedTests);
      if (loadedTests.length > 0) {
        setSelectedTestId(loadedTests[0].id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const loadParameters = async (testId: number) => {
    setLoading(true);
    setError('');
    try {
      const data = await testParameterService.getByTestId(testId);
      setParameters(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load parameters');
      setParameters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (param: TestParameter) => {
    setSelectedParam(param);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm?.id) return;
    setDeleting(true);
    try {
      await testParameterService.remove(deleteConfirm.id);
      setParameters((current) => current.filter((p) => p.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to delete parameter');
    } finally {
      setDeleting(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedParam(null);
  };

  const handleFormSuccess = async () => {
    handleFormClose();
    if (selectedTestId > 0) {
      await loadParameters(selectedTestId);
    }
  };

  const selectedTestName =
    tests.find((test) => test.id === selectedTestId)?.testName ||
    tests.find((test) => test.id === selectedTestId)?.name ||
    '';

  const ParameterRow = ({ index, style, rows }: RowComponentProps<{ rows: TestParameter[] }>) => {
    const param = rows[index];
    return (
      <div
        style={style}
        className="grid grid-cols-[2.2fr_1fr_1fr_0.8fr_0.8fr] items-center border-b border-gray-100 px-6"
      >
        <div className="pr-3">
          <p className="font-medium text-gray-900">{param.parameterName}</p>
          {param.normalRangeText && <p className="text-sm text-gray-600">{param.normalRangeText}</p>}
        </div>
        <div className="text-sm text-gray-700">{param.unit || '-'}</div>
        <div className="text-sm text-gray-700">
          {param.normalRangeMin ?? '-'} - {param.normalRangeMax ?? '-'}
        </div>
        <div>
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              param.isCritical ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {param.isCritical ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleEdit(param)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteConfirm(param)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Parameters</h1>
          <p className="text-gray-600 mt-2">Manage parameter definitions for each lab test</p>
        </div>
        <button
          onClick={() => {
            if (!selectedTestId) return;
            setSelectedParam(null);
            setShowForm(true);
          }}
          disabled={!selectedTestId}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add Parameter
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Test</label>
        <select
          value={selectedTestId || ''}
          onChange={(e) => setSelectedTestId(Number(e.target.value))}
          className="w-full max-w-lg px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {tests.map((test) => (
            <option key={test.id} value={test.id}>
              {test.testName || test.name || `Test #${test.id}`}
            </option>
          ))}
        </select>
      </div>

      {showForm && selectedTestId > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <TestParameterForm
              testId={selectedTestId}
              parameterData={selectedParam || undefined}
              onSuccess={handleFormSuccess}
              onClose={handleFormClose}
            />
          </div>
        </div>
      )}

      {deleteConfirm && (
        <ConfirmationModal
          isOpen={Boolean(deleteConfirm)}
          title="Delete Test Parameter"
          description={`Are you sure you want to delete "${deleteConfirm.parameterName}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
          confirmText={deleting ? 'Deleting...' : 'Delete'}
          cancelText="Cancel"
          confirmColor="bg-danger hover:bg-red-700 focus:ring-danger"
        />
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : parameters.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            {selectedTestId ? `No test parameters found for ${selectedTestName}` : 'No test selected'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
          {parameters.length > 20 ? (
            <>
              <div className="grid grid-cols-[2.2fr_1fr_1fr_0.8fr_0.8fr] bg-gray-50 border-b border-gray-200 px-6 py-3 text-sm font-semibold text-gray-900">
                <div>Parameter Name</div>
                <div>Unit</div>
                <div>Normal Range</div>
                <div>Critical</div>
                <div className="text-right">Actions</div>
              </div>
              <div className="h-130">
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      rowCount={parameters.length}
                      rowHeight={84}
                      rowComponent={ParameterRow}
                      rowProps={{ rows: parameters }}
                      style={{ height, width }}
                    />
                  )}
                </AutoSizer>
              </div>
            </>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Parameter Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Unit</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Normal Range</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Critical</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {parameters.map((param) => (
                  <tr key={param.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{param.parameterName}</p>
                      {param.normalRangeText && <p className="text-sm text-gray-600">{param.normalRangeText}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{param.unit || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {param.normalRangeMin ?? '-'} - {param.normalRangeMax ?? '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          param.isCritical ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {param.isCritical ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(param)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(param)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!loading && parameters.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-sm text-red-900">
              <strong>{parameters.filter((p) => p.isCritical).length}</strong> Critical Parameters
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>{parameters.length}</strong> Total Parameters
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestParametersPage;
