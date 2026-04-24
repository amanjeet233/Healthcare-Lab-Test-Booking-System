import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaLock, FaEnvelope, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useModal } from '../../context/ModalContext';
import type { LoginRequest } from '../../types/auth';
import LoadingSpinner from '../common/LoadingSpinner';
import AuthInput from './AuthInput';

const loginSchema = yup.object({
    email: yup.string().email('Valid email required').required('Email required'),
    password: yup.string().required('Password required'),
}).required();

interface LoginFormProps {
    onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onForgotPassword }) => {
    const { login } = useAuth();
    const { closeModal } = useModal();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const {
        register: loginFields,
        handleSubmit: handleLoginSubmit,
        formState: { errors: loginErrors },
        reset: resetLogin
    } = useForm<LoginRequest>({
        resolver: yupResolver(loginSchema) as any,
        defaultValues: {} as LoginRequest
    });

    const onLoginSubmit = async (data: LoginRequest) => {
        setIsSubmitting(true);
        try {
            await login(data);
            closeModal();
            resetLogin();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-3">
            <AuthInput
                label="Email"
                icon={<FaEnvelope />}
                error={loginErrors.email}
                {...loginFields('email')}
                placeholder="YOU@EXAMPLE.COM"
                type="email"
            />
            <AuthInput
                label="Password"
                icon={<FaLock />}
                error={loginErrors.password}
                {...loginFields('password')}
                placeholder="••••••••"
                type="password"
            />

            <div className="flex justify-end pr-1">
                <button type="button" onClick={onForgotPassword} className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#008080] hover:opacity-80 transition-all">
                    Forgot Password?
                </button>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#008080] h-10 rounded-2xl text-white font-bold text-[12px] tracking-[0.08em] uppercase transition-all hover:brightness-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isSubmitting ? <LoadingSpinner size="sm" /> : <>Sign In <FaChevronRight className="text-[10px]" /></>}
            </button>
        </form>
    );
};

export default LoginForm;
