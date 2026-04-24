import api from './api';

export interface FamilyMemberRequest {
  name: string;
  relation: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  phoneNumber?: string;
  email?: string;
  medicalHistory?: string;
}

export interface FamilyMemberResponse extends FamilyMemberRequest {
  id: number;
  patientId?: number;
}

const unwrap = <T>(response: any): T => {
  if (response?.data?.data !== undefined) return response.data.data as T;
  if (response?.data !== undefined) return response.data as T;
  return response as T;
};

export const familyMemberService = {
  async addFamilyMember(data: FamilyMemberRequest): Promise<FamilyMemberResponse> {
    const response = await api.post('/api/users/family-members', data);
    return unwrap<FamilyMemberResponse>(response);
  },

  async getFamilyMembers(): Promise<FamilyMemberResponse[]> {
    const response = await api.get('/api/users/family-members');
    return unwrap<FamilyMemberResponse[]>(response) || [];
  },

  async updateFamilyMember(id: number, data: Partial<FamilyMemberRequest>): Promise<FamilyMemberResponse> {
    const response = await api.put(`/api/users/family-members/${id}`, data);
    return unwrap<FamilyMemberResponse>(response);
  },

  async deleteFamilyMember(id: number): Promise<void> {
    await api.delete(`/api/users/family-members/${id}`);
  }
};

