import api from './api';
import type { User } from '../types/auth';

export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    name?: string;
    phone?: string;
    secondaryPhone?: string;
    alternateEmail?: string;
    address?: string;
    dateOfBirth?: string;
    bloodGroup?: string;
    gender?: string;
    maritalStatus?: string;
}

const unwrap = <T>(response: any): T => {
    if (response?.data?.data !== undefined) return response.data.data as T;
    if (response?.data !== undefined) return response.data as T;
    return response as T;
};

const splitName = (name?: string) => {
    const safe = (name || '').trim();
    if (!safe) return { firstName: '', lastName: '' };
    const parts = safe.split(/\s+/);
    return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') };
};

const toSafeString = (value: unknown, fallback = ''): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return fallback;
};

const toSafeBool = (value: unknown, fallback: boolean): boolean => {
    if (typeof value === 'boolean') return value;
    return fallback;
};

const toSafeArray = <T>(value: unknown): T[] => {
    return Array.isArray(value) ? (value as T[]) : [];
};

export const userService = {
    getProfile: async (): Promise<User> => {
        const [profileRes, familyRes, addressRes, settingsRes] = await Promise.all([
            api.get('/api/users/profile'),
            api.get('/api/users/family-members').catch(() => null),
            api.get('/api/users/addresses').catch(() => null),
            api.get('/api/users/settings').catch(() => null)
        ]);

        const profileRaw: any = unwrap<any>(profileRes);
        const base = profileRaw?.user ?? profileRaw ?? {};
        const family = familyRes ? unwrap<any[]>(familyRes) : [];
        const addresses = addressRes ? unwrap<any[]>(addressRes) : [];
        const settings = settingsRes ? unwrap<any>(settingsRes) : null;

        const names = splitName(toSafeString(base?.name));
        const safeName = toSafeString(base?.name).trim() || `${names.firstName} ${names.lastName}`.trim();
        const safeMedicalHistory =
            base?.medicalHistory && typeof base.medicalHistory === 'object' && !Array.isArray(base.medicalHistory)
                ? base.medicalHistory
                : {
                      pastSurgeries: '',
                      familyHistory: '',
                      chronicDiseases: []
                  };
        const safeEmergencyContact =
            base?.emergencyContact && typeof base.emergencyContact === 'object' && !Array.isArray(base.emergencyContact)
                ? base.emergencyContact
                : {
                      name: '',
                      relation: '',
                      phone: '',
                      address: ''
                  };

        return {
            id: base?.id,
            name: safeName || 'User',
            firstName: toSafeString(base?.firstName, names.firstName),
            lastName: toSafeString(base?.lastName, names.lastName),
            email: toSafeString(base?.email),
            phone: toSafeString(base?.phone),
            role: base?.role,
            address: toSafeString(base?.address),
            dateOfBirth: toSafeString(base?.dateOfBirth),
            bloodGroup: toSafeString(base?.bloodGroup),
            gender: toSafeString(base?.gender) as User['gender'],
            maritalStatus: toSafeString(base?.maritalStatus),
            secondaryPhone: toSafeString(base?.secondaryPhone),
            alternateEmail: toSafeString(base?.alternateEmail),
            familyMembers: toSafeArray(family),
            addresses: toSafeArray(addresses),
            medicalHistory: safeMedicalHistory,
            emergencyContact: safeEmergencyContact,
            notificationsEnabled: toSafeBool(settings?.notifications?.emailNotifications, true),
            whatsappNotifications: toSafeBool(settings?.notifications?.whatsappNotifications, false),
            marketingEmails: toSafeBool(settings?.notifications?.marketingEmails, false),
            privacyMode: toSafeBool(settings?.privacy?.privacyMode, false),
            themePreference: (toSafeString(settings?.appearance?.theme, 'light') as User['themePreference']) || 'light',
            settings
        };
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
        const name = data.name || [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
        const payload: Record<string, any> = {};
        if (name) payload.name = name;
        if (data.firstName !== undefined) payload.firstName = data.firstName;
        if (data.lastName !== undefined) payload.lastName = data.lastName;
        if (data.phone !== undefined) payload.phone = data.phone;
        if (data.secondaryPhone !== undefined) payload.secondaryPhone = data.secondaryPhone;
        if (data.alternateEmail !== undefined) payload.alternateEmail = data.alternateEmail;
        if (data.address !== undefined) payload.address = data.address;
        if (data.dateOfBirth !== undefined) payload.dateOfBirth = data.dateOfBirth;
        if (data.bloodGroup !== undefined) payload.bloodGroup = data.bloodGroup;
        if (data.gender !== undefined) payload.gender = data.gender;
        if (data.maritalStatus !== undefined) payload.maritalStatus = data.maritalStatus;

        const response = await api.put('/api/users/profile', payload);
        const updated = unwrap<any>(response);
        const raw = updated?.user ?? updated ?? {};
        const names = splitName(raw?.name);

        return {
            id: raw.id,
            name: raw.name || name,
            firstName: raw.firstName || names.firstName || data.firstName,
            lastName: raw.lastName || names.lastName || data.lastName,
            email: raw.email,
            phone: raw.phone,
            role: raw.role,
            address: raw.address
        } as User;
    },

    getSettings: async (): Promise<any> => {
        const response = await api.get('/api/users/settings');
        return unwrap<any>(response);
    },

    updateSettings: async (settings: any): Promise<any> => {
        const response = await api.put('/api/users/settings', settings);
        return unwrap<any>(response);
    },

    changePassword: async (data: { oldPassword?: string; currentPassword?: string; newPassword: string }): Promise<void> => {
        await api.post('/api/users/change-password', {
            currentPassword: data.currentPassword || data.oldPassword,
            newPassword: data.newPassword
        });
    },

    deleteAccount: async (): Promise<void> => {
        await api.delete('/api/users/profile');
    }
};
