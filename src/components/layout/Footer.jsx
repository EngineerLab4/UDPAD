import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ExternalLink, HelpCircle, X, FileCheck, CheckCircle } from 'lucide-react';
import { Modal } from '../common/Modal';

export const Footer = () => {
  const [activeModal, setActiveModal] = useState(null); // 'accessibility' | 'boundaries' | 'terms'

  return (
    <footer className="bg-white text-slate-700 border-t border-slate-200 mt-auto relative overflow-hidden">
      {/* Tricolor decorative hairline */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] relative z-10" />

      {/* Background Ashoka Emblem Watermark in the Centre with Proper Transparency */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
        <img
          src="/ashoka-emblem.png"
          alt="State Emblem of India Watermark"
          className="w-[320px] sm:w-[440px] lg:w-[520px] h-auto max-h-[80%] object-contain opacity-[0.06] sm:opacity-[0.075] transition-opacity"
        />
      </div>

      <div className="max-w-7xl xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-14 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Platform Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <img
                src="/udpad-logo.png"
                alt="UDPAD Emblem Logo"
                className="w-13 h-13 sm:w-14 sm:h-14 object-contain shrink-0 drop-shadow-xs"
              />
              <div>
                <span className="font-extrabold text-2xl sm:text-3xl text-primary-navy tracking-tight block leading-none">
                  UDPAD
                </span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#D97706] block mt-1.5">
                  Citizen Public Portal
                </span>
              </div>
            </div>
            <p className="text-slate-600 text-[15px] sm:text-base leading-relaxed font-normal">
              Unified Digital Platform for Accessible Public Documentation. Facilitating transparent household records, welfare discovery and non-punitive deduplication verification.
            </p>
          </div>

          {/* Col 2: Citizen Services */}
          <div>
            <h3 className="font-extrabold text-primary-navy text-base sm:text-lg uppercase tracking-wider mb-5 flex items-center gap-2.5">
              <span className="w-1.5 h-4.5 bg-amber-500 rounded-full" />
              <span>Citizen Services</span>
            </h3>
            <ul className="space-y-3.5 text-[15px] sm:text-base">
              <li>
                <Link to="/records" className="text-slate-700 hover:text-gov-blue hover:translate-x-1.5 font-medium transition-all inline-block">
                  My Profile & Family Records
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="text-slate-700 hover:text-gov-blue hover:translate-x-1.5 font-medium transition-all inline-block">
                  Government Schemes Directory
                </Link>
              </li>
              <li>
                <Link to="/applications" className="text-slate-700 hover:text-gov-blue hover:translate-x-1.5 font-medium transition-all inline-block">
                  Benefit Application Tracking
                </Link>
              </li>
              <li>
                <Link to="/verification-alerts" className="text-slate-700 hover:text-gov-blue hover:translate-x-1.5 font-medium transition-all inline-block">
                  Verification Alerts & Review
                </Link>
              </li>
              <li>
                <Link to="/corrections" className="text-slate-700 hover:text-gov-blue hover:translate-x-1.5 font-medium transition-all inline-block">
                  Correction Requests & Appeals
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Principles & Architecture */}
          <div>
            <h3 className="font-extrabold text-primary-navy text-base sm:text-lg uppercase tracking-wider mb-5 flex items-center gap-2.5">
              <span className="w-1.5 h-4.5 bg-gov-blue rounded-full" />
              <span>UDPAD Core Principles</span>
            </h3>
            <ul className="space-y-3.5 text-[15px] sm:text-base text-slate-700 font-medium leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="text-amber-500 font-black text-lg leading-none mt-0.5">•</span>
                <span>Individual vs. Household Unit Distinction</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-500 font-black text-lg leading-none mt-0.5">•</span>
                <span>Non-Punitive Duplicate Claim Alerts</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-500 font-black text-lg leading-none mt-0.5">•</span>
                <span>Transparent Official Review Workflow</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-500 font-black text-lg leading-none mt-0.5">•</span>
                <span>Full Rights of Clarification & Appeal</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Important Scope */}
          <div>
            <h3 className="font-extrabold text-primary-navy text-base sm:text-lg uppercase tracking-wider mb-5 flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>Information & Privacy</span>
            </h3>
            <p className="text-slate-600 text-[15px] sm:text-base leading-relaxed mb-5 font-normal">
              A modern digital public infrastructure model demonstrating deduplication transparency. Does not collect sensitive biometric credentials or server-stored personal documents.
            </p>
            <Link
              to="/help"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-navy hover:bg-gov-blue text-white text-sm font-bold transition-colors shadow-sm"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
              <span>View FAQs & Help Guide</span>
            </Link>
          </div>
        </div>

        {/* Bottom Bar with Functional Modal Triggers */}
        <div className="border-t border-slate-200 mt-10 pt-5 pb-1 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div>
            © {new Date().getFullYear()} UDPAD Platform. Built for transparent public welfare administration.
          </div>
          <div className="flex flex-wrap items-center gap-5 sm:gap-6">
            <button
              onClick={() => setActiveModal('accessibility')}
              className="hover:text-primary-navy font-semibold transition-colors underline-offset-4 hover:underline cursor-pointer"
            >
              Accessibility Statement
            </button>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <button
              onClick={() => setActiveModal('boundaries')}
              className="hover:text-primary-navy font-semibold transition-colors underline-offset-4 hover:underline cursor-pointer"
            >
              Data Boundary Rules
            </button>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <button
              onClick={() => setActiveModal('terms')}
              className="hover:text-primary-navy font-semibold transition-colors underline-offset-4 hover:underline cursor-pointer"
            >
              Terms of Use
            </button>
          </div>
        </div>
      </div>

      {/* Accessibility Statement Modal */}
      <Modal
        isOpen={activeModal === 'accessibility'}
        onClose={() => setActiveModal(null)}
        title="Accessibility Statement"
        subtitle="Conformance to GIGW & WCAG 2.1 Standards"
      >
        <div className="space-y-3 text-xs text-gov-text leading-relaxed">
          <p>
            The UDPAD platform is committed to ensuring digital accessibility for citizens of all abilities, adhering to the Guidelines for Indian Government Websites (GIGW) and WCAG 2.1 Level AA standards.
          </p>
          <div className="bg-slate-50 p-3 rounded-lg border border-gov-border space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-primary-navy">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Features Provided:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gov-muted">
              <li>Direct text size adjustments (A-, A, A+) on the top bar.</li>
              <li>High-contrast text tokens ensuring contrast ratios above 4.5:1.</li>
              <li>Semantic HTML elements with descriptive ARIA labels.</li>
              <li>Keyboard-navigable interactive controls with visible focus rings.</li>
              <li>Skip to Main Content shortcut link.</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Data Boundary Rules Modal */}
      <Modal
        isOpen={activeModal === 'boundaries'}
        onClose={() => setActiveModal(null)}
        title="Data Boundary & Privacy Rules"
        subtitle="Principles of Purpose Limitation & Minimization"
      >
        <div className="space-y-3 text-xs text-gov-text leading-relaxed">
          <p>
            UDPAD strictly enforces data boundary rules to protect citizen privacy and uphold public trust:
          </p>
          <ul className="space-y-2 text-gov-text">
            <li className="bg-slate-50 p-2.5 rounded border border-gov-border">
              <strong className="text-primary-navy">Purpose Limitation:</strong> Information provided for one welfare scheme is checked only for deduplication admissibility and is never repurposed without citizen consent.
            </li>
            <li className="bg-slate-50 p-2.5 rounded border border-gov-border">
              <strong className="text-primary-navy">No Cross-Citizen Exposure:</strong> Verification alerts reveal only non-sensitive lineage references without disclosing confidential personal records of extended relatives.
            </li>
            <li className="bg-slate-50 p-2.5 rounded border border-gov-border">
              <strong className="text-primary-navy">Data Minimization:</strong> The platform does not solicit or store national biometric identifiers, Aadhaar numbers, or banking passwords.
            </li>
          </ul>
        </div>
      </Modal>

      {/* Terms of Use Modal */}
      <Modal
        isOpen={activeModal === 'terms'}
        onClose={() => setActiveModal(null)}
        title="Terms of Platform Use"
        subtitle="Citizen Rights & Administrative Guidelines"
      >
        <div className="space-y-3 text-xs text-gov-text leading-relaxed">
          <p>
            By accessing the UDPAD portal, citizens agree to use the service for exploring legitimate welfare entitlements, submitting applications and monitoring official verification decisions.
          </p>
          <p>
            All citizens retain full statutory rights to receive written justification for any verification review and to submit clarification evidence or formal administrative appeals without penalty.
          </p>
        </div>
      </Modal>
    </footer>
  );
};
