import React from 'react';
import { FolderSearch, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No records found',
  description = 'There are no items to display matching the selected criteria.',
  actionLabel,
  actionLink,
  onActionClick
}) => {
  return (
    <div className="bg-white border border-dashed border-gov-border rounded-xl p-8 sm:p-12 text-center max-w-lg mx-auto my-6 shadow-xs">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-gov-muted flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-slate-500" />
      </div>
      <h3 className="text-base font-bold text-gov-text mb-1">{title}</h3>
      <p className="text-xs text-gov-muted max-w-sm mx-auto leading-relaxed mb-5">
        {description}
      </p>

      {(actionLabel || actionLink) && (
        <div>
          {actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-gov-blue text-white text-xs font-semibold hover:bg-gov-blue-dark transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onActionClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-gov-blue text-white text-xs font-semibold hover:bg-gov-blue-dark transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
