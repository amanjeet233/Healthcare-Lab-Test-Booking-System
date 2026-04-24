import React from 'react';

const AuthInput = React.forwardRef<HTMLInputElement, any>(({ label, icon, error, ...props }, ref) => (
    <div className="group space-y-1">
        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.12em] mb-1 ml-1 block">{label}</label>
        <div className="relative">
            <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors text-xs pointer-events-none ${error ? 'text-red-400' : 'text-slate-500'}`}>
                {icon}
            </div>
            <input
                ref={ref}
                {...props}
                className={`w-full h-10 bg-white border ${error ? 'border-red-300' : 'border-slate-200'} focus:border-[#008080] focus:ring-2 ${error ? 'focus:ring-red-100' : 'focus:ring-[#008080]/10'} rounded-xl py-2 pl-10 pr-3 text-[12px] font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 placeholder:font-semibold placeholder:tracking-[0.06em]`}
            />
            {error && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                </div>
            )}
        </div>
        {error && <p className="text-[9px] text-red-500 font-semibold px-1 mt-0.5">{error.message}</p>}
    </div>
));

AuthInput.displayName = 'AuthInput';

export default AuthInput;
