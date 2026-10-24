import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, FileText, CheckCircle, Scale, Info, Building } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const VerificationAlertCard = ({ alert, onOpenClarification }) => {
  if (!alert) return null;

  return (
    <div className="bg-white rounded-xl border-2 border-amber-300 shadow-sm overflow-hidden mb-6">
      {/* Top Banner: Neutral Government Notice */}
      <div className="bg-[#FFFBEB] border-b border-amber-200 px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
            </span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Verification Review Notice • Ref: {alert.id}
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {alert.schemeName}
              </h3>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 hidden sm:inline">
              App: {alert.applicationId}
            </span>
            <StatusBadge status={alert.status} />
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Central Neutral Alert Message */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-gov-blue shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-primary-navy leading-relaxed">
                “{alert.neutralNotice}”
              </p>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                {alert.detailedExplanation}
              </p>
            </div>
          </div>
        </div>

        {/* Structured Case Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-lg border border-gov-border space-y-2.5">
            <div>
              <span className="text-[11px] font-bold uppercase text-gov-muted block">
                Benefit Unit Under Evaluation
              </span>
              <span className="font-semibold text-gov-text text-sm">
                {alert.benefitUnit} Unit
              </span>
              <span className="text-gov-muted block text-[11px]">
                (Criteria: Exactly one benefit per registered family/dwelling unit)
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase text-gov-muted block">
                Related Historical Record Reference
              </span>
              <span className="font-mono font-medium text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 inline-block mt-0.5">
                {alert.relatedRecordRef}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-gov-border space-y-2.5">
            <div>
              <span className="text-[11px] font-bold uppercase text-gov-muted block">
                Current Review Status & Reviewer
              </span>
              <span className="font-semibold text-gov-text block">
                {alert.status}
              </span>
              <span className="text-gov-muted text-[11px] block">
                Assigned Authority: {alert.officialReviewer}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase text-gov-muted block">
                Citizen Next Step
              </span>
              <span className="font-medium text-amber-900 block leading-snug">
                {alert.nextStep}
              </span>
            </div>
          </div>
        </div>

        {/* UDPAD Safeguard Callout */}
        <div className="p-3.5 bg-amber-50/50 rounded-lg border border-amber-200/60 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
          <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Citizen Rights Safeguard:</strong> {alert.coreGuidanceNote}
          </div>
        </div>

        {/* Action Button Area */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="text-xs text-gov-muted">
            Timeline: {alert.resolutionTimeline}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              to={`/applications/${alert.applicationId}`}
              className="w-full sm:w-auto px-4 py-2 rounded-md border border-gov-border text-xs font-semibold text-gov-text hover:bg-slate-50 transition-colors text-center"
            >
              View Application
            </Link>

            <Link
              to={`/corrections?alertId=${alert.id}&appId=${alert.applicationId}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-[#123B66] text-white text-xs font-bold hover:bg-gov-blue transition-colors shadow-xs"
            >
              <Scale className="w-4 h-4" />
              <span>Submit Clarification / Correction</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
