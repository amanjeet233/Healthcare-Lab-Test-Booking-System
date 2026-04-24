import React from 'react';
import TechnicianDashboardPage from './TechnicianDashboardPage';

const TechnicianInLabPage: React.FC = () => (
  <TechnicianDashboardPage
    forcedTab="inlab"
    lockTab
    breadcrumbLabel="Results"
    pageSubtext="Enter and manage test results."
    pageHeading={<>Test <span className="text-cyan-600">Results</span></>}
  />
);

export default TechnicianInLabPage;
