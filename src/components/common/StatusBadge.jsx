import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  ShieldAlert,
  XCircle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const StatusBadge = ({ status, className = '' }) => {
  const normalized = status ? status.trim() : 'Draft';

  let config = {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
    icon: Clock
  };

  switch (normalized) {
    case 'Draft':
      config = {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-300',
        icon: Clock
      };
      break;

    case 'Submitted — Demo':
    case 'Submitted':
      config = {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-300',
        icon: Clock
      };
      break;

    case 'Under Verification':
      config = {
        bg: 'bg-sky-50',
        text: 'text-sky-800',
        border: 'border-sky-300',
        icon: Clock
      };
      break;

    case 'Additional Information Required':
    case 'Information Required':
      config = {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
        icon: FileQuestion
      };
      break;

    case 'Flagged for Official Review':
    case 'Potential Overlap Detected':
    case 'Under Official Review':
      config = {
        bg: 'bg-orange-50',
        text: 'text-orange-900',
        border: 'border-orange-300',
        icon: ShieldAlert
      };
      break;

    case 'Approved — Sample':
    case 'Approved':
    case 'Sanctioned & Direct Transfer Initiated':
    case 'Active & Verified':
    case 'Active / Availed':
      config = {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        icon: CheckCircle2
      };
      break;

    case 'Rejected — Sample':
    case 'Rejected':
      config = {
        bg: 'bg-red-50',
        text: 'text-red-800',
        border: 'border-red-300',
        icon: XCircle
      };
      break;

    case 'Withdrawn':
      config = {
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        border: 'border-slate-300',
        icon: RotateCcw
      };
      break;

    case 'Under Review — Sample':
      config = {
        bg: 'bg-purple-50',
        text: 'text-purple-800',
        border: 'border-purple-300',
        icon: Clock
      };
      break;

    case 'Resolved — Sample':
    case 'Resolved':
      config = {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        icon: CheckCircle2
      };
      break;

    default:
      config = {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        icon: Clock
      };
  }

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
      <span>{normalized}</span>
    </span>
  );
};
