import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Certificate } from '../types.js';

export const certificatesRouter = Router();

// GET /api/certificates
certificatesRouter.get('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const userCerts = db.certificates.filter(c => c.userId === userId);
  return res.json({ certificates: userCerts });
});

// POST /api/certificates/claim
certificatesRouter.post('/claim', authMiddleware, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { title, skillsCovered, gradePercentage } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Certificate title is required.' });
  }

  const certId = `SKILLPATH-${uuidv4().slice(0, 8).toUpperCase()}`;
  const now = new Date().toISOString();

  const newCert: Certificate = {
    id: `cert-${uuidv4().slice(0, 8)}`,
    userId: user.id,
    userName: user.name,
    title,
    credentialId: certId,
    verificationHash: uuidv4().replace(/-/g, ''),
    skillsCovered: Array.isArray(skillsCovered) ? skillsCovered : ['Core Competencies'],
    issuedAt: now,
    gradePercentage: gradePercentage || 92
  };

  db.certificates.unshift(newCert);

  // Add notification
  db.notifications.unshift({
    id: `notif-${uuidv4().slice(0, 8)}`,
    userId: user.id,
    title: 'New Certificate Awarded!',
    message: `Congratulations! You earned the "${title}" credential.`,
    type: 'success',
    read: false,
    createdAt: now,
    link: '/certificates'
  });

  db.save();

  return res.status(201).json({ certificate: newCert });
});
