import React from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, Activity, Ruler, Weight, User, Phone, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { HealthProfile } from '../../services/healthDataService';

interface HealthDataFormProps {
    initialData: HealthProfile;
    onSave: (data: Partial<HealthProfile>) => Promise<void>;
    onCancel: () => void;
}

const HealthDataForm: React.FC<HealthDataFormProps> = ({ initialData, onSave, onCancel }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm({
        defaultValues: {
            bloodType: initialData.bloodType,
            metrics: {
                age: initialData.metrics.age,
                height: initialData.metrics.height,
                weight: initialData.metrics.weight,
                bloodPressure: initialData.metrics.bloodPressure
            },
            emergencyContact: initialData.emergencyContact,
            allergies: initialData.allergies.join(', '),
            chronicConditions: initialData.chronicConditions.join(', ')
        }
    });

    const onSubmit = async (data: any) => {
        const formattedData: Partial<HealthProfile> = {
            bloodType: data.bloodType,
            metrics: data.metrics,
            emergencyContact: data.emergencyContact,
            allergies: data.allergies.split(',').map((s: string) => s.trim()).filter(Boolean),
            chronicConditions: data.chronicConditions.split(',').map((s: string) => s.trim()).filter(Boolean)
        };
        await onSave(formattedData);
    };

    const inputClasses = "w-full bg-white border-2 border-primary/5 rounded-2xl px-6 py-4 text-xs font-black text-evergreen uppercase tracking-widest outline-none focus:border-primary/20 transition-all placeholder:text-muted-gray/20 shadow-inner group-focus-within:shadow-medical";
    const labelClasses = "text-[9px] font-black text-muted-gray uppercase tracking-[0.3em] ml-4 mb-2 block opacity-40";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-3xl border border-primary/10 rounded-[3rem] p-10 shadow-radical relative overflow-hidden"
        >
            {/* Design accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />

            <form onSubmit={handleSubmit(onSubmit)} className="relative z-10 space-y-10">
                <div className="flex justify-between items-end pb-8 border-b border-primary/5">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Node Reconfiguration</span>
                        <h3 className="text-3xl font-black text-evergreen uppercase tracking-tighter italic leading-none">Health <span className="text-secondary">Telemetry</span></h3>
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="bg-white/40 border border-primary/10 p-4 rounded-2xl text-muted-gray hover:text-red-500 transition-all cursor-pointer shadow-medical"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !isDirty}
                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-medical transition-all active:scale-95 cursor-pointer ${isSubmitting || !isDirty ? 'bg-muted-gray text-white/50 cursor-not-allowed' : 'bg-primary text-white hover:bg-evergreen'
                                }`}
                        >
                            {isSubmitting ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                    <Activity className="w-4 h-4" />
                                </motion.div>
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {isSubmitting ? 'SYNCHRONIZING...' : 'COMMIT CHANGES'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Primary Biometrics */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 text-primary">
                            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center">
                                <Activity className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Core Biometrics</span>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1 group">
                                <label className={labelClasses}>Age (Yrs)</label>
                                <input
                                    {...register('metrics.age', { required: true, min: 1, max: 120 })}
                                    className={inputClasses}
                                    type="number"
                                />
                            </div>
                            <div className="space-y-1 group">
                                <label className={labelClasses}>Blood Type</label>
                                <select
                                    {...register('bloodType', { required: true })}
                                    className={inputClasses + " appearance-none cursor-pointer"}
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1 group">
                                <label className={labelClasses}>Height (CM)</label>
                                <div className="relative">
                                    <input
                                        {...register('metrics.height', { required: true, min: 50, max: 250 })}
                                        className={inputClasses}
                                        type="number"
                                    />
                                    <Ruler className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20" />
                                </div>
                            </div>
                            <div className="space-y-1 group">
                                <label className={labelClasses}>Weight (KG)</label>
                                <div className="relative">
                                    <input
                                        {...register('metrics.weight', { required: true, min: 20, max: 300 })}
                                        className={inputClasses}
                                        type="number"
                                        step="0.1"
                                    />
                                    <Weight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20" />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-primary/[0.02] border border-primary/5 rounded-[2.5rem] flex items-center gap-6">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-medical">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-evergreen uppercase tracking-widest leading-relaxed">
                                    All values are validated against global health protocols. Sync latency: 240ms.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Medical Context & History */}
                    <div className="space-y-10">
                        {/* Emergency Contact */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 text-red-500">
                                <div className="w-10 h-10 bg-red-500/5 rounded-xl flex items-center justify-center">
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-[0.2em]">Emergency Protocol</span>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1 group">
                                        <label className={labelClasses}>Guardian Name</label>
                                        <div className="relative">
                                            <input
                                                {...register('emergencyContact.name', { required: true })}
                                                className={inputClasses}
                                                placeholder="FULL NAME..."
                                            />
                                            <User className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20" />
                                        </div>
                                    </div>
                                    <div className="space-y-1 group">
                                        <label className={labelClasses}>Relation</label>
                                        <input
                                            {...register('emergencyContact.relation', { required: true })}
                                            className={inputClasses}
                                            placeholder="SPOUSE, PARENT..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1 group">
                                    <label className={labelClasses}>Emergency Lifeline</label>
                                    <div className="relative">
                                        <input
                                            {...register('emergencyContact.phone', { required: true })}
                                            className={inputClasses}
                                            placeholder="+1 (555) 000-0000"
                                        />
                                        <Phone className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Conditions & Sensitivities */}
                        <div className="space-y-6">
                            <div className="space-y-1 group">
                                <label className={labelClasses}>Active Sensitivities (Comma separated)</label>
                                <textarea
                                    {...register('allergies')}
                                    className={inputClasses + " min-h-[100px] py-6 resize-none"}
                                    placeholder="PENICILLIN, DUST, PEANUTS..."
                                />
                            </div>
                            <div className="space-y-1 group">
                                <label className={labelClasses}>Chronic Conditions (Comma separated)</label>
                                <textarea
                                    {...register('chronicConditions')}
                                    className={inputClasses + " min-h-[100px] py-6 resize-none"}
                                    placeholder="ASTHMA, DIABETES, HYPERTENSION..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {Object.keys(errors).length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="bg-red-500/5 border border-red-500/10 p-6 rounded-[2rem] flex items-center gap-6"
                        >
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-medical">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-relaxed">
                                CRITICAL: Required telemetry nodes are missing or out of valid physiological range.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </motion.div>
    );
};

export default HealthDataForm;
