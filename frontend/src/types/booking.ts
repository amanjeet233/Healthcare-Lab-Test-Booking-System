export type BookingStatus =
    | 'BOOKED'
    | 'SAMPLE_COLLECTED'
    | 'PROCESSING'
    | 'REFLEX_PENDING'
    | 'PENDING_VERIFICATION'
    | 'VERIFIED'
    | 'COMPLETED'
    | 'CANCELLED'
    // legacy values kept for backward compatibility with older local/mock data
    | 'PENDING_CONFIRMATION'
    | 'CONFIRMED'
    | 'PENDING';

export interface CreateBookingRequest {
    testId?: number;
    packageId?: number;
    familyMemberId?: number;
    bookingDate?: string; // YYYY-MM-DD
    collectionDate?: string; // compatibility alias
    scheduledDate?: string; // compatibility alias
    timeSlot?: string;
    scheduledTime?: string; // compatibility alias
    collectionType: "LAB" | "HOME";
    collectionAddress?: string;
    address?: string; // compatibility alias
    discount?: number;
    notes?: string;
    specialNotes?: string;
}

export interface BookingSearchParams {
    status?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
    sort?: string;
}

export interface BookingResponse {
    id: number;
    bookingReference: string;
    reference?: string;
    patientId?: number;
    patientName?: string;
    patientEmail?: string;
    patientPhone?: string;
    familyMemberId?: number;
    doctorId?: number;
    doctorName?: string;
    technicianId?: number;
    technicianName?: string;
    testId?: number;
    labTestId?: number;
    testName?: string;
    labTestName?: string;
    packageId?: number;
    packageName?: string;
    bookingDate?: string; // YYYY-MM-DD
    collectionDate?: string; // compatibility alias
    timeSlot?: string;
    scheduledTime?: string;
    collectionType: "LAB" | "HOME";
    collectionAddress?: string;
    pincode?: string;
    status: BookingStatus;
    amount: number;
    totalAmount?: number;
    finalAmount?: number;
    discount?: number;
    paymentStatus?: string;
    reportAvailable?: boolean;
    paymentMethod?: string;
    sampleType?: string;
    turnaroundTime?: string;
    reportTimeHours?: number;
    createdAt?: string;
    updatedAt?: string;
    notes?: string;
    specialNotes?: string;
}

export interface BookingPageResponse {
    content: BookingResponse[];
    bookings?: BookingResponse[];
    pageable: unknown;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: unknown;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}
