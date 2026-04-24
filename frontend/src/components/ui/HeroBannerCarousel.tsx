import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface Slide {
  id: number;
  headline: string;
  subheadline: string;
  description: string;
  cta: string;
  ctaHref: string;
  bg: string;          // Tailwind bg-* or arbitrary
  textColor: string;   // headline colour
  accentColor: string; // badge / subhead colour
  illustration: React.ReactNode;
}

/* ─── SVG Illustrations ─────────────────────────────────────────────────── */

const HeartIllustration = () => (
  <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
    <circle cx="110" cy="110" r="90" fill="white" fillOpacity="0.15"/>
    <path d="M110 160 C110 160 55 120 55 85 C55 65 70 50 90 50 C100 50 110 58 110 58 C110 58 120 50 130 50 C150 50 165 65 165 85 C165 120 110 160 110 160Z"
      fill="white" fillOpacity="0.9"/>
    <path d="M85 90 L98 90 L104 78 L110 102 L116 84 L120 90 L135 90"
      stroke="#E11D48" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="160" cy="55" r="12" fill="white" fillOpacity="0.3"/>
    <circle cx="52" cy="140" r="8" fill="white" fillOpacity="0.2"/>
  </svg>
);

const ThyroidIllustration = () => (
  <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
    <circle cx="110" cy="110" r="90" fill="white" fillOpacity="0.13"/>
    <ellipse cx="90" cy="120" rx="30" ry="38" fill="white" fillOpacity="0.85"/>
    <ellipse cx="130" cy="120" rx="30" ry="38" fill="white" fillOpacity="0.85"/>
    <rect x="100" y="100" width="20" height="40" rx="6" fill="white"/>
    <circle cx="90" cy="110" r="8" fill="#6366F1" fillOpacity="0.6"/>
    <circle cx="130" cy="110" r="8" fill="#6366F1" fillOpacity="0.6"/>
    <line x1="110" y1="90" x2="110" y2="75" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="110" cy="68" r="8" fill="white" fillOpacity="0.5"/>
    <circle cx="52" cy="60" r="10" fill="white" fillOpacity="0.2"/>
    <circle cx="165" cy="155" r="7" fill="white" fillOpacity="0.2"/>
  </svg>
);

const DiabetesIllustration = () => (
  <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
    <circle cx="110" cy="110" r="90" fill="white" fillOpacity="0.13"/>
    <rect x="70" y="75" width="80" height="95" rx="16" fill="white" fillOpacity="0.88"/>
    <rect x="82" y="90" width="56" height="8" rx="4" fill="#10B981" fillOpacity="0.6"/>
    <rect x="82" y="106" width="56" height="6" rx="3" fill="#D1FAE5"/>
    <rect x="82" y="120" width="40" height="6" rx="3" fill="#D1FAE5"/>
    {/* Glucose meter display */}
    <rect x="84" y="136" width="52" height="22" rx="6" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="1.5"/>
    <text x="110" y="151" textAnchor="middle" fill="#059669" fontSize="11" fontWeight="bold">5.4 mmol</text>
    <circle cx="155" cy="78" r="12" fill="white" fillOpacity="0.25"/>
    <circle cx="60" cy="148" r="8" fill="white" fillOpacity="0.2"/>
  </svg>
);

const FullBodyIllustration = () => (
  <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
    <circle cx="110" cy="110" r="90" fill="white" fillOpacity="0.13"/>
    {/* Body outline */}
    <circle cx="110" cy="65" r="22" fill="white" fillOpacity="0.8"/>
    <path d="M85 95 Q75 130 78 165 L100 165 L110 140 L120 165 L142 165 Q145 130 135 95 Q122 110 110 110 Q98 110 85 95Z" fill="white" fillOpacity="0.8"/>
    {/* Arms */}
    <path d="M85 100 Q68 120 65 148" stroke="white" strokeWidth="12" strokeLinecap="round" fillOpacity="0.8"/>
    <path d="M135 100 Q152 120 155 148" stroke="white" strokeWidth="12" strokeLinecap="round" fillOpacity="0.8"/>
    {/* Checkmark overlay */}
    <circle cx="110" cy="110" r="32" fill="#0D7C7C" fillOpacity="0.25"/>
    <path d="M96 110 L106 120 L124 102" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="163" cy="60" r="10" fill="white" fillOpacity="0.2"/>
    <circle cx="52" cy="155" r="7" fill="white" fillOpacity="0.2"/>
  </svg>
);

const VitaminIllustration = () => (
  <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
    <circle cx="110" cy="110" r="90" fill="white" fillOpacity="0.13"/>
    {/* Pill capsule */}
    <rect x="68" y="88" width="84" height="44" rx="22" fill="white" fillOpacity="0.9"/>
    <path d="M110 88 Q152 88 152 110 Q152 132 110 132Z" fill="#F59E0B" fillOpacity="0.5"/>
    <line x1="110" y1="88" x2="110" y2="132" stroke="#F59E0B" strokeWidth="2"/>
    {/* Sparkles */}
    <path d="M160 70 L163 78 L171 78 L165 83 L167 91 L160 87 L153 91 L155 83 L149 78 L157 78Z" fill="white" fillOpacity="0.6"/>
    <path d="M55 145 L57 150 L62 150 L58 153 L59 158 L55 155 L51 158 L52 153 L48 150 L53 150Z" fill="white" fillOpacity="0.4"/>
    <circle cx="50" cy="75" r="8" fill="white" fillOpacity="0.2"/>
    <circle cx="168" cy="148" r="6" fill="white" fillOpacity="0.2"/>
  </svg>
);

/* ─── Slide Data ─────────────────────────────────────────────────────────── */

const SLIDES: Slide[] = [
  {
    id: 0,
    headline: 'Care For Your Heart!',
    subheadline: 'Cardiac Health',
    description: 'Comprehensive cardiac risk assessment with Lipid Profile, hs-CRP, ECG & more. Reports in 24 hours.',
    cta: 'Book Heart Package',
    ctaHref: '/packages',
    bg: 'linear-gradient(135deg, #FFDDE1 0%, #FF8FAB 100%)',
    textColor: '#7F1D1D',
    accentColor: '#E11D48',
    illustration: <HeartIllustration />,
  },
  {
    id: 1,
    headline: 'Balance Your Thyroid!',
    subheadline: 'Thyroid Wellness',
    description: 'T3, T4, TSH and advanced anti-body tests to monitor your thyroid health with precision.',
    cta: 'Book Thyroid Tests',
    ctaHref: '/tests?category=THYROID',
    bg: 'linear-gradient(135deg, #EDE9FE 0%, #A78BFA 100%)',
    textColor: '#3B0764',
    accentColor: '#7C3AED',
    illustration: <ThyroidIllustration />,
  },
  {
    id: 2,
    headline: 'Control Your Diabetes!',
    subheadline: 'Diabetes Management',
    description: 'FBS, PPBS, HbA1c and Insulin levels tracked together — your complete diabetes monitoring kit.',
    cta: 'Book Diabetes Panel',
    ctaHref: '/tests?category=DIABETES',
    bg: 'linear-gradient(135deg, #D1FAE5 0%, #34D399 100%)',
    textColor: '#064E3B',
    accentColor: '#059669',
    illustration: <DiabetesIllustration />,
  },
  {
    id: 3,
    headline: 'Full Body Checkup!',
    subheadline: 'Complete Wellness',
    description: '90+ parameters covering CBC, Liver, Kidney, Lipid, Thyroid, Vitamins & more. Free home collection.',
    cta: 'View Packages',
    ctaHref: '/packages',
    bg: 'linear-gradient(135deg, #CCFBF1 0%, #2DD4BF 100%)',
    textColor: '#042F2E',
    accentColor: '#0D7C7C',
    illustration: <FullBodyIllustration />,
  },
  {
    id: 4,
    headline: 'Boost Your Vitamins!',
    subheadline: 'Nutrition Panel',
    description: 'Vitamin D, B12, Iron, Folate and Zinc — know your deficiencies and act before symptoms appear.',
    cta: 'Book Vitamin Tests',
    ctaHref: '/tests?category=VITAMINS',
    bg: 'linear-gradient(135deg, #FEF3C7 0%, #FCD34D 100%)',
    textColor: '#78350F',
    accentColor: '#D97706',
    illustration: <VitaminIllustration />,
  },
];

/* ─── Component ──────────────────────────────────────────────────────────── */

const INTERVAL_MS = 4000;
const DRAG_THRESHOLD = 50;

// Always slides right → left
const slideVariants = {
  enter: { x: '100%', opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
};

const HeroBannerCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();

  // Touch swipe tracking
  const touchStartX = useRef<number | null>(null);
  const dragStartX = useRef<number | null>(null);

  const goTo = useCallback((next: number) => {
    setCurrent((next + SLIDES.length) % SLIDES.length);
  }, []);

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(goNext, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, goNext]);

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > DRAG_THRESHOLD) {
      delta > 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
  };

  // Mouse drag support
  const onMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
  };
  const onMouseUp = (e: React.MouseEvent) => {
    if (dragStartX.current === null) return;
    const delta = dragStartX.current - e.clientX;
    if (Math.abs(delta) > DRAG_THRESHOLD) {
      if (delta > 0) goNext(); else goPrev();
    }
    dragStartX.current = null;
  };

  const slide = SLIDES[current];

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-3">
      {/* Card wrapper */}
      <div
        className="relative w-full overflow-hidden rounded-2xl shadow-md select-none"
        style={{ height: 'clamp(120px, 18vw, 200px)' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={slide.id}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', ease: [0.25, 0.46, 0.45, 0.94], duration: 0.5 }}
          className="absolute inset-0 flex items-center overflow-hidden"
          style={{ background: slide.bg, cursor: 'grab' }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            if (info.offset.x < -DRAG_THRESHOLD) goNext();
            else if (info.offset.x > DRAG_THRESHOLD) goPrev();
          }}
        >
          {/* Content */}
          <div className="relative z-10 w-full max-w-[1210px] mx-auto px-5 md:px-10 flex items-center h-full gap-4">
            
            {/* Left Text Block */}
            <div className="flex-1 space-y-1.5 pr-2">
              {/* Badge */}
              <span
                className="inline-block text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full"
                style={{ background: `${slide.accentColor}22`, color: slide.accentColor }}
              >
                {slide.subheadline}
              </span>

              {/* Headline */}
              <h2
                className="text-base md:text-xl lg:text-2xl font-black leading-tight tracking-tight"
                style={{ color: slide.textColor }}
              >
                {slide.headline}
              </h2>

              {/* Description */}
              <p
                className="text-[10px] md:text-[11px] font-medium leading-snug hidden sm:block"
                style={{ color: slide.textColor, opacity: 0.72 }}
              >
                {slide.description}
              </p>

              {/* CTA */}
              <button
                onClick={() => navigate(slide.ctaHref)}
                className="group inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 hover:-translate-y-0.5"
                style={{ background: slide.textColor }}
              >
                {slide.cta}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" strokeWidth={3} />
              </button>
            </div>

            {/* Right Illustration */}
            <div className="shrink-0 w-[80px] sm:w-[110px] md:w-[140px] lg:w-[170px] h-[80px] sm:h-[110px] md:h-[140px] lg:h-[170px] pointer-events-none">
              {slide.illustration}
            </div>
          </div>

          {/* Subtle decorative blobs */}
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ background: slide.accentColor, transform: 'translate(30%, -30%)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-40 h-40 rounded-full blur-2xl opacity-20 pointer-events-none"
            style={{ background: slide.accentColor, transform: 'translate(-30%, 30%)' }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Dot Indicators ──────────────────────────────────────────────── */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === current ? '16px' : '5px',
              height: '5px',
              background: i === current ? '#0D7C7C' : 'rgba(0,0,0,0.18)',
            }}
          />
        ))}
      </div>
      </div>
    </div>
  );
};

export default HeroBannerCarousel;
