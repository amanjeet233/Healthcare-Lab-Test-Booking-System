import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * CategoryTile — reusable tile used across:
 *   - VitalOrgansSection
 *   - WomenCareSection
 *   - DoctorCreatedSection
 *   - CategoryListingPage grids
 *
 * Props:
 *   src       — icon image URL (data URI or absolute path)
 *   label     — category name displayed below the icon
 *   href      — internal React Router path to navigate to on click
 *   bgColor   — background colour of the tile card (default: white)
 *   iconBg    — background colour of the circular icon container
 *   size      — 'sm' for horizontal scroll rows, 'md' for full-page grids
 */

export interface CategoryTileProps {
  src: string;
  label: string;
  href: string;
  bgColor?: string;
  iconBg?: string;
  size?: 'sm' | 'md';
}

const CategoryTile: React.FC<CategoryTileProps> = ({
  src,
  label,
  href,
  bgColor = '#FFFFFF',
  iconBg = '#F0FDFA',
  size = 'sm',
}) => {
  const navigate = useNavigate();

  const isSm = size === 'sm';

  return (
    <button
      aria-label={label}
      onClick={() => navigate(href)}
      className={[
        'flex flex-col items-center gap-2 rounded-xl bg-white border border-slate-100 cursor-pointer',
        'shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 active:scale-95',
        isSm
          ? 'px-3 py-3 w-[80px] shrink-0'     // horizontal scroll row
          : 'px-3 py-4 w-full',                 // full-page grid
      ].join(' ')}
      style={{ background: bgColor }}
    >
      {/* Icon circle */}
      <div
        className={[
          'rounded-full flex items-center justify-center overflow-hidden shrink-0',
          isSm ? 'w-11 h-11' : 'w-14 h-14',
        ].join(' ')}
        style={{ background: iconBg }}
      >
        <img
          src={src}
          alt={label}
          className={isSm ? 'w-10 h-10' : 'w-12 h-12'}
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Label */}
      <span
        className={[
          'font-bold text-center leading-tight text-slate-700',
          isSm ? 'text-[11px]' : 'text-[13px]',
        ].join(' ')}
      >
        {label}
      </span>
    </button>
  );
};

export default CategoryTile;
