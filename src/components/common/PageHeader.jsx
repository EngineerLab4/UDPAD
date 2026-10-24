import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  badge
}) => {
  return (
    <div className="bg-white border-b border-gov-border py-6 mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center text-xs text-gov-muted mb-3" aria-label="Breadcrumb">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 hover:text-gov-blue transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-gov-muted" />
              <span>Dashboard</span>
            </Link>
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.label}>
                  <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400 shrink-0" />
                  {isLast || !crumb.path ? (
                    <span className="font-semibold text-gov-text" aria-current="page">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link to={crumb.path} className="hover:text-gov-blue transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}

        {/* Title and Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123B66] tracking-tight">
                {title}
              </h1>
              {badge && <div>{badge}</div>}
            </div>
            {subtitle && (
              <p className="mt-1 text-sm text-gov-muted max-w-3xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
