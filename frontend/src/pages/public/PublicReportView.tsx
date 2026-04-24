import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaFileDownload, FaLock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SmartReportViewer from '../../components/reports/SmartReportViewer';
import type { SmartAnalysis } from '../../services/smartReportService';

const PublicReportView: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<SmartAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            fetchPublicReport();
        }
    }, [token]);

    const fetchPublicReport = async () => {
        try {
            setIsLoading(true);
            const [pdfResp, analysisResp] = await Promise.all([
                api.get(`/api/reports/public/view/${token}`, { responseType: 'blob' }),
                api.get(`/api/reports/public/analysis/${token}`)
            ]);
            
            const url = window.URL.createObjectURL(new Blob([pdfResp.data], { type: 'application/pdf' }));
            setPdfUrl(url);
            setAnalysis(analysisResp.data?.data || null);
        } catch (err) {
            console.error('Error fetching public report:', err);
            setError('This sharing link has expired or is invalid. Please contact the patient for a new link.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600 font-medium">Authenticating & Loading Secure Report...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-red-500">
                    <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-500 text-left">
                        <p className="font-semibold mb-1">Security Note:</p>
                        Sharing links expire after 7 days to protect patient privacy (ISO 27001 Compliance).
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Professional Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#0D7C7C] to-[#004B87] rounded-lg flex items-center justify-center text-white shadow-md">
                        <FaLock size={18} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-tight">Secure Report Viewer</h1>
                        <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                            <FaCheckCircle size={10} />
                            Verified Official Diagnostic Record
                        </div>
                    </div>
                </div>
                
                <a 
                    href={pdfUrl || '#'} 
                    download="Medical_Report.pdf"
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D7C7C] text-white text-sm font-semibold rounded-lg hover:bg-[#0a6666] transition-all shadow-md active:scale-95"
                >
                    <FaFileDownload />
                    Download PDF
                </a>
            </header>

            {/* Viewport */}
            <main className="flex-1 p-4 md:p-8 flex flex-col lg:flex-row gap-8 max-w-[1400px] mx-auto w-full">
                {/* Digital Intelligence (Left on desktop) */}
                {analysis && (
                    <div className="lg:w-1/3 space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-[#0D7C7C] rounded-full" />
                                Smart Digital Summary
                            </h2>
                            <SmartReportViewer analysis={analysis} />
                        </div>
                        
                        <div className="bg-[#EBF5F5] rounded-xl p-6 border border-[#B2D8D8]/30">
                            <h3 className="text-sm font-black text-[#0D7C7C] uppercase tracking-widest mb-2">Physician Note</h3>
                            <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                This digital analysis is generated from validated laboratory data. Please refer to the official signed PDF (on the right/below) for final clinical decisions and legal verification.
                            </p>
                        </div>
                    </div>
                )}

                {/* PDF Viewer (Right on desktop) */}
                <div className={`flex-1 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 ${!analysis ? 'max-w-4xl mx-auto w-full' : ''}`} style={{ height: 'calc(100vh - 160px)' }}>
                    {pdfUrl && (
                        <iframe 
                            src={`${pdfUrl}#toolbar=0&navpanes=0`} 
                            className="w-full h-full border-none"
                            title="Medical Report PDF"
                        />
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-xs text-gray-400">
                &copy; 2026 HealthcareLab Diagnostics. All reports are digitally signed and NABL ISO 15189 verified.
            </footer>
        </div>
    );
};

export default PublicReportView;
