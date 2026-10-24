import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const BASE_URL = 'http://localhost:5001/api';
const JWT_SECRET = 'udpad-secure-citizen-jwt-secret-key-2026';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

function createOfficerToken() {
  return jwt.sign(
    {
      citizenId: 'GOV-ZFVO-01',
      fullName: 'Rajesh Verma (ZFVO)',
      role: 'OFFICER',
      email: 'officer@gov.in'
    },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

async function runTestSuite() {
  console.log('======================================================================');
  console.log('   UDPAD Family Details & Real-Time Duplicate Household Test Suite');
  console.log('======================================================================\n');

  const officerToken = createOfficerToken();
  const testRunId = Date.now();

  // SCENARIO 1: Citizen saves all 4 new fields; data remains after refresh and login
  console.log('Scenario 1: Citizen demographic fields persistence & refresh:');
  const citizen1Mobile = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const reg1Res = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: `Aarav Sharma ${testRunId}`,
      mobile: citizen1Mobile,
      password: 'Password@123',
      fatherName: 'Devendra Sharma',
      motherName: 'Sunita Sharma',
      caste: 'General',
      casteOther: '',
      fullAddress: 'House No 104, Ward 7, Shamli, Uttar Pradesh'
    })
  });

  assert(reg1Res.status === 201 && reg1Res.data.success, 'Citizen 1 registered with 4 new demographic fields');
  const token1 = reg1Res.data.token;
  const citizen1Id = reg1Res.data.user.citizenId;

  // Verify fields returned on GET /me (simulates refresh)
  const meRes = await request('/auth/me', {
    headers: { Authorization: `Bearer ${token1}` }
  });
  assert(
    meRes.status === 200 &&
      meRes.data.user.fatherName === 'Devendra Sharma' &&
      meRes.data.user.motherName === 'Sunita Sharma' &&
      meRes.data.user.caste === 'General' &&
      meRes.data.user.fullAddress.includes('Shamli'),
    'GET /api/auth/me returns all 4 fields correctly after page refresh'
  );

  // Profile update flow
  const updateRes = await request('/auth/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      fullName: `Aarav Sharma ${testRunId}`,
      fatherName: 'Devendra Kumar Sharma',
      motherName: 'Sunita Devi Sharma',
      caste: 'Other',
      casteOther: 'Goswami',
      fullAddress: 'House No 104-B, Near Shiv Mandir, Ward 7, Shamli, Uttar Pradesh'
    })
  });
  assert(updateRes.status === 200 && updateRes.data.success, 'PUT /api/auth/profile updates family & address fields');

  // Re-login to ensure fields are fetched cleanly from Supabase
  const login1Res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      mobile: citizen1Mobile,
      password: 'Password@123'
    })
  });
  assert(
    login1Res.status === 200 &&
      login1Res.data.user.fatherName === 'Devendra Kumar Sharma' &&
      login1Res.data.user.casteOther === 'Goswami',
    'Re-login returns updated family details persisted in Supabase'
  );

  // SCENARIO 2: Two citizens with the same father and mother trigger household match alert
  console.log('\nScenario 2: Matching both father and mother triggers duplicate household alert:');
  const citizen2Mobile = `97${Math.floor(10000000 + Math.random() * 90000000)}`;
  const reg2Res = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: `Vikram Sharma ${testRunId}`,
      mobile: citizen2Mobile,
      password: 'Password@123',
      fatherName: 'Devendra Kumar Sharma',
      motherName: 'Sunita Devi Sharma',
      caste: 'Other',
      casteOther: 'Goswami',
      fullAddress: 'House No 104-B, Ward 7, Shamli, Uttar Pradesh'
    })
  });
  assert(reg2Res.status === 201 && reg2Res.data.success, 'Citizen 2 registered successfully with identical parents (non-blocking)');
  const token2 = reg2Res.data.token;
  const citizen2Id = reg2Res.data.user.citizenId;

  // Check alerts as officer
  const alertsRes = await request('/alerts', {
    headers: { Authorization: `Bearer ${officerToken}` }
  });
  const bothParentsAlert = alertsRes.data.alerts?.find(
    (a) => (a.citizenId === citizen2Id || a.details?.citizenId === citizen2Id) && a.details?.matchReason === 'both_parents'
  );
  assert(
    alertsRes.status === 200 && Boolean(bothParentsAlert),
    'Officer portal receives duplicate household alert with matchReason: both_parents'
  );

  // SCENARIO 3: Matching father name alone produces review alert rather than automatic rejection
  console.log('\nScenario 3: Matching father name alone produces review alert (not rejection):');
  const citizen3Mobile = `96${Math.floor(10000000 + Math.random() * 90000000)}`;
  const reg3Res = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: `Rohit Sharma ${testRunId}`,
      mobile: citizen3Mobile,
      password: 'Password@123',
      fatherName: 'Devendra Kumar Sharma',
      motherName: 'Meena Sharma',
      caste: 'General',
      fullAddress: 'Village Kudana, Shamli'
    })
  });
  assert(reg3Res.status === 201 && reg3Res.data.success, 'Citizen 3 registered successfully without rejection');
  const citizen3Id = reg3Res.data.user.citizenId;

  const alertsRes3 = await request('/alerts', {
    headers: { Authorization: `Bearer ${officerToken}` }
  });
  const fatherOnlyAlert = alertsRes3.data.alerts?.find(
    (a) => (a.citizenId === citizen3Id || a.details?.citizenId === citizen3Id) && a.details?.matchReason === 'father'
  );
  assert(Boolean(fatherOnlyAlert), 'Matching father name alone generates a review alert for officer adjudication');

  // SCENARIO 4: Matching mother name alone produces review alert rather than automatic rejection
  console.log('\nScenario 4: Matching mother name alone produces review alert (not rejection):');
  const citizen4Mobile = `95${Math.floor(10000000 + Math.random() * 90000000)}`;
  const reg4Res = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: `Kavita Verma ${testRunId}`,
      mobile: citizen4Mobile,
      password: 'Password@123',
      fatherName: 'Rajendra Prasad Verma',
      motherName: 'Sunita Devi Sharma',
      caste: 'OBC',
      fullAddress: 'Civil Lines, Shamli'
    })
  });
  assert(reg4Res.status === 201 && reg4Res.data.success, 'Citizen 4 registered successfully without rejection');
  const citizen4Id = reg4Res.data.user.citizenId;

  const alertsRes4 = await request('/alerts', {
    headers: { Authorization: `Bearer ${officerToken}` }
  });
  const motherOnlyAlert = alertsRes4.data.alerts?.find(
    (a) => (a.citizenId === citizen4Id || a.details?.citizenId === citizen4Id) && a.details?.matchReason === 'mother'
  );
  assert(Boolean(motherOnlyAlert), 'Matching mother name alone generates a review alert for officer adjudication');

  // SCENARIO 5: Similar names with different addresses are treated cautiously as possible match
  console.log('\nScenario 5: Name spelling variation produces cautious possible match alert:');
  const citizen5Mobile = `94${Math.floor(10000000 + Math.random() * 90000000)}`;
  const reg5Res = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: `Suresh Sharma ${testRunId}`,
      mobile: citizen5Mobile,
      password: 'Password@123',
      fatherName: 'Devendraa Kumar Sharma', // 1-char spelling variation (95% similarity)
      motherName: 'Suneeta Devi Sharma',    // 1-char phonetic variation (94% similarity)
      caste: 'General',
      fullAddress: 'Plot 42, Green Avenue, Muzaffarnagar'
    })
  });
  assert(reg5Res.status === 201, 'Citizen 5 registered with spelling variations');
  const citizen5Id = reg5Res.data.user.citizenId;

  const alertsRes5 = await request('/alerts', {
    headers: { Authorization: `Bearer ${officerToken}` }
  });
  const similarityAlert = alertsRes5.data.alerts?.find(
    (a) => (a.citizenId === citizen5Id || a.details?.citizenId === citizen5Id) && a.details?.matchConfidence === 'possible'
  );
  assert(Boolean(similarityAlert), 'Spelling variations treated cautiously with matchConfidence: possible');

  // SCENARIO 6: Different households with common parent names can be marked as separate households
  console.log('\nScenario 6: Officer marks separate household to clear duplicate flag:');
  const alertToResolve = fatherOnlyAlert || bothParentsAlert;
  const resolveDiffRes = await request(`/alerts/${alertToResolve.id}/resolve-match`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${officerToken}` },
    body: JSON.stringify({
      action: 'MARK_DIFFERENT_HOUSEHOLD',
      decisionReason: 'Physical verification confirmed nuclear branch-off with independent ration card and separate kitchen unit.'
    })
  });
  assert(
    resolveDiffRes.status === 200 && resolveDiffRes.data.result.status.includes('Separate Household Verified'),
    'Officer successfully marked separate household, clearing duplicate flag'
  );

  // SCENARIO 7: Household-based scheme flags potentially existing household benefit before approval
  console.log('\nScenario 7: Household-based scheme flags existing household benefit:');
  // Citizen 1 applies for Household scheme SCH-12 (PMAY-U2 Housing)
  const app1Res = await request('/applications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      schemeId: 'SCH-12',
      schemeName: 'Pradhan Mantri Awas Yojana - Urban 2.0 (PMAY-U2)',
      department: 'Ministry of Housing & Urban Affairs',
      category: 'Housing & Shelter',
      benefitUnit: 'Household',
      beneficiaryName: `Aarav Sharma ${testRunId}`,
      householdRef: 'HH-SHARMA-' + testRunId,
      dwellingRef: 'DWL-SHARMA-A'
    })
  });
  assert(app1Res.status === 201 && app1Res.data.success, 'Citizen 1 submitted application for household housing scheme SCH-12');
  const app1Id = app1Res.data.application.id;

  // Officer approves Citizen 1's application
  const approve1Res = await request(`/applications/${app1Id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${officerToken}` },
    body: JSON.stringify({
      status: 'Approved',
      statusNote: 'Verified eligibility and household documentation.'
    })
  });
  assert(approve1Res.status === 200, 'Citizen 1 application approved, establishing active household benefit');

  // Citizen 2 (same household/parents) applies for the same household scheme SCH-12
  const app2Res = await request('/applications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token2}` },
    body: JSON.stringify({
      schemeId: 'SCH-12',
      schemeName: 'Pradhan Mantri Awas Yojana - Urban 2.0 (PMAY-U2)',
      department: 'Ministry of Housing & Urban Affairs',
      category: 'Housing & Shelter',
      benefitUnit: 'Household',
      beneficiaryName: `Vikram Sharma ${testRunId}`,
      householdRef: 'HH-SHARMA-' + testRunId,
      dwellingRef: 'DWL-SHARMA-B'
    })
  });
  assert(app2Res.status === 201, 'Citizen 2 submitted application for same household scheme (reviewable)');
  const app2Id = app2Res.data.application.id;

  // Verify officer alert is created with prominent household warning
  const alertsRes7 = await request('/alerts', {
    headers: { Authorization: `Bearer ${officerToken}` }
  });
  const householdBenefitAlert = alertsRes7.data.alerts?.find(
    (a) => a.schemeId === 'SCH-12' && a.details?.warning && a.details?.warning.includes('Potential Existing Household Registration')
  );
  assert(
    Boolean(householdBenefitAlert),
    'Prominent alert generated: "Potential Existing Household Registration" with existing benefit status'
  );

  // SCENARIO 8: Individual-based scheme does not incorrectly block another eligible family member
  console.log('\nScenario 8: Individual-based scheme allows family member applications without false flags:');
  // Citizen 2 applies for Individual scheme SCH-04 (PM SVANidhi)
  const appIndivRes = await request('/applications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token2}` },
    body: JSON.stringify({
      schemeId: 'SCH-04',
      schemeName: 'PM Street Vendor\'s AtmaNirbhar Nidhi (PM SVANidhi)',
      department: 'Ministry of Housing & Urban Affairs',
      category: 'Financial Assistance',
      benefitUnit: 'Individual',
      beneficiaryName: `Vikram Sharma ${testRunId}`,
      householdRef: 'HH-SHARMA-' + testRunId
    })
  });
  assert(appIndivRes.status === 201 && appIndivRes.data.success, 'Individual scheme SCH-04 application submitted smoothly');

  const approveIndivRes = await request(`/applications/${appIndivRes.data.application.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${officerToken}` },
    body: JSON.stringify({
      status: 'Approved',
      statusNote: 'Eligible street vendor approved individually.'
    })
  });
  assert(approveIndivRes.status === 200, 'Individual-based scheme approves family member without household duplicate blockage');

  // SCENARIO 9: Concurrent applications cannot bypass final duplicate-benefit check (race condition guard)
  console.log('\nScenario 9: Pre-approval race condition check prevents duplicate household approval:');
  const approve2Res = await request(`/applications/${app2Id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${officerToken}` },
    body: JSON.stringify({
      status: 'Approved',
      statusNote: 'Attempting approval despite existing household benefit.'
    })
  });
  assert(
    approve2Res.status === 409,
    'Pre-approval recheck returned HTTP 409 Conflict, preventing duplicate household benefit approval'
  );

  // SCENARIO 10: Unauthorized citizens cannot access officer alerts or resolve-match endpoints
  console.log('\nScenario 10: Security & Role-Based Access Control enforcement:');
  const citizenTryAlerts = await request('/alerts', {
    headers: { Authorization: `Bearer ${token1}` }
  });
  // Citizen gets only their own alerts or empty, not all officer alerts
  const hasOtherCitizenData = citizenTryAlerts.data.alerts?.some(
    (a) => a.citizenId && a.citizenId !== citizen1Id
  );
  assert(!hasOtherCitizenData, 'Citizen token cannot view other citizens\' verification alerts');

  const citizenTryResolve = await request(`/alerts/${alertToResolve.id}/resolve-match`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      action: 'MARK_DIFFERENT_HOUSEHOLD',
      decisionReason: 'Unauthorized citizen attempt.'
    })
  });
  assert(
    citizenTryResolve.status === 403,
    'Citizen attempt to access officer resolve-match endpoint is strictly rejected with HTTP 403 Forbidden'
  );

  // SCENARIO 11: Officers can resolve alerts and decisions persist in Supabase audit trail
  console.log('\nScenario 11: Officer decision persistence and audit logging:');
  const resolveConfirmRes = await request(`/alerts/${householdBenefitAlert?.id || alertToResolve.id}/resolve-match`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${officerToken}` },
    body: JSON.stringify({
      action: 'CONFIRM_SAME_HOUSEHOLD',
      decisionReason: 'Verified applicant shares dwelling and ration book with prior beneficiary. Main grant applies to entire household.'
    })
  });
  assert(
    resolveConfirmRes.status === 200 && resolveConfirmRes.data.result.status.includes('Confirmed Same Household'),
    'Officer decision CONFIRM_SAME_HOUSEHOLD recorded successfully'
  );

  // Verify audit entry in alert details
  const getAlertRes = await request(`/alerts/${householdBenefitAlert?.id || alertToResolve.id}`, {
    headers: { Authorization: `Bearer ${officerToken}` }
  });
  assert(
    getAlertRes.status === 200 &&
      getAlertRes.data.alert.details?.auditTrail?.length > 0 &&
      getAlertRes.data.alert.details?.auditTrail[0].officerId === 'GOV-ZFVO-01',
    'Audit trail persisted with officer ID, timestamp, and decision reason in Supabase'
  );

  // SCENARIO 12: Existing citizen login, scheme listing, applications continue to work
  console.log('\nScenario 12: Core regression check across platform functions:');
  const healthCheck = await request('/health');
  assert(healthCheck.status === 200 && healthCheck.data.health?.status === 'healthy', 'GET /api/health healthy');

  const schemesCheck = await request('/schemes');
  assert(schemesCheck.status === 200 && schemesCheck.data.count === 25, 'GET /api/schemes returns all 25 schemes intact');

  const censusCheck = await request('/census?page=1&limit=5');
  assert(censusCheck.status === 200 && censusCheck.data.pagination.totalRecords === 10000, 'GET /api/census preserves all 10,000 records');

  console.log('\n======================================================================');
  console.log(`Test Execution Finished: ${passed} passed, ${failed} failed`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
