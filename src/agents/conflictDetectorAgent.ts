import { OfflineUser, OfflineProfile, OfflineSkill, OfflineCareerRole } from '../db/indexedDb';
import { AgentReasoningTrace } from './types';

export interface DetectedConflict {
  id: string;
  type: 'PACING_MISMATCH' | 'COMPETENCY_DISCREPANCY' | 'PREREQUISITE_VIOLATION';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  resolutionStrategy: string;
  appliedAdjustment: string;
}

export interface ConflictDetectionResult {
  hasConflicts: boolean;
  conflicts: DetectedConflict[];
  recommendationExplanation: string;
  reasoningTraces: AgentReasoningTrace[];
}

export class ConflictDetectorAgent {
  public static detectAndResolveConflicts(
    _user: OfflineUser,
    profile: OfflineProfile,
    skills: OfflineSkill[],
    targetRole: OfflineCareerRole,
    recentCodingScores: { skillName: string; score: number }[] = []
  ): ConflictDetectionResult {
    const conflicts: DetectedConflict[] = [];
    const reasoningTraces: AgentReasoningTrace[] = [];

    // 1. Conflict Check: Pacing Mismatch
    const missingCoreSkills = targetRole.requiredSkills.filter(req => {
      const existing = skills.find(s => s.skillName.toLowerCase() === req.skillName.toLowerCase());
      return !existing || existing.proficiencyLevel < req.benchmarkLevel;
    });

    const totalHoursNeeded = missingCoreSkills.reduce((acc, req) => {
      const existing = skills.find(s => s.skillName.toLowerCase() === req.skillName.toLowerCase());
      const delta = req.benchmarkLevel - (existing ? existing.proficiencyLevel : 0);
      return acc + delta * 8; // 8 hours per skill level
    }, 0);

    const availableHoursPerWeek = profile.hoursPerWeek || 10;
    const estimatedWeeksRequired = Math.ceil(totalHoursNeeded / Math.max(availableHoursPerWeek, 1));

    if (availableHoursPerWeek < 8 && totalHoursNeeded > 30) {
      conflicts.push({
        id: `conf-pace-${Date.now()}`,
        type: 'PACING_MISMATCH',
        severity: 'HIGH',
        title: 'Learning Velocity Below Target Role Invariant',
        description: `Learner committed ${availableHoursPerWeek}h/week, but mastering ${missingCoreSkills.length} core gaps for ${targetRole.title} requires ~${totalHoursNeeded} total hours. At this velocity, completion requires ${estimatedWeeksRequired} weeks.`,
        resolutionStrategy: 'Dynamic Curriculum Timeline Stretch',
        appliedAdjustment: `Extended recommended phase pacing from 8 weeks to ${Math.max(estimatedWeeksRequired, 12)} weeks to prevent learner burnout.`
      });

      reasoningTraces.push({
        step: 1,
        agentName: 'Conflict Detector & Resolution Agent',
        thought: `Calculated total backlog of ${totalHoursNeeded}h vs committed velocity of ${availableHoursPerWeek}h/wk. Detected severe pacing deficit.`,
        action: 'EMIT_CONFLICT_RESOLUTION(PACING_MISMATCH)',
        observation: `Rebalanced recommended timeline to ${Math.max(estimatedWeeksRequired, 12)} weeks with reduced weekly module density.`,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Conflict Check: Competency Overestimation Discrepancy
    recentCodingScores.forEach(scoreItem => {
      const matchedSkill = skills.find(s => s.skillName.toLowerCase() === scoreItem.skillName.toLowerCase());
      if (matchedSkill && matchedSkill.proficiencyLevel >= 3 && scoreItem.score < 60) {
        conflicts.push({
          id: `conf-comp-${Date.now()}`,
          type: 'COMPETENCY_DISCREPANCY',
          severity: 'HIGH',
          title: `Objective Assessment Discrepancy in ${matchedSkill.skillName}`,
          description: `Learner's self-assessed proficiency is Level ${matchedSkill.proficiencyLevel}, but recent objective coding verification scored ${scoreItem.score}%.`,
          resolutionStrategy: 'Automatic Competency Calibration & Remedial Reinforcement',
          appliedAdjustment: `Calibrated verified mastery to Level 2 and injected foundational ${matchedSkill.skillName} practice exercises into Phase 1.`
        });

        reasoningTraces.push({
          step: 2,
          agentName: 'Conflict Detector & Resolution Agent',
          thought: `Comparing self-rating (Level ${matchedSkill.proficiencyLevel}) with objective test execution (${scoreItem.score}%). Observed overestimation.`,
          action: 'CALIBRATE_COMPETENCY_DOWNWARD',
          observation: `Injected remedial prerequisite module for ${matchedSkill.skillName} to ensure verified runtime solidity.`,
          timestamp: new Date().toISOString()
        });
      }
    });

    // 3. Conflict Check: Prerequisite Violation
    const hasNode = skills.some(s => s.skillName.toLowerCase().includes('node') && s.proficiencyLevel >= 2);
    const hasJs = skills.some(s => s.skillName.toLowerCase().includes('javascript') && s.proficiencyLevel >= 2);

    if (hasNode && !hasJs) {
      conflicts.push({
        id: `conf-prereq-${Date.now()}`,
        type: 'PREREQUISITE_VIOLATION',
        severity: 'MEDIUM',
        title: 'Prerequisite Ordering Inversion (JavaScript before Node.js)',
        description: 'Learner attempted backend Node.js modules without verified foundation in JavaScript asynchronous closures and event loop.',
        resolutionStrategy: 'Prerequisite Pre-pending',
        appliedAdjustment: 'Re-ordered curriculum roadmap to require JavaScript Async Mastery before Node.js server building.'
      });

      reasoningTraces.push({
        step: 3,
        agentName: 'Conflict Detector & Resolution Agent',
        thought: 'Identified inversion of fundamental language prerequisite for runtime framework.',
        action: 'ENFORCE_PREREQUISITE_TOPOLOGY',
        observation: 'Pre-pended JavaScript Async invariants to ensure foundational comprehension.',
        timestamp: new Date().toISOString()
      });
    }

    let recommendationExplanation = '';
    if (conflicts.length > 0) {
      recommendationExplanation = `Conflict Detector resolved ${conflicts.length} systemic discrepancy(ies): ${conflicts.map(c => c.appliedAdjustment).join(' ')}`;
    } else {
      recommendationExplanation = `Zero architectural or pacing conflicts detected. Learning velocity of ${availableHoursPerWeek}h/week aligns cleanly with ${targetRole.title} milestone timeline.`;
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      recommendationExplanation,
      reasoningTraces
    };
  }
}
