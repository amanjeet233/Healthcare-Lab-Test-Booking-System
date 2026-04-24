import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, User, AlertCircle } from 'lucide-react';
import { consultationService, type Doctor, type TimeSlot } from '../../services/consultationService';
import ConsultationBookingModal from './ConsultationBookingModal';
import { notify } from '../../utils/toast';

const DoctorAvailabilitySection: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

    useEffect(() => {
        loadDoctors();
    }, []);

    useEffect(() => {
        if (selectedDoctor) {
            loadSlots();
        }
    }, [selectedDoctor, selectedDate]);

    const loadDoctors = async () => {
        try {
            const data = await consultationService.getDoctors();
            setDoctors(data);
            if (data.length > 0) setSelectedDoctor(data[0]);
        } catch (error) {
            notify.error('Failed to load specialists.');
        } finally {
            setIsLoading(false);
        }
    };

    const loadSlots = async () => {
        if (!selectedDoctor) return;
        try {
            const data = await consultationService.getDoctorAvailability(selectedDoctor.id, selectedDate);
            setSlots(data);
        } catch (error) {
            notify.error('Availability synchronization failed.');
        }
    };

    const handleBookInitiation = (slot: TimeSlot) => {
        if (!slot.isAvailable) return;
        setSelectedSlot(slot);
        setIsBookingModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full"
                />
            </div>
        );
    }

    return (
        <section className="py-12 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-primary/5 pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-cta animate-pulse" />
                        <span className="text-[10px] font-bold text-cta uppercase tracking-widest">Protocol: Virtual Consultation</span>
                    </div>
                    <h2 className="text-3xl font-black text-text uppercase tracking-tight italic">
                        Specialist <span className="text-primary italic">Availability</span>
                    </h2>
                    <p className="text-[11px] text-text/60 font-medium max-w-md leading-relaxed">
                        Access our global network of medical intelligence specialists. Secure an encrypted neural link for clinical synthesis.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                        <select
                            value={selectedDoctor?.id}
                            onChange={(e) => setSelectedDoctor(doctors.find(d => d.id === e.target.value) || null)}
                            className="bg-background border border-primary/10 rounded-xl pl-12 pr-6 py-3 text-[11px] font-bold text-text outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                        >
                            {doctors.map(dr => (
                                <option key={dr.id} value={dr.id}>{dr.name} - {dr.specialty}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative group">
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                        <input
                            type="date"
                            value={selectedDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-background border border-primary/10 rounded-xl pl-12 pr-6 py-3 text-[11px] font-bold text-text outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Doctor Brief */}
                <div className="bg-white/40 backdrop-blur-xl border border-primary/5 rounded-[2rem] p-8 space-y-6 shadow-md">
                    {selectedDoctor && (
                        <>
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/5 relative overflow-hidden">
                                    <User className="w-10 h-10" />
                                    <div className="absolute inset-x-0 bottom-0 bg-primary/20 h-1/3 flex items-center justify-center">
                                        <span className="text-[8px] font-black">{selectedDoctor.rating} ★</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-text uppercase italic">{selectedDoctor.name}</h3>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{selectedDoctor.specialty} Specialist</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-primary/5 rounded-2xl">
                                    <span className="text-[9px] font-bold text-text/40 uppercase tracking-widest">Experience</span>
                                    <span className="text-[11px] font-black text-text uppercase">{selectedDoctor.experience}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-text/40 uppercase tracking-widest">Education</span>
                                    <p className="text-[11px] font-medium text-text leading-tight">{selectedDoctor.education}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-text/40 uppercase tracking-widest">Clinical Bio</span>
                                    <p className="text-[11px] font-medium text-text/70 leading-relaxed italic">"{selectedDoctor.bio}"</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Slots Grid */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black text-text uppercase tracking-widest">Tele-Medical Windows</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-cta" />
                                <span className="text-[8px] font-bold text-text/40 uppercase">Open</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-primary/20" />
                                <span className="text-[8px] font-bold text-text/40 uppercase">Reserved</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        <AnimatePresence mode="popLayout">
                            {slots.map((slot, i) => (
                                <motion.button
                                    key={slot.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    disabled={!slot.isAvailable}
                                    onClick={() => handleBookInitiation(slot)}
                                    className={`p-6 rounded-2xl border transition-all text-center group cursor-pointer ${slot.isAvailable
                                        ? 'bg-white border-primary/10 shadow-sm hover:border-cta hover:shadow-md active:scale-95'
                                        : 'bg-primary/5 border-transparent opacity-40 grayscale'
                                        }`}
                                >
                                    <span className={`text-sm font-black uppercase ${slot.isAvailable ? 'text-text group-hover:text-cta' : 'text-text/40'}`}>
                                        {slot.time}
                                    </span>
                                    {slot.isAvailable && (
                                        <div className="mt-2 text-[8px] font-bold text-cta opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                                            Initialize Link
                                        </div>
                                    )}
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>

                    {slots.length === 0 && (
                        <div className="py-20 text-center space-y-4 opacity-30">
                            <AlertCircle className="w-12 h-12 mx-auto text-primary" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No availability detected for target date.</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedDoctor && (
                <ConsultationBookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    doctor={selectedDoctor}
                    date={selectedDate}
                    slot={selectedSlot}
                />
            )}
        </section>
    );
};

export default DoctorAvailabilitySection;
