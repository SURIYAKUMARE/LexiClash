import { Router } from 'express';
import { db } from '../db/database.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { orchestrator } from '../agents/orchestrator.js';

export const careersRouter = Router();

// GET /api/careers
careersRouter.get('/', (_req, res) => {
  return res.json({ careers: db.careerRoles });
});

// GET /api/careers/:id
careersRouter.get('/:id', (req, res) => {
  const role = db.careerRoles.find(r => r.id === req.params.id);
  if (!role) {
    return res.status(404).json({ error: 'Career role not found.' });
  }
  return res.json({ career: role });
});

// GET /api/careers/:id/intelligence
careersRouter.get('/:id/intelligence', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const role = db.careerRoles.find(r => r.id === req.params.id);
  if (!role) {
    return res.status(404).json({ error: 'Career role not found.' });
  }

  const intel = await orchestrator.executeCareerIntelligence(role, req.user!.id);
  return res.json({ intelligence: intel });
});

// POST /api/careers/select-target
careersRouter.post('/select-target', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { roleId } = req.body;

  const role = db.careerRoles.find(r => r.id === roleId);
  if (!role) {
    return res.status(400).json({ error: 'Invalid career role ID.' });
  }

  const profile = db.profiles.find(p => p.userId === userId);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found.' });
  }

  const previousRole = profile.targetCareerRoleId;
  profile.targetCareerRoleId = role.id;

  const userSkills = db.skills.filter(s => s.userId === userId);

  // Run Gap Analysis
  const gapAnalysis = await orchestrator.executeSkillGapAnalysis(userSkills, role, userId);
  profile.overallReadinessScore = gapAnalysis.overallReadinessScore;

  // Adapt or Regenerate Learning Roadmap
  let roadmap = db.roadmaps.find(r => r.userId === userId);
  if (roadmap) {
    const optResult = await orchestrator.executeProgressOptimization(
      profile,
      userSkills,
      roadmap,
      'career_goal_changed',
      { newRoleId: role.id, newRoleTitle: role.title }
    );
    roadmap = optResult.updatedRoadmap;
    const existingIndex = db.roadmaps.findIndex(r => r.userId === userId);
    db.roadmaps[existingIndex] = roadmap;
    db.roadmapAdjustments.unshift(optResult.adjustmentLog);
    db.notifications.unshift(optResult.notificationCreated);
  } else {
    roadmap = await orchestrator.executeLearningPathGeneration(profile, role, userSkills);
    db.roadmaps.push(roadmap);
  }

  db.save();

  return res.json({
    success: true,
    message: `Target career role updated to ${role.title}. Roadmap and readiness score updated.`,
    targetRole: role,
    readinessScore: gapAnalysis.overallReadinessScore,
    roadmap
  });
});
