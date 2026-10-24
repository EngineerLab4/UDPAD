import fs from 'fs';
import path from 'path';
import readline from 'readline';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const CSV_CANDIDATES = [
  'rural_census_demo_data_10000.csv',
  'rural_census_demo_data_10000 (1).csv'
];

function findCsvFile() {
  for (const filename of CSV_CANDIDATES) {
    const fullPath = path.resolve(process.cwd(), filename);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function loadCsvRecords(csvPath) {
  const fileStream = fs.createReadStream(csvPath, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let headers = null;
  const records = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    if (!headers) {
      headers = parseCsvLine(line);
      continue;
    }

    const values = parseCsvLine(line);
    const row = {};
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = values[i] !== undefined ? values[i] : '';
    }

    // Type coercion for SQL schema
    const record = {
      person_id: row.person_id,
      household_id: row.household_id,
      state: row.state,
      district: row.district,
      tehsil_block: row.tehsil_block,
      village_name: row.village_name,
      village_code: row.village_code,
      pincode: row.pincode,
      area_type: row.area_type || 'Rural',
      person_name: row.person_name,
      gender: row.gender,
      age: parseInt(row.age, 10) || 0,
      relation_to_head: row.relation_to_head,
      marital_status: row.marital_status,
      religion: row.religion,
      social_category: row.social_category,
      mother_tongue: row.mother_tongue,
      literate: row.literate,
      education_level: row.education_level,
      occupation: row.occupation,
      worker_type: row.worker_type,
      disability: row.disability || 'None',
      household_size: parseInt(row.household_size, 10) || 1,
      house_type: row.house_type,
      number_of_rooms: parseInt(row.number_of_rooms, 10) || 1,
      drinking_water_source: row.drinking_water_source,
      electricity: row.electricity,
      toilet_facility: row.toilet_facility,
      cooking_fuel: row.cooking_fuel,
      land_holding: row.land_holding,
      phone_access: row.phone_access,
      bank_account: row.bank_account
    };

    records.push(record);
  }

  return records;
}

async function importToSupabase(supabaseUrl, supabaseKey, records) {
  console.log(`Connecting to Supabase at: ${supabaseUrl}`);
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check table presence
  const { error: probeError } = await supabase.from('census_demo').select('person_id').limit(1);
  if (probeError) {
    console.error('\n❌ Could not access table "census_demo" in Supabase.');
    console.error('Error message:', probeError.message);
    console.error('\nPlease execute the SQL in server/db/census-schema.sql inside your Supabase SQL Editor first, then rerun this script.');
    process.exit(1);
  }

  console.log(`Starting repeatable batch upsert of ${records.length} records into census_demo...`);
  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const chunk = records.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('census_demo').upsert(chunk, { onConflict: 'person_id' });
    if (error) {
      console.error(`Error upserting batch ${i} - ${i + chunk.length}:`, error.message);
      throw error;
    }
    inserted += chunk.length;
    process.stdout.write(`\r  → Upserted ${inserted} / ${records.length} records (${Math.round((inserted / records.length) * 100)}%)`);
  }
  console.log('\n✓ Finished upserting all records.');

  // Verify exact row count
  const { count, error: countError } = await supabase
    .from('census_demo')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.warn('Could not verify count:', countError.message);
  } else {
    console.log(`\n======================================================`);
    console.log(`🎉 SUCCESS: Verified ${count} records in Supabase table "census_demo"!`);
    console.log(`======================================================\n`);
  }
}

async function importToPostgres(connectionString, records) {
  console.log(`Connecting to PostgreSQL...`);
  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    console.log(`Creating table census_demo if not exists...`);
    const schemaSql = fs.readFileSync(path.resolve(process.cwd(), 'server/db/census-schema.sql'), 'utf-8');
    await client.query(schemaSql);

    console.log(`Inserting ${records.length} records into PostgreSQL in transactions...`);
    await client.query('BEGIN');

    const BATCH_SIZE = 500;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const chunk = records.slice(i, i + BATCH_SIZE);
      const values = [];
      const placeholders = [];

      chunk.forEach((r, idx) => {
        const offset = idx * 32;
        placeholders.push(
          `(${Array.from({ length: 32 }, (_, k) => `$${offset + k + 1}`).join(', ')})`
        );
        values.push(
          r.person_id, r.household_id, r.state, r.district, r.tehsil_block, r.village_name,
          r.village_code, r.pincode, r.area_type, r.person_name, r.gender, r.age,
          r.relation_to_head, r.marital_status, r.religion, r.social_category, r.mother_tongue,
          r.literate, r.education_level, r.occupation, r.worker_type, r.disability,
          r.household_size, r.house_type, r.number_of_rooms, r.drinking_water_source,
          r.electricity, r.toilet_facility, r.cooking_fuel, r.land_holding, r.phone_access, r.bank_account
        );
      });

      const sql = `
        INSERT INTO census_demo (
          person_id, household_id, state, district, tehsil_block, village_name,
          village_code, pincode, area_type, person_name, gender, age,
          relation_to_head, marital_status, religion, social_category, mother_tongue,
          literate, education_level, occupation, worker_type, disability,
          household_size, house_type, number_of_rooms, drinking_water_source,
          electricity, toilet_facility, cooking_fuel, land_holding, phone_access, bank_account
        ) VALUES ${placeholders.join(', ')}
        ON CONFLICT (person_id) DO UPDATE SET
          household_id = EXCLUDED.household_id,
          person_name = EXCLUDED.person_name,
          age = EXCLUDED.age,
          occupation = EXCLUDED.occupation;
      `;

      await client.query(sql, values);
      process.stdout.write(`\r  → Inserted ${i + chunk.length} / ${records.length} records`);
    }

    await client.query('COMMIT');
    console.log('\n✓ Finished inserting all records.');

    const res = await client.query('SELECT COUNT(*) FROM census_demo');
    console.log(`\n======================================================`);
    console.log(`🎉 SUCCESS: Verified ${res.rows[0].count} records in PostgreSQL table "census_demo"!`);
    console.log(`======================================================\n`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

async function main() {
  console.log(`======================================================`);
  console.log(`  UDPAD Rural Census Data Importer`);
  console.log(`======================================================`);

  const csvPath = findCsvFile();
  if (!csvPath) {
    console.error('❌ Could not locate rural_census_demo_data_10000.csv in the project root.');
    process.exit(1);
  }

  console.log(`Reading CSV file: ${path.basename(csvPath)}`);
  const records = await loadCsvRecords(csvPath);
  console.log(`Parsed ${records.length} valid records from CSV.\n`);

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
  const databaseUrl = process.env.DATABASE_URL;

  if (supabaseUrl && supabaseKey) {
    await importToSupabase(supabaseUrl, supabaseKey, records);
  } else if (databaseUrl) {
    await importToPostgres(databaseUrl, records);
  } else {
    console.log('ℹ️  No live Supabase credentials or DATABASE_URL found in .env.');
    console.log(`   Validated ${records.length} records from CSV successfully.`);
    console.log('\nTo import these records into Supabase:');
    console.log('1. Run server/db/census-schema.sql in your Supabase SQL Editor.');
    console.log('2. Add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file.');
    console.log('3. Run: npm run import:census\n');
  }
}

main().catch((err) => {
  console.error('\n❌ Import failed:', err);
  process.exit(1);
});
