import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { orchestrator } from '../agents/orchestrator.js';
import { Skill, SkillCategory, ProficiencyLevel } from '../types.js';

export const skillsRouter = Router();

// GET /api/skills
skillsRouter.get('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const userSkills = db.skills.filter(s => s.userId === userId);
  return res.json({ skills: userSkills });
});

// POST /api/skills
skillsRouter.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { skillName, category, proficiencyLevel, evidence } = req.body;

  if (!skillName) {
    return res.status(400).json({ error: 'Skill name is required.' });
  }

  const validCategories: SkillCategory[] = [
    'languages',
    'frameworks',
    'databases',
    'cloud',
    'analytics',
    'soft_skills',
    'other'
  ];

  const parsedCategory = validCategories.includes(category) ? category : 'other';
  const parsedLevel = Math.max(1, Math.min(5, Number(proficiencyLevel) || 1)) as ProficiencyLevel;

  const existing = db.skills.find(
    s => s.userId === userId && s.skillName.toLowerCase() === skillName.toLowerCase().trim()
  );

  const now = new Date().toISOString();

  if (existing) {
    existing.category = parsedCategory;
    existing.proficiencyLevel = parsedLevel;
    if (evidence) existing.evidence = evidence;
    existing.updatedAt = now;
    db.save();
    return res.json({ skill: existing, message: 'Skill updated successfully.' });
  }

  const newSkill: Skill = {
    id: `skill-${uuidv4().slice(0, 8)}`,
    userId,
    skillName: skillName.trim(),
    category: parsedCategory,
    proficiencyLevel: parsedLevel,
    isVerified: false,
    evidence: evidence || 'Self-reported by user',
    createdAt: now,
    updatedAt: now
  };

  db.skills.push(newSkill);

  // Recalculate Profile Stats
  const profile = db.profiles.find(p => p.userId === userId);
  if (profile) {
    const userSkills = db.skills.filter(s => s.userId === userId);
    const avgMastery = Math.round(userSkills.reduce((acc, s) => acc + s.proficiencyLevel, 0) / userSkills.length);
    profile.overallMasteryLevel = avgMastery;
    db.save();
  }

  db.save();
  return res.status(201).json({ skill: newSkill });
});

// PUT /api/skills/:id
skillsRouter.put('/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const skill = db.skills.find(s => s.id === req.params.id && s.userId === userId);

  if (!skill) {
    return res.status(404).json({ error: 'Skill not found.' });
  }

  const { proficiencyLevel, evidence, category } = req.body;
  if (proficiencyLevel !== undefined) {
    skill.proficiencyLevel = Math.max(1, Math.min(5, Number(proficiencyLevel))) as ProficiencyLevel;
  }
  if (evidence !== undefined) {
    skill.evidence = evidence;
  }
  if (category !== undefined) {
    skill.category = category;
  }
  skill.updatedAt = new Date().toISOString();

  db.save();
  return res.json({ skill });
});

// DELETE /api/skills/:id
skillsRouter.delete('/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const index = db.skills.findIndex(s => s.id === req.params.id && s.userId === userId);

  if (index === -1) {
    return res.status(404).json({ error: 'Skill not found.' });
  }

  const [deleted] = db.skills.splice(index, 1);
  db.save();
  return res.json({ message: 'Skill removed successfully.', skill: deleted });
});

// GET /api/skills/gap-analysis
skillsRouter.get('/gap-analysis', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const profile = db.profiles.find(p => p.userId === userId);
  const targetRoleId = (req.query.roleId as string) || profile?.targetCareerRoleId || 'role-fullstack';

  const role = db.careerRoles.find(r => r.id === targetRoleId) || db.careerRoles[0];
  const userSkills = db.skills.filter(s => s.userId === userId);

  const gapAnalysis = await orchestrator.executeSkillGapAnalysis(userSkills, role, userId);

  // Update profile overall readiness score if matching active target role
  if (profile && profile.targetCareerRoleId === role.id) {
    profile.overallReadinessScore = gapAnalysis.overallReadinessScore;
    db.save();
  }

  return res.json({ gapAnalysis });
});
