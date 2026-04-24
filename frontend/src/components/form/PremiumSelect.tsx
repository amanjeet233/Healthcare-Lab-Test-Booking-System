import React from 'react';
import { ChevronDown } from 'lucide-react';

interface PremiumSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  options: { value: string | number; label: string }[];
  fullWidth?: boolean;
}

const PremiumSelect: React.FC<PremiumSelectProps> = ({
  label,
  error,
  hint,
  placeholder,
  options,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || `select-${Math.random()}`;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-semibold text-gray-900 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          className={`
            w-full px-4 py-2.5 text-base font-normal
            border border-gray-300 rounded-md
            transition-all duration-200
            focus:outline-none focus:border-[#0D7C7C] focus:ring-2 focus:ring-[#0D7C7C]/20
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60
            appearance-none bg-white
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={18}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>

      {error && (
        <p className="mt-1 text-sm font-medium text-red-500">{error}</p>
      )}

      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
};

export default PremiumSelect;
