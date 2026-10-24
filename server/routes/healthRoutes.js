import express from 'express';
import { db } from '../db/index.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    name: 'UDPAD Government Public Documentation API',
    version: '1.0.0',
    uptime: process.uptime(),
    health: db.getHealthStatus()
  });
});

export default router;
