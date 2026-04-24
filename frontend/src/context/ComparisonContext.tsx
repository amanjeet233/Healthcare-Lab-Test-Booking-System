import React, { useState, useCallback } from 'react';
import { ComparisonContext, TestForComparison } from './ComparisonContextDef';

const MAX_TESTS_TO_COMPARE = 5;

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedTests, setSelectedTests] = useState<TestForComparison[]>([]);

  const addTest = useCallback((test: TestForComparison) => {
    setSelectedTests(prev => {
      if (prev.some(t => t.id === test.id)) {
        return prev;
      }
      if (prev.length < MAX_TESTS_TO_COMPARE) {
        return [...prev, test];
      }
      return prev;
    });
  }, []);

  const removeTest = useCallback((testId: number) => {
    setSelectedTests(prev => prev.filter(t => t.id !== testId));
  }, []);

  const clearComparison = useCallback(() => {
    setSelectedTests([]);
  }, []);

  const isTestSelected = useCallback((testId: number) => {
    return selectedTests.some(t => t.id === testId);
  }, [selectedTests]);

  const canAddMore = useCallback(() => {
    return selectedTests.length < MAX_TESTS_TO_COMPARE;
  }, [selectedTests]);

  return (
    <ComparisonContext.Provider
      value={{
        selectedTests,
        addTest,
        removeTest,
        clearComparison,
        isTestSelected,
        canAddMore
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export default ComparisonProvider;

