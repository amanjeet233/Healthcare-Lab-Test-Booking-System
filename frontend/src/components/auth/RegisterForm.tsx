import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaLock, FaEnvelope, FaMapMarkerAlt, FaChevronRight, FaPhone, FaUser, FaBirthdayCake } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useModal } from '../../context/ModalContext';
import type { RegisterRequest } from '../../types/auth';
import LoadingSpinner from '../common/LoadingSpinner';
import AuthInput from './AuthInput';

const phoneRegExp = /^(\+91[-\s]?)?[6789]\d{9}$/;

const registerSchema = yup.object().shape({
    name: yup.string().required('Full name required'),
    email: yup.string().email('Valid email required').required('Email required'),
    phone: yup.string().matches(phoneRegExp, 'Invalid phone number').required('Phone required'),
    password: yup.string()
        .required('Password required')
        .min(8, 'Minimum 8 characters')
        .matches(/[a-z]/, 'Add lowercase')
        .matches(/[A-Z]/, 'Add uppercase')
        .matches(/[0-9]/, 'Add number'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password')], 'Passwords match failure')
        .required('Confirm required'),
    role: yup.string().oneOf(['PATIENT']).required(),
    address: yup.string().required('Address required'),
    dateOfBirth: yup.string().required('DOB required'),
});

type RegisterInputs = yup.InferType<typeof registerSchema>;

const RegisterForm: React.FC = () => {
    const { register: registerUser } = useAuth();
    const { closeModal } = useModal();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const {
        register: registerFields,
        handleSubmit: handleRegisterSubmit,
        formState: { errors: registerErrors },
        reset: resetRegister
    } = useForm<RegisterInputs | any>({
        resolver: yupResolver(registerSchema) as any,
        defaultValues: { role: 'PATIENT' } as RegisterInputs
    });

    const onRegisterSubmit = async (data: RegisterInputs) => {
        setIsSubmitting(true);
        try {
            let firstName = 'User';
            let lastName = '';
            
            if (data.name) {
                const parts = data.name.trim().split(' ');
                firstName = parts[0];
                lastName = parts.length > 1 ? parts.slice(1).join(' ') : (firstName.length >= 2 ? firstName : 'User');
            }

            const payload = {
                ...data,
                firstName,
                lastName,
                phoneNumber: data.phone,
            };

            await registerUser(payload as unknown as RegisterRequest);
            closeModal();
            resetRegister();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleRegisterSubmit(onRegisterSubmit as any)} className="space-y-3">
            {/* Hidden role — always PATIENT for self-registration */}
            <input type="hidden" value="PATIENT" {...registerFields('role')} />

            <div className="grid grid-cols-2 max-[520px]:grid-cols-1 gap-3">
                <AuthInput label="Full Name" icon={<FaUser />} error={registerErrors.name} {...registerFields('name')} placeholder="YOUR NAME" />
                <AuthInput label="Email" icon={<FaEnvelope />} error={registerErrors.email} {...registerFields('email')} placeholder="YOU@EXAMPLE.COM" type="email" />
                <AuthInput label="Phone" icon={<FaPhone />} error={registerErrors.phone} {...registerFields('phone')} placeholder="+91 XXXXX XXXXX" />
                <AuthInput label="Password" icon={<FaLock />} error={registerErrors.password} {...registerFields('password')} placeholder="••••••••" type="password" />
                <AuthInput label="Confirm Password" icon={<FaLock />} error={registerErrors.confirmPassword} {...registerFields('confirmPassword')} placeholder="••••••••" type="password" />

                <div className="space-y-1">
                    <div className="text-xs text-slate-500 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100 h-full flex items-center">
                        Creating a <span className="font-bold text-slate-700 mx-1">Patient</span> account.
                        Staff accounts are created by the Admin.
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 max-[520px]:grid-cols-1 gap-3">
                <AuthInput label="Address" icon={<FaMapMarkerAlt />} error={registerErrors.address} {...registerFields('address')} placeholder="CITY, COUNTRY" />
                <AuthInput label="Date Of Birth" icon={<FaBirthdayCake />} error={registerErrors.dateOfBirth} {...registerFields('dateOfBirth')} type="date" />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#008080] h-10 rounded-2xl text-white font-bold text-[12px] tracking-[0.08em] uppercase transition-all hover:brightness-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isSubmitting ? <LoadingSpinner size="sm" /> : <>Create An Account <FaChevronRight className="text-[10px]" /></>}
            </button>
        </form>
    );
};

export default RegisterForm;
