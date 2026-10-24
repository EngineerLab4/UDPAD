import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  CheckCircle2,
  Info,
  Clock,
  ArrowRight,
  FileText
} from 'lucide-react';
import { mockDataService } from '../services/mockDataService';
import { CitizenHeader } from '../components/layout/CitizenHeader';
import { TopGovBar } from '../components/layout/TopGovBar';
import { Footer } from '../components/layout/Footer';
import { PageHeader } from '../components/common/PageHeader';
import { VerificationAlertCard } from '../components/verification/VerificationAlertCard';
import { EmptyState } from '../components/common/EmptyState';

export const VerificationAlertsPage = () => {
  const alerts = mockDataService.getAlerts();
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredAlerts = alerts.filter((a) => {
    if (filterStatus === 'All') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <TopGovBar />
      <CitizenHeader />

      <PageHeader
        title="Verification Alerts & Review Status"
        subtitle="Transparent duplicate-claim detection workflow ensuring fair official review and citizen clarification rights."
        breadcrumbs={[{ label: 'Verification Alerts' }]}
        actions={
          <Link
            to="/corrections"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary-navy hover:bg-gov-blue text-white font-bold text-xs transition-colors shadow-xs"
          >
            <Scale className="w-4 h-4" />
            <span>Manage Corrections & Appeals</span>
          </Link>
        }
      />

      <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 space-y-6">

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gov-border shadow-xs">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {['All', 'Under Official Review', 'Information Required', 'Resolved — Sample'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterStatus === status
                    ? 'bg-[#123B66] text-white shadow-xs'
                    : 'bg-slate-100 text-gov-text hover:bg-slate-200'
                }`}
              >
                {status === 'All' ? 'All Alerts' : status}
              </button>
            ))}
          </div>

          <span className="text-xs text-gov-muted font-medium">
            Showing {filteredAlerts.length} Active Notice{filteredAlerts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Alerts Cards List */}
        {filteredAlerts.length > 0 ? (
          <div>
            {filteredAlerts.map((alert) => (
              <VerificationAlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No verification alerts"
            description="There are currently no active duplicate-claim verification notices or clarification requests under your account. All records are clear."
            actionLabel="Explore Government Schemes"
            actionLink="/schemes"
          />
        )}
      </main>

      <Footer />
    </div>
  );
};
