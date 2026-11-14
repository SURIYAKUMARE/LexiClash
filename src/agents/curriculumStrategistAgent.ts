import { OfflineSkill, OfflineCareerRole, OfflineRoadmap, OfflineRoadmapPhase, OfflineRoadmapTask } from '../db/indexedDb';
import { CurriculumPlanResult, AgentReasoningTrace } from './types';
import { OFFLINE_STUDY_GUIDES } from '../db/seedData';

export class CurriculumStrategistAgent {
  public static generateRoadmap(
    userId: string,
    targetRole: OfflineCareerRole,
    skills: OfflineSkill[],
    hoursPerWeek: number = 10
  ): OfflineRoadmap {
    const timestamp = new Date().toISOString();

    // Determine specific gaps to target
    const missingCore = targetRole.requiredSkills.filter(req => {
      const s = skills.find(sk => sk.skillName.toLowerCase() === req.skillName.toLowerCase());
      return !s || s.proficiencyLevel < req.benchmarkLevel;
    });

    const phases: OfflineRoadmapPhase[] = [
      {
        id: `phase-${targetRole.id}-1`,
        phaseNumber: 1,
        title: 'Phase 1: Core Foundations & Language Invariants',
        description: 'Master low-level language semantics, memory lifecycle, asynchronous event loops, and type invariants.',
        status: 'in_progress',
        estimatedWeeks: Math.max(2, Math.round(18 / hoursPerWeek)),
        tasks: [
          {
            id: `task-${targetRole.id}-1-1`,
            phaseId: `phase-${targetRole.id}-1`,
            title: 'Asynchronous Concurrency & Event Loop Deep Dive',
            description: 'Understand the Call Stack, Microtask queue (Promises), and Macrotask queue (Timers/IO).',
            estimatedHours: 4,
            criteria: 'Explain microtask queue ordering and predict event loop output for nested Promises.',
            completed: true,
            type: 'Doc',
            provider: 'SkillPath Offline Academy',
            url: '#offline-guide-event-loop',
            studyGuideOffline: OFFLINE_STUDY_GUIDES['js-event-loop']
          },
          {
            id: `task-${targetRole.id}-1-2`,
            phaseId: `phase-${targetRole.id}-1`,
            title: 'Scope, Closures & Lexical Environments Practice',
            description: 'Implement encapsulation patterns and investigate memory leak vectors with detached closures.',
            estimatedHours: 3,
            criteria: 'Build an event emitter closure with private subscriber registry.',
            completed: true,
            type: 'Exercise',
            provider: 'SkillPath Lab',
            url: '#offline-exercise-closures'
          },
          {
            id: `task-${targetRole.id}-1-3`,
            phaseId: `phase-${targetRole.id}-1`,
            title: 'Phase 1 Foundations Assessment Check',
            description: 'Verify language invariants with 10 diagnostic questions under timed conditions.',
            estimatedHours: 1,
            criteria: 'Achieve >= 75% score on JavaScript/Language core assessment.',
            completed: false,
            type: 'Assessment',
            provider: 'SkillPath Evaluator',
            url: '/assessments'
          }
        ]
      },
      {
        id: `phase-${targetRole.id}-2`,
        phaseNumber: 2,
        title: 'Phase 2: Framework Mastery & Component Architecture',
        description: 'Modern component composition, reactive state trees, performance memoization, and custom hooks.',
        status: 'upcoming',
        estimatedWeeks: Math.max(3, Math.round(24 / hoursPerWeek)),
        tasks: [
          {
            id: `task-${targetRole.id}-2-1`,
            phaseId: `phase-${targetRole.id}-2`,
            title: 'React Custom Hooks & State Design Patterns',
            description: 'Design immutable state flows and encapsulate complex side effects using custom hooks.',
            estimatedHours: 5,
            criteria: 'Construct useDebouncedFetch and useLocalStorage with type safety.',
            completed: false,
            type: 'Doc',
            provider: 'SkillPath Offline Academy',
            url: '#offline-guide-react-state',
            studyGuideOffline: OFFLINE_STUDY_GUIDES['react-state']
          },
          {
            id: `task-${targetRole.id}-2-2`,
            phaseId: `phase-${targetRole.id}-2`,
            title: 'Interactive Kanban Board Mini-Project',
            description: 'Build a drag-and-drop stateful Kanban board with optimistic updates and local persistence.',
            estimatedHours: 6,
            criteria: 'Zero layout shift, memoized task lists, and accessible keyboard navigability.',
            completed: false,
            type: 'Project',
            provider: 'SkillPath Project Studio',
            url: '/projects'
          }
        ]
      },
      {
        id: `phase-${targetRole.id}-3`,
        phaseNumber: 3,
        title: 'Phase 3: Backend Runtime & Data Layer Integration',
        description: 'Non-blocking I/O streams, REST API schemas, database indexing, and authentication contracts.',
        status: 'upcoming',
        estimatedWeeks: Math.max(3, Math.round(26 / hoursPerWeek)),
        tasks: [
          {
            id: `task-${targetRole.id}-3-1`,
            phaseId: `phase-${targetRole.id}-3`,
            title: 'Node.js Streams & Non-Blocking I/O Backpressure',
            description: 'Read and transform massive datasets using pipeline streams without RAM overflows.',
            estimatedHours: 5,
            criteria: 'Process a 100MB CSV file in under 20MB memory envelope.',
            completed: false,
            type: 'Doc',
            provider: 'SkillPath Offline Academy',
            url: '#offline-guide-node-streams',
            studyGuideOffline: OFFLINE_STUDY_GUIDES['node-streams']
          },
          {
            id: `task-${targetRole.id}-3-2`,
            phaseId: `phase-${targetRole.id}-3`,
            title: 'PostgreSQL Relational Schema & B-tree Index Tuning',
            description: 'Model relational foreign keys, analyze query plans with EXPLAIN ANALYZE, and tune indexes.',
            estimatedHours: 4,
            criteria: 'Reduce table scan latency by 80% via composite indexes.',
            completed: false,
            type: 'Exercise',
            provider: 'SkillPath Lab',
            url: '#offline-exercise-sql'
          }
        ]
      },
      {
        id: `phase-${targetRole.id}-4`,
        phaseNumber: 4,
        title: 'Phase 4: Capstone Deployment & Production Hardening',
        description: 'Multi-stage Docker containers, automated CI/CD pipelines, and end-to-end portfolio proof of work.',
        status: 'upcoming',
        estimatedWeeks: Math.max(3, Math.round(30 / hoursPerWeek)),
        tasks: [
          {
            id: `task-${targetRole.id}-4-1`,
            phaseId: `phase-${targetRole.id}-4`,
            title: 'Multi-Stage Docker Containerization',
            description: 'Construct a multi-stage Dockerfile that builds static assets and packages a minimal Alpine image.',
            estimatedHours: 4,
            criteria: 'Container size < 120MB with non-root security context.',
            completed: false,
            type: 'Project',
            provider: 'SkillPath Lab',
            url: '#offline-docker-capstone'
          },
          {
            id: `task-${targetRole.id}-4-2`,
            phaseId: `phase-${targetRole.id}-4`,
            title: 'Full Stack Production Capstone Project',
            description: 'Synthesize all acquired skills into a complete portfolio-ready application with documentation.',
            estimatedHours: 12,
            criteria: 'Complete test coverage, deployed live demo, and architectural README.',
            completed: false,
            type: 'Project',
            provider: 'SkillPath Studio',
            url: '/projects'
          }
        ]
      }
    ];

    const totalTasks = phases.reduce((acc, p) => acc + p.tasks.length, 0);
    const completedTasks = phases.reduce((acc, p) => acc + p.tasks.filter(t => t.completed).length, 0);
    const overallProgressPercentage = Math.round((completedTasks / totalTasks) * 100);

    return {
      id: `roadmap-${userId}-${targetRole.id}`,
      userId,
      targetRoleId: targetRole.id,
      targetRoleTitle: targetRole.title,
      overallProgressPercentage,
      lastAdjustedAt: timestamp,
      phases
    };
  }

  /**
   * Dynamic Re-Routing: Injects targeted remedial micro-modules when assessment score is low
   */
  public static injectRemedialModule(
    currentRoadmap: OfflineRoadmap,
    weakTopic: string,
    subtopic: string
  ): {
    updatedRoadmap: OfflineRoadmap;
    injectedTaskTitle: string;
    reasoningTraces: AgentReasoningTrace[];
  } {
    const traces: AgentReasoningTrace[] = [];
    const timestamp = new Date().toISOString();

    traces.push({
      step: 1,
      agentName: 'Curriculum & Resource Strategist Agent',
      thought: `Diagnostic triggered: User scored below 70% threshold on topic "${weakTopic}" with weak subtopic "${subtopic}". Dynamic re-routing initiated.`,
      action: 'EVALUATE_REMEDIAL_DEFICIT',
      observation: `Subtopic weakness identified: ${subtopic}. Generating targeted remedial micro-module to close conceptual gap before advancing.`,
      timestamp
    });

    const activePhase = currentRoadmap.phases.find(p => p.status === 'in_progress') || currentRoadmap.phases[0];

    const remedialTask: OfflineRoadmapTask = {
      id: `remedial-${Date.now()}`,
      phaseId: activePhase.id,
      title: `[Remedial Focus] Deep Dive: ${subtopic}`,
      description: `Targeted review generated by Evaluator Agent to remediate misconceptions identified in the latest assessment.`,
      estimatedHours: 2,
      criteria: `Solve 3 targeted sandbox exercises specifically testing ${subtopic}.`,
      completed: false,
      type: 'Exercise',
      provider: 'SkillPath Adaptive Remediation',
      url: '/assessments',
      isRemedial: true
    };

    // Prepend into active phase tasks
    activePhase.tasks.unshift(remedialTask);

    traces.push({
      step: 2,
      agentName: 'Curriculum & Resource Strategist Agent',
      thought: `Injected remedial task "${remedialTask.title}" into ${activePhase.title}. Prioritized ahead of remaining milestones.`,
      action: 'INJECT_REMEDIAL_MODULE',
      observation: `Roadmap recalibrated. Phase workload adjusted by +2 hours.`,
      timestamp
    });

    return {
      updatedRoadmap: {
        ...currentRoadmap,
        lastAdjustedAt: timestamp
      },
      injectedTaskTitle: remedialTask.title,
      reasoningTraces: traces
    };
  }
}
