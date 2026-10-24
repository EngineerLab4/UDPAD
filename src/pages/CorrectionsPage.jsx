import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Scale,
  FileText,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { mockDataService } from '../services/mockDataService';
import { CitizenHeader } from '../components/layout/CitizenHeader';
import { TopGovBar } from '../components/layout/TopGovBar';
import { Footer } from '../components/layout/Footer';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';

export const CorrectionsPage = () => {
  const [searchParams] = useSearchParams();
  const preAlertId = searchParams.get('alertId') || '';
  const preAppId = searchParams.get('appId') || '';

  const applications = mockDataService.getApplications();
  const [corrections, setCorrections] = useState(mockDataService.getCorrections());
  const [showSuccessModal, setShowSuccessModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      applicationId: preAppId || (applications[0]?.id ?? 'General Record Clarification'),
      reasonCategory: 'Household Relocation / Independent Nuclear Residence',
      citizenStatement: '',
      supportingEvidence: 'Tenancy_Agreement.pdf, Electricity_Bill.pdf'
    }
  });

  const onSubmit = (data) => {
    setSubmitting(true);
    setTimeout(() => {
      const selectedApp = applications.find((a) => a.id === data.applicationId);
      const newCorrection = mockDataService.createCorrection({
        alertId: preAlertId || null,
        applicationId: data.applicationId || 'General Inquiry',
        schemeName: selectedApp ? selectedApp.schemeName : 'Welfare Benefit Application',
        reasonCategory: data.reasonCategory,
        citizenStatement: data.citizenStatement,
        supportingEvidence: data.supportingEvidence
          ? data.supportingEvidence
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : ['Clarification_Document.pdf']
      });

      setCorrections(mockDataService.getCorrections());
      setSubmitting(false);
      setShowSuccessModal(newCorrection);
      reset();
    }, 700);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <TopGovBar />
      <CitizenHeader />

      <PageHeader
        title="Correction Requests & Verification Appeals"
        subtitle="Submit formal clarifications, tenancy documentation, or record dispute appeals for official review."
        breadcrumbs={[{ label: 'Corrections & Appeals' }]}
      />

      <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        {/* 2 Column Layout: Left Form, Right Active Corrections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Correction / Appeal Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-gov-border shadow-xs p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gov-blue">Grievance Form</span>
              <h2 className="text-xl font-bold text-primary-navy tracking-tight mt-1">
                Lodge Clarification or Correction Request
              </h2>
              <p className="text-xs text-gov-muted mt-1">
                Provide factual details and references to evidence for the handling authority.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
              {/* Select Record or Application */}
              <div>
                <label className="block font-bold text-gov-text uppercase tracking-wider mb-1.5">
                  Select Relevant Application or Record Reference <span className="text-red-600">*</span>
                </label>
                {applications.length > 0 ? (
                  <select
                    {...register('applicationId', { required: 'Please select an application' })}
                    className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text font-medium text-xs focus:ring-2 focus:ring-gov-blue"
                  >
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.id} — {app.schemeName} ({app.status})
                      </option>
                    ))}
                    <option value="General Household Record Correction">General Household Record Correction</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    {...register('applicationId', { required: 'Please specify application reference or topic' })}
                    placeholder="e.g. APP-2026-10492 or General Household Tenancy Clarification"
                    className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text font-medium text-xs focus:ring-2 focus:ring-gov-blue"
                  />
                )}
              </div>

              {/* Reason Category */}
              <div>
                <label className="block font-bold text-gov-text uppercase tracking-wider mb-1.5">
                  Reason for Clarification / Appeal <span className="text-red-600">*</span>
                </label>
                <select
                  {...register('reasonCategory', { required: 'Please select a reason' })}
                  className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text font-medium text-xs focus:ring-2 focus:ring-gov-blue"
                >
                  <option value="Household Relocation / Independent Nuclear Residence">
                    Household Relocation / Independent Nuclear Residence
                  </option>
                  <option value="Separation from Ancestral Household / Branching">
                    Separation from Ancestral Household / Branching
                  </option>
                  <option value="Distinct Physical Dwelling & Utility Meter">
                    Distinct Physical Dwelling & Utility Meter
                  </option>
                  <option value="Correction of Demographic or Income Data">
                    Correction of Demographic or Income Data
                  </option>
                  <option value="Different Individual Beneficiary Entitlement">
                    Different Individual Beneficiary Entitlement
                  </option>
                </select>
              </div>

              {/* Citizen Statement */}
              <div>
                <label className="block font-bold text-gov-text uppercase tracking-wider mb-1.5">
                  Detailed Explanation / Citizen Statement <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={4}
                  {...register('citizenStatement', {
                    required: 'Please describe the basis of your clarification or correction',
                    minLength: { value: 15, message: 'Please provide at least 15 characters of explanation' }
                  })}
                  placeholder="Explain why this benefit application is legitimate, detailing how your current residence or household is separate from the ancestral or related record..."
                  className={`w-full p-3 bg-white border rounded-lg text-gov-text font-normal text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-gov-blue ${
                    errors.citizenStatement ? 'border-red-500' : 'border-gov-border'
                  }`}
                />
                {errors.citizenStatement && (
                  <p className="mt-1 text-red-600 font-medium">{errors.citizenStatement.message}</p>
                )}
              </div>

              {/* Supporting Evidence References */}
              <div>
                <label className="block font-bold text-gov-text uppercase tracking-wider mb-1.5">
                  Supporting Evidence References (Comma Separated)
                </label>
                <input
                  type="text"
                  {...register('supportingEvidence')}
                  placeholder="e.g. Tenancy_Agreement.pdf, Electricity_Bill.pdf, Ration_Card.pdf"
                  className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text font-medium text-xs focus:ring-2 focus:ring-gov-blue"
                />
                <span className="text-[11px] text-gov-muted block mt-1">
                  Refer to the sample documents attached to your application or household dossier.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-lg bg-primary-navy hover:bg-gov-blue text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Lodging Correction Request...</span>
                    </>
                  ) : (
                    <>
                      <Scale className="w-4 h-4" />
                      <span>Submit Correction Request / Appeal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Active Corrections & Status Timeline (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl border border-gov-border shadow-xs p-6 space-y-4">
              <h3 className="text-base font-bold text-primary-navy border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Submitted Requests ({corrections.length})</span>
                <span className="text-xs font-semibold text-gov-muted">Docket Roster</span>
              </h3>

              {corrections.length > 0 ? (
                <div className="space-y-4">
                  {corrections.map((corr) => (
                    <div
                      key={corr.id}
                      className="p-4 bg-slate-50 rounded-xl border border-gov-border text-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-primary-navy">
                          {corr.id}
                        </span>
                        <StatusBadge status={corr.status} />
                      </div>

                      <div>
                        <span className="font-semibold text-gov-text block">
                          {corr.reasonCategory}
                        </span>
                        <span className="text-[11px] text-gov-muted block">
                          Linked Application: {corr.applicationId}
                        </span>
                      </div>

                      <p className="text-gov-text bg-white p-2.5 rounded border border-slate-200 text-[11px] leading-relaxed italic">
                        “{corr.citizenStatement}”
                      </p>

                      <div className="space-y-1 text-[11px] text-gov-muted">
                        <div>Assigned: <strong className="text-slate-800">{corr.assignedAuthority}</strong></div>
                        <div>Submitted: {corr.submissionDate}</div>
                      </div>

                      {/* Timeline */}
                      <div className="pt-2 border-t border-slate-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gov-muted block mb-1.5">
                          Status History
                        </span>
                        <div className="space-y-1.5">
                          {corr.timeline?.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-[11px]">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                              <div>
                                <span className="font-semibold text-slate-800">{step.status}</span> — <span className="text-slate-500">{step.date}</span>
                                <p className="text-gov-muted mt-0.5">{step.detail}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-gov-muted bg-slate-50 rounded-lg border border-dashed border-gov-border p-4">
                  <Scale className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-semibold text-gov-text">No Clarification Requests Yet</p>
                  <p className="mt-1 leading-relaxed">
                    When you submit a correction or appeal statement, your assigned docket and official timeline will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gov-border p-6 max-w-md w-full shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary-navy">
                Appeal Submitted Successfully
              </h3>
              <p className="text-xs text-gov-muted mt-1">
                Docket Reference: <strong className="font-mono text-slate-800">{showSuccessModal.id}</strong>
              </p>
            </div>
            <p className="text-xs text-gov-text bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed text-left">
              Your clarification statement and proof of separate residence have been logged. The Zonal Welfare Grievance Committee has queued the matter for administrative review.
            </p>
            <button
              onClick={() => setShowSuccessModal(null)}
              className="w-full py-2.5 rounded-lg bg-[#123B66] text-white text-xs font-bold hover:bg-gov-blue transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
