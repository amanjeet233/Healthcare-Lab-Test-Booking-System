import React from 'react';
import { FaFlask, FaClock, FaUtensils, FaExclamationCircle } from 'react-icons/fa';
import type { LabTestResponse } from '../../types/labTest';

interface TestSummaryCardProps {
    testDetails: LabTestResponse;
    basePrice: number;
    watchCollectionType: string;
    discountAmount: number;
    totalAmount: number;
    HOME_COLLECTION_FEE: number;
}

const TestSummaryCard: React.FC<TestSummaryCardProps> = ({
    testDetails,
    basePrice,
    watchCollectionType,
    discountAmount,
    totalAmount,
    HOME_COLLECTION_FEE
}) => {
    return (
        <div className="booking-summary">
            <div className="test-summary-card">
                <div>
                    <div className="test-icon-wrapper">
                        <FaFlask />
                    </div>
                    <div>
                        <h3 className="test-name">{testDetails.name}</h3>
                        <p className="test-code">{testDetails.testCode}</p>
                    </div>
                </div>

                <div className="test-details-section">
                    <div className="detail-item">
                        <div className="detail-icon">
                            <FaClock />
                        </div>
                        <div className="detail-text">
                            <span className="detail-label">Report Readiness</span>
                            <span className="detail-value">24 Hours Synthesis</span>
                        </div>
                    </div>
                    {testDetails.fastingRequired && (
                        <div className="detail-item fasting">
                            <div className="detail-icon fasting">
                                <FaUtensils />
                            </div>
                            <div className="detail-text">
                                <span className="detail-label">Preparation</span>
                                <span className="detail-value">{testDetails.fastingHours || 8}h Fasting Required</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pricing-section">
                    <div className="pricing-row">
                        <span className="pricing-label">Base Unit Cost</span>
                        <span className="pricing-value">₹{basePrice.toFixed(2)}</span>
                    </div>
                    {watchCollectionType === 'HOME' && (
                        <div className="pricing-row">
                            <span className="pricing-label">Home Collection</span>
                            <span className="pricing-value additional">+₹{HOME_COLLECTION_FEE.toFixed(2)}</span>
                        </div>
                    )}
                    {discountAmount > 0 && (
                        <div className="pricing-row">
                            <span className="pricing-label">Incentive Applied</span>
                            <span className="pricing-value discount">-₹{discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="pricing-total">
                        <span className="total-label">Total Synthesis</span>
                        <span className="total-amount">₹{totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="security-notice">
                <div className="security-icon">
                    <FaExclamationCircle />
                </div>
                <p className="security-text">
                    Secure payment gateway will open after booking confirmation. All transactions are encrypted.
                </p>
            </div>
        </div>
    );
};

export default TestSummaryCard;
