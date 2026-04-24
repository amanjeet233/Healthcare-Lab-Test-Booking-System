import React from 'react';
import { Inbox } from 'lucide-react';

type MOEmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
};

const MOEmptyState: React.FC<MOEmptyStateProps> = ({ title, description, icon, action }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700">
        {icon || <Inbox className="w-5 h-5" />}
      </div>
      <p className="text-slate-700 font-bold">{title}</p>
      {description && <p className="text-slate-500 text-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default MOEmptyState;
