// Dynamic household generator for registered citizens (zero pre-existing demo households)
export const createDefaultHousehold = (user) => {
  const citizenName = user?.fullName || 'Registered Citizen';
  const citizenId = user?.citizenId || `CIT-${Math.floor(100000 + Math.random() * 900000)}-IN`;
  const householdId = user?.householdId || `HH-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
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
    address: user?.address?.addressLine1
      ? `${user.address.addressLine1}, ${user.address.addressLine2 || ''} ${user.address.district || ''}`
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
        gender: user?.gender || 'Not Specified',
        occupation: user?.occupation || 'Self-Employed',
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
        address: user?.address?.addressLine1 || 'Registered Domestic Dwelling',
        electricityMeterNo: 'Pending Consumer ID Entry',
        waterConnectionNo: 'Pending Meter Entry'
      }
    ]
  };
};

export const householdData = null;
