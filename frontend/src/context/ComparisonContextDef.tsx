import { createContext } from 'react';

export interface TestForComparison {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  sampleType: string;
  fastingRequired: number;
  turnaroundTime: string;
  rating: number;
  testsIncluded?: number;
  shortDesc: string;
}

export interface ComparisonContextType {
  selectedTests: TestForComparison[];
  addTest: (test: TestForComparison) => void;
  removeTest: (testId: number) => void;
  clearComparison: () => void;
  isTestSelected: (testId: number) => boolean;
  canAddMore: () => boolean;
}

export const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);
