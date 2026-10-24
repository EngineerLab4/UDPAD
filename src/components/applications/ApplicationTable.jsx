import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../common/StatusBadge';
import { ArrowRight, AlertTriangle, Eye, Calendar, FileText } from 'lucide-react';

export const ApplicationTable = ({ applications = [], onViewDetails }) => {
  if (!applications || applications.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gov-border shadow-xs overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-gov-border text-gov-muted uppercase text-[11px] font-bold tracking-wider">
              <th className="py-3.5 px-4">Application Ref</th>
              <th className="py-3.5 px-4">Scheme Details</th>
              <th className="py-3.5 px-4">Benefit Unit</th>
              <th className="py-3.5 px-4">Applied Date</th>
              <th className="py-3.5 px-4">Current Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                {/* Application Ref */}
                <td className="py-4 px-4 font-mono font-bold text-primary-navy whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span>{app.id}</span>
                    {app.hasActiveAlert && (
                      <span title="Action required: Verification Alert active">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 fill-amber-100" />
                      </span>
                    )}
                  </div>
                </td>

                {/* Scheme & Beneficiary */}
                <td className="py-4 px-4 max-w-xs">
                  <div className="font-semibold text-gov-text text-xs leading-snug">
                    {app.schemeName}
                  </div>
                  <div className="text-[11px] text-gov-muted mt-0.5">
                    Beneficiary: <span className="font-medium text-slate-700">{app.targetBeneficiaryName}</span>
                  </div>
                </td>

                {/* Benefit Unit */}
                <td className="py-4 px-4 whitespace-nowrap">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                    {app.benefitUnit}
                  </span>
                </td>

                {/* Applied Date */}
                <td className="py-4 px-4 text-gov-muted whitespace-nowrap">
                  {app.appliedDate}
                </td>

                {/* Status */}
                <td className="py-4 px-4 whitespace-nowrap">
                  <StatusBadge status={app.status} />
                </td>

                {/* Actions */}
                <td className="py-4 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewDetails && onViewDetails(app)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-gov-text font-medium text-xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Timeline</span>
                    </button>
                    <Link
                      to={`/applications/${app.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#123B66] hover:bg-gov-blue text-white font-medium text-xs transition-colors shadow-xs"
                    >
                      <span>Full View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-100">
        {applications.map((app) => (
          <div key={app.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-primary-navy flex items-center gap-1">
                {app.id}
                {app.hasActiveAlert && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
              </span>
              <StatusBadge status={app.status} />
            </div>

            <div>
              <h4 className="text-sm font-bold text-gov-text leading-snug">
                {app.schemeName}
              </h4>
              <p className="text-xs text-gov-muted mt-1">
                Beneficiary: <span className="font-medium text-slate-800">{app.targetBeneficiaryName}</span> ({app.benefitUnit} Unit)
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-gov-muted pt-1">
              <span>Applied: {app.appliedDate}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewDetails && onViewDetails(app)}
                  className="px-2.5 py-1 rounded bg-slate-100 text-gov-text font-medium text-xs"
                >
                  Timeline
                </button>
                <Link
                  to={`/applications/${app.id}`}
                  className="px-3 py-1 rounded bg-[#123B66] text-white font-medium text-xs flex items-center gap-1"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
