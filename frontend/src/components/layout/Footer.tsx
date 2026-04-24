import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Facebook, Twitter, Linkedin, Instagram, Heart, ShieldCheck } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Services',
      links: [
        { label: 'Book Tests', href: '/tests' },
        { label: 'Packages', href: '/packages' },
        { label: 'Consult', href: '/book-consultation' },
        { label: 'Reports', href: '/reports' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Career', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
        { label: 'Cookie', href: '#' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'FB', color: 'text-[#1877F2]' },
    { icon: Twitter, href: '#', label: 'TW', color: 'text-[#1DA1F2]' },
    { icon: Linkedin, href: '#', label: 'LI', color: 'text-[#0A66C2]' },
    { icon: Instagram, href: '#', label: 'IG', color: 'text-[#E4405F]' },
  ];

  return (
    <footer className="w-full mt-4 md:mt-8 bg-teal-950 text-teal-50 border-t border-teal-900 flex justify-center relative overflow-hidden z-10">
      {/* Decorative ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/20 via-teal-950 to-teal-950 pointer-events-none opacity-40 block" />

      {/* 🚀 Content Wrapper Locked at 1210px for zoom-out stability */}        
      <div className="w-full max-w-[1210px] mx-auto px-4 md:px-6 py-6 md:py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-8">

          {/* Logo & Contact: Simplified */}
          <div className="md:col-span-5 lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">HEALTHCARE<span className="text-primary italic">LAB</span></h2>
            </div>
            <p className="text-[13px] text-teal-100/70 font-bold leading-relaxed max-w-sm">
              Trusted diagnostics partner with 500+ tests and rapid delivery. Experience the future of biotechnology through our unified interface.
            </p>
            <div className="flex flex-col gap-3 text-[13px] font-bold text-teal-100 pt-2">
              <a href="tel:+917783856140" className="hover:text-primary transition-colors flex items-center gap-3 bg-teal-900/50 w-fit px-4 py-2 rounded-lg border border-teal-800/50"><Phone className="w-4 h-4 text-primary" /> +91 7783856140</a>
              <a href="mailto:support@healthlab.com" className="hover:text-primary transition-colors flex items-center gap-3 bg-teal-900/50 w-fit px-4 py-2 rounded-lg border border-teal-800/50"><Mail className="w-4 h-4 text-primary" /> support@healthlab.com</a>
            </div>
          </div>

          {/* Links: Compact columns */}
          <div className="md:col-span-7 lg:col-span-7 lg:col-start-6 grid grid-cols-2 sm:grid-cols-3 gap-8 xl:gap-12">
            {footerLinks.map((column, idx) => (
              <div key={idx} className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                  {column.title}
                </h4>
                <ul className="space-y-3">
                  {column.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link to={link.href} className="text-teal-200/70 hover:text-white hover:pl-1 text-[13px] font-bold transition-all flex items-center">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Slim and clean */}
        <div className="pt-6 mt-6 border-t border-teal-800/80 flex flex-col lg:flex-row items-center justify-between gap-6">

          <div className="flex flex-col sm:flex-row items-center gap-6">
             <p className="text-[12px] font-bold text-teal-200/60">
                &copy; {currentYear} HealthLab. Lucknow, UP.
             </p>
             <div className="flex gap-4">
                {socialLinks.map((social, idx) => (
                  <a key={idx} href={social.href} title={social.label} className={`w-8 h-8 rounded-full bg-teal-900 border border-teal-800 flex items-center justify-center ${social.color} hover:bg-white hover:scale-110 shadow-sm transition-all`}>
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
             </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4">
            {['ISO Certified', 'NABL Accredited'].map((tag) => (
              <span key={tag} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-teal-100 bg-teal-900/80 px-3 py-1.5 rounded-lg border border-teal-800/50">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                {tag}
              </span>
            ))}
            <span className="text-[11px] text-teal-200/60 font-bold ml-2 flex items-center justify-center gap-1.5 bg-teal-900/30 border border-teal-800/50 px-3 py-1 rounded-full">
               <span>Made with</span> <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse fill-rose-500/20" /> <span>for CU Project</span>
            </span>
          </div>
        </div>
      </div>
    </footer>  );
};

export default Footer;