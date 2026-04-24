import React, { Suspense, lazy, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaLocationArrow, FaPhoneAlt, FaClipboardCheck, FaWhatsapp, FaUserAlt, FaRadiation, FaTint, FaSyringe, FaPills } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useModal } from '../context/ModalContext';
import toast from 'react-hot-toast';

// Lazy load UI components
const TestCarousel = lazy(() => import('../components/ui/TestCarousel'));
const HeroBannerCarousel = lazy(() => import('../components/ui/HeroBannerCarousel'));
const PulseSupport = lazy(() => import('../components/ui/PulseSupport'));
const ExpertsSection = lazy(() => import('../components/doctor/ExpertsSection'));
const CategoryBar = lazy(() => import('../components/ui/CategoryBar'));
const DiagnosticProtocol = lazy(() => import('../components/ui/DiagnosticProtocol'));
const UserDashboard = lazy(() => import('../components/dashboard/UserDashboard'));
const HomeCollectionProcess = lazy(() => import('../components/ui/HomeCollectionProcess'));
const PromotionalOffersWidget = lazy(() => import('../components/dashboard/PromotionalOffersWidget'));
const DNAHelix3D = lazy(() => import('../components/3d/DNAHelix3D'));

// Skeleton Fallback for 3D/Heavy sections
const SkeletonFallback = () => (
    <div className="w-full h-full min-h-50 flex items-center justify-center bg-transparent">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin opacity-20" />
    </div>
);

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, currentUser } = useAuth();
    const { openAuthModal } = useModal();

    // Auto-redirect staff users to their dedicated dashboards
    useEffect(() => {
        if (!isAuthenticated || !currentUser?.role) return;
        const role = currentUser.role;
        if (role === 'ADMIN') navigate('/admin', { replace: true });
        else if (role === 'TECHNICIAN') navigate('/technician', { replace: true });
        else if (role === 'MEDICAL_OFFICER') navigate('/medical-officer', { replace: true });
    // PATIENT stays on landing page
    }, [isAuthenticated, currentUser, navigate]);

    // Optimize 3D Rendering: Only load/render when visible
    const [show3D, setShow3D] = useState(false);
    const ref3D = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShow3D(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );
        if (ref3D.current) observer.observe(ref3D.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="w-full bg-[#F0F9F9] flex flex-col">
            <div className="w-full overflow-x-hidden space-y-0">
                {/* HERO SECTION */}
                <section className="relative pt-4 pb-2 flex items-center overflow-hidden">
                    <div className="absolute inset-0 bg-white/40 opacity-10 blur-[80px] -z-10 animate-blob" />

                    <div className="content-wrapper relative grid grid-cols-1 items-center">

                        <div ref={ref3D} className="absolute right-[2%] top-1/2 -translate-y-1/2 hidden lg:block w-[42%] max-w-160 h-130 pointer-events-none z-0">
                            <div className="absolute inset-0 rounded-[48%] bg-linear-to-br from-cyan-200/50 via-teal-100/35 to-transparent blur-3xl opacity-70" />
                            <div className="absolute inset-0 rounded-[40%] border border-cyan-200/30 bg-white/10 backdrop-blur-[2px] shadow-[0_30px_80px_rgba(45,212,191,0.12)]" />
                            {show3D && (
                                <Suspense fallback={<SkeletonFallback />}>
                                    <DNAHelix3D className="relative h-full w-full opacity-95 scale-[0.92]" />
                                </Suspense>
                            )}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="space-y-2 lg:space-y-3 text-center lg:text-left z-10 relative max-w-lg mx-auto lg:mx-0"
                        >
                            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10 backdrop-blur-md">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-sm shadow-primary/40" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-800/70">Healthcare OS v2</span>
                            </div>

                            <div className="space-y-1 lg:space-y-2 pt-1">
                                <h1 className="text-2xl md:text-3xl lg:text-[36px] font-black text-[#164E63] leading-tight tracking-tighter uppercase italic text-balance">
                                    YOUR HEALTH <br />
                                    <span className="text-cyan-600">POCKET-SIZED.</span>
                                </h1>
                                <p className="text-[11px] md:text-xs lg:text-[13px] text-cyan-900/60 font-bold max-w-sm leading-snug mx-auto lg:mx-0">
                                    Track reports easily, consult top doctors, and manage your health from one radical interface.
                                </p>
                            </div>

                            {/* SEARCH BRIDGE */}
                            <div className="w-full max-w-3xl mx-auto pt-3 space-y-3">
                                <div className="flex bg-white rounded-full p-1 border border-gray-100 shadow-md items-center relative z-20 flex-col sm:flex-row gap-1 sm:gap-0 max-w-2xl mx-auto lg:mx-0">
                                    <div
                                        className="flex items-center justify-between sm:justify-start px-2 space-x-1.5 border-b sm:border-b-0 sm:border-r border-gray-200 w-full sm:w-auto h-8 cursor-pointer hover:bg-gray-50 transition-colors rounded-l-full"
                                        onClick={() => toast('Auto-location feature coming soon!', { icon: '📍' })}
                                    >
                                        <div className="flex items-center gap-1">
                                            <FaMapMarkerAlt className="text-pink-500 text-xs" />
                                            <span className="text-gray-800 font-bold text-[10px] whitespace-nowrap">New Delhi</span>
                                        </div>
                                        <FaLocationArrow className="text-red-500 cursor-pointer text-xs ml-1" />
                                    </div>
                                    <div className="flex-1 flex items-center px-2 w-full h-8">
                                        <input
                                            type="text"
                                            placeholder="Search tests or checkups"
                                            className="w-full bg-transparent border-none outline-none text-[10px] font-medium text-gray-700 placeholder-gray-400"
                                            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/lab-tests/all-lab-tests?search=' + (e.target as HTMLInputElement).value); }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => navigate('/lab-tests/all-lab-tests')}
                                        title="Search Tests"
                                        aria-label="Search Tests"
                                        className="w-full sm:w-8 h-8 rounded-full bg-[#ff4e4e] text-white flex items-center justify-center hover:scale-105 shadow-sm shrink-0"
                                    >
                                        <FaSearch className="text-[10px]" />
                                    </button>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 justify-center lg:justify-start w-full relative z-20 max-w-2xl mx-auto lg:mx-0">
                                    <a href="tel:+918000000000" className="flex-1 flex items-center justify-center space-x-1.5 bg-[#f0f8fd] text-gray-700 py-2 rounded-lg hover:bg-[#e1f0fa] transition-colors border border-[#d6effd] cursor-pointer">
                                        <FaPhoneAlt className="text-blue-500 text-xs" />
                                        <span className="text-[10px]">Book via <span className="font-bold text-gray-900">Phone</span></span>
                                    </a>
                                    <button
                                        onClick={() => isAuthenticated ? navigate('/my-bookings') : openAuthModal('login')}
                                        className="flex-1 flex items-center justify-center space-x-1.5 bg-[#fdf2f6] text-gray-700 py-2 rounded-lg hover:bg-[#fce5ee] transition-colors border border-[#fae2ec]"
                                    >
                                        <FaClipboardCheck className="text-pink-500 text-xs" />
                                        <span className="text-[10px]">Quick <span className="font-bold text-gray-900">Order</span></span>
                                    </button>
                                    <button
                                        onClick={() => toast('Whatsapp integration coming soon!', { icon: '💬' })}
                                        className="flex-1 flex items-center justify-center space-x-1.5 bg-[#f0fcf4] text-gray-700 py-2 rounded-lg hover:bg-[#e1faea] transition-colors border border-[#dafae6]"
                                    >
                                        <FaWhatsapp className="text-green-500 text-xs" />
                                        <span className="text-[10px]">Book via <span className="font-bold text-gray-900">WA</span></span>
                                    </button>
                                </div>

                                <div className="bg-white/55 backdrop-blur-xl rounded-[1.5rem] border border-white/70 p-3 sm:p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] relative z-20 pointer-events-auto max-w-2xl mx-auto lg:mx-0">
                                    <h2 className="text-[11px] sm:text-xs font-bold text-gray-900 mb-3 text-left">Find tests & packages for your needs</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                                        <div
                                            onClick={() => navigate(`/lab-tests/all-lab-tests?category=${encodeURIComponent('Full Body Checkup')}`)}
                                            className="md:col-span-5 bg-emerald-50/60 backdrop-blur-md border border-emerald-100/70 rounded-xl p-2.5 flex items-center justify-between hover:shadow-sm transition-all cursor-pointer group"
                                        >
                                            <div>
                                                <p className="font-black text-emerald-900 text-left text-[9px] leading-snug uppercase tracking-wide">Full Body</p>
                                                <p className="font-black text-emerald-900 text-left text-[9px] leading-snug uppercase tracking-wide">Packages</p>
                                            </div>
                                            <div className="p-2 rounded-xl shadow-[0_8px_18px_rgba(16,185,129,0.18)] bg-gradient-to-br from-white via-emerald-50 to-emerald-100/70 transition-all">
                                                <FaUserAlt className="text-green-600 text-[15px]" />
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => navigate(`/lab-tests/all-lab-tests?category=${encodeURIComponent('Imaging')}`)}
                                            className="md:col-span-7 bg-blue-50/60 backdrop-blur-md border border-blue-100/70 rounded-xl p-2.5 flex items-center justify-between hover:shadow-sm transition-all cursor-pointer group"
                                        >
                                            <div>
                                                <p className="font-black text-blue-900 text-left text-[9px] leading-snug uppercase tracking-wide">X Rays, Scans &</p>
                                                <p className="font-black text-blue-900 text-left text-[9px] leading-snug uppercase tracking-wide">More</p>
                                            </div>
                                            <div className="p-2 rounded-xl shadow-[0_8px_18px_rgba(59,130,246,0.18)] bg-gradient-to-br from-white via-blue-50 to-blue-100/70 transition-all">
                                                <FaRadiation className="text-blue-600 text-[15px]" />
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => navigate(`/lab-tests/all-lab-tests?category=${encodeURIComponent('Fever')}`)}
                                            className="md:col-span-4 bg-cyan-50/60 backdrop-blur-md border border-cyan-100/70 rounded-xl p-2.5 flex items-center justify-between hover:shadow-sm transition-all cursor-pointer group"
                                        >
                                            <p className="font-black text-cyan-900 text-left text-[9px] uppercase tracking-wide">Fever Tests</p>
                                            <div className="p-2 rounded-xl shadow-[0_8px_18px_rgba(6,182,212,0.18)] bg-gradient-to-br from-white via-cyan-50 to-cyan-100/70 transition-all">
                                                <FaTint className="text-cyan-600 text-[14px]" />
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => navigate(`/lab-tests/all-lab-tests?category=${encodeURIComponent('Diabetes')}`)}
                                            className="md:col-span-4 bg-pink-50/60 backdrop-blur-md border border-pink-100/70 rounded-xl p-2.5 flex items-center justify-between hover:shadow-sm transition-all cursor-pointer group"
                                        >
                                            <div>
                                                <p className="font-black text-pink-900 text-left text-[9px] leading-snug uppercase tracking-wide">Diabetes</p>
                                                <p className="font-black text-pink-900 text-left text-[9px] leading-snug uppercase tracking-wide">Tests</p>
                                            </div>
                                            <div className="p-2 rounded-xl shadow-[0_8px_18px_rgba(236,72,153,0.18)] bg-gradient-to-br from-white via-pink-50 to-pink-100/70 transition-all">
                                                <FaSyringe className="text-pink-600 text-[14px]" />
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => navigate(`/lab-tests/all-lab-tests?category=${encodeURIComponent('Vitamin')}`)}
                                            className="md:col-span-4 bg-purple-50/60 backdrop-blur-md border border-purple-100/70 rounded-xl p-2.5 flex items-center justify-between hover:shadow-sm transition-all cursor-pointer group"
                                        >
                                            <div>
                                                <p className="font-black text-purple-900 text-left text-[9px] leading-snug uppercase tracking-wide">Vitamins</p>
                                                <p className="font-black text-purple-900 text-left text-[9px] leading-snug uppercase tracking-wide">Tests</p>
                                            </div>
                                            <div className="p-2 rounded-xl shadow-[0_8px_18px_rgba(168,85,247,0.18)] bg-gradient-to-br from-white via-purple-50 to-purple-100/70 transition-all">
                                                <FaPills className="text-purple-600 text-[14px]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            </motion.div>
                    </div>
                </section>

                <CategoryBar />

                <Suspense fallback={<SkeletonFallback />}>
                    <DiagnosticProtocol />
                </Suspense>

                <Suspense fallback={<SkeletonFallback />}>
                    <PromotionalOffersWidget
                        onPromoSelect={(code) => navigate('/cart', { state: { promoCode: code } })}
                    />
                </Suspense>

                <Suspense fallback={<SkeletonFallback />}>
                    <HomeCollectionProcess />
                </Suspense>

                <Suspense fallback={<SkeletonFallback />}>
                    <UserDashboard />
                </Suspense>

                <Suspense fallback={<SkeletonFallback />}>
                    <ExpertsSection />
                </Suspense>

                <Suspense fallback={<div className="w-full h-48 bg-slate-100 animate-pulse" />}>
                    <HeroBannerCarousel />
                </Suspense>

                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45 }}
                    className="w-full py-2 lg:py-3 bg-white relative overflow-hidden mt-0 mb-2 lg:mb-3 flex justify-center max-w-310 mx-4 xl:mx-auto rounded-[1.5rem] shadow-sm border border-slate-100"
                >
                    <div className="content-wrapper w-full grid lg:grid-cols-2 gap-5 lg:gap-8 items-center px-5 lg:px-7 rounded-[1.5rem] bg-gradient-to-r from-[#e7f0f2] via-[#d7e6ea] to-[#cde5ea]">
                        <div className="space-y-3 relative z-10 text-center lg:text-left flex flex-col items-center lg:items-start lg:pl-12 w-full">
                            <h2 className="text-lg md:text-xl lg:text-2xl font-black leading-tight tracking-tighter uppercase italic text-balance text-slate-800">
                                TRANSFORM <br />
                                <span className="text-primary underline underline-offset-2 decoration-primary/20 italic">LAB CARE.</span>
                            </h2>
                            <p className="text-[10px] lg:text-xs font-bold text-slate-500 max-w-sm opacity-90 leading-snug">
                                Experience the future of biotechnology through our unified AR dashboard. Zero friction. Total precision.
                            </p>
                            <div className="flex flex-row flex-wrap justify-center lg:justify-start gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => navigate('/reports')}
                                    className="bg-primary text-white border border-primary/20 px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-sm hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all"
                                >
                                    DOWNLOAD OS
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/tests')}
                                    className="bg-primary/10 text-primary border border-primary/10 backdrop-blur-sm px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-primary/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    ENTERPRISE V2
                                </button>
                            </div>
                        </div>

                        <div className="relative flex justify-center lg:justify-end mt-4 lg:mt-0 lg:pr-12 w-full">
                            <div className="absolute -inset-6 bg-primary/20 blur-2xl rounded-full opacity-60 animate-pulse" />
                            <div className="w-40 sm:w-48 min-h-55 lg:h-60 bg-white rounded-2xl sm:rounded-[1.5rem] border border-slate-100 shadow-lg rotate-0 lg:rotate-8 overflow-hidden relative mx-auto">
                                <div className="absolute top-2 left-4 right-4 flex justify-between items-center h-3">
                                    <div className="w-8 h-1 bg-slate-200 rounded-full" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm" />
                                </div>
                                <div className="mt-8 px-4 sm:px-5">
                                    <h4 className="text-sm sm:text-base font-black text-slate-800 mb-3 uppercase tracking-tighter italic">
                                        AI REPORT <br />
                                        <span className="text-primary opacity-80">#774-X</span>
                                    </h4>
                                    <div className="space-y-1.5 sm:space-y-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-5 sm:h-6 bg-slate-50 rounded-lg flex items-center px-2 border border-slate-100">
                                                <div className="w-1/2 h-1 bg-slate-200 rounded-full" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 sm:mt-5 h-12 sm:h-16 rounded-xl bg-linear-to-br from-primary/5 to-transparent flex items-center justify-center border-2 border-dashed border-primary/20">
                                        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-primary/30 border-t-primary/70 animate-[spin_2.4s_linear_infinite] flex items-center justify-center">
                                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-primary/55 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <Suspense fallback={null}>
                    <PulseSupport />
                </Suspense>
            </div >
        </div >
    );
};

export default LandingPage;
