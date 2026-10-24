// Clean citizen profile schema (zero hardcoded pre-existing users)
export const createInitialUser = (data) => {
  const fatherName = data.fatherName || data.address?.fatherName || '';
  const motherName = data.motherName || data.address?.motherName || '';
  const caste = data.caste || data.address?.caste || '';
  const casteOther = data.casteOther || data.address?.casteOther || '';
  const fullAddress = data.fullAddress || data.address?.fullAddress || data.addressLine1 || '';

  return {
    id: `usr_${Date.now()}`,
    citizenId: `CIT-${Math.floor(100000 + Math.random() * 900000)}-IN`,
    fullName: data.fullName || 'Registered Citizen',
    mobile: data.mobile || '',
    email: data.email || '',
    dateOfBirth: data.dateOfBirth || '',
    gender: data.gender || 'Not Specified',
    occupation: data.occupation || 'Citizen',
    fatherName,
    motherName,
    caste,
    casteOther,
    fullAddress,
    incomeCategory: data.incomeCategory || 'Standard Income Category',
    annualIncome: data.annualIncome || 'Self-Declared',
    householdId: `HH-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
    address: {
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
    },
    createdDate: new Date().toISOString().split('T')[0],
    lastVerifiedDate: new Date().toISOString().split('T')[0],
    registrySource: 'Citizen Self-Registration'
  };
};
