import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTag, FaCheck, FaTimes, FaSpinner, FaChevronDown } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { promoCodeService } from '../../services/PromoCodeService';
import type { PromoCode, AppliedCoupon, PromoCodeError } from '../../types/promo';
import './PromoCodeInput.css';

interface PromoCodeInputProps {
  cartValue: number;
  appliedCoupon?: {
    code: string;
    discountAmount: number;
  };
  onApplyPromo: (coupon: AppliedCoupon) => Promise<void>;
  onRemovePromo: () => Promise<void>;
  testIds?: string[];
  showSuggestions?: boolean;
  showFeatured?: boolean;
  onLoadingSuggestions?: (loading: boolean) => void;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  cartValue,
  appliedCoupon,
  onApplyPromo,
  onRemovePromo,
  testIds = [],
  showSuggestions = true,
  showFeatured = false,
  onLoadingSuggestions
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [suggestions, setSuggestions] = useState<PromoCode[]>([]);
  const [featuredCoupons, setFeaturedCoupons] = useState<PromoCode[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [validationError, setValidationError] = useState<PromoCodeError | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Fetch suggested promo codes
  useEffect(() => {
    if (showFeatured) {
      fetchFeaturedCoupons();
    } else if (showSuggestions && cartValue > 0) {
      fetchSuggestions();
    }
  }, [cartValue, showSuggestions, showFeatured]);

  const fetchSuggestions = useCallback(async () => {
    setLoadingSuggestions(true);
    onLoadingSuggestions?.(true);
    try {
      const available = await promoCodeService.getAvailablePromoCodes();
      setSuggestions(available.slice(0, 5));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
      onLoadingSuggestions?.(false);
    }
  }, [onLoadingSuggestions]);

  const fetchFeaturedCoupons = useCallback(async () => {
    setLoadingSuggestions(true);
    onLoadingSuggestions?.(true);
    try {
      const featured = await promoCodeService.getFeaturedPromoCodes(5);
      setFeaturedCoupons(featured);
    } catch (error) {
      console.error('Error fetching featured coupons:', error);
    } finally {
      setLoadingSuggestions(false);
      onLoadingSuggestions?.(false);
    }
  }, [onLoadingSuggestions]);

  const validateAndApply = async (code: string) => {
    if (!code.trim()) {
      setValidationError({
        code: 'EMPTY_CODE',
        message: 'Please enter a promo code'
      });
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // First validate
      const validation = await promoCodeService.validatePromoCode(
        code,
        cartValue,
        testIds
      );

      if (!validation || !validation.isValid) {
        setValidationError({
          code: 'INVALID_CODE',
          message: validation?.message || 'Invalid or expired promo code'
        });
        toast.error(validation?.message || 'Invalid promo code');
        return;
      }

      // Then apply
      const result = await promoCodeService.applyPromoCode(
        code,
        cartValue,
        testIds
      );

      if ('message' in result && 'benefit' in result) {
        // Success
        const appliedCoupon: AppliedCoupon = result;
        await onApplyPromo(appliedCoupon);
        setPromoCode('');
        setShowDropdown(false);
        toast.success(appliedCoupon.message);
      } else {
        // Error
        const error = result as PromoCodeError;
        setValidationError(error);
        toast.error(error.message);
      }
    } catch (error) {
      console.error('Error applying promo:', error);
      setValidationError({
        code: 'APPLICATION_ERROR',
        message: 'Failed to apply promo code. Please try again.'
      });
      toast.error('Failed to apply promo code');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemovePromo = async () => {
    try {
      await onRemovePromo();
      setPromoCode('');
      setValidationError(null);
      toast.success('Promo code removed');
    } catch (error) {
      toast.error('Failed to remove promo code');
    }
  };

  const handleSuggestionClick = async (code: string) => {
    setPromoCode(code);
    setShowDropdown(false);
    await validateAndApply(code);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setPromoCode(value);
    setValidationError(null);
    setShowDropdown(value.length > 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      validateAndApply(promoCode);
    }
  };

  const mogiSuggestions = showFeatured ? featuredCoupons : suggestions;

  return (
    <div className="promo-code-input-container">
      {/* Applied Coupon Display */}
      <AnimatePresence>
        {appliedCoupon && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="applied-coupon-banner"
          >
            <div className="applied-coupon-content">
              <FaCheck className="check-icon" />
              <div className="coupon-details">
                <span className="coupon-code">{appliedCoupon.code}</span>
                <span className="coupon-savings">
                  You saved ₹{appliedCoupon.discountAmount}
                </span>
              </div>
            </div>
            <button
              onClick={handleRemovePromo}
              className="remove-coupon-btn"
              title="Remove coupon"
            >
              <FaTimes />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!appliedCoupon && (
        <div className="promo-input-section">
          <div className="promo-label">
            <FaTag className="tag-icon" />
            <label>Have a promo code?</label>
          </div>

          <div className="promo-input-wrapper">
            <div className="promo-input-group">
              <input
                type="text"
                placeholder="Enter promo code (e.g., HEALTH20)"
                value={promoCode}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onFocus={() => promoCode.length > 0 && setShowDropdown(true)}
                className={`promo-input ${validationError ? 'error' : ''}`}
                disabled={isValidating}
              />
              {promoCode && (
                <button
                  onClick={() => {
                    setPromoCode('');
                    setValidationError(null);
                    setShowDropdown(false);
                  }}
                  className="clear-input-btn"
                  title="Clear"
                >
                  <FaTimes />
                </button>
              )}
              <button
                onClick={() => validateAndApply(promoCode)}
                disabled={!promoCode.trim() || isValidating}
                className="apply-promo-btn"
              >
                {isValidating ? <FaSpinner className="spinner" /> : 'Apply'}
              </button>
            </div>

            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="validation-error"
              >
                <FaTimes className="error-icon" />
                <span>{validationError.message}</span>
              </motion.div>
            )}
          </div>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showDropdown && mogiSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="promo-suggestions-dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="suggestions-header">
                  {showFeatured ? '🎯 Featured Offers' : '💡 Available Offers'}
                </div>
                <div className="suggestions-list">
                  {mogiSuggestions.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(coupon.code)}
                    >
                      <div className="suggestion-code">
                        <code>{coupon.code}</code>
                      </div>
                      <div className="suggestion-info">
                        <p className="suggestion-description">{coupon.description}</p>
                        <p className="suggestion-discount">
                          {coupon.discount_type === 'PERCENTAGE'
                            ? `${coupon.discount_value}% OFF`
                            : `₹${coupon.discount_value} OFF`}
                          {coupon.min_cart_value && (
                            <span className="min-value">
                              (Min: ₹{coupon.min_cart_value})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Indicator */}
          {loadingSuggestions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="loading-suggestions"
            >
              <FaSpinner className="spinner" />
              <span>Loading offers...</span>
            </motion.div>
          )}

          {/* Help Text */}
          <p className="promo-help-text">
            Save money with our exclusive offers. Free shipping on orders above ₹1000.
          </p>
        </div>
      )}
    </div>
  );
};

export default PromoCodeInput;
