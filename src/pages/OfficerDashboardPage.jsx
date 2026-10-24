import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  Users,
  Building,
  Home,
  Clock,
  ArrowRight,
  Scale,
  Paperclip,
  Check,
  X,
  ExternalLink,
  LogOut,
  RefreshCw,
  Eye,
  BadgeCheck,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TopGovBar } from '../components/layout/TopGovBar';
import { Footer } from '../components/layout/Footer';
import { api } from '../services/apiClient';

export const OfficerDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('queue'); // queue | appeals | census
  const [applications, setApplications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  // Census search state
  const [censusSearch, setCensusSearch] = useState('');
  const [censusRecords, setCensusRecords] = useState([]);
  const [censusTotal, setCensusTotal] = useState(10000);
  const [censusLoading, setCensusLoading] = useState(false);

  // Form modal state for adjudication
  const [adjudicationNote, setAdjudicationNote] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Fetch real backend data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, alertsRes, corrsRes] = await Promise.all([
        api.get('/applications'),
        api.get('/alerts'),
        api.get('/corrections')
      ]);

      if (appsRes.ok && appsRes.data?.applications) {
        setApplications(appsRes.data.applications);
        if (appsRes.data.applications.length > 0 && !selectedApp) {
          setSelectedApp(appsRes.data.applications[0]);
        }
      }
      if (alertsRes.ok && alertsRes.data?.alerts) {
        setAlerts(alertsRes.data.alerts);
      }
      if (corrsRes.ok && corrsRes.data?.corrections) {
        setCorrections(corrsRes.data.corrections);
      }
    } catch (err) {
      console.error('Error fetching officer console data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    searchCensus('Shamli');
  }, []);

  const searchCensus = async (term = '') => {
    setCensusLoading(true);
    try {
      const q = term || censusSearch;
      const res = await api.get(`/census?limit=8${q ? `&search=${encodeURIComponent(q)}` : ''}`);
      if (res.ok && res.data?.data) {
        setCensusRecords(res.data.data);
        setCensusTotal(res.data.pagination?.totalRecords || 10000);
      }
    } catch (e) {
      console.error('Census query failed:', e);
    } finally {
      setCensusLoading(false);
    }
  };

  const handleApproveUnit = async (appId) => {
    setIsSubmittingAction(true);
    try {
      const res = await api.patch(`/applications/${appId}/status`, {
        status: 'Approved',
        statusNote: adjudicationNote || 'Nuclear family separation and distinct dwelling tenancy verified by Zonal Field Verification Officer. Prior ancestral grant flag cleared.'
      });
      if (res.ok) {
        setActionSuccessMessage(`Application ${appId} approved successfully following official verification.`);
        setTimeout(() => setActionSuccessMessage(''), 4000);
        setAdjudicationNote('');
        fetchData();
      }
    } catch (err) {
      console.error('Approve error:', err);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleRequestEvidence = async (appId) => {
    setIsSubmittingAction(true);
    try {
      const res = await api.patch(`/applications/${appId}/status`, {
        status: 'Information Required',
        statusNote: adjudicationNote || 'Official Notice: Please upload distinct electricity connection meter bill and separate registered rental agreement to verify independent dwelling status.'
      });
      if (res.ok) {
        setActionSuccessMessage(`Clarification notice issued to citizen for application ${appId}.`);
        setTimeout(() => setActionSuccessMessage(''), 4000);
        setAdjudicationNote('');
        fetchData();
      }
    } catch (err) {
      console.error('Request evidence error:', err);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleResolveAppeal = async (corrId, status = 'Resolved — Verified') => {
    setIsSubmittingAction(true);
    try {
      const res = await api.patch(`/corrections/${corrId}/status`, {
        status,
        officerRemarks: adjudicationNote || 'Citizen clarification accepted. Tenancy records verified against municipal registry.'
      });
      if (res.ok) {
        setActionSuccessMessage(`Appeal ${corrId} adjudicated as "${status}".`);
        setTimeout(() => setActionSuccessMessage(''), 4000);
        setAdjudicationNote('');
        fetchData();
      }
    } catch (err) {
      console.error('Adjudicate appeal error:', err);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <TopGovBar />

      {/* Official Government Officer Header */}
      <header className="bg-[#0e2c4d] text-white border-b-4 border-amber-500 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src="/udpad-logo.png"
                alt="UDPAD Emblem Logo"
                className="w-12 h-12 object-contain shrink-0 bg-white/10 p-1 rounded-lg"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-white">
                    UDPAD Zonal Verification & Grievance Console
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-slate-950">
                    Official Portal
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Government of India • Ministry of Social Justice & Empowerment • Authorized Official View
                </p>
              </div>
            </div>

            {/* Officer Profile & Quick Actions */}
            <div className="flex items-center gap-3">
              <div className="bg-white/10 rounded-lg px-3.5 py-2 text-right hidden sm:block border border-white/15">
                <span className="text-xs font-bold text-white block">
                  {user?.fullName || 'Rajesh Verma (ZFVO)'}
                </span>
                <span className="text-[11px] text-amber-300 block font-mono">
                  ID: {user?.officialId || user?.citizenId || 'GOV-ZFVO-01'} • {user?.email || 'officer@gov.in'}
                </span>
              </div>


              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg bg-red-600/80 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Sign out of official console"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* KPI Bar */}
      <section className="bg-white border-b border-gov-border py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-amber-900 block">Deduplication Alerts</span>
                <span className="text-xl font-black text-slate-900">
                  {alerts.length}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gov-blue text-white flex items-center justify-center shrink-0 font-bold">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-blue-900 block">Active Applications</span>
                <span className="text-xl font-black text-slate-900">
                  {applications.length}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 font-bold">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-purple-900 block">Appeals Docket</span>
                <span className="text-xl font-black text-slate-900">
                  {corrections.length}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-emerald-900 block">Census Dataset</span>
                <span className="text-xl font-black text-slate-900">
                  10,000 Records
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Success Alert Banner */}
        {actionSuccessMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">{actionSuccessMessage}</span>
            </div>
            <button onClick={() => setActionSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center justify-between border-b border-gov-border bg-white rounded-t-xl px-4 pt-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('queue')}
              className={`py-3 px-4 font-bold text-xs border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'queue'
                  ? 'border-primary-navy text-primary-navy bg-slate-50'
                  : 'border-transparent text-gov-muted hover:text-gov-text'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Verification & Deduplication Queue ({applications.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('appeals')}
              className={`py-3 px-4 font-bold text-xs border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'appeals'
                  ? 'border-primary-navy text-primary-navy bg-slate-50'
                  : 'border-transparent text-gov-muted hover:text-gov-text'
              }`}
            >
              <Scale className="w-4 h-4 text-purple-600" />
              <span>Citizen Clarification Appeals ({corrections.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('census')}
              className={`py-3 px-4 font-bold text-xs border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'census'
                  ? 'border-primary-navy text-primary-navy bg-slate-50'
                  : 'border-transparent text-gov-muted hover:text-gov-text'
              }`}
            >
              <Search className="w-4 h-4 text-gov-blue" />
              <span>Rural Census Cross-Reference Explorer (10,000)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={fetchData}
            className="p-2 rounded-lg text-gov-muted hover:text-gov-text hover:bg-slate-100 transition-colors text-xs flex items-center gap-1 cursor-pointer"
            title="Refresh records from Supabase"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* TAB 1: VERIFICATION & DEDUPLICATION QUEUE */}
        {activeTab === 'queue' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Applications List (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-gov-border shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-gov-border flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase text-gov-text">Incoming Claims for Review</h3>
                  <p className="text-[11px] text-gov-muted">Select an application to inspect side-by-side evidence</p>
                </div>
                <span className="text-xs font-mono text-gov-muted">{applications.length} claims</span>
              </div>

              <div className="divide-y divide-gov-border max-h-[600px] overflow-y-auto">
                {applications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gov-muted">
                    No applications currently in queue.
                  </div>
                ) : (
                  applications.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedApp?.id === app.id ? 'bg-blue-50/70 border-l-4 border-gov-blue' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-primary-navy">{app.schemeName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          app.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                          app.status === 'Information Required' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="text-xs text-gov-text font-medium mb-1">
                        Applicant: {app.targetBeneficiaryName || app.beneficiaryName || 'Registered Citizen'}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gov-muted">
                        <span>Ref: {app.id}</span>
                        <span>Unit: {app.benefitUnit || 'Household'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Dual Dossier & Adjudication Console (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {selectedApp ? (
                <div className="bg-white rounded-xl border border-gov-border shadow-xs p-6 space-y-6">
                  {/* Case Header */}
                  <div className="border-b border-gov-border pb-4 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[11px] font-bold">
                          {selectedApp.id}
                        </span>
                        <span className="text-xs text-gov-muted">Applied: {selectedApp.appliedDate}</span>
                      </div>
                      <h2 className="text-lg font-bold text-primary-navy">{selectedApp.schemeName}</h2>
                      <p className="text-xs text-gov-muted">{selectedApp.department} • Benefit Unit: {selectedApp.benefitUnit}</p>
                    </div>

                    <span className="text-xs font-bold text-gov-text bg-slate-100 px-3 py-1 rounded-full">
                      Status: {selectedApp.status}
                    </span>
                  </div>

                  {/* Dual Dossier Inspection: Current Applicant vs Ancestral Record */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary-navy mb-3 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-gov-blue" />
                      <span>Cross-Registry Deduplication Comparison (Dual Dossier)</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Current Claim */}
                      <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2.5 text-xs">
                        <span className="text-[11px] font-bold uppercase text-blue-900 block">
                          Current Applicant Dossier
                        </span>
                        <div>
                          <span className="text-gov-muted block text-[11px]">Primary Beneficiary</span>
                          <span className="font-bold text-slate-900">{selectedApp.targetBeneficiaryName || 'Applicant'}</span>
                        </div>
                        <div>
                          <span className="text-gov-muted block text-[11px]">Dwelling Ref / Tenancy</span>
                          <span className="font-mono text-slate-800">{selectedApp.dwellingRef || 'DWL-BRANCH-001 (Upper Unit)'}</span>
                        </div>
                        <div>
                          <span className="text-gov-muted block text-[11px]">Utility Meter Attached</span>
                          <span className="text-slate-800 font-medium">Consumer #883921 (Independent)</span>
                        </div>
                        <div>
                          <span className="text-gov-muted block text-[11px]">Declared Household Type</span>
                          <span className="text-slate-800 font-medium">Nuclear Branch-Off (Separated 2024)</span>
                        </div>
                      </div>

                      {/* Right: Flagged Ancestral / Overlap Record */}
                      <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2.5 text-xs">
                        <span className="text-[11px] font-bold uppercase text-amber-900 block">
                          Historical Registered Overlap
                        </span>
                        <div>
                          <span className="text-gov-muted block text-[11px]">Historical Beneficiary</span>
                          <span className="font-bold text-slate-900">Mohan Lal (Father / Ancestral Head)</span>
                        </div>
                        <div>
                          <span className="text-gov-muted block text-[11px]">Historical Dwelling Record</span>
                          <span className="font-mono text-slate-800">DWL-ORIGINAL-001 (Main Dwelling)</span>
                        </div>
                        <div>
                          <span className="text-gov-muted block text-[11px]">Prior Benefit Allotted</span>
                          <span className="text-slate-800 font-medium">Sanitation Grant Allotted 2022</span>
                        </div>
                        <div>
                          <span className="text-gov-muted block text-[11px]">Deduplication Flag Reason</span>
                          <span className="text-amber-800 font-semibold">Shared ancestral dwelling address match</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Verification Proofs */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gov-text mb-2.5">
                      Citizen Uploaded Evidence Files
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg border border-gov-border bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-gov-muted" />
                          <span className="font-medium text-slate-800">Tenancy_Agreement.pdf</span>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Uploaded</span>
                      </div>
                      <div className="p-3 rounded-lg border border-gov-border bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-gov-muted" />
                          <span className="font-medium text-slate-800">Electricity_Meter_Bill.pdf</span>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Uploaded</span>
                      </div>
                    </div>
                  </div>

                  {/* Official Determination & Adjudication Action Box */}
                  <div className="pt-4 border-t border-gov-border space-y-3">
                    <label className="block text-xs font-bold uppercase text-gov-text">
                      Officer Determination Remarks & Case Notes
                    </label>
                    <textarea
                      rows={2}
                      value={adjudicationNote}
                      onChange={(e) => setAdjudicationNote(e.target.value)}
                      placeholder="Enter official case notes (e.g. Verified separate kitchen and independent electricity meter connection #883921...)"
                      className="w-full p-3 rounded-lg border border-gov-border text-xs text-gov-text placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-blue"
                    />

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        disabled={isSubmittingAction}
                        onClick={() => handleApproveUnit(selectedApp.id)}
                        className="px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve Nuclear Separation (Clear Flag)</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSubmittingAction}
                        onClick={() => handleRequestEvidence(selectedApp.id)}
                        className="px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Request Tenancy Documentation</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gov-border p-12 text-center text-xs text-gov-muted">
                  Select an application from the left panel to inspect the dual dossier.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CITIZEN CLARIFICATION APPEALS */}
        {activeTab === 'appeals' && (
          <div className="bg-white rounded-xl border border-gov-border shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-gov-border flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase text-gov-text">Grievance & Clarification Docket</h3>
                <p className="text-[11px] text-gov-muted">Citizen appeals submitted to verify independent family separation or rectify demographic data</p>
              </div>
              <span className="text-xs font-mono text-gov-muted">{corrections.length} total appeals</span>
            </div>

            <div className="divide-y divide-gov-border">
              {corrections.length === 0 ? (
                <div className="p-8 text-center text-xs text-gov-muted">
                  No appeals currently pending official review.
                </div>
              ) : (
                corrections.map((corr) => (
                  <div key={corr.id} className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded bg-purple-100 text-purple-900 font-mono text-xs font-bold">
                          {corr.id}
                        </span>
                        <h4 className="text-sm font-bold text-primary-navy">{corr.schemeName || 'Welfare Benefit Clarification'}</h4>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-100 text-blue-900">
                        {corr.status || 'Under Official Review'}
                      </span>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-gov-text space-y-1.5">
                      <span className="text-[11px] font-bold text-gov-muted uppercase block">
                        Reason: {corr.reasonCategory}
                      </span>
                      <p className="leading-relaxed font-serif text-slate-800">
                        “{corr.citizenStatement || 'We are a nuclear household living separately on the second floor with independent kitchen and electricity meter.'}”
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="text-[11px] text-gov-muted">
                        Assigned: <strong className="text-slate-800">{corr.assignedAuthority || 'Zonal Public Grievance Officer'}</strong> • Submitted: {corr.submissionDate || 'Recent'}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleResolveAppeal(corr.id, 'Resolved — Verified')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                          Approve & Resolve Appeal
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: RURAL CENSUS CROSS-REFERENCE EXPLORER */}
        {activeTab === 'census' && (
          <div className="bg-white rounded-xl border border-gov-border shadow-xs p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-primary-navy">
                Rural Demographic Census Cross-Reference Explorer
              </h3>
              <p className="text-xs text-gov-muted mt-1 leading-relaxed">
                Query across 10,000 rural census records directly from Supabase (<code className="font-mono">public.census_demo</code>) to verify self-declared village residence, household size and social category.
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gov-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={censusSearch}
                  onChange={(e) => setCensusSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchCensus()}
                  placeholder="Search census records by village, tehsil, district or person ID (e.g. Shamli, P000001)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gov-border text-xs text-gov-text placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-blue"
                />
              </div>

              <button
                type="button"
                onClick={() => searchCensus()}
                className="px-5 py-2.5 rounded-lg bg-primary-navy hover:bg-gov-blue text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Search Census
              </button>
            </div>

            {/* Census Records Table */}
            <div className="border border-gov-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-gov-border text-[11px] font-bold uppercase text-gov-muted">
                    <tr>
                      <th className="py-3 px-4">Person ID</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">District</th>
                      <th className="py-3 px-4">Tehsil</th>
                      <th className="py-3 px-4">Village</th>
                      <th className="py-3 px-4">Social Category</th>
                      <th className="py-3 px-4">Household Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gov-border">
                    {censusLoading ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-xs text-gov-muted">
                          Searching 10,000 census records in Supabase...
                        </td>
                      </tr>
                    ) : censusRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-xs text-gov-muted">
                          No matching census records found.
                        </td>
                      </tr>
                    ) : (
                      censusRecords.map((r) => (
                        <tr key={r.person_id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-blue-900">{r.person_id}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{r.name}</td>
                          <td className="py-3 px-4 text-gov-text">{r.district}</td>
                          <td className="py-3 px-4 text-gov-text">{r.tehsil}</td>
                          <td className="py-3 px-4 text-gov-text">{r.village}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                              {r.social_category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-gov-text">{r.household_size} members</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
