import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowUp, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../hooks/useCart';

/* ──────────────────────────────────────────────────────────────────
   GlobalOverlays — Prompt 15 Polish

   1. Back-to-top button: appears after 400px scroll, smooth scroll to top
   2. Mobile sticky cart bar: fixed bottom bar on mobile (< md) showing
      item count and "Book Now" button that opens the cart drawer.
      Hidden on cart/checkout pages.
──────────────────────────────────────────────────────────────────*/

const TEAL = '#0D7C7C';
const ORANGE = '#C2410C';

const HIDE_STICKY_ROUTES = ['/cart', '/checkout', '/payment'];

const GlobalOverlays: React.FC = () => {
  const { cart, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [showBackTop, setShowBackTop]   = useState(false);
  const [isMobile,    setIsMobile]      = useState(false);

  /* ── Detect scroll ──────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Detect mobile breakpoint ───────────────────────────────── */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const itemCount  = cart?.itemCount ?? 0;
  const subtotal   = cart?.subtotal ?? 0;

  const hideStickyBar = HIDE_STICKY_ROUTES.some(r =>
    location.pathname.startsWith(r)
  );

  const showStickyBar = isMobile && !hideStickyBar && itemCount > 0;

  return (
    <>
      {/* ── Back to top ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showBackTop && (
          <motion.button
            key="back-top"
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            onClick={scrollToTop}
            aria-label="Back to top"
            className={[
              'fixed z-40 shadow-lg rounded-full flex items-center justify-center',
              'w-11 h-11 transition-all hover:scale-110 active:scale-95',
              // On mobile: bottom-[88px] to sit above sticky bar; on desktop: bottom-6
              isMobile && showStickyBar ? 'bottom-[96px]' : 'bottom-6',
              'right-4',
            ].join(' ')}
            style={{ background: TEAL, color: '#fff' }}
          >
            <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Mobile sticky cart bar ──────────────────────────────── */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            key="sticky-cart"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', stiffness: 280, damping: 25 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
          >
            <div
              className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 shadow-2xl"
              style={{ background: '#fff' }}
            >
              {/* Item count info */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 text-left flex-1 min-w-0"
                aria-label="Open cart"
              >
                <div
                  className="relative p-2.5 rounded-xl shrink-0"
                  style={{ background: `${TEAL}15` }}
                >
                  <ShoppingBag className="w-5 h-5" style={{ color: TEAL }} />
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-black text-white rounded-full flex items-center justify-center"
                    style={{ background: '#EF4444' }}
                  >
                    {itemCount}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-black text-slate-800 leading-tight">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
                  </p>
                  <p className="text-[11px] font-bold" style={{ color: TEAL }}>
                    ₹{subtotal.toLocaleString('en-IN')}
                  </p>
                </div>
              </button>

              {/* Book Now button */}
              <button
                onClick={() => navigate('/cart')}
                className="shrink-0 px-5 py-2.5 rounded-xl text-white text-[13px] font-black uppercase tracking-wide transition-all active:scale-95 hover:opacity-90"
                style={{ background: ORANGE }}
                aria-label="Proceed to book"
              >
                Book Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalOverlays;
