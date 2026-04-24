import api from './api';

export interface LabPartner {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  latitude?: number;
  longitude?: number;
  openingHours?: string;
  closingHours?: string;
  isActive: boolean;
  rating?: number;
  servicesOffered: string[];
  imageUrl?: string;
}

export interface LabPartnerService {
  id: number;
  serviceName: string;
  description: string;
  price: number;
  turnaroundTime: string;
}

export interface LabPartnerDetail extends LabPartner {
  services: LabPartnerService[];
  operatingDays: string[];
  certifications: string[];
  description: string;
}

export const labPartnerService = {
  /**
   * Get all lab partner locations
   */
  async getPartners(): Promise<LabPartner[]> {
    const response = await api.get('/api/lab-partners');
    return response.data.data || [];
  },

  /**
   * Get lab partner by ID with full details
   */
  async getPartnerById(id: number): Promise<LabPartnerDetail> {
    const response = await api.get(`/api/lab-partners/${id}`);
    return response.data.data;
  },

  /**
   * Search lab partners by city
   */
  async searchPartnersByCity(city: string): Promise<LabPartner[]> {
    const response = await api.get(`/api/lab-partners/search?city=${city}`);
    return response.data.data || [];
  },

  /**
   * Get services offered by a lab partner
   */
  async getPartnerServices(partnerId: number): Promise<LabPartnerService[]> {
    const response = await api.get(`/api/lab-partners/${partnerId}/services`);
    return response.data.data || [];
  },

  /**
   * Get lab partners by state
   */
  async getPartnersByState(state: string): Promise<LabPartner[]> {
    const response = await api.get(`/api/lab-partners/state/${state}`);
    return response.data.data || [];
  },

  /**
   * Get nearby lab partners (requires location)
   */
  async getNearbyPartners(latitude: number, longitude: number, radiusKm: number = 10): Promise<LabPartner[]> {
    const response = await api.get(`/api/lab-partners/nearby?lat=${latitude}&lng=${longitude}&radius=${radiusKm}`);
    return response.data.data || [];
  }
};
