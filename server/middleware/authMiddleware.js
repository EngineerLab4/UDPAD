import { verifyCitizenToken } from '../utils/jwt.js';
import { db } from '../db/index.js';
import { DEFAULT_GOV_OFFICIALS } from '../data/officials.js';

/**
 * Require valid JWT authentication.
 * Raw citizen ID headers or unsigned tokens are strictly rejected.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    let token = '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing or malformed Bearer authorization token. Please sign in.'
      });
    }

    let payload;
    try {
      payload = verifyCitizenToken(token);
    } catch (jwtErr) {
      const isExpired = jwtErr.name === 'TokenExpiredError';
      return res.status(401).json({
        success: false,
        error: isExpired
          ? 'Unauthorized: Authentication session has expired. Please sign in again.'
          : 'Unauthorized: Invalid or forged authentication token signature.'
      });
    }

    const citizenIdentifier = payload.citizenId || payload.id;
    if (!citizenIdentifier) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Token payload is missing citizen identification.'
      });
    }

    // Lookup verified citizen in database / store
    let citizen = await db.getCitizenById(citizenIdentifier);
    if (!citizen && payload.role === 'OFFICER') {
      citizen = DEFAULT_GOV_OFFICIALS.find(
        (o) => o.citizenId === citizenIdentifier || o.id === citizenIdentifier || o.officialId === citizenIdentifier || o.email === payload.email
      );
    }

    if (!citizen) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Registered citizen record matching this verified token was not found.'
      });
    }

    if (payload.role === 'OFFICER' || (citizen.email && citizen.email.toLowerCase().endsWith('@gov.in'))) {
      citizen.role = 'OFFICER';
      req.isOfficer = true;
      req.officer = citizen;
    }

    req.citizen = citizen;
    req.auth = payload;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ success: false, error: 'Authentication processing failed.' });
  }
};

/**
 * Optional authentication middleware.
 * Verifies JWT if present; never creates ephemeral fallback sessions.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token) {
        try {
          const payload = verifyCitizenToken(token);
          const citizenIdentifier = payload.citizenId || payload.id;
          if (citizenIdentifier) {
            const citizen = await db.getCitizenById(citizenIdentifier);
            if (citizen) {
              req.citizen = citizen;
              req.auth = payload;
            }
          }
        } catch (e) {
          req.citizen = null;
        }
      }
    }
    next();
  } catch (e) {
    next();
  }
};

/**
 * Require government officer role.
 * Strictly blocks citizen sessions from accessing officer endpoints.
 */
export const requireOfficer = async (req, res, next) => {
  return requireAuth(req, res, () => {
    const isOfficer = req.isOfficer || req.citizen?.role === 'OFFICER' || (req.citizen?.email && req.citizen.email.toLowerCase().endsWith('@gov.in'));
    if (!isOfficer) {
      return res.status(403).json({
        success: false,
        error: 'Access forbidden: Only authorized government officials can access this resource.'
      });
    }
    next();
  });
};
