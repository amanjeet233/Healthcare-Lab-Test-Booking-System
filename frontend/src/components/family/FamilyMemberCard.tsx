import React from 'react';
import { User, Trash2, Calendar, Mail, Phone, HeartPulse, ShieldCheck, Pencil } from 'lucide-react';
import type { FamilyMemberResponse } from '../../services/familyMemberService';

interface FamilyMemberCardProps {
  member: FamilyMemberResponse;
  onDelete: (id: number) => void;
  onEdit: (member: FamilyMemberResponse) => void;
  isDeleting?: boolean;
}

const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({
  member,
  onDelete,
  onEdit,
  isDeleting = false
}) => {
  const age = new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear();

  return (
    <div className="relative group overflow-hidden bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl p-4 transition-all duration-500 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/10">
      {/* Tactical Glow */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-start gap-3.5">
          {/* Avatar Area */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-tr from-cyan-600 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-500">
              <User size={20} strokeWidth={2.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-cyan-50 shadow-sm">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black text-slate-800 tracking-tight truncate">{member.name}</h3>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black text-cyan-600/70 uppercase tracking-widest">{member.relation} Node</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/60 border border-white rounded-lg text-slate-600">
                <Calendar className="w-3 h-3 text-cyan-500" />
                <span className="text-[10px] font-black">{age} Y</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/60 border border-white rounded-lg text-slate-600">
                <User className="w-3 h-3 text-cyan-500" />
                <span className="text-[10px] font-black uppercase tracking-tighter">{member.gender}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(member)}
            className="p-2.5 text-slate-300 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all border border-transparent hover:border-cyan-100"
            title="Edit Member"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(member.id)}
            disabled={isDeleting}
            className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
            title="Decommission Node"
          >
            <Trash2 size={16} className={isDeleting ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {member.phoneNumber && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50/50 border border-slate-100/50 rounded-xl group/link transition-colors hover:bg-white">
            <Phone className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-cyan-500" />
            <span className="text-xs font-bold text-slate-600">{member.phoneNumber}</span>
          </div>
        )}

        {member.medicalHistory && (
          <div className="p-3 bg-cyan-50/30 border border-cyan-100/50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <HeartPulse className="w-3 h-3 text-cyan-600" />
              <span className="text-[10px] font-black text-cyan-900/60 uppercase tracking-widest">Medical Logs</span>
            </div>
            <p className="text-xs font-bold text-slate-600 line-clamp-2 leading-relaxed">
              {member.medicalHistory}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyMemberCard;
