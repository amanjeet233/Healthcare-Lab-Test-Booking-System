import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Ticket, 
    Zap, 
    Gift, 
    Clock, 
    Check, 
    Copy, 
    ExternalLink, 
    SearchX,
    TrendingUp,
    Sparkles,
    ShoppingCart,
    Rocket,
    Crown,
    Star,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Heart,
    Baby,
    Activity,
    Users
} from 'lucide-react';
import { promoCodeService } from '../services/PromoCodeService';
import { notify } from '../utils/toast';
import './PromotionsPage.css';

const PromotionsPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [promos, setPromos] = useState<any[]>([]);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        loadPromos();
    }, []);

    const loadPromos = async () => {
        try {
            setIsLoading(true);
            const data = await promoCodeService.getAvailablePromoCodes();
            setPromos(data || []);
        } catch (error) {
            notify.error('Failed to load promotions.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        notify.success(`Code ${code} copied to clipboard!`);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const myCoupons = [
        { code: 'FAMILY20', discount: '20%', description: 'Family packages', used: 2, expires: 'Mar 15, 2025' },
        { code: 'SENIOR30', discount: '30%', description: 'Senior health packages', used: 0, expires: 'Apr 01, 2025' }
    ];

    const categories = [
        { name: 'Cardiac', icon: Heart, discount: '30%', validUntil: 'Feb 14, 2025', color: 'red' },
        { name: 'Wellness', icon: Activity, discount: '25%', validUntil: 'Feb 28, 2025', color: 'green' },
        { name: 'Fertility', icon: Baby, discount: '20%', validUntil: 'Mar 01, 2025', color: 'purple' },
        { name: 'Diabetes', icon: Zap, discount: '35%', validUntil: 'Feb 21, 2025', color: 'blue' }
    ];

    if (isLoading) {
        return (
            <div className="promotions-page">
                <div className="loading-container">
                    <div className="modern-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="promotions-page">
            <div className="max-w-[1400px] mx-auto px-6 pt-6">
                <div className="inline-flex items-center gap-3 mb-3">
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
                        <span className="text-[#005d79]">Promotions</span>
                    </nav>
                </div>
            </div>
            <header className="promotions-header">
                <div className="header-content">
                    <h1>Promotions <span>& Special Offers</span></h1>
                    <p>Exclusive deals and discounts on health packages</p>
                </div>
            </header>

            <section className="featured-offer-section">
                <div className="featured-offer-card">
                    <div className="offer-badge">Featured</div>
                    <div className="offer-content">
                        <h2>Get 40% off on All Gold Packages</h2>
                        <p className="offer-details">
                            Valid until: <strong>Feb 28, 2025</strong> | Min Order: <strong>₹1000</strong>
                        </p>
                        <div className="offer-code">
                            <span>Use Code:</span>
                            <strong>GOLD40</strong>
                        </div>
                        <button className="shop-now-btn">
                            Shop Now <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </section>

            <section className="offers-by-category">
                <h2>Offers by Category</h2>
                <div className="category-grid">
                    {categories.map((cat, idx) => (
                        <motion.div 
                            key={cat.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`category-card ${cat.color}`}
                        >
                            <div className="category-icon">
                                <cat.icon size={28} />
                            </div>
                            <h3>{cat.name}</h3>
                            <div className="discount-badge">{cat.discount} OFF</div>
                            <p className="valid-until">Valid until {cat.validUntil}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="my-coupons-section">
                <h2>My Coupons</h2>
                <div className="coupons-list">
                    {myCoupons.map((coupon, idx) => (
                        <div key={idx} className="coupon-item">
                            <div className="coupon-info">
                                <div className="coupon-check">
                                    <Check size={16} />
                                </div>
                                <div className="coupon-details">
                                    <h4>{coupon.code} - {coupon.discount} off {coupon.description}</h4>
                                    <p>Applied: {coupon.used} times | Expires: {coupon.expires}</p>
                                </div>
                            </div>
                            <button 
                                className={`copy-btn ${copiedCode === coupon.code ? 'copied' : ''}`}
                                onClick={() => handleCopy(coupon.code)}
                            >
                                {copiedCode === coupon.code ? <Check size={14} /> : <Zap size={14} />}
                                {copiedCode === coupon.code ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="all-promos-section">
                <h2>All Available Offers</h2>
                <div className="promos-grid">
                    <AnimatePresence>
                        {promos.length > 0 ? (
                            promos.map((promo, index) => (
                                <motion.div 
                                    key={promo.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="promo-card"
                                >
                                    <div className="promo-header">
                                        <div className="promo-icon">
                                            <Ticket size={24} />
                                        </div>
                                        <div className="promo-discount">
                                            {promo.discountType === 'PERCENTAGE' 
                                                ? `${promo.discountValue}%` 
                                                : `₹${promo.discountValue}`} OFF
                                        </div>
                                    </div>
                                    <div className="promo-body">
                                        <h3>{promo.code || promo.couponCode}</h3>
                                        <p>{promo.description || 'Special offer on health packages'}</p>
                                    </div>
                                    <div className="promo-footer">
                                        <div className="promo-expiry">
                                            <Clock size={12} />
                                            <span>{promo.expiryDate ? new Date(promo.expiryDate).toLocaleDateString() : 'No expiry'}</span>
                                        </div>
                                        <button 
                                            className={`use-code-btn ${copiedCode === (promo.code || promo.couponCode) ? 'copied' : ''}`}
                                            onClick={() => handleCopy(promo.code || promo.couponCode)}
                                        >
                                            {copiedCode === (promo.code || promo.couponCode) ? 'Copied!' : 'Use Code'}
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="no-promos">
                                <SearchX size={48} />
                                <p>No active promotions available</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </section>
        </div>
    );
};

export default PromotionsPage;
