import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { orchestrator } from '../agents/orchestrator.js';
import { Skill } from '../types.js';

export const profileRouter = Router();

// GET /api/profile
profileRouter.get('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  let profile = db.profiles.find(p => p.userId === userId);
  if (!profile) {
    const now = new Date().toISOString();
    profile = {
      userId,
      completedOnboarding: false,
      targetCareerRoleId: 'role-fullstack',
      careerInterests: [],
      learningPreferences: { hoursPerWeek: 10, style: 'practical', pace: 'moderate' },
      overallMasteryLevel: 1,
      overallReadinessScore: 0,
      profileCompletionPercentage: 40,
      streakDays: 1,
      lastActiveDate: now,
      totalLearningHours: 0,
      completedTasksCount: 0,
      completedAssessmentsCount: 0
    };
    db.profiles.push(profile);
    db.save();
  }
  return res.json({ profile });
});

// PUT /api/profile
profileRouter.put('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const profile = db.profiles.find(p => p.userId === userId);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found.' });
  }

  const {
    degree,
    college,
    graduationYear,
    bio,
    targetCareerRoleId,
    careerInterests,
    learningPreferences
  } = req.body;

  if (degree !== undefined) profile.degree = degree;
  if (college !== undefined) profile.college = college;
  if (graduationYear !== undefined) profile.graduationYear = graduationYear;
  if (bio !== undefined) profile.bio = bio;
  if (targetCareerRoleId !== undefined) profile.targetCareerRoleId = targetCareerRoleId;
  if (careerInterests !== undefined) profile.careerInterests = careerInterests;
  if (learningPreferences !== undefined) {
    profile.learningPreferences = {
      ...profile.learningPreferences,
      ...learningPreferences
    };
  }

  // Calculate profile completion
  let score = 30;
  if (profile.degree) score += 15;
  if (profile.college) score += 15;
  if (profile.bio) score += 15;
  if (profile.careerInterests?.length > 0) score += 15;
  if (profile.completedOnboarding) score += 10;
  profile.profileCompletionPercentage = Math.min(100, score);

  db.save();
  return res.json({ profile });
});

// POST /api/profile/onboarding
profileRouter.post('/onboarding', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const {
    degree,
    college,
    graduationYear,
    bio,
    initialSkills, // Array of { skillName, category, proficiencyLevel, evidence }
    targetCareerRoleId,
    careerInterests,
    learningPreferences,
    certifications,
    projects
  } = req.body;

  let profile = db.profiles.find(p => p.userId === user.id);
  const now = new Date().toISOString();

  if (!profile) {
    profile = {
      userId: user.id,
      completedOnboarding: true,
      targetCareerRoleId: targetCareerRoleId || 'role-fullstack',
      careerInterests: careerInterests || [],
      learningPreferences: learningPreferences || { hoursPerWeek: 10, style: 'practical', pace: 'moderate' },
      overallMasteryLevel: 1,
      overallReadinessScore: 0,
      profileCompletionPercentage: 100,
      streakDays: 1,
      lastActiveDate: now,
      totalLearningHours: 0,
      completedTasksCount: 0,
      completedAssessmentsCount: 0
    };
    db.profiles.push(profile);
  } else {
    profile.completedOnboarding = true;
    profile.degree = degree || profile.degree;
    profile.college = college || profile.college;
    profile.graduationYear = graduationYear || profile.graduationYear;
    profile.bio = bio || profile.bio;
    profile.targetCareerRoleId = targetCareerRoleId || profile.targetCareerRoleId;
    profile.careerInterests = careerInterests || profile.careerInterests;
    profile.learningPreferences = learningPreferences || profile.learningPreferences;
    profile.profileCompletionPercentage = 100;
  }

  // Save Initial Skills
  if (Array.isArray(initialSkills) && initialSkills.length > 0) {
    for (const item of initialSkills) {
      const existing = db.skills.find(
        s => s.userId === user.id && s.skillName.toLowerCase() === item.skillName.toLowerCase()
      );
      if (!existing) {
        const newSkill: Skill = {
          id: `skill-${uuidv4().slice(0, 8)}`,
          userId: user.id,
          skillName: item.skillName,
          category: item.category || 'other',
          proficiencyLevel: item.proficiencyLevel || 1,
          isVerified: false,
          evidence: item.evidence || 'Self-reported during onboarding',
          createdAt: now,
          updatedAt: now
        };
        db.skills.push(newSkill);
      }
    }
  }

  // Save projects if supplied
  if (Array.isArray(projects) && projects.length > 0) {
    for (const proj of projects) {
      db.projects.push({
        id: `proj-${uuidv4().slice(0, 8)}`,
        userId: user.id,
        title: proj.title || 'Portfolio Project',
        description: proj.description || '',
        skills: proj.skills || [],
        githubUrl: proj.githubUrl,
        liveUrl: proj.liveUrl,
        status: 'completed',
        createdAt: now,
        completedAt: now
      });
    }
  }

  db.save();

  // Run Multi-Agent Onboarding Pipeline
  const userSkills = db.skills.filter(s => s.userId === user.id);
  const targetRole = db.careerRoles.find(r => r.id === profile!.targetCareerRoleId) || db.careerRoles[0];

  try {
    const synthesis = await orchestrator.runFullOnboardingSynthesis(user, profile, userSkills);

    // Update readiness score from gap analysis
    profile.overallReadinessScore = synthesis.gapAnalysis.overallReadinessScore;

    // Check if an existing roadmap exists, or replace it
    const existingRoadmapIndex = db.roadmaps.findIndex(r => r.userId === user.id);
    if (existingRoadmapIndex >= 0) {
      db.roadmaps[existingRoadmapIndex] = synthesis.roadmap;
    } else {
      db.roadmaps.push(synthesis.roadmap);
    }

    db.save();

    return res.json({
      success: true,
      message: 'Onboarding completed and learning roadmap synthesized.',
      profile,
      synthesis
    });
  } catch (err: any) {
    console.error('Error during onboarding multi-agent pipeline:', err);
    return res.json({
      success: true,
      message: 'Onboarding completed.',
      profile
    });
  }
});
