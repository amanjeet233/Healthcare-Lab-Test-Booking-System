import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, X } from 'lucide-react';
import { useComparison } from '../hooks/useComparison';
import { TestForComparison } from '../context/ComparisonContextDef';
import { useCart } from '../hooks/useCart';
import ComparisonTable from './ComparisonTable';

interface ComparisonPanelProps {
  onTestSelect?: (test: TestForComparison) => void;
}

const ComparisonPanel: React.FC<ComparisonPanelProps> = () => {
  const { selectedTests, removeTest, clearComparison } = useComparison();
  const { addTest: addToCart } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  if (selectedTests.length === 0) {
    return null;
  }

  const handleAddSelectedToCart = async (testIds: number[]) => {
    setIsAddingToCart(true);
    try {
      for (const testId of testIds) {
        await addToCart(testId, 1);
      }
      // Close panel after successful add
      setTimeout(() => {
        clearComparison();
        setIsExpanded(false);
      }, 500);
    } catch (error) {
      console.error('Error adding tests to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <AnimatePresence>
      {selectedTests.length > 0 && (
        <>
          {/* Overlay when expanded */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsExpanded(false)}
                className="comparison-overlay"
              />
            )}
          </AnimatePresence>

          {/* Floating Panel */}
          <motion.div
            layout
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`comparison-panel ${isExpanded ? 'expanded' : 'collapsed'}`}
          >
            {/* Collapsed Header */}
            <div className="comparison-panel-header" onClick={() => setIsExpanded(!isExpanded)}>
              <div className="header-content">
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="header-icon"
                >
                  <ChevronUp size={20} />
                </motion.div>
                <div className="header-text">
                  <span className="header-label">Comparing</span>
                  <span className="header-count">{selectedTests.length} test{selectedTests.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <button
                className="clear-button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearComparison();
                }}
                title="Clear all selections"
              >
                <X size={18} />
              </button>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="comparison-panel-content"
                >
                  {/* Selected Tests Preview */}
                  <div className="selected-tests-preview">
                    <h3 className="preview-title">Selected Tests</h3>
                    <div className="test-chips">
                      {selectedTests.map((test: TestForComparison) => (
                        <motion.div
                          key={test.id}
                          layout
                          className="test-chip"
                        >
                          <span className="chip-text">{test.name}</span>
                          <button
                            className="chip-remove"
                            onClick={() => removeTest(test.id)}
                            title={`Remove ${test.name} from comparison`}
                          >
                            <X size={14} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Comparison Table */}
                  <ComparisonTable
                    tests={selectedTests}
                    onRemoveTest={removeTest}
                    onAddToCart={handleAddSelectedToCart}
                    isLoading={isAddingToCart}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ComparisonPanel;
