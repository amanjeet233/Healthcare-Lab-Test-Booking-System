export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discount_type: 'PERCENTAGE' | 'FLAT';
  discount_value: number;
  max_discount?: number;
  min_cart_value?: number;
  expiry_date: string;
  is_active: boolean;
  usage_limit?: number;
  used_count?: number;
  applicable_tests?: string[];
  is_applicable_to_all?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PromoCodeValidation {
  isValid: boolean;
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  discountAmount: number;
  maxDiscount?: number;
  minCartValue?: number;
  message?: string;
  termsAndConditions?: {
    description: string;
    applicableTests?: string[];
    expiryDate: string;
  };
}

export interface CartPromo {
  code: string;
  discountPercentage?: number;
  discountAmount?: number;
  discountType: 'PERCENTAGE' | 'FLAT';
  appliedAt: Date;
}

export interface PromoCodeError {
  code: string;
  message: string;
  details?: {
    reason: 'EXPIRED' | 'INVALID_CODE' | 'MIN_CART_VALUE' | 'USAGE_LIMIT' | 'NOT_APPLICABLE' | 'ALREADY_USED';
    minCartValue?: number;
    currentCartValue?: number;
  };
}

export interface PromoCodeResponse {
  success: boolean;
  data?: PromoCode;
  error?: PromoCodeError;
}

export interface PromoValidationRequest {
  code: string;
  cartValue: number;
  testIds?: string[];
}

export interface CouponBenefit {
  type: 'FLAT' | 'PERCENTAGE';
  value: number;
  maxDiscount?: number;
  applicableItems?: string[];
}

export interface AppliedCoupon {
  code: string;
  benefit: CouponBenefit;
  message: string;
}
