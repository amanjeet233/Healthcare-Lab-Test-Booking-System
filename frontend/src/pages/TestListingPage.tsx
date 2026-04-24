/**
 * TestListingPage — Premium MedSync Lab Test Discovery Homepage
 *
 * Route: /lab-tests
 * Sections:
 *   A. Expert-Curated Screenings  (Doctor-Created, 6-col grid)
 *   B. Most Booked Tests          (Horizontal snap carousel + AutoScroll)
 *   C. Upload Rx + Digital Reports (Side-by-side action banners)
 *   D. Popular Health Packages     (Glassmorphism wide cards + AutoScroll)
 *   E. Vital Organ Mapping         (Duotone icon + description)
 *   F. Popular Categories          (Auto-scrolling chips, limited to 6)
 *   G. Women's Special Care        (Rose-gold horizontal scroll + Specifics)
 *
 * @agent: frontend-specialist  @version: 2.1
 */
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical, Heart, Droplets, Activity, Bone, Wind,
  Baby, ArrowRight,
  ChevronRight, ChevronLeft, Leaf, Zap, Brain, Star, Home
} from 'lucide-react';

import { useFadeIn } from '../hooks/useFadeIn';
import TopBookedTests from '../components/ui/TopBookedTests';
import PrescriptionReportsCards from '../components/ui/PrescriptionReportsCards';
import PopularPackagesRow from '../components/ui/PopularPackagesRow';
import WomenCareSection from '../components/ui/WomenCareSection';
import VitalOrgansSection from '../components/ui/VitalOrgansSection';
import FoodAllergyBanner from '../components/ui/FoodAllergyBanner';

import { DOCTOR_SCREENS } from '../constants/labTests';
import DoctorScreenCard from '../components/ui/DoctorScreenCard';

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
const E = '#059669'; // Emerald-600  — primary
const SL = '#64748B'; // Slate-500    — muted text

/* ═══════════════════════════════════════════════════════════════
   SECTION HEADER
   ═══════════════════════════════════════════════════════════════ */
export const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  cta?: { label: string; onClick: () => void };
  accentColor?: string;
}> = ({ title, subtitle, cta, accentColor = E }) => (
  <div className="flex items-end justify-between mb-5 gap-4">
    <div>
      <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[13px] mt-1 font-medium" style={{ color: SL }}>
          {subtitle}
        </p>
      )}
    </div>
    {cta && (
      <button
        onClick={cta.onClick}
        className="shrink-0 flex items-center gap-1.5 text-[13px] font-bold px-4 py-1.5 rounded-full border transition-all hover:shadow-sm active:scale-95"
        style={{
          color: accentColor,
          borderColor: `${accentColor}40`,
          background: `${accentColor}08`,
        }}
      >
        {cta.label}
        <ChevronRight className="w-3.5 h-3.5" strokeWidth={3} />
      </button>
    )}
  </div>
);


/* ═══════════════════════════════════════════════════════════════
   SECTION F — Popular Categories Chips
   ═══════════════════════════════════════════════════════════════ */
const POPULAR_CATS = [
  { label: 'CBC', slug: 'cbc', icon: FlaskConical, color: '#0369A1' },
  { label: 'Lipid Profile', slug: 'lipid-profile', icon: Heart, color: '#E11D48' },
  { label: 'HbA1c', slug: 'diabetes', icon: Droplets, color: '#0EA5E9' },
  { label: "Women's Health", slug: 'womens-health', icon: Baby, color: '#DB2777' },
  { label: 'Thyroid (TSH)', slug: 'thyroid', icon: Brain, color: '#7C3AED' },
  { label: 'Vitamin D', slug: 'vitamin', icon: Zap, color: '#D97706' },
  { label: 'Liver (LFT)', slug: 'liver', icon: Leaf, color: '#EA580C' },
  { label: 'Kidney (KFT)', slug: 'kidney', icon: FlaskConical, color: '#059669' },
  { label: 'Vitamin B12', slug: 'vitamin', icon: Zap, color: '#7C3AED' },
];

const CategoryChip: React.FC<{ item: typeof POPULAR_CATS[0] }> = ({ item }) => {
  const navigate = useNavigate();
  const Icon = item.icon;
  return (
    <button
      onClick={() => navigate(`/lab-tests/all-lab-tests?category=${encodeURIComponent(item.label)}`)}
      className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-md transition-all duration-150 cursor-pointer group whitespace-nowrap"
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${item.color}12` }}>
        <Icon className="w-3.5 h-3.5" style={{ color: item.color }} strokeWidth={2} />
      </div>
      <span className="text-[13px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{item.label}</span>
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
const FadeSection: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const ref = useFadeIn();
  return <div ref={ref} className={`fade-up ${className}`}>{children}</div>;
};

const Divider: React.FC = () => <div className="w-full h-px bg-slate-100 my-1" />;

const PAGE = 'max-w-[1200px] w-full mx-auto px-4 md:px-5';

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
const TestListingPage: React.FC = () => {
  const navigate = useNavigate();
  const catScrollRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);

  // Auto-scroll for categories
  useEffect(() => {
    const timer = setInterval(() => {
      if (catScrollRef.current && !isHovered.current) {
        const { scrollLeft, scrollWidth, clientWidth } = catScrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 1) {
          catScrollRef.current.scrollLeft = 0;
        } else {
          catScrollRef.current.scrollLeft += 0.8;
        }
      }
    }, 45);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className={`${PAGE} pt-5 pb-2 md:pt-6 md:pb-3`}>
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-3">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3 mb-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1 px-4 py-1 rounded-full border border-[#b8cfdb] text-[#005f7b] text-[10px] font-black uppercase tracking-[0.16em] hover:bg-white/70"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <nav aria-label="Breadcrumb" className="inline-flex items-center text-[11px] font-black uppercase tracking-[0.14em]">
                <span className="inline-flex items-center gap-1 text-[#6f9fb3] cursor-pointer hover:text-[#5c8ea3]" onClick={() => navigate('/')}>
                  <Home className="w-3.5 h-3.5" />
                  Home
                </span>
                <ChevronRight className="w-3.5 h-3.5 mx-1 text-[#a8c0cb]" />
                <span className="text-[#005d79]">Lab Tests</span>
              </nav>
            </div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 bg-cyan-500/10 backdrop-blur-md rounded-xl border border-cyan-500/20 shadow-sm">
                <FlaskConical className="w-5 h-5 text-cyan-600" />
              </div>
              <span className="text-[clamp(0.62rem,0.58rem+0.16vw,0.72rem)] font-black uppercase tracking-[0.22em] text-cyan-800/60">
                TEST DISCOVERY / LISTING
              </span>
            </div>
            <h1 className="text-[clamp(1.7rem,1.2rem+1.7vw,2.7rem)] font-black text-[#164E63] tracking-tight mb-2.5 uppercase">
              All <span className="text-cyan-600">Lab Tests</span>
            </h1>
            <p className="text-[clamp(0.84rem,0.8rem+0.3vw,1rem)] text-cyan-900/60 font-medium leading-relaxed">
              Browse expert-curated screenings, top booked tests, and package bundles in one place.
            </p>
          </div>

          <div className="flex gap-3 p-2 bg-white/40 backdrop-blur-md rounded-xl border border-white/60">
            <div className="px-4 py-2 bg-white/60 rounded-lg border border-white/80 shadow-sm text-center min-w-[84px]">
              <span className="block text-[clamp(1.1rem,0.95rem+0.5vw,1.4rem)] font-black text-cyan-700 tracking-tight">{DOCTOR_SCREENS.length}</span>
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Panels</span>
            </div>
            <div className="px-4 py-2 bg-white/60 rounded-lg border border-white/80 shadow-sm text-center min-w-[84px]">
              <span className="block text-[clamp(1.1rem,0.95rem+0.5vw,1.4rem)] font-black text-emerald-600 tracking-tight">{POPULAR_CATS.length}</span>
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Categories</span>
            </div>
            <div className="px-4 py-2 bg-white/60 rounded-lg border border-white/80 shadow-sm text-center min-w-[84px]">
              <Zap className="w-4 h-4 text-cyan-500 mx-auto" />
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Live</span>
            </div>
          </div>
        </header>
      </div>

      {/* A — Expert-Curated Screenings */}
      <FadeSection>
        <div className={`${PAGE} pt-2 pb-4`}>
          <SectionHeader
            title="Expert-Curated Screenings"
            subtitle="Doctor-designed panels for 29 health conditions"
            cta={{
              label: 'View All Screenings',
              onClick: () => navigate('/category-listing/doctor-created-health-check')
            }}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-2 md:gap-3">
            {DOCTOR_SCREENS.slice(0, 16).map(item => (
              <DoctorScreenCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </FadeSection>

      <Divider />

      {/* B — Most Booked Individual Tests */}
      <FadeSection>
        <div className={`${PAGE} py-6`}>
          <SectionHeader title="Most Booked Tests" subtitle="Trusted by 2 million+ patients across India" cta={{ label: 'View All 43 Tests', onClick: () => navigate('/lab-tests/all-lab-tests') }} />
          <TopBookedTests />
        </div>
      </FadeSection>

      <Divider />

      {/* C — Prescription Cards */}
      <FadeSection><div className={`${PAGE} py-6`}><PrescriptionReportsCards /></div></FadeSection>

      <Divider />

      {/* D — Popular Health Packages */}
      <FadeSection>
        <div className={`${PAGE} py-6`}>
          <SectionHeader title="Popular Health Packages" subtitle="Comprehensive bundles with Smart Report — best value" cta={{ label: 'View All Packages', onClick: () => navigate('/packages') }} accentColor="#7C3AED" />
          <PopularPackagesRow />
        </div>
      </FadeSection>

      <Divider />

      {/* E — Vital Organ Mapping */}
      <FadeSection>
        <div className={`${PAGE} py-6`}>
          <SectionHeader title="Smart Organ Health Mapping" subtitle="Targeted tests to monitor what matters most" cta={{ label: 'Explore Vital Organs', onClick: () => navigate('/category-listing/vital-organs') }} />
          <VitalOrgansSection />
        </div>
      </FadeSection>

      <Divider />

      {/* F — Popular Categories Auto-Scroll Chips */}
      <FadeSection>
        <div className={`${PAGE} py-6`}>
          <SectionHeader title="Browse by Category" subtitle="Quick access to 34 specialized health screening categories" cta={{ label: 'View All', onClick: () => navigate('/category-listing/popular-categories') }} />
          <div
            ref={catScrollRef}
            className="flex gap-2.5 overflow-x-auto no-scrollbar py-1"
            onMouseEnter={() => (isHovered.current = true)}
            onMouseLeave={() => (isHovered.current = false)}
          >
            {POPULAR_CATS.slice(0, 6).map(cat => <CategoryChip key={cat.label} item={cat} />)}

            {/* View All & Explore More */}
            <button
              onClick={() => navigate('/lab-tests/all-lab-tests')}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[13px] font-black text-white transition-all hover:shadow-lg active:scale-95 shrink-0"
              style={{ background: `linear-gradient(135deg, ${E} 0%, #047857 100%)` }}
            >
              <Star className="w-3.5 h-3.5" />
              Explore All 500+ Tests
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </FadeSection>

      <Divider />

      {/* G — Special Care for Women + Expansion */}
      <FadeSection>
        <div className={`${PAGE} py-6`}>
          <SectionHeader title="Special Care for Women" subtitle="Gynaecologist-recommended health panels for every life stage" cta={{ label: 'Women Wellness', onClick: () => navigate('/test-listing/women-wellness') }} accentColor="#DB2777" />
          <WomenCareSection />
        </div>
      </FadeSection>

      <Divider />

      {/* Food & Allergy Banner */}
      <FadeSection><div className={`${PAGE} py-6`}><FoodAllergyBanner /></div></FadeSection>

    </div>
  );
};

export default TestListingPage;
