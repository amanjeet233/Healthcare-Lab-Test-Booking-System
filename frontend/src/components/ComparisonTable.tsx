import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { TestForComparison } from '../context/ComparisonContextDef';
import { FaStar } from 'react-icons/fa';

interface ComparisonTableProps {
  tests: TestForComparison[];
  onRemoveTest: (testId: number) => void;
  onAddToCart: (testIds: number[]) => Promise<void>;
  isLoading?: boolean;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  tests,
  onRemoveTest,
  onAddToCart,
  isLoading = false
}) => {
  const [isAdding, setIsAdding] = React.useState(false);

  const formatTurnaroundTime = (turnaroundTime: string): string => {
    if (!turnaroundTime) return '24 hrs';
    if (turnaroundTime.includes('hr')) return turnaroundTime;
    if (turnaroundTime.includes('day')) return turnaroundTime;
    const num = parseInt(turnaroundTime);
    if (!isNaN(num)) return `${num} hrs`;
    return turnaroundTime;
  };

  const handleAddSelectedToCart = async () => {
    setIsAdding(true);
    try {
      await onAddToCart(tests.map(t => t.id));
    } finally {
      setIsAdding(false);
    }
  };

  const getSampleTypeIcon = (sampleType: string) => {
    const type = sampleType.toLowerCase();
    if (type.includes('blood')) return '🩸';
    if (type.includes('urine')) return '💧';
    if (type.includes('x-ray') || type.includes('xray')) return '🩻';
    if (type.includes('ultrasound')) return '📡';
    if (type.includes('ct') || type.includes('scan')) return '📸';
    if (type.includes('mri')) return '🧲';
    if (type.includes('imaging')) return '🖼️';
    return '🏥';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="comparison-table-container"
    >
      <div className="comparison-table-wrapper">
        {/* Header */}
        <div className="comparison-header">
          <h2 className="comparison-title">Compare Tests</h2>
          <p className="comparison-subtitle">Side-by-side comparison of {tests.length} selected test{tests.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Responsive Table */}
        <div className="table-scroll-wrapper">
          <table className="comparison-table">
            <tbody>
              {/* Test Names Row */}
              <tr className="test-name-row">
                <td className="attribute-label">Test Name</td>
                {tests.map(test => (
                  <td key={test.id} className="test-column">
                    <div className="test-name-cell">
                      <div className="test-info">
                        <h3 className="test-name">{test.name}</h3>
                        <p className="test-category">{test.category}</p>
                      </div>
                      <button
                        className="remove-button"
                        onClick={() => onRemoveTest(test.id)}
                        title="Remove from comparison"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Price Row */}
              <tr className="price-row">
                <td className="attribute-label">Price</td>
                {tests.map(test => (
                  <td key={test.id} className="test-column">
                    <div className="price-cell">
                      <span className="current-price">₹{Math.round(test.price)}</span>
                      {test.originalPrice > test.price && (
                        <>
                          <span className="original-price">₹{Math.round(test.originalPrice)}</span>
                          <span className="discount">
                            {Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Sample Type Row */}
              <tr>
                <td className="attribute-label">Sample Type</td>
                {tests.map(test => (
                  <td key={test.id} className="test-column">
                    <div className="sample-type-cell">
                      <span className="sample-icon">{getSampleTypeIcon(test.sampleType)}</span>
                      <span>{test.sampleType}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Fasting Required Row */}
              <tr>
                <td className="attribute-label">Fasting Required</td>
                {tests.map(test => (
                  <td key={test.id} className="test-column">
                    <div className="fasting-cell">
                      {test.fastingRequired > 0 ? (
                        <>
                          <span className="fasting-icon">🍽️</span>
                          <span>{test.fastingRequired} hrs</span>
                        </>
                      ) : (
                        <>
                          <span className="no-fasting-icon">✓</span>
                          <span>No fasting</span>
                        </>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Report Time Row */}
              <tr>
                <td className="attribute-label">Report Time</td>
                {tests.map(test => (
                  <td key={test.id} className="test-column">
                    <div className="report-time-cell">
                      <span className="time-icon">⏱️</span>
                      <span>{formatTurnaroundTime(test.turnaroundTime)}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Tests Included Row */}
              <tr>
                <td className="attribute-label">Tests Included</td>
                {tests.map(test => (
                  <td key={test.id} className="test-column">
                    <div className="tests-included-cell">
                      <span className="count">{test.testsIncluded || 1}</span>
                      <span className="label">{(test.testsIncluded || 1) === 1 ? 'test' : 'tests'}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Rating Row */}
              <tr>
                <td className="attribute-label">Rating</td>
                {tests.map(test => (
                  <td key={test.id} className="test-column">
                    <div className="rating-cell">
                      <div className="star-group">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`star ${i < Math.floor(test.rating) ? 'filled' : 'empty'}`}
                            size={14}
                          />
                        ))}
                      </div>
                      <span className="rating-value">{(test.rating || 4.5).toFixed(1)}</span>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="comparison-actions">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddSelectedToCart}
            disabled={isAdding || isLoading}
            className="btn-add-selected"
          >
            {isAdding ? '⏳ Adding to Cart...' : `🛒 Add All ${tests.length} to Cart`}
          </motion.button>
          <p className="action-hint">Click the test name to view details</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ComparisonTable;
