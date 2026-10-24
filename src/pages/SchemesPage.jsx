import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockDataService } from '../services/mockDataService';
import { CitizenHeader } from '../components/layout/CitizenHeader';
import { PublicHeader } from '../components/layout/PublicHeader';
import { TopGovBar } from '../components/layout/TopGovBar';
import { Footer } from '../components/layout/Footer';
import { PageHeader } from '../components/common/PageHeader';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { SchemeFilters } from '../components/schemes/SchemeFilters';
import { EmptyState } from '../components/common/EmptyState';

export const SchemesPage = () => {
  const { isAuthenticated } = useAuth();
  const schemes = mockDataService.getSchemes();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || searchParams.get('search') || '');
  const [selectedUnit, setSelectedUnit] = useState(searchParams.get('unit') || 'All');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');

  // Sync if query param changes
  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('search');
    const u = searchParams.get('unit');
    const c = searchParams.get('category');
    if (q !== null) setSearchQuery(q);
    if (u !== null) setSelectedUnit(u);
    if (c !== null) setSelectedCategory(c);
  }, [searchParams]);

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(schemes.map((s) => s.category)));
  }, [schemes]);

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    return schemes.filter((scheme) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = scheme.name.toLowerCase().includes(query);
        const matchesDesc = scheme.shortDescription.toLowerCase().includes(query);
        const matchesDept = scheme.department.toLowerCase().includes(query);
        const matchesBeneficiary = scheme.intendedBeneficiary.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesDept && !matchesBeneficiary) {
          return false;
        }
      }

      // Benefit Unit
      if (selectedUnit !== 'All' && scheme.benefitUnit !== selectedUnit) {
        return false;
      }

      // Category
      if (selectedCategory !== 'All' && scheme.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [schemes, searchQuery, selectedUnit, selectedCategory]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedUnit('All');
    setSelectedCategory('All');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <TopGovBar />
      {isAuthenticated ? <CitizenHeader /> : <PublicHeader />}

      <PageHeader
        title="Government Schemes Directory"
        subtitle="Explore verified welfare schemes categorized by benefit units: Individual, Household and Dwelling/Facility."
        breadcrumbs={[{ label: 'Government Schemes' }]}
      />

      <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12 space-y-6">
        {/* Search & Filters */}
        <SchemeFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedUnit={selectedUnit}
          onUnitChange={setSelectedUnit}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          onReset={handleReset}
        />

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-gov-muted px-1">
          <span>
            Showing <strong>{filteredSchemes.length}</strong> of {schemes.length} schemes
          </span>
          {selectedUnit !== 'All' && (
            <span className="font-semibold text-primary-navy bg-white px-2.5 py-1 rounded border border-gov-border">
              Filtered by: {selectedUnit} Unit
            </span>
          )}
        </div>

        {/* Schemes Grid or Empty State */}
        {filteredSchemes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No matching schemes found"
            description="No government welfare schemes matched your search or selected filters. Try broadening your keywords or resetting filters."
            actionLabel="Reset All Filters"
            onActionClick={handleReset}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};
