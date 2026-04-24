import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/* ─── Food SVG Illustration ────────────────────────────────────── */
const FoodIllustration = () => (
  <svg viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    {/* Apple */}
    <ellipse cx="65" cy="100" rx="38" ry="42" fill="#EF4444" />
    <path d="M65 58 Q72 45 80 50" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="65" cy="100" rx="15" ry="20" fill="#F87171" fillOpacity="0.5" />
    <path d="M47 85 Q60 95 55 115" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" fillOpacity="0.6" />

    {/* Wheat / Bread loaf */}
    <rect x="108" y="108" width="64" height="40" rx="12" fill="#D97706" />
    <ellipse cx="140" cy="108" rx="32" ry="18" fill="#F59E0B" />
    <ellipse cx="128" cy="104" rx="10" ry="6" fill="#FDE68A" fillOpacity="0.7" />
    <ellipse cx="152" cy="104" rx="10" ry="6" fill="#FDE68A" fillOpacity="0.7" />

    {/* Broccoli */}
    <rect x="184" y="118" width="8" height="36" rx="4" fill="#15803D" />
    <ellipse cx="188" cy="112" rx="20" ry="18" fill="#16A34A" />
    <ellipse cx="176" cy="108" rx="13" ry="12" fill="#22C55E" />
    <ellipse cx="200" cy="108" rx="13" ry="12" fill="#22C55E" />
    <ellipse cx="188" cy="100" rx="12" ry="10" fill="#4ADE80" fillOpacity="0.5" />

    {/* Milk glass */}
    <rect x="218" y="90" width="28" height="48" rx="6" fill="white" stroke="#E2E8F0" strokeWidth="1.5" />
    <rect x="222" y="94" width="20" height="8" rx="3" fill="#BFDBFE" fillOpacity="0.8" />
    <path d="M218 98 Q232 102 246 98" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />

    {/* Egg */}
    <ellipse cx="48" cy="155" rx="22" ry="26" fill="#FEF9C3" stroke="#FDE68A" strokeWidth="1.5" />
    <ellipse cx="48" cy="162" rx="12" ry="12" fill="#FCD34D" />

    {/* Nuts */}
    <ellipse cx="110" cy="160" rx="14" ry="10" fill="#92400E" />
    <ellipse cx="110" cy="158" rx="9" ry="6" fill="#B45309" />

    {/* Confetti dots */}
    <circle cx="160" cy="72" r="5" fill="#F97316" />
    <circle cx="90" cy="58" r="4" fill="#A3E635" />
    <circle cx="220" cy="68" r="4" fill="#FB7185" />
    <circle cx="32" cy="138" r="3" fill="#FCD34D" />
    <circle cx="244" cy="150" r="3" fill="#34D399" />
  </svg>
);

/* ─── Component ─────────────────────────────────────────────────── */
const FoodAllergyBanner: React.FC = () => {
  const navigate = useNavigate();
  const goToTest = () => navigate('/lab-tests-category/allergy');

  return (
    <div className="w-full px-4 md:px-6 py-3">
      <div
        onClick={goToTest}
        className="relative w-full rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.99]"
        style={{
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF9C3 40%, #FDE68A 100%)',
          boxShadow: '0 4px 24px rgba(217,119,6,0.15)',
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && goToTest()}
        aria-label="Book Food Intolerance Test"
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-amber-200/30 blur-3xl pointer-events-none translate-x-24 -translate-y-24" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-orange-200/40 blur-2xl pointer-events-none -translate-x-10 translate-y-10" />

        {/* Green badge top-right */}
        <div
          className="absolute top-3 right-3 text-[10px] font-black text-white px-3 py-1 rounded-full shadow-md z-10"
          style={{ background: '#15803D' }}
        >
          215 FOOD ITEMS COVERED
        </div>

        <div className="relative z-10 flex items-center px-6 md:px-10" style={{ minHeight: 'clamp(140px,18vw,200px)' }}>
          {/* Left text */}
          <div className="flex-1 space-y-2.5 py-5 pr-4">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-black text-amber-900 leading-tight tracking-tight">
              Not Every Food<br className="hidden sm:block" /> Suits Your Body 🍎
            </h2>
            <p className="text-[11px] md:text-sm text-amber-800/80 font-semibold leading-snug max-w-xs">
              Discover which foods may be causing inflammation or allergies — 215 food items tested in one panel.
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); goToTest(); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-[11px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 hover:-translate-y-0.5"
              style={{ background: '#C2410C' }}
            >
              Book Intolerance Test
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
            </button>
          </div>

          {/* Right illustration */}
          <div className="shrink-0 w-[130px] sm:w-[170px] md:w-[200px] lg:w-[230px] h-[130px] sm:h-[170px] md:h-[200px] lg:h-[230px] pointer-events-none">
            <FoodIllustration />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodAllergyBanner;
