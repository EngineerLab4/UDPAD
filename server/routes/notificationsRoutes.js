import express from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/notifications - List authenticated citizen's notifications
router.get('/', requireAuth, async (req, res) => {
  try {
    const notifs = await db.getNotifications(req.citizen.citizenId);
    res.json({ success: true, count: notifs.length, notifications: notifs });
  } catch (err) {
    console.error('Fetch notifications error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve notifications.' });
  }
});

// PUT /api/notifications/read-all - Mark all notifications for authenticated citizen as read
router.put('/read-all', requireAuth, async (req, res) => {
  try {
    const updated = await db.markAllNotificationsRead(req.citizen.citizenId);
    res.json({ success: true, notifications: updated });
  } catch (err) {
    console.error('Mark all notifications error:', err);
    res.status(500).json({ success: false, error: 'Failed to mark all notifications read.' });
  }
});

// PUT /api/notifications/:id/read - Mark single notification as read with ownership verification
router.put('/:id/read', requireAuth, async (req, res) => {
  try {
    const updated = await db.markNotificationRead(req.params.id, req.citizen.citizenId);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found or access forbidden.'
      });
    }
    res.json({ success: true, notifications: updated });
  } catch (err) {
    console.error('Mark notification read error:', err);
    res.status(500).json({ success: false, error: 'Failed to mark notification read.' });
  }
});

// POST /api/notifications - Create notification assigned to authenticated citizen
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, message, category, type, link } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Title and message required.' });
    }
    const notif = await db.addNotification(req.citizen.citizenId, { title, message, category, type, link });
    res.status(201).json({ success: true, notification: notif });
  } catch (err) {
    console.error('Add notification error:', err);
    res.status(500).json({ success: false, error: 'Failed to add notification.' });
  }
});

export default router;
