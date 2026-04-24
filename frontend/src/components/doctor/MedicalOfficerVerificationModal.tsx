import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, XCircle, AlertTriangle, Phone, 
  FileEdit, ShieldCheck, Info, ArrowLeft, Send
} from 'lucide-react';
import { reportService } from '../../services/reportService';
import { doctorService } from '../../services/doctorService';
import { toast } from 'react-hot-toast';

interface VerificationModalProps {
  bookingId: number;
  testName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const MedicalOfficerVerificationModal: React.FC<VerificationModalProps> = ({ 
  bookingId, 
  testName, 
  onClose, 
  onSuccess 
}) => {
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sealApplied, setSealApplied] = useState(false);
  const [showPanicLog, setShowPanicLog] = useState(false);
  const [showAmendLog, setShowAmendLog] = useState(false);
  
  // Panic Log Form
  const [physicianName, setPhysicianName] = useState('');
  const [instructions, setInstructions] = useState('');
  
  // Amendment Form
  const [amendmentReason, setAmendmentReason] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  useEffect(() => {
    loadResults();
  }, [bookingId]);

  const loadResults = async () => {
    try {
      const data = await reportService.getReportResults(bookingId);
      setResults(data);
    } catch (error) {
      toast.error('Failed to load report results');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    const note = clinicalNotes.trim();
    if (note.length < 10) {
      toast.error('Clinical notes are required (minimum 10 characters)');
      return;
    }

    setIsSubmitting(true);
    try {
      await doctorService.verifyReport(bookingId, {
        clinicalNotes: note,
        digitalSignature: 'Digitally signed',
        approved: true,
        specialistType: 'GENERAL',
      });
      setSealApplied(true);
      toast.success('Clinical Sign-off Completed');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      toast.error('Verification failed');
      setSealApplied(false);
      setIsSubmitting(false);
    }
  };

  const handleLogPanic = async () => {
    if (!physicianName || !instructions) {
      toast.error('Please provide clinician details');
      return;
    }
    setIsSubmitting(true);
    try {
      // Fetch report ID from results if not already available
      // For now, using a placeholder logic or assuming results contains reportId
      const reportId = results?.reportId || results?.id; 
      await doctorService.logPanicAlert(reportId, physicianName, instructions);
      toast.success('Panic Alert Logged Successfully');
      setShowPanicLog(false);
    } catch (error) {
      toast.error('Failed to log alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmend = async () => {
    if (!amendmentReason) {
      toast.error('Amendment reason is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const reportId = results?.reportId || results?.id;
      await doctorService.amendReport(reportId, amendmentReason);
      toast.success('Report Amendment Initiated');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Amendment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-20 flex justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent animate-spin rounded-full" /></div>;

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Clinical Verification</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{testName} • ID: {bookingId}</p>
        </div>
        <div className="flex gap-3">
          {sealApplied && (
            <span className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-2xl text-[10px] font-black uppercase ring-1 ring-green-100">
              <CheckCircle2 size={14} /> Clinical Seal Applied
            </span>
          )}
          {results?.results?.some((r: any) => r.isCritical) && (
            <span className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase ring-1 ring-red-100">
              <AlertTriangle size={14} /> Panic Values Detected
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        
        {/* Verification Logic Toggles */}
        <AnimatePresence mode="wait">
          {showPanicLog ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-red-50 p-6 rounded-[2rem] border border-red-100 space-y-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 text-red-600 rounded-xl"><Phone size={18} /></div>
                <h4 className="font-black text-red-800 uppercase text-sm tracking-widest">ISO 15189 Panic Notification</h4>
              </div>
              <p className="text-xs text-red-700 font-medium">Regulatory requirement: Log direct communication with the primary care physician for critical values.</p>
              
              <div className="space-y-3">
                <input 
                  type="text" placeholder="Physician Name"
                  className="w-full bg-white px-4 py-3 rounded-xl border border-red-200 text-sm focus:ring-2 ring-red-500 outline-none"
                  value={physicianName} onChange={(e) => setPhysicianName(e.target.value)}
                />
                <textarea 
                  placeholder="Clinical Instructions Provided..."
                  className="w-full bg-white px-4 py-3 rounded-xl border border-red-200 text-sm h-24 focus:ring-2 ring-red-500 outline-none"
                  value={instructions} onChange={(e) => setInstructions(e.target.value)}
                />
                <div className="flex gap-2">
                  <button onClick={handleLogPanic} disabled={isSubmitting} className="flex-1 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700">Submit Log</button>
                  <button onClick={() => setShowPanicLog(false)} className="px-6 py-3 bg-white text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest border border-red-200">Cancel</button>
                </div>
              </div>
            </motion.div>
          ) : showAmendLog ? (
             <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 space-y-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><FileEdit size={18} /></div>
                <h4 className="font-black text-amber-800 uppercase text-sm tracking-widest">Official Report Amendment</h4>
              </div>
              <p className="text-xs text-amber-700 font-medium italic">Warning: This will invalidate the existing seal and create a new versioned record in the clinical history.</p>
              
              <div className="space-y-3">
                <textarea 
                  placeholder="Justification for amendment (e.g., Result update, Clinical correlation)..."
                  className="w-full bg-white px-4 py-3 rounded-xl border border-amber-200 text-sm h-32 focus:ring-2 ring-amber-500 outline-none"
                  value={amendmentReason} onChange={(e) => setAmendmentReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <button onClick={handleAmend} disabled={isSubmitting} className="flex-1 py-3 bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-700">Confirm Amendment</button>
                  <button onClick={() => setShowAmendLog(false)} className="px-6 py-3 bg-white text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest border border-amber-200">Cancel</button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Results Table */}
              <div className="bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Parameter</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Result</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results?.results?.map((res: any) => (
                      <tr key={res.id} className="border-b border-slate-100/50 hover:bg-white transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-700">{res.parameterName}</div>
                          {res.isCritical && <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">Critical Alert</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-sm font-black ${res.isCritical ? 'text-red-600' : res.isAbnormal ? 'text-amber-500' : 'text-blue-600'}`}>
                            {res.resultValue} <span className="text-[10px] opacity-60 font-medium">{res.unit}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right tabular-nums text-xs font-bold text-slate-400">
                          {res.normalRange}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Grid */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowPanicLog(true)}
                  className="flex flex-col items-center justify-center gap-3 p-6 bg-red-50 hover:bg-red-100 text-red-600 rounded-3xl border border-red-100 transition-all group"
                >
                  <Phone size={24} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Log Phone Alert</span>
                </button>
                <button 
                  onClick={() => setShowAmendLog(true)}
                  className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-3xl border border-slate-100 transition-all group"
                >
                  <FileEdit size={24} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Amend Results</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Clinical Notes (Required)
                </label>
                <textarea
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Enter clinical verification notes (min 10 characters)"
                  className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 text-sm h-24 focus:ring-2 ring-[#0D7C7C]/30 outline-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Footer */}
      {!showPanicLog && !showAmendLog && (
        <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
          <button 
            onClick={onClose}
            className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleVerify}
            disabled={isSubmitting || sealApplied}
            className="flex-1 py-4 bg-[#0D7C7C] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0a6666] shadow-lg shadow-[#0D7C7C]/20 flex items-center justify-center gap-2 group transition-all"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin rounded-full" />
            ) : (
              <>
                <ShieldCheck size={16} className="group-hover:scale-110 transition-transform" />
                Apply Clinical Seal & Notify Patient
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicalOfficerVerificationModal;
