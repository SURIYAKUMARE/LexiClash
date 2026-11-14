import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { orchestrator } from '../agents/orchestrator.js';
import { AssessmentAttempt, Skill, ProficiencyLevel } from '../types.js';

export const assessmentsRouter = Router();

// GET /api/assessments/questions
assessmentsRouter.get('/questions', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { topic, difficulty, skill } = req.query;

  let filtered = [...db.questions];

  if (topic) {
    filtered = filtered.filter(q => q.topic.toLowerCase().includes((topic as string).toLowerCase()));
  }

  if (skill) {
    filtered = filtered.filter(q => q.skillName.toLowerCase() === (skill as string).toLowerCase());
  }

  if (difficulty) {
    filtered = filtered.filter(q => q.difficulty.toLowerCase() === (difficulty as string).toLowerCase());
  }

  // Fallback to all questions if filter yielded empty
  if (filtered.length === 0) {
    filtered = db.questions.slice(0, 5);
  }

  // Remove the correct answer before sending to frontend so user cannot cheat
  const safeQuestions = filtered.map(q => {
    const { correctOptionIndex, explanation, ...rest } = q;
    return rest;
  });

  return res.json({
    questions: safeQuestions,
    total: safeQuestions.length
  });
});

// POST /api/assessments/submit
assessmentsRouter.post('/submit', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { topic, difficulty, userAnswers } = req.body;
  // userAnswers: [{ questionId: string, selectedOption: number }]

  if (!Array.isArray(userAnswers) || userAnswers.length === 0) {
    return res.status(400).json({ error: 'User answers are required.' });
  }

  const questionIds = userAnswers.map(a => a.questionId);
  const matchedQuestions = db.questions.filter(q => questionIds.includes(q.id));

  // Run Assessment Agent
  const diagnosis = await orchestrator.executeAssessmentEvaluation(
    userId,
    topic || 'General Technical Assessment',
    matchedQuestions,
    userAnswers
  );

  const now = new Date().toISOString();
  const skillName = matchedQuestions[0]?.skillName || topic || 'General Engineering';

  // Construct Detailed Answers with Explanations
  const detailedAnswers = userAnswers.map(ans => {
    const q = matchedQuestions.find(item => item.id === ans.questionId);
    return {
      questionId: ans.questionId,
      questionText: q?.question || '',
      selectedOption: ans.selectedOption,
      correctOptionIndex: q?.correctOptionIndex ?? 0,
      isCorrect: ans.selectedOption === q?.correctOptionIndex,
      explanation: q?.explanation || ''
    };
  });

  const correctAnswersCount = detailedAnswers.filter(a => a.isCorrect).length;

  const attempt: AssessmentAttempt = {
    id: `attempt-${uuidv4().slice(0, 8)}`,
    userId,
    assessmentId: `assessment-${topic?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'general'}`,
    topic: topic || 'Engineering',
    skillName,
    difficulty: (difficulty as any) || 'intermediate',
    totalQuestions: matchedQuestions.length,
    correctAnswers: correctAnswersCount,
    scorePercentage: diagnosis.scorePercentage,
    passed: diagnosis.passed,
    userAnswers: detailedAnswers,
    weakSubtopics: diagnosis.weakSubtopics,
    feedback: diagnosis.diagnosticFeedback,
    completedAt: now
  };

  db.assessments.unshift(attempt);

  // Update or Verify User Skill
  let skill = db.skills.find(
    s => s.userId === userId && s.skillName.toLowerCase() === skillName.toLowerCase()
  );

  if (skill) {
    skill.lastAssessedAt = now;
    skill.verifiedScore = diagnosis.scorePercentage;
    if (diagnosis.passed) {
      skill.isVerified = true;
      skill.proficiencyLevel = Math.max(
        skill.proficiencyLevel,
        diagnosis.masteryLevelDemonstrated as ProficiencyLevel
      ) as ProficiencyLevel;
      skill.evidence = `Verified via standardized skill assessment with score of ${diagnosis.scorePercentage}%.`;
    }
    skill.updatedAt = now;
  } else {
    skill = {
      id: `skill-${uuidv4().slice(0, 8)}`,
      userId,
      skillName,
      category: 'languages',
      proficiencyLevel: diagnosis.masteryLevelDemonstrated as ProficiencyLevel,
      isVerified: diagnosis.passed,
      evidence: `Assessed on ${new Date().toLocaleDateString()} with score ${diagnosis.scorePercentage}%.`,
      lastAssessedAt: now,
      verifiedScore: diagnosis.scorePercentage,
      createdAt: now,
      updatedAt: now
    };
    db.skills.push(skill);
  }

  // Update Profile metrics
  const profile = db.profiles.find(p => p.userId === userId);
  let adaptiveResult: any = null;

  if (profile) {
    profile.completedAssessmentsCount += 1;
    profile.lastActiveDate = now;

    // Trigger Adaptive Learning Optimization
    let roadmap = db.roadmaps.find(r => r.userId === userId);
    if (roadmap) {
      const opt = await orchestrator.executeProgressOptimization(
        profile,
        db.skills.filter(s => s.userId === userId),
        roadmap,
        'assessment_completed',
        { assessmentAttempt: attempt }
      );
      adaptiveResult = opt;
      const rIdx = db.roadmaps.findIndex(r => r.userId === userId);
      db.roadmaps[rIdx] = opt.updatedRoadmap;
      db.roadmapAdjustments.unshift(opt.adjustmentLog);
      db.notifications.unshift(opt.notificationCreated);
    }
  }

  db.save();

  return res.json({
    attempt,
    diagnosis,
    detailedAnswers,
    skillUpdated: skill,
    adaptiveResult
  });
});

// GET /api/assessments/history
assessmentsRouter.get('/history', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const history = db.assessments.filter(a => a.userId === userId);
  return res.json({ history });
});
