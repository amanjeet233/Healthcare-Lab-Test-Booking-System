import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  BadgeCheck,
  Check,
  Clock,
  Copy,
  ChevronLeft,
  Droplet,
  ExternalLink,
  Info,
  Share2,
  Shield
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { notify } from '../utils/toast';
import { getEnhancedTestDetails } from '../utils/testDetailsContent';
import type { LabTestResponse, TestFAQ, LifestyleTip } from '../types/labTest';
import './packages/PackageDetailPage.css';

const TestDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { addTest, setIsCartOpen } = useCart();

  const [test, setTest] = useState<LabTestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tests' | 'preparation' | 'compare'>('tests');
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [bookingNow, setBookingNow] = useState(false);
  const [recommendedAddons, setRecommendedAddons] = useState<Array<{ id: number; name: string; price: number; slug?: string }>>([]);
  const reportHours = Number(test?.reportTimeHours || 24);
  const parametersCount = Number(test?.containsTests || 1);
  const compareCandidates = useMemo(
    () => [
      { name: 'Current Test', price: Number(test?.price || 0), hours: reportHours, params: parametersCount, current: true },
      { name: 'Extended Profile', price: Math.round(Number(test?.price || 0) * 1.7), hours: reportHours + 12, params: parametersCount + 6, current: false },
      { name: 'Comprehensive Panel', price: Math.round(Number(test?.price || 0) * 2.4), hours: reportHours + 24, params: parametersCount + 12, current: false }
    ],
    [test?.price, reportHours, parametersCount]
  );

  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);
        if (!slug) throw new Error('No test slug provided');
        const isNumeric = /^\d+$/.test(slug);
        const url = isNumeric
          ? `/api/lab-tests/${slug}`
          : `/api/lab-tests/code/${encodeURIComponent(slug)}`;
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error('Test not found');
        const payload = await res.json();
        const response = (payload?.data || payload) as LabTestResponse;
        if (!response) throw new Error('Test not found');
        setTest(getEnhancedTestDetails(response.id, response));
      } catch (error) {
        console.error('Error loading test:', error);
        notify.error('Failed to load test details');
        navigate('/lab-tests');
      } finally {
        setLoading(false);
      }
    };
    void loadTest();
    window.scrollTo(0, 0);
  }, [slug, navigate]);

  useEffect(() => {
    const loadRecommendedAddons = async () => {
      if (!test?.id) return;
      try {
        const params = new URLSearchParams({
          page: '0',
          size: '12'
        });
        if (test.category) params.set('category', test.category);
        const res = await fetch(`/api/lab-tests?${params.toString()}`, { headers: { Accept: 'application/json' } });
        if (!res.ok) return;
        const payload = await res.json();
        const raw =
          payload?.data?.content ||
          payload?.data ||
          payload?.content ||
          payload ||
          [];
        const list = (Array.isArray(raw) ? raw : [])
          .map((row: any) => ({
            id: Number(row?.id),
            name: String(row?.testName || row?.name || 'Lab Test'),
            price: Number(row?.price || row?.discountedPrice || 0),
            slug: row?.slug || row?.testCode || row?.id
          }))
          .filter((row: any) => row.id && row.id !== Number(test.id))
          .slice(0, 3);
        setRecommendedAddons(list);
      } catch {
        setRecommendedAddons([]);
      }
    };
    void loadRecommendedAddons();
  }, [test?.id, test?.category]);

  const handleBookNow = async () => {
    if (!test || bookingNow) return;
    setBookingNow(true);
    try {
      setIsCartOpen(false);
      navigate('/booking', {
        state: {
          cartItems: [{
            testId: test.id,
            testName: test.testName || test.name || 'Test',
            name: test.testName || test.name || 'Test',
            quantity: 1,
            price: test.price
          }],
          total: test.price
        }
      });
    } catch {
      notify.error('Failed to proceed with booking');
    } finally {
      setBookingNow(false);
    }
  };

  const handleAddToCart = async () => {
    if (!test || addingToCart) return;
    setAddingToCart(true);
    try {
      await addTest(test.id, test.testName || test.name || 'Test', test.price, 1);
    } catch {
      notify.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify.success('Link copied');
    } catch {
      notify.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (!test) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: test.testName,
          text: `${test.testName} - ₹${test.price}`,
          url: window.location.href
        });
        return;
      }
      await handleCopyLink();
    } catch {
      // ignored
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D7C7C]" />
      </div>
    );
  }

  if (!test) return null;

  const discountPercentage = test.originalPrice
    ? Math.max(0, Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100))
    : 0;
  const fastingHours = Number(test.fastingHours || 8);
  const cleanTitle = (() => {
    const raw = String(test.testName || '').replace(/\s+/g, ' ').trim();
    if (!raw) return 'Lab Test';
    if (raw.length <= 64) return raw;
    const cutAt = raw.search(/\b(helps|is|used|for|provides|diagnosis)\b/i);
    if (cutAt > 16) return raw.slice(0, cutAt).trim();
    return `${raw.slice(0, 64).trim()}...`;
  })();
  const heroOneLine = (() => {
    const source = String(test.knownAbout || '').replace(/\s+/g, ' ').trim();
    if (!source) return 'Important diagnostic test for clinical assessment and monitoring.';
    const firstSentence = source.split('.').map((s) => s.trim()).find((s) => s.length > 20) || source;
    return `${firstSentence.replace(/\.$/, '')}.`;
  })();
  const titleWords = cleanTitle.split(' ');
  const titleMain = titleWords.slice(0, 1).join(' ') || cleanTitle;
  const titleAccent = titleWords.slice(1).join(' ');

  return (
    <div className="packages-page test-details-page compact-ui flex flex-col font-sans">
      <div className="w-full px-4 md:px-6 lg:px-10 mb-2">
        <div className="flex items-center gap-3 text-[11px]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#c5d7df] text-[#0a6077] text-[10px] font-black uppercase tracking-[0.14em] hover:bg-white"
          >
            <ChevronLeft size={14} />
            Back
          </button>
          <nav className="inline-flex items-center text-[11px] font-black uppercase tracking-[0.14em]">
            <span className="text-[#6f9fb3] cursor-pointer hover:text-[#5c8ea3]" onClick={() => navigate('/')}>Home</span>
            <span className="mx-2.5 text-[#a8c0cb]">{'>'}</span>
            <span className="text-[#0a6077] cursor-pointer hover:text-[#084e61]" onClick={() => navigate('/lab-tests')}>Test</span>
            <span className="mx-2.5 text-[#a8c0cb]">{'>'}</span>
            <span className="text-[#005d79]">{test.testName || 'Test Details'}</span>
          </nav>
        </div>
      </div>
      <div className="package-details-hero pt-4 pb-4 px-3 md:px-4 relative">
        <div className="max-w-[1080px] mx-auto relative z-10 hero-grid">
          <div className="flex-1">
            <div className="details-eyebrow mb-3">
              <span className="details-eyebrow-icon"><Activity size={22} /></span>
              <span className="details-eyebrow-text">DIAGNOSTIC / TEST PROFILE</span>
            </div>
            <h1 className="details-hero-title">
              <span className="test-title-main">{titleMain}{titleAccent ? ' ' : ''}</span>
              <span className="test-title-accent">{titleAccent}</span>
            </h1>
            <p className="details-hero-subtitle">{test.category || 'General Health'}</p>
            <p className="text-[13px] md:text-sm font-semibold text-slate-600 leading-5 line-clamp-1 text-justify max-w-3xl">
              {heroOneLine}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                <BadgeCheck size={12} /> NABL Certified
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-full">
                <Shield size={12} /> Verified Report
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
                <Clock size={12} /> Digital Report
              </span>
            </div>

            <div className="details-chip-row">
              <div className="details-chip">
                <Droplet className="w-5 h-5 text-rose-500" />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Fasting</span>
                  <span className="text-xs font-black text-slate-800">{test.fastingRequired ? `${fastingHours} Hours` : 'Not Required'}</span>
                </div>
              </div>
              <div className="details-chip">
                <Clock className="w-5 h-5 text-cyan-600" />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Reports In</span>
                  <span className="text-xs font-black text-slate-800">{reportHours} Hours</span>
                </div>
              </div>
              <div className="details-chip">
                <Shield className="w-5 h-5 text-emerald-600" />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Tests Included</span>
                  <span className="text-xs font-black text-slate-800">{parametersCount} Parameter{parametersCount > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>

          <aside className="package-detail-card sticky top-20 self-start">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black tracking-widest text-[#0d7c7c] uppercase">SILVER SERIES</span>
              {discountPercentage > 0 && (
                <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1 rounded-full border border-red-100">
                  SAVE {discountPercentage}%
                </span>
              )}
            </div>
            <div className="flex items-end gap-1.5 mb-3.5">
              <span className="text-[32px] leading-none font-black text-[#0f1f47]">₹{test.price}</span>
              {test.originalPrice && (
                <span className="text-xs text-slate-400 line-through mb-1">₹{test.originalPrice}</span>
              )}
              <Info size={16} className="text-slate-400 mb-1" />
            </div>

            <div className="space-y-1.5 mb-3">
              {['Home Sample Collection', 'Smart Report via App', 'NABL Accredited LAB'].map((feat) => (
                <div key={feat} className="flex items-center gap-1.5 text-[12px] text-[#334a68] font-medium">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 inline-flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleBookNow}
              disabled={bookingNow}
              className="w-full h-8 rounded-xl text-[11px] tracking-wider font-black uppercase transition-colors bg-[#0d7c7c] text-white hover:bg-[#0b6868]"
            >
              {bookingNow ? 'Processing...' : 'BOOK NOW'}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="mt-1 w-full h-8 rounded-xl text-[11px] tracking-wider font-black uppercase transition-colors border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {addingToCart ? 'Adding...' : 'ADD TO CART'}
            </button>
            <div className="mt-1 flex items-center gap-1">
              <button onClick={handleShare} className="flex-1 h-6 rounded-lg border border-slate-200 text-[8px] font-bold text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center gap-1">
                <Share2 size={13} /> Share
              </button>
              <button onClick={handleCopyLink} className="flex-1 h-6 rounded-lg border border-slate-200 text-[8px] font-bold text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center gap-1">
                <Copy size={13} /> Copy Link
              </button>
            </div>

            <div className="mt-2 pt-1.5 border-t border-slate-100">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Recommended Add-ons</div>
              <div className="space-y-1.5">
                {recommendedAddons.map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-200 p-1.5">
                    <div className="text-[10px] font-bold text-slate-700 leading-tight line-clamp-2">{item.name}</div>
                    <div className="mt-0.5 flex items-center justify-between">
                      <span className="text-[11px] font-black text-[#164E63]">₹{item.price}</span>
                      <button
                        onClick={() => navigate(`/test/${item.slug || item.id}`)}
                        className="text-[9px] font-bold text-cyan-700 inline-flex items-center gap-1"
                      >
                        View <ExternalLink size={11} />
                      </button>
                    </div>
                  </div>
                ))}
                {recommendedAddons.length === 0 && (
                  <p className="text-[11px] text-slate-400">No recommended add-ons available.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <main className="flex-1 max-w-[1080px] mx-auto w-full px-3 md:px-4 py-3 pb-8">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 mb-5">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {['tests', 'preparation', 'compare'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'tests' | 'preparation' | 'compare')}
                className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === tab ? 'border-[#0D7C7C] text-[#0D7C7C]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                {tab === 'tests' ? 'Tests Included' : tab === 'preparation' ? 'Preparation & Info' : 'Compare'}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'tests' && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-slate-500 mb-3">
                  This test provides focused diagnostic measurement and supports clinical decision making.
                </p>
                <div className="package-detail-content-card text-left overflow-hidden">
                  <div className="w-full flex items-center justify-between p-3 bg-transparent border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white text-[#0D7C7C] border border-slate-200 rounded-xl"><Activity size={16} /></div>
                      <div className="text-left">
                        <h3 className="text-sm font-black text-slate-800">{test.testName}</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{parametersCount} Parameter{parametersCount > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 pt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {(test.benefits || []).slice(0, 6).map((item, idx) => (
                      <div key={`${item}-${idx}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0D7C7C]" />
                        <span className="text-xs font-medium text-slate-700">{item}</span>
                      </div>
                    ))}
                    {(!test.benefits || test.benefits.length === 0) && (
                      <p className="text-xs text-slate-400 col-span-2 px-2 py-2">No additional test details available.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preparation' && (
              <div className="package-detail-content-card text-left p-3 space-y-4">
                <div>
                  <h3 className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-2 flex items-center gap-2"><Droplet size={12} /> Sample Requirements</h3>
                  <div className="p-2.5 bg-orange-50 border border-orange-100 rounded-lg text-orange-800 text-xs font-medium">
                    {test.fastingRequired
                      ? `Please ensure you fast for ${fastingHours} hours before sample collection. Water is allowed unless instructed otherwise.`
                      : 'No strict fasting required for this test.'}
                  </div>
                </div>
                <div>
                  <h3 className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-2">FAQs</h3>
                  <div className="space-y-2">
                    {((test.faqs || []) as TestFAQ[]).slice(0, 5).map((item, idx) => (
                      <div key={idx} className="rounded-lg border border-slate-200 bg-white">
                        <button
                          onClick={() => setFaqOpen((prev) => (prev === idx ? null : idx))}
                          className="w-full p-2.5 text-left flex items-center justify-between gap-3"
                        >
                          <span className="text-xs font-semibold text-slate-700">{item.question}</span>
                          <span className="text-slate-400">{faqOpen === idx ? '−' : '+'}</span>
                        </button>
                        {faqOpen === idx && (
                          <p className="px-2.5 pb-2.5 text-xs text-slate-600">{item.answer}</p>
                        )}
                      </div>
                    ))}
                    {(!test.faqs || test.faqs.length === 0) && (
                      <p className="text-xs text-slate-500">No preparation FAQs available.</p>
                    )}
                  </div>
                </div>
                {test.lifestyleTips && test.lifestyleTips.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-2">Lifestyle Tips</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(test.lifestyleTips as LifestyleTip[]).slice(0, 4).map((tip, idx) => (
                        <div key={idx} className="rounded-lg border border-slate-200 p-2">
                          <p className="text-xs font-semibold text-slate-700">{tip.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{tip.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'compare' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {compareCandidates.map((item, idx) => (
                  <div key={`${item.name}-${idx}`} className={`rounded-xl border p-3 ${item.current ? 'border-cyan-400 bg-cyan-50/40' : 'border-slate-200 bg-white'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Option {idx + 1}</span>
                      {item.current && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700">Current</span>}
                    </div>
                    <h4 className="text-sm font-black text-slate-800 line-clamp-2 min-h-[38px]">{item.name}</h4>
                    <p className="mt-1 text-[11px] text-slate-500">{item.params} parameters</p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-lg font-black text-[#164E63]">₹{item.price}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">Report in {item.hours}h</p>
                    {!item.current && (
                      <button
                        onClick={() => navigate(`/lab-tests/all-lab-tests?category=${encodeURIComponent(test.category || 'general')}`)}
                        className="mt-3 h-8 w-full rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center gap-1"
                      >
                        Explore <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default TestDetailPage;
