import jwt from 'jsonwebtoken';
import { config } from '../config.js';

/**
 * Generate a signed JSON Web Token for an authenticated citizen.
 * @param {Object} citizen
 * @returns {string} JWT string
 */
export function generateCitizenToken(citizen) {
  if (!citizen || !citizen.citizenId) {
    throw new Error('Citizen record with valid citizenId is required to generate authentication token.');
  }

  const payload = {
    citizenId: citizen.citizenId || citizen.officialId,
    id: citizen.id,
    mobile: citizen.mobile || '',
    email: citizen.email || '',
    role: citizen.role || (citizen.email?.toLowerCase().endsWith('@gov.in') ? 'OFFICER' : 'CITIZEN'),
    designation: citizen.designation || '',
    officialId: citizen.officialId || citizen.citizenId || ''
  };

  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
}

/**
 * Verify a JSON Web Token string using the server secret.
 * @param {string} token
 * @returns {Object} Decoded payload
 */
export function verifyCitizenToken(token) {
  return jwt.verify(token, config.jwtSecret);
}
