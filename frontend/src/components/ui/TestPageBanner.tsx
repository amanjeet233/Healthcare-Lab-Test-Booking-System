import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── Inline SVG Illustrations ─────────────────────────────────────── */
const HeartSVG = () => (
  <svg viewBox="0 0 160 160" fill="none" className="w-full h-full">
    <circle cx="80" cy="80" r="68" fill="white" fillOpacity="0.18"/>
    <path d="M80 120s-42-28-42-57c0-15 12-27 27-27 7 0 15 6 15 6s8-6 15-6c15 0 27 12 27 27 0 29-42 57-42 57z" fill="white" fillOpacity="0.95"/>
    <path d="M57 75l10 0 5-10 7 18 5-12 4 4 11 0" stroke="#E11D48" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="118" cy="38" r="8" fill="white" fillOpacity="0.3"/>
    <circle cx="35" cy="108" r="5" fill="white" fillOpacity="0.2"/>
  </svg>
);

const DiabetesSVG = () => (
  <svg viewBox="0 0 160 160" fill="none" className="w-full h-full">
    <circle cx="80" cy="80" r="68" fill="white" fillOpacity="0.18"/>
    <rect x="50" y="45" width="60" height="74" rx="12" fill="white" fillOpacity="0.9"/>
    <rect x="60" y="58" width="40" height="6" rx="3" fill="#F59E0B" fillOpacity="0.6"/>
    <rect x="60" y="70" width="40" height="5" rx="2.5" fill="#FEF3C7"/>
    <rect x="60" y="80" width="28" height="5" rx="2.5" fill="#FEF3C7"/>
    <rect x="61" y="92" width="38" height="17" rx="5" fill="#F59E0B" fillOpacity="0.2" stroke="#F59E0B" strokeWidth="1.2"/>
    <text x="80" y="104" textAnchor="middle" fill="#B45309" fontSize="8" fontWeight="bold">5.4 mmol/L</text>
    <circle cx="118" cy="50" r="9" fill="white" fillOpacity="0.25"/>
    <circle cx="40" cy="112" r="6" fill="white" fillOpacity="0.2"/>
  </svg>
);

const FullBodySVG = () => (
  <svg viewBox="0 0 160 160" fill="none" className="w-full h-full">
    <circle cx="80" cy="80" r="68" fill="white" fillOpacity="0.18"/>
    <circle cx="80" cy="45" r="16" fill="white" fillOpacity="0.85"/>
    <path d="M60 68 Q52 95 54 124 L72 124 L80 104 L88 124 L106 124 Q108 95 100 68 Q90 80 80 80 Q70 80 60 68Z" fill="white" fillOpacity="0.85"/>
    <path d="M61 73 Q49 90 47 112" stroke="white" strokeWidth="9" strokeLinecap="round"/>
    <path d="M99 73 Q111 90 113 112" stroke="white" strokeWidth="9" strokeLinecap="round"/>
    <circle cx="80" cy="80" r="24" fill="#0D7C7C" fillOpacity="0.22"/>
    <path d="M70 80 L77 88 L92 72" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="120" cy="42" r="7" fill="white" fillOpacity="0.2"/>
    <circle cx="35" cy="118" r="5" fill="white" fillOpacity="0.2"/>
  </svg>
);

const WomenSVG = () => (
  <svg viewBox="0 0 160 160" fill="none" className="w-full h-full">
    <circle cx="80" cy="80" r="68" fill="white" fillOpacity="0.18"/>
    <circle cx="80" cy="48" r="18" fill="white" fillOpacity="0.88"/>
    <path d="M58 74 Q50 98 54 128 L76 128 L80 110 L84 128 L106 128 Q110 98 102 74 Q92 86 80 86 Q68 86 58 74Z" fill="white" fillOpacity="0.88"/>
    <circle cx="66" cy="72" r="6" fill="#EC4899" fillOpacity="0.4"/>
    <circle cx="94" cy="72" r="6" fill="#EC4899" fillOpacity="0.4"/>
    <circle cx="80" cy="45" r="5" fill="#EC4899" fillOpacity="0.35"/>
    <circle cx="115" cy="38" r="8" fill="white" fillOpacity="0.25"/>
    <circle cx="36" cy="105" r="6" fill="white" fillOpacity="0.2"/>
  </svg>
);

const VitaminsSVG = () => (
  <svg viewBox="0 0 160 160" fill="none" className="w-full h-full">
    <circle cx="80" cy="80" r="68" fill="white" fillOpacity="0.18"/>
    <rect x="48" y="62" width="64" height="36" rx="18" fill="white" fillOpacity="0.9"/>
    <path d="M80 62 Q112 62 112 80 Q112 98 80 98Z" fill="#A78BFA" fillOpacity="0.45"/>
    <line x1="80" y1="62" x2="80" y2="98" stroke="#A78BFA" strokeWidth="1.5"/>
    <path d="M118 48 L121 56 L129 56 L123 61 L125 69 L118 65 L111 69 L113 61 L107 56 L115 56Z" fill="white" fillOpacity="0.65"/>
    <path d="M36 108 L38 113 L43 113 L39 116 L40 121 L36 118 L32 121 L33 116 L29 113 L34 113Z" fill="white" fillOpacity="0.4"/>
    <circle cx="35" cy="55" r="7" fill="white" fillOpacity="0.2"/>
  </svg>
);

const CancerSVG = () => (
  <svg viewBox="0 0 160 160" fill="none" className="w-full h-full">
    <circle cx="80" cy="80" r="68" fill="white" fillOpacity="0.18"/>
    <circle cx="80" cy="80" r="32" fill="white" fillOpacity="0.88"/>
    <circle cx="80" cy="80" r="20" fill="#14B8A6" fillOpacity="0.25"/>
    <path d="M80 48 L80 40 M80 120 L80 112 M48 80 L40 80 M120 80 L112 80" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <path d="M58 58 L52 52 M102 58 L108 52 M58 102 L52 108 M102 102 L108 108" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="80" cy="80" r="8" fill="#14B8A6" fillOpacity="0.55"/>
    <circle cx="116" cy="38" r="7" fill="white" fillOpacity="0.2"/>
    <circle cx="36" cy="36" r="5" fill="white" fillOpacity="0.15"/>
  </svg>
);

/* ─── Slide Data ─────────────────────────────────────────────────── */
const SLIDES = [
  {
    id: 0,
    headline: 'Know Your Heart Health Today',
    desc: 'ECG, Lipid Profile, hs-CRP & more — full cardiac risk in one panel',
    bg: 'linear-gradient(130deg, #0D7C7C 0%, #2DD4BF 100%)',
    href: '/lab-tests-category/heart',
    illustration: <HeartSVG />,
  },
  {
    id: 1,
    headline: 'Control Diabetes Before It Controls You',
    desc: 'HbA1c, FBS, PPBS & Insulin — complete diabetes monitoring kit',
    bg: 'linear-gradient(130deg, #D97706 0%, #FCD34D 100%)',
    href: '/lab-tests-category/diabetes',
    illustration: <DiabetesSVG />,
  },
  {
    id: 2,
    headline: 'Full Body Checkup — 90+ Parameters',
    desc: 'CBC, Thyroid, Liver, Kidney, Vitamins & more. Free home collection.',
    bg: 'linear-gradient(130deg, #0D8A5C 0%, #6EE7B7 100%)',
    href: '/lab-tests-category/full-body-checkup',
    illustration: <FullBodySVG />,
  },
  {
    id: 3,
    headline: "Complete Women's Health Panel",
    desc: 'Hormones, PCOD, Thyroid, Bone health & fertility markers',
    bg: "linear-gradient(130deg, #BE185D 0%, #F9A8D4 100%)",
    href: '/category-listing/women-care',
    illustration: <WomenSVG />,
  },
  {
    id: 4,
    headline: 'Vitamin Deficiency? Know Now.',
    desc: 'Vitamin D, B12, Iron, Zinc & Folate — act before symptoms appear',
    bg: 'linear-gradient(130deg, #7C3AED 0%, #C4B5FD 100%)',
    href: '/lab-tests-category/vitamin',
    illustration: <VitaminsSVG />,
  },
  {
    id: 5,
    headline: 'Early Cancer Screening Saves Lives',
    desc: 'PSA, CA-125, CEA, AFP & more tumour markers in one panel',
    bg: 'linear-gradient(130deg, #0E7490 0%, #67E8F9 100%)',
    href: '/lab-tests-category/cancer-markers',
    illustration: <CancerSVG />,
  },
];

const INTERVAL_MS = 4000;
const DRAG_THRESHOLD = 50;

const variants = {
  enter: { x: '100%', opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
};

const TestPageBanner: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();
  const touchX = useRef<number | null>(null);

  const goTo = useCallback((n: number) =>
    setCurrent((n + SLIDES.length) % SLIDES.length), []);
  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(goNext, INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused, goNext]);

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const d = touchX.current - e.changedTouches[0].clientX;
    if (Math.abs(d) > DRAG_THRESHOLD) d > 0 ? goNext() : goPrev();
    touchX.current = null;
  };

  const slide = SLIDES[current];

  return (
    <div className="w-full px-4 md:px-6 py-3">
      <div
        className="relative w-full rounded-2xl overflow-hidden shadow-md"
        style={{ height: 'clamp(110px, 16vw, 190px)' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Slides */}
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={slide.id}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', ease: [0.25, 0.46, 0.45, 0.94], duration: 0.45 }}
            className="absolute inset-0 flex items-center px-6 md:px-10"
            style={{ background: slide.bg }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.08}
            onDragEnd={(_, info) => {
              if (info.offset.x < -DRAG_THRESHOLD) goNext();
              else if (info.offset.x > DRAG_THRESHOLD) goPrev();
            }}
          >
            {/* Left text */}
            <div className="flex-1 space-y-1.5 pr-4">
              <h2 className="text-sm md:text-lg lg:text-xl font-black text-white leading-tight tracking-tight drop-shadow">
                {slide.headline}
              </h2>
              <p className="text-[10px] md:text-xs text-white/80 font-medium hidden sm:block leading-snug">
                {slide.desc}
              </p>
              <button
                onClick={() => navigate(slide.href)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C2410C] text-white text-[10px] md:text-xs font-black uppercase tracking-wider shadow-lg hover:bg-[#9A3412] transition-all active:scale-95"
              >
                Book Now <ArrowRight className="w-3 h-3" strokeWidth={3} />
              </button>
            </div>

            {/* Right illustration */}
            <div className="shrink-0 w-[72px] sm:w-[100px] md:w-[130px] lg:w-[155px] h-[72px] sm:h-[100px] md:h-[130px] lg:h-[155px] pointer-events-none">
              {slide.illustration}
            </div>

            {/* Blob decorations */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none bg-white"
              style={{ transform: 'translate(30%,-40%)' }} />
          </motion.div>
        </AnimatePresence>

        {/* Arrow Buttons */}
        <button
          onClick={goPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-sm flex items-center justify-center text-white shadow transition-all active:scale-90"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <button
          onClick={goNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-sm flex items-center justify-center text-white shadow transition-all active:scale-90"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? '14px' : '5px',
                height: '5px',
                background: i === current ? 'white' : 'rgba(255,255,255,0.45)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestPageBanner;
