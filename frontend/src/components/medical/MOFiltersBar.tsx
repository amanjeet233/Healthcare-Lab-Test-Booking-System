import React from 'react';

type MOFiltersBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  location?: string;
  onLocationChange?: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  test: string;
  onTestChange: (value: string) => void;
  rightSlot?: React.ReactNode;
};

const MOFiltersBar: React.FC<MOFiltersBarProps> = ({
  search,
  onSearchChange,
  location,
  onLocationChange,
  date,
  onDateChange,
  test,
  onTestChange,
  rightSlot,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 grid grid-cols-1 md:grid-cols-5 gap-2.5">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by patient / booking id"
        className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
      />
      <input
        value={location || ''}
        onChange={(e) => onLocationChange?.(e.target.value)}
        placeholder="Filter by city/address"
        className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
      />
      <input
        value={test}
        onChange={(e) => onTestChange(e.target.value)}
        placeholder="Filter by test name"
        className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
      />
      <div className="flex items-center justify-end">{rightSlot}</div>
    </div>
  );
};

export default MOFiltersBar;
