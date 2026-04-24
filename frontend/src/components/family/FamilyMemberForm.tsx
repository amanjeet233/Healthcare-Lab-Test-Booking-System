import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaUser, FaCalendarAlt, FaVenusMars, FaPhone, FaEnvelope } from 'react-icons/fa';
import type { FamilyMemberRequest } from '../../services/familyMemberService';
import LoadingSpinner from '../common/LoadingSpinner';

const validationSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  relation: yup.string().required('Relation is required'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  gender: yup.string().oneOf(['MALE', 'FEMALE', 'OTHER']).required('Gender is required'),
  phoneNumber: yup.string().matches(/^[0-9+\-\s]*$/, 'Invalid phone number').optional(),
  email: yup.string().email('Invalid email').optional(),
  medicalHistory: yup.string().optional()
});

interface FamilyMemberFormProps {
  onSubmit: (data: FamilyMemberRequest) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
  initialValues?: Partial<FamilyMemberRequest>;
  submitLabel?: string;
}

const FamilyMemberForm: React.FC<FamilyMemberFormProps> = ({
  onSubmit,
  isSubmitting = false,
  onCancel,
  initialValues,
  submitLabel = 'Add Family Member'
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FamilyMemberRequest>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      gender: 'MALE',
      ...initialValues
    }
  });

  useEffect(() => {
    reset({
      name: initialValues?.name ?? '',
      relation: initialValues?.relation ?? '',
      dateOfBirth: initialValues?.dateOfBirth ?? '',
      gender: initialValues?.gender ?? 'MALE',
      bloodGroup: initialValues?.bloodGroup ?? '',
      phoneNumber: initialValues?.phoneNumber ?? '',
      email: initialValues?.email ?? '',
      medicalHistory: initialValues?.medicalHistory ?? ''
    });
  }, [initialValues, reset]);

  const relations = ['Spouse', 'Parent', 'Child', 'Sibling', 'Grandparent', 'Grandchild', 'Other'];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 md:space-y-4.5"
    >

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.22em]">Full Name *</label>
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-teal" />
            <input
              type="text"
              placeholder="Enter name"
              className={`w-full px-4 py-2.5 pl-11 bg-slate-50 border-2 rounded-2xl focus:outline-none focus:border-cyan-500 transition-all font-medium text-slate-900 text-sm ${errors.name ? 'border-red-500 bg-red-50' : 'border-slate-200'}
                }`}
              {...register('name')}
            />
          </div>
          {errors.name && <p className="text-xs text-red-600 font-600">{errors.name.message}</p>}
        </div>

        {/* Relation */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.22em]">Relation *</label>
          <div className="relative">
            <select
              className={`w-full px-4 py-2.5 bg-slate-50 border-2 rounded-2xl focus:outline-none focus:border-cyan-500 transition-all font-medium text-slate-900 text-sm ${errors.relation ? 'border-red-500 bg-red-50' : 'border-slate-200'}
              }`}
              {...register('relation')}
            >
              <option value="">Select relation</option>
              {relations.map(rel => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>
          </div>
          {errors.relation && <p className="text-xs text-red-600 font-600">{errors.relation.message}</p>}
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.22em]">Date of Birth *</label>
          <div className="relative">
            <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-teal" />
            <input
              type="date"
              className={`w-full px-4 py-2.5 pl-11 bg-slate-50 border-2 rounded-2xl focus:outline-none focus:border-cyan-500 transition-all font-medium text-slate-900 text-sm ${errors.dateOfBirth ? 'border-red-500 bg-red-50' : 'border-slate-200'}
                }`}
              {...register('dateOfBirth')}
            />
          </div>
          {errors.dateOfBirth && <p className="text-xs text-red-600 font-600">{errors.dateOfBirth.message}</p>}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.22em]">Gender *</label>
          <div className="relative">
            <FaVenusMars className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-teal" />
            <select
              className={`w-full px-4 py-2.5 pl-11 bg-slate-50 border-2 rounded-2xl focus:outline-none focus:border-cyan-500 transition-all font-medium text-slate-900 text-sm ${errors.gender ? 'border-red-500 bg-red-50' : 'border-slate-200'}
                }`}
              {...register('gender')}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          {errors.gender && <p className="text-xs text-red-600 font-600">{errors.gender.message}</p>}
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.22em]">Phone Number (Optional)</label>
          <div className="relative">
            <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-teal" />
            <input
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              className={`w-full px-4 py-2.5 pl-11 bg-slate-50 border-2 rounded-2xl focus:outline-none focus:border-cyan-500 transition-all font-medium text-slate-900 text-sm ${errors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-slate-200'}
                }`}
              {...register('phoneNumber')}
            />
          </div>
          {errors.phoneNumber && <p className="text-xs text-red-600 font-600">{errors.phoneNumber.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.22em]">Email (Optional)</label>
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-teal" />
            <input
              type="email"
              placeholder="email@example.com"
              className={`w-full px-4 py-2.5 pl-11 bg-slate-50 border-2 rounded-2xl focus:outline-none focus:border-cyan-500 transition-all font-medium text-slate-900 text-sm ${errors.email ? 'border-red-500 bg-red-50' : 'border-slate-200'}
                }`}
              {...register('email')}
            />
          </div>
          {errors.email && <p className="text-xs text-red-600 font-600">{errors.email.message}</p>}
        </div>
      </div>

      {/* Medical History */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.22em]">Medical History (Optional)</label>
        <textarea
          placeholder="Any relevant medical history or conditions..."
          rows={3}
          className={`w-full px-4 py-2.5 bg-slate-50 border-2 rounded-2xl focus:outline-none focus:border-cyan-500 transition-all font-medium text-slate-900 text-sm ${errors.medicalHistory ? 'border-red-500 bg-red-50' : 'border-slate-200'}
            }`}
          {...register('medicalHistory')}
        />
        {errors.medicalHistory && <p className="text-xs text-red-600 font-600">{errors.medicalHistory.message}</p>}
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3 bg-linear-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:from-cyan-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-2xl hover:bg-slate-200 transition-all text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default FamilyMemberForm;
