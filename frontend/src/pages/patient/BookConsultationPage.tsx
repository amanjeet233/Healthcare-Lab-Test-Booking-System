import React from 'react';
import DoctorAvailabilitySection from '../../components/doctor/DoctorAvailabilitySection';
import './BookConsultationPage.css';

const BookConsultationPage: React.FC = () => {
    return (
        <div className="consultation-page">
            <div className="consultation-container">
                <DoctorAvailabilitySection />
            </div>
        </div>
    );
};

export default BookConsultationPage;
