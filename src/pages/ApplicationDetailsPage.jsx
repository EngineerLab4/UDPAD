import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  User,
  Users,
  Home,
  Calendar,
  Building,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Printer,
  FileCheck2,
  Paperclip,
  CheckCircle2,
  Clock,
  Scale
} from 'lucide-react';
import { mockDataService } from '../services/mockDataService';
import { CitizenHeader } from '../components/layout/CitizenHeader';
import { TopGovBar } from '../components/layout/TopGovBar';
import { Footer } from '../components/layout/Footer';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { ApplicationTimeline } from '../components/applications/ApplicationTimeline';
import { AlertBanner } from '../components/common/AlertBanner';

export const ApplicationDetailsPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const application = mockDataService.getApplicationById(applicationId);
  const alerts = mockDataService.getAlerts();
  const relatedAlert = alerts.find((a) => a.applicationId === applicationId);

  if (!application) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
        <TopGovBar />
        <CitizenHeader />
        <div className="flex-1 max-w-xl mx-auto py-16 px-4 text-center">
          <h2 className="text-xl font-bold text-primary-navy">Application Not Found</h2>
          <p className="text-xs text-gov-muted mt-2 mb-6">
            No application found matching reference {applicationId}.
          </p>
          <Link
            to="/applications"
            className="px-4 py-2 bg-[#123B66] text-white rounded text-xs font-semibold"
          >
            ← Return to Applications List
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <TopGovBar />
      <CitizenHeader />

      <PageHeader
        title={`Application ${application.id}`}
        subtitle={`${application.schemeName} • Benefit Unit: ${application.benefitUnit}`}
        breadcrumbs={[
          { label: 'Applications', path: '/applications' },
          { label: application.id }
        ]}
        badge={<StatusBadge status={application.status} />}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gov-border hover:bg-slate-50 text-xs font-semibold text-gov-text shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Dossier</span>
            </button>
            {relatedAlert && (
              <Link
                to={`/corrections?alertId=${relatedAlert.id}&appId=${application.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Submit Clarification</span>
              </Link>
            )}
          </div>
        }
      />

      <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
        {/* Verification Alert Banner if active */}
        {relatedAlert && (
          <AlertBanner
            type="warning"
            title="Verification Notice: Deduplication Review in Progress"
            message={relatedAlert.neutralNotice}
            detail={`Related Record: ${relatedAlert.relatedRecordRef}. Standard validation check to verify independent household status. An authorized zonal officer is reviewing this case.`}
            actionText="Submit Clarification Statement / Tenancy Proof"
            actionLink={`/corrections?alertId=${relatedAlert.id}&appId=${application.id}`}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Application Details & Documents (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Metadata Card */}
            <div className="bg-white rounded-xl border border-gov-border p-6 shadow-xs space-y-4 text-xs">
              <h3 className="text-base font-bold text-primary-navy border-b border-slate-100 pb-3">
                Application Overview
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-gov-muted block text-[11px]">Scheme Name</span>
                  <span className="font-semibold text-gov-text">{application.schemeName}</span>
                </div>

                <div>
                  <span className="text-gov-muted block text-[11px]">Nodal Department</span>
                  <span className="font-medium text-slate-700">{application.department}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-gov-muted block text-[11px]">Target Beneficiary</span>
                    <span className="font-bold text-gov-text">{application.targetBeneficiaryName}</span>
                  </div>
                  <div>
                    <span className="text-gov-muted block text-[11px]">Benefit Unit</span>
                    <span className="font-bold text-gov-blue">{application.benefitUnit} Unit</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-gov-muted block text-[11px]">Submission Date</span>
                    <span className="font-mono text-gov-text">{application.appliedDate}</span>
                  </div>
                  <div>
                    <span className="text-gov-muted block text-[11px]">Last Updated</span>
                    <span className="font-mono text-gov-text">{application.lastUpdated}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-gov-muted block text-[11px]">Household Reference</span>
                  <span className="font-mono font-medium text-slate-800">{application.householdRef}</span>
                </div>

                {application.dwellingRef && (
                  <div>
                    <span className="text-gov-muted block text-[11px]">Dwelling Reference</span>
                    <span className="font-mono font-medium text-slate-800">{application.dwellingRef}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Uploaded Documents Card */}
            <div className="bg-white rounded-xl border border-gov-border p-6 shadow-xs space-y-3 text-xs">
              <h3 className="text-base font-bold text-primary-navy border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Supporting Documents</span>
                <span className="text-xs font-semibold text-gov-muted">
                  {application.documentsUploaded?.length || 0} Files
                </span>
              </h3>

              <div className="space-y-2">
                {application.documentsUploaded?.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-lg border border-gov-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-gov-blue" />
                      <div>
                        <span className="font-medium text-gov-text">{doc.name}</span>
                        <span className="text-[11px] text-gov-muted block">{doc.size}</span>
                      </div>
                    </div>
                    {doc.verified ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        In Review
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Chronological Status Timeline (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-gov-border p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-primary-navy flex items-center gap-2">
                <Clock className="w-5 h-5 text-gov-blue" />
                <span>Chronological Status Timeline</span>
              </h3>
              <p className="text-xs text-gov-muted mt-1">
                Step-by-step audit record from initial submission to verification adjudication.
              </p>
            </div>

            <ApplicationTimeline timeline={application.timeline} />

            <div className="pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-lg text-xs text-gov-muted space-y-1">
              <span className="font-bold text-slate-800 block">Demonstration Integrity Notice:</span>
              <p>
                Status events recorded in this timeline represent simulated interactions for prototype testing. No statutory government officer is processing actual personal identity documents.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
