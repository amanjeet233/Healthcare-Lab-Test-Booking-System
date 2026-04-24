import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import CategoryTile from '../components/ui/CategoryTile';
import { getCategoryIcon } from '../assets/categoryIcons';
import { useFadeIn } from '../hooks/useFadeIn';
import { DOCTOR_SCREENS, VITAL_ORGANS, POPULAR_CATEGORIES, WOMEN_CARE } from '../constants/labTests';
import DoctorScreenCard from '../components/ui/DoctorScreenCard';
import PremiumCategoryCard from '../components/ui/PremiumCategoryCard';

interface TileData {
  label: string;
  slug: string;
  bg: string;
  icon: any;
  iconColor: string;
  desc: string;
}

/* ──────────────────────────────────────────────────────────────────
   CATEGORY LISTING PAGE
   @agent: frontend-specialist  @seo: seo-specialist

   Routes: /category-listing/:slug
   Slugs: vital-organs | doctor-created-health-check
          popular-categories | women-care
   ────────────────────────────────────────────────────────────────── */

/* ── Page config with SEO text ───────────────────────────────────── */
const PAGE_CONFIG: Record<string, {
  title: string;
  subtitle: string;
  tiles: TileData[];
  accent: string;
  emoji: string;
  seoText: string;
  seoFAQ: { q: string; a: string }[];
}> = {
  'vital-organs': {
    title: 'Vital Organs',
    subtitle: 'Browse tests by organ system and keep your vitals in check',
    emoji: '🫀',
    tiles: VITAL_ORGANS,
    accent: '#0D7C7C',
    seoText: `Your vital organs — heart, kidney, liver, thyroid, and lungs — work tirelessly to keep your body functioning. Early detection of organ dysfunction can prevent life-threatening conditions. MedSync offers comprehensive organ-specific blood tests with home sample collection and reports delivered within 6–48 hours. Whether you need a cardiac risk panel, LFT, RFT, thyroid profile, or a full-body checkup, every test is processed in NABL-accredited labs.`,
    seoFAQ: [
      { q: 'Which organs can I test at home?', a: 'Heart, Kidney, Liver, Thyroid, and Lungs can all be tested via blood samples collected at home.' },
      { q: 'How early can organ disease be detected?', a: 'Routine blood tests can detect organ abnormalities 3–5 years before symptoms appear in most cases.' },
      { q: 'Are reports available digitally?', a: 'Yes, all reports are available on the MedSync app and web portal within 6–48 hours.' },
    ],
  },
  'doctor-created-health-check': {
    title: 'Doctor-Created Health Checks',
    subtitle: 'Curated diagnostic panels recommended by top physicians',
    emoji: '🩺',
    tiles: DOCTOR_SCREENS,
    accent: '#1D4ED8',
    seoText: `These health check panels were designed by MedSync's senior physicians to cover the most critical biomarkers in a single draw. From CBC and lipid profiles to PCOD panels and cardiac risk assessments — each panel is evidence-based, cost-effective, and bundled for maximum diagnostic yield. Each panel includes a free physician consultation to help interpret your results.`,
    seoFAQ: [
      { q: 'Who designed these health check panels?', a: "These panels were curated by MedSync's senior specialists and reviewed annually." },
      { q: 'Does the panel include a consultation?', a: 'Yes, each panel includes a free online doctor consultation to discuss your results.' },
      { q: 'Can I get a PDF report?', a: 'Yes, a smart digital PDF report is generated, shareable with any doctor.' },
    ],
  },
  'popular-categories': {
    title: 'All Popular Categories',
    subtitle: 'Find the right test from our complete catalogue of 29 categories',
    emoji: '🏷️',
    tiles: POPULAR_CATEGORIES,
    accent: '#7C3AED',
    seoText: `MedSync Lab Tests covers 29 major health categories with over 3,000 individual tests. From diabetes, heart, and thyroid to women's health, cancer markers, and allergy panels — every test is run in NABL & ISO-certified partner labs with free home collection across 900+ cities in India. Track your health with annual checkups and smart digital health records powered by MedSync's AI-driven insights.`,
    seoFAQ: [
      { q: 'How many test categories does MedSync offer?', a: 'MedSync offers tests across 29 health categories covering 3,000+ individual tests.' },
      { q: 'Is home sample collection available in all cities?', a: 'Yes, free home collection is available in 900+ cities across India.' },
      { q: 'Are tests NABL-accredited?', a: 'All tests are performed at NABL and ISO 15189-certified partner labs.' },
    ],
  },
  'women-care': {
    title: 'Women Care',
    subtitle: 'Comprehensive health panels designed exclusively for women',
    emoji: '👩',
    tiles: WOMEN_CARE,
    accent: '#BE185D',
    seoText: `Women's health requires dedicated attention across different life stages — from PCOD and hormonal balance to pregnancy tracking, fertility, iron deficiency, and menopause. MedSync Women Care packages are designed by gynaecologists and endocrinologists to give a complete picture of female health. All packages include home sample collection and a free online gynaecologist consultation.`,
    seoFAQ: [
      { q: 'Which women health tests can I book from home?', a: 'PCOD, hormone panels, thyroid, iron studies, vitamin D, pregnancy tests and more are available with home sample collection.' },
      { q: 'Is a gynaecologist consultation included?', a: "Yes, all women's health packages include a free online gynaecologist consultation." },
      { q: 'How early should women start routine health checkups?', a: 'Doctors recommend annual health screenings starting at age 21, with PCOD and thyroid screening from age 18.' },
    ],
  },
};

/* ── Breadcrumb ─────────────────────────────────────────────────── */
const Breadcrumb: React.FC<{ pageName: string }> = ({ pageName }) => (
  <nav aria-label="Breadcrumb">
    <ol className="flex items-center gap-1.5 text-xs text-slate-400 font-medium flex-wrap">
      <li>
        <Link to="/" className="hover:text-slate-700 transition-colors flex items-center gap-1">
          <Home className="w-3 h-3" />Home
        </Link>
      </li>
      <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
      <li>
        <Link to="/lab-tests" className="hover:text-slate-700 transition-colors">Lab Tests</Link>
      </li>
      <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
      <li className="text-slate-700 font-semibold">{pageName}</li>
    </ol>
  </nav>
);

/* ── SEO FAQ Accordion ───────────────────────────────────────────── */
const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-3 py-3 text-left text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
        aria-expanded={open}
      >
        <span>{q}</span>
        <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 transition-transform text-slate-400 ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <p className="text-[13px] text-slate-500 leading-relaxed pb-3">{a}</p>
      )}
    </div>
  );
};

/* ── Main Page ───────────────────────────────────────────────────── */
const CategoryListingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const gridRef = useFadeIn();
  const seoRef  = useFadeIn(0.05);

  const config = PAGE_CONFIG[slug ?? ''] ?? PAGE_CONFIG['popular-categories'];

  // Set document title for SEO
  useEffect(() => {
    document.title = `${config.title} Tests — MedSync Lab Tests`;
  }, [config.title]);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero header ─────────────────────────────────────────── */}
      <div
        className="w-full px-4 md:px-8 pt-6 pb-8"
        style={{
          background: `linear-gradient(135deg, ${config.accent}15 0%, white 70%)`,
          borderBottom: `3px solid ${config.accent}22`,
        }}
      >
        <Breadcrumb pageName={config.title} />

        <div className="mt-5 flex items-start gap-4">
          <span className="text-5xl leading-none">{config.emoji}</span>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
              {config.title}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1 max-w-xl">
              {config.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* ── Category tile grid ──────────────────────────────────── */}
      <div ref={gridRef} className="fade-up px-4 md:px-8 py-8">
        <div className={`grid ${slug === 'doctor-created-health-check' || slug === 'vital-organs' ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8'} gap-3 lg:gap-4`}>
          {slug === 'doctor-created-health-check' 
            ? DOCTOR_SCREENS.map((item) => (
                <DoctorScreenCard key={item.slug} item={item} />
              ))
            : config.tiles.map((tile) => (
                <PremiumCategoryCard key={`${tile.label}-${tile.slug}`} item={tile} />
              ))
          }
        </div>
      </div>

      {/* ── View all tests CTA ──────────────────────────────────── */}
      <div className="text-center pb-6">
        <button
          onClick={() => navigate('/lab-tests/all-lab-tests')}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white text-sm font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 hover:-translate-y-0.5"
          style={{ background: config.accent }}
        >
          View All Tests
          <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>

      {/* ── SEO section ─────────────────────────────────────────── */}
      <div ref={seoRef} className="fade-up mx-4 md:mx-8 mb-10 rounded-2xl bg-white border border-slate-100 shadow-sm p-6 md:p-8 max-w-4xl">
        <h2 className="text-base font-black text-slate-800 mb-3">
          About {config.title} Tests
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          {config.seoText}
        </p>

        <h3 className="text-sm font-black text-slate-700 mb-2">
          Frequently Asked Questions
        </h3>
        {config.seoFAQ.map(({ q, a }) => (
          <FAQItem key={q} q={q} a={a} />
        ))}
      </div>
    </div>
  );
};

export default CategoryListingPage;
