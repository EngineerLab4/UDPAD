export const schemesData = [
  {
    id: 'SCH-01',
    code: 'PMGKAY-01',
    name: 'PMGKAY / NFSA free ration',
    category: 'Food',
    department: 'Department of Food & Public Distribution, Ministry of Consumer Affairs',
    benefitUnit: 'Household',
    benefitAmount: '5 kg free foodgrain per person per month; extended five years from Jan 1, 2024',
    shortDescription: '5 kg free foodgrain per person per month for Antyodaya Anna Yojana (AAY) and Priority Households (PHH) under NFSA.',
    fullDescription: 'Pradhan Mantri Garib Kalyan Anna Yojana (PMGKAY) integrated under the National Food Security Act (NFSA) provides 5 kg of free foodgrains per person per month to eligible priority households and 35 kg per family per month for AAY households. Extended for five years starting January 1, 2024.',
    intendedBeneficiary: 'Ration card holders under NFSA: Antyodaya Anna Yojana (AAY) and Priority Households (PHH)',
    eligibilityCriteria: [
      'Ration card holders under NFSA: Antyodaya Anna Yojana (AAY) and Priority Households (PHH).',
      'Beneficiary details must be mapped in the state PDS and national NFSA database.',
      'Aadhaar seeding of ration card with mobile number linkage is recommended.',
      'Active monthly collection: Not collecting grain for several months can lead to deletion in many states.'
    ],
    requiredDocuments: [
      'Ration card, ideally Aadhaar-seeded with mobile linked',
      'Aadhaar card of household members',
      'Active mobile number linked to ration card',
      'Verification via local ration shop (FPS) or mera.pmgkay.gov.in'
    ],
    portal: 'mera.pmgkay.gov.in (status check); local ration shop',
    verificationStatus: 'Verified',
    benefitUnitExplanation: 'Benefit is managed at the HOUSEHOLD ration card level. Allocations are computed based on active verified family members listed under the designated household ration card.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'How do I check if my ration card is active?',
        a: 'You can check your ration card status online at mera.pmgkay.gov.in or directly visit your local ration shop.'
      },
      {
        q: 'What happens if we do not collect rations for a few months?',
        a: 'In many states, failing to collect allotted foodgrains for consecutive months triggers automated verification or ration card deactivation.'
      }
    ]
  },
  {
    id: 'SCH-02',
    code: 'ANNAPURNA-02',
    name: 'Annapurna Scheme',
    category: 'Food',
    department: 'Ministry of Rural Development / State Social Welfare Department',
    benefitUnit: 'Individual',
    benefitAmount: 'Free foodgrain for elderly people',
    shortDescription: 'Free foodgrain (10 kg per month) for eligible senior citizens not covered under any old-age pension.',
    fullDescription: 'The Annapurna Scheme provides food security to meet the requirements of senior citizens (aged 65 and above) who, though eligible for the National Old Age Pension Scheme, are not receiving pension benefits.',
    intendedBeneficiary: 'Eligible old-age persons not covered by the old-age pension',
    eligibilityCriteria: [
      'Eligible old-age persons (aged 65 years or above).',
      'Must not be covered by or receiving any central or state old-age pension.',
      'Must be destitute with no regular source of subsistence or family maintenance support.',
      'Must reside in the designated block or municipal jurisdiction.'
    ],
    requiredDocuments: [
      'Through the state/block social welfare office (details not verified)',
      'Proof of age / Senior citizen identity record',
      'Certificate of non-receipt of old-age pension',
      'Proof of residence / Ration card extract'
    ],
    portal: 'nsap.nic.in',
    verificationStatus: 'Partly verified',
    benefitUnitExplanation: 'Benefit is awarded to the INDIVIDUAL destitute senior citizen who is not receiving old-age pension support.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'Can a senior citizen already getting an old-age pension get Annapurna foodgrains?',
        a: 'No, Annapurna is strictly for eligible old-age persons who are not covered by any old-age pension scheme.'
      }
    ]
  },
  {
    id: 'SCH-03',
    code: 'VB-GRAM-G-03',
    name: 'VB-G RAM G (replaced MGNREGA)',
    category: 'Jobs & income',
    department: 'Department of Rural Development, Ministry of Rural Development',
    benefitUnit: 'Household',
    benefitAmount: '125 days of guaranteed rural wage work a year from July 1, 2026; allowance payable if work is not given within the prescribed time; wages paid weekly or within 15 days',
    shortDescription: '125 days of guaranteed rural wage work per household per year starting July 1, 2026 with statutory unemployment allowance.',
    fullDescription: 'VB-G RAM G replaces MGNREGA to provide 125 days of statutory guaranteed unskilled manual work per rural household per year starting July 1, 2026. Unemployment allowance is legally payable if work is not allotted within 15 days of demand and wages are directly credited weekly or within 15 days.',
    intendedBeneficiary: 'Rural households with valid job cards; one adult member volunteering for unskilled manual work',
    eligibilityCriteria: [
      'Rural households with valid job cards.',
      'At least one adult household member volunteering for unskilled manual work.',
      'Permanent residence within the rural Gram Panchayat area.',
      'Guaranteed work allocation capped at 125 cumulative days per registered household per year from July 1, 2026.'
    ],
    requiredDocuments: [
      'Job card from the Gram Panchayat',
      'Aadhaar Card of participating adult worker(s)',
      'Aadhaar-seeded active bank or post office savings account passbook',
      'Formal work demand submission to Gram Panchayat or Block Development Officer'
    ],
    portal: 'Gram Panchayat; rural development dept',
    verificationStatus: 'Verified',
    benefitUnitExplanation: 'The 125-day entitlement is allocated at the HOUSEHOLD level and shared across volunteering adult members registered under the family job card.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'What if work is not provided within 15 days of submitting a demand?',
        a: 'A statutory unemployment allowance is legally payable to the applicant worker if employment is not provided within the prescribed 15 days.'
      },
      {
        q: 'How frequently are wages disbursed?',
        a: 'Wages are credited via DBT weekly or within a maximum of 15 days directly into the worker’s Aadhaar-linked bank account.'
      }
    ]
  },
  {
    id: 'SCH-04',
    code: 'APY-04',
    name: 'Atal Pension Yojana',
    category: 'Jobs & income',
    department: 'Pension Fund Regulatory and Development Authority (PFRDA) / Ministry of Finance',
    benefitUnit: 'Individual',
    benefitAmount: 'Guaranteed pension of Rs 1,000-5,000 a month after age 60',
    shortDescription: 'Guaranteed monthly old-age pension of ₹1,000 to ₹5,000 after age 60 for unorganised-sector workers.',
    fullDescription: 'Atal Pension Yojana provides a guaranteed monthly pension of ₹1,000, ₹2,000, ₹3,000, ₹4,000, or ₹5,000 to subscribers after age 60, based on their monthly contribution and entry age (18 to 40 years).',
    intendedBeneficiary: 'Unorganised-sector workers aged 18-40',
    eligibilityCriteria: [
      'Unorganised-sector workers aged 18-40.',
      'Must have an active savings bank account or post office savings account with auto-debit consent.',
      'Must not be an income taxpayer.',
      'Must not be covered under statutory government social security schemes.'
    ],
    requiredDocuments: [
      'Bank account with auto-debit',
      'Aadhaar Card for identity and address proof',
      'Active mobile number linked to bank account',
      'Nominee details'
    ],
    portal: 'Your bank',
    verificationStatus: 'Verified',
    benefitUnitExplanation: 'Benefit attaches strictly to the INDIVIDUAL worker. Spouses can each maintain their own independent APY accounts and each receive pension.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'Can both husband and wife subscribe to Atal Pension Yojana?',
        a: 'Yes. APY is an individual account. Both spouses can independently subscribe and both receive guaranteed monthly pensions after age 60.'
      }
    ]
  },
  {
    id: 'SCH-05',
    code: 'PM-SVANIDHI-05',
    name: 'PM SVANidhi',
    category: 'Jobs & income',
    department: 'Ministry of Housing and Urban Affairs (MoHUA)',
    benefitUnit: 'Individual',
    benefitAmount: 'Street vendor loans; Rs 50,000 third loan with 7% interest subsidy',
    shortDescription: 'Collateral-free working capital loans for urban street vendors, scaling up to ₹50,000 on the third tranche with 7% interest subsidy.',
    fullDescription: 'PM SVANidhi provides affordable collateral-free working capital micro-credit to urban street vendors in tranches (₹10,000, ₹20,000 and up to ₹50,000 on the 3rd loan) with a 7% interest subsidy and cashbacks for digital transactions.',
    intendedBeneficiary: 'Street vendors (rest not verified)',
    eligibilityCriteria: [
      'Street vendors (rest not verified).',
      'Operating in urban or peri-urban localities with vending certificate or recommendation.',
      'Demonstrated timely repayment on earlier tranches to unlock the ₹50,000 third loan.',
      'Adoption of digital transactions via UPI merchant QR code.'
    ],
    requiredDocuments: [
      'Not verified',
      'Vending Certificate / Urban Local Body ID or Letter of Recommendation',
      'Aadhaar Card and active bank account passbook',
      'UPI merchant QR registration proof'
    ],
    portal: 'Not verified',
    verificationStatus: 'Partly verified',
    benefitUnitExplanation: 'Loan benefit is issued to the INDIVIDUAL street vendor business holder based on vending identity and repayment record.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'What is the interest subsidy provided under PM SVANidhi?',
        a: 'Borrowers receive an early repayment / regular interest subsidy of 7% per annum credited directly into their bank accounts.'
      }
    ]
  },
  {
    id: 'SCH-06',
    code: 'PM-KMY-06',
    name: 'PM Kisan Maandhan Yojana',
    category: 'Jobs & income',
    department: 'Department of Agriculture and Farmers Welfare, Ministry of Agriculture',
    benefitUnit: 'Individual',
    benefitAmount: 'Rs 3,000 a month pension after age 60',
    shortDescription: 'Old-age social security pension of ₹3,000 per month for small and marginal farmers after age 60.',
    fullDescription: 'Pradhan Mantri Kisan Maan-Dhan Yojana is a voluntary, contributory pension scheme offering small and marginal farmers an assured monthly pension of ₹3,000 after reaching age 60, with equal matching contribution from the Central Government.',
    intendedBeneficiary: 'Small farmers (age limits not verified)',
    eligibilityCriteria: [
      'Small farmers (age limits not verified).',
      'Own cultivable agricultural land holding up to 2 hectares in revenue records.',
      'Must not be covered under other social security or formal pension schemes.',
      'Must not be an income-tax payer.'
    ],
    requiredDocuments: [
      'Not verified',
      'Aadhaar Card',
      'Savings Bank Account passbook / PM-KISAN beneficiary ID',
      'Land revenue ownership records (Khasra / Khatauni)'
    ],
    portal: 'Not verified',
    verificationStatus: 'Partly verified',
    benefitUnitExplanation: 'Benefit is granted to the INDIVIDUAL farmer. Both husband and wife can independently join if eligible and both receive separate ₹3,000 monthly pensions.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'Can contributions be deducted directly from PM-KISAN benefits?',
        a: 'Yes, farmers enrolled in PM-KISAN can opt to have their monthly pension contribution auto-debited directly from their PM-KISAN installments.'
      }
    ]
  },
  {
    id: 'SCH-07',
    code: 'PM-JAY-07',
    name: 'Ayushman Bharat PM-JAY',
    category: 'Health & insurance',
    department: 'National Health Authority (NHA), Ministry of Health and Family Welfare',
    benefitUnit: 'Household',
    benefitAmount: 'Rs 5 lakh per family per year, cashless, for secondary and tertiary hospitalisation',
    shortDescription: 'Cashless health cover up to ₹5 lakh per family per year for secondary and tertiary hospitalisation across empanelled hospitals.',
    fullDescription: 'Ayushman Bharat PM-JAY provides comprehensive health assurance of ₹5 lakh per family per year on a family floater basis with zero cash payment required from eligible families at empanelled public and private healthcare facilities.',
    intendedBeneficiary: "Families identified under the scheme's criteria (exact criteria not verified)",
    eligibilityCriteria: [
      "Families identified under the scheme's criteria (exact criteria not verified).",
      'Listed in identified SECC / NFSA or state health beneficiary registries.',
      'Family floater coverage without restrictions on family size, gender, or age.',
      'All pre-existing diseases and medical conditions covered from day one.'
    ],
    requiredDocuments: [
      'Generate and download the Ayushman card',
      'Aadhaar Card of family members for e-KYC',
      'Ration Card / Family ID / SECC confirmation slip',
      'Active mobile number linked to beneficiary record'
    ],
    portal: 'beneficiary.nha.gov.in; Ayushman app',
    verificationStatus: 'Partly verified',
    benefitUnitExplanation: 'Benefit operates as a HOUSEHOLD floater entitlement: up to ₹5,00,000 is shared annually among all verified members of the family unit.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'How do I download my Ayushman Card?',
        a: 'Visit beneficiary.nha.gov.in or download the Ayushman app, enter your mobile number and Aadhaar OTP to generate your card.'
      }
    ]
  },
  {
    id: 'SCH-08',
    code: 'AYUSH-VAY-08',
    name: 'Ayushman Vay Vandana',
    category: 'Health & insurance',
    department: 'National Health Authority (NHA), Ministry of Health and Family Welfare',
    benefitUnit: 'Individual',
    benefitAmount: 'Rs 5 lakh cover for all seniors 70+ regardless of income; existing PM-JAY families get an additional top-up of up to Rs 5 lakh a year for the senior',
    shortDescription: '₹5 lakh annual health coverage for all senior citizens aged 70 and above, regardless of income, plus exclusive top-up for existing PM-JAY families.',
    fullDescription: 'Ayushman Vay Vandana extends universal health coverage of ₹5 lakh per year to all senior citizens aged 70 years and above, regardless of their family income or economic slab. For seniors in families already covered under PM-JAY, this ₹5 lakh serves as an exclusive top-up not shared with other family members.',
    intendedBeneficiary: 'All citizens aged 70+, rural and urban',
    eligibilityCriteria: [
      'All citizens aged 70+, rural and urban.',
      'Age must be 70 years or above as verified through Aadhaar records.',
      'No income, wealth, or economic status ceiling applies.',
      'Senior citizens with private insurance or ESIC are eligible to opt for the card.'
    ],
    requiredDocuments: [
      'Aadhaar is mandatory',
      'Mobile number linked to Aadhaar for OTP verification',
      'Recent photograph captured live during Ayushman App e-KYC'
    ],
    portal: 'beneficiary.nha.gov.in; Ayushman app',
    verificationStatus: 'Verified',
    benefitUnitExplanation: 'Benefit is granted at the INDIVIDUAL level. Each senior citizen aged 70+ receives their own dedicated ₹5 lakh coverage, completely separate from household limits.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'Does an income ceiling apply for seniors 70+ to get Ayushman Vay Vandana?',
        a: 'No. Ayushman Vay Vandana is universal for all citizens aged 70 and above, across both rural and urban areas, regardless of family income.'
      },
      {
        q: 'If our family already has a ₹5 lakh PM-JAY card, what happens?',
        a: 'The senior receives an additional, exclusive top-up of up to ₹5 lakh per year specifically for themselves.'
      }
    ]
  },
  {
    id: 'SCH-09',
    code: 'PMJJBY-09',
    name: 'PMJJBY (life insurance)',
    category: 'Health & insurance',
    department: 'Department of Financial Services, Ministry of Finance',
    benefitUnit: 'Individual',
    benefitAmount: 'Rs 2 lakh cover for death from any cause',
    shortDescription: 'Renewable one-year term life insurance cover of ₹2 lakh for death from any cause at ₹436 annual premium.',
    fullDescription: 'Pradhan Mantri Jeevan Jyoti Bima Yojana provides ₹2,00,000 life insurance coverage for death due to any reason. Premium of ₹436 per annum is automatically deducted from the subscriber\'s linked bank account.',
    intendedBeneficiary: 'Age limits not verified',
    eligibilityCriteria: [
      'Age limits not verified (eligible bank account holders with auto-debit consent).',
      'Must maintain an active individual savings bank account.',
      'Auto-debit authorization of ₹436 annual premium from the linked bank account.',
      'Coverage renews annually from June 1 to May 31.'
    ],
    requiredDocuments: [
      'Rs 436 a year auto-deducted from the linked bank account',
      'Savings bank account passbook copy',
      'Aadhaar card for KYC verification',
      'Nominee details form'
    ],
    portal: 'Your bank',
    verificationStatus: 'Partly verified',
    benefitUnitExplanation: 'Policy is issued per INDIVIDUAL account holder. A person having accounts in multiple banks can join PMJJBY through only one bank account.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'How is the annual premium paid?',
        a: 'The premium of ₹436 per year is auto-deducted in one installment directly from your linked savings bank account.'
      }
    ]
  },
  {
    id: 'SCH-10',
    code: 'PMSBY-10',
    name: 'PMSBY (accident insurance)',
    category: 'Health & insurance',
    department: 'Department of Financial Services, Ministry of Finance',
    benefitUnit: 'Individual',
    benefitAmount: 'Rs 2 lakh for accidental death or total disability; Rs 1 lakh for partial disability',
    shortDescription: 'Accident insurance of ₹2 lakh for death/total disability and ₹1 lakh for partial disability at ₹20 per year auto-debited.',
    fullDescription: 'Pradhan Mantri Suraksha Bima Yojana offers high-value accidental risk protection at nominal cost. Provides ₹2,00,000 for accidental death or permanent total disability and ₹1,00,000 for permanent partial disability at an annual premium of only ₹20.',
    intendedBeneficiary: 'Age limits not verified',
    eligibilityCriteria: [
      'Age limits not verified (savings bank account holders with auto-debit authorization).',
      'Must hold an active savings bank account.',
      'Consent for auto-debit of ₹20 annual premium between May 25 and May 31.',
      'Must provide Aadhaar as primary KYC document.'
    ],
    requiredDocuments: [
      'Rs 20 a year auto-deducted from the linked bank account',
      'Savings bank passbook or statement',
      'Aadhaar card copy',
      'Nomination details'
    ],
    portal: 'Your bank',
    verificationStatus: 'Partly verified',
    benefitUnitExplanation: 'Benefit attaches to the INDIVIDUAL subscriber. Each adult in a household can subscribe independently through their own bank account.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'What is the annual premium for PMSBY?',
        a: 'The premium is just ₹20 per year, auto-debited from your linked bank account.'
      }
    ]
  },
  {
    id: 'SCH-11',
    code: 'PMJDY-11',
    name: 'Jan Dhan Yojana',
    category: 'Health & insurance',
    department: 'Department of Financial Services, Ministry of Finance',
    benefitUnit: 'Individual',
    benefitAmount: 'Zero-balance bank account; base for APY, PMJJBY and PMSBY (57.78 crore accounts as of Feb 2026)',
    shortDescription: 'Zero-balance basic savings bank deposit account serving as the foundation for DBT, APY, PMJJBY and PMSBY.',
    fullDescription: 'Pradhan Mantri Jan Dhan Yojana is the flagship National Mission for Financial Inclusion. It guarantees access to zero-balance banking accounts, RuPay debit card with inbuilt accident cover and serves as the primary base for social security schemes (APY, PMJJBY, PMSBY). Over 57.78 crore accounts active as of Feb 2026.',
    intendedBeneficiary: 'Not verified',
    eligibilityCriteria: [
      'Not verified (open to any citizen without an existing formal banking account).',
      'No minimum balance requirement or account maintenance penalty.',
      'Direct Benefit Transfer (DBT) enabled upon Aadhaar seeding.',
      'Overdraft facility up to ₹10,000 subject to regular satisfactory transactions.'
    ],
    requiredDocuments: [
      'Not verified',
      'Aadhaar card or officially valid identity document',
      'Passport-size photographs',
      'Account opening form submitted at any bank branch or Bank Mitra kiosk'
    ],
    portal: 'Any bank branch',
    verificationStatus: 'Partly verified',
    benefitUnitExplanation: 'Account is held at the INDIVIDUAL level. Multiple adults in the same household can each hold their own individual Jan Dhan bank accounts.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'Where can I open a Jan Dhan account?',
        a: 'You can open a zero-balance Jan Dhan account at any commercial bank branch or through authorized Bank Mitra / CSC banking kiosks.'
      }
    ]
  },
  {
    id: 'SCH-12',
    code: 'PMAY-U2-12',
    name: 'PMAY-Urban 2.0',
    category: 'Housing & energy',
    department: 'Ministry of Housing and Urban Affairs (MoHUA)',
    benefitUnit: 'Dwelling / Facility',
    benefitAmount: 'Up to Rs 2.5 lakh per housing unit under BLC and AHP; also rental housing and home-loan interest subsidy',
    shortDescription: 'Financial grant up to ₹2.5 lakh per pucca house under BLC/AHP, rental housing and home loan interest subsidies for urban EWS families.',
    fullDescription: 'PMAY-Urban 2.0 provides central financial assistance up to ₹2.5 lakh per housing unit under Beneficiary-Led Construction (BLC) and Affordable Housing in Partnership (AHP), as well as rental housing and home-loan interest subsidies for urban Economically Weaker Sections (EWS).',
    intendedBeneficiary: 'EWS = annual income up to Rs 3 lakh; a previous housing benefit within 20 years blocks eligibility',
    eligibilityCriteria: [
      'EWS = annual income up to Rs 3 lakh.',
      'A previous housing benefit within 20 years blocks eligibility.',
      'Applicant family must not own a pucca house anywhere in India.',
      'House must be registered in the name of the female head or in joint ownership with spouse.'
    ],
    requiredDocuments: [
      'Online application with Aadhaar and income details',
      'Income certificate showing EWS annual income up to Rs 3 lakh',
      'Land/dwelling ownership records (for BLC component)',
      'Bank passbook and geo-tagged property photo'
    ],
    portal: 'PMAY-U portal',
    verificationStatus: 'Verified',
    benefitUnitExplanation: 'Benefit is strictly tied to the DWELLING / FACILITY. UDPAD deduplication cross-checks municipal property tax registries and geo-coordinates to enforce the 20-year single-benefit rule.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'Does a previous housing subsidy received 15 years ago disqualify me?',
        a: 'Yes. Under PMAY-Urban 2.0 guidelines, any previous housing benefit availed within 20 years strictly blocks eligibility.'
      }
    ]
  },
  {
    id: 'SCH-13',
    code: 'PMAY-G-13',
    name: 'PMAY-Gramin',
    category: 'Housing & energy',
    department: 'Department of Rural Development, Ministry of Rural Development',
    benefitUnit: 'Dwelling / Facility',
    benefitAmount: 'Pucca house for rural households; cost shared 60:40 Centre:State in plain areas, 90:10 in NE and hilly states',
    shortDescription: 'Grant for constructing a pucca house for rural households in kutcha/temporary housing, cost shared between Centre and States.',
    fullDescription: 'PMAY-Gramin provides financial assistance to construct a durable pucca house with basic amenities for rural households living in weak, dilapidated, or temporary kutcha dwellings. Cost shared 60:40 Centre:State in plain areas and 90:10 in North Eastern and Himalayan states.',
    intendedBeneficiary: 'Households in weak or temporary housing, identified through surveys (not income slabs)',
    eligibilityCriteria: [
      'Households in weak or temporary housing, identified through surveys (not income slabs).',
      'Identified through Gram Panchayat deprivation surveys and verified Gram Sabha lists.',
      'Household must not own a pucca house anywhere in India.',
      'Exclusion applies if household owns motorized 3/4 wheelers or mechanized agricultural equipment.'
    ],
    requiredDocuments: [
      'Identified through Gram Panchayat survey. Continuation status not confirmed',
      'Aadhaar card of all household members',
      'Rural job card number (for linked 90-95 days wage labour component)',
      'Bank passbook (Aadhaar-seeded for DBT)'
    ],
    portal: 'Rural development dept',
    verificationStatus: 'Partly verified',
    benefitUnitExplanation: 'Benefit is attached to the physical DWELLING / FACILITY. One permanent housing unit grant is provided per surveyed kutcha homestead.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'How are beneficiaries selected under PMAY-Gramin?',
        a: 'Beneficiaries are identified through official Gram Panchayat housing deprivation surveys (Awaas+), not by arbitrary income declarations.'
      }
    ]
  },
  {
    id: 'SCH-14',
    code: 'PM-UJJWALA-14',
    name: 'PM Ujjwala Yojana',
    category: 'Housing & energy',
    department: 'Ministry of Petroleum and Natural Gas (MoPNG)',
    benefitUnit: 'Household',
    benefitAmount: 'Deposit-free LPG connection; Rs 300 per cylinder subsidy for up to 9 refills in FY 2025-26 (FY 2026-27 status not confirmed)',
    shortDescription: 'Deposit-free LPG connection for adult women of poor households with ₹300 per cylinder subsidy for up to 9 refills.',
    fullDescription: 'Pradhan Mantri Ujjwala Yojana provides deposit-free LPG gas connections to adult women from poor households to ensure clean cooking fuel. Includes full waiver of connection deposit and a targeted subsidy of ₹300 per cylinder for up to 9 refills in FY 2025-26.',
    intendedBeneficiary: 'Adult women from poor households',
    eligibilityCriteria: [
      'Adult women from poor households.',
      'Must be an adult female aged 18 years or older.',
      'No existing active LPG connection under any member of the same household under any OMC (IOCL, BPCL, HPCL).',
      'Household belongs to verified low-income or priority category.'
    ],
    requiredDocuments: [
      'Not verified',
      'Ration Card / Proof of Household Composition showing family roster',
      'Aadhaar Card of female applicant and adult household members',
      'Bank account passbook in applicant\'s name (Aadhaar-seeded)'
    ],
    portal: 'LPG distributor',
    verificationStatus: 'Partly verified',
    benefitUnitExplanation: 'Benefit is strictly restricted to ONE connection per HOUSEHOLD. OMC cross-deduplication automatically rejects applicants if another active connection exists in the family.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'Can the Ujjwala connection be issued in a male member’s name?',
        a: 'No. Under statutory scheme guidelines, PM Ujjwala connections are issued exclusively in the name of an adult female member of the household.'
      }
    ]
  },
  {
    id: 'SCH-15',
    code: 'PM-SURYA-15',
    name: 'PM Surya Ghar',
    category: 'Housing & energy',
    department: 'Ministry of New and Renewable Energy (MNRE)',
    benefitUnit: 'Dwelling / Facility',
    benefitAmount: 'Rs 78,000 central subsidy plus state top-up (rooftop solar)',
    shortDescription: 'Direct central capital subsidy up to ₹78,000 plus state top-up for residential rooftop solar installation.',
    fullDescription: 'PM Surya Ghar: Muft Bijli Yojana provides direct subsidies to residential consumers to install grid-connected rooftop solar systems, offering ₹30,000 for 1 kW, ₹60,000 for 2 kW and up to ₹78,000 for systems 3 kW and above, along with state-specific top-ups.',
    intendedBeneficiary: 'Not verified',
    eligibilityCriteria: [
      'Not verified (domestic electricity consumers with rooftop space).',
      'Must possess an active domestic DISCOM consumer electricity account.',
      'Adequate unshaded rooftop or open space suitable for solar panels.',
      'Only ONE subsidy per physical dwelling and consumer meter connection.'
    ],
    requiredDocuments: [
      'Not verified',
      'Latest paid domestic electricity utility bill',
      'Proof of rooftop ownership or long-term lease authorization',
      'Aadhaar card of consumer account holder and bank details'
    ],
    portal: 'Not verified',
    verificationStatus: 'Partly verified',
    benefitUnitExplanation: 'Strictly tied to the DWELLING / FACILITY and DISCOM electricity consumer meter. Multiple households sharing one physical meter cannot claim multiple subsidies.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'What is the maximum central subsidy available?',
        a: 'The central capital subsidy provides up to ₹78,000 for residential systems of 3 kW and above, plus any applicable state government top-up.'
      }
    ]
  },
  {
    id: 'SCH-16',
    code: 'IGNOAPS-16',
    name: 'Old Age Pension (IGNOAPS)',
    category: 'Pensions (central, NSAP)',
    department: 'Department of Rural Development / National Social Assistance Programme (NSAP)',
    benefitUnit: 'Individual',
    benefitAmount: 'Rs 200 a month for ages 60-79; Rs 500 at 80+ (states top up)',
    shortDescription: 'Monthly social pension of ₹200 for ages 60-79 and ₹500 for ages 80+ for senior citizens in BPL families, topped up by states.',
    fullDescription: 'Indira Gandhi National Old Age Pension Scheme under NSAP provides non-contributory monthly financial assistance to senior citizens aged 60 and above belonging to Below Poverty Line (BPL) households. Central grant is ₹200/month for ages 60-79 and ₹500/month for ages 80+, heavily supplemented by state government contributions.',
    intendedBeneficiary: 'Age 60+ in a BPL family',
    eligibilityCriteria: [
      'Age 60+ in a BPL family.',
      'Must be a permanent resident of India.',
      'Applicant must not be receiving another regular civil or government pension.',
      'Automatic escalation to ₹500 monthly rate upon reaching age 80.'
    ],
    requiredDocuments: [
      'Through the state social welfare office',
      'Proof of age (Aadhaar, Voter ID, or Birth Certificate)',
      'BPL card / verified BPL household roster extract',
      'Bank / Post Office account passbook (Aadhaar-seeded)'
    ],
    portal: 'nsap.nic.in',
    verificationStatus: 'Verified',
    benefitUnitExplanation: 'Entitlement attaches to the INDIVIDUAL senior. Both elderly husband and wife in a BPL family can independently receive their individual monthly pensions.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'Does the pension increase automatically at age 80?',
        a: 'Yes. Upon reaching 80 years of age, the central pension allocation steps up from ₹200 to ₹500 per month.'
      }
    ]
  },
  {
    id: 'SCH-17',
    code: 'IGNWPS-17',
    name: 'Widow Pension (IGNWPS)',
    category: 'Pensions (central, NSAP)',
    department: 'National Social Assistance Programme (NSAP), Ministry of Rural Development',
    benefitUnit: 'Individual',
    benefitAmount: 'Rs 300 a month',
    shortDescription: 'Monthly social security pension of ₹300 for destitute widows aged 40 and above living below the poverty line.',
    fullDescription: 'Indira Gandhi National Widow Pension Scheme provides social security assistance of ₹300 per month (supplemented by state top-up funds) to widowed women aged 40 to 79 belonging to Below Poverty Line (BPL) households.',
    intendedBeneficiary: 'Widows aged 40+, BPL',
    eligibilityCriteria: [
      'Widows aged 40+, BPL.',
      'Applicant must be a widow aged between 40 and 79 years.',
      'Must not have remarried.',
      'Must not be drawing any other regular central or state pension.'
    ],
    requiredDocuments: [
      'Through the state social welfare office',
      'Death Certificate of the deceased husband',
      'Proof of age showing 40+ years',
      'BPL card / certificate and applicant bank passbook'
    ],
    portal: 'nsap.nic.in',
    verificationStatus: 'Verified',
    benefitUnitExplanation: 'Benefit is granted to the INDIVIDUAL widowed woman. Eligibility is reassessed if the recipient remarries or household status changes.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'What happens when a widow pension beneficiary turns 80?',
        a: 'At age 80, the beneficiary transitions to the higher senior pension slab under IGNOAPS (₹500/month central rate).'
      }
    ]
  },
  {
    id: 'SCH-18',
    code: 'IGNDPS-18',
    name: 'Disability Pension (IGNDPS)',
    category: 'Pensions (central, NSAP)',
    department: 'National Social Assistance Programme (NSAP), Ministry of Rural Development',
    benefitUnit: 'Individual',
    benefitAmount: 'Rs 300 a month up to age 80, then Rs 500',
    shortDescription: 'Monthly disability pension of ₹300 (up to age 80) and ₹500 (age 80+) for persons aged 18+ with 80%+ disability from BPL families.',
    fullDescription: 'Indira Gandhi National Disability Pension Scheme provides monthly social pension assistance of ₹300 (up to age 80) and ₹500 (aged 80 and above) for severely disabled individuals with 80% or greater disability from BPL families.',
    intendedBeneficiary: 'Age 18+ with 80%+ disability, BPL',
    eligibilityCriteria: [
      'Age 18+ with 80%+ disability, BPL.',
      'Must suffer from severe or multiple disabilities with minimum 80% disability certified by medical authority.',
      'Must belong to a Below Poverty Line (BPL) household.',
      'Automatically elevated to ₹500 monthly rate upon reaching age 80.'
    ],
    requiredDocuments: [
      'Disability certificate',
      'Unique Disability ID (UDID) card or medical board certificate',
      'Age proof document (18+ years)',
      'BPL card / certificate and bank passbook'
    ],
    portal: 'nsap.nic.in',
    verificationStatus: 'Verified',
    benefitUnitExplanation: 'Entitlement is tied to the INDIVIDUAL beneficiary based on certified medical disability and poverty threshold.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'What minimum disability percentage is required for IGNDPS?',
        a: 'The scheme mandates a certified disability degree of 80% or higher from an authorized medical board.'
      }
    ]
  },
  {
    id: 'SCH-19',
    code: 'NFBS-19',
    name: 'National Family Benefit Scheme',
    category: 'Pensions (central, NSAP)',
    department: 'National Social Assistance Programme (NSAP), Ministry of Rural Development',
    benefitUnit: 'Household',
    benefitAmount: 'One-time grant to the household (amount not verified)',
    shortDescription: 'One-time lump-sum financial assistance to a BPL household on the death of the primary breadwinner aged between 18 and 60.',
    fullDescription: 'Under NSAP, the National Family Benefit Scheme delivers immediate one-time financial relief to a bereaved Below Poverty Line family following the untimely demise of its primary breadwinner (aged 18 to 60).',
    intendedBeneficiary: 'BPL household where the breadwinner died between ages 18 and 60',
    eligibilityCriteria: [
      'BPL household where the breadwinner died between ages 18 and 60.',
      'The deceased must have been the primary economic earner for the family.',
      'The death must have occurred while the breadwinner was between 18 and 60 years old.',
      'Application must be submitted within statutory window following demise.'
    ],
    requiredDocuments: [
      'Death certificate (other documents not verified)',
      'Age proof of the deceased breadwinner showing age 18-60',
      'BPL card / verification certificate',
      'Bank passbook of surviving spouse or adult head'
    ],
    portal: 'nsap.nic.in',
    verificationStatus: 'Partly verified',
    benefitUnitExplanation: 'Benefit is granted to the surviving HOUSEHOLD unit. Duplicate claims for the same deceased breadwinner are flagged and disallowed.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'Who in the family receives the one-time NFBS grant?',
        a: 'The one-time financial grant is deposited into the verified bank account of the surviving spouse or the eldest surviving adult member of the household.'
      }
    ]
  },
  {
    id: 'SCH-20',
    code: 'UP-OAP-20',
    name: 'UP Old Age Pension',
    category: 'Uttar Pradesh',
    department: 'Social Welfare Department, Government of Uttar Pradesh',
    benefitUnit: 'Individual',
    benefitAmount: 'Rs 1,000 a month',
    shortDescription: 'Monthly pension of ₹1,000 for senior citizens aged 60+ residing in Uttar Pradesh with annual income up to ₹46,080 (rural) / ₹56,460 (urban).',
    fullDescription: 'The Uttar Pradesh Social Welfare Department provides ₹1,000 per month (transferred quarterly as ₹3,000) to elderly citizens aged 60 years and above who are permanent residents of UP and meet state income eligibility ceilings.',
    intendedBeneficiary: 'Age 60+ and BPL or annual income up to Rs 46,080 (rural) / Rs 56,460 (urban); not eligible if getting another pension',
    eligibilityCriteria: [
      'Age 60+ and BPL or annual income up to Rs 46,080 (rural) / Rs 56,460 (urban); not eligible if getting another pension.',
      'Must be a permanent resident of Uttar Pradesh.',
      'Must not be in receipt of any other pension (widow, disability, or civil service).',
      'Must have an active savings bank account in UP.'
    ],
    requiredDocuments: [
      'Photograph and age certificate; apply online',
      'Income certificate from Tehsildar (rural ≤ ₹46,080 / urban ≤ ₹56,460)',
      'Bank passbook (Aadhaar-seeded)',
      'Aadhaar Card and self-declaration form'
    ],
    portal: 'sspy-up.gov.in',
    verificationStatus: 'Verified',
    benefitUnitExplanation: 'Benefit is awarded to the INDIVIDUAL senior. If both husband and wife are 60+ and meet income criteria, both receive ₹1,000/month each.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'Can a person receiving a widow pension also receive the UP Old Age Pension?',
        a: 'No. The rules explicitly state that applicants receiving any other government pension are not eligible for this pension.'
      }
    ]
  },
  {
    id: 'SCH-21',
    code: 'UP-WIDOW-21',
    name: 'UP Destitute Women (Widow) Pension',
    category: 'Uttar Pradesh',
    department: 'Women and Child Development / Social Welfare, Government of Uttar Pradesh',
    benefitUnit: 'Individual',
    benefitAmount: 'Rs 1,000 a month (raised in 2024-25 budget)',
    shortDescription: 'Monthly pension of ₹1,000 for destitute widows aged 18 and above in Uttar Pradesh, with no upper age limit.',
    fullDescription: 'The Government of Uttar Pradesh provides ₹1,000 per month (raised in the 2024-25 budget, paid quarterly) to destitute widowed women aged 18 and older who are not in receipt of any other government pension.',
    intendedBeneficiary: 'Women 18+, no upper age limit, not receiving any other pension',
    eligibilityCriteria: [
      'Women 18+, no upper age limit, not receiving any other pension.',
      'Must be a permanent resident of Uttar Pradesh.',
      'Must be a widow who has not remarried.',
      'Must satisfy family poverty/income ceiling criteria.'
    ],
    requiredDocuments: [
      'Photo, husband\'s death certificate, income certificate, passbook',
      'Aadhaar card of applicant',
      'Apply online via sspy-up.gov.in',
      'Mobile number for application status alerts'
    ],
    portal: 'sspy-up.gov.in',
    verificationStatus: 'Verified',
    benefitUnitExplanation: 'Benefit attaches to the INDIVIDUAL destitute woman. UDPAD cross-references marital and death records to ensure clean verification.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'Is there an upper age limit for the UP Widow Pension?',
        a: 'No. The scheme covers eligible widowed women aged 18 and above with no upper age limit.'
      }
    ]
  },
  {
    id: 'SCH-22',
    code: 'UP-DISABILITY-22',
    name: 'UP Disability and Leprosy Pension',
    category: 'Uttar Pradesh',
    department: 'Divyangjan Sashaktikaran Vibhag (Empowerment of Persons with Disabilities), UP',
    benefitUnit: 'Individual',
    benefitAmount: 'Monthly pension (amount not verified)',
    shortDescription: 'Monthly social security pension for persons with disabilities (Divyangjan) and leprosy-affected persons in Uttar Pradesh.',
    fullDescription: 'The Department of Empowerment of Persons with Disabilities, Uttar Pradesh provides regular monthly financial pension assistance to certified Divyangjan and leprosy-affected residents of the state.',
    intendedBeneficiary: 'Criteria not verified',
    eligibilityCriteria: [
      'Criteria not verified.',
      'Permanent resident of Uttar Pradesh.',
      'Possession of valid disability certificate (minimum 40% disability) or leprosy medical record.',
      'Must meet state poverty/income ceiling requirements and not receive another pension.'
    ],
    requiredDocuments: [
      'Apply online',
      'Disability Certificate from Chief Medical Officer (CMO) or UDID card',
      'Income Certificate issued by Tehsildar',
      'Applicant photograph and bank passbook'
    ],
    portal: 'sspy-up.gov.in',
    verificationStatus: 'Partly verified',
    benefitUnitExplanation: 'Granted directly to the INDIVIDUAL Divyang person based on certified medical disability and state norms.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'Where can I apply for the UP Divyangjan pension?',
        a: 'Applications can be submitted online directly through the Integrated Pension Portal at sspy-up.gov.in.'
      }
    ]
  },
  {
    id: 'SCH-23',
    code: 'UP-MKSY-23',
    name: 'Kanya Sumangala Yojana',
    category: 'Uttar Pradesh',
    department: 'Department of Women and Child Development, Government of Uttar Pradesh',
    benefitUnit: 'Individual',
    benefitAmount: 'Aid for girls; amount increased in the 2024 UP budget (figure not available)',
    shortDescription: 'Milestone-based financial assistance for girls across six development stages from birth through higher education in UP.',
    fullDescription: 'Mukhyamantri Kanya Sumangala Yojana provides conditional cash assistance to girl children in Uttar Pradesh disbursed across six stages: birth, complete vaccination, Class 1 admission, Class 6, Class 9 and enrollment in degree/diploma courses. Amount increased in the 2024 UP budget.',
    intendedBeneficiary: 'Not verified',
    eligibilityCriteria: [
      'Not verified.',
      'Family must be permanent residents of Uttar Pradesh.',
      'Annual family income ceiling as prescribed by UP state guidelines.',
      'Maximum of two daughters per family (third daughter eligible in case of twin girls in second delivery).'
    ],
    requiredDocuments: [
      'Not verified',
      'Birth certificate of the girl child',
      'Immunization card / school enrollment certificate',
      'Mother / father domicile certificate and bank passbook'
    ],
    portal: 'Not verified',
    verificationStatus: 'Partly verified',
    benefitUnitExplanation: 'Assistance is registered for the INDIVIDUAL girl child, capped at two qualifying daughters per family unit.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'How many daughters in a family can benefit from Kanya Sumangala Yojana?',
        a: 'Up to two daughters per family can benefit (or three in the special case of twins born in a second delivery).'
      }
    ]
  },
  {
    id: 'SCH-24',
    code: 'PRE-MATRIC-24',
    name: 'Pre-Matric Scholarships',
    category: 'Education',
    department: 'Ministry of Social Justice / Ministry of Tribal Affairs / Ministry of Minority Affairs',
    benefitUnit: 'Individual',
    benefitAmount: 'Maintenance allowance; fees for some schemes',
    shortDescription: 'Maintenance allowance and tuition fee support for SC, ST and OBC students in Classes 9-10 and minority students in Classes 1-10.',
    fullDescription: 'Pre-Matric scholarship schemes provide financial assistance to reduce school dropouts among disadvantaged students, covering school fees and regular monthly maintenance allowances directly deposited into student bank accounts.',
    intendedBeneficiary: 'SC, ST and OBC students in Classes 9-10; minority students in Classes 1-10',
    eligibilityCriteria: [
      'SC, ST and OBC students in Classes 9-10; minority students in Classes 1-10.',
      'Enrolled in recognized government or affiliated private institutions.',
      'Parental annual income within prescribed department limits.',
      'Satisfactory academic performance and attendance record.'
    ],
    requiredDocuments: [
      'One-Time Registration and caste/community certificate',
      'Income certificate of parents/guardians',
      'Previous year mark sheet / class report card',
      'Student bank account details (Aadhaar-seeded)'
    ],
    portal: 'scholarships.gov.in; scholarship.up.gov.in',
    verificationStatus: 'Verified',
    benefitUnitExplanation: 'Benefit attaches to the INDIVIDUAL student. Multiple eligible siblings in qualifying classes can each claim their individual scholarship.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'What is One-Time Registration (OTR)?',
        a: 'OTR is a unique 14-digit registration number generated on the National Scholarship Portal (scholarships.gov.in) with biometric or Aadhaar e-KYC.'
      }
    ]
  },
  {
    id: 'SCH-25',
    code: 'POST-MATRIC-25',
    name: 'Post-Matric Scholarships',
    category: 'Education',
    department: 'Ministry of Social Justice and Empowerment / Ministry of Education',
    benefitUnit: 'Individual',
    benefitAmount: 'Maintenance allowance and fee reimbursement',
    shortDescription: 'Full maintenance allowance and fee reimbursement for SC, ST, OBC and minority students from Class 11 onward (income ceiling ₹2.5 lakh).',
    fullDescription: 'The Centrally Sponsored Post-Matric Scholarship Scheme delivers comprehensive financial assistance to disadvantaged students continuing education post-matriculation, including Class 11, Class 12, ITI, polytechnic, undergraduate, postgraduate and professional degree courses.',
    intendedBeneficiary: 'SC, ST, OBC and minority students from Class 11 onward; income ceiling Rs 2.5 lakh',
    eligibilityCriteria: [
      'SC, ST, OBC and minority students from Class 11 onward; income ceiling Rs 2.5 lakh.',
      'Must be enrolled in a recognized post-matric course in an approved college/university.',
      'Parental/guardian combined annual income must not exceed ₹2,50,000.',
      'Student must not be receiving any concurrent major scholarship grant.'
    ],
    requiredDocuments: [
      'One-Time Registration and caste/community certificate. Most close Oct 31, 2026',
      'Income Certificate verifying annual income up to Rs 2.5 lakh',
      'Class 10 mark sheet and current admission fee receipt',
      'Student Aadhaar-seeded bank account'
    ],
    portal: 'scholarships.gov.in; scholarship.up.gov.in',
    verificationStatus: 'Verified',
    benefitUnitExplanation: 'Awarded to the INDIVIDUAL student. UDPAD and NSP verify academic enrollment records to prevent duplicate scholarship disbursals across multiple colleges.',
    applicationStatus: 'Open',
    faq: [
      {
        q: 'What is the application deadline for Post-Matric scholarships?',
        a: 'For the academic cycle, most Post-Matric scholarship schemes close on October 31, 2026. Please check scholarships.gov.in for specific scheme windows.'
      },
      {
        q: 'What is the parental income ceiling for Post-Matric scholarships?',
        a: 'The annual parental/family income ceiling is strictly Rs 2.5 lakh per annum.'
      }
    ]
  }
];
