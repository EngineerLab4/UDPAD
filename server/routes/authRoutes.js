import express from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { generateCitizenToken } from '../utils/jwt.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, mobile, email, password, gender, occupation, fatherName, motherName, caste, casteOther, fullAddress } = req.body;

    if (!fullName || !mobile || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required registration fields: Full Name, Mobile and Password are required.'
      });
    }

    if (caste === 'Other' && !casteOther?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please specify your caste name when selecting "Other".'
      });
    }

    if (fullAddress && fullAddress.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid residential address (at least 5 characters).'
      });
    }

    // Check duplicate mobile
    const existing = await db.getCitizenByMobileOrEmail(mobile);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An account with this mobile number already exists. Please sign in instead.'
      });
    }

    const newCitizen = await db.createCitizen({
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      email: email ? email.trim() : '',
      password: password,
      gender: gender || 'Not Specified',
      occupation: occupation || 'Citizen',
      fatherName: fatherName ? fatherName.trim() : '',
      motherName: motherName ? motherName.trim() : '',
      caste: caste ? caste.trim() : '',
      casteOther: casteOther ? casteOther.trim() : '',
      fullAddress: fullAddress ? fullAddress.trim() : ''
    });

    const token = generateCitizenToken(newCitizen);

    const sessionUser = {
      id: newCitizen.id,
      citizenId: newCitizen.citizenId,
      fullName: newCitizen.fullName,
      mobile: newCitizen.mobile,
      email: newCitizen.email,
      gender: newCitizen.gender,
      occupation: newCitizen.occupation,
      householdId: newCitizen.householdId,
      address: newCitizen.address,
      fatherName: newCitizen.fatherName,
      motherName: newCitizen.motherName,
      caste: newCitizen.caste,
      casteOther: newCitizen.casteOther,
      fullAddress: newCitizen.fullAddress,
      token
    };

    res.status(201).json({
      success: true,
      message: 'Citizen registration successful.',
      user: sessionUser,
      token
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: 'Registration failed due to server error.' });
  }
});

import { DEFAULT_GOV_OFFICIALS } from '../data/officials.js';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const rawIdentifier = req.body.mobileOrEmail || req.body.identifier || req.body.mobile || req.body.email;
    const { password } = req.body;

    if (!rawIdentifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter your registered mobile number or email and password.'
      });
    }

    const cleanIdentifier = String(rawIdentifier).trim().toLowerCase();
    const isGovOfficial = cleanIdentifier.endsWith('@gov.in');

    // 1. Government Official Authentication (@gov.in)
    if (isGovOfficial) {
      let official = DEFAULT_GOV_OFFICIALS.find(
        (o) => o.email.toLowerCase() === cleanIdentifier || o.mobile === cleanIdentifier
      );

      if (official) {
        if (official.password !== password) {
          return res.status(401).json({
            success: false,
            error: 'Invalid official credentials. Incorrect password for official @gov.in account.'
          });
        }
      } else {
        // Check database
        official = await db.getCitizenByMobileOrEmail(cleanIdentifier);
        if (official) {
          if (official.password !== password) {
            return res.status(401).json({
              success: false,
              error: 'Invalid official credentials. Incorrect password for official @gov.in account.'
            });
          }
        } else {
          // Dynamically provision official profile for any valid authorized @gov.in email
          const namePart = cleanIdentifier.split('@')[0].replace(/[._]/g, ' ');
          const formattedName = namePart
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ') || 'Government Official';

          const newOfficialData = {
            fullName: `${formattedName} (Officer)`,
            mobile: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
            email: cleanIdentifier,
            password: password,
            gender: 'Not Specified',
            occupation: 'Government Official'
          };
          official = await db.createCitizen(newOfficialData);
        }
      }

      official.role = 'OFFICER';
      official.designation = official.designation || 'Zonal Field Verification Officer';
      official.department = official.department || 'Department of Social Justice & Empowerment';
      official.officialId = official.officialId || official.citizenId;

      const token = generateCitizenToken(official);

      const sessionUser = {
        id: official.id,
        citizenId: official.citizenId || official.officialId,
        officialId: official.officialId || official.citizenId,
        fullName: official.fullName,
        designation: official.designation,
        department: official.department,
        jurisdiction: official.jurisdiction || 'Zonal Administrative Division',
        mobile: official.mobile,
        email: official.email,
        role: 'OFFICER',
        gender: official.gender,
        occupation: official.occupation,
        householdId: official.householdId,
        address: official.address,
        token
      };

      return res.json({
        success: true,
        message: 'Government Official sign in successful.',
        user: sessionUser,
        token
      });
    }

    // 2. Standard Citizen Authentication
    const citizen = await db.getCitizenByMobileOrEmail(rawIdentifier);
    if (!citizen || citizen.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. No registered citizen account matches this mobile number/email and password. Please check your input or click "Register as a citizen" to create your account.'
      });
    }

    const token = generateCitizenToken(citizen);

    const sessionUser = {
      id: citizen.id,
      citizenId: citizen.citizenId,
      fullName: citizen.fullName,
      mobile: citizen.mobile,
      email: citizen.email,
      gender: citizen.gender,
      occupation: citizen.occupation,
      householdId: citizen.householdId,
      address: citizen.address,
      fatherName: citizen.fatherName || citizen.address?.fatherName || '',
      motherName: citizen.motherName || citizen.address?.motherName || '',
      caste: citizen.caste || citizen.address?.caste || '',
      casteOther: citizen.casteOther || citizen.address?.casteOther || '',
      fullAddress: citizen.fullAddress || citizen.address?.fullAddress || citizen.address?.addressLine1 || '',
      token
    };

    res.json({
      success: true,
      message: 'Sign in successful.',
      user: sessionUser,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Sign in failed due to server error.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const citizen = req.citizen;
  res.json({
    success: true,
    user: {
      id: citizen.id,
      citizenId: citizen.citizenId,
      fullName: citizen.fullName,
      mobile: citizen.mobile,
      email: citizen.email,
      gender: citizen.gender,
      occupation: citizen.occupation,
      householdId: citizen.householdId,
      address: citizen.address,
      fatherName: citizen.fatherName || citizen.address?.fatherName || '',
      motherName: citizen.motherName || citizen.address?.motherName || '',
      caste: citizen.caste || citizen.address?.caste || '',
      casteOther: citizen.casteOther || citizen.address?.casteOther || '',
      fullAddress: citizen.fullAddress || citizen.address?.fullAddress || citizen.address?.addressLine1 || ''
    }
  });
});

// PUT /api/auth/profile - Update citizen demographic and family profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const citizenId = req.citizen.citizenId || req.citizen.id;
    const { fullName, fatherName, motherName, caste, casteOther, fullAddress, gender, occupation } = req.body;

    if (caste === 'Other' && !casteOther?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please specify your caste name when selecting "Other".'
      });
    }

    if (fullAddress && fullAddress.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid residential address (at least 5 characters).'
      });
    }

    const updatedCitizen = await db.updateCitizenProfile(citizenId, {
      fullName,
      fatherName,
      motherName,
      caste,
      casteOther,
      fullAddress,
      gender,
      occupation
    });

    const token = generateCitizenToken(updatedCitizen);

    const sessionUser = {
      id: updatedCitizen.id,
      citizenId: updatedCitizen.citizenId,
      fullName: updatedCitizen.fullName,
      mobile: updatedCitizen.mobile,
      email: updatedCitizen.email,
      gender: updatedCitizen.gender,
      occupation: updatedCitizen.occupation,
      householdId: updatedCitizen.householdId,
      address: updatedCitizen.address,
      fatherName: updatedCitizen.fatherName,
      motherName: updatedCitizen.motherName,
      caste: updatedCitizen.caste,
      casteOther: updatedCitizen.casteOther,
      fullAddress: updatedCitizen.fullAddress,
      token
    };

    res.json({
      success: true,
      message: 'Citizen profile and family details updated successfully in database.',
      user: sessionUser,
      token
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to update citizen profile.'
    });
  }
});

// POST /api/auth/recover
router.post('/recover', async (req, res) => {
  try {
    const { mobileOrEmail } = req.body;
    if (!mobileOrEmail) {
      return res.status(400).json({ success: false, error: 'Please enter mobile number or email.' });
    }

    const citizen = await db.getCitizenByMobileOrEmail(mobileOrEmail);
    if (citizen) {
      res.json({
        success: true,
        message: 'Account verified. Password reset verification advice sent via simulated SMS to your registered mobile number.',
        mobile: citizen.mobile
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'No citizen account found matching this mobile number or email address.'
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Account recovery failed.' });
  }
});

export default router;
