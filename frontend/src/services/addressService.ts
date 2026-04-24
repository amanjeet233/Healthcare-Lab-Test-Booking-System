import api from './api';

export interface AddressDTO {
    id?: number;
    label: string;
    street: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    isDefault?: boolean;
}

const unwrap = <T>(response: any): T => {
    if (response?.data?.data !== undefined) return response.data.data as T;
    if (response?.data !== undefined) return response.data as T;
    return response as T;
};

export const addressService = {
    getAll: async (): Promise<AddressDTO[]> => {
        const response = await api.get('/api/users/addresses');
        return unwrap<AddressDTO[]>(response) || [];
    },

    save: async (address: AddressDTO): Promise<AddressDTO> => {
        if (address.id) {
            const response = await api.put(`/api/users/addresses/${address.id}`, address);
            return unwrap<AddressDTO>(response);
        }
        const response = await api.post('/api/users/addresses', address);
        return unwrap<AddressDTO>(response);
    },

    update: async (address: AddressDTO): Promise<AddressDTO> => {
        if (!address.id) throw new Error('Address id is required for update');
        const response = await api.put(`/api/users/addresses/${address.id}`, address);
        return unwrap<AddressDTO>(response);
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/api/users/addresses/${id}`);
    }
};

