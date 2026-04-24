import React from 'react';
import { ReportData } from '../../types/clinicalReport';

export interface PatientDetails {
  name: string;
  age: number | string;
  gender: string;
  reportId: string;
  sampleCollectionDate: string;
  reportGenerationDate: string;
}

export interface VitalityScores {
  overall: number;
  liver: number;
  metabolism: number;
}

export interface TestResult {
  parameter: string;
  result: number | string;
  unit: string;
  refRange: string;
  status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
}

export interface MedicalReportProps {
  data?: ReportData;
  patient?: PatientDetails;
  scores?: VitalityScores;
  results?: TestResult[];
  doctorRemarks?: string;
  aiInsights?: string[];
  digitalFingerprint?: string;
  verifiedDoctorName?: string;
}

const defaultPatient: PatientDetails = {
  name: 'Amanjeet Kumar',
  age: 24,
  gender: 'Male',
  reportId: 'HL-2026-8842',
  sampleCollectionDate: '18 Apr 2026, 08:30 AM',
  reportGenerationDate: '18 Apr 2026, 09:45 PM',
};

const defaultScores: VitalityScores = {
  overall: 88,
  liver: 92,
  metabolism: 75,
};

const defaultResults: TestResult[] = [
  { parameter: 'Glucose (Fasting)', result: 92, unit: 'mg/dL', refRange: '70 - 100', status: 'NORMAL' },
  { parameter: 'Total Cholesterol', result: 210, unit: 'mg/dL', refRange: '< 200', status: 'ABNORMAL' },
  { parameter: 'HbA1c (Gold Standard)', result: 5.4, unit: '%', refRange: '4.0 - 5.6', status: 'NORMAL' },
];

const defaultRemarks = 'Patient exhibits stable clinical parameters. Mild elevation in total cholesterol observed; lifestyle adjustment recommended.';
const defaultInsights = [
  'Increase dietary fiber intake to manage cholesterol levels.',
  'Brisk walking for 30 minutes daily recommended.'
];

export default function MedicalReport({
  data,
  patient,
  scores,
  results,
  doctorRemarks,
  aiInsights,
  digitalFingerprint,
  verifiedDoctorName
}: MedicalReportProps) {
  const resolvedPatient: PatientDetails = data
    ? {
        name: data.patient.name,
        age: data.patient.age,
        gender: data.patient.gender,
        reportId: data.patient.reportId,
        sampleCollectionDate: data.patient.collectionDate,
        reportGenerationDate: data.patient.generationDate
      }
    : (patient || defaultPatient);

  const resolvedScores: VitalityScores = data
    ? {
        overall: data.scores.overall,
        liver: data.scores.liver,
        metabolism: data.scores.metabolism
      }
    : (scores || defaultScores);

  const resolvedResults: TestResult[] = data
    ? data.results.map((item) => ({
        parameter: item.parameter,
        result: item.result,
        unit: item.unit,
        refRange: item.refRange,
        status: item.status
      }))
    : (results || defaultResults);

  const resolvedRemarks = data ? data.remarks : (doctorRemarks || defaultRemarks);
  const resolvedInsights = data ? data.aiInsights : (aiInsights || defaultInsights);
  const resolvedFingerprint = digitalFingerprint || 'HMAC-SHA256: 8f3e2a9b1c7d4e5f0a6b9c8d7e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f';
  const resolvedDoctorName = (verifiedDoctorName || '').trim() || 'Medical Officer';

  const ageText = String(resolvedPatient.age ?? '').trim();
  const genderText = String(resolvedPatient.gender ?? '').trim();
  const ageGenderText = [ageText ? `${ageText} Years` : '', genderText].filter(Boolean).join(' / ');

  const handlePrint = () => {
    window.print();
  };

  const sanitizeParameter = (value: string) => String(value || '').replace(/[.。]+$/g, '').trim();
  const formatUnit = (value: string) => String(value || '').trim() || '-';

  return (
    <div className="bg-[#F0F9F9] py-10 print:p-0 print:bg-white min-h-screen font-sans text-slate-800">
      <div className="no-print fixed top-5 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={handlePrint}
          className="bg-[#007BFF] text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Print Test Report
        </button>
      </div>

      <div className="a4-container w-[210mm] min-h-[297mm] p-[12mm] mx-auto bg-white shadow-2xl print:shadow-none print:m-0 print:w-full">
        <header className="flex justify-between items-start border-b-4 border-[#007BFF] pb-4 mb-6">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-[#007BFF]/5 rounded-lg flex items-center justify-center p-2">
              <svg className="text-[#007BFF]" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#007BFF] tracking-tighter uppercase leading-none">HEALTHCARELAB</h1>
              <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-1">Advanced Diagnostic & Research Centre</p>
              <div className="flex gap-2 mt-2">
                <span className="text-[9px] px-2 py-0.5 bg-slate-100 rounded-full font-bold text-slate-700 border border-slate-200">NABL ACCREDITED (MC-1024)</span>
                <span className="text-[9px] px-2 py-0.5 bg-slate-100 rounded-full font-bold text-slate-700 border border-slate-200">ISO 15189 CERTIFIED</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#007BFF]/10 text-[#007BFF] rounded-full border border-[#007BFF]/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span className="text-[10px] font-black uppercase tracking-wider">Verified Smart Report</span>
            </div>
            <p className="text-[9px] text-slate-600 mt-2 font-semibold">Diagnostic Integrity v3.1</p>
          </div>
        </header>

        <section className="bg-slate-50 rounded-2xl p-6 border border-slate-200 grid grid-cols-3 gap-y-4 mb-6">
          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Patient Name</p>
            <p className="text-sm font-bold text-slate-900">{resolvedPatient.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Age / Gender</p>
            <p className="text-sm font-bold text-slate-900">{ageGenderText}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Report ID</p>
            <p className="text-sm font-bold text-[#007BFF]">{resolvedPatient.reportId}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Sample Collection</p>
            <p className="text-xs font-semibold text-slate-700">{resolvedPatient.sampleCollectionDate}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Report Generated</p>
            <p className="text-xs font-semibold text-slate-700">{resolvedPatient.reportGenerationDate}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Verification</p>
            <p className="text-[10px] font-black text-green-700 uppercase flex items-center justify-end gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Digital Seal Active
            </p>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-1 bg-gradient-to-br from-[#007BFF] to-[#004B87] rounded-2xl p-6 text-white text-center shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-90 mb-2">Overall Vitality</p>
              <div className="relative inline-flex items-center justify-center p-2 mb-2">
                <svg className="w-20 h-20 -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="transparent" />
                  <circle cx="40" cy="40" r="36" stroke="white" strokeWidth="8" fill="transparent" strokeDasharray="226" strokeDashoffset={226 - (226 * resolvedScores.overall) / 100} strokeLinecap="round" />
                </svg>
                <span className="absolute text-xl font-black">{resolvedScores.overall}%</span>
              </div>
              <p className="text-[10px] font-semibold opacity-90">{resolvedScores.overall >= 80 ? 'EXCELLENT RANGE' : resolvedScores.overall >= 50 ? 'GOOD RANGE' : 'MONITORING'}</p>
            </div>
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Liver Health</p>
                <p className="text-2xl font-black text-slate-900">{resolvedScores.liver}%</p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-[#14B8A6]/30 border-t-[#14B8A6] flex items-center justify-center">
                <svg className="text-[#14B8A6]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Metabolism</p>
                <p className="text-2xl font-black text-slate-900">{resolvedScores.metabolism}%</p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-amber-500/30 border-t-amber-500 flex items-center justify-center">
                <svg className="text-amber-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 flex-grow">
          <table className="w-full border-collapse border border-slate-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-tl-xl">Parameter</th>
                <th className="text-center py-3 px-4 text-[10px] font-black uppercase tracking-widest">Result</th>
                <th className="text-center py-3 px-4 text-[10px] font-black uppercase tracking-widest">Unit</th>
                <th className="text-center py-3 px-4 text-[10px] font-black uppercase tracking-widest">Ref. Range</th>
                <th className="text-right py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-tr-xl">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {resolvedResults.map((item, index) => (
                <tr key={index} className={`border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                  <td className="py-3 px-4 font-bold text-slate-800">{sanitizeParameter(item.parameter)}</td>
                  <td className={`py-3 px-4 text-center font-black ${item.status === 'ABNORMAL' || item.status === 'CRITICAL' ? 'text-rose-700' : 'text-slate-900'}`}>{item.result}</td>
                  <td className="py-3 px-4 text-center text-slate-700 font-medium">{formatUnit(item.unit)}</td>
                  <td className="py-3 px-4 text-center text-slate-700 font-mono text-[11px]">{item.refRange}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                      item.status === 'NORMAL' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-5">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Medical Officer Remarks
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed italic">{resolvedRemarks}</p>
          </div>
          <div className="bg-[#14B8A6]/5 border border-[#14B8A6]/25 rounded-2xl p-5">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              AI Wellness Insights
            </h3>
            <ul className="space-y-1 text-xs text-slate-700">
              {resolvedInsights.map((insight, idx) => (
                <li key={idx} className="flex gap-2"><span>•</span> {insight}</li>
              ))}
            </ul>
          </div>
        </section>

        <footer className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-3 items-end">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Digital Fingerprint</p>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <code className="text-[7px] text-[#007BFF] break-all font-mono">{resolvedFingerprint}</code>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-2 border border-slate-200 rounded-xl shadow-sm mb-2">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><line x1="7" y1="7" x2="7.01" y2="7"></line><line x1="17" y1="7" x2="17.01" y2="7"></line><line x1="17" y1="17" x2="17.01" y2="17"></line><line x1="7" y1="17" x2="7.01" y2="17"></line></svg>
            </div>
            <p className="text-[9px] font-bold text-slate-700 uppercase">Verify Online</p>
          </div>
          <div className="text-right">
            <div className="inline-block border-b border-slate-300 w-32 h-10 italic text-slate-400 text-xs">Digital Signature</div>
            <p className="text-[10px] font-bold text-slate-900 mt-2">{resolvedDoctorName}</p>
            <p className="text-[8px] font-black text-slate-600 uppercase">Consultant Pathologist</p>
          </div>
        </footer>

        <div className="mt-8 flex justify-between items-center text-[8px] text-slate-500 font-bold uppercase tracking-[0.3em]">
          <span>ISO 15189 CERTIFIED</span>
          <span>ICMR APPROVED</span>
          <span>NABL ACCREDITED</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
          .no-print { display: none !important; }
          .a4-container {
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
          }
          @page { size: A4 portrait; margin: 0; }
        }
      `}} />
    </div>
  );
}
