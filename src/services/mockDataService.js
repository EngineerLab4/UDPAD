import { schemesData } from '../data/schemes';
import { initialApplications } from '../data/applications';
import { benefitsHistory } from '../data/benefits';
import { initialAlerts, initialCorrections } from '../data/alerts';
import { initialNotifications } from '../data/notifications';
import { createDefaultHousehold } from '../data/households';
import { authService } from './authService';
import { api } from './apiClient';

const STORAGE_KEYS = {
  APPLICATIONS: 'udpad_v2_applications',
  ALERTS: 'udpad_v2_alerts',
  CORRECTIONS: 'udpad_v2_corrections',
  NOTIFICATIONS: 'udpad_v2_notifications',
  HOUSEHOLD: 'udpad_v2_household',
  BENEFITS: 'udpad_v2_benefits'
};

function getStoredOrInit(key, defaultData) {
  try {
    const item = localStorage.getItem(key);
    if (item !== null) return JSON.parse(item);
  } catch (e) {
    console.error(`Error reading ${key}`, e);
  }
  localStorage.setItem(key, JSON.stringify(defaultData));
  return defaultData;
}

export const mockDataService = {
  // Synchronize local cache with Express backend in background
  async syncWithBackend() {
    try {
      const [appsRes, hhRes, notifsRes, alertsRes, corrRes] = await Promise.all([
        api.get('/applications'),
        api.get('/household'),
        api.get('/notifications'),
        api.get('/alerts'),
        api.get('/corrections')
      ]);

      if (appsRes.ok && Array.isArray(appsRes.data?.applications)) {
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(appsRes.data.applications));
      }
      if (hhRes.ok && hhRes.data?.household) {
        localStorage.setItem(STORAGE_KEYS.HOUSEHOLD, JSON.stringify(hhRes.data.household));
      }
      if (notifsRes.ok && Array.isArray(notifsRes.data?.notifications)) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifsRes.data.notifications));
      }
      if (alertsRes.ok && Array.isArray(alertsRes.data?.alerts)) {
        localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alertsRes.data.alerts));
      }
      if (corrRes.ok && Array.isArray(corrRes.data?.corrections)) {
        localStorage.setItem(STORAGE_KEYS.CORRECTIONS, JSON.stringify(corrRes.data.corrections));
      }
    } catch (e) {
      // Backend might be offline; silent fallback
    }
  },

  // SCHEMES DIRECTORY (Catalog remains active for discovery & application)
  getSchemes() {
    return schemesData;
  },

  getSchemeById(id) {
    return schemesData.find((s) => s.id === id || s.code === id) || null;
  },

  // APPLICATIONS (Starts completely empty)
  getApplications() {
    const raw = getStoredOrInit(STORAGE_KEYS.APPLICATIONS, initialApplications);
    if (Array.isArray(raw)) {
      // Clean out any stale fake test records
      const cleaned = raw.filter(
        (a) =>
          a &&
          a.targetBeneficiaryName !== 'Sunita Sharma' &&
          a.targetBeneficiaryName !== 'Ramesh Kumar' &&
          !String(a.targetBeneficiaryName || '').startsWith('E2E Test')
      );
      if (cleaned.length !== raw.length) {
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(cleaned));
        return cleaned;
      }
    }
    return raw;
  },

  setApplications(apps) {
    if (Array.isArray(apps)) {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
    }
  },

  getApplicationById(id) {
    const apps = this.getApplications();
    return apps.find((a) => a.id === id) || null;
  },

  createApplication(formData) {
    const apps = this.getApplications();
    const appRef = `APP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const today = new Date().toISOString().split('T')[0];

    const newApp = {
      id: appRef,
      schemeId: formData.schemeId,
      schemeName: formData.schemeName,
      department: formData.department || 'Government of India',
      category: formData.category || 'General Welfare',
      benefitUnit: formData.benefitUnit,
      targetBeneficiaryName: formData.beneficiaryName || 'Self',
      householdRef: formData.householdRef || 'HH-CURRENT',
      dwellingRef: formData.dwellingRef || 'DWL-PRIMARY-001',
      appliedDate: today,
      lastUpdated: today,
      status: 'Submitted',
      statusNote: 'Application received and registered for automated deduplication and departmental review.',
      hasActiveAlert: false,
      alertId: null,
      timeline: [
        {
          step: 'Application Submitted',
          date: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          status: 'Completed',
          officer: 'Citizen Portal Self-Service',
          description: 'Citizen completed digital benefit form with attached documents.'
        },
        {
          step: 'Deduplication Screening',
          date: 'Queued',
          status: 'Pending',
          officer: 'UDPAD Verification Engine',
          description: 'Queued for cross-registry duplicate benefit check.'
        }
      ],
      documentsUploaded: formData.documents || [
        { name: 'Income_Self_Attested_Proof.pdf', size: '1.1 MB', verified: true },
        { name: 'Identity_Verification_Document.pdf', size: '820 KB', verified: true }
      ]
    };

    const updated = [newApp, ...apps];
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updated));

    // Send to Express Backend API asynchronously
    api.post('/applications', {
      ...formData,
      id: appRef
    }).catch((err) => console.warn('Backend sync application error:', err));

    // Also add notification
    this.addNotification({
      title: 'Application Successfully Submitted',
      message: `Your application ${appRef} for "${formData.schemeName}" has been received and queued for review.`,
      category: 'Application Update',
      type: 'info',
      link: '/applications'
    });

    return newApp;
  },

  // ALERTS (Starts empty)
  getAlerts() {
    return getStoredOrInit(STORAGE_KEYS.ALERTS, initialAlerts);
  },

  getAlertById(id) {
    const alerts = this.getAlerts();
    return alerts.find((a) => a.id === id) || null;
  },

  // CORRECTIONS & APPEALS (Starts empty)
  getCorrections() {
    return getStoredOrInit(STORAGE_KEYS.CORRECTIONS, initialCorrections);
  },

  createCorrection(data) {
    const corrections = this.getCorrections();
    const corrRef = `CORR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCorrection = {
      id: corrRef,
      alertId: data.alertId || null,
      applicationId: data.applicationId || 'General Inquiry',
      recordType: data.recordType || 'Verification Clarification',
      schemeName: data.schemeName || 'Citizen Welfare Grievance',
      reasonCategory: data.reasonCategory,
      citizenStatement: data.citizenStatement,
      supportingEvidence: data.supportingEvidence || ['Citizen_Clarification_Document.pdf'],
      submissionDate: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      status: 'Submitted',
      assignedAuthority: 'Zonal Public Grievance Officer',
      resolutionExpectation: 'Standard review timeline: 7 to 14 business days.',
      timeline: [
        {
          date: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          status: 'Submitted',
          detail: 'Citizen submitted formal clarification statement via citizen portal.'
        },
        {
          date: 'Pending Assignment',
          status: 'Pending',
          detail: 'Awaiting case officer docket entry for administrative review.'
        }
      ]
    };

    const updated = [newCorrection, ...corrections];
    localStorage.setItem(STORAGE_KEYS.CORRECTIONS, JSON.stringify(updated));

    // Send to Express Backend API asynchronously
    api.post('/corrections', {
      ...data,
      id: corrRef
    }).catch((err) => console.warn('Backend sync correction error:', err));

    this.addNotification({
      title: 'Correction Request Lodged',
      message: `Clarification request ${corrRef} submitted for official review.`,
      category: 'Correction / Appeal',
      type: 'info',
      link: '/corrections'
    });

    return newCorrection;
  },

  // BENEFITS HISTORY (Starts empty)
  getBenefits() {
    return getStoredOrInit(STORAGE_KEYS.BENEFITS, benefitsHistory);
  },

  // HOUSEHOLD DATA (Dynamically initialized for the logged-in citizen)
  getHouseholdData() {
    const currentUser = authService.getCurrentSession();
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HOUSEHOLD);
      if (stored) {
        const hh = JSON.parse(stored);
        // If household matches current user, return it
        if (currentUser && hh.headOfHousehold === currentUser.fullName) {
          return hh;
        }
      }
    } catch (e) {
      console.error('Error reading household data', e);
    }

    const defaultHh = createDefaultHousehold(currentUser);
    localStorage.setItem(STORAGE_KEYS.HOUSEHOLD, JSON.stringify(defaultHh));
    return defaultHh;
  },

  saveHouseholdData(hhData) {
    localStorage.setItem(STORAGE_KEYS.HOUSEHOLD, JSON.stringify(hhData));
    return hhData;
  },

  addHouseholdMember(member) {
    const hh = this.getHouseholdData();
    const newMember = {
      id: `MEM-${Math.floor(10 + Math.random() * 90)}`,
      fullName: member.fullName,
      relation: member.relation,
      citizenId: member.citizenId || `CIT-${Math.floor(100000 + Math.random() * 900000)}-IN`,
      age: parseInt(member.age, 10) || 18,
      gender: member.gender || 'Not Specified',
      occupation: member.occupation || 'Dependent',
      education: member.education || 'Secondary',
      status: member.status || 'Current Resident',
      memberSince: new Date().toISOString().split('T')[0],
      isHead: false,
      independentBenefitsAllowed: true
    };

    const newHistoryEvent = {
      id: `EVT-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      event: `Member Added (${newMember.fullName} - ${newMember.relation})`,
      type: 'Registration',
      description: `Added ${newMember.fullName} (${newMember.relation}) to household registry.`,
      authority: 'Citizen Portal Self-Service',
      referenceNo: `ADD-${Date.now()}`
    };

    const updatedMembers = [...(hh.members || []), newMember];
    const updated = {
      ...hh,
      members: updatedMembers,
      membershipHistory: [newHistoryEvent, ...(hh.membershipHistory || [])],
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    // Send to Express Backend API asynchronously
    api.post('/household/members', member)
      .catch((err) => console.warn('Backend sync household member error:', err));

    return this.saveHouseholdData(updated);
  },

  addHouseholdDwelling(dwelling) {
    const hh = this.getHouseholdData();
    const newDwelling = {
      dwellingId: `DWL-${Math.floor(1000 + Math.random() * 9000)}`,
      type: dwelling.type || 'Secondary Residence',
      ownership: dwelling.ownership || 'Resident / Owner',
      address: dwelling.address,
      electricityMeterNo: dwelling.electricityMeterNo || 'N/A',
      waterConnectionNo: dwelling.waterConnectionNo || 'N/A'
    };

    const updated = {
      ...hh,
      dwellings: [...(hh.dwellings || []), newDwelling],
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    // Send to Express Backend API asynchronously
    api.post('/household/dwellings', dwelling)
      .catch((err) => console.warn('Backend sync dwelling error:', err));

    return this.saveHouseholdData(updated);
  },

  // NOTIFICATIONS (Starts empty)
  getNotifications() {
    return getStoredOrInit(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  },

  markNotificationRead(id) {
    const notifs = this.getNotifications();
    const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));

    // Send to Express Backend API asynchronously
    api.put(`/notifications/${id}/read`, {})
      .catch((err) => console.warn('Backend sync notification read error:', err));

    return updated;
  },

  markAllNotificationsRead() {
    const notifs = this.getNotifications();
    const updated = notifs.map((n) => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));

    // Send to Express Backend API asynchronously
    api.put('/notifications/read-all', {})
      .catch((err) => console.warn('Backend sync read-all error:', err));

    return updated;
  },

  addNotification(notif) {
    const notifs = this.getNotifications();
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      title: notif.title,
      message: notif.message,
      category: notif.category || 'General Notice',
      type: notif.type || 'info',
      timestamp: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      read: false,
      link: notif.link || '/dashboard'
    };
    const updated = [newNotif, ...notifs];
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));

    // Send to Express Backend API asynchronously
    api.post('/notifications', notif)
      .catch((err) => console.warn('Backend sync notification error:', err));

    return updated;
  },

  // RESET ALL DATA
  resetDemoData() {
    localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.CORRECTIONS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.HOUSEHOLD);
    localStorage.removeItem(STORAGE_KEYS.BENEFITS);
  }
};
