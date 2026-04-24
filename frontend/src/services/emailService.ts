import api from './api';

export interface EmailRequest {
    bookingId?: number;
    toEmail: String;
    patientName: string;
    bookingReference: string;
    testName: string;
    bookingDate: string;
    timeSlot: string;
}

/**
 * Sends a booking confirmation HTML email via the backend.
 * Required by Gmail SMTP notification system.
 */
export const sendBookingConfirmationEmail = async (data: EmailRequest) => {
    try {
        if (data.bookingId) {
            const response = await api.post('/api/emails/send-booking-confirmation', { bookingId: data.bookingId });
            return response.data;
        }

        const response = await api.post('/api/email/send-receipt', null, {
            params: {
                email: data.toEmail,
                bookingReference: data.bookingReference,
                testName: data.testName
            }
        });
        return response.data;
    } catch (error) {
        console.error('Email service error:', error);
        throw error;
    }
};
