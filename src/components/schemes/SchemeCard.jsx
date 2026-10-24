import React from 'react';
import { Link } from 'react-router-dom';
import { User, Users, Home, ArrowRight, Building, CheckCircle, ShieldCheck } from 'lucide-react';

export const SchemeCard = ({ scheme }) => {
  if (!scheme) return null;

  // Benefit unit badge styling
  const getUnitBadge = (unit) => {
    switch (unit) {
      case 'Individual':
        return {
          icon: User,
          textColor: 'text-emerald-700',
          desc: 'Individual Entitlement'
        };
      case 'Household':
        return {
          icon: Users,
          textColor: 'text-gov-blue',
          desc: 'Household Unit (One per family)'
        };
      case 'Dwelling / Facility':
        return {
          icon: Home,
          textColor: 'text-amber-700',
          desc: 'Dwelling / Physical Meter Unit'
        };
      default:
        return {
          icon: Building,
          textColor: 'text-slate-700',
          desc: unit
        };
    }
  };

  const unitConfig = getUnitBadge(scheme.benefitUnit);
  const UnitIcon = unitConfig.icon;

  return (
    <div className="bg-white rounded-2xl border border-gov-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group min-h-[360px]">
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
        <div>
          {/* Top Header: Department, Verification and Benefit Unit Badge */}
          <div className="flex items-start justify-between gap-2 mb-3.5">
            <span className="text-xs font-bold text-gov-muted uppercase tracking-wider flex items-center gap-2 flex-1 min-w-0">
              <Building className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="line-clamp-1">{scheme.department}</span>
            </span>

            <div className="flex items-center gap-2.5 shrink-0">
              {scheme.verificationStatus && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                    scheme.verificationStatus === 'Verified'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                  title={`Data status: ${scheme.verificationStatus}`}
                >
                  {scheme.verificationStatus === 'Verified' ? '✓ Verified' : 'Partly verified'}
                </span>
              )}
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 shrink-0"
                title={`Benefit awarded per: ${scheme.benefitUnit}`}
              >
                <UnitIcon className="w-3.5 h-3.5 stroke-[2.2] text-slate-900" />
                <span>{scheme.benefitUnit}</span>
              </span>
            </div>
          </div>

          {/* Scheme Title */}
          <h3 className="text-lg sm:text-xl font-extrabold text-primary-navy group-hover:text-gov-blue transition-colors line-clamp-2 leading-snug mb-3">
            {scheme.name}
          </h3>

          {/* Short Description */}
          <p className="text-sm sm:text-[15px] text-gov-text leading-relaxed line-clamp-3 mb-5">
            {scheme.shortDescription}
          </p>
        </div>

        {/* Eligibility Snapshot */}
        <div className="pt-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-gov-muted block mb-2">
            Primary Eligibility
          </span>
          <ul className="space-y-1.5 text-slate-700">
            {scheme.eligibilityCriteria?.slice(0, 2).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs sm:text-[13px] leading-snug font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-slate-50/90 border-t border-gov-border flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          {scheme.applicationStatus || 'Open for Applications'}
        </span>

        <div className="flex items-center gap-2.5">
          <Link
            to={`/schemes/${scheme.id}`}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-white border border-gov-border text-xs sm:text-sm font-bold text-gov-blue hover:bg-gov-blue hover:text-white transition-all shadow-xs"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to={`/apply?schemeId=${scheme.id}`}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-primary-navy text-xs sm:text-sm font-bold text-white hover:bg-gov-blue transition-all shadow-xs"
          >
            <span>Apply</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
