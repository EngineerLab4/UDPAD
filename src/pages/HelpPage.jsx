import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  FileText,
  Search,
  Users,
  ShieldAlert,
  Scale,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CitizenHeader } from '../components/layout/CitizenHeader';
import { PublicHeader } from '../components/layout/PublicHeader';
import { TopGovBar } from '../components/layout/TopGovBar';
import { Footer } from '../components/layout/Footer';
import { PageHeader } from '../components/common/PageHeader';

export const HelpPage = () => {
  const { isAuthenticated } = useAuth();
  const [openSection, setOpenSection] = useState(0);

  const faqs = [
    {
      category: 'Deduplication & Verification',
      q: 'What does a "Potential Overlap Detected" alert mean?',
      a: 'In the UDPAD architecture, an alert is a standard validation check, NOT proof of fraud or an automatic disqualification. It simply indicates that our cross-registry deduplication engine detected an earlier benefit (such as an ancestral sanitation grant or solar pump) that shares a historical family lineage or dwelling address. A human zonal officer reviews the case to verify whether your current household resides at a distinct location.'
    },
    {
      category: 'Benefit Units',
      q: 'How do household-level benefits differ from individual benefits?',
      a: 'Individual benefits (such as the Post-Matric Merit Scholarship or Senior Citizen Old Age Pension) attach strictly to the person based on educational enrollment or age. They cannot be blocked because a family member received a housing subsidy. Household benefits (such as Family Sanitation or Ujjwala LPG) are capped at one grant per registered co-habiting domestic unit.'
    },
    {
      category: 'Application Workflow',
      q: 'How do I submit an application and track its progress?',
      a: 'Navigate to "Government Schemes", select the relevant scheme, review eligibility and click "Apply Now". The multi-step form automatically pre-fills your verified demographic data. After submission, a unique reference (e.g. APP-2026-XXXX) is generated, allowing you to follow the chronological audit trail under "My Applications".'
    },
    {
      category: 'Appeals & Corrections',
      q: 'How do I submit a correction request or appeal a verification flag?',
      a: 'Go to the "Corrections & Appeals" page or click "Submit Clarification" on any active alert. Select your application, state why your current domestic residence is independent (e.g., relocation, separate tenancy, or marriage branching) and list your supporting proofs (such as rent agreement or separate electricity bill).'
    },
    {
      category: 'Household Registry Changes',
      q: 'Can family relationships and household membership change over time?',
      a: 'Yes. UDPAD accounts for dynamic life events including marriage, birth of children, demise of elderly relatives and household separation. For example, when adult siblings marry and establish separate residences, they branch off into distinct household IDs while retaining their individual citizen identity.'
    },
    {
      category: 'Privacy & Data Boundaries',
      q: 'What data safeguards and boundaries apply to this portal?',
      a: 'This demonstration prototype uses simulated records only. It does not interface with live UIDAI Aadhaar servers, real DigiLocker credentials, or operational banking systems. In a production government deployment, citizen data is protected under digital personal data protection statutes with strict purpose limitation.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <TopGovBar />
      {isAuthenticated ? <CitizenHeader /> : <PublicHeader />}

      <PageHeader
        title="Help & Citizen Support Guide"
        subtitle="Frequently asked questions, application guidance and UDPAD deduplication principles explained."
        breadcrumbs={[{ label: 'Help & Support' }]}
      />

      <main id="main-content" className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        {/* 3 Core Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gov-border p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-gov-blue flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-primary-navy mb-1">
                How to Apply for Benefits
              </h3>
              <p className="text-xs text-gov-muted leading-relaxed">
                Step-by-step guidance on prefilled profiles, document mock uploads and receipt generation.
              </p>
            </div>
            <Link
              to="/schemes"
              className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-gov-blue hover:underline flex items-center gap-1"
            >
              <span>Explore Schemes Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gov-border p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-primary-navy mb-1">
                Understanding Verification Flags
              </h3>
              <p className="text-xs text-gov-muted leading-relaxed">
                Learn why potential duplicate alerts occur and how official human review safeguards your rights.
              </p>
            </div>
            <Link
              to="/verification-alerts"
              className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-gov-blue hover:underline flex items-center gap-1"
            >
              <span>View Verification Alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gov-border p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-primary-navy mb-1">
                Appeals & Clarifications
              </h3>
              <p className="text-xs text-gov-muted leading-relaxed">
                How to submit proof of separate household tenancy or nuclear family separation.
              </p>
            </div>
            <Link
              to="/corrections"
              className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-gov-blue hover:underline flex items-center gap-1"
            >
              <span>Submit Clarification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Accordion FAQ Section */}
        <div className="bg-white rounded-xl border border-gov-border shadow-xs p-6 sm:p-8 space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-primary-navy flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gov-blue" />
              <span>Comprehensive Questions & Answers</span>
            </h3>
            <p className="text-xs text-gov-muted mt-1">
              Key operational questions regarding citizen entitlements, deduplication alerts and grievance timelines.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {faqs.map((faq, idx) => {
              const isOpen = openSection === idx;
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-gov-border overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenSection(isOpen ? -1 : idx)}
                    className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between gap-4 transition-colors text-xs font-bold text-primary-navy"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-gov-blue flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span>{faq.q}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-slate-500" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-500" />}
                  </button>

                  {isOpen && (
                    <div className="p-4 bg-white text-xs text-gov-text leading-relaxed border-t border-gov-border">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gov-muted block mb-1">
                        Category: {faq.category}
                      </span>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
