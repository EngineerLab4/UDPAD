import express from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/applications - List authenticated citizen's applications (or all for officer)
router.get('/', requireAuth, async (req, res) => {
  try {
    const isOfficer = req.isOfficer || req.citizen?.role === 'OFFICER' || (req.citizen?.email && req.citizen.email.toLowerCase().endsWith('@gov.in'));
    const apps = isOfficer
      ? await db.getAllApplications()
      : await db.getApplications(req.citizen.citizenId);
    res.json({ success: true, count: apps.length, applications: apps });
  } catch (err) {
    console.error('Fetch applications error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve applications.' });
  }
});

// GET /api/applications/:id - Fetch single application with strict ownership verification
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const app = await db.getApplicationById(req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }

    // Strict record ownership check (officials granted administrative review)
    const isOfficer = req.isOfficer || req.citizen?.role === 'OFFICER' || (req.citizen?.email && req.citizen.email.toLowerCase().endsWith('@gov.in'));
    const isOwner = app.citizenId === req.citizen.citizenId || app.citizenId === req.citizen.id;
    if (!isOwner && !isOfficer) {
      return res.status(403).json({
        success: false,
        error: 'Access forbidden: You do not have permission to view this application.'
      });
    }

    res.json({ success: true, application: app });
  } catch (err) {
    console.error('Fetch application error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve application details.' });
  }
});

// PATCH /api/applications/:id/status - Government official adjudication update
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const isOfficer = req.isOfficer || req.citizen?.role === 'OFFICER' || (req.citizen?.email && req.citizen.email.toLowerCase().endsWith('@gov.in'));
    if (!isOfficer) {
      return res.status(403).json({
        success: false,
        error: 'Access forbidden: Only authorized government officials can update application status.'
      });
    }

    const { status, statusNote } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required.' });
    }

    const updated = await db.updateApplicationStatus(req.params.id, {
      status,
      statusNote,
      officerName: req.citizen.fullName || 'Zonal Field Verification Officer'
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }

    res.json({ success: true, message: 'Status updated successfully.', application: updated });
  } catch (err) {
    console.error('Update application status error:', err);
    res.status(500).json({ success: false, error: 'Failed to update application status.' });
  }
});

// POST /api/applications - Submit application with identity derived strictly from verified token
router.post('/', requireAuth, async (req, res) => {
  try {
    const { schemeId, schemeName, department, category, benefitUnit, beneficiaryName, householdRef, dwellingRef, documents } = req.body;

    if (!schemeId || !schemeName) {
      return res.status(400).json({
        success: false,
        error: 'Scheme ID and Scheme Name are required.'
      });
    }

    // Force citizen ID to match the verified token exclusively
    const newApp = await db.createApplication(req.citizen, {
      schemeId,
      schemeName,
      department,
      category,
      benefitUnit,
      beneficiaryName,
      householdRef: householdRef || req.citizen.householdId,
      dwellingRef,
      documents
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      application: newApp
    });
  } catch (err) {
    console.error('Submit application error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit application.' });
  }
});

export default router;
