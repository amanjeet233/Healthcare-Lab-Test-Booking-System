import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, ArrowRight } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../hooks/useAuth';

const PrescriptionReportsCards: React.FC = () => {
  const navigate = useNavigate();
  const { openAuthModal } = useModal();
  const { isAuthenticated } = useAuth();

  const handleReports = () => {
    if (isAuthenticated) {
      navigate('/my-bookings');
    } else {
      openAuthModal('login');
    }
  };

  return (
    <div className="w-full px-4 md:px-6 py-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ── Left Card: Upload Prescription ─────────────────────── */}
        <div
          className="relative flex flex-col justify-between gap-3 p-4 md:p-5 rounded-2xl overflow-hidden min-h-[160px]"
          style={{
            background: 'linear-gradient(135deg, #006D77 0%, #2DD4BF 100%)',
            boxShadow: 'inset 0 0 60px rgba(255,255,255,0.08), 0 4px 24px rgba(0,109,119,0.25)',
          }}
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none translate-x-10 -translate-y-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none -translate-x-6 translate-y-6" />

          {/* Icon */}
          <div className="relative z-10 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Upload className="w-5 h-5 text-white" strokeWidth={2} />
          </div>

          {/* Text */}
          <div className="relative z-10 space-y-1 flex-1">
            <h3 className="text-base md:text-lg font-black text-white leading-tight tracking-tight">
              Upload Prescription & Order
            </h3>
            <p className="text-[12px] text-white/75 font-medium leading-snug max-w-[260px]">
              Our experts will find the right tests for you based on your prescription.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/tests')}
            className="relative z-10 self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-white text-white text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-[#006D77] transition-all duration-200 active:scale-95"
          >
            Upload Now
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
          </button>
        </div>

        {/* ── Right Card: View Reports ────────────────────────────── */}
        <div
          className="relative flex flex-col justify-between gap-3 p-4 md:p-5 rounded-2xl overflow-hidden min-h-[160px]"
          style={{
            background: 'linear-gradient(135deg, #C2410C 0%, #FDBA74 100%)',
            boxShadow: 'inset 0 0 60px rgba(255,255,255,0.08), 0 4px 24px rgba(194,65,12,0.25)',
          }}
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none translate-x-10 -translate-y-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none -translate-x-6 translate-y-6" />

          {/* Icon */}
          <div className="relative z-10 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <FileText className="w-5 h-5 text-white" strokeWidth={2} />
          </div>

          {/* Text */}
          <div className="relative z-10 space-y-1 flex-1">
            <h3 className="text-base md:text-lg font-black text-white leading-tight tracking-tight">
              View Your Test Reports
            </h3>
            <p className="text-[12px] text-white/75 font-medium leading-snug max-w-[260px]">
              Access all your past lab reports anytime, anywhere with one click.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={handleReports}
            className="relative z-10 self-start inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-white text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-[#C2410C] transition-all duration-200 active:scale-95"
          >
            View Reports
            <ArrowRight className="w-3 h-3" strokeWidth={3} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default PrescriptionReportsCards;
