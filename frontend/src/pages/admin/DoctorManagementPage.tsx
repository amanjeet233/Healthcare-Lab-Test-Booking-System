import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Clock, AlertCircle, Loader, Stethoscope, Search, XCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { doctorService } from '../../services/doctorService';
import { DoctorAssignmentForm } from '../../components/admin/DoctorAssignmentForm';
import { DoctorAvailabilityPanel } from '../../components/admin/DoctorAvailabilityPanel';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import SkeletonBlock from '../../components/common/SkeletonBlock';

interface Doctor {
  id: number;
  name: string;
  specialty?: string;
  email: string;
  phone?: string;
  isActive?: boolean;
}

interface DoctorTestAssignment {
  id: number;
  testId: number;
  testName: string;
  assignedDate: string;
}

export const DoctorManagementPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [assignments, setAssignments] = useState<DoctorTestAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showAvailabilityPanel, setShowAvailabilityPanel] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DoctorTestAssignment | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Load doctors from API
      const response = await adminService.getUsers({ role: 'DOCTOR' });
      setDoctors(response.users as unknown as Doctor[]);

      // Load assignments
      try {
        const assignmentsList = await adminService.getDoctorTestAssignments();
        setAssignments(assignmentsList as any);
      } catch {
        setAssignments([]);
      }
    } catch (err) {
      setError((err as any).message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAvailability = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowAvailabilityPanel(true);
  };

  const handleDeleteAssignment = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await adminService.removeTestAssignment(deleteConfirm.id);
      setAssignments(assignments.filter(a => a.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      setError((err as any).message || 'Failed to delete assignment');
    } finally {
      setDeleting(false);
    }
  };

  const handleAssignmentSuccess = () => {
    setShowAssignmentForm(false);
    loadData();
  };

  const getDoctorAssignments = (doctorId: number) => {
    return assignments.filter(a => a.doctorId === doctorId);
  };

  const filteredDoctors = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter((doctor) =>
      String(doctor.name || '').toLowerCase().includes(q) ||
      String(doctor.email || '').toLowerCase().includes(q) ||
      String(doctor.specialty || '').toLowerCase().includes(q)
    );
  }, [doctors, searchTerm]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <SkeletonBlock key={i} className="h-28 border border-white/30" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 bg-cyan-500/10 backdrop-blur-md rounded-xl border border-cyan-500/20 shadow-sm">
              <Stethoscope className="w-5 h-5 text-cyan-600" />
            </div>
            <span className="text-[clamp(0.62rem,0.58rem+0.16vw,0.72rem)] font-black uppercase tracking-[0.22em] text-cyan-800/60">
              DOCTOR / MANAGEMENT
            </span>
          </div>
          <h1 className="text-[clamp(1.7rem,1.2rem+1.7vw,2.7rem)] font-black text-text tracking-tight mb-2.5 uppercase">
            Doctor <span className="text-cyan-600">Management</span>
          </h1>
          <p className="text-[clamp(0.84rem,0.8rem+0.3vw,1rem)] text-cyan-900/60 font-medium leading-relaxed">
            Manage doctors, assign tests, and maintain availability windows.
          </p>
        </div>
        <GlassButton onClick={() => setShowAssignmentForm(true)} icon={<Plus className="w-4 h-4" />} className="h-full px-6 py-3.5">
          ASSIGN TEST
        </GlassButton>
      </header>

      <GlassCard className="border-cyan-100/30">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-65">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Search Doctor</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600/50" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or specialty"
                className="w-full bg-white/50 border border-white/50 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-500/5 rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium transition-all"
              />
            </div>
          </div>
          {searchTerm.trim() && (
            <div className="pt-6">
              <button
                onClick={() => setSearchTerm('')}
                className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                title="Clear Search"
              >
                <XCircle size={24} />
              </button>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Modals */}
      {showAssignmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <DoctorAssignmentForm
              doctors={doctors}
              onSuccess={handleAssignmentSuccess}
              onClose={() => setShowAssignmentForm(false)}
            />
          </div>
        </div>
      )}

      {showAvailabilityPanel && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <DoctorAvailabilityPanel
              doctorId={selectedDoctor.id}
              onSuccess={loadData}
              onClose={() => {
                setShowAvailabilityPanel(false);
                setSelectedDoctor(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmationModal
          isOpen={Boolean(deleteConfirm)}
          title="Remove Test Assignment"
          description={`Remove "${deleteConfirm.testName}" from this doctor?`}
          onConfirm={handleDeleteAssignment}
          onCancel={() => setDeleteConfirm(null)}
          confirmText={deleting ? 'Removing...' : 'Remove'}
          cancelText="Cancel"
          confirmColor="bg-danger hover:bg-red-700 focus:ring-danger"
        />
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Doctors List */}
      <div className="space-y-4">
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12 bg-white/70 rounded-lg border border-white/60">
            <p className="text-gray-600">No doctors found</p>
          </div>
        ) : (
          filteredDoctors.map(doctor => (
            <div
              key={doctor.id}
              className="bg-white/70 backdrop-blur-md rounded-lg p-6 border border-white/60 hover:shadow-md transition-shadow"
            >
              {/* Doctor Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                  {doctor.specialty && (
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>📧 {doctor.email}</span>
                    {doctor.phone && <span>📱 {doctor.phone}</span>}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditAvailability(doctor)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 border border-blue-200"
                  >
                    <Clock className="w-4 h-4" />
                    Availability
                  </button>
                </div>
              </div>

              {/* Doctor's Assigned Tests */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Assigned Tests</h4>

                {getDoctorAssignments(doctor.id).length === 0 ? (
                  <p className="text-sm text-gray-500">No tests assigned</p>
                ) : (
                  <div className="grid gap-2">
                    {getDoctorAssignments(doctor.id).map(assignment => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{assignment.testName}</p>
                          <p className="text-xs text-gray-500">
                            Assigned: {new Date(assignment.assignedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => setDeleteConfirm(assignment)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      {doctors.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50/80 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>{doctors.length}</strong> Doctor{doctors.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="bg-green-50/80 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-900">
              <strong>{doctors.filter(d => d.isActive !== false).length}</strong> Active
            </p>
          </div>
          <div className="bg-purple-50/80 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-900">
              <strong>{assignments.length}</strong> Test Assignment{assignments.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorManagementPage;
