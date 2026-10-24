import React from 'react';
import { Users, MapPin, ShieldCheck } from 'lucide-react';

export const HouseholdCard = ({ household }) => {
  if (!household) return null;

  return (
    <div className="bg-white rounded-xl border border-gov-border shadow-xs overflow-hidden h-full flex flex-col">
      <div className="bg-[#123B66] text-white p-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-900">
              Household Unit
            </span>
            <span className="text-xs text-slate-200 font-mono">
              Ref: {household.householdId}
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            Family of {household.headOfHousehold}
          </h3>
        </div>
        <div className="text-right hidden sm:block">
          <span className="inline-flex items-center gap-1 text-xs text-emerald-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Registry Verified
          </span>
          <p className="text-[11px] text-slate-300">Last synced: {household.lastUpdated}</p>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs h-full">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 flex flex-col justify-center">
            <span className="text-gov-muted block mb-1">Primary Residence:</span>
            <div className="flex items-start gap-1.5 font-medium text-gov-text">
              <MapPin className="w-3.5 h-3.5 text-gov-blue shrink-0 mt-0.5" />
              <span>{household.address || 'Registered Primary Dwelling'}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 flex flex-col justify-center">
            <span className="text-gov-muted block mb-1">Income Category:</span>
            <div className="font-semibold text-gov-text">
              {household.incomeCategory}
              <span className="text-[11px] text-gov-muted block font-normal">(Annual: {household.annualHouseholdIncome})</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 flex flex-col justify-center">
            <span className="text-gov-muted block mb-1">Linked Members:</span>
            <div className="flex items-center gap-1.5 font-bold text-base text-primary-navy">
              <Users className="w-4 h-4 text-gov-blue" />
              <span>{household.members?.length || 0} Registered Members</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
