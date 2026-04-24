import api from './api';

export interface TestParameter {
  id?: number;
  testId: number;
  parameterName: string;
  unit?: string;
  normalRangeMin?: number | null;
  normalRangeMax?: number | null;
  normalRangeText?: string;
  criticalLow?: number | null;
  criticalHigh?: number | null;
  isCritical?: boolean;
  displayOrder?: number | null;
  category?: string;
}

const normalizeParameter = (raw: any): TestParameter => ({
  id: raw?.id,
  testId: raw?.testId ?? raw?.test?.id ?? 0,
  parameterName: raw?.parameterName ?? '',
  unit: raw?.unit ?? '',
  normalRangeMin: raw?.normalRangeMin ?? null,
  normalRangeMax: raw?.normalRangeMax ?? null,
  normalRangeText: raw?.normalRangeText ?? '',
  criticalLow: raw?.criticalLow ?? null,
  criticalHigh: raw?.criticalHigh ?? null,
  isCritical: Boolean(raw?.isCritical),
  displayOrder: raw?.displayOrder ?? null,
  category: raw?.category ?? ''
});

const toPayload = (parameter: TestParameter) => ({
  id: parameter.id,
  test: { id: parameter.testId },
  parameterName: parameter.parameterName,
  unit: parameter.unit || null,
  normalRangeMin: parameter.normalRangeMin ?? null,
  normalRangeMax: parameter.normalRangeMax ?? null,
  normalRangeText: parameter.normalRangeText || null,
  criticalLow: parameter.criticalLow ?? null,
  criticalHigh: parameter.criticalHigh ?? null,
  isCritical: Boolean(parameter.isCritical),
  displayOrder: parameter.displayOrder ?? null,
  category: parameter.category || null
});

export const testParameterService = {
  getByTestId: async (testId: number): Promise<TestParameter[]> => {
    const response = await api.get(`/api/test-parameters/test/${testId}`);
    const data = response.data?.data || response.data || [];
    return Array.isArray(data) ? data.map(normalizeParameter) : [];
  },

  create: async (parameter: TestParameter): Promise<TestParameter> => {
    const response = await api.post('/api/test-parameters', toPayload(parameter));
    return normalizeParameter(response.data?.data || response.data);
  },

  update: async (id: number, parameter: TestParameter): Promise<TestParameter> => {
    const response = await api.put(`/api/test-parameters/${id}`, toPayload(parameter));
    return normalizeParameter(response.data?.data || response.data);
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/api/test-parameters/${id}`);
  }
};

