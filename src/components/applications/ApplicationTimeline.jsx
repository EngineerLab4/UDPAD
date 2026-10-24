import React from 'react';
import { CheckCircle2, Clock, AlertCircle, CircleDot } from 'lucide-react';

export const ApplicationTimeline = ({ timeline = [] }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-gov-muted">
        No progress timeline recorded for this application.
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {timeline.map((item, index) => {
        const isCompleted = item.status === 'Completed';
        const isCurrent = item.status === 'Current';
        const isPending = item.status === 'Pending';

        return (
          <div key={index} className="relative group">
            {/* Timeline Marker Icon */}
            <div className="absolute -left-6 sm:-left-8 top-0.5 flex items-center justify-center">
              {isCompleted && (
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border-2 border-white shadow-xs">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
              {isCurrent && (
                <div className="w-6 h-6 rounded-full bg-blue-100 text-gov-blue flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                  <CircleDot className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
              {isPending && (
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-2 border-white">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Content Card */}
            <div
              className={`p-4 rounded-lg border text-xs ${
                isCurrent
                  ? 'bg-blue-50/60 border-blue-200 shadow-xs'
                  : 'bg-white border-gov-border'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                <span className="font-bold text-sm text-primary-navy">
                  {item.step}
                </span>
                <span className="text-[11px] font-mono text-gov-muted">
                  {item.date}
                </span>
              </div>

              {item.officer && (
                <div className="text-[11px] font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span>Handling Authority: {item.officer}</span>
                </div>
              )}

              <p className="text-gov-text leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
