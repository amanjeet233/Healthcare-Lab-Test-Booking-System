import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

type CrumbItem = {
  label: string;
  to?: string;
};

type MOBreadcrumbsProps = {
  items: CrumbItem[];
};

const MOBreadcrumbs: React.FC<MOBreadcrumbsProps> = ({ items }) => {
  const navigate = useNavigate();

  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#c5d7df] text-[#0a6077] text-[10px] font-black uppercase tracking-[0.14em] hover:bg-white"
      >
        <ChevronLeft size={13} />
        Back
      </button>
      <nav aria-label="Breadcrumb" className="inline-flex flex-wrap items-center text-[11px] font-black uppercase tracking-[0.14em]">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const isFirst = idx === 0;
          return (
            <React.Fragment key={`${item.label}-${idx}`}>
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className={isFirst ? 'text-[#6f9fb3] hover:text-[#5c8ea3]' : 'text-[#0a6077] hover:text-[#084e61]'}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-[#005d79]' : isFirst ? 'text-[#6f9fb3]' : 'text-[#0a6077]'}>{item.label}</span>
              )}
              {!isLast && <span className="mx-2.5 text-[#a8c0cb]">{'>'}</span>}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
};

export default MOBreadcrumbs;
