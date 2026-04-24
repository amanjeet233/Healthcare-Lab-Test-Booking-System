import React from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

/**
 * Shows ONLY on mobile (md:hidden).
 * Sticky bottom bar: Cart icon with badge + "Book a Test" burnt-orange button.
 */
const MobileStickyBar: React.FC = () => {
  const navigate = useNavigate();
  const { cart, setIsCartOpen } = useCart();
  const itemCount = cart?.itemCount ?? cart?.items?.length ?? 0;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg px-4 py-3 flex items-center gap-3">
      {/* Cart icon with badge */}
      <button
        onClick={() => setIsCartOpen(true)}
        aria-label="Open Cart"
        className="relative w-11 h-11 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-200 shrink-0"
      >
        <ShoppingCart className="w-5 h-5 text-slate-600" strokeWidth={2} />
        {itemCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black text-white flex items-center justify-center shadow"
            style={{ background: '#C2410C' }}
          >
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        )}
      </button>

      {/* Book a Test button */}
      <button
        onClick={() => navigate('/lab-tests')}
        className="flex-1 py-3 rounded-xl text-white text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
        style={{ background: '#C2410C' }}
      >
        Book a Test
        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default MobileStickyBar;
