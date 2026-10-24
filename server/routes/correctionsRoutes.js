import express from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/corrections - List authenticated citizen's appeals (or all for officer)
router.get('/', requireAuth, async (req, res) => {
  try {
    const isOfficer = req.isOfficer || req.citizen?.role === 'OFFICER' || (req.citizen?.email && req.citizen.email.toLowerCase().endsWith('@gov.in'));
    const corrections = isOfficer
      ? await db.getAllCorrections()
      : await db.getCorrections(req.citizen.citizenId);
    res.json({ success: true, count: corrections.length, corrections });
  } catch (err) {
    console.error('Fetch corrections error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve corrections and appeals.' });
  }
});

// PATCH /api/corrections/:id/status - Government official adjudicates appeal
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const isOfficer = req.isOfficer || req.citizen?.role === 'OFFICER' || (req.citizen?.email && req.citizen.email.toLowerCase().endsWith('@gov.in'));
    if (!isOfficer) {
      return res.status(403).json({
        success: false,
        error: 'Access forbidden: Only authorized government officials can adjudicate appeals.'
      });
    }

    const { status, officerRemarks } = req.body;
    const updated = await db.updateCorrectionStatus(req.params.id, {
      status,
      officerRemarks,
      officerName: req.citizen.fullName || 'Zonal Public Grievance Officer'
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Appeal docket not found.' });
    }

    res.json({ success: true, message: 'Appeal docket adjudicated successfully.', correction: updated });
  } catch (err) {
    console.error('Update correction status error:', err);
    res.status(500).json({ success: false, error: 'Failed to update appeal docket.' });
  }
});

// POST /api/corrections - Submit correction with ownership validation of linked alert or application
router.post('/', requireAuth, async (req, res) => {
  try {
    const { alertId, applicationId, recordType, schemeName, reasonCategory, citizenStatement, supportingEvidence } = req.body;

    if (!reasonCategory || !citizenStatement) {
      return res.status(400).json({
        success: false,
        error: 'Reason category and citizen clarification statement are required.'
      });
    }

    // Validate ownership of associated alert
    if (alertId) {
      const alert = await db.getAlertById(alertId);
      if (alert) {
        const isAlertOwner = alert.citizenId === req.citizen.citizenId || alert.citizenId === req.citizen.id;
        if (!isAlertOwner) {
          return res.status(403).json({
            success: false,
            error: 'Access forbidden: You cannot submit a clarification for an alert belonging to another citizen.'
          });
        }
      }
    }

    // Validate ownership of associated application
    if (applicationId && applicationId !== 'General Inquiry') {
      const app = await db.getApplicationById(applicationId);
      if (app) {
        const isAppOwner = app.citizenId === req.citizen.citizenId || app.citizenId === req.citizen.id;
        if (!isAppOwner) {
          return res.status(403).json({
            success: false,
            error: 'Access forbidden: You cannot submit a clarification for an application belonging to another citizen.'
          });
        }
      }
    }

    const newCorrection = await db.createCorrection(req.citizen, {
      alertId,
      applicationId,
      recordType,
      schemeName,
      reasonCategory,
      citizenStatement,
      supportingEvidence
    });

    res.status(201).json({
      success: true,
      message: 'Clarification appeal docket created successfully.',
      correction: newCorrection
    });
  } catch (err) {
    console.error('Submit correction error:', err);
    res.status(500).json({ success: false, error: 'Failed to lodge clarification appeal.' });
  }
});

export default router;
