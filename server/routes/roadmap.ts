import { Router } from 'express';
import { db } from '../db/database.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { orchestrator } from '../agents/orchestrator.js';

export const roadmapRouter = Router();

// GET /api/roadmap
roadmapRouter.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  let roadmap = db.roadmaps.find(r => r.userId === userId);

  if (!roadmap) {
    const profile = db.profiles.find(p => p.userId === userId);
    const targetRoleId = profile?.targetCareerRoleId || 'role-fullstack';
    const role = db.careerRoles.find(r => r.id === targetRoleId) || db.careerRoles[0];
    const userSkills = db.skills.filter(s => s.userId === userId);

    roadmap = await orchestrator.executeLearningPathGeneration(profile!, role, userSkills);
    db.roadmaps.push(roadmap);
    db.save();
  }

  return res.json({ roadmap });
});

// POST /api/roadmap/task/:taskId/toggle
roadmapRouter.post('/task/:taskId/toggle', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { taskId } = req.params;

  const roadmap = db.roadmaps.find(r => r.userId === userId);
  if (!roadmap) {
    return res.status(404).json({ error: 'Learning roadmap not found.' });
  }

  let foundTask: any = null;
  for (const phase of roadmap.phases) {
    for (const task of phase.tasks) {
      if (task.id === taskId) {
        foundTask = task;
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : undefined;
        break;
      }
    }
    if (foundTask) break;
  }

  if (!foundTask) {
    return res.status(404).json({ error: 'Task not found in roadmap.' });
  }

  // Recalculate phase and roadmap progress
  let totalTasks = 0;
  let completedTasks = 0;
  for (const phase of roadmap.phases) {
    const phaseTotal = phase.tasks.length;
    const phaseCompleted = phase.tasks.filter(t => t.completed).length;

    if (phaseCompleted === phaseTotal && phaseTotal > 0) {
      phase.status = 'completed';
    } else if (phaseCompleted > 0) {
      phase.status = 'in_progress';
    } else {
      phase.status = 'not_started';
    }

    totalTasks += phaseTotal;
    completedTasks += phaseCompleted;
  }

  roadmap.overallProgressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  roadmap.lastAdjustedAt = new Date().toISOString();

  // Update profile metrics
  const profile = db.profiles.find(p => p.userId === userId);
  if (profile) {
    profile.completedTasksCount = completedTasks;
    if (foundTask.completed) {
      profile.totalLearningHours += foundTask.estimatedHours || 3;
    } else {
      profile.totalLearningHours = Math.max(0, profile.totalLearningHours - (foundTask.estimatedHours || 3));
    }
    profile.lastActiveDate = new Date().toISOString();
  }

  db.save();
  return res.json({
    success: true,
    task: foundTask,
    overallProgressPercentage: roadmap.overallProgressPercentage,
    roadmap
  });
});

// POST /api/roadmap/regenerate
roadmapRouter.post('/regenerate', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const profile = db.profiles.find(p => p.userId === userId);
  if (!profile) return res.status(404).json({ error: 'Profile not found.' });

  const targetRole = db.careerRoles.find(r => r.id === profile.targetCareerRoleId) || db.careerRoles[0];
  const userSkills = db.skills.filter(s => s.userId === userId);

  const newRoadmap = await orchestrator.executeLearningPathGeneration(profile, targetRole, userSkills);

  const existingIdx = db.roadmaps.findIndex(r => r.userId === userId);
  if (existingIdx >= 0) {
    db.roadmaps[existingIdx] = newRoadmap;
  } else {
    db.roadmaps.push(newRoadmap);
  }

  db.save();
  return res.json({
    success: true,
    message: 'Roadmap regenerated successfully.',
    roadmap: newRoadmap
  });
});

// GET /api/roadmap/adjustments
roadmapRouter.get('/adjustments', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const adjustments = db.roadmapAdjustments.filter(a => a.userId === userId);
  return res.json({ adjustments });
});
