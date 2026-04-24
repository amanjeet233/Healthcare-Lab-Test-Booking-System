import React from 'react';
import TechnicianDashboardPage from './TechnicianDashboardPage';

const TechnicianTodayPage: React.FC = () => (
  <TechnicianDashboardPage
    forcedTab="today"
    lockTab
    breadcrumbLabel="Today"
    pageSubtext="Today tasks only."
    pageHeading={<>Today <span className="text-cyan-600">Tasks</span></>}
  />
);

export default TechnicianTodayPage;
