import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WOMEN_CARE } from '../../constants/labTests';

const WOMEN_CATEGORY_MAP: Record<string, string> = {
  'PCOD Screening': 'Hormones',
  'Blood Studies': 'CBC',
  'Pregnancy': 'Pregnancy',
  'Iron Studies': 'Iron Deficiency',
  'Vitamin Panel': 'Vitamin',
  'Thyroid': 'Thyroid',
  'Bone Health': 'Bone Health',
  'Hormones': 'Hormones',
  'Fertility': 'Hormones',
  'STI Screening': 'Sexual Health',
  'Immunity': 'Immunity',
  "Women's Wellness": "Women's Health",
};

const ESSENTIAL_WOMEN_LABELS = new Set([
  'PCOD Screening',
  'Blood Studies',
  'Pregnancy',
  'Iron Studies',
  'Vitamin Panel',
  'Thyroid',
  'Bone Health',
  'Hormones',
]);

const WomenCareSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-2 md:gap-3">
        {WOMEN_CARE.filter((item) => ESSENTIAL_WOMEN_LABELS.has(item.label)).map((item) => {
          const Icon = item.icon;
          const queryCategory = WOMEN_CATEGORY_MAP[item.label] || item.label;
          return (
            <button
              key={item.slug}
              onClick={() => navigate(`/lab-tests/all-lab-tests?category=${encodeURIComponent(queryCategory)}`)}
              className={`group relative bg-gradient-to-br ${item.bg} rounded-2xl p-3 md:p-3.5 border transition-all duration-300 cursor-pointer text-left w-full flex flex-col gap-2.5 h-full hover:shadow-xl hover:-translate-y-1`}
              style={{ backgroundColor: `${item.iconColor}08`, borderColor: `${item.iconColor}15` }}
              aria-label={`${item.label} health screening`}
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
                <p className="text-[10.5px] font-medium mt-1.5 leading-snug line-clamp-2 text-slate-500">
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WomenCareSection;
