import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaDownload, FaTimes } from 'react-icons/fa';

interface ReportResultItem {
    id: number;
    parameterName: string;
    resultValue: string;
    unit: string;
    normalRange: string;
    isAbnormal: boolean;
    isCritical: boolean;
}

interface ReportResult {
    id: number;
    bookingId: number;
    submittedAt: string;
    results: ReportResultItem[];
    pdfUrl?: string;
    reportUrl?: string;
    fileUrl?: string;
}

interface ReportViewerModalProps {
    isOpen: boolean;
    reportId?: number;
    bookingId?: number;
    onClose: () => void;
    canVerify?: boolean;
    onVerify?: (reportId: number) => Promise<void> | void;
}

const ReportViewerModal: React.FC<ReportViewerModalProps> = ({ isOpen, reportId, bookingId, onClose, canVerify = false, onVerify }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<ReportResult | null>(null);

    useEffect(() => {
        const fetchReport = async () => {
            if (!isOpen || !bookingId) {
                setReport(null);
                setError(null);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`/api/reports/booking/${bookingId}`);
                const payload = (response.data?.data || response.data) as ReportResult;
                setReport(payload || null);
            } catch {
                setError('Failed to load report details.');
                setReport(null);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [isOpen, bookingId]);

    if (!isOpen) return null;

    const resolvedReportId = reportId ?? report?.id;
    const previewUrl = report?.pdfUrl || report?.reportUrl || report?.fileUrl || (resolvedReportId ? `/api/reports/${resolvedReportId}/pdf` : null);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b border-primary/10 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-black text-evergreen uppercase tracking-wide">Report Viewer</h2>
                        <p className="text-xs text-muted-gray mt-1">
                            Booking #{bookingId ?? 'N/A'} {resolvedReportId ? `• Report #${resolvedReportId}` : ''}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 w-10 rounded-lg border border-primary/15 flex items-center justify-center text-muted-gray hover:text-evergreen transition-all"
                        aria-label="Close report viewer"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading && (
                        <div className="text-sm font-semibold text-muted-gray">Loading report...</div>
                    )}

                    {!loading && error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {!loading && !error && report && (
                        <>
                            <section className="rounded-xl border border-primary/10 p-4">
                                <h3 className="text-sm font-black uppercase tracking-wide text-evergreen mb-3">Report Metadata</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                    <div>
                                        <p className="text-muted-gray">Report ID</p>
                                        <p className="font-semibold">{report.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-gray">Booking ID</p>
                                        <p className="font-semibold">{report.bookingId}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-gray">Submitted At</p>
                                        <p className="font-semibold">
                                            {report.submittedAt ? new Date(report.submittedAt).toLocaleString('en-IN') : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-xl border border-primary/10 p-4">
                                <h3 className="text-sm font-black uppercase tracking-wide text-evergreen mb-3">Result Summary</h3>
                                {report.results?.length ? (
                                    <div className="space-y-2">
                                        {report.results.map((item) => (
                                            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/10 p-3 text-sm">
                                                <div>
                                                    <p className="font-semibold text-evergreen">{item.parameterName}</p>
                                                    <p className="text-muted-gray text-xs">Normal: {item.normalRange || 'N/A'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">
                                                        {item.resultValue} {item.unit}
                                                    </p>
                                                    <p className={`text-xs ${item.isCritical ? 'text-red-600' : item.isAbnormal ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                        {item.isCritical ? 'Critical' : item.isAbnormal ? 'Abnormal' : 'Normal'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-gray">No result parameters available.</p>
                                )}
                            </section>

                            <section className="rounded-xl border border-primary/10 p-4">
                                <h3 className="text-sm font-black uppercase tracking-wide text-evergreen mb-3">PDF Preview</h3>
                                {previewUrl ? (
                                    <iframe
                                        title="Report PDF Preview"
                                        src={previewUrl}
                                        className="w-full h-[55vh] border border-primary/10 rounded-lg"
                                    />
                                ) : (
                                    <p className="text-sm text-muted-gray">PDF preview not available for this report.</p>
                                )}
                            </section>
                        </>
                    )}
                </div>

                <div className="border-t border-primary/10 px-6 py-4 flex items-center justify-end gap-3">
                    {canVerify && resolvedReportId && onVerify && (
                        <button
                            type="button"
                            onClick={() => onVerify(resolvedReportId)}
                            className="h-10 px-4 rounded-lg bg-emerald-600 text-white text-xs font-black uppercase tracking-widest"
                        >
                            Verify Report
                        </button>
                    )}
                    {resolvedReportId && (
                        <a
                            href={`/api/reports/${resolvedReportId}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="h-10 px-4 rounded-lg bg-primary text-white text-xs font-black uppercase tracking-widest flex items-center gap-2"
                        >
                            <FaDownload className="text-[10px]" />
                            <span>Download PDF</span>
                        </a>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 px-4 rounded-lg border border-primary/20 text-evergreen text-xs font-black uppercase tracking-widest"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportViewerModal;
