import api from './api';
import type { PromoCode, PromoCodeValidation, PromoCodeError, AppliedCoupon } from '../types/promo';

class PromoCodeService {
  async getAvailablePromoCodes(): Promise<PromoCode[]> {
    try {
      const response = await api.get('/api/promotions', { params: { sort: 'discount' } });
      const data = response?.data?.data?.promotions || [];
      return data.map((p: any) => ({
        id: p.id,
        code: p.code,
        discount_type: String(p.discountType || 'FLAT').toUpperCase(),
        discount_value: Number(p.discountValue || 0),
        expiry_date: p.validUntil,
        is_active: true,
        description: p.description,
        // UI compatibility fields
        couponCode: p.code,
        discountType: String(p.discountType || 'FLAT').toUpperCase(),
        discountValue: Number(p.discountValue || 0),
        expiryDate: p.validUntil
      })) as PromoCode[];
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      return [];
    }
  }

  async getAdminPromoCodes(): Promise<PromoCode[]> {
    const response = await api.get('/api/promos');
    const data = response?.data?.data || [];
    return (Array.isArray(data) ? data : []).map((p: any) => ({
      id: String(p.id),
      code: p.code,
      description: p.description,
      discount_type: String(p.discount_type || 'FLAT').toUpperCase(),
      discount_value: Number(p.discount_value || 0),
      max_discount: p.max_discount != null ? Number(p.max_discount) : undefined,
      min_cart_value: p.min_cart_value != null ? Number(p.min_cart_value) : undefined,
      expiry_date: p.expiry_date,
      is_active: Boolean(p.is_active),
      usage_limit: p.usage_limit != null ? Number(p.usage_limit) : undefined,
      used_count: p.used_count != null ? Number(p.used_count) : undefined,
      created_at: p.created_at,
      updated_at: p.updated_at
    }));
  }

  async createPromoCode(payload: {
    code: string;
    description: string;
    discountType: 'PERCENTAGE' | 'FLAT';
    discountValue: number;
    minCartValue?: number;
    maxDiscount?: number;
    expiryDate: string;
    isActive?: boolean;
  }): Promise<PromoCode> {
    const response = await api.post('/api/promos', payload);
    return response?.data?.data as PromoCode;
  }

  async updatePromoCode(
    id: number | string,
    payload: {
      code?: string;
      description?: string;
      discountType?: 'PERCENTAGE' | 'FLAT';
      discountValue?: number;
      minCartValue?: number;
      maxDiscount?: number;
      expiryDate?: string;
      isActive?: boolean;
    }
  ): Promise<PromoCode> {
    const response = await api.put(`/api/promos/${id}`, payload);
    return response?.data?.data as PromoCode;
  }

  async deletePromoCode(id: number | string): Promise<void> {
    await api.delete(`/api/promos/${id}`);
  }

  async getPromoCodeByCode(code: string): Promise<PromoCode | null> {
    const promos = await this.getAvailablePromoCodes();
    return promos.find((p: any) => (p.code || p.couponCode) === code) || null;
  }

  async validatePromoCode(code: string, cartValue: number): Promise<PromoCodeValidation | null> {
    try {
      const response = await api.post('/api/promotions/apply', { code, orderAmount: cartValue });
      const payload = response?.data?.data;
      return {
        isValid: true,
        code,
        discountType: payload?.promotion?.discountType || 'FLAT',
        discountValue: Number(payload?.promotion?.discountValue || 0),
        discountAmount: Number(payload?.promotion?.discountAmount || 0),
        message: 'Promo code is valid'
      };
    } catch (error: any) {
      return {
        isValid: false,
        code,
        discountType: 'FLAT',
        discountValue: 0,
        discountAmount: 0,
        message: error?.response?.data?.message || 'Invalid promo code'
      };
    }
  }

  async applyPromoCode(code: string, cartValue: number): Promise<AppliedCoupon | PromoCodeError> {
    try {
      const response = await api.post('/api/promotions/apply', { code, orderAmount: cartValue });
      const payload = response?.data?.data;
      return {
        code,
        benefit: {
          type: payload?.promotion?.discountType || 'FLAT',
          value: Number(payload?.promotion?.discountValue || 0),
          maxDiscount: undefined,
          applicableItems: undefined
        },
        message: `Promo code applied. You saved ₹${Number(payload?.promotion?.discountAmount || 0)}`
      };
    } catch (error: any) {
      return {
        code: 'INVALID_CODE',
        message: error?.response?.data?.message || 'Failed to apply promo code'
      };
    }
  }

  async removePromoCode(_code: string): Promise<boolean> {
    return true;
  }

  async getUserPromoHistory(): Promise<PromoCode[]> {
    return [];
  }

  async searchPromoCodes(query: string): Promise<PromoCode[]> {
    const all = await this.getAvailablePromoCodes();
    const q = query.toLowerCase();
    return all.filter((p) =>
      String((p as any).code || (p as any).couponCode || '').toLowerCase().includes(q) ||
      String(p.description || '').toLowerCase().includes(q)
    );
  }

  async getFeaturedPromoCodes(limit: number = 5): Promise<PromoCode[]> {
    const all = await this.getAvailablePromoCodes();
    return all.slice(0, limit);
  }

  calculateDiscount(
    cartValue: number,
    discount: number,
    discountType: 'PERCENTAGE' | 'FLAT',
    maxDiscount?: number
  ): number {
    let discountAmount = 0;
    if (discountType === 'PERCENTAGE') {
      discountAmount = (cartValue * discount) / 100;
      if (maxDiscount) discountAmount = Math.min(discountAmount, maxDiscount);
    } else {
      discountAmount = discount;
    }
    return Math.round(discountAmount);
  }

  getFinalPrice(cartValue: number, discountAmount: number, taxPercentage: number = 0): number {
    const afterDiscount = cartValue - discountAmount;
    const tax = (afterDiscount * taxPercentage) / 100;
    return Math.round(afterDiscount + tax);
  }
}

export const promoCodeService = new PromoCodeService();
