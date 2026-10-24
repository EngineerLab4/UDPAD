import express from 'express';
import { db } from '../db/index.js';

const router = express.Router();

/**
 * GET /api/census
 * Read-only paginated list of census records with filtering and search support.
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const district = req.query.district ? String(req.query.district).trim() : undefined;
    const tehsil = req.query.tehsil ? String(req.query.tehsil).trim() : undefined;
    const village = req.query.village ? String(req.query.village).trim() : undefined;
    const gender = req.query.gender ? String(req.query.gender).trim() : undefined;
    const socialCategory = req.query.socialCategory ? String(req.query.socialCategory).trim() : undefined;
    const search = req.query.search || req.query.q ? String(req.query.search || req.query.q).trim() : undefined;

    const result = await db.getCensusRecords({
      page,
      limit,
      district,
      tehsil,
      village,
      gender,
      socialCategory,
      search
    });

    res.json({
      success: true,
      source: result.source,
      pagination: result.pagination,
      filters: result.filters,
      data: result.records
    });
  } catch (error) {
    console.error('Error fetching census records:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch census records from database or fallback dataset.'
    });
  }
});

/**
 * GET /api/census/stats/summary
 * Aggregate metrics and demography breakdown for census dataset.
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await db.getCensusStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching census stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compute census analytics.'
    });
  }
});

/**
 * GET /api/census/:personId
 * Fetch single census record by person ID (e.g. P000001).
 */
router.get('/:personId', async (req, res) => {
  try {
    const { personId } = req.params;
    const result = await db.getCensusPersonById(personId);

    if (!result || !result.record) {
      return res.status(404).json({
        success: false,
        error: `Census record with ID '${personId}' was not found.`
      });
    }

    res.json({
      success: true,
      source: result.source,
      data: result.record
    });
  } catch (error) {
    console.error('Error fetching census person:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch census record.'
    });
  }
});

export default router;
