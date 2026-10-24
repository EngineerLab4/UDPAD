import express from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/household
router.get('/', requireAuth, async (req, res) => {
  try {
    const hh = await db.getHousehold(req.citizen);
    res.json({ success: true, household: hh });
  } catch (err) {
    console.error('Fetch household error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve household data.' });
  }
});

// POST /api/household/members
router.post('/members', requireAuth, async (req, res) => {
  try {
    const { fullName, relation, age, gender, occupation, education, status } = req.body;

    if (!fullName || !relation) {
      return res.status(400).json({
        success: false,
        error: 'Member full name and relationship are required.'
      });
    }

    const updatedHh = await db.addHouseholdMember(req.citizen, {
      fullName: fullName.trim(),
      relation: relation.trim(),
      age,
      gender,
      occupation,
      education,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Family member registered into household successfully.',
      household: updatedHh
    });
  } catch (err) {
    console.error('Add household member error:', err);
    res.status(500).json({ success: false, error: 'Failed to add family member.' });
  }
});

// POST /api/household/dwellings
router.post('/dwellings', requireAuth, async (req, res) => {
  try {
    const { address, type, ownership, electricityMeterNo, waterConnectionNo } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Dwelling physical address is required.'
      });
    }

    const updatedHh = await db.addHouseholdDwelling(req.citizen, {
      address: address.trim(),
      type,
      ownership,
      electricityMeterNo,
      waterConnectionNo
    });

    res.status(201).json({
      success: true,
      message: 'Dwelling linkage added successfully.',
      household: updatedHh
    });
  } catch (err) {
    console.error('Add dwelling error:', err);
    res.status(500).json({ success: false, error: 'Failed to add dwelling linkage.' });
  }
});

export default router;
