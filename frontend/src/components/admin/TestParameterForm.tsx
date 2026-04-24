import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Loader } from 'lucide-react';
import { testParameterService, type TestParameter } from '../../services/testParameterService';

const schema = yup.object({
  parameterName: yup.string().required('Parameter name is required'),
  unit: yup.string().optional(),
  normalRangeMin: yup.number().nullable().optional(),
  normalRangeMax: yup.number().nullable().optional(),
  normalRangeText: yup.string().optional(),
  criticalLow: yup.number().nullable().optional(),
  criticalHigh: yup.number().nullable().optional(),
  displayOrder: yup.number().nullable().optional(),
  category: yup.string().optional(),
  isCritical: yup.boolean().optional()
});

type TestParameterFormValues = yup.InferType<typeof schema>;

interface TestParameterFormProps {
  testId: number;
  parameterData?: TestParameter;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const TestParameterForm: React.FC<TestParameterFormProps> = ({
  testId,
  parameterData,
  onSuccess,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { control, handleSubmit } = useForm<TestParameterFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      parameterName: parameterData?.parameterName || '',
      unit: parameterData?.unit || '',
      normalRangeMin: parameterData?.normalRangeMin ?? null,
      normalRangeMax: parameterData?.normalRangeMax ?? null,
      normalRangeText: parameterData?.normalRangeText || '',
      criticalLow: parameterData?.criticalLow ?? null,
      criticalHigh: parameterData?.criticalHigh ?? null,
      displayOrder: parameterData?.displayOrder ?? null,
      category: parameterData?.category || '',
      isCritical: Boolean(parameterData?.isCritical)
    }
  });

  const onSubmit = async (data: TestParameterFormValues) => {
    setLoading(true);
    setError('');
    try {
      const payload: TestParameter = {
        ...data,
        id: parameterData?.id,
        testId
      };

      if (parameterData?.id) {
        await testParameterService.update(parameterData.id, payload);
      } else {
        await testParameterService.create(payload);
      }

      onSuccess?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save test parameter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {parameterData ? 'Edit Test Parameter' : 'Add Test Parameter'}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Parameter Name *</label>
          <Controller
            name="parameterName"
            control={control}
            render={({ field, fieldState: { error: fieldError } }) => (
              <>
                <input
                  {...field}
                  type="text"
                  placeholder="e.g., Hemoglobin"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fieldError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {fieldError && <p className="text-sm text-red-600 mt-1">{fieldError.message}</p>}
              </>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="e.g., g/dL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="e.g., Blood"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Reference and Critical Range</h4>
          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="normalRangeMin"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  value={field.value ?? ''}
                  type="number"
                  step="0.01"
                  placeholder="Normal min"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              )}
            />
            <Controller
              name="normalRangeMax"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  value={field.value ?? ''}
                  type="number"
                  step="0.01"
                  placeholder="Normal max"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              )}
            />
            <Controller
              name="criticalLow"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  value={field.value ?? ''}
                  type="number"
                  step="0.01"
                  placeholder="Critical low"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              )}
            />
            <Controller
              name="criticalHigh"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  value={field.value ?? ''}
                  type="number"
                  step="0.01"
                  placeholder="Critical high"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              )}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Range Notes</label>
          <Controller
            name="normalRangeText"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={2}
                placeholder="Optional human readable range notes"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
            <Controller
              name="displayOrder"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  value={field.value ?? ''}
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              )}
            />
          </div>
          <div className="flex items-end pb-2">
            <Controller
              name="isCritical"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    checked={Boolean(field.value)}
                    onChange={(e) => field.onChange(e.target.checked)}
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Critical marker parameter</span>
                </label>
              )}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            {parameterData ? 'Update' : 'Create'} Parameter
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

