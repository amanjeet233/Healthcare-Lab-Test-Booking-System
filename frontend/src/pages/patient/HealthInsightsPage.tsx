import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './HealthInsightsPage.css';

const HealthInsightsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="health-insights-page">
      <div className="page-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => navigate('/reports')}>
            <FaArrowLeft />
            Back
          </button>
          <div className="header-text">
            <h1>
              Health <span>Insights</span>
            </h1>
            <p>Track your clinical progress and health trends in one place.</p>
          </div>
        </div>
      </div>

      <div className="empty-state">
        <span className="empty-icon">📊</span>
        <h3>No Insights Available Yet</h3>
        <p>Generate a smart report first to start seeing AI-powered health insights.</p>
        <button className="book-test-btn-large" onClick={() => navigate('/reports')}>
          Go to Reports
        </button>
      </div>
    </div>
  );
};

export default HealthInsightsPage;
