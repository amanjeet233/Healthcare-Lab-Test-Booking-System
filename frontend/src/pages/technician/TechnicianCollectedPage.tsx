import React from 'react';
import TechnicianDashboardPage from './TechnicianDashboardPage';

const TechnicianCollectedPage: React.FC = () => (
  <TechnicianDashboardPage
    forcedTab="completed"
    lockTab
    breadcrumbLabel="History"
    pageSubtext="All test history (new and old)."
    pageHeading={<>Booking <span className="text-cyan-600">History</span></>}
  />
);

export default TechnicianCollectedPage;
