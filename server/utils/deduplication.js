/**
 * UDPAD Deduplication & Household Verification Engine
 * Normalizes names, performs cautious similarity matching, and enforces scheme eligibility scopes.
 */

export function normalizeString(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Computes Levenshtein-based string similarity score between 0.0 and 1.0.
 */
export function stringSimilarity(s1, s2) {
  const n1 = normalizeString(s1);
  const n2 = normalizeString(s2);
  if (!n1 || !n2) return 0;
  if (n1 === n2) return 1.0;

  const len1 = n1.length;
  const len2 = n2.length;
  const maxLen = Math.max(len1, len2);
  if (maxLen === 0) return 1.0;

  // Space-efficient matrix
  const matrix = Array.from({ length: len1 + 1 }, () => new Array(len2 + 1).fill(0));
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = n1[i - 1] === n2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  return Math.max(0, 1 - distance / maxLen);
}

/**
 * Normalizes address for fuzzy comparison
 */
export function extractAddressText(addr) {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  const parts = [
    addr.fullAddress,
    addr.addressLine1,
    addr.addressLine2,
    addr.village,
    addr.district,
    addr.state,
    addr.pincode
  ].filter(Boolean);
  return parts.join(' ');
}

export function compareAddresses(addr1, addr2) {
  const t1 = normalizeString(extractAddressText(addr1));
  const t2 = normalizeString(extractAddressText(addr2));
  if (!t1 || !t2) return { isMatch: false, similarity: 0 };
  if (t1 === t2) return { isMatch: true, similarity: 1.0, isExact: true };

  const sim = stringSimilarity(t1, t2);
  // Also check token overlap for addresses
  const tokens1 = new Set(t1.split(' ').filter((w) => w.length > 2));
  const tokens2 = new Set(t2.split(' ').filter((w) => w.length > 2));
  let overlap = 0;
  for (const token of tokens1) {
    if (tokens2.has(token)) overlap++;
  }
  const minTokens = Math.min(tokens1.size, tokens2.size);
  const tokenOverlapScore = minTokens > 0 ? overlap / minTokens : 0;

  const isMatch = sim >= 0.82 || tokenOverlapScore >= 0.75;
  return {
    isMatch,
    similarity: Math.max(sim, tokenOverlapScore),
    isExact: sim === 1.0
  };
}

/**
 * Determine scheme eligibility scope (household vs individual)
 */
export function getSchemeEligibilityScope(scheme) {
  if (!scheme) return 'individual';
  if (scheme.eligibilityScope) return scheme.eligibilityScope.toLowerCase();
  if (scheme.eligibility_scope) return scheme.eligibility_scope.toLowerCase();

  const benefitUnit = (scheme.benefitUnit || scheme.benefit_unit || '').toLowerCase();
  if (benefitUnit.includes('household') || benefitUnit.includes('dwelling') || benefitUnit.includes('facility')) {
    return 'household';
  }

  const code = (scheme.code || '').toUpperCase();
  const householdCodes = ['PMGKAY-01', 'VB-GRAM-G-03', 'PM-JAY-07', 'PMAY-U2-12', 'PMAY-G-13', 'PM-UJJWALA-14', 'PM-SURYA-15', 'NFBS-19'];
  if (householdCodes.includes(code)) {
    return 'household';
  }

  return 'individual';
}

/**
 * Core Duplicate & Family Household Matcher
 * Compares candidate against an existing citizen record.
 */
export function compareCitizenFamily(candidate, existing) {
  if (!candidate || !existing) return null;
  if (candidate.citizenId && candidate.citizenId === existing.citizenId) return null;
  if (candidate.id && candidate.id === existing.id) return null;

  const cFather = candidate.fatherName || candidate.address?.fatherName || '';
  const eFather = existing.fatherName || existing.father_name || existing.address?.fatherName || '';

  const cMother = candidate.motherName || candidate.address?.motherName || '';
  const eMother = existing.motherName || existing.mother_name || existing.address?.motherName || '';

  const cAddr = candidate.fullAddress || candidate.address;
  const eAddr = existing.fullAddress || existing.full_address || existing.address;

  let fatherExact = false;
  let fatherSimilar = false;
  let fatherSimilarity = 0;

  if (cFather && eFather) {
    const normC = normalizeString(cFather);
    const normE = normalizeString(eFather);
    if (normC.length >= 3 && normE.length >= 3) {
      if (normC === normE) {
        fatherExact = true;
        fatherSimilarity = 1.0;
      } else {
        fatherSimilarity = stringSimilarity(normC, normE);
        if (fatherSimilarity >= 0.85) {
          fatherSimilar = true;
        }
      }
    }
  }

  let motherExact = false;
  let motherSimilar = false;
  let motherSimilarity = 0;

  if (cMother && eMother) {
    const normC = normalizeString(cMother);
    const normE = normalizeString(eMother);
    if (normC.length >= 3 && normE.length >= 3) {
      if (normC === normE) {
        motherExact = true;
        motherSimilarity = 1.0;
      } else {
        motherSimilarity = stringSimilarity(normC, normE);
        if (motherSimilarity >= 0.85) {
          motherSimilar = true;
        }
      }
    }
  }

  const addrResult = compareAddresses(cAddr, eAddr);

  // Check if both parents match
  const fatherMatch = fatherExact || fatherSimilar;
  const motherMatch = motherExact || motherSimilar;

  if (!fatherMatch && !motherMatch && !addrResult.isMatch) {
    return null;
  }

  let matchingReason = '';
  let matchCategory = 'possible'; // 'exact' | 'possible'
  let confidence = 'medium';

  if (fatherMatch && motherMatch) {
    matchingReason = 'Both Father and Mother names match an existing citizen record';
    if (fatherExact && motherExact) {
      matchCategory = 'exact';
      confidence = 'high';
    } else {
      matchCategory = 'possible';
      confidence = 'medium';
      matchingReason += ' (with minor spelling variations)';
    }
  } else if (fatherMatch) {
    matchingReason = fatherExact
      ? "Father's name matches an existing citizen record"
      : "Father's name has high spelling similarity with an existing citizen record";
    matchCategory = fatherExact ? 'exact' : 'possible';
    confidence = fatherExact ? 'medium' : 'cautious_review';
  } else if (motherMatch) {
    matchingReason = motherExact
      ? "Mother's name matches an existing citizen record"
      : "Mother's name has high spelling similarity with an existing citizen record";
    matchCategory = motherExact ? 'exact' : 'possible';
    confidence = motherExact ? 'medium' : 'cautious_review';
  } else if (addrResult.isMatch) {
    matchingReason = addrResult.isExact
      ? 'Exact residential address match with an existing household'
      : 'Potential residential address match with an existing household';
    matchCategory = addrResult.isExact ? 'exact' : 'possible';
    confidence = addrResult.isExact ? 'medium' : 'cautious_review';
  }

  if (addrResult.isMatch && (fatherMatch || motherMatch)) {
    matchingReason += ' and shared residential address detected';
    confidence = 'high';
  }

  let matchReason = 'address';
  if (fatherMatch && motherMatch) {
    matchReason = 'both_parents';
  } else if (fatherMatch) {
    matchReason = 'father';
  } else if (motherMatch) {
    matchReason = 'mother';
  }

  return {
    matchReason,
    reason: matchReason,
    matchedCitizenId: existing.citizenId || existing.id,
    matchedCitizenName: existing.fullName || existing.full_name || 'Existing Registered Citizen',
    matchedFatherName: eFather,
    matchedMotherName: eMother,
    matchedHouseholdRef: existing.householdId || existing.household_id || 'HH-UNKNOWN',
    matchedAddress: extractAddressText(eAddr),
    matchingReason,
    matchCategory,
    confidence,
    fatherMatch: { exact: fatherExact, similar: fatherSimilar, score: fatherSimilarity },
    motherMatch: { exact: motherExact, similar: motherSimilar, score: motherSimilarity },
    addressMatch: addrResult
  };
}
