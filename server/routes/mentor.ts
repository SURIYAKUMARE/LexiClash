import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { orchestrator } from '../agents/orchestrator.js';
import { MentorMessage } from '../types.js';

export const mentorRouter = Router();

// GET /api/mentor/history
mentorRouter.get('/history', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const messages = db.mentorMessages.filter(m => m.userId === userId);
  return res.json({ messages });
});

// POST /api/mentor/chat
mentorRouter.post('/chat', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { message, mode } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  const now = new Date().toISOString();

  // Save User Message
  const userMsg: MentorMessage = {
    id: `msg-${uuidv4().slice(0, 8)}`,
    userId: user.id,
    role: 'user',
    content: message.trim(),
    metadata: { mode: mode || 'general' },
    createdAt: now
  };
  db.mentorMessages.push(userMsg);

  // Retrieve user context
  const profile = db.profiles.find(p => p.userId === user.id);
  const skills = db.skills.filter(s => s.userId === user.id);
  const roadmap = db.roadmaps.find(r => r.userId === user.id) || null;

  // Run AI Mentor Agent
  const mentorResult = await orchestrator.executeMentorConsultation(
    user,
    profile!,
    skills,
    roadmap,
    message,
    mode
  );

  // Save Assistant Message
  const assistantMsg: MentorMessage = {
    id: `msg-${uuidv4().slice(0, 8)}`,
    userId: user.id,
    role: 'assistant',
    content: mentorResult.reply,
    metadata: {
      mode: mentorResult.mode,
      suggestedFollowUps: mentorResult.suggestedFollowUps,
      referencedSkill: mentorResult.referencedSkills?.[0]
    },
    createdAt: new Date().toISOString()
  };
  db.mentorMessages.push(assistantMsg);
  db.save();

  return res.json({
    userMessage: userMsg,
    assistantMessage: assistantMsg,
    suggestedFollowUps: mentorResult.suggestedFollowUps
  });
});

// DELETE /api/mentor/history
mentorRouter.delete('/history', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const initialLength = db.mentorMessages.length;
  const filtered = db.mentorMessages.filter(m => m.userId !== userId);

  // Re-assign
  db.mentorMessages.length = 0;
  db.mentorMessages.push(...filtered);
  db.save();

  return res.json({ message: 'Conversation history cleared successfully.' });
});
