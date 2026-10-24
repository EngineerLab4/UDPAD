import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Building,
  CheckCircle,
  FileCheck,
  HelpCircle,
  ArrowRight,
  User,
  Users,
  Home,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockDataService } from '../services/mockDataService';
import { CitizenHeader } from '../components/layout/CitizenHeader';
import { PublicHeader } from '../components/layout/PublicHeader';
import { TopGovBar } from '../components/layout/TopGovBar';
import { Footer } from '../components/layout/Footer';
import { PageHeader } from '../components/common/PageHeader';

export const SchemeDetailsPage = () => {
  const { schemeId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const scheme = mockDataService.getSchemeById(schemeId);

  if (!scheme) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
        <TopGovBar />
        {isAuthenticated ? <CitizenHeader /> : <PublicHeader />}
        <div className="flex-1 max-w-xl mx-auto py-16 px-4 text-center">
          <h2 className="text-xl font-bold text-primary-navy">Scheme Not Found</h2>
          <p className="text-xs text-gov-muted mt-2 mb-6">
            The requested scheme reference could not be located in the demonstration registry.
          </p>
          <Link
            to="/schemes"
            className="px-4 py-2 bg-[#123B66] text-white rounded text-xs font-semibold"
          >
            ← Back to Schemes Directory
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Unit icon helper
  const getUnitIcon = (unit) => {
    if (unit === 'Individual') return User;
    if (unit === 'Household') return Users;
    return Home;
  };

  const UnitIcon = getUnitIcon(scheme.benefitUnit);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <TopGovBar />
      {isAuthenticated ? <CitizenHeader /> : <PublicHeader />}

      <PageHeader
        title={scheme.name}
        subtitle={`${scheme.department} • Code: ${scheme.code}`}
        breadcrumbs={[
          { label: 'Government Schemes', path: '/schemes' },
          { label: scheme.code }
        ]}
        actions={
          <Link
            to={`/apply?schemeId=${scheme.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
          >
            <span>Apply Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />

      <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
        {/* Top Highlight Card */}
        <div className="bg-white rounded-xl border border-gov-border shadow-xs p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 font-bold text-slate-950">
                  <UnitIcon className="w-4 h-4 stroke-[2.2] text-slate-900" />
                  <span>Benefit Unit: {scheme.benefitUnit}</span>
                </span>

                <span className="text-slate-300">•</span>

                <span className="text-slate-700 font-medium">
                  Category: <strong className="text-slate-900">{scheme.category}</strong>
                </span>

                {scheme.verificationStatus && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span
                      className={`font-semibold ${
                        scheme.verificationStatus === 'Verified'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      Verification: {scheme.verificationStatus}
                    </span>
                  </>
                )}

                <span className="text-slate-300">•</span>

                <span className="text-emerald-700 font-semibold">
                  Status: Open for Applications
                </span>
              </div>

              <h2 className="text-xl font-bold text-primary-navy tracking-tight">
                Scheme Overview
              </h2>
              <p className="text-xs sm:text-sm text-gov-text leading-relaxed">
                {scheme.fullDescription}
              </p>
            </div>

            {/* Benefit Value Box */}
            <div className="bg-slate-50 rounded-xl p-5 border border-gov-border flex flex-col justify-between">
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gov-muted block mb-1">
                    Financial / Service Benefit:
                  </span>
                  <div className="text-lg font-bold text-slate-800 tracking-tight leading-snug">
                    {scheme.benefitAmount}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gov-muted block mb-1">
                    Intended Beneficiary:
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {scheme.intendedBeneficiary}
                  </p>
                </div>

                {scheme.portal && (
                  <div className="pt-2.5 border-t border-slate-200">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gov-muted block mb-1">
                      Official Portal / Channel:
                    </span>
                    <span className="text-xs font-semibold text-gov-blue break-words block">
                      {scheme.portal}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200">
                <Link
                  to={`/apply?schemeId=${scheme.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary-navy hover:bg-gov-blue text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <span>Start Application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* UDPAD Deduplication & Benefit Unit Explainer */}
        <div className="bg-amber-50/70 border-2 border-amber-300/80 rounded-xl p-5 text-xs text-amber-950 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <h3 className="font-bold text-amber-900 text-sm">
              UDPAD Benefit Unit Architecture Rule: {scheme.benefitUnit} Level
            </h3>
          </div>
          <p className="leading-relaxed">
            {scheme.benefitUnitExplanation}
          </p>
        </div>

        {/* 2 Column Details: Eligibility & Required Documents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Eligibility Criteria */}
          <div className="bg-white rounded-xl border border-gov-border shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-primary-navy flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Eligibility Requirements</span>
            </h3>
            <ul className="space-y-3 text-xs text-gov-text">
              {scheme.eligibilityCriteria.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Required Supporting Documents */}
          <div className="bg-white rounded-xl border border-gov-border shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-primary-navy flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-gov-blue" />
              <span>Required Supporting Documents</span>
            </h3>
            <p className="text-xs text-gov-muted">
              Digital copies must be in PDF or JPG format (mock demonstration file selection available).
            </p>
            <ul className="space-y-3 text-xs text-gov-text">
              {scheme.requiredDocuments.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  <FileText className="w-4 h-4 text-gov-blue shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 5-Step Application Process Description */}
        <div className="bg-white rounded-xl border border-gov-border shadow-xs p-6">
          <h3 className="text-base font-bold text-primary-navy mb-4">
            Application & Verification Lifecycle
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-primary-navy block">Step 1</span>
              <span className="text-gov-muted">Applicant Details Prefill</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-primary-navy block">Step 2</span>
              <span className="text-gov-muted">Household / Dwelling Context</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-primary-navy block">Step 3</span>
              <span className="text-gov-muted">Supporting Document Upload</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-primary-navy block">Step 4</span>
              <span className="text-gov-muted">Review & Submit</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-primary-navy block">Step 5</span>
              <span className="text-gov-muted">Tracking & Verification</span>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        {scheme.faq && scheme.faq.length > 0 && (
          <div className="bg-white rounded-xl border border-gov-border shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-primary-navy flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-gov-blue" />
              <span>Frequently Asked Questions & Clarifications</span>
            </h3>

            <div className="space-y-3">
              {scheme.faq.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-gov-border text-xs">
                  <h4 className="font-bold text-primary-navy text-xs mb-1.5 flex items-start gap-2">
                    <span className="text-amber-600 font-mono">Q.</span>
                    <span>{item.q}</span>
                  </h4>
                  <p className="text-gov-text leading-relaxed pl-5">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA Bar */}
        <div className="bg-[#123B66] rounded-xl p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-white">Ready to proceed with your application?</h4>
            <p className="text-xs text-slate-200 mt-0.5">
              Prefilled information from your verified profile will save time during form completion.
            </p>
          </div>
          <Link
            to={`/apply?schemeId=${scheme.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shadow-md shrink-0"
          >
            <span>Proceed to Apply</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};
