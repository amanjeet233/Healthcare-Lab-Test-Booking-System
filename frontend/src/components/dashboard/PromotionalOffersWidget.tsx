import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTag, FaCopy, FaArrowRight, FaSpinner, FaFire } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { promoCodeService } from '../../services/PromoCodeService';
import type { PromoCode } from '../../types/promo';
import './PromotionalOffersWidget.css';

interface PromotionalOffersWidgetProps {
  limit?: number;
  onPromoSelect?: (code: string) => void;
  showViewAll?: boolean;
}

const PromotionalOffersWidget: React.FC<PromotionalOffersWidgetProps> = ({
  limit = 4,
  onPromoSelect,
  showViewAll = true
}) => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchPromoCodes();
  }, [limit]);

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const codes = await promoCodeService.getFeaturedPromoCodes(limit);
      setPromoCodes(codes);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSelectPromo = (code: string) => {
    if (onPromoSelect) {
      onPromoSelect(code);
    }
  };

  const getDiscountText = (promo: PromoCode) => {
    if (promo.discount_type === 'PERCENTAGE') {
      return `${promo.discount_value}% OFF`;
    } else {
      return `₹${promo.discount_value} OFF`;
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="promo-widget loading">
        <div className="loading-placeholder">
          <FaSpinner className="spinner" />
          <p>Loading offers...</p>
        </div>
      </div>
    );
  }

  if (promoCodes.length === 0) {
    return null;
  }

  return (
    <div className="promotional-offers-widget">
      {/* Header */}
      <div className="promo-widget-header">
        <div className="header-content">
          <FaTag className="header-icon" />
          <h3>Exclusive Offers</h3>
          <FaFire className="fire-icon" />
        </div>
        {showViewAll && (
          <a href="/promos" className="view-all-link">
            View All <FaArrowRight />
          </a>
        )}
      </div>

      {/* Promo Cards */}
      <motion.div
        className="promo-cards-grid"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {promoCodes.map((promo) => (
          <motion.div
            key={promo.id}
            className="promo-card"
            variants={item}
            whileHover={{ transform: 'translateY(-4px)' }}
            onClick={() => handleSelectPromo(promo.code)}
          >
            {/* Discount Badge */}
            <div className={`discount-badge discount-${promo.discount_type.toLowerCase()}`}>
              <span className="discount-label">Save</span>
              <span className="discount-value">{getDiscountText(promo)}</span>
            </div>

            {/* Promo Info */}
            <div className="promo-card-content">
              <h4 className="promo-title">{promo.description}</h4>

              {/* Promo Code */}
              <div className="promo-code-display">
                <code>{promo.code}</code>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCode(promo.code);
                  }}
                  className={`copy-btn ${copiedCode === promo.code ? 'copied' : ''}`}
                  title="Copy code"
                >
                  {copiedCode === promo.code ? '✓' : <FaCopy />}
                </button>
              </div>

              {/* Terms */}
              <div className="promo-terms">
                {promo.min_cart_value && (
                  <span className="term-item">
                    📦 Min: ₹{promo.min_cart_value}
                  </span>
                )}
                {promo.expiry_date && (
                  <span className="term-item">
                    ⏰ Expire: {new Date(promo.expiry_date).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPromo(promo.code);
                }}
                className="promo-use-btn"
              >
                Use Code <FaArrowRight />
              </button>
            </div>

            {/* Corner Decoration */}
            <div className="promo-corner-decoration" />
          </motion.div>
        ))}
      </motion.div>

      {/* Disclaimer */}
      <p className="promo-disclaimer">
        Use these codes at checkout to get instant discounts on all tests.
      </p>
    </div>
  );
};

export default PromotionalOffersWidget;
