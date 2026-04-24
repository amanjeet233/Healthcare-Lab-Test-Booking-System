import { useState, useCallback } from 'react';
import { promoCodeService } from '../services/PromoCodeService';
import type { PromoCode, PromoCodeValidation, AppliedCoupon, PromoCodeError } from '../types/promo';

interface UsePromoCodesResult {
  // State
  appliedCoupon: AppliedCoupon | null;
  validationError: PromoCodeError | null;
  isValidating: boolean;
  isApplying: boolean;

  // Methods
  validatePromoCode: (code: string, cartValue: number, testIds?: string[]) => Promise<PromoCodeValidation | null>;
  applyPromoCode: (code: string, cartValue: number, testIds?: string[]) => Promise<AppliedCoupon | null>;
  removePromoCode: () => Promise<boolean>;
  clearError: () => void;
  reset: () => void;

  // Utilities
  getDiscountedPrice: (original: number) => number;
  getDiscountPercentage: () => number;
  getDiscountAmount: () => number;
}

export const usePromoCodes = (): UsePromoCodesResult => {
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [validationError, setValidationError] = useState<PromoCodeError | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const validatePromoCode = useCallback(
    async (code: string, cartValue: number, testIds?: string[]): Promise<PromoCodeValidation | null> => {
      setIsValidating(true);
      setValidationError(null);
      try {
        const result = await promoCodeService.validatePromoCode(code, cartValue, testIds);
        return result;
      } catch (error) {
        setValidationError({
          code: 'VALIDATION_ERROR',
          message: 'Failed to validate promo code'
        });
        return null;
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  const applyPromoCode = useCallback(
    async (code: string, cartValue: number, testIds?: string[]): Promise<AppliedCoupon | null> => {
      setIsApplying(true);
      setValidationError(null);
      try {
        const result = await promoCodeService.applyPromoCode(code, cartValue, testIds);
        
        if ('benefit' in result && 'message' in result) {
          setAppliedCoupon(result);
          return result;
        } else {
          const error = result as PromoCodeError;
          setValidationError(error);
          return null;
        }
      } catch (error) {
        setValidationError({
          code: 'APPLICATION_ERROR',
          message: 'Failed to apply promo code'
        });
        return null;
      } finally {
        setIsApplying(false);
      }
    },
    []
  );

  const removePromoCode = useCallback(async (): Promise<boolean> => {
    try {
      const success = await promoCodeService.removePromoCode(appliedCoupon?.code || '');
      if (success) {
        setAppliedCoupon(null);
        setValidationError(null);
      }
      return success;
    } catch (error) {
      setValidationError({
        code: 'REMOVAL_ERROR',
        message: 'Failed to remove promo code'
      });
      return false;
    }
  }, [appliedCoupon?.code]);

  const clearError = useCallback(() => {
    setValidationError(null);
  }, []);

  const reset = useCallback(() => {
    setAppliedCoupon(null);
    setValidationError(null);
    setIsValidating(false);
    setIsApplying(false);
  }, []);

  const getDiscountedPrice = useCallback(
    (original: number): number => {
      if (!appliedCoupon) return original;

      const benefit = appliedCoupon.benefit;
      let discount = 0;

      if (benefit.type === 'PERCENTAGE') {
        discount = (original * benefit.value) / 100;
        if (benefit.maxDiscount) {
          discount = Math.min(discount, benefit.maxDiscount);
        }
      } else {
        discount = benefit.value;
      }

      return Math.max(0, original - discount);
    },
    [appliedCoupon]
  );

  const getDiscountPercentage = useCallback((): number => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.benefit.type === 'PERCENTAGE') {
      return appliedCoupon.benefit.value;
    }
    return 0;
  }, [appliedCoupon]);

  const getDiscountAmount = useCallback((): number => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.benefit.type === 'FLAT') {
      return appliedCoupon.benefit.value;
    }
    return 0;
  }, [appliedCoupon]);

  return {
    appliedCoupon,
    validationError,
    isValidating,
    isApplying,
    validatePromoCode,
    applyPromoCode,
    removePromoCode,
    clearError,
    reset,
    getDiscountedPrice,
    getDiscountPercentage,
    getDiscountAmount
  };
};

export default usePromoCodes;
