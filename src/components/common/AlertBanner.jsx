import React from 'react';
import { AlertTriangle, Info, CheckCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AlertBanner = ({
  type = 'warning',
  title,
  message,
  detail,
  actionText,
  actionLink,
  onActionClick,
  className = ''
}) => {
  const styles = {
    warning: {
      container: 'bg-amber-50/80 border-amber-300 text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      badge: 'bg-amber-100 text-amber-900 border-amber-300',
      button: 'bg-amber-700 hover:bg-amber-800 text-white'
    },
    neutralNotice: {
      container: 'bg-[#f4f7fb] border-[#174A7E]/30 text-[#123B66]',
      icon: ShieldAlert,
      iconColor: 'text-[#174A7E]',
      badge: 'bg-[#e8f0fe] text-[#174A7E] border-[#174A7E]/30',
      button: 'bg-[#174A7E] hover:bg-[#123B66] text-white'
    },
    info: {
      container: 'bg-blue-50/80 border-blue-200 text-blue-900',
      icon: Info,
      iconColor: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      button: 'bg-blue-700 hover:bg-blue-800 text-white'
    },
    success: {
      container: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      button: 'bg-emerald-700 hover:bg-emerald-800 text-white'
    }
  };

  const current = styles[type] || styles.warning;
  const Icon = current.icon;

  return (
    <div className={`border rounded-lg p-4 sm:p-5 ${current.container} shadow-xs ${className}`}>
      <div className="flex items-start gap-3.5">
        <div className="shrink-0 mt-0.5">
          <Icon className={`w-5 h-5 ${current.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-sm font-bold tracking-tight mb-1 flex items-center gap-2 flex-wrap">
              <span>{title}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded font-medium border ${current.badge}`}>
                Verification Notice
              </span>
            </h4>
          )}
          <p className="text-sm leading-relaxed font-normal">{message}</p>
          {detail && (
            <p className="text-xs mt-2 text-gov-muted leading-relaxed bg-white/70 p-2.5 rounded border border-gov-border/60">
              {detail}
            </p>
          )}

          {(actionText || actionLink) && (
            <div className="mt-3.5 flex items-center gap-3">
              {actionLink ? (
                <Link
                  to={actionLink}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-xs transition-colors ${current.button}`}
                >
                  <span>{actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <button
                  onClick={onActionClick}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-xs transition-colors ${current.button}`}
                >
                  <span>{actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
