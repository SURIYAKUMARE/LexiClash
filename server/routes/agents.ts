import { Router } from 'express';
import { db } from '../db/database.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { orchestrator } from '../agents/orchestrator.js';
import { geminiClient } from '../agents/geminiClient.js';

export const agentsRouter = Router();

// GET /api/agents/activity
agentsRouter.get('/activity', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const userExecutions = db.agentExecutions.filter(e => e.userId === userId);
  return res.json({
    executions: userExecutions,
    hasGeminiApiKey: geminiClient.hasApiKey
  });
});

// POST /api/agents/run
agentsRouter.post('/run', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { agentName } = req.body;

  const profile = db.profiles.find(p => p.userId === user.id);
  const skills = db.skills.filter(s => s.userId === user.id);
  const targetRole = db.careerRoles.find(r => r.id === profile?.targetCareerRoleId) || db.careerRoles[0];
  const roadmap = db.roadmaps.find(r => r.userId === user.id) || null;

  try {
    let result: any = null;

    switch (agentName) {
      case 'Profile Analyzer Agent':
        result = await orchestrator.executeProfileAnalysis(user, profile!, skills);
        break;
      case 'Skill Gap Analyzer Agent':
        result = await orchestrator.executeSkillGapAnalysis(skills, targetRole, user.id);
        break;
      case 'Career Intelligence Agent':
        result = await orchestrator.executeCareerIntelligence(targetRole, user.id);
        break;
      case 'Learning Path Agent':
        result = await orchestrator.executeLearningPathGeneration(profile!, targetRole, skills);
        break;
      case 'Assessment Agent':
        result = await orchestrator.executeAssessmentEvaluation(
          user.id,
          targetRole.requiredSkills[0]?.skillName || 'Engineering',
          db.questions.slice(0, 3),
          [{ questionId: db.questions[0].id, selectedOption: db.questions[0].correctOptionIndex }]
        );
        break;
      case 'AI Mentor Agent':
        result = await orchestrator.executeMentorConsultation(
          user,
          profile!,
          skills,
          roadmap,
          'Provide architectural advice on microservice decomposition.'
        );
        break;
      case 'Progress Optimization Agent':
        if (roadmap) {
          result = await orchestrator.executeProgressOptimization(
            profile!,
            skills,
            roadmap,
            'manual_review'
          );
        } else {
          result = { message: 'No roadmap present to optimize.' };
        }
        break;
      default:
        return res.status(400).json({ error: `Unknown agent: ${agentName}` });
    }

    return res.json({
      success: true,
      agentName,
      result,
      executions: db.agentExecutions.filter(e => e.userId === user.id)
    });
  } catch (err: any) {
    console.error('Error running agent:', err);
    return res.status(500).json({ error: err?.message || 'Agent execution failed.' });
  }
});
