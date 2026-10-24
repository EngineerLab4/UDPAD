import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

export const SchemeFilters = ({
  searchQuery,
  onSearchChange,
  selectedUnit,
  onUnitChange,
  selectedCategory,
  onCategoryChange,
  categories = [],
  units = ['All', 'Individual', 'Household', 'Dwelling / Facility'],
  onReset
}) => {
  return (
    <div className="bg-white rounded-xl border border-gov-border p-4 sm:p-5 shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search schemes by name, keyword, or department..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-gov-border rounded-lg text-gov-text placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-blue focus:bg-white transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Benefit Unit Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gov-muted whitespace-nowrap">
              Benefit Unit:
            </span>
            <select
              value={selectedUnit}
              onChange={(e) => onUnitChange(e.target.value)}
              className="text-xs py-2 px-3 bg-white border border-gov-border rounded-lg text-gov-text font-medium focus:outline-none focus:ring-2 focus:ring-gov-blue"
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gov-muted whitespace-nowrap">
              Category:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="text-xs py-2 px-3 bg-white border border-gov-border rounded-lg text-gov-text font-medium focus:outline-none focus:ring-2 focus:ring-gov-blue max-w-[180px]"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(searchQuery || selectedUnit !== 'All' || selectedCategory !== 'All') && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-gov-muted hover:text-gov-text hover:bg-slate-100 rounded-lg transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
