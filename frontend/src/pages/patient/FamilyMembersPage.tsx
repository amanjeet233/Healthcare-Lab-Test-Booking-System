import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { Users, Search, XCircle, HeartPulse, ChevronRight, X, ChevronLeft } from 'lucide-react';
import { familyMemberService, type FamilyMemberRequest, type FamilyMemberResponse } from '../../services/familyMemberService';
import FamilyMemberCard from '../../components/family/FamilyMemberCard';
import FamilyMemberForm from '../../components/family/FamilyMemberForm';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import SkeletonBlock from '../../components/common/SkeletonBlock';
import { notify } from '../../utils/toast';

const FamilyMembersPage: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<FamilyMemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShowingForm, setIsShowingForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingMember, setEditingMember] = useState<FamilyMemberResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const data = await familyMemberService.getFamilyMembers();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching family members:', error);
      notify.error('Failed to load family members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (data: FamilyMemberRequest) => {
    try {
      setIsSubmitting(true);
      const newMember = await familyMemberService.addFamilyMember(data);
      setMembers([...members, newMember]);
      setIsShowingForm(false);
      notify.success('Family member added successfully!');
    } catch (error: any) {
      console.error('Error adding family member:', error);
      notify.error(error.message || 'Failed to add family member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMember = async (data: FamilyMemberRequest) => {
    if (!editingMember) return;

    try {
      setIsSubmitting(true);
      const updatedMember = await familyMemberService.updateFamilyMember(editingMember.id, data);
      setMembers((prev) => prev.map((member) => (member.id === editingMember.id ? updatedMember : member)));
      setIsShowingForm(false);
      setEditingMember(null);
      notify.success('Family member updated successfully!');
    } catch (error: any) {
      console.error('Error updating family member:', error);
      notify.error(error.message || 'Failed to update family member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddMemberForm = () => {
    setEditingMember(null);
    setIsShowingForm(true);
  };

  const openEditMemberForm = (member: FamilyMemberResponse) => {
    setEditingMember(member);
    setIsShowingForm(true);
  };

  const handleDeleteMember = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this family member?')) return;

    try {
      setDeletingId(id);
      await familyMemberService.deleteFamilyMember(id);
      setMembers(members.filter(m => m.id !== id));
      notify.success('Family member deleted successfully');
    } catch (error: any) {
      console.error('Error deleting family member:', error);
      notify.error(error.message || 'Failed to delete family member');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMembers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return members;
    return members.filter((member) =>
      String(member.name || '').toLowerCase().includes(q) ||
      String(member.relation || '').toLowerCase().includes(q) ||
      String(member.phoneNumber || '').toLowerCase().includes(q)
    );
  }, [members, searchTerm]);

  const relationBreakdown = useMemo(() => {
    const childRelations = ['SON', 'DAUGHTER', 'CHILD'];
    const spouseRelations = ['SPOUSE', 'HUSBAND', 'WIFE'];
    const children = members.filter((m) => childRelations.includes(String(m.relation || '').toUpperCase())).length;
    const spouse = members.filter((m) => spouseRelations.includes(String(m.relation || '').toUpperCase())).length;
    return { children, spouse };
  }, [members]);

  if (isLoading) {
    return (
      <div className="max-w-[1200px] w-full mx-auto px-4 md:px-5 py-8 md:py-9 space-y-4">
        {[1, 2, 3].map((i) => (
          <SkeletonBlock key={i} className="h-24 border border-white/30" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 md:px-5 py-8 md:py-9">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1 px-4 py-1 rounded-full border border-[#b8cfdb] text-[#005f7b] text-[10px] font-black uppercase tracking-[0.16em] hover:bg-white/70"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <nav className="inline-flex items-center text-[11px] font-black uppercase tracking-[0.14em]">
              <span className="text-[#6f9fb3] cursor-pointer hover:text-[#5c8ea3]" onClick={() => navigate('/')}>Home</span>
              <ChevronRight className="w-3.5 h-3.5 mx-1 text-[#a8c0cb]" />
              <span className="text-[#005d79]">Family Members</span>
            </nav>
          </div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 bg-cyan-500/10 backdrop-blur-md rounded-xl border border-cyan-500/20 shadow-sm">
              <Users className="w-5 h-5 text-cyan-600" />
            </div>
            <span className="text-[clamp(0.62rem,0.58rem+0.16vw,0.72rem)] font-black uppercase tracking-[0.22em] text-cyan-800/60">
              FAMILY / HEALTH PROFILE
            </span>
          </div>
          <h1 className="text-[clamp(1.7rem,1.2rem+1.7vw,2.7rem)] font-black text-[#164E63] tracking-tight mb-2.5 uppercase">
            Family <span className="text-cyan-600">Members</span>
          </h1>
          <p className="text-[clamp(0.84rem,0.8rem+0.3vw,1rem)] text-cyan-900/60 font-medium leading-relaxed">
            Manage and track your household health profiles in one place.
          </p>
        </div>
        {!isShowingForm && (
          <GlassButton onClick={openAddMemberForm} className="h-full px-6 py-3.5" icon={<FaPlus />}>
            ADD MEMBER
          </GlassButton>
        )}
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
        <div className="bg-white/60 backdrop-blur-md rounded-xl border border-white/70 p-4 shadow-sm">
          <p className="text-2xl font-black text-[#164E63]">{members.length}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Total Members</p>
        </div>
        <div className="bg-white/60 backdrop-blur-md rounded-xl border border-white/70 p-4 shadow-sm">
          <p className="text-2xl font-black text-cyan-700">{relationBreakdown.children}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Children</p>
        </div>
        <div className="bg-white/60 backdrop-blur-md rounded-xl border border-white/70 p-4 shadow-sm">
          <p className="text-2xl font-black text-teal-700">{relationBreakdown.spouse}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Spouse</p>
        </div>
        <div className="bg-white/60 backdrop-blur-md rounded-xl border border-white/70 p-4 shadow-sm flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <HeartPulse className="w-4 h-4 text-cyan-600" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Records Ready</p>
            <p className="text-[11px] text-slate-500">Quick test booking for family</p>
          </div>
        </div>
      </div>

      <GlassCard className="mb-7 border-cyan-100/30">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[260px]">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Search Member</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600/50" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, relation, or phone"
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

      {/* Form Section */}
      {isShowingForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-4">
          <div
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-md"
            onClick={() => {
              setIsShowingForm(false);
              setEditingMember(null);
            }}
          />
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-[2rem] bg-white/96 border border-white/70 shadow-[0_28px_90px_rgba(15,23,42,0.20)] p-4 md:p-5">
            <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700/60 mb-1">Popup Form</p>
                <h2 className="text-[clamp(1.35rem,1rem+1vw,1.8rem)] font-black text-slate-900 tracking-tight">
                  {editingMember ? 'Edit Family Member' : 'Add Family Member'}
                </h2>
                <p className="text-sm text-slate-500">Configure family member details</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsShowingForm(false);
                  setEditingMember(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                aria-label="Close family member form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <FamilyMemberForm
              onSubmit={editingMember ? handleEditMember : handleAddMember}
              isSubmitting={isSubmitting}
              initialValues={editingMember ?? undefined}
              submitLabel={editingMember ? 'Update Member' : 'Add Family Member'}
              onCancel={() => {
                setIsShowingForm(false);
                setEditingMember(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Members Grid */}
      {members.length === 0 ? (
        <div className="text-center py-14 bg-white/60 rounded-lg border-2 border-dashed border-cyan-200">
          <h3 className="text-base font-600 text-gray-900 mb-2">No family members yet</h3>
          <p className="text-sm text-gray-600 mb-5">Add family members to manage their health records</p>
          <GlassButton
            onClick={openAddMemberForm}
            icon={<FaPlus />}
            className="inline-flex items-center gap-2 px-5 py-2.5"
          >
            ADD FIRST MEMBER
          </GlassButton>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-white/60 rounded-lg border border-white/60">
          <p className="text-sm font-semibold text-slate-600">No members match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          {filteredMembers.map(member => (
            <FamilyMemberCard
              key={member.id}
              member={member}
              onEdit={openEditMemberForm}
              onDelete={handleDeleteMember}
              isDeleting={deletingId === member.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FamilyMembersPage;
