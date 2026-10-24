import { schemesData } from '../../src/data/schemes.js';

export { schemesData };

export const createInitialCitizen = (data = {}) => {
  const citizenId = `CIT-${Math.floor(100000 + Math.random() * 900000)}-IN`;
  const householdId = `HH-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const today = new Date().toISOString().split('T')[0];

  const fatherName = data.fatherName || data.address?.fatherName || '';
  const motherName = data.motherName || data.address?.motherName || '';
  const caste = data.caste || data.address?.caste || '';
  const casteOther = data.casteOther || data.address?.casteOther || '';
  const fullAddress = data.fullAddress || data.address?.fullAddress || data.addressLine1 || '';

  const addressObj = typeof data.address === 'object' && data.address !== null
    ? {
        ...data.address,
        dwellingType: data.address.dwellingType || 'Residential',
        addressLine1: data.address.addressLine1 || fullAddress || 'Residential Address',
        fullAddress: fullAddress || data.address.fullAddress || '',
        fatherName: fatherName || data.address.fatherName || '',
        motherName: motherName || data.address.motherName || '',
        caste: caste || data.address.caste || '',
        casteOther: casteOther || data.address.casteOther || ''
      }
    : {
        dwellingType: 'Residential',
        addressLine1: fullAddress || data.addressLine1 || 'Residential Address',
        addressLine2: data.addressLine2 || '',
        district: data.district || '',
        state: data.state || '',
        pincode: data.pincode || '',
        fullAddress: fullAddress || '',
        fatherName: fatherName || '',
        motherName: motherName || '',
        caste: caste || '',
        casteOther: casteOther || ''
      };

  return {
    id: `usr_${Date.now()}`,
    citizenId,
    fullName: data.fullName || 'Registered Citizen',
    mobile: data.mobile || '',
    email: data.email || '',
    gender: data.gender || 'Not Specified',
    occupation: data.occupation || 'Citizen',
    fatherName,
    motherName,
    caste,
    casteOther,
    fullAddress,
    incomeCategory: data.incomeCategory || 'Standard Income Category',
    annualIncome: data.annualIncome || 'Self-Declared',
    householdId,
    address: addressObj,
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

  const primaryAddress = citizen?.fullAddress || citizen?.address?.fullAddress || citizen?.address?.addressLine1 || 'Primary Residential Address';

  const members = [
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
  ];

  if (citizen?.fatherName && citizen.fatherName.trim()) {
    members.push({
      id: 'MEM-02',
      fullName: citizen.fatherName.trim(),
      relation: 'Father',
      age: 62,
      gender: 'Male',
      occupation: 'Senior Dependent',
      education: 'Secondary',
      status: 'Current Resident',
      memberSince: today,
      isHead: false,
      independentBenefitsAllowed: true
    });
  }

  if (citizen?.motherName && citizen.motherName.trim()) {
    members.push({
      id: `MEM-0${members.length + 1}`,
      fullName: citizen.motherName.trim(),
      relation: 'Mother',
      age: 58,
      gender: 'Female',
      occupation: 'Senior Dependent',
      education: 'Secondary',
      status: 'Current Resident',
      memberSince: today,
      isHead: false,
      independentBenefitsAllowed: true
    });
  }

  return {
    householdId,
    headOfHousehold: citizenName,
    registrationDate: today,
    currentStatus: 'Active Citizen Registry',
    dwellingReference: 'DWL-PRIMARY-001',
    rationCardRef: 'Pending Registration',
    incomeCategory: 'Standard Category',
    annualHouseholdIncome: 'Self-Declared',
    address: primaryAddress,
    verificationSource: 'Citizen Self-Declaration & Portal Registry',
    lastUpdated: today,
    members,
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
        address: primaryAddress,
        electricityMeterNo: 'Pending Consumer ID Entry',
        waterConnectionNo: 'Pending Meter Entry'
      }
    ]
  };
};
