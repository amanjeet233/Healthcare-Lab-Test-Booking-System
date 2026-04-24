import React from 'react';

interface SkeletonBlockProps {
  className?: string;
}

const SkeletonBlock: React.FC<SkeletonBlockProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-slate-200/70 animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
};

export default SkeletonBlock;
