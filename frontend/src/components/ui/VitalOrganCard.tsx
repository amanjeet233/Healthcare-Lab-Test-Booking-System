import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface VitalOrganItem {
  label: string;
  slug: string;
  bg: string;
  icon: LucideIcon;
  iconColor: string;
  desc: string;
}

export const VitalOrganCard: React.FC<{ item: VitalOrganItem }> = ({ item }) => {
  const navigate = useNavigate();
  const Icon = item.icon;
  
  return (
    <button
      onClick={() => navigate(`/lab-tests-category/${item.slug}`)}
      className={`group relative bg-gradient-to-br ${item.bg} rounded-2xl p-4 border border-white/60 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left flex flex-col gap-3 w-full h-full`}
      aria-label={`${item.label} health screening`}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0"
        style={{ background: `${item.iconColor}15` }}
      >
        <Icon className="w-5 h-5" style={{ color: item.iconColor }} strokeWidth={2} />
      </div>
      {/* Label */}
      <div className="flex-1">
        <p className="text-[13px] font-black text-slate-800 leading-tight">{item.label}</p>
        <p className="text-[10px] font-medium mt-1 leading-snug line-clamp-2 text-slate-500">
          {item.desc}
        </p>
      </div>
      {/* Hover Arrow */}
      <ArrowRight className="absolute bottom-3 right-3 w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
    </button>
  );
};

export default VitalOrganCard;
