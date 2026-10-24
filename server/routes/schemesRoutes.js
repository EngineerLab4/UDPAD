import express from 'express';
import { db } from '../db/index.js';

const router = express.Router();

// GET /api/schemes
router.get('/', async (req, res) => {
  try {
    const { category, unit, q } = req.query;
    const schemes = await db.getSchemes({ category, unit, query: q });
    res.json({ success: true, count: schemes.length, schemes });
  } catch (err) {
    console.error('Fetch schemes error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve schemes directory.' });
  }
});

// GET /api/schemes/:id
router.get('/:id', async (req, res) => {
  try {
    const scheme = await db.getSchemeById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ success: false, error: 'Scheme not found.' });
    }
    res.json({ success: true, scheme });
  } catch (err) {
    console.error('Fetch scheme details error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve scheme details.' });
  }
});

export default router;
