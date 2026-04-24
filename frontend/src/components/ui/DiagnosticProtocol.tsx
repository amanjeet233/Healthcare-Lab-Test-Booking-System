import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, MapPin, Microscope, FileText } from 'lucide-react';

const steps = [
    {
        number: "01",
        title: "Scan",
        desc: "Health mapping.",
        icon: <ClipboardList className="w-5 h-5" />,
        color: "#1d4ed8" // Royal Blue
    },
    {
        number: "02",
        title: "Visit",
        desc: "Quick collection.",
        icon: <MapPin className="w-5 h-5" />,
        color: "#10b981" // Emerald
    },
    {
        number: "03",
        title: "Analysis",
        desc: "Advanced processing.",
        icon: <Microscope className="w-5 h-5" />,
        color: "#f59e0b" // Amber
    },
    {
        number: "04",
        title: "Report",
        desc: "Result delivery.",
        icon: <FileText className="w-5 h-5" />,
        color: "#08555F" // Deep Teal
    }
];

const DiagnosticProtocol: React.FC = () => {
    return (
        <section className="py-4 md:py-6 relative overflow-hidden bg-off-white">
            <div className="max-w-[1000px] mx-auto px-4 md:px-6 relative z-10">      
                <div className="flex flex-col md:flex-row justify-between items-end mb-4 md:mb-6 gap-3">
                    <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary opacity-60">Strategic Workflow</span>
                        <h2 className="text-xl md:text-2xl font-black text-evergreen uppercase tracking-tighter italic leading-none">
                            DIAGNOSTIC <span className="text-primary italic">PROTOCOL</span>
                        </h2>
                    </div>
                    <p className="text-[10px] md:text-[11px] font-bold text-muted-gray max-w-xs uppercase tracking-widest opacity-60">
                        A proprietary four-stage methodology for precision health synthesis.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="bg-white p-4 md:p-5 rounded-2xl border border-primary/5 shadow-sm hover:shadow-md hover:border-primary/10 transition-all duration-500 group relative"
                        >
                            <div className="flex justify-between items-start mb-4 md:mb-5">
                                <div
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-primary/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                                    style={{ color: step.color }}
                                >
                                    {step.icon}
                                </div>
                                <span className="text-xl md:text-2xl font-black text-primary/10 tracking-tighter group-hover:text-primary/20 transition-colors">
                                    {step.number}
                                </span>
                            </div>

                            <div className="space-y-2 md:space-y-3">
                                <h4 className="text-sm md:text-base font-black uppercase tracking-tighter text-evergreen">
                                    {step.title}
                                </h4>
                                <div className="h-0.5 w-6 md:w-8 bg-primary/20 group-hover:w-12 md:group-hover:w-16 transition-all duration-500" />
                                <p className="text-[9px] md:text-[10px] font-bold text-muted-gray uppercase tracking-widest leading-relaxed opacity-70">
                                    {step.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DiagnosticProtocol;
