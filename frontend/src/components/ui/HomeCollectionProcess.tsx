import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Building2, Zap, ShieldCheck, Plus } from 'lucide-react';
import { FaMapLocationDot, FaTruck, FaFlask } from 'react-icons/fa6';
import { FaHeartbeat, FaMousePointer, FaCheckCircle } from 'react-icons/fa';

/**
 * ✅ HOME COLLECTION PROCESS COMPONENT
 * Displays 5-step process for home sample collection
 * Builds trust by showing how home collection works
 */
const HomeCollectionProcess: React.FC = () => {
  const navigate = useNavigate();

  // Step data
  const steps = [
    {
      number: 1,
      icon: FaMousePointer,
      title: 'Easy Online Booking',
      description: 'Search for tests and packages, book your preferred time slot and enter your address for seamless at-home lab tests.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      lightBg: 'bg-blue-100/30'
    },
    {
      number: 2,
      icon: FaMapLocationDot,
      title: 'Live Tracking',
      description: 'Track our trained phlebotomist\'s real-time location for seamless sample collection.',
      color: 'from-cyan-500 to-teal-500',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      lightBg: 'bg-cyan-100/30'
    },
    {
      number: 3,
      icon: FaHeartbeat,
      title: 'Safe Sample Collection',
      description: 'Our phlebotomists follow strict safety protocols to collect samples safely at home and on time.',
      color: 'from-teal-500 to-emerald-500',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      lightBg: 'bg-teal-100/30'
    },
    {
      number: 4,
      icon: FaFlask,
      title: 'Sample Received at Lab',
      description: 'Samples are transported securely to our accredited labs with world-class machines for testing by qualified experts.',
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      lightBg: 'bg-emerald-100/30'
    },
    {
      number: 5,
      icon: FaCheckCircle,
      title: 'Quick, Doctor-Verified Reports',
      description: 'Get doctor-approved reports via email and WhatsApp, with options for doctor follow-ups and AI insights.',
      color: 'from-green-500 to-lime-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      lightBg: 'bg-green-100/30'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="relative py-6 md:py-8 lg:py-10 overflow-hidden bg-white">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-[10%] w-48 h-48 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-[10%] w-48 h-48 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="content-wrapper relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-10"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary-teal opacity-70">
            Process Overview
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-[32px] font-black text-ever-green tracking-tighter uppercase leading-tight mt-1">
            How Does
            <br />
            <span className="bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 bg-clip-text text-transparent">
              Home Sample Collection
            </span>
            <br />
            Work?
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-2 max-w-xl mx-auto font-medium">
            Experience hassle-free lab testing from the comfort of your home. Our streamlined process ensures safety, convenience, and accuracy.
          </p>
        </motion.div>

        {/* Steps Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-3 lg:gap-2"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                variants={itemVariants}
                className="group relative h-full"
              >
                {/* Connector Line (hidden on mobile, visible on larger screens) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-24 -right-1.5 w-3 h-0.5 bg-gradient-to-r from-current via-transparent to-transparent opacity-30" />
                )}

                {/* Step Card */}
                <div
                  className={`h-full flex flex-col p-4 md:p-5 rounded-2xl border transition-all duration-300
                    ${step.bgColor} border-transparent hover:border-current shadow-sm hover:shadow-md`}
                >
                  {/* Number Circle */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-sm
                      bg-gradient-to-br ${step.color} shadow-md group-hover:scale-105 transition-transform
                    `}>
                      {step.number}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${step.textColor} opacity-60`}>
                      Step {step.number}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`${step.lightBg} w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                    <Icon className={`text-lg ${step.textColor}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm md:text-sm lg:text-base font-black text-ever-green mb-1.5 leading-tight">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-500 leading-snug font-medium flex-grow">
                    {step.description}
                  </p>

                  {/* Bottom accent */}
                  <div className={`h-0.5 w-8 bg-gradient-to-r ${step.color} rounded-full mt-3 group-hover:w-full transition-all`} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-6 md:mt-7 text-center"
        >
          <p className="text-xs md:text-sm text-gray-500 mb-4 font-medium">
            Ready to get started with home sample collection?
          </p>
          <button
            type="button"
            onClick={() => navigate('/tests')}
            className="inline-flex items-center gap-2 px-7 py-3 bg-slate-900 hover:bg-black text-white font-black uppercase text-[11px] tracking-wider rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Plus size={14} strokeWidth={2.75} />
            Book Lab Test
          </button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-5 md:mt-6 grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-4 border-t border-gray-100"
        >
          {[
            { icon: UserCheck, label: 'Trained Phlebotomists', value: '500+', iconClass: 'text-emerald-600' },
            { icon: Building2, label: 'Accredited Labs', value: '25+', iconClass: 'text-cyan-600' },
            { icon: Zap, label: 'Fast Reports', value: '24hrs', iconClass: 'text-amber-500' },
            { icon: ShieldCheck, label: 'Secure & Safe', value: '100%', iconClass: 'text-indigo-600' }
          ].map((badge, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="text-center p-3 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-blue-50/50 transition-colors"
            >
              <div className="w-9 h-9 mx-auto mb-2 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <badge.icon className={`w-4.5 h-4.5 ${badge.iconClass}`} strokeWidth={2.5} />
              </div>
              <div className="text-xs font-black text-ever-green">{badge.value}</div>
              <div className="text-[10px] text-gray-500 font-medium mt-0.5">{badge.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HomeCollectionProcess;
