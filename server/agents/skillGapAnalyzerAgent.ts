import { geminiClient } from './geminiClient.js';
import { AgentRunResult } from './types.js';
import { Skill, CareerRole, SkillGapAnalysisResult } from '../types.js';

export async function runSkillGapAnalyzerAgent(
  skills: Skill[],
  targetRole: CareerRole
): Promise<AgentRunResult<SkillGapAnalysisResult>> {
  const startTime = Date.now();
  const inputSummary = `Role: ${targetRole.title}, User Skills: ${skills.length}, Required Benchmark: ${targetRole.requiredSkills.length} skills`;

  // Always compute mathematical ground truth first so score is 100% deterministic, rigorous and explainable
  let totalMaxWeightedScore = 0;
  let totalUserWeightedScore = 0;
  let matchedCount = 0;
  let verifiedCount = 0;

  const gaps: SkillGapAnalysisResult['gaps'] = [];
  const strengths: SkillGapAnalysisResult['strengths'] = [];

  // Match required skills
  for (const req of targetRole.requiredSkills) {
    totalMaxWeightedScore += req.benchmarkLevel * req.weight;

    const matchedSkill = skills.find(
      s => s.skillName.toLowerCase() === req.skillName.toLowerCase()
    );

    if (matchedSkill) {
      matchedCount++;
      if (matchedSkill.isVerified) verifiedCount++;

      // Verified skills receive 100% credit; self-reported receive 80% to encourage verification
      const verificationMultiplier = matchedSkill.isVerified ? 1.0 : 0.8;
      const effectiveLevel = Math.min(matchedSkill.proficiencyLevel, req.benchmarkLevel) * verificationMultiplier;
      totalUserWeightedScore += effectiveLevel * req.weight;

      if (matchedSkill.proficiencyLevel >= req.benchmarkLevel) {
        strengths.push({
          skillName: req.skillName,
          category: req.category,
          currentLevel: matchedSkill.proficiencyLevel,
          isVerified: matchedSkill.isVerified
        });
      } else {
        const delta = req.benchmarkLevel - matchedSkill.proficiencyLevel;
        gaps.push({
          skillName: req.skillName,
          category: req.category,
          currentLevel: matchedSkill.proficiencyLevel,
          benchmarkLevel: req.benchmarkLevel,
          delta,
          importance: req.importance,
          isVerified: matchedSkill.isVerified,
          recommendation: matchedSkill.isVerified
            ? `Advance your proficiency from Level ${matchedSkill.proficiencyLevel} to ${req.benchmarkLevel} with production-level projects.`
            : `Take an assessment to verify Level ${matchedSkill.proficiencyLevel} proficiency, then bridge the remaining ${delta}-level gap.`
        });
      }
    } else {
      // Completely missing required skill
      gaps.push({
        skillName: req.skillName,
        category: req.category,
        currentLevel: 0,
        benchmarkLevel: req.benchmarkLevel,
        delta: req.benchmarkLevel,
        importance: req.importance,
        isVerified: false,
        recommendation: `Critical prerequisite missing. Start with beginner foundations in ${req.skillName} to reach Level ${req.benchmarkLevel}.`
      });
    }
  }

  // Bonus for optional skills (up to 10 bonus points)
  let optionalBonus = 0;
  for (const opt of targetRole.optionalSkills) {
    const matched = skills.find(s => s.skillName.toLowerCase() === opt.skillName.toLowerCase());
    if (matched) {
      const bonus = (matched.proficiencyLevel / opt.benchmarkLevel) * (opt.weight * 1.5);
      optionalBonus += bonus;
    }
  }

  const baseScore = totalMaxWeightedScore > 0 ? (totalUserWeightedScore / totalMaxWeightedScore) * 100 : 0;
  const rawOverall = Math.min(100, Math.round(baseScore + Math.min(10, optionalBonus)));
  const overallReadinessScore = Math.max(0, rawOverall);

  // Sort gaps: critical first, then largest delta
  gaps.sort((a, b) => {
    const impMap = { critical: 3, important: 2, nice_to_have: 1 };
    if (impMap[b.importance] !== impMap[a.importance]) {
      return impMap[b.importance] - impMap[a.importance];
    }
    return b.delta - a.delta;
  });

  const verifiedMatchPercentage = matchedCount > 0 ? Math.round((verifiedCount / matchedCount) * 100) : 0;

  // Build prioritized improvement plan
  const prioritizedPlan = [
    {
      step: 1,
      title: 'Close High-Priority Prerequisite Gaps',
      description: gaps.slice(0, 2).map(g => `${g.skillName} (needs +${g.delta} levels)`).join(', ') || 'Maintain core competencies',
      estimatedWeeks: gaps.length > 0 ? 3 : 1,
      targetSkills: gaps.slice(0, 2).map(g => g.skillName)
    },
    {
      step: 2,
      title: 'Standardized Assessment Verification',
      description: 'Convert self-reported competencies into verified credentials by scoring 80%+ on skill quizzes.',
      estimatedWeeks: 2,
      targetSkills: skills.filter(s => !s.isVerified).slice(0, 3).map(s => s.skillName)
    },
    {
      step: 3,
      title: 'Full-Stack Integration & Architecture Projects',
      description: 'Synthesize verified skills into a multi-tiered portfolio capstone adhering to production design patterns.',
      estimatedWeeks: 4,
      targetSkills: targetRole.requiredSkills.slice(0, 4).map(s => s.skillName)
    }
  ];

  const analysisResult: SkillGapAnalysisResult = {
    roleId: targetRole.id,
    roleTitle: targetRole.title,
    overallReadinessScore,
    matchedSkillsCount: matchedCount,
    totalRequiredSkills: targetRole.requiredSkills.length,
    verifiedMatchPercentage,
    gaps,
    strengths,
    prioritizedPlan,
    disclaimer: 'Notice: Skill readiness scores reflect algorithmic alignment based on your declared and verified competencies. A high readiness score demonstrates strong alignment with typical market requirements, but does not guarantee employment or hiring outcomes.',
    calculatedAt: new Date().toISOString()
  };

  const latencyMs = Date.now() - startTime;
  return {
    success: true,
    data: analysisResult,
    source: 'heuristic_engine',
    latencyMs,
    taskSummary: `Computed weighted readiness delta for ${targetRole.title}.`,
    inputSummary,
    outputSummary: `Readiness Score: ${overallReadinessScore}%, Gaps Identified: ${gaps.length}, Strengths: ${strengths.length}.`
  };
}
