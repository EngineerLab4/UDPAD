import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  User,
  Users,
  Home,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Building,
  Info,
  ShieldCheck,
  Paperclip,
  Trash2,
  Printer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockDataService } from '../services/mockDataService';
import { CitizenHeader } from '../components/layout/CitizenHeader';
import { TopGovBar } from '../components/layout/TopGovBar';
import { Footer } from '../components/layout/Footer';
import { PageHeader } from '../components/common/PageHeader';

export const ApplyPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedSchemeId = searchParams.get('schemeId') || 'SCH-01';

  const schemes = mockDataService.getSchemes();
  const household = mockDataService.getHouseholdData();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedScheme, setSelectedScheme] = useState(
    mockDataService.getSchemeById(preselectedSchemeId) || schemes[0]
  );

  // Form State
  const [applicantData, setApplicantData] = useState({
    beneficiaryName: user?.fullName || '',
    beneficiaryRelation: 'Self (Head of Family)',
    citizenId: user?.citizenId || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    gender: user?.gender || 'Not Specified',
    occupation: user?.occupation || 'Citizen',
    annualIncome: household?.annualHouseholdIncome || 'Self-Declared'
  });

  const [contextData, setContextData] = useState({
    householdRef: household?.householdId || user?.householdId || 'HH-PRIMARY',
    dwellingRef: household?.dwellings?.[0]?.dwellingId || 'DWL-PRIMARY-001',
    consumerMeterNo: household?.dwellings?.[0]?.electricityMeterNo || 'N/A',
    installationAddress: household?.address || 'Registered Residential Address',
    declarationSeparateResidence: true
  });

  const [uploadedDocs, setUploadedDocs] = useState([
    { name: 'Income_Certificate_Self_Attested.pdf', size: '1.2 MB', verified: true },
    { name: 'Residence_Proof_Document.pdf', size: '890 KB', verified: true }
  ]);

  const [submittedApp, setSubmittedApp] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setApplicantData((prev) => ({
        ...prev,
        beneficiaryName: user.fullName || prev.beneficiaryName,
        citizenId: user.citizenId || prev.citizenId,
        mobile: user.mobile || prev.mobile,
        email: user.email || prev.email,
        gender: user.gender || prev.gender,
        occupation: user.occupation || prev.occupation
      }));
    }
  }, [user]);

  // Handle scheme change
  const handleSchemeChange = (schemeId) => {
    const s = mockDataService.getSchemeById(schemeId);
    if (s) setSelectedScheme(s);
  };

  // Document management
  const handleAddMockDocument = (docName) => {
    if (!uploadedDocs.some((d) => d.name === docName)) {
      setUploadedDocs([...uploadedDocs, { name: docName, size: '1.4 MB', verified: true }]);
    }
  };

  const handleRemoveDoc = (docName) => {
    setUploadedDocs(uploadedDocs.filter((d) => d.name !== docName));
  };

  // Final Submission
  const handleFinalSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const newApp = mockDataService.createApplication({
        schemeId: selectedScheme.id,
        schemeName: selectedScheme.name,
        department: selectedScheme.department,
        category: selectedScheme.category,
        benefitUnit: selectedScheme.benefitUnit,
        beneficiaryName: applicantData.beneficiaryName,
        householdRef: contextData.householdRef,
        dwellingRef: contextData.dwellingRef,
        documents: uploadedDocs
      });

      setSubmittedApp(newApp);
      setSubmitting(false);
      setCurrentStep(5);
    }, 800);
  };

  const steps = [
    { num: 1, label: 'Applicant Details' },
    { num: 2, label: 'Benefit Context' },
    { num: 3, label: 'Supporting Docs' },
    { num: 4, label: 'Review Application' },
    { num: 5, label: 'Confirmation' }
  ];

  const otherHouseholdMembers = household?.members?.filter((m) => !m.isHead) || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <TopGovBar />
      <CitizenHeader />

      <PageHeader
        title="Apply for a Welfare Benefit"
        subtitle={`Application portal for ${selectedScheme.name}`}
        breadcrumbs={[
          { label: 'Government Schemes', path: '/schemes' },
          { label: 'Apply' }
        ]}
      />

      <main id="main-content" className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
        {/* Step Progress Indicator (Steps 1-4) */}
        {currentStep < 5 && (
          <div className="bg-white rounded-xl border border-gov-border p-4 shadow-xs">
            <div className="flex items-center justify-between">
              {steps.slice(0, 4).map((step, idx) => {
                const isCompleted = currentStep > step.num;
                const isCurrent = currentStep === step.num;
                return (
                  <div key={step.num} className="flex-1 flex items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-[#123B66] text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                      </div>
                      <span
                        className={`text-xs font-semibold hidden sm:inline ${
                          isCurrent ? 'text-primary-navy font-bold' : 'text-gov-muted'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < 3 && <div className="flex-1 h-0.5 bg-slate-200 mx-3 hidden sm:block" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 1: Applicant Information */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl border border-gov-border p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gov-blue">Step 1 of 4</span>
              <h2 className="text-xl font-bold text-primary-navy tracking-tight mt-1">
                Applicant Information
              </h2>
              <p className="text-xs text-gov-muted mt-1">
                Data is prefilled from your verified citizen profile. You may review and update contact details.
              </p>
            </div>

            {/* Scheme Selector */}
            <div className="p-4 bg-slate-50 rounded-lg border border-gov-border space-y-2">
              <label className="block text-xs font-bold text-gov-text uppercase tracking-wider">
                Select Scheme to Apply For
              </label>
              <select
                value={selectedScheme.id}
                onChange={(e) => handleSchemeChange(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 bg-white border border-gov-border rounded-lg text-gov-text focus:ring-2 focus:ring-gov-blue"
              >
                {schemes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.benefitUnit} Unit)
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-gov-muted block">
                Benefit Unit: <strong>{selectedScheme.benefitUnit}</strong> • Department: {selectedScheme.department}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gov-text mb-1">Target Beneficiary Name</label>
                <input
                  type="text"
                  value={applicantData.beneficiaryName}
                  onChange={(e) => setApplicantData({ ...applicantData, beneficiaryName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-gov-border rounded-lg text-gov-text font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gov-text mb-1">Relationship to Household Head</label>
                <select
                  value={applicantData.beneficiaryRelation}
                  onChange={(e) => setApplicantData({ ...applicantData, beneficiaryRelation: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text font-medium"
                >
                  <option value="Self (Head of Family)">Self (Head of Family)</option>
                  {otherHouseholdMembers.map((m) => (
                    <option key={m.id} value={`${m.relation} (${m.fullName})`}>
                      {m.relation} ({m.fullName})
                    </option>
                  ))}
                  <option value="Dependent Relative">Dependent Relative</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gov-text mb-1">Citizen Reference ID</label>
                <input
                  type="text"
                  readOnly
                  value={applicantData.citizenId || 'CIT-NEW'}
                  className="w-full p-2.5 bg-slate-100 border border-gov-border rounded-lg text-gov-muted font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gov-text mb-1">Contact Mobile Number</label>
                <input
                  type="text"
                  value={applicantData.mobile}
                  onChange={(e) => setApplicantData({ ...applicantData, mobile: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text font-medium"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gov-border flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#123B66] hover:bg-gov-blue text-white font-bold text-xs transition-colors shadow-xs"
              >
                <span>Continue to Benefit Context</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Benefit and Household Context */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl border border-gov-border p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gov-blue">Step 2 of 4</span>
              <h2 className="text-xl font-bold text-primary-navy tracking-tight mt-1">
                Benefit & Household Context
              </h2>
              <p className="text-xs text-gov-muted mt-1">
                Configure dwelling and household parameters required for deduplication screening.
              </p>
            </div>

            {/* Scheme Benefit Unit Context Box */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-gov-blue shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-primary-navy">
                    Why is this context requested?
                  </span>
                  <p className="text-gov-text leading-relaxed">
                    This scheme ({selectedScheme.name}) is governed at the <strong>{selectedScheme.benefitUnit} Unit</strong>. To verify there is no duplicate allocation across connected entities, your designated household and physical dwelling meter are cross-referenced against national databases.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gov-text mb-1">Household Registry Reference</label>
                <input
                  type="text"
                  readOnly
                  value={contextData.householdRef}
                  className="w-full p-2.5 bg-slate-100 border border-gov-border rounded-lg text-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gov-text mb-1">Applicable Physical Dwelling Reference</label>
                {household?.dwellings && household.dwellings.length > 0 ? (
                  <select
                    value={contextData.dwellingRef}
                    onChange={(e) => setContextData({ ...contextData, dwellingRef: e.target.value })}
                    className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text font-medium"
                  >
                    {household.dwellings.map((dwl) => (
                      <option key={dwl.dwellingId} value={dwl.dwellingId}>
                        {dwl.dwellingId} — {dwl.type} ({dwl.address})
                      </option>
                    ))}
                    <option value="DWL-PRIMARY-001">DWL-PRIMARY-001 — Primary Registered Residence</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={contextData.dwellingRef}
                    onChange={(e) => setContextData({ ...contextData, dwellingRef: e.target.value })}
                    className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text font-medium"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-gov-text mb-1">Installation / Residence Physical Address</label>
                <textarea
                  rows={2}
                  value={contextData.installationAddress}
                  onChange={(e) => setContextData({ ...contextData, installationAddress: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text font-medium"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer bg-slate-50 p-3 rounded-lg border border-gov-border">
                  <input
                    type="checkbox"
                    checked={contextData.declarationSeparateResidence}
                    onChange={(e) => setContextData({ ...contextData, declarationSeparateResidence: e.target.checked })}
                    className="w-4 h-4 rounded text-gov-blue mt-0.5"
                  />
                  <span className="text-xs text-gov-text leading-snug">
                    I confirm that this application represents my active household unit and does not duplicate claims already availed at the specified dwelling.
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-gov-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-gov-text font-semibold text-xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#123B66] hover:bg-gov-blue text-white font-bold text-xs transition-colors shadow-xs"
              >
                <span>Continue to Supporting Documents</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Supporting Documents */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl border border-gov-border p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gov-blue">Step 3 of 4</span>
              <h2 className="text-xl font-bold text-primary-navy tracking-tight mt-1">
                Supporting Documents
              </h2>
              <p className="text-xs text-gov-muted mt-1">
                Upload digital document proofs for verification.
              </p>
            </div>

            {/* Document checklist based on scheme */}
            <div className="bg-slate-50 p-4 rounded-lg border border-gov-border space-y-2 text-xs">
              <span className="font-bold text-primary-navy block">
                Required Document Check-list for {selectedScheme.name}:
              </span>
              <ul className="space-y-1 text-gov-muted">
                {selectedScheme.requiredDocuments.map((doc, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span>• {doc}</span>
                    <button
                      type="button"
                      onClick={() => handleAddMockDocument(`Doc_${doc.slice(0, 16).replace(/\s+/g, '_')}.pdf`)}
                      className="text-[11px] text-gov-blue hover:underline font-semibold"
                    >
                      + Attach File
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Uploaded Documents List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gov-muted mb-2">
                Attached Documents ({uploadedDocs.length})
              </h4>
              <div className="space-y-2">
                {uploadedDocs.map((doc) => (
                  <div
                    key={doc.name}
                    className="p-3 bg-white rounded-lg border border-gov-border flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Paperclip className="w-4 h-4 text-gov-blue" />
                      <div>
                        <span className="font-semibold text-gov-text">{doc.name}</span>
                        <span className="text-[11px] text-gov-muted ml-2">({doc.size})</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.name)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Remove document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gov-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-gov-text font-semibold text-xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#123B66] hover:bg-gov-blue text-white font-bold text-xs transition-colors shadow-xs"
              >
                <span>Review Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Review Summary */}
        {currentStep === 4 && (
          <div className="bg-white rounded-xl border border-gov-border p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gov-blue">Step 4 of 4</span>
              <h2 className="text-xl font-bold text-primary-navy tracking-tight mt-1">
                Review Application Before Submission
              </h2>
              <p className="text-xs text-gov-muted mt-1">
                Carefully review all details. You can navigate back to modify any section prior to submission.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-lg border border-gov-border space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-primary-navy text-sm">Scheme Details</span>
                  <button onClick={() => setCurrentStep(1)} className="text-gov-blue font-semibold text-xs hover:underline">
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gov-muted block text-[11px]">Scheme Name:</span>
                    <span className="font-semibold text-gov-text">{selectedScheme.name}</span>
                  </div>
                  <div>
                    <span className="text-gov-muted block text-[11px]">Benefit Unit:</span>
                    <span className="font-semibold text-gov-text">{selectedScheme.benefitUnit} Unit</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-gov-border space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-primary-navy text-sm">Beneficiary & Household</span>
                  <button onClick={() => setCurrentStep(2)} className="text-gov-blue font-semibold text-xs hover:underline">
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gov-muted block text-[11px]">Target Beneficiary:</span>
                    <span className="font-semibold text-gov-text">{applicantData.beneficiaryName} ({applicantData.beneficiaryRelation})</span>
                  </div>
                  <div>
                    <span className="text-gov-muted block text-[11px]">Household Reference:</span>
                    <span className="font-mono font-medium text-gov-text">{contextData.householdRef}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gov-muted block text-[11px]">Dwelling Address:</span>
                    <span className="font-medium text-gov-text">{contextData.installationAddress}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-gov-border space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-primary-navy text-sm">Attached Documents ({uploadedDocs.length})</span>
                  <button onClick={() => setCurrentStep(3)} className="text-gov-blue font-semibold text-xs hover:underline">
                    Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uploadedDocs.map((d) => (
                    <span key={d.name} className="px-2 py-1 rounded bg-white border border-slate-200 font-mono text-[11px] text-gov-text">
                      {d.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gov-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-gov-text font-semibold text-xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-md disabled:opacity-70 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Benefit Application</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Submission Confirmation */}
        {currentStep === 5 && submittedApp && (
          <div className="bg-white rounded-2xl border border-gov-border p-6 sm:p-10 shadow-sm text-center max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-blue-50 text-gov-blue border border-blue-200">
                Application Successfully Logged
              </span>
              <h2 className="text-2xl font-extrabold text-primary-navy tracking-tight mt-3">
                Acknowledgment Receipt Generated
              </h2>
              <p className="text-xs text-gov-muted mt-1">
                Your application has been received and added to your tracking roster.
              </p>
            </div>

            {/* Generated Reference Box */}
            <div className="bg-slate-50 border border-gov-border rounded-xl p-5 text-left text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-gov-muted">Application Reference No.</span>
                <span className="font-mono text-base font-bold text-primary-navy">
                  {submittedApp.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gov-muted">Scheme Applied</span>
                <span className="font-semibold text-gov-text text-right max-w-xs">{submittedApp.schemeName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gov-muted">Benefit Unit</span>
                <span className="font-semibold text-gov-text">{submittedApp.benefitUnit} Unit</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gov-muted">Initial Status</span>
                <span className="px-2 py-0.5 rounded text-blue-800 bg-blue-100 font-bold text-[11px]">
                  Submitted
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gov-muted">Submission Date</span>
                <span className="font-mono text-slate-700">{submittedApp.appliedDate}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-gov-border bg-white hover:bg-slate-50 text-xs font-semibold text-gov-text shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Acknowledgment</span>
              </button>

              <Link
                to="/applications"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#123B66] hover:bg-gov-blue text-white font-bold text-xs transition-colors shadow-xs"
              >
                <span>Track in My Applications</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
