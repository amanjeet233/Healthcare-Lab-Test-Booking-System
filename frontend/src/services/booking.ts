import api from './api';
import type { BookingResponse, CreateBookingRequest, BookingSearchParams } from '../types/booking';

const unwrap = <T>(response: any): T => {
    if (response?.data?.data !== undefined) return response.data.data as T;
    if (response?.data !== undefined) return response.data as T;
    return response as T;
};

const normalizeBooking = (raw: any): BookingResponse => ({
    ...raw,
    bookingReference: raw?.bookingReference || raw?.reference || `BK-${raw?.id}`,
    reference: raw?.bookingReference || raw?.reference || `BK-${raw?.id}`,
    testId: raw?.testId ?? raw?.labTestId,
    labTestId: raw?.labTestId ?? raw?.testId,
    testName: raw?.testName || raw?.labTestName || raw?.packageName || 'Lab Test',
    labTestName: raw?.labTestName || raw?.testName,
    bookingDate: raw?.bookingDate || raw?.collectionDate,
    collectionDate: raw?.collectionDate || raw?.bookingDate,
    timeSlot: raw?.timeSlot || raw?.scheduledTime || '09:00 AM',
    scheduledTime: raw?.scheduledTime || raw?.timeSlot || '09:00 AM',
    amount: Number(raw?.amount ?? raw?.totalAmount ?? raw?.finalAmount ?? 0),
    totalAmount: Number(raw?.totalAmount ?? raw?.amount ?? raw?.finalAmount ?? 0),
    finalAmount: Number(raw?.finalAmount ?? raw?.totalAmount ?? raw?.amount ?? 0),
    pincode: raw?.pincode || raw?.collectionAddress?.match?.(/\b\d{6}\b/)?.[0],
    specialNotes: raw?.specialNotes || raw?.notes,
    notes: raw?.notes || raw?.specialNotes
}) as BookingResponse;

export const bookingService = {
    getMyBookings: async (params?: BookingSearchParams): Promise<{ bookings: BookingResponse[]; content: BookingResponse[]; totalPages: number }> => {
        const query: Record<string, any> = {};
        if (params?.status) query.status = params.status;
        if (params?.fromDate) query.dateFrom = params.fromDate;
        if (params?.toDate) query.dateTo = params.toDate;

        const response = await api.get('/api/bookings/my', { params: query });
        const raw = unwrap<any>(response);
        const list = Array.isArray(raw) ? raw : (raw?.content ?? []);
        const normalized = list.map(normalizeBooking);

        const filtered = params?.search
            ? normalized.filter((b) =>
                  String(b.reference || '').toLowerCase().includes(params.search!.toLowerCase()) ||
                  String(b.testName || b.packageName || '').toLowerCase().includes(params.search!.toLowerCase())
              )
            : normalized;

        return { bookings: filtered, content: filtered, totalPages: 1 };
    },

    getBookingById: async (id: number): Promise<BookingResponse> => {
        const response = await api.get(`/api/bookings/${id}`);
        return normalizeBooking(unwrap<any>(response)) as BookingResponse;
    },

    createBooking: async (data: CreateBookingRequest): Promise<BookingResponse> => {
        const response = await api.post('/api/bookings', data);
        return normalizeBooking(unwrap<any>(response)) as BookingResponse;
    },

    cancelBooking: async (id: number, reason?: string): Promise<BookingResponse> => {
        const response = await api.put(`/api/bookings/${id}/cancel`, reason ? { reason } : {});
        return normalizeBooking(unwrap<any>(response)) as BookingResponse;
    },

    rescheduleBooking: async (id: number, newDate: string, newTime: string): Promise<BookingResponse> => {
        const response = await api.post(`/api/bookings/${id}/reschedule`, { newDate, newTime });
        return normalizeBooking(unwrap<any>(response)) as BookingResponse;
    }
};
