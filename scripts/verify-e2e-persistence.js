import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { config } from '../server/config.js';

const BASE_URL = `http://localhost:${config.port}/api`;
const SESSION_FILE = path.resolve(process.cwd(), '.e2e-test-session.json');

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    totalPassed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    totalFailed++;
  }
}

async function api(apiPath, options = {}) {
  const url = `${BASE_URL}${apiPath}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function runPhase1() {
  console.log('================================================================');
  console.log('   UDPAD End-to-End Supabase Persistence: PHASE 1 (Create & Verify)');
  console.log('================================================================\n');

  // Verify health check mode
  const healthRes = await api('/health');
  assert(
    healthRes.status === 200 && healthRes.data?.health?.databaseMode === 'supabase',
    `GET /api/health confirms databaseMode is "supabase" (Active: ${healthRes.data?.health?.databaseMode})`
  );

  const timestamp = Date.now();
  const citizen1Mobile = `95${Math.floor(10000000 + Math.random() * 90000000)}`;
  const citizen2Mobile = `96${Math.floor(10000000 + Math.random() * 90000000)}`;
  const citizen1Pass = 'StrongPassword123!';

  // 1. CITIZEN REGISTRATION & LOGIN
  console.log('\n--- 1. Testing Citizen Registration and Login ---');
  const reg1Res = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: `E2E Test Citizen Alpha ${timestamp}`,
      mobile: citizen1Mobile,
      email: `citizen.alpha.${timestamp}@udpad.gov.test`,
      password: citizen1Pass,
      gender: 'Male',
      occupation: 'Agricultural Farmer'
    })
  });
  assert(reg1Res.status === 201 && reg1Res.data?.token, 'Citizen 1 registration succeeded with HTTP 201 and issued token');
  const citizen1 = reg1Res.data?.user;
  const token1 = reg1Res.data?.token;

  const reg2Res = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: `E2E Test Citizen Beta ${timestamp}`,
      mobile: citizen2Mobile,
      email: `citizen.beta.${timestamp}@udpad.gov.test`,
      password: 'StrongPassword456!',
      gender: 'Female',
      occupation: 'Self-Employed'
    })
  });
  assert(reg2Res.status === 201 && reg2Res.data?.token, 'Citizen 2 registration succeeded with HTTP 201 and issued token');
  const citizen2 = reg2Res.data?.user;
  const token2 = reg2Res.data?.token;

  // Test Citizen 1 Login
  const loginRes = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      mobileOrEmail: citizen1Mobile,
      password: citizen1Pass
    })
  });
  assert(
    loginRes.status === 200 && loginRes.data?.user?.citizenId === citizen1.citizenId,
    'Citizen 1 login verified with mobile credentials and retrieved registered citizen ID'
  );

  // 2. HOUSEHOLD ACCESS & MODIFICATION
  console.log('\n--- 2. Testing Household Access and Updates ---');
  const hhRes = await api('/household', {
    headers: { Authorization: `Bearer ${token1}` }
  });
  assert(hhRes.status === 200 && hhRes.data?.household?.householdId, 'Citizen 1 retrieved initial household record');

  // Add Family Member
  const addMemberRes = await api('/household/members', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      fullName: `Family Member ${timestamp}`,
      relation: 'Daughter',
      age: 14,
      gender: 'Female',
      occupation: 'Student',
      education: 'Secondary School',
      status: 'Current Resident'
    })
  });
  assert(addMemberRes.status === 201, 'Citizen 1 successfully added family member to household');

  // Add Dwelling
  const addDwellingRes = await api('/household/dwellings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      address: `Plot ${timestamp}, Rural Sector 7, Block Atrauli`,
      type: 'Pucca Residential House',
      ownership: 'Owner',
      electricityMeterNo: `EL-${timestamp}`,
      waterConnectionNo: `WTR-${timestamp}`
    })
  });
  assert(addDwellingRes.status === 201, 'Citizen 1 successfully registered residential dwelling');

  // 3. APPLICATIONS CREATION & RETRIEVAL
  console.log('\n--- 3. Testing Application Creation and Retrieval ---');
  const appCreateRes = await api('/applications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      schemeId: 'SCH-01',
      schemeName: 'PMGKAY / NFSA free ration',
      department: 'Department of Food & Public Distribution',
      category: 'Food',
      benefitUnit: 'Household',
      beneficiaryName: citizen1.fullName,
      householdRef: citizen1.householdId
    })
  });
  assert(appCreateRes.status === 201 && appCreateRes.data?.application?.id, 'Citizen 1 created benefit application');
  const createdAppId = appCreateRes.data?.application?.id;

  const appGetRes = await api(`/applications/${createdAppId}`, {
    headers: { Authorization: `Bearer ${token1}` }
  });
  assert(
    appGetRes.status === 200 && appGetRes.data?.application?.schemeId === 'SCH-01',
    'Citizen 1 retrieved application by ID matching created record'
  );

  // 4. VERIFICATION ALERTS
  console.log('\n--- 4. Testing Verification Alerts ---');
  const alertCreateRes = await api('/alerts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      applicationId: createdAppId,
      schemeId: 'SCH-01',
      alertType: 'DUPLICATE_RATION_CARD_CHECK',
      severity: 'info',
      title: 'Automated Deduplication Completed',
      message: 'Zero duplicate ration benefit entries detected in national registry.',
      details: { verifiedAt: new Date().toISOString() },
      suggestedActions: ['Proceed with standard bi-monthly grain collection']
    })
  });
  assert(alertCreateRes.status === 201 && alertCreateRes.data?.alert?.id, 'Verification alert created for Citizen 1 application');
  const createdAlertId = alertCreateRes.data?.alert?.id;

  const alertGetRes = await api(`/alerts/${createdAlertId}`, {
    headers: { Authorization: `Bearer ${token1}` }
  });
  assert(
    alertGetRes.status === 200 && alertGetRes.data?.alert?.id === createdAlertId,
    'Citizen 1 retrieved alert details successfully'
  );

  // 5. CORRECTIONS & APPEALS
  console.log('\n--- 5. Testing Corrections and Appeals ---');
  const corrCreateRes = await api('/corrections', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      alertId: createdAlertId,
      applicationId: createdAppId,
      recordType: 'Address Clarification',
      schemeName: 'PMGKAY / NFSA free ration',
      reasonCategory: 'Dwelling Detail Verification',
      citizenStatement: 'Verified household dwelling electricity meter attached for official cross-reference.'
    })
  });
  assert(corrCreateRes.status === 201 && corrCreateRes.data?.correction?.id, 'Citizen 1 lodged correction appeal');
  const createdCorrId = corrCreateRes.data?.correction?.id;

  const corrListRes = await api('/corrections', {
    headers: { Authorization: `Bearer ${token1}` }
  });
  assert(
    corrListRes.status === 200 && corrListRes.data?.corrections?.some(c => c.id === createdCorrId),
    'Citizen 1 corrections list contains the newly lodged appeal'
  );

  // 6. NOTIFICATIONS
  console.log('\n--- 6. Testing Notifications ---');
  const notifCreateRes = await api('/notifications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      title: 'UDPAD Verification Notice',
      message: 'Your family registry details have been synced with the civil supplies directory.',
      category: 'Registry Update',
      type: 'success',
      link: '/household'
    })
  });
  assert(notifCreateRes.status === 201 && notifCreateRes.data?.notification?.id, 'Notification created for Citizen 1');
  const createdNotifId = notifCreateRes.data?.notification?.id;

  const notifReadRes = await api(`/notifications/${createdNotifId}/read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token1}` }
  });
  assert(
    notifReadRes.status === 200 && notifReadRes.data?.notifications?.some(n => n.id === createdNotifId && n.read === true),
    'Citizen 1 marked notification as read'
  );

  // 7. BENEFITS LEDGER
  console.log('\n--- 7. Testing Benefits Ledger ---');
  const benefitCreateRes = await api('/benefits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      schemeCode: 'PMGKAY-01',
      benefitName: 'PMGKAY Monthly Foodgrain Quota',
      benefitUnit: 'Household',
      recipientName: citizen1.fullName,
      amountOrItem: '35 kg free grain allocation',
      deliveringAgency: 'Fair Price Shop 142, Department of Food & Civil Supplies',
      status: 'Disbursed'
    })
  });
  assert(benefitCreateRes.status === 201 && benefitCreateRes.data?.benefit?.id, 'Benefit entry recorded for Citizen 1');
  const createdBenefitId = benefitCreateRes.data?.benefit?.id;

  const benefitListRes = await api('/benefits', {
    headers: { Authorization: `Bearer ${token1}` }
  });
  assert(
    benefitListRes.status === 200 && benefitListRes.data?.benefits?.some(b => b.id === createdBenefitId),
    'Citizen 1 benefits history contains the recorded benefit'
  );

  // 8. CROSS-TENANT AUTHORIZATION CHECKS
  console.log('\n--- 8. Testing Cross-Tenant Record Isolation ---');
  const crossAppRes = await api(`/applications/${createdAppId}`, {
    headers: { Authorization: `Bearer ${token2}` }
  });
  assert(crossAppRes.status === 403, 'Citizen 2 attempting to view Citizen 1 application is blocked with HTTP 403 Forbidden');

  const crossAlertRes = await api(`/alerts/${createdAlertId}`, {
    headers: { Authorization: `Bearer ${token2}` }
  });
  assert(crossAlertRes.status === 403, 'Citizen 2 attempting to view Citizen 1 alert is blocked with HTTP 403 Forbidden');

  const crossNotifRes = await api(`/notifications/${createdNotifId}/read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token2}` }
  });
  assert(crossNotifRes.status === 404, 'Citizen 2 attempting to mark Citizen 1 notification as read is rejected with HTTP 404');

  const crossCorrRes = await api('/corrections', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token2}` },
    body: JSON.stringify({
      applicationId: createdAppId,
      reasonCategory: 'Cross Tenant Attempt',
      citizenStatement: 'Unauthorized tampering attempt'
    })
  });
  assert(crossCorrRes.status === 403, 'Citizen 2 attempting to lodge appeal on Citizen 1 application is blocked with HTTP 403');

  // 9. ERROR HANDLING (NO SILENT FALLBACK TO MOCK DATA IN SUPABASE MODE)
  console.log('\n--- 9. Testing Database Error Handling (No Silent Fallback) ---');
  const nonExistentApp = await api('/applications/APP-NONEXISTENT-99999', {
    headers: { Authorization: `Bearer ${token1}` }
  });
  assert(nonExistentApp.status === 404, 'Querying non-existent application returns HTTP 404 without mock fallback');

  const nonExistentAlert = await api('/alerts/ALT-NONEXISTENT-99999', {
    headers: { Authorization: `Bearer ${token1}` }
  });
  assert(nonExistentAlert.status === 404, 'Querying non-existent alert returns HTTP 404 without mock fallback');

  const badAppRes = await api('/applications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({ invalidField: true })
  });
  assert(badAppRes.status === 400, 'Invalid application submission returns HTTP 400 explicit validation error');

  // 10. VERIFY PHYSICAL PERSISTENCE DIRECTLY IN SUPABASE DATABASE
  console.log('\n--- 10. Querying Live Supabase PostgreSQL Directly ---');
  const key = config.supabase.serviceKey || config.supabase.anonKey;
  const supabase = createClient(config.supabase.url, key);

  const { data: supaCit, error: errCit } = await supabase
    .from('citizens')
    .select('citizen_id, full_name, mobile')
    .eq('citizen_id', citizen1.citizenId)
    .single();
  assert(!errCit && supaCit?.citizen_id === citizen1.citizenId, 'Citizen record verified directly in Supabase "citizens" table');

  const { data: supaHh, error: errHh } = await supabase
    .from('households')
    .select('household_ref, citizen_id')
    .eq('citizen_id', citizen1.citizenId)
    .single();
  assert(!errHh && supaHh?.household_ref, 'Household record verified directly in Supabase "households" table');

  const { data: supaApp, error: errApp } = await supabase
    .from('applications')
    .select('id, scheme_id, citizen_id')
    .eq('id', createdAppId)
    .single();
  assert(!errApp && supaApp?.id === createdAppId, 'Application verified directly in Supabase "applications" table');

  const { data: supaAlert, error: errAlert } = await supabase
    .from('verification_alerts')
    .select('id, alert_type, citizen_id')
    .eq('id', createdAlertId)
    .single();
  assert(!errAlert && supaAlert?.id === createdAlertId, 'Alert verified directly in Supabase "verification_alerts" table');

  const { data: supaCorr, error: errCorr } = await supabase
    .from('corrections')
    .select('id, reason_category, citizen_id')
    .eq('id', createdCorrId)
    .single();
  assert(!errCorr && supaCorr?.id === createdCorrId, 'Correction verified directly in Supabase "corrections" table');

  const { data: supaNotif, error: errNotif } = await supabase
    .from('notifications')
    .select('id, title, read')
    .eq('id', createdNotifId)
    .single();
  assert(!errNotif && supaNotif?.id === createdNotifId && supaNotif.read === true, 'Notification verified directly in Supabase "notifications" table');

  const { data: supaBen, error: errBen } = await supabase
    .from('benefits_ledger')
    .select('id, scheme_code, citizen_id')
    .eq('id', createdBenefitId)
    .single();
  assert(!errBen && supaBen?.id === createdBenefitId, 'Benefit verified directly in Supabase "benefits_ledger" table');

  // Verify Census untouched
  const { count: censusCount, error: errCensus } = await supabase
    .from('census_demo')
    .select('*', { count: 'exact', head: true });
  assert(!errCensus && censusCount === 10000, `Census table intact with exactly ${censusCount} records`);

  // Write session data for post-restart verification
  const sessionData = {
    citizen1Mobile,
    citizen1Pass,
    citizen1Id: citizen1.citizenId,
    createdAppId,
    createdAlertId,
    createdCorrId,
    createdNotifId,
    createdBenefitId
  };

  fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionData, null, 2));

  console.log('\n================================================================');
  console.log(`Phase 1 Test Execution Summary: ${totalPassed} passed, ${totalFailed} failed`);
  console.log('================================================================');

  if (totalFailed > 0) process.exit(1);
}

async function runPhase2() {
  console.log('================================================================');
  console.log('   UDPAD End-to-End Supabase Persistence: PHASE 2 (Post-Restart)');
  console.log('================================================================\n');

  if (!fs.existsSync(SESSION_FILE)) {
    console.error('Session file not found. Please run Phase 1 first.');
    process.exit(1);
  }

  const session = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));

  // 1. Verify health after restart
  const healthRes = await api('/health');
  assert(
    healthRes.status === 200 && healthRes.data?.health?.databaseMode === 'supabase',
    `Fresh backend reports databaseMode: "supabase" (Active: ${healthRes.data?.health?.databaseMode})`
  );

  // 2. Login as Citizen 1 after restart
  console.log('\n--- 1. Post-Restart Citizen Login & Token Verification ---');
  const loginRes = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      mobileOrEmail: session.citizen1Mobile,
      password: session.citizen1Pass
    })
  });
  assert(loginRes.status === 200 && loginRes.data?.token, 'Citizen 1 logged in on newly restarted backend');
  const token = loginRes.data?.token;

  // 3. Verify Household & Members survived restart
  console.log('\n--- 2. Post-Restart Household Persistence ---');
  const hhRes = await api('/household', {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert(
    hhRes.status === 200 && hhRes.data?.household?.members?.length >= 2,
    `Household and registered family members persisted across server restart (Count: ${hhRes.data?.household?.members?.length})`
  );
  assert(
    hhRes.data?.household?.dwellings?.length >= 2,
    `Registered dwelling persisted across server restart (Count: ${hhRes.data?.household?.dwellings?.length})`
  );

  // 4. Verify Application survived restart
  console.log('\n--- 3. Post-Restart Application Persistence ---');
  const appRes = await api(`/applications/${session.createdAppId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert(
    appRes.status === 200 && appRes.data?.application?.id === session.createdAppId,
    `Benefit application ${session.createdAppId} persisted and retrieved via API`
  );

  // 5. Verify Verification Alert survived restart
  console.log('\n--- 4. Post-Restart Verification Alert Persistence ---');
  const alertRes = await api(`/alerts/${session.createdAlertId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert(
    alertRes.status === 200 && alertRes.data?.alert?.id === session.createdAlertId,
    `Verification alert ${session.createdAlertId} persisted and retrieved via API`
  );

  // 6. Verify Correction / Appeal survived restart
  console.log('\n--- 5. Post-Restart Correction / Appeal Persistence ---');
  const corrListRes = await api('/corrections', {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert(
    corrListRes.status === 200 && corrListRes.data?.corrections?.some(c => c.id === session.createdCorrId),
    `Correction appeal ${session.createdCorrId} persisted and listed in citizen portal`
  );

  // 7. Verify Notification survived restart
  console.log('\n--- 6. Post-Restart Notification Persistence ---');
  const notifRes = await api('/notifications', {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert(
    notifRes.status === 200 && notifRes.data?.notifications?.some(n => n.id === session.createdNotifId && n.read === true),
    `Read state of notification ${session.createdNotifId} persisted in Supabase`
  );

  // 8. Verify Benefits Ledger survived restart
  console.log('\n--- 7. Post-Restart Benefits Ledger Persistence ---');
  const benRes = await api('/benefits', {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert(
    benRes.status === 200 && benRes.data?.benefits?.some(b => b.id === session.createdBenefitId),
    `Benefit disbursement record ${session.createdBenefitId} persisted in Supabase`
  );

  // 9. Verify Census records preserved
  console.log('\n--- 8. Post-Restart Census Verification ---');
  const censusRes = await api('/census?page=1&limit=1');
  assert(
    censusRes.status === 200 && censusRes.data?.source === 'supabase' && censusRes.data?.pagination?.totalRecords === 10000,
    'Census records preserved in Supabase with source: "supabase" and 10000 total records'
  );

  console.log('\n================================================================');
  console.log(`Phase 2 (Post-Restart) Summary: ${totalPassed} passed, ${totalFailed} failed`);
  console.log('================================================================');

  if (totalFailed > 0) process.exit(1);
}

const arg = process.argv[2];
if (arg === '--phase=2') {
  runPhase2().catch((err) => {
    console.error('Fatal Phase 2 error:', err);
    process.exit(1);
  });
} else {
  runPhase1().catch((err) => {
    console.error('Fatal Phase 1 error:', err);
    process.exit(1);
  });
}
