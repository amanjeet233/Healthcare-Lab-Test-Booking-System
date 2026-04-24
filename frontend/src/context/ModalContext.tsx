/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type AuthModalTab = 'login' | 'register' | 'forgot-password';

export type ModalType = 'AUTH' | 'BOOKING_DETAILS' | 'PROFILE_EDIT' | 'REPORT_VIEWER' | 'DOCTOR_APPROVAL' | 'COLLECTION_DETAILS' | 'CLINICAL_VERIFICATION';

export interface ModalContextType {
    activeModal: ModalType | null;
    modalProps: Record<string, unknown> | null;
    authModalTab: AuthModalTab;
    openModal: (type: ModalType, props?: Record<string, unknown>) => void;
    closeModal: () => void;
    openAuthModal: (tab?: AuthModalTab) => void;
    setAuthModalTab: (tab: AuthModalTab) => void;
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeModal, setActiveModal] = useState<ModalType | null>(null);
    const [modalProps, setModalProps] = useState<Record<string, unknown> | null>(null);
    const [authModalTab, setAuthModalTab] = useState<AuthModalTab>('login');

    const openModal = (type: ModalType, props: Record<string, unknown> | null = null) => {
        setModalProps(props);
        setActiveModal(type);
    };

    const closeModal = () => {
        setActiveModal(null);
        setModalProps(null);
    };

    const openAuthModal = (tab: AuthModalTab = 'login') => {
        setAuthModalTab(tab);
        openModal('AUTH');
    };

    return (
        <ModalContext.Provider
            value={{
                activeModal,
                modalProps,
                authModalTab,
                openModal,
                closeModal,
                openAuthModal,
                setAuthModalTab
            }}
        >
            {children}
        </ModalContext.Provider>
    );
};
