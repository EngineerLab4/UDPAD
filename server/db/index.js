import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import { config } from '../config.js';
import { schemesData, createInitialCitizen, createInitialHousehold } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function mapSchemeRow(s) {
  if (!s) return null;
  return {
    id: s.id,
    code: s.code,
    name: s.name,
    category: s.category,
    department: s.department,
    benefitUnit: s.benefit_unit,
    benefitAmount: s.benefit_amount,
    shortDescription: s.short_description || '',
    fullDescription: s.full_description || '',
    intendedBeneficiary: s.intended_beneficiary || '',
    eligibilityCriteria: s.eligibility_criteria || [],
    requiredDocuments: s.required_documents || [],
    portal: s.portal || '',
    verificationStatus: s.verification_status || 'Verified',
    benefitUnitExplanation: s.benefit_unit_explanation || '',
    applicationStatus: s.application_status || 'Open',
    faq: s.faq || []
  };
}

const { Pool } = pg;

class DatabaseManager {
  constructor() {
    this.mode = 'in-memory'; // 'supabase' | 'postgres' | 'in-memory'
    this.supabase = null;
    this.pgPool = null;
    this.censusRecords = null;
    this.schemesCount = schemesData.length;
    this.cachedCensusStats = null;

    // In-memory collections (fallback & immediate out-of-the-box operation)
    this.store = {
      citizens: [],
      households: new Map(), // citizenId -> household object
      schemes: [...schemesData],
      applications: [],
      alerts: [],
      corrections: [],
      notifications: [],
      benefits: []
    };

    this.initPromise = this._doInit();
  }

  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }
    this.initPromise = this._doInit();
    return this.initPromise;
  }

  async ensureReady() {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  async _doInit() {
    // 1. Try Supabase
    const supabaseKey = config.supabase.serviceKey || config.supabase.anonKey;
    if (config.supabase.url && supabaseKey) {
      try {
        this.supabase = createClient(config.supabase.url, supabaseKey);
        // Real read query to verify connectivity and schema
        const { data, count, error } = await this.supabase
          .from('schemes')
          .select('id', { count: 'exact' })
          .limit(1);

        if (!error) {
          this.mode = 'supabase';
          this.schemesCount = count !== null && count !== undefined ? count : 25;
          console.log(`✓ Successfully connected to Supabase Database (${config.supabase.serviceKey ? 'Service Role active' : 'Anon key'}) at:`, config.supabase.url);
          return;
        } else {
          console.warn('Supabase credentials provided but test query returned error (tables might need migration):', error.message);
          console.log('Falling back to local in-memory storage until tables are created.');
        }
      } catch (err) {
        console.warn('Failed to initialize Supabase client:', err.message);
      }
    }

    // 2. Try PostgreSQL direct connection
    if (config.databaseUrl) {
      try {
        this.pgPool = new Pool({ connectionString: config.databaseUrl });
        const res = await this.pgPool.query('SELECT NOW()');
        if (res) {
          this.mode = 'postgres';
          console.log('✓ Successfully connected to PostgreSQL Database at:', config.databaseUrl);
          return;
        }
      } catch (err) {
        console.warn('PostgreSQL connection failed:', err.message);
      }
    }

    // 3. Fallback
    this.mode = 'in-memory';
    this.schemesCount = this.store.schemes.length;
    console.log('✓ Operating in local high-speed in-memory mode with 25 preloaded schemes.');
    console.log('  (Ready for Supabase/Postgres connection anytime via .env)');
  }

  getHealthStatus() {
    return {
      status: 'healthy',
      databaseMode: this.mode,
      supabaseConfigured: Boolean(config.supabase.url && (config.supabase.serviceKey || config.supabase.anonKey)),
      serviceRoleConfigured: Boolean(config.supabase.serviceKey),
      postgresConfigured: Boolean(config.databaseUrl),
      schemesCount: this.schemesCount,
      timestamp: new Date().toISOString()
    };
  }

  // --------------------------------------------------------------------------
  // CITIZENS / AUTH
  // --------------------------------------------------------------------------
  async getCitizenByMobileOrEmail(input) {
    await this.ensureReady();
    const cleanInput = (input || '').trim().toLowerCase();
    if (!cleanInput) return null;

    if (this.mode === 'supabase' && this.supabase) {
      let data = null;
      let error = null;

      const mobileRes = await this.supabase
        .from('citizens')
        .select('*')
        .eq('mobile', cleanInput)
        .order('created_at', { ascending: false })
        .limit(1);

      if (mobileRes.error) {
        error = mobileRes.error;
      } else if (mobileRes.data && mobileRes.data.length > 0) {
        data = mobileRes.data[0];
      }

      if (!data && !error) {
        const emailRes = await this.supabase
          .from('citizens')
          .select('*')
          .ilike('email', cleanInput)
          .order('created_at', { ascending: false })
          .limit(1);

        if (emailRes.error) {
          error = emailRes.error;
        } else if (emailRes.data && emailRes.data.length > 0) {
          data = emailRes.data[0];
        }
      }

      if (error) {
        throw new Error(`Supabase citizen lookup error: ${error.message}`);
      }

      if (data) {
        return {
          ...data,
          citizenId: data.citizen_id,
          fullName: data.full_name,
          password: data.password_hash,
          incomeCategory: data.income_category,
          annualIncome: data.annual_income,
          householdId: data.household_id
        };
      }
      return null;
    }

    return this.store.citizens.find(
      (c) =>
        c.mobile.toLowerCase() === cleanInput ||
        (c.email && c.email.toLowerCase() === cleanInput)
    ) || null;
  }

  async getCitizenById(id) {
    await this.ensureReady();
    if (!id) return null;

    if (this.mode === 'supabase' && this.supabase) {
      let { data, error } = await this.supabase
        .from('citizens')
        .select('*')
        .eq('citizen_id', id)
        .maybeSingle();

      if (!data && !error) {
        const res = await this.supabase
          .from('citizens')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        data = res.data;
        error = res.error;
      }

      if (error) {
        throw new Error(`Supabase citizen lookup error: ${error.message}`);
      }

      if (data) {
        return {
          ...data,
          citizenId: data.citizen_id,
          fullName: data.full_name,
          password: data.password_hash,
          incomeCategory: data.income_category,
          annualIncome: data.annual_income,
          householdId: data.household_id
        };
      }
      return null;
    }

    return this.store.citizens.find((c) => c.id === id || c.citizenId === id) || null;
  }

  async createCitizen(data) {
    await this.ensureReady();
    const newCitizen = createInitialCitizen(data);
    newCitizen.password = data.password;

    if (this.mode === 'supabase' && this.supabase) {
      const { data: inserted, error } = await this.supabase
        .from('citizens')
        .insert({
          id: newCitizen.id,
          citizen_id: newCitizen.citizenId,
          full_name: newCitizen.fullName,
          mobile: newCitizen.mobile,
          email: newCitizen.email,
          password_hash: newCitizen.password,
          gender: newCitizen.gender,
          occupation: newCitizen.occupation,
          income_category: newCitizen.incomeCategory,
          annual_income: newCitizen.annualIncome,
          household_id: newCitizen.householdId,
          address: newCitizen.address
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase create citizen error: ${error.message}`);
      }

      // Initialize household in Supabase
      const initialHh = createInitialHousehold(newCitizen);
      await this.supabase.from('households').insert({
        household_ref: initialHh.householdId,
        citizen_id: newCitizen.citizenId,
        head_of_household: initialHh.headOfHousehold,
        address: initialHh.address
      });

      const headMember = initialHh.members?.[0];
      if (headMember) {
        await this.supabase.from('household_members').insert({
          member_ref: headMember.id,
          household_ref: initialHh.householdId,
          full_name: headMember.fullName,
          relation: headMember.relation,
          citizen_id: headMember.citizenId,
          age: headMember.age,
          gender: headMember.gender,
          occupation: headMember.occupation,
          education: headMember.education,
          status: headMember.status,
          is_head: true,
          independent_benefits_allowed: true
        });
      }

      const primaryDwelling = initialHh.dwellings?.[0];
      if (primaryDwelling) {
        await this.supabase.from('household_dwellings').insert({
          dwelling_ref: primaryDwelling.dwellingId,
          household_ref: initialHh.householdId,
          dwelling_type: primaryDwelling.type,
          ownership: primaryDwelling.ownership,
          address: primaryDwelling.address,
          electricity_meter_no: primaryDwelling.electricityMeterNo,
          water_connection_no: primaryDwelling.waterConnectionNo
        });
      }

      return newCitizen;
    }

    // In-memory fallback
    this.store.citizens.push(newCitizen);
    const initialHh = createInitialHousehold(newCitizen);
    this.store.households.set(newCitizen.citizenId, initialHh);
    this.store.households.set(newCitizen.householdId, initialHh);
    return newCitizen;
  }

  // --------------------------------------------------------------------------
  // HOUSEHOLD & MEMBERS
  // --------------------------------------------------------------------------
  async getHousehold(citizen) {
    await this.ensureReady();
    if (!citizen) return null;

    if (this.mode === 'supabase' && this.supabase) {
      let { data: hh, error } = await this.supabase
        .from('households')
        .select('*, household_members(*), household_dwellings(*), membership_history(*)')
        .eq('citizen_id', citizen.citizenId)
        .maybeSingle();

      if (!hh && !error && citizen.householdId) {
        const res = await this.supabase
          .from('households')
          .select('*, household_members(*), household_dwellings(*), membership_history(*)')
          .eq('household_ref', citizen.householdId)
          .maybeSingle();
        hh = res.data;
        error = res.error;
      }

      if (error) {
        throw new Error(`Supabase getHousehold error: ${error.message}`);
      }

      if (hh) {
        return {
          householdId: hh.household_ref,
          headOfHousehold: hh.head_of_household,
          registrationDate: hh.registration_date,
          currentStatus: hh.current_status,
          dwellingReference: hh.dwelling_reference,
          rationCardRef: hh.ration_card_ref,
          incomeCategory: hh.income_category,
          annualHouseholdIncome: hh.annual_household_income,
          address: hh.address,
          verificationSource: hh.verification_source,
          lastUpdated: hh.last_updated,
          members: (hh.household_members || []).map((m) => ({
            id: m.member_ref,
            fullName: m.full_name,
            relation: m.relation,
            citizenId: m.citizen_id,
            age: m.age,
            gender: m.gender,
            occupation: m.occupation,
            education: m.education,
            status: m.status,
            memberSince: m.member_since,
            isHead: m.is_head,
            independentBenefitsAllowed: m.independent_benefits_allowed
          })),
          dwellings: (hh.household_dwellings || []).map((d) => ({
            dwellingId: d.dwelling_ref,
            type: d.dwelling_type,
            ownership: d.ownership,
            address: d.address,
            electricityMeterNo: d.electricity_meter_no,
            waterConnectionNo: d.water_connection_no
          })),
          membershipHistory: (hh.membership_history || []).map((h) => ({
            id: h.event_ref,
            date: h.event_date,
            event: h.event,
            type: h.type,
            description: h.description,
            authority: h.authority,
            referenceNo: h.reference_no
          }))
        };
      }

      // If no household exists in Supabase yet, create one
      const initialHh = createInitialHousehold(citizen);
      await this.supabase.from('households').insert({
        household_ref: initialHh.householdId,
        citizen_id: citizen.citizenId,
        head_of_household: initialHh.headOfHousehold,
        address: initialHh.address
      });
      return initialHh;
    }

    // In-memory
    let hh = this.store.households.get(citizen.citizenId) || this.store.households.get(citizen.householdId);
    if (!hh) {
      hh = createInitialHousehold(citizen);
      this.store.households.set(citizen.citizenId, hh);
      this.store.households.set(citizen.householdId, hh);
    }
    return hh;
  }

  async addHouseholdMember(citizen, memberData) {
    await this.ensureReady();
    const hh = await this.getHousehold(citizen);
    if (!hh) throw new Error('Household not found');

    const newMember = {
      id: `MEM-${Math.floor(10 + Math.random() * 90)}`,
      fullName: memberData.fullName,
      relation: memberData.relation,
      citizenId: memberData.citizenId || `CIT-${Math.floor(100000 + Math.random() * 900000)}-IN`,
      age: parseInt(memberData.age, 10) || 18,
      gender: memberData.gender || 'Not Specified',
      occupation: memberData.occupation || 'Dependent',
      education: memberData.education || 'Secondary',
      status: memberData.status || 'Current Resident',
      memberSince: new Date().toISOString().split('T')[0],
      isHead: false,
      independentBenefitsAllowed: true
    };

    const newEvent = {
      id: `EVT-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      event: `Member Added (${newMember.fullName} - ${newMember.relation})`,
      type: 'Registration',
      description: `Added ${newMember.fullName} (${newMember.relation}) to household registry.`,
      authority: 'Citizen Portal Self-Service',
      referenceNo: `ADD-${Date.now()}`
    };

    if (this.mode === 'supabase' && this.supabase) {
      const { error: memErr } = await this.supabase.from('household_members').insert({
        member_ref: newMember.id,
        household_ref: hh.householdId,
        full_name: newMember.fullName,
        relation: newMember.relation,
        citizen_id: newMember.citizenId,
        age: newMember.age,
        gender: newMember.gender,
        occupation: newMember.occupation,
        education: newMember.education,
        status: newMember.status,
        is_head: false,
        independent_benefits_allowed: true
      });
      if (memErr) throw new Error(`Supabase addHouseholdMember error: ${memErr.message}`);

      const { error: evtErr } = await this.supabase.from('membership_history').insert({
        event_ref: newEvent.id,
        household_ref: hh.householdId,
        event: newEvent.event,
        type: newEvent.type,
        description: newEvent.description,
        authority: newEvent.authority,
        reference_no: newEvent.referenceNo
      });
      if (evtErr) throw new Error(`Supabase add membership history error: ${evtErr.message}`);

      return await this.getHousehold(citizen);
    }

    hh.members = [...(hh.members || []), newMember];
    hh.membershipHistory = [newEvent, ...(hh.membershipHistory || [])];
    hh.lastUpdated = new Date().toISOString().split('T')[0];

    this.store.households.set(citizen.citizenId, hh);
    this.store.households.set(hh.householdId, hh);
    return hh;
  }

  async addHouseholdDwelling(citizen, dwellingData) {
    await this.ensureReady();
    const hh = await this.getHousehold(citizen);
    if (!hh) throw new Error('Household not found');

    const newDwelling = {
      dwellingId: `DWL-${Math.floor(1000 + Math.random() * 9000)}`,
      type: dwellingData.type || 'Secondary Residence',
      ownership: dwellingData.ownership || 'Resident / Owner',
      address: dwellingData.address,
      electricityMeterNo: dwellingData.electricityMeterNo || 'N/A',
      waterConnectionNo: dwellingData.waterConnectionNo || 'N/A'
    };

    if (this.mode === 'supabase' && this.supabase) {
      const { error: dwlErr } = await this.supabase.from('household_dwellings').insert({
        dwelling_ref: newDwelling.dwellingId,
        household_ref: hh.householdId,
        dwelling_type: newDwelling.type,
        ownership: newDwelling.ownership,
        address: newDwelling.address,
        electricity_meter_no: newDwelling.electricityMeterNo,
        water_connection_no: newDwelling.waterConnectionNo
      });
      if (dwlErr) throw new Error(`Supabase addHouseholdDwelling error: ${dwlErr.message}`);

      return await this.getHousehold(citizen);
    }

    hh.dwellings = [...(hh.dwellings || []), newDwelling];
    hh.lastUpdated = new Date().toISOString().split('T')[0];

    this.store.households.set(citizen.citizenId, hh);
    this.store.households.set(hh.householdId, hh);
    return hh;
  }

  // --------------------------------------------------------------------------
  // SCHEMES DIRECTORY
  // --------------------------------------------------------------------------
  async getSchemes(filters = {}) {
    await this.ensureReady();

    if (this.mode === 'supabase' && this.supabase) {
      let query = this.supabase
        .from('schemes')
        .select('*')
        .order('id', { ascending: true });

      if (filters.category && filters.category !== 'All') {
        query = query.ilike('category', filters.category);
      }

      if (filters.unit && filters.unit !== 'All') {
        query = query.ilike('benefit_unit', filters.unit);
      }

      const { data, error } = await query;
      if (error) {
        throw new Error(`Supabase query schemes error: ${error.message}`);
      }

      let list = (data || []).map(mapSchemeRow);

      if (filters.query) {
        const q = filters.query.toLowerCase();
        list = list.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.department.toLowerCase().includes(q) ||
            s.code.toLowerCase().includes(q) ||
            (s.shortDescription && s.shortDescription.toLowerCase().includes(q))
        );
      }

      return list;
    }

    let list = this.store.schemes;

    if (filters.category && filters.category !== 'All') {
      list = list.filter((s) => s.category.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.unit && filters.unit !== 'All') {
      list = list.filter((s) => s.benefitUnit.toLowerCase() === filters.unit.toLowerCase());
    }

    if (filters.query) {
      const q = filters.query.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.shortDescription.toLowerCase().includes(q)
      );
    }

    return list;
  }

  async getSchemeById(id) {
    await this.ensureReady();
    if (!id) return null;

    if (this.mode === 'supabase' && this.supabase) {
      let { data, error } = await this.supabase
        .from('schemes')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!data && !error) {
        const res = await this.supabase
          .from('schemes')
          .select('*')
          .eq('code', id)
          .maybeSingle();
        data = res.data;
        error = res.error;
      }

      if (error) {
        throw new Error(`Supabase query scheme details error: ${error.message}`);
      }

      return data ? mapSchemeRow(data) : null;
    }

    return this.store.schemes.find((s) => s.id === id || s.code === id) || null;
  }

  // --------------------------------------------------------------------------
  // APPLICATIONS
  // --------------------------------------------------------------------------
  async getApplications(citizenId) {
    await this.ensureReady();
    if (!citizenId) return [];

    if (this.mode === 'supabase' && this.supabase) {
      const { data, error } = await this.supabase
        .from('applications')
        .select('*')
        .eq('citizen_id', citizenId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Supabase getApplications error: ${error.message}`);
      }

      return (data || []).map((a) => ({
        id: a.id,
        schemeId: a.scheme_id,
        schemeName: a.scheme_name,
        department: a.department,
        category: a.category,
        benefitUnit: a.benefit_unit,
        targetBeneficiaryName: a.target_beneficiary_name,
        householdRef: a.household_ref,
        dwellingRef: a.dwelling_ref,
        appliedDate: a.applied_date,
        lastUpdated: a.last_updated,
        status: a.status,
        statusNote: a.status_note,
        hasActiveAlert: a.has_active_alert,
        alertId: a.alert_id,
        timeline: a.timeline || [],
        documentsUploaded: a.documents_uploaded || []
      }));
    }

    return this.store.applications.filter((a) => a.citizenId === citizenId);
  }

  async getAllApplications() {
    await this.ensureReady();

    if (this.mode === 'supabase' && this.supabase) {
      const { data, error } = await this.supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Supabase getAllApplications error: ${error.message}`);
      }

      return (data || []).map((a) => ({
        id: a.id,
        citizenId: a.citizen_id,
        schemeId: a.scheme_id,
        schemeName: a.scheme_name,
        department: a.department,
        category: a.category,
        benefitUnit: a.benefit_unit,
        targetBeneficiaryName: a.target_beneficiary_name,
        householdRef: a.household_ref,
        dwellingRef: a.dwelling_ref,
        appliedDate: a.applied_date,
        lastUpdated: a.last_updated,
        status: a.status,
        statusNote: a.status_note,
        hasActiveAlert: a.has_active_alert,
        alertId: a.alert_id,
        timeline: a.timeline || [],
        documentsUploaded: a.documents_uploaded || []
      }));
    }

    return this.store.applications;
  }

  async updateApplicationStatus(id, { status, statusNote, officerName }) {
    await this.ensureReady();
    const today = new Date().toISOString().split('T')[0];

    const currentApp = await this.getApplicationById(id);
    if (!currentApp) return null;

    const newTimelineItem = {
      title: `Official Status Update: ${status}`,
      date: today,
      officer: officerName || 'Zonal Field Verification Officer',
      detail: statusNote || `Application marked as ${status} following official administrative review.`
    };

    const updatedTimeline = [newTimelineItem, ...(currentApp.timeline || [])];

    if (this.mode === 'supabase' && this.supabase) {
      const { data, error } = await this.supabase
        .from('applications')
        .update({
          status,
          status_note: statusNote || currentApp.statusNote,
          last_updated: today,
          timeline: updatedTimeline
        })
        .eq('id', id)
        .select('*')
        .maybeSingle();

      if (error) {
        throw new Error(`Supabase updateApplicationStatus error: ${error.message}`);
      }
      return data;
    }

    currentApp.status = status;
    currentApp.statusNote = statusNote || currentApp.statusNote;
    currentApp.lastUpdated = today;
    currentApp.timeline = updatedTimeline;
    return currentApp;
  }

  async getApplicationById(id) {
    await this.ensureReady();
    if (!id) return null;

    if (this.mode === 'supabase' && this.supabase) {
      const { data, error } = await this.supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw new Error(`Supabase getApplicationById error: ${error.message}`);
      }

      if (data) {
        return {
          id: data.id,
          citizenId: data.citizen_id,
          schemeId: data.scheme_id,
          schemeName: data.scheme_name,
          department: data.department,
          category: data.category,
          benefitUnit: data.benefit_unit,
          targetBeneficiaryName: data.target_beneficiary_name,
          householdRef: data.household_ref,
          dwellingRef: data.dwelling_ref,
          appliedDate: data.applied_date,
          lastUpdated: data.last_updated,
          status: data.status,
          statusNote: data.status_note,
          hasActiveAlert: data.has_active_alert,
          alertId: data.alert_id,
          timeline: data.timeline || [],
          documentsUploaded: data.documents_uploaded || []
        };
      }
      return null;
    }

    return this.store.applications.find((a) => a.id === id) || null;
  }

  async createApplication(citizen, formData) {
    await this.ensureReady();
    const appRef = `APP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const today = new Date().toISOString().split('T')[0];

    const scheme = formData.schemeId ? await this.getSchemeById(formData.schemeId) : null;

    const newApp = {
      id: appRef,
      citizenId: citizen?.citizenId || 'CIT-GUEST',
      schemeId: formData.schemeId,
      schemeName: formData.schemeName || scheme?.name || 'Government Scheme',
      department: formData.department || scheme?.department || 'Government of India',
      category: formData.category || scheme?.category || 'General Welfare',
      benefitUnit: formData.benefitUnit || scheme?.benefitUnit || 'Individual',
      targetBeneficiaryName: formData.beneficiaryName || citizen?.fullName || 'Self',
      householdRef: formData.householdRef || citizen?.householdId || 'HH-CURRENT',
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

    if (this.mode === 'supabase' && this.supabase) {
      const { error } = await this.supabase.from('applications').insert({
        id: newApp.id,
        citizen_id: newApp.citizenId,
        scheme_id: newApp.schemeId,
        scheme_name: newApp.schemeName,
        department: newApp.department,
        category: newApp.category,
        benefit_unit: newApp.benefitUnit,
        target_beneficiary_name: newApp.targetBeneficiaryName,
        household_ref: newApp.householdRef,
        dwelling_ref: newApp.dwellingRef,
        applied_date: newApp.appliedDate,
        last_updated: newApp.lastUpdated,
        status: newApp.status,
        status_note: newApp.statusNote,
        has_active_alert: false,
        timeline: newApp.timeline,
        documents_uploaded: newApp.documentsUploaded
      });

      if (error) {
        throw new Error(`Supabase createApplication error: ${error.message}`);
      }

      await this.addNotification(citizen?.citizenId, {
        title: 'Application Successfully Submitted',
        message: `Your application ${appRef} for "${formData.schemeName}" has been received and queued for review.`,
        category: 'Application Update',
        type: 'info',
        link: '/applications'
      });

      return newApp;
    }

    this.store.applications.unshift(newApp);

    await this.addNotification(citizen?.citizenId, {
      title: 'Application Successfully Submitted',
      message: `Your application ${appRef} for "${formData.schemeName}" has been received and queued for review.`,
      category: 'Application Update',
      type: 'info',
      link: '/applications'
    });

    return newApp;
  }

  // --------------------------------------------------------------------------
  // ALERTS & DEDUPLICATION
  // --------------------------------------------------------------------------
  async getAlerts(citizenId) {
    await this.ensureReady();
    if (!citizenId) return [];

    if (this.mode === 'supabase' && this.supabase) {
      const { data, error } = await this.supabase
        .from('verification_alerts')
        .select('*')
        .eq('citizen_id', citizenId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Supabase getAlerts error: ${error.message}`);
      }

      return (data || []).map((a) => ({
        id: a.id,
        applicationId: a.application_id,
        citizenId: a.citizen_id,
        schemeId: a.scheme_id,
        alertType: a.alert_type,
        severity: a.severity,
        title: a.title,
        message: a.message,
        details: a.details || {},
        suggestedActions: a.suggested_actions || []
      }));
    }

    return this.store.alerts.filter((a) => a.citizenId === citizenId);
  }

  async getAllAlerts() {
    await this.ensureReady();

    if (this.mode === 'supabase' && this.supabase) {
      const { data, error } = await this.supabase
        .from('verification_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Supabase getAllAlerts error: ${error.message}`);
      }

      return (data || []).map((a) => ({
        id: a.id,
        applicationId: a.application_id,
        citizenId: a.citizen_id,
        schemeId: a.scheme_id,
        alertType: a.alert_type,
        severity: a.severity,
        title: a.title,
        message: a.message,
        details: a.details || {},
        suggestedActions: a.suggested_actions || []
      }));
    }

    return this.store.alerts;
  }

  async updateAlertStatus(id, { status, resolutionNote }) {
    await this.ensureReady();

    if (this.mode === 'supabase' && this.supabase) {
      const { data, error } = await this.supabase
        .from('verification_alerts')
        .update({
          details: { status, resolutionNote, resolvedAt: new Date().toISOString() }
        })
        .eq('id', id)
        .select('*')
        .maybeSingle();

      if (error) {
        throw new Error(`Supabase updateAlertStatus error: ${error.message}`);
      }
      return data;
    }

    const alert = this.store.alerts.find((a) => a.id === id);
    if (alert) {
      alert.details = { ...(alert.details || {}), status, resolutionNote };
    }
    return alert;
  }

  async getAlertById(id) {
    await this.ensureReady();
    if (!id) return null;

    if (this.mode === 'supabase' && this.supabase) {
      const { data, error } = await this.supabase
        .from('verification_alerts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw new Error(`Supabase getAlertById error: ${error.message}`);
      }

      if (data) {
        return {
          id: data.id,
          applicationId: data.application_id,
          citizenId: data.citizen_id,
          schemeId: data.scheme_id,
          alertType: data.alert_type,
          severity: data.severity,
          title: data.title,
          message: data.message,
          details: data.details || {},
          suggestedActions: data.suggested_actions || []
        };
      }
      return null;
    }

    return this.store.alerts.find((a) => a.id === id) || null;
  }

  async createAlert(alertData) {
    await this.ensureReady();
    const alertId = `ALT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const newAlert = {
      id: alertId,
      applicationId: alertData.applicationId,
      citizenId: alertData.citizenId,
      schemeId: alertData.schemeId,
      alertType: alertData.alertType || 'DUPLICATE_SUSPICION',
      severity: alertData.severity || 'warning',
      title: alertData.title,
      message: alertData.message,
      details: alertData.details || {},
      suggestedActions: alertData.suggestedActions || []
    };

    if (this.mode === 'supabase' && this.supabase) {
      const { error } = await this.supabase.from('verification_alerts').insert({
        id: newAlert.id,
        application_id: newAlert.applicationId,
        citizen_id: newAlert.citizenId,
        scheme_id: newAlert.schemeId,
        alert_type: newAlert.alertType,
        severity: newAlert.severity,
        title: newAlert.title,
        message: newAlert.message,
        details: newAlert.details,
        suggested_actions: newAlert.suggestedActions
      });

      if (error) {
        throw new Error(`Supabase createAlert error: ${error.message}`);
      }

      return newAlert;
    }

    this.store.alerts.unshift(newAlert);
    return newAlert;
  }

  // --------------------------------------------------------------------------
  // CORRECTIONS & APPEALS
  // --------------------------------------------------------------------------
  async getCorrections(citizenId) {
    await this.ensureReady();
    if (!citizenId) return [];

    if (this.mode === 'supabase' && this.supabase) {
      const { data, error } = await this.supabase
        .from('corrections')
        .select('*')
        .eq('citizen_id', citizenId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Supabase getCorrections error: ${error.message}`);
      }

      return (data || []).map((c) => ({
        id: c.id,
        citizenId: c.citizen_id,
        alertId: c.alert_id,
        applicationId: c.application_id,
        recordType: c.record_type,
        schemeName: c.scheme_name,
        reasonCategory: c.reason_category,
        citizenStatement: c.citizen_statement,
        supportingEvidence: c.supporting_evidence || [],
        submissionDate: c.submission_date,
        status: c.status,
        assignedAuthority: c.assigned_authority,
        resolutionExpectation: c.resolution_expectation,
        timeline: c.timeline || []
      }));
    }

    return this.store.corrections.filter((c) => c.citizenId === citizenId);
  }

  async getAllCorrections() {
    await this.ensureReady();

    if (this.mode === 'supabase' && this.supabase) {
      const { data, error } = await this.supabase
        .from('corrections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Supabase getAllCorrections error: ${error.message}`);
      }

      return (data || []).map((c) => ({
        id: c.id,
        citizenId: c.citizen_id,
        alertId: c.alert_id,
        applicationId: c.application_id,
        recordType: c.record_type,
        schemeName: c.scheme_name,
        reasonCategory: c.reason_category,
        citizenStatement: c.citizen_statement,
        supportingEvidence: c.supporting_evidence || [],
        submissionDate: c.submission_date,
        status: c.status,
        assignedAuthority: c.assigned_authority,
        resolutionExpectation: c.resolution_expectation,
        timeline: c.timeline || []
      }));
    }

    return this.store.corrections;
  }

  async updateCorrectionStatus(id, { status, officerRemarks, officerName }) {
    await this.ensureReady();
    const today = new Date().toISOString().split('T')[0];

    const currentCorr = (this.mode === 'supabase' && this.supabase)
      ? (await this.supabase.from('corrections').select('*').eq('id', id).maybeSingle()).data
      : this.store.corrections.find((c) => c.id === id);

    if (!currentCorr) return null;

    const newTimelineItem = {
      event: `Official Adjudication: ${status}`,
      date: today,
      officer: officerName || 'Zonal Public Grievance Officer',
      detail: officerRemarks || `Clarification dossier adjudicated as ${status}.`
    };

    const updatedTimeline = [newTimelineItem, ...(currentCorr.timeline || [])];

    if (this.mode === 'supabase' && this.supabase) {
      const { data, error } = await this.supabase
        .from('corrections')
        .update({
          status,
          timeline: updatedTimeline
        })
        .eq('id', id)
        .select('*')
        .maybeSingle();

      if (error) {
        throw new Error(`Supabase updateCorrectionStatus error: ${error.message}`);
      }
      return data;
    }

    currentCorr.status = status;
    currentCorr.timeline = updatedTimeline;
    return currentCorr;
  }

  async createCorrection(citizen, data) {
    await this.ensureReady();
    const corrRef = `CORR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newCorrection = {
      id: corrRef,
      citizenId: citizen?.citizenId || 'CIT-GUEST',
      alertId: data.alertId || null,
      applicationId: data.applicationId || 'General Inquiry',
      recordType: data.recordType || 'Verification Clarification',
      schemeName: data.schemeName || 'Citizen Welfare Grievance',
      reasonCategory: data.reasonCategory,
      citizenStatement: data.citizenStatement,
      supportingEvidence: data.supportingEvidence || ['Citizen_Clarification_Document.pdf'],
      submissionDate: nowStr,
      status: 'Submitted',
      assignedAuthority: 'Zonal Public Grievance Officer',
      resolutionExpectation: 'Standard review timeline: 7 to 14 business days.',
      timeline: [
        {
          date: nowStr,
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

    if (this.mode === 'supabase' && this.supabase) {
      const { error } = await this.supabase.from('corrections').insert({
        id: newCorrection.id,
        citizen_id: newCorrection.citizenId,
        alert_id: newCorrection.alertId,
        application_id: newCorrection.applicationId,
        record_type: newCorrection.recordType,
        scheme_name: newCorrection.schemeName,
        reason_category: newCorrection.reasonCategory,
        citizen_statement: newCorrection.citizenStatement,
        supporting_evidence: newCorrection.supportingEvidence,
        submission_date: newCorrection.submissionDate,
        status: newCorrection.status,
        assigned_authority: newCorrection.assignedAuthority,
        resolution_expectation: newCorrection.resolutionExpectation,
        timeline: newCorrection.timeline
      });

      if (error) {
        throw new Error(`Supabase createCorrection error: ${error.message}`);
      }

      await this.addNotification(citizen?.citizenId, {
        title: 'Correction Request Lodged',
        message: `Clarification request ${corrRef} submitted for official review.`,
        category: 'Correction / Appeal',
        type: 'info',
        link: '/corrections'
      });

      return newCorrection;
    }

    this.store.corrections.unshift(newCorrection);

    await this.addNotification(citizen?.citizenId, {
      title: 'Correction Request Lodged',
      message: `Clarification request ${corrRef} submitted for official review.`,
      category: 'Correction / Appeal',
      type: 'info',
      link: '/corrections'
    });

    return newCorrection;
  }

  // --------------------------------------------------------------------------
  // NOTIFICATIONS
  // --------------------------------------------------------------------------
  async getNotifications(citizenId) {
    await this.ensureReady();
    if (!citizenId) return [];

    if (this.mode === 'supabase' && this.supabase) {
      const { data, error } = await this.supabase
        .from('notifications')
        .select('*')
        .eq('citizen_id', citizenId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Supabase getNotifications error: ${error.message}`);
      }

      return (data || []).map((n) => ({
        id: n.id,
        citizenId: n.citizen_id,
        title: n.title,
        message: n.message,
        category: n.category,
        type: n.type,
        read: n.read,
        link: n.link
      }));
    }

    return this.store.notifications.filter((n) => n.citizenId === citizenId);
  }

  async markNotificationRead(id, citizenId) {
    await this.ensureReady();
    if (!id) return null;

    if (this.mode === 'supabase' && this.supabase) {
      let query = this.supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (citizenId) {
        query = query.eq('citizen_id', citizenId);
      }

      const { data, error } = await query.select();
      if (error) {
        throw new Error(`Supabase markNotificationRead error: ${error.message}`);
      }

      if (data && data.length > 0) {
        return await this.getNotifications(citizenId);
      }
      return null;
    }

    const notif = this.store.notifications.find((n) => n.id === id);
    if (!notif || (citizenId && notif.citizenId !== citizenId)) {
      return null;
    }
    notif.read = true;
    return citizenId ? this.store.notifications.filter((n) => n.citizenId === citizenId) : this.store.notifications;
  }

  async markAllNotificationsRead(citizenId) {
    await this.ensureReady();
    if (this.mode === 'supabase' && this.supabase) {
      let query = this.supabase
        .from('notifications')
        .update({ read: true });

      if (citizenId) {
        query = query.eq('citizen_id', citizenId);
      }

      const { error } = await query;
      if (error) {
        throw new Error(`Supabase markAllNotificationsRead error: ${error.message}`);
      }

      return await this.getNotifications(citizenId);
    }

    this.store.notifications.forEach((n) => {
      if (!citizenId || n.citizenId === citizenId) {
        n.read = true;
      }
    });
    return citizenId ? this.store.notifications.filter((n) => n.citizenId === citizenId) : this.store.notifications;
  }

  async addNotification(citizenId, notif) {
    await this.ensureReady();
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      citizenId: citizenId || 'CIT-GUEST',
      title: notif.title,
      message: notif.message,
      category: notif.category || 'General Notice',
      type: notif.type || 'info',
      timestamp: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      read: false,
      link: notif.link || '/dashboard'
    };

    if (this.mode === 'supabase' && this.supabase && citizenId) {
      const { error } = await this.supabase.from('notifications').insert({
        id: newNotif.id,
        citizen_id: citizenId,
        title: newNotif.title,
        message: newNotif.message,
        category: newNotif.category,
        type: newNotif.type,
        read: false,
        link: newNotif.link
      });

      if (error) {
        throw new Error(`Supabase addNotification error: ${error.message}`);
      }
      return newNotif;
    }

    this.store.notifications.unshift(newNotif);
    return newNotif;
  }

  // --------------------------------------------------------------------------
  // BENEFITS LEDGER
  // --------------------------------------------------------------------------
  async getBenefits(citizenId) {
    await this.ensureReady();
    if (!citizenId) return [];

    if (this.mode === 'supabase' && this.supabase) {
      const { data, error } = await this.supabase
        .from('benefits_ledger')
        .select('*')
        .eq('citizen_id', citizenId)
        .order('grant_date', { ascending: false });

      if (error) {
        throw new Error(`Supabase getBenefits error: ${error.message}`);
      }

      return (data || []).map((b) => ({
        id: b.id,
        citizenId: b.citizen_id,
        householdRef: b.household_ref,
        benefitName: b.benefit_name,
        schemeCode: b.scheme_code,
        benefitUnit: b.benefit_unit,
        recipientName: b.recipient_name,
        grantDate: b.grant_date,
        amountOrItem: b.amount_or_item,
        deliveringAgency: b.delivering_agency,
        status: b.status
      }));
    }

    return this.store.benefits.filter((b) => b.citizenId === citizenId);
  }

  async addBenefit(citizenId, benefitData) {
    await this.ensureReady();
    const benefitId = `BEN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toISOString().split('T')[0];

    const newBenefit = {
      id: benefitId,
      citizenId,
      householdRef: benefitData.householdRef || null,
      benefitName: benefitData.benefitName,
      schemeCode: benefitData.schemeCode,
      benefitUnit: benefitData.benefitUnit || 'Individual',
      recipientName: benefitData.recipientName || 'Citizen Beneficiary',
      grantDate: benefitData.grantDate || today,
      amountOrItem: benefitData.amountOrItem,
      deliveringAgency: benefitData.deliveringAgency || 'Department of Social Welfare',
      status: benefitData.status || 'Disbursed'
    };

    if (this.mode === 'supabase' && this.supabase && citizenId) {
      const { error } = await this.supabase.from('benefits_ledger').insert({
        id: newBenefit.id,
        citizen_id: newBenefit.citizenId,
        household_ref: newBenefit.householdRef,
        benefit_name: newBenefit.benefitName,
        scheme_code: newBenefit.schemeCode,
        benefit_unit: newBenefit.benefitUnit,
        recipient_name: newBenefit.recipientName,
        grant_date: newBenefit.grantDate,
        amount_or_item: newBenefit.amountOrItem,
        delivering_agency: newBenefit.deliveringAgency,
        status: newBenefit.status
      });

      if (error) {
        throw new Error(`Supabase addBenefit error: ${error.message}`);
      }

      return newBenefit;
    }

    this.store.benefits.unshift(newBenefit);
    return newBenefit;
  }

  // --------------------------------------------------------------------------
  // CENSUS DEMO DATASET (10,000 Records)
  // --------------------------------------------------------------------------
  async loadCensusDataFromCsv() {
    if (this.censusRecords && this.censusRecords.length > 0) {
      return this.censusRecords;
    }

    const csvCandidates = [
      path.resolve(process.cwd(), 'rural_census_demo_data_10000.csv'),
      path.resolve(process.cwd(), 'rural_census_demo_data_10000 (1).csv'),
      path.resolve(__dirname, '../../rural_census_demo_data_10000.csv'),
      path.resolve(__dirname, '../../rural_census_demo_data_10000 (1).csv')
    ];

    let foundPath = null;
    for (const p of csvCandidates) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (!foundPath) {
      console.warn('Census CSV file not found on disk.');
      this.censusRecords = [];
      return [];
    }

    try {
      const content = fs.readFileSync(foundPath, 'utf-8');
      const lines = content.split(/\r?\n/);
      if (lines.length <= 1) {
        this.censusRecords = [];
        return [];
      }

      const headers = parseCsvLine(lines[0]);
      const records = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        const vals = parseCsvLine(line);
        const row = {};
        for (let j = 0; j < headers.length; j++) {
          row[headers[j]] = vals[j] !== undefined ? vals[j] : '';
        }

        records.push({
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
        });
      }

      this.censusRecords = records;
      return records;
    } catch (err) {
      console.error('Error reading census CSV:', err.message);
      this.censusRecords = [];
      return [];
    }
  }

  async getCensusRecords({ page = 1, limit = 20, district, tehsil, village, gender, socialCategory, search } = {}) {
    await this.ensureReady();
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    // Try Supabase first if active
    if (this.mode === 'supabase' && this.supabase) {
      let queryBuilder = this.supabase
        .from('census_demo')
        .select('*', { count: 'exact' });

      if (district) queryBuilder = queryBuilder.ilike('district', `%${district}%`);
      if (tehsil) queryBuilder = queryBuilder.ilike('tehsil_block', `%${tehsil}%`);
      if (village) queryBuilder = queryBuilder.ilike('village_name', `%${village}%`);
      if (gender) queryBuilder = queryBuilder.eq('gender', gender);
      if (socialCategory) queryBuilder = queryBuilder.eq('social_category', socialCategory);
      if (search) {
        queryBuilder = queryBuilder.or(`person_name.ilike.%${search}%,person_id.ilike.%${search}%,household_id.ilike.%${search}%,village_name.ilike.%${search}%`);
      }

      const offset = (pageNum - 1) * limitNum;
      const { data, count, error } = await queryBuilder
        .order('person_id', { ascending: true })
        .range(offset, offset + limitNum - 1);

      if (error) {
        throw new Error(`Supabase census query failed: ${error.message}`);
      }

      const totalRecords = count !== null && count !== undefined ? count : (data || []).length;
      const totalPages = Math.ceil(totalRecords / limitNum);
      return {
        source: 'supabase',
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalRecords,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        filters: { district, tehsil, village, gender, socialCategory, search },
        records: data || []
      };
    }

    // In-Memory Fallback from CSV
    const allRecords = await this.loadCensusDataFromCsv();
    let filtered = allRecords;

    if (district) {
      const q = district.toLowerCase();
      filtered = filtered.filter(r => (r.district || '').toLowerCase().includes(q));
    }
    if (tehsil) {
      const q = tehsil.toLowerCase();
      filtered = filtered.filter(r => (r.tehsil_block || '').toLowerCase().includes(q));
    }
    if (village) {
      const q = village.toLowerCase();
      filtered = filtered.filter(r => (r.village_name || '').toLowerCase().includes(q));
    }
    if (gender) {
      const q = gender.toLowerCase();
      filtered = filtered.filter(r => (r.gender || '').toLowerCase() === q);
    }
    if (socialCategory) {
      const q = socialCategory.toLowerCase();
      filtered = filtered.filter(r => (r.social_category || '').toLowerCase() === q);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(r =>
        (r.person_name || '').toLowerCase().includes(q) ||
        (r.person_id || '').toLowerCase().includes(q) ||
        (r.household_id || '').toLowerCase().includes(q) ||
        (r.village_name || '').toLowerCase().includes(q)
      );
    }

    const totalRecords = filtered.length;
    const totalPages = Math.ceil(totalRecords / limitNum);
    const offset = (pageNum - 1) * limitNum;
    const records = filtered.slice(offset, offset + limitNum);

    return {
      source: 'in-memory-csv',
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      filters: { district, tehsil, village, gender, socialCategory, search },
      records
    };
  }

  async getCensusPersonById(personId) {
    await this.ensureReady();
    if (!personId) return null;
    const cleanId = personId.trim().toUpperCase();

    if (this.mode === 'supabase' && this.supabase) {
      const { data, error } = await this.supabase
        .from('census_demo')
        .select('*')
        .eq('person_id', cleanId)
        .maybeSingle();

      if (error) {
        throw new Error(`Supabase getCensusPersonById error: ${error.message}`);
      }

      return data ? { source: 'supabase', record: data } : null;
    }

    const allRecords = await this.loadCensusDataFromCsv();
    const record = allRecords.find(r => (r.person_id || '').toUpperCase() === cleanId);
    return record ? { source: 'in-memory-csv', record } : null;
  }

  async getCensusStats() {
    await this.ensureReady();
    if (this.cachedCensusStats) {
      return this.cachedCensusStats;
    }

    const allRecords = await this.loadCensusDataFromCsv();
    const totalRecords = allRecords.length;

    const districtsMap = new Map();
    const genderMap = {};
    const socialCategoryMap = {};
    let literateCount = 0;
    const householdSet = new Set();

    for (const r of allRecords) {
      householdSet.add(r.household_id);
      districtsMap.set(r.district, (districtsMap.get(r.district) || 0) + 1);
      genderMap[r.gender] = (genderMap[r.gender] || 0) + 1;
      socialCategoryMap[r.social_category] = (socialCategoryMap[r.social_category] || 0) + 1;
      if (r.literate === 'Yes') literateCount++;
    }

    this.cachedCensusStats = {
      totalRecords,
      totalHouseholds: householdSet.size,
      literacyRate: totalRecords ? ((literateCount / totalRecords) * 100).toFixed(1) + '%' : '0%',
      districts: Array.from(districtsMap.entries()).map(([district, count]) => ({ district, count })),
      genderBreakdown: genderMap,
      socialCategoryBreakdown: socialCategoryMap
    };

    return this.cachedCensusStats;
  }
}

export const db = new DatabaseManager();
