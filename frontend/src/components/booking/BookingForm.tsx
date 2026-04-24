import React from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaBuilding, FaHome, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormHandleSubmit } from 'react-hook-form';
import type { BookingFormData } from '../../pages/patient/BookingPage';
import LoadingSpinner from '../common/LoadingSpinner';

interface BookingFormProps {
    register: UseFormRegister<BookingFormData>;
    handleSubmit: UseFormHandleSubmit<BookingFormData, undefined>;
    errors: FieldErrors<BookingFormData>;
    watch: UseFormWatch<BookingFormData>;
    onApplyDiscount: () => void;
    onSubmit: (data: BookingFormData) => void;
    isSubmitting: boolean;
    today: string;
    HOME_COLLECTION_FEE: number;
}

const PREDEFINED_SLOTS = [
    '09:00:00', '10:00:00', '11:00:00', '12:00:00',
    '14:00:00', '15:00:00', '16:00:00'
];

const formatTimeSlot = (timeSql: string) => {
    const [hours, minutes] = timeSql.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
};

const BookingForm: React.FC<BookingFormProps> = ({
    register,
    handleSubmit,
    errors,
    watch,
    onApplyDiscount,
    onSubmit,
    isSubmitting,
    today,
    HOME_COLLECTION_FEE
}) => {
    const navigate = useNavigate();
    const watchCollectionType = watch('collectionType');

    return (
        <div className="booking-form-container">
            <form id="booking-form" onSubmit={handleSubmit(onSubmit)} className="form-section">
                {/* Schedule */}
                <div className="form-section">
                    <div className="form-section-header">
                        <div className="form-section-icon">
                            <FaCalendarAlt />
                        </div>
                        <h2 className="form-section-title">Temporal Slot</h2>
                    </div>

                    <div className="form-row">
                        <div>
                            <label className="form-label">Select Date</label>
                            <input
                                type="date"
                                min={today}
                                className={`form-input ${errors.bookingDate ? 'error' : ''}`}
                                {...register('bookingDate')}
                            />
                            {errors.bookingDate && <p className="form-error">{errors.bookingDate.message}</p>}
                        </div>
                        <div>
                            <label className="form-label">Target Window</label>
                            <div className="time-slots">
                                {PREDEFINED_SLOTS.map(slot => (
                                    <label key={slot} className="slot-option">
                                        <input type="radio" value={slot} className="sr-only" {...register('timeSlot')} />
                                        <div className="slot-label">{formatTimeSlot(slot)}</div>
                                    </label>
                                ))}
                            </div>
                            {errors.timeSlot && <p className="form-error">{errors.timeSlot.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Collection Type */}
                <div className="form-section">
                    <div className="form-section-header">
                        <div className="form-section-icon">
                            <FaMapMarkerAlt />
                        </div>
                        <h2 className="form-section-title">Collection Node</h2>
                    </div>

                    <div className="collection-options">
                        <label className="collection-option">
                            <input type="radio" value="LAB" className="sr-only" {...register('collectionType')} />
                            <div className="collection-label">
                                <div className="collection-icon">
                                    <FaBuilding />
                                </div>
                                <div className="collection-info">
                                    <h4>Lab Visit</h4>
                                    <p>Zero Infrastructure Fee</p>
                                </div>
                            </div>
                        </label>
                        <label className="collection-option">
                            <input type="radio" value="HOME" className="sr-only" {...register('collectionType')} />
                            <div className="collection-label">
                                <div className="collection-icon">
                                    <FaHome />
                                </div>
                                <div className="collection-info">
                                    <h4>Home Node</h4>
                                    <p>+₹{HOME_COLLECTION_FEE.toFixed(2)} Service Charge</p>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {watchCollectionType === 'HOME' && (
                    <div className="form-section">
                        <label className="form-label">Collection Address</label>
                        <textarea
                            className={`form-input ${errors.collectionAddress ? 'error' : ''}`}
                            placeholder="Enter your complete address..."
                            rows={4}
                            {...register('collectionAddress')}
                        />
                        {errors.collectionAddress && <p className="form-error">{errors.collectionAddress.message}</p>}
                    </div>
                )}

                {/* Discount Code */}
                <div className="form-section">
                    <label className="form-label">Promo Code</label>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Enter promo code..."
                            className="form-input"
                            {...register('discountCode')}
                        />
                        <button
                            type="button"
                            onClick={onApplyDiscount}
                            className="submit-btn"
                        >
                            Apply
                        </button>
                    </div>
                </div>

                {/* Submit */}
                <div className="form-buttons">
                    <button type="submit" disabled={isSubmitting} className="submit-btn flex items-center justify-center gap-2">
                        {isSubmitting ? (
                            <>
                                <LoadingSpinner size="sm" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Proceed to Payment
                                <FaChevronRight className="text-xs" />
                            </>
                        )}
                    </button>
                    <button type="button" onClick={() => navigate('/tests')} className="cancel-btn">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookingForm;
