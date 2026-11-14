import { v4 as uuidv4 } from 'uuid';
import { AgentRunResult } from './types.js';
import {
  UserProfile,
  Skill,
  LearningRoadmap,
  AssessmentAttempt,
  RoadmapAdjustmentLog,
  NotificationItem,
  RoadmapTask
} from '../types.js';

export interface ProgressOptimizationResult {
  roadmapAdjusted: boolean;
  adjustmentType: 'remediation_injected' | 'mastery_accelerated' | 'career_recalculated' | 'cadence_maintained';
  updatedRoadmap: LearningRoadmap;
  adjustmentLog: RoadmapAdjustmentLog;
  notificationCreated: NotificationItem;
  explanation: string;
}

export async function runProgressOptimizationAgent(
  profile: UserProfile,
  skills: Skill[],
  currentRoadmap: LearningRoadmap,
  trigger: 'assessment_completed' | 'career_goal_changed' | 'manual_review',
  contextData?: {
    assessmentAttempt?: AssessmentAttempt;
    newRoleId?: string;
    newRoleTitle?: string;
  }
): Promise<AgentRunResult<ProgressOptimizationResult>> {
  const startTime = Date.now();
  const inputSummary = `Trigger: ${trigger}, User: ${profile.userId}, Current Progress: ${currentRoadmap.overallProgressPercentage}%`;
  const now = new Date().toISOString();

  let adjustmentType: ProgressOptimizationResult['adjustmentType'] = 'cadence_maintained';
  let explanation = 'Maintained current roadmap cadence based on consistent learning velocity.';
  const affectedSkills: string[] = [];
  const tasksAdded: string[] = [];
  const tasksSkipped: string[] = [];

  // Deep clone current roadmap
  const updatedRoadmap: LearningRoadmap = JSON.parse(JSON.stringify(currentRoadmap));

  if (trigger === 'assessment_completed' && contextData?.assessmentAttempt) {
    const attempt = contextData.assessmentAttempt;
    affectedSkills.push(attempt.skillName);

    if (attempt.scorePercentage < 70) {
      // LOW SCORE (<70%): Adaptive Remediation
      adjustmentType = 'remediation_injected';
      explanation = `Assessment score was ${attempt.scorePercentage}%. Detected weak comprehension in: ${attempt.weakSubtopics.join(', ')}. Injected focused remediation tasks and scheduled retest.`;

      // Find the active phase
      const activePhase = updatedRoadmap.phases.find(p => p.status === 'in_progress') || updatedRoadmap.phases[0];

      const remedialTask: RoadmapTask = {
        id: `adaptive-remediation-${uuidv4().slice(0, 8)}`,
        phaseId: activePhase.id,
        order: activePhase.tasks.length + 1,
        title: `[Remediation] Targeted Review: ${attempt.skillName} Core Concepts`,
        description: `Deep-dive refresher covering missed concepts from recent assessment: ${attempt.weakSubtopics.join(', ')}.`,
        estimatedHours: 4,
        completed: false,
        category: 'languages',
        associatedSkill: attempt.skillName,
        criteria: `Score at least 80% on the scheduled retake quiz for ${attempt.skillName}.`,
        resourceLinks: [
          { title: `${attempt.skillName} Documentation`, url: 'https://developer.mozilla.org/en-US/', type: 'doc' },
          { title: 'Interactive Practice Platform', url: 'https://www.freecodecamp.org/', type: 'exercise' }
        ],
        isAdaptiveAddition: true
      };

      activePhase.tasks.push(remedialTask);
      tasksAdded.push(remedialTask.title);
    } else if (attempt.scorePercentage >= 85) {
      // HIGH SCORE (>=85%): Mastery Acceleration
      adjustmentType = 'mastery_accelerated';
      explanation = `Score of ${attempt.scorePercentage}% in ${attempt.skillName} achieved verified mastery! Automatically recognized competency, accelerated foundational requirements, and advanced milestone status.`;

      // Find tasks related to this skill in phase 1 and mark them completed or accelerated
      for (const ph of updatedRoadmap.phases) {
        for (const t of ph.tasks) {
          if (t.associatedSkill.toLowerCase() === attempt.skillName.toLowerCase() && !t.completed) {
            t.completed = true;
            t.completedAt = now;
            tasksSkipped.push(t.title);
          }
        }
      }

      // Check if Phase 1 is fully completed and advance Phase 2 to in_progress
      if (updatedRoadmap.phases[0] && updatedRoadmap.phases[0].tasks.every(t => t.completed)) {
        updatedRoadmap.phases[0].status = 'completed';
        if (updatedRoadmap.phases[1] && updatedRoadmap.phases[1].status === 'not_started') {
          updatedRoadmap.phases[1].status = 'in_progress';
        }
      }
    }
  } else if (trigger === 'career_goal_changed' && contextData?.newRoleTitle) {
    adjustmentType = 'career_recalculated';
    explanation = `Target career transitioned to "${contextData.newRoleTitle}". Recalculated benchmark delta and updated learning roadmap focus.`;
    updatedRoadmap.targetRoleId = contextData.newRoleId || updatedRoadmap.targetRoleId;
    updatedRoadmap.targetRoleTitle = contextData.newRoleTitle;
    affectedSkills.push(contextData.newRoleTitle);
  }

  // Recalculate roadmap overall progress percentage
  let totalTasks = 0;
  let completedCount = 0;
  for (const ph of updatedRoadmap.phases) {
    for (const t of ph.tasks) {
      totalTasks++;
      if (t.completed) completedCount++;
    }
  }
  updatedRoadmap.overallProgressPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  updatedRoadmap.lastAdjustedAt = now;

  const adjustmentLog: RoadmapAdjustmentLog = {
    id: `adj-${uuidv4().slice(0, 8)}`,
    userId: profile.userId,
    timestamp: now,
    trigger: trigger === 'assessment_completed'
      ? (contextData?.assessmentAttempt?.scorePercentage || 0) < 70 ? 'assessment_failure' : 'assessment_mastery'
      : trigger === 'career_goal_changed' ? 'career_goal_change' : 'manual_rebalance',
    description: explanation,
    affectedSkills,
    adjustmentDetails: {
      tasksAdded,
      tasksSkipped,
      roleSwitchedTo: contextData?.newRoleTitle,
      reasoning: explanation
    }
  };

  const notificationCreated: NotificationItem = {
    id: `notif-${uuidv4().slice(0, 8)}`,
    userId: profile.userId,
    title: adjustmentType === 'remediation_injected'
      ? 'Adaptive Roadmap: Remediation Injected'
      : adjustmentType === 'mastery_accelerated'
      ? 'Mastery Achieved! Roadmap Accelerated'
      : 'Roadmap Recalculated for New Target Career',
    message: explanation,
    type: adjustmentType === 'remediation_injected' ? 'warning' : 'success',
    read: false,
    createdAt: now,
    link: '/roadmap'
  };

  const latencyMs = Date.now() - startTime;
  return {
    success: true,
    data: {
      roadmapAdjusted: true,
      adjustmentType,
      updatedRoadmap,
      adjustmentLog,
      notificationCreated,
      explanation
    },
    source: 'heuristic_engine',
    latencyMs,
    taskSummary: `Executed adaptive optimization: ${adjustmentType}.`,
    inputSummary,
    outputSummary: explanation
  };
}
