import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Clock,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { mockDataService } from '../services/mockDataService';
import { api } from '../services/apiClient';
import { CitizenHeader } from '../components/layout/CitizenHeader';
import { TopGovBar } from '../components/layout/TopGovBar';
import { Footer } from '../components/layout/Footer';
import { PageHeader } from '../components/common/PageHeader';
import { ApplicationTable } from '../components/applications/ApplicationTable';
import { ApplicationTimeline } from '../components/applications/ApplicationTimeline';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

export const ApplicationsPage = () => {
  const [applications, setApplications] = useState(() => mockDataService.getApplications());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedAppModal, setSelectedAppModal] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchApplications = async () => {
      try {
        const res = await api.get('/applications');
        if (isMounted && res.ok && Array.isArray(res.data?.applications)) {
          setApplications(res.data.applications);
          mockDataService.setApplications(res.data.applications);
        }
      } catch (err) {
        // Fallback to local store
      }
    };
    fetchApplications();
    return () => {
      isMounted = false;
    };
  }, []);

  const statuses = [
    'All',
    'Submitted',
    'Under Verification',
    'Additional Information Required',
    'Flagged for Official Review',
    'Approved'
  ];

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = app.id.toLowerCase().includes(query);
        const matchesScheme = app.schemeName.toLowerCase().includes(query);
        const matchesBeneficiary = (app.targetBeneficiaryName || '').toLowerCase().includes(query);
        if (!matchesId && !matchesScheme && !matchesBeneficiary) return false;
      }

      if (statusFilter !== 'All' && app.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [applications, searchQuery, statusFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <TopGovBar />
      <CitizenHeader />

      <PageHeader
        title="My Applications & Tracking"
        subtitle="Track submitted welfare claims, inspection progress milestones and verification review statuses."
        breadcrumbs={[{ label: 'Applications' }]}
        actions={
          <Link
            to="/apply"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary-navy hover:bg-gov-blue text-white font-bold text-xs transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for New Benefit</span>
          </Link>
        }
      />

      <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12 space-y-6">

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-xl border border-gov-border p-4 shadow-xs flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by application reference (e.g. APP-2026-90412) or scheme name..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-gov-border rounded-lg text-gov-text focus:outline-none focus:ring-2 focus:ring-gov-blue"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gov-muted whitespace-nowrap">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-white border border-gov-border rounded-lg text-gov-text font-medium focus:ring-2 focus:ring-gov-blue max-w-[210px]"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <ApplicationTable
            applications={filteredApplications}
            onViewDetails={(app) => setSelectedAppModal(app)}
          />
        ) : (
          <EmptyState
            title="No applications match your criteria"
            description="Try modifying your search query or selecting a different status filter."
            actionLabel="Reset Search"
            onActionClick={() => {
              setSearchQuery('');
              setStatusFilter('All');
            }}
          />
        )}
      </main>

      {/* Modal for Quick Timeline Inspection */}
      <Modal
        isOpen={!!selectedAppModal}
        onClose={() => setSelectedAppModal(null)}
        title={`Application Tracking: ${selectedAppModal?.id}`}
        subtitle={`${selectedAppModal?.schemeName} • Target: ${selectedAppModal?.targetBeneficiaryName}`}
      >
        {selectedAppModal && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-gov-border flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-gov-muted block text-[11px]">Benefit Unit</span>
                <span className="font-semibold text-gov-text">{selectedAppModal.benefitUnit} Unit</span>
              </div>
              <div>
                <span className="text-gov-muted block text-[11px]">Applied Date</span>
                <span className="font-semibold text-gov-text">{selectedAppModal.appliedDate}</span>
              </div>
              <div>
                <span className="text-gov-muted block text-[11px]">Last Updated</span>
                <span className="font-semibold text-gov-text">{selectedAppModal.lastUpdated}</span>
              </div>
            </div>

            {selectedAppModal.hasActiveAlert && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Verification Review Notice Active
                </span>
                <Link
                  to={`/verification-alerts`}
                  className="font-bold underline text-amber-950"
                  onClick={() => setSelectedAppModal(null)}
                >
                  View Alert →
                </Link>
              </div>
            )}

            <ApplicationTimeline timeline={selectedAppModal.timeline} />

            <div className="pt-2 flex justify-end">
              <Link
                to={`/applications/${selectedAppModal.id}`}
                className="px-4 py-2 rounded-md bg-[#123B66] text-white text-xs font-bold hover:bg-gov-blue transition-colors"
                onClick={() => setSelectedAppModal(null)}
              >
                Go to Full Details Screen →
              </Link>
            </div>
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
};
