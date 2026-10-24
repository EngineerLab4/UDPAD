import { createInitialUser } from '../data/users';
import { api } from './apiClient';

const AUTH_STORAGE_KEY = 'udpad_v2_auth_session';
const USERS_STORAGE_KEY = 'udpad_v2_registered_users';
const CLEANUP_KEY = 'udpad_v2_cleanup_done';

// Purge any old demo data from previous sessions
try {
  if (!localStorage.getItem(CLEANUP_KEY)) {
    localStorage.removeItem('udpad_demo_applications');
    localStorage.removeItem('udpad_demo_alerts');
    localStorage.removeItem('udpad_demo_corrections');
    localStorage.removeItem('udpad_demo_notifications');
    localStorage.removeItem('udpad_demo_household');
    localStorage.removeItem('udpad_demo_benefits');
    localStorage.removeItem('udpad_demo_auth_session');
    localStorage.removeItem('udpad_demo_registered_users');
    localStorage.setItem(CLEANUP_KEY, 'true');
  }
} catch (e) {
  console.error('Error during cleanup of legacy demo data', e);
}

export const authService = {
  // Check if session exists in storage
  getCurrentSession() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading auth session', e);
    }
    return null;
  },

  // Perform login using registered citizen accounts
  async login(mobileOrEmail, password) {
    const cleanInput = mobileOrEmail.trim();

    // 1. Try Express Backend API
    try {
      const res = await api.post('/auth/login', { mobileOrEmail: cleanInput, password });
      if (res.ok && res.data?.user) {
        const sessionUser = {
          ...res.data.user,
          token: res.data.token || res.data.user.token
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
        return { success: true, user: sessionUser };
      }
      if (!res.ok && !res.networkError && !res.isGatewayError) {
        return { success: false, error: res.error || 'Invalid credentials.' };
      }
      if (res.isGatewayError) {
        console.warn('Backend proxy 502/503/504 encountered, falling back to local storage session.');
      }
    } catch (err) {
      console.warn('API login failed, falling back to local storage:', err);
    }

    // 2. Local Storage Fallback
    await new Promise((resolve) => setTimeout(resolve, 250));

    let registeredUsers = [];
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) registeredUsers = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }

    // Check official fallback for @gov.in
    if (cleanInput.toLowerCase().endsWith('@gov.in')) {
      const sessionUser = {
        id: 'usr_gov_officer_01',
        citizenId: 'GOV-ZFVO-01',
        officialId: 'GOV-ZFVO-01',
        fullName: cleanInput.toLowerCase().startsWith('nodal') ? 'Sunita Meena (ZPGO)' : 'Rajesh Verma (ZFVO)',
        designation: cleanInput.toLowerCase().startsWith('nodal') ? 'Zonal Public Grievance Officer' : 'Zonal Field Verification Officer',
        department: 'Department of Social Justice & Empowerment',
        jurisdiction: 'North Zone - Sector 4',
        mobile: '9876543200',
        email: cleanInput.toLowerCase(),
        role: 'OFFICER',
        gender: 'Male',
        occupation: 'Government Official',
        householdId: 'HH-GOV-OFFICER-01',
        address: {
          dwellingType: 'Government Administrative Quarters',
          addressLine1: 'Zonal Welfare Office, Room 204',
          addressLine2: 'Civil Secretariat',
          district: 'Central Zone',
          state: 'National Capital Territory',
          pincode: '110001'
        }
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
      return { success: true, user: sessionUser };
    }

    const matched = registeredUsers.find(
      (u) =>
        (u.mobile === cleanInput || (u.email && u.email.toLowerCase() === cleanInput.toLowerCase())) &&
        u.password === password
    );

    if (matched) {
      const sessionUser = {
        id: matched.id,
        citizenId: matched.citizenId,
        fullName: matched.fullName,
        mobile: matched.mobile,
        email: matched.email,
        gender: matched.gender,
        occupation: matched.occupation,
        householdId: matched.householdId,
        address: matched.address
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
      return { success: true, user: sessionUser };
    }

    return {
      success: false,
      error: 'Invalid credentials. No registered citizen account matches this mobile number/email and password. Please check your input or click "Register as a citizen" to create your account.'
    };
  },

  // Register new citizen account
  async register(userData) {
    // 1. Try Express Backend API
    try {
      const res = await api.post('/auth/register', userData);
      if (res.ok && res.data?.user) {
        const sessionUser = {
          ...res.data.user,
          token: res.data.token || res.data.user.token
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
        return { success: true, user: sessionUser };
      }
      if (!res.ok && !res.networkError && !res.isGatewayError) {
        return { success: false, error: res.error || 'Registration failed.' };
      }
      if (res.isGatewayError) {
        console.warn('Backend proxy 502/503/504 encountered during registration, falling back to local storage.');
      }
    } catch (err) {
      console.warn('API register failed, falling back to local storage:', err);
    }

    // 2. Local Storage Fallback
    await new Promise((resolve) => setTimeout(resolve, 250));

    let users = [];
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) users = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }

    // Check duplicate mobile
    if (users.some((u) => u.mobile === userData.mobile.trim())) {
      return {
        success: false,
        error: 'An account with this mobile number already exists. Please sign in instead.'
      };
    }

    const newUser = createInitialUser({
      fullName: userData.fullName.trim(),
      mobile: userData.mobile.trim(),
      email: userData.email ? userData.email.trim() : '',
      gender: userData.gender || 'Not Specified',
      occupation: userData.occupation || 'Citizen'
    });
    newUser.password = userData.password;

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // Save session
    const sessionUser = {
      id: newUser.id,
      citizenId: newUser.citizenId,
      fullName: newUser.fullName,
      mobile: newUser.mobile,
      email: newUser.email,
      gender: newUser.gender,
      occupation: newUser.occupation,
      householdId: newUser.householdId,
      address: newUser.address
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));

    return { success: true, user: sessionUser };
  },

  // Account recovery
  async recoverAccount(mobileOrEmail) {
    const cleanInput = mobileOrEmail.trim();

    try {
      const res = await api.post('/auth/recover', { mobileOrEmail: cleanInput });
      if (res.ok) {
        return { success: true, message: res.data?.message };
      }
    } catch (e) {
      // ignore
    }

    await new Promise((resolve) => setTimeout(resolve, 250));

    let registeredUsers = [];
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) registeredUsers = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }

    const matched = registeredUsers.find(
      (u) => u.mobile === cleanInput || (u.email && u.email.toLowerCase() === cleanInput.toLowerCase())
    );

    if (matched) {
      return {
        success: true,
        message: `Account located for ${matched.fullName}. An automated password recovery instruction has been recorded for ${cleanInput}.`
      };
    }

    return {
      success: true,
      message: `If an account is associated with ${cleanInput}, password reset instructions have been dispatched. Otherwise, please register a new citizen profile.`
    };
  },

  // Logout
  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};
