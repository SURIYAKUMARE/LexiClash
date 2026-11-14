import { Router } from 'express';
import { db } from '../db/database.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const notificationsRouter = Router();

// GET /api/notifications
notificationsRouter.get('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const userNotifs = db.notifications.filter(n => n.userId === userId);
  return res.json({ notifications: userNotifs });
});

// PUT /api/notifications/:id/read
notificationsRouter.put('/:id/read', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const notif = db.notifications.find(n => n.id === req.params.id && n.userId === userId);

  if (notif) {
    notif.read = true;
    db.save();
  }

  return res.json({ success: true, notification: notif });
});

// PUT /api/notifications/read-all
notificationsRouter.put('/read-all', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  for (const n of db.notifications) {
    if (n.userId === userId) {
      n.read = true;
    }
  }
  db.save();
  return res.json({ success: true, message: 'All notifications marked as read.' });
});
