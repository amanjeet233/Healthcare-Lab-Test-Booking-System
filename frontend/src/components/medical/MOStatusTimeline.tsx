import React from 'react';

type KnownStatus =
  | 'BOOKED'
  | 'SAMPLE_COLLECTED'
  | 'PROCESSING'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'REJECTED';

type MOStatusTimelineProps = {
  status?: string;
  bookingDate?: string;
  createdAt?: string;
  verificationDate?: string;
  rejectedAt?: string;
};

const ORDER: KnownStatus[] = [
  'BOOKED',
  'SAMPLE_COLLECTED',
  'PROCESSING',
  'PENDING_VERIFICATION',
  'VERIFIED',
];

const formatDateTime = (value?: string) => {
  if (!value) return 'Time unavailable';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

const normalizeStatus = (status?: string): KnownStatus => {
  const s = String(status || '').toUpperCase();
  if (s === 'REJECTED') return 'REJECTED';
  if ((ORDER as string[]).includes(s)) return s as KnownStatus;
  return 'BOOKED';
};

const MOStatusTimeline: React.FC<MOStatusTimelineProps> = ({ status, bookingDate, createdAt, verificationDate, rejectedAt }) => {
  const normalized = normalizeStatus(status);
  const activeIndex = normalized === 'REJECTED' ? 0 : Math.max(0, ORDER.indexOf(normalized));

  const whenFor = (step: KnownStatus) => {
    if (step === 'BOOKED') return createdAt || bookingDate;
    if (step === 'VERIFIED') return verificationDate;
    return undefined;
  };

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Status Timeline</p>
      <ol className="space-y-2">
        {ORDER.map((step, idx) => {
          const done = idx <= activeIndex && normalized !== 'REJECTED';
          return (
            <li key={step} className="flex items-start gap-2.5 text-xs">
              <span className={`mt-[2px] w-2.5 h-2.5 rounded-full ${done ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <div>
                <p className={`font-bold ${done ? 'text-slate-800' : 'text-slate-500'}`}>{step.replaceAll('_', ' ')}</p>
                <p className="text-[11px] text-slate-500">{formatDateTime(whenFor(step))}</p>
              </div>
            </li>
          );
        })}
        {normalized === 'REJECTED' && (
          <li className="flex items-start gap-2.5 text-xs">
            <span className="mt-[2px] w-2.5 h-2.5 rounded-full bg-red-500" />
            <div>
              <p className="font-bold text-red-700">REJECTED</p>
              <p className="text-[11px] text-slate-500">{formatDateTime(rejectedAt)}</p>
            </div>
          </li>
        )}
      </ol>
    </div>
  );
};

export default MOStatusTimeline;
