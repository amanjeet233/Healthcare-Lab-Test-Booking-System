import React, { useMemo } from 'react';

type TechnicianOption = {
  userId: number;
  name: string;
  bookingCountForDate?: number;
};

type MOTechnicianSearchSelectProps = {
  options: TechnicianOption[];
  value: number | '';
  search: string;
  onSearchChange: (value: string) => void;
  onChange: (value: number | '') => void;
  loading?: boolean;
  disabled?: boolean;
};

const MOTechnicianSearchSelect: React.FC<MOTechnicianSearchSelectProps> = ({
  options,
  value,
  search,
  onSearchChange,
  onChange,
  loading = false,
  disabled = false,
}) => {
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter((opt) => opt.name.toLowerCase().includes(query));
  }, [options, search]);

  return (
    <div className="space-y-2">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search technician"
        disabled={disabled || loading}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white"
      />

      <select
        value={value}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
        disabled={disabled || loading}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white"
      >
        <option value="">Select technician</option>
        {filtered.map((opt) => (
          <option key={opt.userId} value={opt.userId}>
            {opt.name}
            {typeof opt.bookingCountForDate === 'number'
              ? ` (${opt.bookingCountForDate} pending collection${opt.bookingCountForDate === 1 ? '' : 's'})`
              : ''}
          </option>
        ))}
      </select>

      {!loading && filtered.length === 0 && (
        <p className="text-[11px] text-slate-500 font-medium">No technician matched your search.</p>
      )}
    </div>
  );
};

export type { TechnicianOption };
export default MOTechnicianSearchSelect;
