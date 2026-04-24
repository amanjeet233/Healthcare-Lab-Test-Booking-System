import React from 'react';

type MOLoadingSkeletonProps = {
  rows?: number;
  compact?: boolean;
};

const MOLoadingSkeleton: React.FC<MOLoadingSkeletonProps> = ({ rows = 3, compact = false }) => {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={`sk-${idx}`}
          className={`bg-white rounded-xl border border-slate-200 animate-pulse ${compact ? 'h-20' : 'h-28'}`}
        />
      ))}
    </div>
  );
};

export default MOLoadingSkeleton;
