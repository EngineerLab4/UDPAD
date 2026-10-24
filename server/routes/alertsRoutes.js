import express from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/alerts - List authenticated citizen's alerts (or all for officer)
router.get('/', requireAuth, async (req, res) => {
  try {
    const isOfficer = req.isOfficer || req.citizen?.role === 'OFFICER' || (req.citizen?.email && req.citizen.email.toLowerCase().endsWith('@gov.in'));
    const alerts = isOfficer
      ? await db.getAllAlerts()
      : await db.getAlerts(req.citizen.citizenId);
    res.json({ success: true, count: alerts.length, alerts });
  } catch (err) {
    console.error('Fetch alerts error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve verification alerts.' });
  }
});

// GET /api/alerts/:id - Fetch single alert with strict ownership verification
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const alert = await db.getAlertById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found.' });
    }

    const isOfficer = req.isOfficer || req.citizen?.role === 'OFFICER' || (req.citizen?.email && req.citizen.email.toLowerCase().endsWith('@gov.in'));
    const isOwner = alert.citizenId === req.citizen.citizenId || alert.citizenId === req.citizen.id;
    if (!isOwner && !isOfficer) {
      return res.status(403).json({
        success: false,
        error: 'Access forbidden: You do not have permission to view this alert.'
      });
    }

    res.json({ success: true, alert });
  } catch (err) {
    console.error('Fetch alert details error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve alert details.' });
  }
});

// PATCH /api/alerts/:id/status - Government official resolves or updates alert
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const isOfficer = req.isOfficer || req.citizen?.role === 'OFFICER' || (req.citizen?.email && req.citizen.email.toLowerCase().endsWith('@gov.in'));
    if (!isOfficer) {
      return res.status(403).json({
        success: false,
        error: 'Access forbidden: Only authorized government officials can resolve alerts.'
      });
    }

    const { status, resolutionNote } = req.body;
    const updated = await db.updateAlertStatus(req.params.id, { status, resolutionNote });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Alert not found.' });
    }

    res.json({ success: true, message: 'Verification alert status updated.', alert: updated });
  } catch (err) {
    console.error('Update alert status error:', err);
    res.status(500).json({ success: false, error: 'Failed to update alert status.' });
  }
});

// POST /api/alerts - Create verification alert for authenticated citizen
router.post('/', requireAuth, async (req, res) => {
  try {
    const { applicationId, schemeId, alertType, severity, title, message, details, suggestedActions } = req.body;
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Alert title and message are required.'
      });
    }

    const alert = await db.createAlert({
      applicationId: applicationId || null,
      citizenId: req.citizen.citizenId,
      schemeId: schemeId || 'SCH-01',
      alertType,
      severity,
      title,
      message,
      details,
      suggestedActions
    });

    res.status(201).json({ success: true, alert });
  } catch (err) {
    console.error('Create alert error:', err);
    res.status(500).json({ success: false, error: 'Failed to create verification alert.' });
  }
});

export default router;
