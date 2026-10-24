import express from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/benefits - List authenticated citizen's benefits ledger
router.get('/', requireAuth, async (req, res) => {
  try {
    const benefits = await db.getBenefits(req.citizen.citizenId);
    res.json({ success: true, count: benefits.length, benefits });
  } catch (err) {
    console.error('Fetch benefits error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve benefits history.' });
  }
});

// POST /api/benefits - Record benefit entry for authenticated citizen
router.post('/', requireAuth, async (req, res) => {
  try {
    const { schemeCode, benefitName, benefitUnit, recipientName, amountOrItem, deliveringAgency, status } = req.body;
    if (!schemeCode || !benefitName || !amountOrItem) {
      return res.status(400).json({
        success: false,
        error: 'Scheme code, benefit name and amount or item are required.'
      });
    }

    const benefit = await db.addBenefit(req.citizen.citizenId, {
      schemeCode,
      benefitName,
      benefitUnit,
      recipientName: recipientName || req.citizen.fullName,
      householdRef: req.citizen.householdId,
      amountOrItem,
      deliveringAgency,
      status
    });

    res.status(201).json({ success: true, benefit });
  } catch (err) {
    console.error('Record benefit error:', err);
    res.status(500).json({ success: false, error: 'Failed to record benefit.' });
  }
});

export default router;
