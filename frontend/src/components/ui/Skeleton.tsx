import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200/60 rounded-lg ${className}`} />
);

export const SkeletonCircle: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200/60 rounded-full ${className}`} />
);

export const SkeletonText: React.FC<SkeletonProps & { lines?: number }> = ({ className = '', lines = 1 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        className={`h-3 ${i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'} ${className}`} 
      />
    ))}
  </div>
);

export default Skeleton;
