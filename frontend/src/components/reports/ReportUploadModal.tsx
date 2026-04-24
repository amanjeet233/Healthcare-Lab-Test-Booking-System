import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { notify } from '../../utils/toast';

interface ReportUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => Promise<void> | void;
    initialBookingId?: number;
}

const ReportUploadModal: React.FC<ReportUploadModalProps> = ({ isOpen, onClose, onSuccess, initialBookingId }) => {
    const [bookingId, setBookingId] = useState('');
    const [notes, setNotes] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && initialBookingId) {
            setBookingId(initialBookingId.toString());
        }
    }, [isOpen, initialBookingId]);

    if (!isOpen) return null;

    const resetForm = () => {
        setBookingId('');
        setNotes('');
        setFile(null);
        setProgress(0);
        setError(null);
        setIsUploading(false);
    };

    const handleClose = () => {
        if (isUploading) return;
        resetForm();
        onClose();
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!bookingId.trim()) {
            setError('Booking ID is required.');
            return;
        }

        if (!file) {
            setError('Please select a report file.');
            return;
        }

        const parsedBookingId = Number(bookingId);
        if (Number.isNaN(parsedBookingId) || parsedBookingId <= 0) {
            setError('Booking ID must be a valid positive number.');
            return;
        }

        setError(null);
        setIsUploading(true);
        setProgress(0);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bookingId', parsedBookingId.toString());
            formData.append('notes', notes.trim());

            await axios.post('/api/reports/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                onUploadProgress: (progressEvent) => {
                    const total = progressEvent.total || 0;
                    if (total > 0) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
                        setProgress(percentCompleted);
                    }
                }
            });

            notify.success('Report uploaded successfully.');
            await onSuccess();
            handleClose();
        } catch {
            setError('Failed to upload report. Please verify booking ID and try again.');
            notify.error('Report upload failed.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={handleClose} />

            <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-primary/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black text-evergreen uppercase tracking-wide">Upload Diagnostic Report</h2>
                        <p className="text-xs text-muted-gray mt-1">Technician upload portal</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isUploading}
                        className="h-10 w-10 rounded-lg border border-primary/15 flex items-center justify-center text-muted-gray hover:text-evergreen transition-all disabled:opacity-50"
                        aria-label="Close report upload modal"
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label htmlFor="bookingId" className="block text-xs font-black uppercase tracking-widest text-evergreen mb-2">
                            Booking ID
                        </label>
                        <input
                            id="bookingId"
                            type="number"
                            min={1}
                            value={bookingId}
                            onChange={(e) => setBookingId(e.target.value)}
                            className="w-full h-11 px-4 rounded-xl border border-primary/15 bg-white text-sm outline-none focus:border-primary/40"
                            placeholder="Enter booking ID"
                            disabled={isUploading}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="reportFile" className="block text-xs font-black uppercase tracking-widest text-evergreen mb-2">
                            Report File
                        </label>
                        <input
                            id="reportFile"
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="w-full text-sm"
                            disabled={isUploading}
                            required
                        />
                        <p className="text-[11px] text-muted-gray mt-2">Allowed: PDF, PNG, JPG</p>
                    </div>

                    <div>
                        <label htmlFor="notes" className="block text-xs font-black uppercase tracking-widest text-evergreen mb-2">
                            Notes
                        </label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full min-h-24 px-4 py-3 rounded-xl border border-primary/15 bg-white text-sm outline-none focus:border-primary/40"
                            placeholder="Add technician notes..."
                            disabled={isUploading}
                        />
                    </div>

                    {isUploading && (
                        <div>
                            <div className="flex items-center justify-between text-xs font-semibold text-muted-gray mb-1">
                                <span>Uploading...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                                <div
                                    className="h-2 bg-primary transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isUploading}
                            className="h-10 px-4 rounded-lg border border-primary/20 text-evergreen text-xs font-black uppercase tracking-widest disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="h-10 px-4 rounded-lg bg-primary text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                        >
                            <FaUpload className="text-[10px]" />
                            <span>{isUploading ? 'Uploading...' : 'Upload Report'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportUploadModal;
