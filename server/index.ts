import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { authRouter } from './routes/auth.js';
import { profileRouter } from './routes/profile.js';
import { skillsRouter } from './routes/skills.js';
import { careersRouter } from './routes/careers.js';
import { roadmapRouter } from './routes/roadmap.js';
import { assessmentsRouter } from './routes/assessments.js';
import { mentorRouter } from './routes/mentor.js';
import { agentsRouter } from './routes/agents.js';
import { analyticsRouter } from './routes/analytics.js';
import { resourcesRouter } from './routes/resources.js';
import { projectsRouter } from './routes/projects.js';
import { certificatesRouter } from './routes/certificates.js';
import { notificationsRouter } from './routes/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true
}));

// Security Headers Middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'SkillPath AI API Server',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/careers', careersRouter);
app.use('/api/roadmap', roadmapRouter);
app.use('/api/assessments', assessmentsRouter);
app.use('/api/mentor', mentorRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/certificates', certificatesRouter);
app.use('/api/notifications', notificationsRouter);

// Serve frontend build if exists in production
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[SkillPath AI Server Error]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err?.message || 'An unexpected error occurred'
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(Number(PORT), '127.0.0.1', () => {
    console.log(`[SkillPath AI] API Server running on port ${PORT}`);
  });
}

export default app;
