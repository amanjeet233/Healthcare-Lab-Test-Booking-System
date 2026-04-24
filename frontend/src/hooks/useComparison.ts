import { useContext } from 'react';
import { ComparisonContext, ComparisonContextType } from '../context/ComparisonContextDef';

export const useComparison = (): ComparisonContextType => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};
