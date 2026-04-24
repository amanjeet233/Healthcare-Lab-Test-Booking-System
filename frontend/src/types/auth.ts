export interface Address {
    id: number;
    label: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    isDefault: boolean;
}

export interface FamilyMember {
    id: number;
    name: string;
    relation: string;
    gender: string;
    dateOfBirth: string;
    phoneNumber?: string;
    email?: string;
    medicalHistory?: string;
}

export interface User {
    id: number;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone: string;
    role: 'PATIENT' | 'MEDICAL_OFFICER' | 'TECHNICIAN' | 'ADMIN';
    address?: string;
    dateOfBirth?: string;
    bloodGroup?: string;
    gender?: string;
    maritalStatus?: string;
    secondaryPhone?: string;
    alternateEmail?: string;
    familyMembers?: FamilyMember[];
    addresses?: Address[];
    medicalHistory?: any;
    emergencyContact?: any;
    notificationsEnabled?: boolean;
    whatsappNotifications?: boolean;
    marketingEmails?: boolean;
    privacyMode?: boolean;
    themePreference?: 'light' | 'dark' | 'auto';
    settings?: any;
}

export interface AuthData {
    accessToken: string;
    refreshToken: string;
    token?: string | null;
    user?: User;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: AuthData;
}

export interface LoginRequest {
    email: string;
    password?: string;
    role: 'PATIENT' | 'MEDICAL_OFFICER' | 'TECHNICIAN' | 'ADMIN';
}

export interface RegisterRequest {
    name: string;
    email: string;
    password?: string;
    phone: string;
    role: 'PATIENT' | 'MEDICAL_OFFICER' | 'TECHNICIAN' | 'ADMIN';
    address?: string;
    dateOfBirth?: string;
    gender?: string;
    bloodGroup?: string;
}
