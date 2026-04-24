import React from 'react';
import TechnicianDashboardPage from './TechnicianDashboardPage';

const TechnicianQueuePage: React.FC = () => (
  <TechnicianDashboardPage
    forcedTab="pending"
    lockTab
    breadcrumbLabel="My Tasks"
    pageSubtext="All pending tasks assigned to you."
    pageHeading={<>My <span className="text-cyan-600">Tasks</span></>}
  />
);

export default TechnicianQueuePage;
