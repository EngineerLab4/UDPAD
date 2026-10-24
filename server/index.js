import express from 'express';
import cors from 'cors';
import { config } from './config.js';

// Route handlers
import authRoutes from './routes/authRoutes.js';
import householdRoutes from './routes/householdRoutes.js';
import schemesRoutes from './routes/schemesRoutes.js';
import applicationsRoutes from './routes/applicationsRoutes.js';
import alertsRoutes from './routes/alertsRoutes.js';
import correctionsRoutes from './routes/correctionsRoutes.js';
import notificationsRoutes from './routes/notificationsRoutes.js';
import benefitsRoutes from './routes/benefitsRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import censusRoutes from './routes/censusRoutes.js';
import { db } from './db/index.js';

const app = express();

// Global Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-citizen-id']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger for development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/household', householdRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/corrections', correctionsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/benefits', benefitsRoutes);
app.use('/api/census', censusRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    platform: 'UDPAD Citizen Public Portal API',
    status: 'operational',
    documentation: '/api/health',
    endpoints: [
      '/api/auth/register',
      '/api/auth/login',
      '/api/household',
      '/api/schemes',
      '/api/applications',
      '/api/alerts',
      '/api/corrections',
      '/api/notifications',
      '/api/benefits',
      '/api/census'
    ]
  });
});

// 404 handler for API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint '${req.originalUrl}' not found on UDPAD API server.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error occurred.'
  });
});

// Start Server after database readiness probe
async function startServer() {
  try {
    await db.init();
  } catch (err) {
    console.error('Database initialization encountered error:', err.message);
  }

  const server = app.listen(config.port, (err) => {
    if (err) {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Error: Port ${config.port} is already in use by another process.`);
        console.error(`   Please terminate the process using port ${config.port} and try again.\n`);
      } else {
        console.error(`\n❌ Error starting server on port ${config.port}:`, err.message);
      }
      process.exit(1);
    }

    console.log(`========================================================`);
    console.log(`🚀 UDPAD Backend Server running on port ${config.port}`);
    console.log(`   Health check: http://localhost:${config.port}/api/health`);
    console.log(`   Active Database Mode: ${db.mode}`);
    console.log(`========================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Error: Port ${config.port} is already in use by another process.`);
      console.error(`   Please terminate the process using port ${config.port} and try again.\n`);
    } else {
      console.error(`\n❌ Server error on port ${config.port}:`, err.message);
    }
    process.exit(1);
  });

  return server;
}

startServer();

export default app;
