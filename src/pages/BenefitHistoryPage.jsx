import React, { useState, useMemo } from 'react';
import {
  Award,
  Filter,
  User,
  Users,
  Home,
  Calendar,
  Building,
  CheckCircle2,
  FileText,
  Search
} from 'lucide-react';
import { mockDataService } from '../services/mockDataService';
import { CitizenHeader } from '../components/layout/CitizenHeader';
import { TopGovBar } from '../components/layout/TopGovBar';
import { Footer } from '../components/layout/Footer';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';

export const BenefitHistoryPage = () => {
  const allBenefits = mockDataService.getBenefits();
  const [filterUnit, setFilterUnit] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBenefits = useMemo(() => {
    return allBenefits.filter((item) => {
      if (filterUnit !== 'All' && item.benefitUnit !== filterUnit) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.benefitName.toLowerCase().includes(q);
        const matchesBeneficiary = item.beneficiaryName.toLowerCase().includes(q);
        const matchesScheme = item.schemeName.toLowerCase().includes(q);
        const matchesRef = item.sourceRecordRef.toLowerCase().includes(q);
        if (!matchesName && !matchesBeneficiary && !matchesScheme && !matchesRef) return false;
      }
      return true;
    });
  }, [allBenefits, filterUnit, searchQuery]);

  const getUnitIcon = (unit) => {
    if (unit === 'Individual') return User;
    if (unit === 'Household') return Users;
    return Home;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <TopGovBar />
      <CitizenHeader />

      <PageHeader
        title="Benefit History & Entitlements Ledger"
        subtitle="Consolidated record of historical welfare grants, educational stipends and facility subsidies recorded under your citizen and household lineage."
        breadcrumbs={[{ label: 'Benefit History' }]}
      />

      <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 space-y-6">

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-gov-border p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by benefit name, recipient, or reference..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-gov-border rounded-lg text-gov-text focus:outline-none focus:ring-2 focus:ring-gov-blue"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {['All', 'Individual', 'Household', 'Dwelling / Facility'].map((unit) => (
              <button
                key={unit}
                onClick={() => setFilterUnit(unit)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterUnit === unit
                    ? 'bg-[#123B66] text-white shadow-xs'
                    : 'bg-slate-100 text-gov-text hover:bg-slate-200'
                }`}
              >
                {unit === 'All' ? 'All Units' : `${unit} Level`}
              </button>
            ))}
          </div>
        </div>

        {/* Benefits Card Grid */}
        {filteredBenefits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBenefits.map((item) => {
              const UnitIcon = getUnitIcon(item.benefitUnit);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gov-border shadow-xs p-6 flex flex-col justify-between hover:shadow-sm transition-all"
                >
                  <div className="space-y-3">
                    {/* Header badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-950">
                        <UnitIcon className="w-3.5 h-3.5 text-slate-900" />
                        <span>Unit: {item.benefitUnit}</span>
                      </span>

                      <span className="text-[11px] font-mono text-gov-muted">
                        {item.awardDate}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-primary-navy leading-snug">
                      {item.benefitName}
                    </h3>

                    <p className="text-xs text-gov-muted">
                      Scheme: <span className="font-medium text-slate-700">{item.schemeName}</span>
                    </p>

                    <div className="bg-slate-50 p-3.5 rounded-lg border border-gov-border text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gov-muted text-[11px]">Beneficiary Name</span>
                        <span className="font-bold text-gov-text">{item.beneficiaryName}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gov-muted text-[11px]">Sanctioned Value</span>
                        <span className="font-extrabold text-emerald-800">{item.amountOrBenefit}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gov-muted text-[11px]">Source Reference</span>
                        <span className="font-mono text-slate-700">{item.sourceRecordRef}</span>
                      </div>

                      {item.disbursementAccount && (
                        <div className="flex items-center justify-between">
                          <span className="text-gov-muted text-[11px]">Account / Location</span>
                          <span className="font-medium text-slate-700 text-right">{item.disbursementAccount}</span>
                        </div>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-gov-muted bg-blue-50/40 p-2.5 rounded border border-blue-100 leading-relaxed">
                        <strong>UDPAD Note:</strong> {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {item.status}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{item.id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No benefit history recorded yet"
            description="You do not have any historical welfare benefits recorded under your account yet. When you submit applications and benefits are sanctioned, they will be cataloged in your ledger."
            actionLabel="Explore Schemes Directory"
            actionLink="/schemes"
          />
        )}
      </main>

      <Footer />
    </div>
  );
};
