import React from 'react';
import { DollarSign, ShieldCheck, Truck, Clock } from 'lucide-react';

interface OrderSummaryProps {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  itemCount: number;
  onCheckout?: () => void;
  checkoutText?: string;
  isSubmitting?: boolean;
  showInfo?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  subtotal = 0,
  discount = 0,
  tax = 0,
  total = 0,
  itemCount = 0,
  onCheckout,
  checkoutText = "Proceed to Checkout",
  isSubmitting = false,
  showInfo = true
}) => {
  return (
    <div className="bg-white/40 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl p-8 border border-white/60 sticky top-24 transform transition-all duration-500 hover:shadow-blue-500/10 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent pointer-events-none"></div>
      
      <h3 className="text-[10px] font-black text-gray-900 mb-8 flex items-center justify-between uppercase tracking-[0.2em] relative z-10">
        Order Strategic Summary
        <span className="bg-blue-600 text-white text-[8px] px-3 py-1 rounded-lg font-black tracking-widest shadow-lg shadow-blue-500/20">{itemCount} {itemCount === 1 ? 'Unit' : 'Units'}</span>
      </h3>

      <div className="space-y-6 relative z-10">
        <div className="flex justify-between items-center text-gray-500">
          <span className="text-[9px] font-black uppercase tracking-widest">Subtotal Allocation</span>
          <span className="text-lg font-black text-gray-900 tracking-tighter">₹{subtotal.toFixed(0)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between items-center text-emerald-600">
            <span className="text-[9px] font-black uppercase tracking-widest">Benefit Applied</span>
            <span className="text-lg font-black tracking-tighter">-₹{discount.toFixed(0)}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-gray-500">
          <span className="text-[9px] font-black uppercase tracking-widest">Regulatory Tax (18%)</span>
          <span className="text-lg font-black text-gray-900 tracking-tighter">₹{tax.toFixed(0)}</span>
        </div>

        <div className="pt-6 border-t border-gray-200/50">
          <div className="flex justify-between items-end">
             <div>
                <span className="block text-[9px] font-black text-gray-900 uppercase tracking-widest mb-1">Total Payload</span>
                <span className="text-[7px] font-bold text-gray-400 uppercase tracking-[0.2em]">Incl. all clinical taxes</span>
             </div>
            <div className="text-right">
                <span className="block text-4xl font-black bg-gradient-to-br from-blue-600 to-indigo-700 bg-clip-text text-transparent tracking-tighter shadow-sm">₹{total.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {onCheckout && (
          <button
            onClick={onCheckout}
            disabled={isSubmitting}
            className="w-full mt-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 relative overflow-hidden group/btn"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
            <span className="relative z-10">{checkoutText}</span>
          </button>
        )}

        {showInfo && (
          <div className="mt-10 grid gap-5">
            {[
              { icon: ShieldCheck, text: 'Tier-1 Certified Collection', color: 'bg-emerald-50 text-emerald-600' },
              { icon: Clock, text: 'Clinical Reporting: 24h Sync', color: 'bg-blue-50 text-blue-600' }
            ].map((info, idx) => (
              <div key={idx} className="flex items-center gap-4 group/info">
                <div className={`w-10 h-10 rounded-2xl ${info.color} flex items-center justify-center transition-all group-hover/info:scale-110 shadow-sm border border-current opacity-20 group-hover/info:opacity-100`}>
                  <info.icon className="w-4 h-4" />
                </div>
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">{info.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
