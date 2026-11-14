import { Router } from 'express';
import { db } from '../db/database.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const analyticsRouter = Router();

// GET /api/analytics
analyticsRouter.get('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const profile = db.profiles.find(p => p.userId === userId);
  const userSkills = db.skills.filter(s => s.userId === userId);
  const userAssessments = db.assessments.filter(a => a.userId === userId);
  const roadmap = db.roadmaps.find(r => r.userId === userId);

  // 1. Skill Radar Data by Category
  const categories = ['languages', 'frameworks', 'databases', 'cloud', 'analytics', 'soft_skills'] as const;
  const radarData = categories.map(cat => {
    const matching = userSkills.filter(s => s.category === cat);
    const avg = matching.length > 0
      ? Math.round((matching.reduce((acc, s) => acc + s.proficiencyLevel, 0) / matching.length) * 20)
      : 20; // Default baseline 20%
    const label = cat === 'soft_skills' ? 'Soft Skills' : cat.charAt(0).toUpperCase() + cat.slice(1);
    return {
      category: label,
      current: avg,
      benchmark: 75,
      fullMark: 100
    };
  });

  // 2. Weekly Activity Chart (Monday to Sunday)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const baseHours = Math.max(1, Math.round((profile?.totalLearningHours || 12) / 6));
  const weeklyActivity = days.map((day, idx) => ({
    day,
    hours: idx === 5 || idx === 6 ? Math.round(baseHours * 1.4) : Math.round(baseHours * (0.8 + (idx % 3) * 0.3)),
    tasksCompleted: idx % 2 === 0 ? 2 : 1
  }));

  // 3. Progress Over Time
  const progressTimeline = [
    { week: 'Week 1', readiness: 25, completedTasks: 2 },
    { week: 'Week 2', readiness: 42, completedTasks: 5 },
    { week: 'Week 3', readiness: 60, completedTasks: 9 },
    { week: 'Week 4', readiness: profile?.overallReadinessScore || 78, completedTasks: profile?.completedTasksCount || 14 }
  ];

  // 4. Assessment Performance Distribution
  const passCount = userAssessments.filter(a => a.passed).length;
  const failCount = userAssessments.length - passCount;
  const avgScore = userAssessments.length > 0
    ? Math.round(userAssessments.reduce((acc, a) => acc + a.scorePercentage, 0) / userAssessments.length)
    : 85;

  return res.json({
    metrics: {
      totalSkills: userSkills.length,
      verifiedSkills: userSkills.filter(s => s.isVerified).length,
      overallMasteryLevel: profile?.overallMasteryLevel || 3,
      totalLearningHours: profile?.totalLearningHours || 36,
      completedTasksCount: profile?.completedTasksCount || 14,
      streakDays: profile?.streakDays || 9,
      overallReadinessScore: profile?.overallReadinessScore || 78,
      roadmapProgressPercentage: roadmap?.overallProgressPercentage || 42,
      assessmentsTaken: userAssessments.length,
      averageAssessmentScore: avgScore
    },
    radarData,
    weeklyActivity,
    progressTimeline,
    assessmentStats: {
      passed: passCount,
      needsReview: failCount,
      averageScore: avgScore
    }
  });
});
