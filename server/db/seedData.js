import { schemesData } from '../../src/data/schemes.js';

export { schemesData };

export const createInitialCitizen = (data = {}) => {
  const citizenId = `CIT-${Math.floor(100000 + Math.random() * 900000)}-IN`;
  const householdId = `HH-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const today = new Date().toISOString().split('T')[0];

  return {
    id: `usr_${Date.now()}`,
    citizenId,
    fullName: data.fullName || 'Registered Citizen',
    mobile: data.mobile || '',
    email: data.email || '',
    gender: data.gender || 'Not Specified',
    occupation: data.occupation || 'Citizen',
    incomeCategory: data.incomeCategory || 'Standard Income Category',
    annualIncome: data.annualIncome || 'Self-Declared',
    householdId,
    address: data.address || {
      dwellingType: 'Residential',
      addressLine1: data.addressLine1 || 'Residential Address',
      addressLine2: data.addressLine2 || '',
      district: data.district || '',
      state: data.state || '',
      pincode: data.pincode || ''
    },
    createdDate: today,
    lastVerifiedDate: today,
    registrySource: 'Citizen Self-Registration'
  };
};

export const createInitialHousehold = (citizen) => {
  const citizenName = citizen?.fullName || 'Registered Citizen';
  const citizenId = citizen?.citizenId || `CIT-${Math.floor(100000 + Math.random() * 900000)}-IN`;
  const householdId = citizen?.householdId || `HH-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const today = new Date().toISOString().split('T')[0];

  return {
    householdId,
    headOfHousehold: citizenName,
    registrationDate: today,
    currentStatus: 'Active Citizen Registry',
    dwellingReference: 'DWL-PRIMARY-001',
    rationCardRef: 'Pending Registration',
    incomeCategory: 'Standard Category',
    annualHouseholdIncome: 'Self-Declared',
    address: citizen?.address?.addressLine1
      ? `${citizen.address.addressLine1}, ${citizen.address.district || ''}`
      : 'Primary Residential Address',
    verificationSource: 'Citizen Self-Declaration & Portal Registry',
    lastUpdated: today,
    members: [
      {
        id: 'MEM-01',
        fullName: citizenName,
        relation: 'Self (Head of Family)',
        citizenId: citizenId,
        age: 35,
        gender: citizen?.gender || 'Not Specified',
        occupation: citizen?.occupation || 'Self-Employed',
        education: 'Secondary / Higher Secondary',
        status: 'Current Resident',
        memberSince: today,
        isHead: true,
        independentBenefitsAllowed: true
      }
    ],
    membershipHistory: [
      {
        id: 'EVT-01',
        date: today,
        event: 'Household Registry Established',
        type: 'Registration',
        description: `Initial citizen household registry established for ${citizenName}.`,
        authority: 'UDPAD Citizen Portal Self-Service',
        referenceNo: `REG-${Date.now()}`
      }
    ],
    dwellings: [
      {
        dwellingId: 'DWL-PRIMARY-001',
        type: 'Primary Domestic Residence',
        ownership: 'Resident / Occupant',
        address: citizen?.address?.addressLine1 || 'Registered Domestic Dwelling',
        electricityMeterNo: 'Pending Consumer ID Entry',
        waterConnectionNo: 'Pending Meter Entry'
      }
    ]
  };
};
