import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, PhoneCall, HeartPulse } from 'lucide-react';

const PulseSupport: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
            <AnimatePresence>
                {isOpen && (
                    <div className="flex flex-col gap-2">
                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-primary-teal text-white px-4 py-3 rounded-xl shadow-medical flex items-center gap-3 group hover:bg-ever-green transition-all"
                        >
                            <span className="text-[9px] font-black uppercase tracking-widest">Emergency Scan</span>
                            <PhoneCall className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white text-ever-green border border-muted-blue/20 px-4 py-3 rounded-xl shadow-medical flex items-center gap-3 group hover:border-electric-cyan transition-all"
                        >
                            <span className="text-[9px] font-black uppercase tracking-widest">Neural Support</span>
                            <MessageSquare className="w-4 h-4 text-primary-teal" />
                        </motion.button>
                    </div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-medical border border-primary-teal/5 relative group"       
            >
                {/* Notification Pulse */}
                <span className="absolute top-2 right-2 w-3 h-3 bg-soft-coral rounded-full border-2 border-white animate-pulse shadow-coral-glow z-10" />       

                <div className="absolute inset-0 bg-primary-teal/5 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />

                <HeartPulse
                    className={`w-6 h-6 text-primary-teal transition-all duration-500 relative z-20 ${isOpen ? 'rotate-90 scale-90' : 'group-hover:scale-110'}`}
                />
            </motion.button>
        </div>
    );
};

export default PulseSupport;
