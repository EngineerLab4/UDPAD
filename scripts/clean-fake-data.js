import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(process.env.SUPABASE_URL, key);

async function cleanFakeData() {
  console.log('--- Cleaning Fake Demo Data from Supabase ---');

  // 1. Delete all fake/test applications
  const { data: deletedApps, error: appsErr } = await supabase
    .from('applications')
    .delete()
    .neq('id', 'NON_EXISTENT_DUMMY_ID')
    .select('id, scheme_name, target_beneficiary_name');

  if (appsErr) {
    console.error('Error deleting applications:', appsErr);
  } else {
    console.log(`Deleted ${deletedApps?.length || 0} applications.`);
  }

  // 2. Delete verification alerts
  const { data: deletedAlerts, error: alertsErr } = await supabase
    .from('verification_alerts')
    .delete()
    .neq('id', 'NON_EXISTENT_DUMMY_ID')
    .select('id');

  if (alertsErr) {
    console.error('Error deleting verification alerts:', alertsErr);
  } else {
    console.log(`Deleted ${deletedAlerts?.length || 0} verification alerts.`);
  }

  // 3. Delete corrections / appeals
  const { data: deletedCorrs, error: corrsErr } = await supabase
    .from('corrections')
    .delete()
    .neq('id', 'NON_EXISTENT_DUMMY_ID')
    .select('id');

  if (corrsErr) {
    console.error('Error deleting corrections:', corrsErr);
  } else {
    console.log(`Deleted ${deletedCorrs?.length || 0} corrections.`);
  }

  // 4. Delete fake test citizens (Ramesh Kumar, Sunita Sharma, E2E Test Citizens)
  // Preserve Sachin Chauhan / AMIT accounts
  const { data: deletedCitizens, error: citErr } = await supabase
    .from('citizens')
    .delete()
    .or('full_name.eq.Ramesh Kumar,full_name.eq.Sunita Sharma,full_name.ilike.E2E Test Citizen%')
    .select('id, citizen_id, full_name');

  if (citErr) {
    console.error('Error deleting fake citizens:', citErr);
  } else {
    console.log(`Deleted ${deletedCitizens?.length || 0} fake test citizens.`);
  }

  // 5. Verify remaining citizens
  const { data: remainingCitizens } = await supabase
    .from('citizens')
    .select('id, citizen_id, full_name, email, mobile');
  console.log('Remaining real citizens:', remainingCitizens);

  // 6. Verify applications count
  const { count: appCount } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true });
  console.log('Applications remaining in Supabase:', appCount);
}

cleanFakeData().catch(console.error);
