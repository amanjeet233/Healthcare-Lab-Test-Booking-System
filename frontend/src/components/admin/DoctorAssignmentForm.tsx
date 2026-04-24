import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Loader } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { labTestService } from '../../services/labTest';

const schema = yup.object({
  doctorId: yup.number().required('Doctor is required'),
  testId: yup.number().required('Test is required')
});

interface DoctorAssignmentFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
  doctors: Array<{ id: number; name: string }>;
}

export const DoctorAssignmentForm: React.FC<DoctorAssignmentFormProps> = ({
  onSuccess,
  onClose,
  doctors
}) => {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { doctorId: 0, testId: 0 }
  });

  useEffect(() => {
    const loadTests = async () => {
      try {
        const response = await labTestService.getLabTests({ page: 0, size: 200, sort: 'testName,asc' });
        setTests(response.tests || []);
      } catch (err) {
        console.error('Error loading tests:', err);
      }
    };
    loadTests();
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      await adminService.assignTestToDoctor(data.doctorId, data.testId);
      reset();
      onSuccess?.();
    } catch (err) {
      setError((err as any).message || 'Failed to assign test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Test to Doctor</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Doctor Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Doctor
          </label>
          <Controller
            name="doctorId"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <select
                  {...field}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Choose a doctor...</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
                {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
              </>
            )}
          />
        </div>

        {/* Test Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Test
          </label>
          <Controller
            name="testId"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <select
                  {...field}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Choose a test...</option>
                  {tests.map(test => (
                    <option key={test.id} value={test.id}>
                      {test.testName || test.name}
                    </option>
                  ))}
                </select>
                {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
              </>
            )}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            Assign Test
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
