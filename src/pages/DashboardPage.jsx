import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  ShieldAlert,
  Award,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockDataService } from '../services/mockDataService';
import { api } from '../services/apiClient';
import { CitizenHeader } from '../components/layout/CitizenHeader';
import { TopGovBar } from '../components/layout/TopGovBar';
import { Footer } from '../components/layout/Footer';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { ApplicationTimeline } from '../components/applications/ApplicationTimeline';
import { Modal } from '../components/common/Modal';
import { AlertBanner } from '../components/common/AlertBanner';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [household, setHousehold] = useState(null);
  const [applications, setApplications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedAppForModal, setSelectedAppForModal] = useState(null);

  useEffect(() => {
    if (user?.role === 'OFFICER' || (user?.email && user.email.toLowerCase().endsWith('@gov.in'))) {
      navigate('/officer', { replace: true });
      return;
    }

    setHousehold(mockDataService.getHouseholdData());
    setApplications(mockDataService.getApplications());
    setAlerts(mockDataService.getAlerts());
    setBenefits(mockDataService.getBenefits());
    setSchemes(mockDataService.getSchemes());
    setNotifications(mockDataService.getNotifications());

    let isMounted = true;
    const loadRealApplications = async () => {
      try {
        const res = await api.get('/applications');
        if (isMounted && res.ok && Array.isArray(res.data?.applications)) {
          setApplications(res.data.applications);
          mockDataService.setApplications(res.data.applications);
        }
      } catch (err) {
        // Fallback silently to local cache
      }
    };
    loadRealApplications();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeAlert = alerts.find((a) => a.status === 'Under Official Review' || a.status === 'Potential Overlap Detected');
  const inProgressApps = applications.filter((a) => a.status !== 'Draft');

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <TopGovBar />
      <CitizenHeader />

      <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Greeting & Citizen Credentials Strip */}
        <div className="bg-white rounded-xl border border-gov-border p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-gov-blue">
                Verified Citizen Portal
              </span>
              <span className="text-xs font-mono text-gov-muted">
                ID: {user?.citizenId || 'CIT-NEW'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123B66] tracking-tight">
              Namaste, {user?.fullName || 'Citizen'}
            </h1>
            <p className="text-xs sm:text-sm text-gov-muted mt-0.5">
              Household Reference: <strong className="font-mono text-slate-800">{user?.householdId || household?.householdId}</strong> • {household?.address || 'Registered Citizen Household'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/schemes"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-navy hover:bg-gov-blue text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>Explore Schemes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/records"
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border border-gov-border hover:bg-slate-50 text-xs font-semibold text-gov-text transition-colors"
            >
              <span>Family Records</span>
            </Link>
          </div>
        </div>

        {/* Action Required: Verification Notice Alert if active */}
        {activeAlert && (
          <AlertBanner
            type="warning"
            title="Action Required: Deduplication Verification Review in Progress"
            message={activeAlert.neutralNotice}
            detail={`Alert Ref: ${activeAlert.id} • Associated with Application: ${activeAlert.applicationId}. Review by the Zonal Field Verification Officer is underway.`}
            actionText="Submit Clarification / Correction"
            actionLink={`/corrections?alertId=${activeAlert.id}&appId=${activeAlert.applicationId}`}
          />
        )}

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Profile Status"
            value="Active"
            icon={CheckCircle}
            linkTo="/records"
            linkText="View full profile"
          />

          <SummaryCard
            title="Household Members"
            value={`${household?.members?.length || 1} Member${(household?.members?.length || 1) !== 1 ? 's' : ''}`}
            icon={Users}
            linkTo="/records"
            linkText="View family records"
          />

          <SummaryCard
            title="Active Applications"
            value={`${applications.length} Submissions`}
            icon={FileText}
            linkTo="/applications"
            linkText="Track applications"
          />

          <SummaryCard
            title="Benefits Recorded"
            value={`${benefits.length} Awards`}
            icon={Award}
            linkTo="/benefit-history"
            linkText="View benefit ledger"
          />
        </div>

        {/* Explore Relevant Schemes Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-primary-navy">
                Explore Government Schemes for Your Household
              </h2>
              <p className="text-xs text-gov-muted">
                Welfare programs aligned with your household profile, dependents and dwelling location.
              </p>
            </div>
            <Link
              to="/schemes"
              className="text-xs font-bold text-gov-blue hover:text-primary-navy flex items-center gap-1"
            >
              <span>View Schemes Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {schemes.slice(0, 3).map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        </div>
      </main>

      {/* Modal for Quick Timeline Inspection */}
      <Modal
        isOpen={!!selectedAppForModal}
        onClose={() => setSelectedAppForModal(null)}
        title={`Status Timeline: ${selectedAppForModal?.id}`}
        subtitle={`${selectedAppForModal?.schemeName} • Target: ${selectedAppForModal?.targetBeneficiaryName}`}
      >
        {selectedAppForModal && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-gov-border flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-gov-muted block text-[11px]">Benefit Unit</span>
                <span className="font-semibold text-gov-text">{selectedAppForModal.benefitUnit} Unit</span>
              </div>
              <div>
                <span className="text-gov-muted block text-[11px]">Applied Date</span>
                <span className="font-semibold text-gov-text">{selectedAppForModal.appliedDate}</span>
              </div>
              <div>
                <span className="text-gov-muted block text-[11px]">Last Updated</span>
                <span className="font-semibold text-gov-text">{selectedAppForModal.lastUpdated}</span>
              </div>
            </div>

            <ApplicationTimeline timeline={selectedAppForModal.timeline} />

            <div className="pt-2 flex justify-end">
              <Link
                to={`/applications/${selectedAppForModal.id}`}
                className="px-4 py-2 rounded-md bg-[#123B66] text-white text-xs font-bold hover:bg-gov-blue transition-colors"
                onClick={() => setSelectedAppForModal(null)}
              >
                Go to Full Application Page →
              </Link>
            </div>
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
};
