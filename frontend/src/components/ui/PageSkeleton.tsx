import React from 'react';
import { Skeleton, SkeletonCircle, SkeletonText } from './Skeleton';

const SectionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full max-w-[1240px] mx-auto px-4 md:px-8 py-8 space-y-6">
    {children}
  </div>
);

export const LandingPageSkeleton = () => (
  <div className="w-full min-h-screen bg-[#F0F9F9]">
    {/* Hero Skeleton */}
    <div className="w-full bg-white/40 pb-12 pt-8">
      <SectionWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-16 w-full max-w-md" />
            <SkeletonText lines={3} className="max-w-sm" />
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-12 w-48 rounded-xl" />
              <Skeleton className="h-12 w-48 rounded-xl" />
            </div>
          </div>
          <div className="hidden lg:block">
            <Skeleton className="h-[400px] w-full rounded-3xl" />
          </div>
        </div>
      </SectionWrapper>
    </div>

    {/* Categories Skeleton */}
    <SectionWrapper>
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
            <SkeletonCircle className="w-10 h-10" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </SectionWrapper>
  </div>
);

export const TestDetailPageSkeleton = () => (
  <div className="w-full min-h-screen bg-slate-50">
    <div className="bg-white border-b border-slate-100 py-3">
      <div className="max-w-[1240px] mx-auto px-4">
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
    <div className="max-w-[1240px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white p-8 rounded-3xl space-y-6 border border-slate-100">
          <Skeleton className="h-10 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-px w-full" />
          <SkeletonText lines={4} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
      <div className="lg:col-span-4 space-y-6">
        <Skeleton className="h-[300px] rounded-3xl" />
        <Skeleton className="h-[200px] rounded-3xl" />
      </div>
    </div>
  </div>
);

export const GenericPageSkeleton = () => (
  <div className="w-full min-h-screen bg-slate-50 pt-20">
    <SectionWrapper>
      <Skeleton className="h-12 w-1/3 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <SkeletonText lines={3} />
          </div>
        ))}
      </div>
    </SectionWrapper>
  </div>
);
