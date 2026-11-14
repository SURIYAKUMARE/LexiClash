import { v4 as uuidv4 } from 'uuid';
import { geminiClient } from './geminiClient.js';
import { AgentRunResult } from './types.js';
import { UserProfile, CareerRole, SkillGapAnalysisResult, LearningRoadmap, RoadmapPhase, RoadmapTask } from '../types.js';

export async function runLearningPathAgent(
  profile: UserProfile,
  targetRole: CareerRole,
  gapAnalysis: SkillGapAnalysisResult
): Promise<AgentRunResult<LearningRoadmap>> {
  const startTime = Date.now();
  const inputSummary = `Learner Target: ${targetRole.title}, Gaps: ${gapAnalysis.gaps.length}, Pace: ${profile.learningPreferences?.pace || 'moderate'}`;

  // Build standard structured 4-phase roadmap tailored to the target role and specific gaps
  const now = new Date().toISOString();
  const phases: RoadmapPhase[] = [
    {
      id: `phase-1-${uuidv4().slice(0, 8)}`,
      phaseNumber: 1,
      title: 'Phase 1: Foundations & Type-Safe Core Competencies',
      description: `Establish bedrock syntax, runtime mechanisms, and type safety required for ${targetRole.title}.`,
      durationWeeks: 3,
      status: 'in_progress',
      tasks: []
    },
    {
      id: `phase-2-${uuidv4().slice(0, 8)}`,
      phaseNumber: 2,
      title: 'Phase 2: Applied Architecture & Core Frameworks',
      description: `Construct real-world application components, state models, and backend interactions.`,
      durationWeeks: 4,
      status: 'not_started',
      tasks: []
    },
    {
      id: `phase-3-${uuidv4().slice(0, 8)}`,
      phaseNumber: 3,
      title: 'Phase 3: Production Patterns, Databases & Cloud Systems',
      description: `Implement persistent storage, indexing, containerization, and automated integration pipelines.`,
      durationWeeks: 4,
      status: 'not_started',
      tasks: []
    },
    {
      id: `phase-4-${uuidv4().slice(0, 8)}`,
      phaseNumber: 4,
      title: 'Phase 4: Capstone Portfolio & Technical Interview Mastery',
      description: `Synthesize skills into an industry-grade project and execute mock system design evaluations.`,
      durationWeeks: 3,
      status: 'not_started',
      tasks: []
    }
  ];

  // Map high priority gaps into Phase 1 and Phase 2 tasks
  let orderCounter = 1;
  const primaryGaps = gapAnalysis.gaps.slice(0, 3);
  if (primaryGaps.length === 0) {
    // Already advanced, insert mastery tasks
    phases[0].tasks.push({
      id: `task-foundation-review-${uuidv4().slice(0, 8)}`,
      phaseId: phases[0].id,
      order: orderCounter++,
      title: `Core Architectural Principles in ${targetRole.title}`,
      description: 'Review foundational invariants, performance bottlenecks, and modern design patterns.',
      estimatedHours: 4,
      completed: true,
      category: 'languages',
      associatedSkill: targetRole.requiredSkills[0]?.skillName || 'Engineering Foundations',
      criteria: 'Pass assessment review with score >= 85%.',
      resourceLinks: [
        { title: 'Official Documentation', url: 'https://developer.mozilla.org/en-US/docs/Web', type: 'doc' }
      ]
    });
  } else {
    for (const gap of primaryGaps) {
      phases[0].tasks.push({
        id: `task-gap-${gap.skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${uuidv4().slice(0, 6)}`,
        phaseId: phases[0].id,
        order: orderCounter++,
        title: `Master ${gap.skillName} Core Concepts (Bridge Gap: Level ${gap.currentLevel} → ${gap.benchmarkLevel})`,
        description: `Deep dive into standard libraries, idioms, and design patterns for ${gap.skillName}.`,
        estimatedHours: gap.delta * 4,
        completed: false,
        category: gap.category,
        associatedSkill: gap.skillName,
        criteria: `Achieve a score of at least 80% on the ${gap.skillName} assessment to verify mastery.`,
        resourceLinks: [
          { title: `${gap.skillName} Documentation`, url: 'https://developer.mozilla.org/en-US/', type: 'doc' }
        ]
      });
    }
  }

  // Phase 2 tasks
  phases[1].tasks.push(
    {
      id: `task-p2-arch-${uuidv4().slice(0, 8)}`,
      phaseId: phases[1].id,
      order: 1,
      title: `Architect Scalable Services for ${targetRole.title}`,
      description: 'Build modular, decoupled application services adhering to SOLID and clean architecture principles.',
      estimatedHours: 6,
      completed: false,
      category: 'frameworks',
      associatedSkill: targetRole.requiredSkills[1]?.skillName || 'Architecture',
      criteria: 'Demonstrate decoupled business logic with unit test coverage > 80%.',
      resourceLinks: [
        { title: 'React Documentation', url: 'https://react.dev/learn', type: 'doc' }
      ]
    },
    {
      id: `task-p2-state-${uuidv4().slice(0, 8)}`,
      phaseId: phases[1].id,
      order: 2,
      title: 'State Management & Error Handling Workflows',
      description: 'Implement optimistic updates, retry policies, and centralized exception telemetry.',
      estimatedHours: 5,
      completed: false,
      category: 'frameworks',
      associatedSkill: targetRole.requiredSkills[0]?.skillName || 'Engineering',
      criteria: 'Handle transient network failures gracefully without application crash.',
      resourceLinks: [
        { title: 'MDN Web APIs', url: 'https://developer.mozilla.org/en-US/docs/Web/API', type: 'doc' }
      ]
    }
  );

  // Phase 3 tasks
  phases[2].tasks.push(
    {
      id: `task-p3-db-${uuidv4().slice(0, 8)}`,
      phaseId: phases[2].id,
      order: 1,
      title: 'Relational Schema Optimization & Query Tuning',
      description: 'Formulate migration scripts, index critical search paths, and resolve N+1 query patterns.',
      estimatedHours: 7,
      completed: false,
      category: 'databases',
      associatedSkill: 'SQL / PostgreSQL',
      criteria: 'Verify index utilization using database EXPLAIN ANALYZE execution plans.',
      resourceLinks: [
        { title: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com/', type: 'tutorial' }
      ]
    },
    {
      id: `task-p3-docker-${uuidv4().slice(0, 8)}`,
      phaseId: phases[2].id,
      order: 2,
      title: 'Multi-Stage Containerization & CI Automation',
      description: 'Construct lean Docker images with multi-stage builds and automated GitHub Actions verification.',
      estimatedHours: 6,
      completed: false,
      category: 'cloud',
      associatedSkill: 'Docker',
      criteria: 'Produce an optimized container image under 150MB with automated build pass.',
      resourceLinks: [
        { title: 'Docker Curriculum', url: 'https://docker-curriculum.com/', type: 'tutorial' }
      ]
    }
  );

  // Phase 4 tasks
  phases[3].tasks.push(
    {
      id: `task-p4-capstone-${uuidv4().slice(0, 8)}`,
      phaseId: phases[3].id,
      order: 1,
      title: `End-to-End ${targetRole.title} Capstone Deployment`,
      description: 'Deliver a production application with authenticated workflows, database persistence, and documentation.',
      estimatedHours: 14,
      completed: false,
      category: 'frameworks',
      associatedSkill: targetRole.title,
      criteria: 'Provide live public application URL and clean open-source GitHub repository.',
      resourceLinks: [
        { title: 'Git Pro Guide', url: 'https://git-scm.com/book/en/v2', type: 'doc' }
      ]
    },
    {
      id: `task-p4-interview-${uuidv4().slice(0, 8)}`,
      phaseId: phases[3].id,
      order: 2,
      title: 'Technical Behavioral & System Architecture Simulation',
      description: 'Rehearse technical trade-off discussions, scaling strategies, and coding problem explanations.',
      estimatedHours: 6,
      completed: false,
      category: 'soft_skills',
      associatedSkill: 'Communication & Storytelling',
      criteria: 'Complete 3 simulated technical interview sessions with the AI Mentor.',
      resourceLinks: [
        { title: 'Harvard CS50', url: 'https://cs50.harvard.edu/x/', type: 'course' }
      ]
    }
  );

  // Calculate overall initial completion percentage
  let totalTasks = 0;
  let completedTasks = 0;
  for (const ph of phases) {
    for (const t of ph.tasks) {
      totalTasks++;
      if (t.completed) completedTasks++;
    }
  }
  const overallProgressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const roadmap: LearningRoadmap = {
    id: `roadmap-${profile.userId}-${uuidv4().slice(0, 6)}`,
    userId: profile.userId,
    targetRoleId: targetRole.id,
    targetRoleTitle: targetRole.title,
    phases,
    overallProgressPercentage,
    generatedBy: 'agent',
    generatedAt: now,
    lastAdjustedAt: now
  };

  const latencyMs = Date.now() - startTime;
  return {
    success: true,
    data: roadmap,
    source: 'heuristic_engine',
    latencyMs,
    taskSummary: `Generated tailored 4-phase learning roadmap for ${targetRole.title}.`,
    inputSummary,
    outputSummary: `Created ${phases.length} phases containing ${totalTasks} structured milestone tasks.`
  };
}
