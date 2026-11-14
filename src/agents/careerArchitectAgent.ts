import { OfflineSkill, OfflineCareerRole } from '../db/indexedDb';
import { CareerBenchmarkResult, AgentReasoningTrace } from './types';

export class CareerArchitectAgent {
  public static benchmarkRole(
    skills: OfflineSkill[],
    targetRole: OfflineCareerRole
  ): CareerBenchmarkResult {
    const traces: AgentReasoningTrace[] = [];
    const timestamp = new Date().toISOString();

    traces.push({
      step: 1,
      agentName: 'Career Market Architect Agent',
      thought: `Ingesting benchmark blueprint for target role "${targetRole.title}". Evaluating ${targetRole.requiredSkills.length} required skills against current user profile.`,
      action: 'FETCH_ROLE_BLUEPRINT',
      observation: `Role demands ${targetRole.requiredSkills.length} core skills with average benchmark proficiency of 3.8/5.`,
      timestamp
    });

    const strengths: { skillName: string; level: number; benchmark: number }[] = [];
    const needsReinforcement: { skillName: string; level: number; benchmark: number; delta: number }[] = [];
    const criticalMissing: { skillName: string; benchmark: number }[] = [];

    let totalWeight = 0;
    let earnedWeight = 0;

    targetRole.requiredSkills.forEach(req => {
      const isCore = req.importance === 'core';
      const weight = isCore ? 2.0 : 1.0;
      totalWeight += weight * req.benchmarkLevel;

      const userSkill = skills.find(
        s => s.skillName.toLowerCase() === req.skillName.toLowerCase()
      );

      if (!userSkill || userSkill.proficiencyLevel === 0) {
        criticalMissing.push({
          skillName: req.skillName,
          benchmark: req.benchmarkLevel
        });
      } else {
        const delta = req.benchmarkLevel - userSkill.proficiencyLevel;
        // Verification bonus multiplier (1.1x if verified by testing)
        const verificationMultiplier = userSkill.isVerified ? 1.1 : 1.0;
        const cappedScore = Math.min(userSkill.proficiencyLevel, req.benchmarkLevel);
        earnedWeight += cappedScore * weight * verificationMultiplier;

        if (delta <= 0) {
          strengths.push({
            skillName: req.skillName,
            level: userSkill.proficiencyLevel,
            benchmark: req.benchmarkLevel
          });
        } else {
          needsReinforcement.push({
            skillName: req.skillName,
            level: userSkill.proficiencyLevel,
            benchmark: req.benchmarkLevel,
            delta
          });
        }
      }
    });

    const rawPercentage = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0;
    const readinessPercentage = Math.min(100, Math.round(rawPercentage));

    // Estimated weeks based on remaining gaps
    const totalGapsCount = criticalMissing.length + needsReinforcement.length;
    const estimatedWeeks = Math.max(2, Math.round(totalGapsCount * 1.5));

    traces.push({
      step: 2,
      agentName: 'Career Market Architect Agent',
      thought: `Calculated mathematical readiness score: ${readinessPercentage}%. Found ${strengths.length} mastered competencies, ${needsReinforcement.length} needs reinforcement, and ${criticalMissing.length} critical missing skills.`,
      action: 'CALCULATE_GAP_DELTAS',
      observation: `Critical deficits: ${criticalMissing.map(m => m.skillName).join(', ') || 'None'}. Estimated closure duration: ~${estimatedWeeks} weeks.`,
      timestamp
    });

    return {
      roleId: targetRole.id,
      roleTitle: targetRole.title,
      readinessPercentage,
      mathematicalBreakdown: {
        coreSkillsWeight: totalWeight,
        verifiedSkillsMultiplier: 1.1,
        rawScore: Math.round(earnedWeight * 10) / 10,
        maxPossibleScore: Math.round(totalWeight * 10) / 10
      },
      strengths,
      needsReinforcement,
      criticalMissing,
      estimatedWeeksToReadiness: estimatedWeeks,
      reasoningTraces: traces
    };
  }

  /**
   * "What-If" Career Simulator:
   * Evaluates readiness impact across multiple adjacent career roles when hypothetical skills are acquired.
   */
  public static simulateSkillAcquisitions(
    currentSkills: OfflineSkill[],
    allRoles: OfflineCareerRole[],
    hypotheticalSkills: { skillName: string; level: number }[]
  ): {
    simulatedRoleId: string;
    roleTitle: string;
    baselineReadiness: number;
    projectedReadiness: number;
    deltaPercentage: number;
    unlockedStatus: 'Ready to Apply' | 'Near Benchmark' | 'Developing';
  }[] {
    // Merge current skills with hypothetical skills
    const mergedSkills: OfflineSkill[] = [...currentSkills];
    hypotheticalSkills.forEach(h => {
      const idx = mergedSkills.findIndex(s => s.skillName.toLowerCase() === h.skillName.toLowerCase());
      if (idx >= 0) {
        mergedSkills[idx] = { ...mergedSkills[idx], proficiencyLevel: Math.max(mergedSkills[idx].proficiencyLevel, h.level), isVerified: true };
      } else {
        mergedSkills.push({
          id: `sim-${h.skillName}`,
          userId: 'sim',
          skillName: h.skillName,
          category: 'frameworks',
          proficiencyLevel: h.level,
          isVerified: true
        });
      }
    });

    return allRoles.map(role => {
      const baseline = CareerArchitectAgent.benchmarkRole(currentSkills, role).readinessPercentage;
      const projected = CareerArchitectAgent.benchmarkRole(mergedSkills, role).readinessPercentage;
      const delta = projected - baseline;

      let unlockedStatus: 'Ready to Apply' | 'Near Benchmark' | 'Developing' = 'Developing';
      if (projected >= 80) unlockedStatus = 'Ready to Apply';
      else if (projected >= 65) unlockedStatus = 'Near Benchmark';

      return {
        simulatedRoleId: role.id,
        roleTitle: role.title,
        baselineReadiness: baseline,
        projectedReadiness: projected,
        deltaPercentage: delta,
        unlockedStatus
      };
    });
  }
}
