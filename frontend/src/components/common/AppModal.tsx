import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useModal } from '../../context/ModalContext';
import { BookingDetailsModal, ProfileModal } from '../dashboard/Modals';
import MedicalOfficerVerificationModal from '../doctor/MedicalOfficerVerificationModal';
import type { BookingResponse } from '../../types/booking';
import { useAuth } from '../../hooks/useAuth';
import AuthModal from '../auth/AuthModal';

const AppModal: React.FC = () => {
    const { activeModal, closeModal, modalProps } = useModal();
    const { currentUser } = useAuth();

    if (!activeModal) return null;

    const renderModalContent = () => {
        switch (activeModal) {
            case 'AUTH':
                return <AuthModal />;
            case 'BOOKING_DETAILS':
                return <BookingDetailsModal booking={modalProps as unknown as BookingResponse} />;
            case 'PROFILE_EDIT':
                return currentUser ? <ProfileModal user={currentUser} /> : null;
            case 'REPORT_VIEWER':
                return <div className="p-12 text-evergreen font-black uppercase tracking-widest text-center">Report Viewer Interface Coming Soon</div>;
            case 'DOCTOR_APPROVAL':
                return <div className="p-12 text-evergreen font-black uppercase tracking-widest text-center">Medical Officer Approval System</div>;
            case 'COLLECTION_DETAILS':
                return <div className="p-12 text-evergreen font-black uppercase tracking-widest text-center">Technician Collection Details</div>;
            case 'CLINICAL_VERIFICATION': {
                const props = modalProps as any;
                return (
                    <MedicalOfficerVerificationModal
                        bookingId={props.bookingId}
                        testName={props.testName}
                        onClose={closeModal}
                        onSuccess={() => window.location.reload()}
                    />
                );
            }
            default:
                return null;
        }
    };

    if (activeModal === 'AUTH') return <AuthModal />;

    return (
        <AnimatePresence>
            {activeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                        className="absolute inset-0 bg-evergreen/40 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-4xl bg-off-white/95 backdrop-blur-2xl rounded-[3rem] shadow-radical overflow-hidden border-2 border-white/20 z-10 p-8 md:p-12"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeModal}
                            className="absolute top-8 right-8 p-3 bg-primary/10 rounded-2xl text-primary hover:bg-primary/20 transition-all z-20"
                        >
                            <FaTimes />
                        </button>

                        <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
                            {renderModalContent()}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AppModal;
