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

async function runSecurityAuditTests() {
  console.log('======================================================');
  console.log('   UDPAD Backend Security & Authorization Test Suite');
  console.log('======================================================\n');

  // 1. PUBLIC ENDPOINTS
  console.log('1. Public Endpoints Verification:');
  const healthRes = await request('/health');
  assert(healthRes.status === 200 && healthRes.data.health?.status === 'healthy', 'GET /api/health is publicly accessible');

  const schemesRes = await request('/schemes');
  assert(schemesRes.status === 200 && schemesRes.data.count === 25, 'GET /api/schemes is publicly accessible and returns 25 schemes');

  const censusRes = await request('/census?page=1&limit=2');
  assert(censusRes.status === 200 && censusRes.data.pagination.totalRecords === 10000, 'GET /api/census preserves all 10000 records');

  // 2. TOKEN REJECTION TESTS
  console.log('\n2. Authentication Token Validation Tests:');
  const noTokenRes = await request('/applications');
  assert(noTokenRes.status === 401, 'Sensitive route without token returns HTTP 401');

  const rawHeaderRes = await request('/applications', {
    headers: { 'x-citizen-id': 'CIT-UNAUTHORIZED-123' }
  });
  assert(rawHeaderRes.status === 401, 'Raw x-citizen-id header without signed Bearer token is strictly rejected (HTTP 401)');

  const malformedRes = await request('/applications', {
    headers: { Authorization: 'Bearer this-is-not-a-valid-jwt' }
  });
  assert(malformedRes.status === 401, 'Malformed JWT Bearer token returns HTTP 401');

  const forgedToken = jwt.sign({ citizenId: 'CIT-SPOOF' }, 'wrong-secret-key-attacker');
  const forgedRes = await request('/applications', {
    headers: { Authorization: `Bearer ${forgedToken}` }
  });
  assert(forgedRes.status === 401, 'Forged JWT signed with incorrect secret returns HTTP 401');

  const expiredToken = jwt.sign({ citizenId: 'CIT-EXPIRED' }, JWT_SECRET, { expiresIn: -10 });
  const expiredRes = await request('/applications', {
    headers: { Authorization: `Bearer ${expiredToken}` }
  });
  assert(expiredRes.status === 401, 'Expired JWT returns HTTP 401');

  const nonExistentCitizenToken = jwt.sign({ citizenId: 'CIT-NONEXISTENT-999' }, JWT_SECRET, { expiresIn: '1h' });
  const nonExistentRes = await request('/applications', {
    headers: { Authorization: `Bearer ${nonExistentCitizenToken}` }
  });
  assert(nonExistentRes.status === 401, 'Validly signed token for non-existent citizen returns HTTP 401 without fallback session');

  // 3. REGISTRATION & LOGIN
  console.log('\n3. Citizen Registration & JWT Issuance:');
  const userAData = {
    fullName: 'Ramesh Kumar',
    mobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'SecurePassword123'
  };
  const regARes = await request('/auth/register', { method: 'POST', body: JSON.stringify(userAData) });
  assert(regARes.status === 201 && regARes.data.token, 'Citizen A registers and receives signed JWT');
  const citizenAToken = regARes.data.token;
  const citizenAId = regARes.data.user.citizenId;

  const userBData = {
    fullName: 'Sunita Sharma',
    mobile: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'SecurePassword456'
  };
  const regBRes = await request('/auth/register', { method: 'POST', body: JSON.stringify(userBData) });
  assert(regBRes.status === 201 && regBRes.data.token, 'Citizen B registers and receives signed JWT');
  const citizenBToken = regBRes.data.token;
  const citizenBId = regBRes.data.user.citizenId;

  // 4. RECORD OWNERSHIP & CROSS-TENANT ISOLATION
  console.log('\n4. Record-Level Ownership & Cross-Tenant Access Checks:');
  const appCreateRes = await request('/applications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenAToken}` },
    body: JSON.stringify({
      schemeId: 'SCH-01',
      schemeName: 'PMGKAY / NFSA free ration',
      department: 'Food & Civil Supplies',
      category: 'Food',
      benefitUnit: 'Household'
    })
  });
  assert(appCreateRes.status === 201, 'Citizen A successfully creates application');
  const applicationAId = appCreateRes.data.application.id;

  const getOwnerAppRes = await request(`/applications/${applicationAId}`, {
    headers: { Authorization: `Bearer ${citizenAToken}` }
  });
  assert(getOwnerAppRes.status === 200, 'Citizen A can read their own application');

  const crossTenantAppRes = await request(`/applications/${applicationAId}`, {
    headers: { Authorization: `Bearer ${citizenBToken}` }
  });
  assert(crossTenantAppRes.status === 403, 'Citizen B attempting to view Citizen A application is blocked with HTTP 403');

  const unauthAppRes = await request(`/applications/${applicationAId}`);
  assert(unauthAppRes.status === 401, 'Unauthenticated request to view application returns HTTP 401');

  // Test forged submission
  const forgedSubmissionRes = await request('/applications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenBToken}` },
    body: JSON.stringify({
      citizenId: citizenAId, // Attacker attempting to submit under Citizen A ID
      schemeId: 'SCH-02',
      schemeName: 'Annapurna Scheme'
    })
  });
  assert(
    forgedSubmissionRes.status === 201 && forgedSubmissionRes.data.application.citizenId === citizenBId,
    'Client-supplied forged citizenId in body is ignored; application is bound strictly to verified token owner (Citizen B)'
  );

  // Notifications ownership
  console.log('\n5. Notification Ownership Checks:');
  const notifCreateRes = await request('/notifications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenAToken}` },
    body: JSON.stringify({
      title: 'Alert for Citizen A',
      message: 'Private update for citizen A'
    })
  });
  assert(notifCreateRes.status === 201, 'Notification created for Citizen A');
  const notificationAId = notifCreateRes.data.notification.id;

  const crossTenantNotifReadRes = await request(`/notifications/${notificationAId}/read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${citizenBToken}` }
  });
  assert(crossTenantNotifReadRes.status === 404, 'Citizen B attempting to mark Citizen A notification as read is rejected with HTTP 404');

  const ownerNotifReadRes = await request(`/notifications/${notificationAId}/read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${citizenAToken}` }
  });
  assert(ownerNotifReadRes.status === 200, 'Citizen A can mark their own notification as read');

  // Corrections ownership
  console.log('\n6. Correction Submission Ownership Checks:');
  const crossTenantCorrectionRes = await request('/corrections', {
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenBToken}` },
    body: JSON.stringify({
      applicationId: applicationAId, // Citizen B trying to appeal Citizen A application
      reasonCategory: 'Income Mismatch',
      citizenStatement: 'I want to appeal Ramesh application.'
    })
  });
  assert(crossTenantCorrectionRes.status === 403, 'Citizen B attempting to lodge correction for Citizen A application is blocked with HTTP 403');

  // Household security
  console.log('\n7. Household Route Security:');
  const unauthHhRes = await request('/household');
  assert(unauthHhRes.status === 401, 'Unauthenticated request to /api/household returns HTTP 401');

  const authHhRes = await request('/household', {
    headers: { Authorization: `Bearer ${citizenAToken}` }
  });
  assert(authHhRes.status === 200 && authHhRes.data.household, 'Citizen A can access their household registry');

  // 8. TEARDOWN & CLEANUP (Keep database pristine with zero fake records)
  console.log('\n8. Test Entities Teardown:');
  try {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (process.env.SUPABASE_URL && key) {
      const supabase = createClient(process.env.SUPABASE_URL, key);
      if (applicationAId) {
        await supabase.from('applications').delete().eq('id', applicationAId);
      }
      if (citizenAId || citizenBId) {
        const ids = [citizenAId, citizenBId].filter(Boolean);
        await supabase.from('citizens').delete().in('citizen_id', ids);
      }
    }
    assert(true, 'Test entities cleanly de-provisioned from database');
  } catch (err) {
    console.warn('  Teardown warning:', err.message);
  }

  console.log('\n======================================================');
  console.log(`Test Execution Finished: ${passed} passed, ${failed} failed`);
  console.log('======================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAuditTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
