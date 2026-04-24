import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Tag, 
    Flame, 
    Clock, 
    Filter, 
    Loader2, 
    Copy, 
    ExternalLink, 
    ChevronRight,
    ChevronLeft,
    ChevronDown, 
    Check, 
    Gift,
    ShieldCheck,
    ArrowRight,
    SearchX,
    Sparkles,
    Ticket,
    Plus,
    Pencil,
    Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { promoCodeService } from '../../services/PromoCodeService';
import type { PromoCode } from '../../types/promo';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';

interface FilterOptions {
  type: 'all' | 'percentage' | 'flat';
  sortBy: 'newest' | 'discount' | 'expiry';
  searchQuery: string;
}

const PromoCodesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin/');
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    sortBy: 'newest',
    searchQuery: ''
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedPromo, setExpandedPromo] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FLAT',
    discountValue: 10,
    minCartValue: 0,
    maxDiscount: 0,
    expiryDate: ''
  });

  useEffect(() => {
    fetchPromoCodes();
  }, [location.pathname]);

  useEffect(() => {
    applyFilters();
  }, [filters, promoCodes]);

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const codes = isAdminRoute
        ? await promoCodeService.getAdminPromoCodes()
        : await promoCodeService.getAvailablePromoCodes();
      setPromoCodes(codes);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast.error('Failed to load rewards vault.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...promoCodes];

    if (filters.type !== 'all') {
      filtered = filtered.filter(
        (code) => code.discount_type.toLowerCase() === filters.type
      );
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (code) =>
          code.code.toLowerCase().includes(query) ||
          code.description.toLowerCase().includes(query)
      );
    }

    switch (filters.sortBy) {
      case 'discount':
        filtered.sort((a, b) => b.discount_value - a.discount_value);
        break;
      case 'expiry':
        filtered.sort(
          (a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
        );
        break;
      case 'newest':
      default:
        filtered.sort(
          (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
        break;
    }

    setFilteredCodes(filtered);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`COPIED: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const resetEditor = () => {
    setEditingPromoId(null);
    setForm({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minCartValue: 0,
      maxDiscount: 0,
      expiryDate: ''
    });
  };

  const startEdit = (promo: PromoCode) => {
    setEditingPromoId(String(promo.id));
    setForm({
      code: promo.code,
      description: promo.description || '',
      discountType: promo.discount_type,
      discountValue: promo.discount_value || 0,
      minCartValue: promo.min_cart_value || 0,
      maxDiscount: promo.max_discount || 0,
      expiryDate: promo.expiry_date ? promo.expiry_date.slice(0, 10) : ''
    });
    setShowEditor(true);
  };

  const handleSavePromo = async () => {
    if (!form.code.trim()) {
      toast.error('Promo code is required');
      return;
    }
    if (!form.expiryDate) {
      toast.error('Expiry date is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description,
        discountType: form.discountType,
        discountValue: Number(form.discountValue || 0),
        minCartValue: Number(form.minCartValue || 0),
        maxDiscount: Number(form.maxDiscount || 0),
        expiryDate: form.expiryDate,
        isActive: true
      };

      if (editingPromoId) {
        await promoCodeService.updatePromoCode(editingPromoId, payload);
        toast.success('Promo code updated');
      } else {
        await promoCodeService.createPromoCode(payload);
        toast.success('Promo code created');
      }

      setShowEditor(false);
      resetEditor();
      await fetchPromoCodes();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save promo code');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm('Delete this promo code?')) {
      return;
    }
    try {
      await promoCodeService.deletePromoCode(id);
      toast.success('Promo code deleted');
      await fetchPromoCodes();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete promo code');
    }
  };

  const getDiscountText = (promo: PromoCode) => {
    if (promo.discount_type === 'PERCENTAGE') {
      return `${promo.discount_value}% OFF`;
    } else {
      return `₹${promo.discount_value} OFF`;
    }
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  if (loading && promoCodes.length === 0) {
      return (
          <div className="min-h-[80vh] flex items-center justify-center">
              <div className="text-center">
                  <div className="relative">
                      <Ticket size={48} className="text-cyan-600/20 mx-auto" strokeWidth={1} />
                      <Loader2 size={24} className="text-cyan-600 animate-spin absolute inset-0 m-auto" />
                  </div>
                  <p className="mt-4 text-cyan-800/60 font-black text-[10px] uppercase tracking-widest animate-pulse">Decrypting Reward Vault...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 min-h-screen">
      <div className="inline-flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 px-4 py-1 rounded-full border border-[#b8cfdb] text-[#005f7b] text-[10px] font-black uppercase tracking-[0.16em] hover:bg-white/70"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <nav className="inline-flex items-center text-[11px] font-black uppercase tracking-[0.14em]">
          <span className="text-[#6f9fb3] cursor-pointer hover:text-[#5c8ea3]" onClick={() => navigate('/')}>Home</span>
          <ChevronRight className="w-3.5 h-3.5 mx-1 text-[#a8c0cb]" />
          <span className="text-[#005d79]">Promo Codes</span>
        </nav>
      </div>

      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 mb-16">
          <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/20 shadow-sm text-amber-500">
                      <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-cyan-800/60">
                      Rewards / Incentives
                  </span>
              </div>
              <h1 className="text-5xl font-black text-[#164E63] tracking-tighter mb-4">
                  Exclusive <span className="text-cyan-600">Promos</span>
              </h1>
              <p className="text-lg text-cyan-900/60 font-medium leading-relaxed">
                  Unlock high-value diagnostic credits and incentive packages. Premium discounts for prioritized healthcare extraction.
              </p>
          </div>

            <div className="flex flex-wrap gap-4 flex-1 max-w-2xl">
              <GlassCard className="flex-1 py-6 flex flex-col items-center justify-center text-center border-white">
                   <Tag className="text-emerald-500 mb-3" size={20} />
                   <span className="text-3xl font-black text-[#164E63] tracking-tighter leading-none mb-1">{promoCodes.length}</span>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Offers</span>
              </GlassCard>
              <GlassCard className="flex-1 py-6 flex flex-col items-center justify-center text-center border-white">
                   <Flame className="text-rose-500 mb-3" size={20} />
                   <span className="text-3xl font-black text-[#164E63] tracking-tighter leading-none mb-1">
                       {Math.max(...promoCodes.map((p) => p.discount_value), 0)}%
                   </span>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Max Intensity</span>
              </GlassCard>
              {isAdminRoute && (
                <GlassButton
                  className="px-6 py-4"
                  icon={<Plus size={18} />}
                  onClick={() => {
                    if (showEditor) {
                      setShowEditor(false);
                      resetEditor();
                    } else {
                      resetEditor();
                      setShowEditor(true);
                    }
                  }}
                >
                  {showEditor ? 'CLOSE EDITOR' : 'NEW PROMO'}
                </GlassButton>
              )}
          </div>
      </header>

      {isAdminRoute && showEditor && (
        <GlassCard className="mb-8 border-white/40">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
              placeholder="Code"
              className="bg-white/50 border border-white rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider text-[#164E63] outline-none"
            />
            <input
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
              className="bg-white/50 border border-white rounded-xl px-4 py-3 text-xs font-bold text-[#164E63] outline-none"
            />
            <select
              value={form.discountType}
              onChange={(e) => setForm((prev) => ({ ...prev, discountType: e.target.value as 'PERCENTAGE' | 'FLAT' }))}
              className="bg-white/50 border border-white rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider text-[#164E63] outline-none"
            >
              <option value="PERCENTAGE">PERCENTAGE</option>
              <option value="FLAT">FLAT</option>
            </select>
            <input
              type="number"
              value={form.discountValue}
              onChange={(e) => setForm((prev) => ({ ...prev, discountValue: Number(e.target.value || 0) }))}
              placeholder="Discount"
              className="bg-white/50 border border-white rounded-xl px-4 py-3 text-xs font-bold text-[#164E63] outline-none"
            />
            <input
              type="number"
              value={form.minCartValue}
              onChange={(e) => setForm((prev) => ({ ...prev, minCartValue: Number(e.target.value || 0) }))}
              placeholder="Min cart value"
              className="bg-white/50 border border-white rounded-xl px-4 py-3 text-xs font-bold text-[#164E63] outline-none"
            />
            <input
              type="number"
              value={form.maxDiscount}
              onChange={(e) => setForm((prev) => ({ ...prev, maxDiscount: Number(e.target.value || 0) }))}
              placeholder="Max discount"
              className="bg-white/50 border border-white rounded-xl px-4 py-3 text-xs font-bold text-[#164E63] outline-none"
            />
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm((prev) => ({ ...prev, expiryDate: e.target.value }))}
              className="bg-white/50 border border-white rounded-xl px-4 py-3 text-xs font-bold text-[#164E63] outline-none"
            />
            <div className="flex items-center gap-2">
              <GlassButton className="py-3 px-4" onClick={handleSavePromo} disabled={saving}>
                {saving ? 'SAVING...' : editingPromoId ? 'UPDATE' : 'CREATE'}
              </GlassButton>
              <GlassButton
                variant="secondary"
                className="py-3 px-4"
                onClick={() => {
                  setShowEditor(false);
                  resetEditor();
                }}
              >
                CANCEL
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard className="mb-12 border-white/40">
        <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 w-full">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Scan Codes</label>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600/50" size={18} />
                    <input 
                      type="text"
                      placeholder="Enter referral or sequence tags..."
                      value={filters.searchQuery}
                      onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                      className="w-full bg-white/50 border border-white/50 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#164E63] transition-all"
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-end gap-6 w-full lg:w-auto">
                <div className="flex-1 lg:flex-none min-w-[160px]">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Protocol Filter</label>
                    <div className="relative">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600/40" />
                        <select
                          value={filters.type}
                          onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                          className="w-full bg-white/50 border border-white rounded-2xl pl-10 pr-8 py-3.5 text-[11px] font-black text-[#164E63] uppercase tracking-widest outline-none cursor-pointer appearance-none"
                        >
                          <option value="all">ALL TYPES</option>
                          <option value="percentage">PERCENTAGE</option>
                          <option value="flat">FLAT CREDIT</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 lg:flex-none min-w-[160px]">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Sequencing</label>
                    <div className="relative">
                        <ArrowRight size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600/40 rotate-90" />
                        <select
                          value={filters.sortBy}
                          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                          className="w-full bg-white/50 border border-white rounded-2xl pl-10 pr-8 py-3.5 text-[11px] font-black text-[#164E63] uppercase tracking-widest outline-none cursor-pointer appearance-none"
                        >
                          <option value="newest">LATEST UPDATES</option>
                          <option value="discount">HIGH INTENSITY</option>
                          <option value="expiry">EXPIRING NODES</option>
                        </select>
                    </div>
                </div>

                {(filters.searchQuery || filters.type !== 'all' || filters.sortBy !== 'newest') && (
                    <GlassButton variant="secondary" className="py-3.5 px-6" onClick={() => setFilters({ type: 'all', sortBy: 'newest', searchQuery: '' })}>
                        RESET
                    </GlassButton>
                )}
            </div>
        </div>
      </GlassCard>

      <AnimatePresence mode="popLayout">
        {filteredCodes.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-32 text-center">
              <SearchX size={48} className="text-slate-200 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-[#164E63] tracking-tight">No Active Sequences</h3>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-tighter mt-2">Try adjusting your spectral search.</p>
          </motion.div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCodes.map((promo, idx) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <GlassCard className={`h-full p-0 overflow-hidden flex flex-col group border-white/40 transition-all ${isExpired(promo.expiry_date) ? 'grayscale opacity-60' : 'hover:border-cyan-400/50 hover:shadow-cyan-900/5'}`}>
                   <div className="p-8 flex-1">
                      <div className="flex justify-between items-start mb-6">
                         <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
                            isExpired(promo.expiry_date) ? 'bg-slate-100 text-slate-400' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                         }`}>
                             {getDiscountText(promo)}
                         </div>
                         {isExpired(promo.expiry_date) && (
                            <span className="text-[8px] font-black tracking-[0.2em] text-rose-500 uppercase italic">VOIDED</span>
                         )}
                      </div>

                      <div className="relative mb-6">
                        <h3 className="text-3xl font-black text-[#164E63] tracking-tighter uppercase mb-2 group-hover:text-cyan-600 transition-colors">
                            {promo.code}
                        </h3>
                        <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-tighter">
                            {promo.description}
                        </p>
                      </div>

                      <div className="space-y-4 mb-8">
                         <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-300">Minimum Order</span>
                            <span className="text-[#164E63]">₹{promo.min_cart_value || 0}</span>
                         </div>
                         <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-300">Valid Until</span>
                            <span className="text-[#164E63] flex items-center gap-1.5">
                                <Clock size={12} className="text-cyan-600/50" />
                                {new Date(promo.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                         </div>
                      </div>

                      <div className="flex gap-2">
                         <GlassButton 
                           onClick={() => handleCopyCode(promo.code)}
                           className={`flex-1 py-4 ${copiedCode === promo.code ? 'bg-emerald-500 text-white border-emerald-400' : ''}`}
                           disabled={isExpired(promo.expiry_date)}
                           icon={copiedCode === promo.code ? <Check size={18} /> : <Copy size={18} />}
                         >
                            {copiedCode === promo.code ? 'COPIED' : 'COPY'}
                         </GlassButton>
                         <GlassButton 
                           variant="tertiary"
                           className="py-4 px-4"
                           onClick={() => setExpandedPromo(expandedPromo === promo.id ? null : promo.id)}
                           icon={<ChevronDown size={20} className={`transition-transform duration-300 ${expandedPromo === promo.id ? 'rotate-180' : ''}`} />}
                         />
                         {isAdminRoute && (
                           <>
                             <GlassButton
                               variant="secondary"
                               className="py-4 px-4"
                               onClick={() => startEdit(promo)}
                               icon={<Pencil size={16} />}
                             />
                             <GlassButton
                               variant="secondary"
                               className="py-4 px-4"
                               onClick={() => handleDeletePromo(String(promo.id))}
                               icon={<Trash2 size={16} />}
                             />
                           </>
                         )}
                      </div>
                   </div>

                   <AnimatePresence>
                     {expandedPromo === promo.id && (
                       <motion.div
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="overflow-hidden bg-gradient-to-br from-cyan-500/5 to-transparent border-t border-white/20"
                       >
                         <div className="p-8 space-y-6">
                             <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Protocol Terms</h4>
                                <ul className="grid grid-cols-2 gap-y-3">
                                   <li className="flex flex-col">
                                      <span className="text-[8px] font-black text-slate-300 uppercase">Limit</span>
                                      <span className="text-[11px] font-black text-[#164E63] uppercase">{promo.usage_limit || 'UNLIMITED'}</span>
                                   </li>
                                   <li className="flex flex-col">
                                      <span className="text-[8px] font-black text-slate-300 uppercase">Redeemed</span>
                                      <span className="text-[11px] font-black text-[#164E63] uppercase">{promo.used_count || 0}</span>
                                   </li>
                                   {promo.max_discount && (
                                     <li className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-300 uppercase">Intensity Cap</span>
                                        <span className="text-[11px] font-black text-[#164E63] uppercase">₹{promo.max_discount}</span>
                                     </li>
                                   )}
                                </ul>
                             </div>

                             {promo.is_applicable_to_all ? (
                                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                                   <ShieldCheck size={16} className="text-emerald-500" />
                                   <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Global Protocol Alignment</span>
                                </div>
                             ) : (
                                <div>
                                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Compatible Targets</h4>
                                   <div className="flex flex-wrap gap-2">
                                      {promo.applicable_tests?.slice(0, 4).map((test, i) => (
                                         <span key={i} className="px-2.5 py-1 bg-white/50 border border-white rounded-lg text-[9px] font-black text-cyan-800/60 uppercase tracking-tighter">{test}</span>
                                      ))}
                                      {(promo.applicable_tests?.length || 0) > 4 && (
                                         <span className="px-2.5 py-1 text-[9px] font-black text-slate-300 uppercase">+{(promo.applicable_tests?.length || 0) - 4} More</span>
                                      )}
                                   </div>
                                </div>
                             )}

                             <GlassButton 
                                variant="secondary" 
                                className="w-full py-4 text-[10px]"
                                onClick={() => window.location.href = `/cart?promo=${promo.code}`}
                                icon={<ExternalLink size={14} />}
                             >
                                ACTIVATE SEQUENCE
                             </GlassButton>
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-24"
      >
          <GlassCard className="p-12 border-white/60 bg-[#164E63]/5">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                  <div className="lg:w-1/3">
                      <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6">
                          <Gift size={32} className="text-amber-500" />
                      </div>
                      <h3 className="text-3xl font-black text-[#164E63] tracking-tighter uppercase mb-2">How to Redeem?</h3>
                      <p className="text-slate-400 font-bold text-sm uppercase tracking-tighter leading-relaxed">Systematic instructions for incentive activation during checkout.</p>
                  </div>
                  <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[
                        { step: '01', title: 'Target Selection', desc: 'Add required diagnostic protocols to your laboratory cart.' },
                        { step: '02', title: 'Secure Check', desc: 'Proceed to localized checkout and verify sequence parameters.' },
                        { step: '03', title: 'Code Injection', desc: 'Manual enter or paste the promo tag in the activation field.' },
                        { step: '04', title: 'Value Capture', desc: 'Confirm validation and finalize payment with credit applied.' }
                      ].map((step, i) => (
                        <div key={i} className="flex gap-5">
                            <span className="text-4xl font-black text-cyan-600/20 leading-none">{step.step}</span>
                            <div>
                                <h4 className="text-xs font-black text-[#164E63] uppercase tracking-widest mb-1">{step.title}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-normal">{step.desc}</p>
                            </div>
                        </div>
                      ))}
                  </div>
              </div>
          </GlassCard>
      </motion.section>
    </div>
  );
};

export default PromoCodesPage;
