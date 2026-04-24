import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Loader } from 'lucide-react';
import { adminService, ReferenceRange } from '../../services/adminService';

const schema = yup.object({
  parameterName: yup.string().required('Parameter name is required'),
  minValue: yup.number().required('Min value is required'),
  maxValue: yup.number().required('Max value is required'),
  unit: yup.string().required('Unit is required'),
  ageGroup: yup.string().optional(),
  gender: yup.string().optional()
});

interface ReferenceRangeFormProps {
  rangeData?: ReferenceRange;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const ReferenceRangeForm: React.FC<ReferenceRangeFormProps> = ({
  rangeData,
  onSuccess,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      parameterName: rangeData?.parameterName || '',
      minValue: rangeData?.minValue || 0,
      maxValue: rangeData?.maxValue || 0,
      unit: rangeData?.unit || '',
      ageGroup: rangeData?.ageGroup || '',
      gender: rangeData?.gender || ''
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      if (rangeData?.id) {
        await adminService.updateReferenceRange(rangeData.id, data);
      } else {
        await adminService.createReferenceRange(data);
      }
      reset();
      onSuccess?.();
    } catch (err) {
      setError((err as any).message || 'Failed to save reference range');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {rangeData ? 'Edit Reference Range' : 'Add Reference Range'}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Parameter Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parameter Name
          </label>
          <Controller
            name="parameterName"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <input
                  {...field}
                  type="text"
                  placeholder="e.g., Hemoglobin"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
              </>
            )}
          />
        </div>

        {/* Min/Max Values */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Value
            </label>
            <Controller
              name="minValue"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="0.0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      error ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
                </>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Value
            </label>
            <Controller
              name="maxValue"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="0.0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      error ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
                </>
              )}
            />
          </div>
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit
          </label>
          <Controller
            name="unit"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <input
                  {...field}
                  type="text"
                  placeholder="e.g., g/dL"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
              </>
            )}
          />
        </div>

        {/* Optional Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age Group (Optional)
            </label>
            <Controller
              name="ageGroup"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="e.g., 18-50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender (Optional)
            </label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              )}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            {rangeData ? 'Update' : 'Create'} Range
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
