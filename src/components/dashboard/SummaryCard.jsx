import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const SummaryCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  badge,
  badgeColor = 'bg-blue-100 text-blue-800',
  linkTo,
  linkText = 'View details'
}) => {
  return (
    <div className="bg-white rounded-xl border border-gov-border p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gov-muted uppercase tracking-wider">
            {title}
          </span>
          {Icon && (
            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-gov-border flex items-center justify-center text-gov-blue">
              <Icon className="w-5 h-5 stroke-[1.8]" />
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-extrabold text-primary-navy tracking-tight">
            {value}
          </span>
        </div>

        {/* Space occupied by subtext preserved without displaying text content */}
        <div className="h-4" aria-hidden="true" />
      </div>

      {linkTo && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <Link
            to={linkTo}
            className="text-xs font-semibold text-gov-blue hover:text-primary-navy transition-colors inline-flex items-center gap-1 group"
          >
            <span>{linkText}</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      )}
    </div>
  );
};
