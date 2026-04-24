import React from 'react';

/**
 * Base skeleton block with pulse animation
 */
const Bone = ({ className = '' }: { className?: string }) => (
  <div className={`bg-slate-200 rounded-lg animate-pulse ${className}`} />
);

/**
 * Skeleton for a lab test card (6-per-row grid)
 */
export const TestCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
    <Bone className="h-8 w-8 rounded-lg" />
    <Bone className="h-4 w-3/4" />
    <Bone className="h-3 w-1/2" />
    <div className="flex justify-between items-center pt-2">
      <Bone className="h-4 w-1/4" />
      <Bone className="h-7 w-1/3 rounded-md" />
    </div>
  </div>
);

/**
 * Skeleton for a list item (My Bookings)
 */
export const BookingCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <Bone className="h-6 w-1/2" />
        <Bone className="h-3 w-1/3" />
      </div>
      <Bone className="h-8 w-24 rounded-full" />
    </div>
    <div className="space-y-2">
      <Bone className="h-3 w-full" />
      <Bone className="h-3 w-4/5" />
    </div>
    <div className="flex gap-2 pt-2">
      <Bone className="h-9 w-28 rounded-lg" />
      <Bone className="h-9 w-28 rounded-lg" />
    </div>
  </div>
);

/**
 * Skeleton for technician/medical officer items
 */
export const WorkboardItemSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between gap-4">
    <div className="flex items-center gap-4 flex-1">
      <Bone className="h-10 w-10 rounded-full shrink-0" />
      <div className="space-y-2 flex-1">
        <Bone className="h-4 w-1/2" />
        <Bone className="h-3 w-1/3" />
      </div>
    </div>
    <div className="flex gap-2">
      <Bone className="h-8 w-20 rounded-lg" />
      <Bone className="h-8 w-8 rounded-lg" />
    </div>
  </div>
);

/**
 * Skeleton for dashboard stat cards
 */
export const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
    <Bone className="h-4 w-1/3" />
    <Bone className="h-8 w-1/2" />
    <Bone className="h-3 w-2/3" />
  </div>
);

/**
 * Skeleton for the Reports page card
 */
export const ReportCardSkeleton = () => (
  <div className="bg-white/70 border border-white/40 rounded-3xl p-6 space-y-4">
    <div className="flex justify-between items-center">
      <Bone className="h-6 w-1/3" />
      <Bone className="h-6 w-24 rounded-md" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-4/5" />
      </div>
      <div className="space-y-2">
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-4/5" />
      </div>
    </div>
    <div className="flex gap-3 pt-2">
      <Bone className="h-10 w-32 rounded-lg" />
      <Bone className="h-10 w-32 rounded-lg" />
    </div>
  </div>
);

/**
 * Flexible grid wrapper
 */
export const SkeletonGrid = ({ count = 6, children }: { count?: number; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <React.Fragment key={i}>{children}</React.Fragment>
    ))}
  </div>
);
