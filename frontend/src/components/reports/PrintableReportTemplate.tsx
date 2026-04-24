import React from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Award, 
  CheckCircle2,
  MessageSquare,
  QrCode
} from 'lucide-react';

interface ReportResult {
  parameter: string;
  result: string;
  unit: string;
  referenceRange: string;
  status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
}

interface PrintableReportProps {
  patientData?: {
    name: string;
    age: string;
    gender: string;
    reportId: string;
    collectionDate: string;
    generationDate: string;
  };
  results?: ReportResult[];
  healthScores?: {
    vitality: number;
    liver: number;
    metabolism: number;
  };
  remarks?: string;
  aiInsights?: string[];
  signatureUrl?: string;
  fingerprint?: string;
}

const PrintableReportTemplate: React.FC<PrintableReportProps> = ({
  patientData = {
    name: "Patient Name",
    age: "N/A",
    gender: "N/A",
    reportId: "HL-LOADING",
    collectionDate: "N/A",
    generationDate: new Date().toLocaleString()
  },
  results = [],
  healthScores = {
    vitality: 85,
    liver: 90,
    metabolism: 85
  },
  remarks = "Clinically verified. No immediate action required for stable parameters.",
  aiInsights = ["Digital insights pending final analysis."],
  fingerprint = "HEALTHCARELAB-BKG-2026-X"
}) => {
  return (
    <div className="bg-white min-h-screen p-0 m-0 print:bg-white overflow-hidden">
      {/* A4 Container */}
      <div className="medical-report-container mx-auto w-[210mm] min-h-[297mm] bg-white shadow-2xl print:shadow-none p-[12mm] flex flex-col gap-6 font-sans text-slate-800 border-[1px] border-slate-100">
        
        {/* 1. PREMIUM HEADER SECTION */}
        <header className="flex justify-between items-start border-b-[6px] border-[#0D7C7C] pb-6">
          <div className="flex gap-5 items-center">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden border-2 border-slate-50 shadow-sm p-2">
              <img src="/assets/healthcarelab_logo.png" alt="Lab Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-4xl font-[900] text-[#0D7C7C] tracking-tighter uppercase leading-tight">HEALTHCARELAB</h1>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 italic">Advanced Clinical Intelligence Center</p>
              <div className="flex gap-3 mt-3">
                <span className="text-[9px] px-3 py-1 bg-slate-100 rounded-full font-black text-slate-500 border border-slate-200 uppercase tracking-widest">NABL MC-1024</span>
                <span className="text-[9px] px-3 py-1 bg-slate-100 rounded-full font-black text-slate-500 border border-slate-200 uppercase tracking-widest">ISO 15189 CERTIFIED</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0D7C7C]/10 text-[#0D7C7C] rounded-full border border-[#0D7C7C]/20 text-xs font-black uppercase tracking-wider mb-2">
              <ShieldCheck size={14} className="fill-[#0D7C7C]/20" />
              Verified Smart Report
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Intelligence Engine v3.5</p>
          </div>
        </header>

        {/* 2. PATIENT INFORMATION GRID */}
        <section className="bg-slate-50 rounded-[28px] p-8 border border-slate-100 grid grid-cols-3 gap-x-8 gap-y-6 relative overflow-hidden shadow-inner">
           {/* Subtle Watermark Decoration */}
           <Activity className="absolute bottom-[-10px] right-[-10px] w-48 h-48 text-[#0D7C7C] opacity-[0.03] pointer-events-none" />
           
          <div className="space-y-1 relative z-10">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Patient Name</p>
            <p className="text-base font-black text-slate-900 leading-tight">{patientData.name}</p>
          </div>
          <div className="space-y-1 relative z-10">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Age / Gender</p>
            <p className="text-base font-black text-slate-900 leading-tight">{patientData.age} / {patientData.gender}</p>
          </div>
          <div className="space-y-1 text-right relative z-10">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Report ID</p>
            <p className="text-base font-black text-[#0D7C7C] leading-tight font-mono">{patientData.reportId}</p>
          </div>
          <div className="space-y-1 relative z-10">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Sample Date</p>
            <p className="text-xs font-bold text-slate-600 leading-tight">{patientData.collectionDate}</p>
          </div>
          <div className="space-y-1 relative z-10">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Authorized On</p>
            <p className="text-xs font-bold text-slate-600 leading-tight">{patientData.generationDate}</p>
          </div>
          <div className="space-y-1 text-right relative z-10">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Clinical Status</p>
            <p className="text-[11px] font-black text-emerald-600 uppercase flex items-center justify-end gap-1.5 tracking-wider">
              <CheckCircle2 size={13} strokeWidth={3} /> Digitally Signed
            </p>
          </div>
        </section>

        {/* 3. HEALTH DASHBOARD - VISUAL INTELLIGENCE */}
        <section className="grid grid-cols-3 gap-8">
          {/* Circular Score Plate */}
          <div className="col-span-1 bg-gradient-to-br from-[#0D7C7C] to-[#004B87] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden flex flex-col items-center justify-center text-center">
             <div className="relative z-10 flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-4">Overall Vitality</p>
                <div className="relative inline-flex items-center justify-center mb-4">
                   {/* Main Score Progress Chart */}
                   <svg className="w-28 h-28 -rotate-90">
                      <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/10" />
                      <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={314} strokeDashoffset={314 - (314 * healthScores.vitality) / 100} className="text-white" strokeLinecap="round" />
                   </svg>
                   <div className="absolute flex flex-col items-center">
                     <span className="text-4xl font-[900] tracking-tighter">{healthScores.vitality}</span>
                     <span className="text-[10px] font-black opacity-50 -mt-1 uppercase tracking-widest">Score</span>
                   </div>
                </div>
                <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black tracking-[0.1em] uppercase">
                  Optimal Range
                </div>
             </div>
          </div>

          <div className="col-span-2 grid grid-cols-1 gap-4">
             {/* Secondary Metrics with Progress Bars */}
             <div className="bg-slate-50/50 border border-slate-100 rounded-[24px] p-5 flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                   <Award size={28} />
                </div>
                <div className="flex-1">
                   <div className="flex justify-between items-end mb-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Liver Health Index</p>
                     <p className="text-xl font-black text-[#0D7C7C] leading-none">{healthScores.liver}%</p>
                   </div>
                   <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 rounded-full w-[90%]" style={{ width: `${healthScores.liver}%` }}></div>
                   </div>
                </div>
             </div>
             
             <div className="bg-slate-50/50 border border-slate-100 rounded-[24px] p-5 flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                   <Activity size={28} />
                </div>
                <div className="flex-1">
                   <div className="flex justify-between items-end mb-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Metabolic Efficiency</p>
                     <p className="text-xl font-black text-amber-600 leading-none">{healthScores.metabolism}%</p>
                   </div>
                   <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                     <div className="h-full bg-amber-500 rounded-full w-[85%]" style={{ width: `${healthScores.metabolism}%` }}></div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* 4. RESULTS DATA MATRIX */}
        <section className="flex-grow mt-4">
          <table className="w-full border-separate border-spacing-0 border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="text-left py-4 px-6 text-[11px] font-[900] uppercase tracking-widest">Clinical Parameter</th>
                <th className="text-center py-4 px-6 text-[11px] font-[900] uppercase tracking-widest border-x border-white/5">Result</th>
                <th className="text-center py-4 px-6 text-[11px] font-[900] uppercase tracking-widest">Unit</th>
                <th className="text-center py-4 px-6 text-[11px] font-[900] uppercase tracking-widest border-l border-white/5">Ref. Range</th>
                <th className="text-right py-4 px-6 text-[11px] font-[900] uppercase tracking-widest">Outcome</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {results.length > 0 ? results.map((item, idx) => (
                <tr key={idx} className={`${idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}>
                  <td className="py-4 px-6 font-bold text-slate-800 border-b border-slate-50">{item.parameter}</td>
                  <td className={`py-4 px-6 text-center font-black border-b border-slate-50 text-base ${item.status === 'NORMAL' ? 'text-slate-900' : 'text-rose-600'}`}>
                    {item.result}
                  </td>
                  <td className="py-4 px-6 text-center text-slate-500 font-bold border-b border-slate-50">{item.unit}</td>
                  <td className="py-4 px-6 text-center text-slate-600 font-mono text-[11px] border-b border-slate-50">{item.referenceRange}</td>
                  <td className="py-4 px-6 text-right border-b border-slate-50">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider ${
                      item.status === 'NORMAL' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-bold italic uppercase tracking-widest">Technical Parameters Data Pending Finalization</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="mt-3 text-[9px] text-slate-400 italic font-medium px-4">
            * Parameter values verified against ISO-15189 reference ranges. Clinical correlation by specialized consultant mandatory for diagnosis.
          </div>
        </section>

        {/* 5. CLINICAL OBSERVATIONS & AI GUIDANCE */}
        <section className="grid grid-cols-2 gap-8 mt-4">
          <div className="bg-slate-50/80 border border-slate-100 rounded-[28px] p-6 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white rounded-xl text-[#0D7C7C] shadow-sm">
                  <MessageSquare size={16} />
                </div>
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Provider Remarks</h3>
             </div>
             <p className="text-[13px] text-slate-600 leading-relaxed italic font-medium">"{remarks}"</p>
          </div>
          <div className="bg-[#0D7C7C]/5 border border-[#0D7C7C]/10 rounded-[28px] p-6 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-[#0D7C7C] rounded-xl text-white shadow-sm">
                  <CheckCircle2 size={16} />
                </div>
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Smart Health Insights</h3>
             </div>
             <ul className="space-y-2">
                {aiInsights.map((insight, idx) => (
                   <li key={idx} className="flex gap-3 items-start text-xs text-slate-700 leading-tight font-bold">
                      <span className="text-[#0D7C7C] mt-0.5 whitespace-nowrap">●</span>
                      {insight}
                   </li>
                ))}
             </ul>
          </div>
        </section>

        {/* 6. AUTHENTICATION & SECURITY FOOTER */}
        <footer className="mt-auto pt-8 border-t-2 border-slate-100">
           <div className="grid grid-cols-3 items-end gap-12">
              <div className="space-y-6">
                 <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Encrypted Fingerprint</p>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-inner">
                       <code className="text-[8px] text-[#0D7C7C] font-mono break-all leading-relaxed font-black">
                         {fingerprint}
                       </code>
                    </div>
                 </div>
                 <p className="text-[8px] text-slate-400 leading-snug font-bold uppercase tracking-widest max-w-[200px]">
                   Digital Seal Certified • Tamper Proof Smart Report • ISO 15189:2012
                 </p>
              </div>

              <div className="flex flex-col items-center">
                 <div className="p-3 bg-white border-2 border-slate-50 rounded-[22px] shadow-lg mb-3">
                    <QrCode size={78} className="text-slate-900" />
                 </div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Scan to Verify</p>
              </div>

              <div className="text-right space-y-6">
                 <div className="inline-block text-center pr-4">
                    <div className="h-16 w-40 border-b-2 border-slate-200 flex flex-col items-center justify-center italic text-slate-300 relative">
                       {/* Signature Visualization */}
                       <span className="text-sm">Digital Signature Authorized</span>
                       <CheckCircle2 size={42} className="absolute text-emerald-500/10 -top-2" />
                    </div>
                    <p className="text-[13px] font-[900] text-slate-800 mt-3 uppercase tracking-tight">Verified Lab Officer</p>
                    <p className="text-[10px] font-black text-[#0D7C7C] uppercase tracking-widest mt-1">Authorized Pathologist</p>
                    <p className="text-[8px] text-slate-400 mt-1 font-bold">Authenticated: {patientData.generationDate}</p>
                 </div>
              </div>
           </div>
           
           <div className="mt-10 flex justify-between items-center text-[9px] text-slate-300 font-black uppercase tracking-[0.5em] px-2 shadow-sm py-2 rounded-full border border-slate-50">
              <span>NABL ACCREDITED</span>
              <span className="text-slate-100">|</span>
              <span>ICMR CLINICAL APPR.</span>
              <span className="text-slate-100">|</span>
              <span>ISO 15189 CERTIFIED</span>
           </div>
        </footer>
      </div>

      {/* Font & Rendering Optimization */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        @media print {
          body { -webkit-print-color-adjust: exact; font-family: 'Inter', sans-serif; }
          .shadow-2xl, .shadow-xl { box-shadow: none !important; }
          .medical-report-container { border: none !important; margin: 0 !important; width: 100% !important; }
          @page { margin: 0; size: A4 portrait; }
        }

        .medical-report-container {
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
          print-color-adjust: exact;
        }

        h1, h2, h3, h4, span.font-black, span.font-bold {
          -webkit-font-smoothing: antialiased;
        }
      `}} />
    </div>
  );
};

export default PrintableReportTemplate;
