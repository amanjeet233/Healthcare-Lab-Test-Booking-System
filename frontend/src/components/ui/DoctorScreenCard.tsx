import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface DoctorScreenItem {
  label: string;
  slug: string;
  bg: string;
  icon: LucideIcon;
  iconColor: string;
  desc: string;
}

const SL = '#64748B'; // Slate-500 — matching TestListingPage muted text

export const DoctorScreenCard: React.FC<{ item: DoctorScreenItem }> = ({ item }) => {
  const navigate = useNavigate();
  const Icon = item.icon;

  const openScreening = () => {
    const params = new URLSearchParams({
      category: item.label,
    });
    navigate(`/lab-tests/all-lab-tests?${params.toString()}`);
  };
  
  return (
    <button
      id={`screening-${item.slug}`}
      aria-label={`${item.label} screening`}
      onClick={openScreening}
      className={`group relative rounded-2xl p-3 md:p-3.5 border transition-all duration-300 cursor-pointer text-left w-full flex flex-col gap-2.5 h-full hover:shadow-xl hover:-translate-y-1`}
      style={{ 
        backgroundColor: `${item.iconColor}08`, 
        borderColor: `${item.iconColor}15`,
      }}
    >
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-110 duration-300" 
        style={{ background: `${item.iconColor}10` }}
      >
        <Icon className="w-5 h-5" style={{ color: item.iconColor }} strokeWidth={2.2} />
      </div>
      <div className="flex-1 mt-1">
        <p className="text-[13px] font-black text-slate-800 leading-tight group-hover:text-slate-900 transition-colors uppercase tracking-tight">
          {item.label}
        </p>
        <p className="text-[10.5px] font-medium mt-1.5 leading-snug line-clamp-2" style={{ color: SL }}>
          {item.desc}
        </p>
      </div>
      <div 
        className="absolute bottom-3 right-3 w-5 h-5 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0 duration-300"
        style={{ background: `${item.iconColor}15` }}
      >
        <ArrowRight className="w-3 h-3" style={{ color: item.iconColor }} strokeWidth={3} />
      </div>
    </button>
  );
};

export default DoctorScreenCard;
