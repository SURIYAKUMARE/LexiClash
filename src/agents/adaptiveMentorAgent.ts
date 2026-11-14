import { OfflineSkill, OfflineCareerRole, OfflineProfile } from '../db/indexedDb';
import { MentorChatResult, AgentReasoningTrace, ProjectIdea } from './types';

export class AdaptiveMentorAgent {
  public static handleMessage(
    userMessage: string,
    profile: OfflineProfile,
    targetRole: OfflineCareerRole,
    skills: OfflineSkill[],
    mode: string = 'general'
  ): MentorChatResult {
    const traces: AgentReasoningTrace[] = [];
    const timestamp = new Date().toISOString();
    const cleanMsg = userMessage.trim();

    traces.push({
      step: 1,
      agentName: 'Adaptive Mentor & Evaluator Agent',
      thought: `Received query in mode "${mode}": "${cleanMsg}". Parsing intent and evaluating learner context (Target Role: ${targetRole.title}, Readiness: ${profile.overallReadinessScore}%).`,
      action: 'PARSE_QUERY_INTENT',
      observation: `User has ${skills.length} stored skills. Gaps identified in role benchmarks. Checking for slash command invocation.`,
      timestamp
    });

    let reply = '';
    const suggestedFollowUps: string[] = [];
    let commandExecuted: string | undefined = undefined;

    // Check for slash commands
    if (cleanMsg.startsWith('/mock-interview')) {
      commandExecuted = '/mock-interview';
      reply = `### Mock Technical Interview: Full Stack Engineering
**Scenario Question:**
"Suppose your React frontend makes 50 concurrent requests to an Express endpoint that executes a PostgreSQL query. The database connection pool is capped at 10. How would you redesign both the frontend fetching layer and backend queue to prevent connection pool exhaustion and memory leaks?"

**Key Areas to Touch:**
1. Frontend request throttling / batching.
2. Backend connection pool management and message queueing (e.g., Redis / BullMQ).
3. Backpressure handling.

Take your time and outline your architectural approach below.`;
      suggestedFollowUps.push(
        'Use Redis BullMQ queue on backend',
        'Batch queries using DataLoader pattern',
        'Debounce requests on frontend'
      );
    } else if (cleanMsg.startsWith('/explain-gap')) {
      commandExecuted = '/explain-gap';
      const missingSkills = targetRole.requiredSkills.filter(req => {
        const s = skills.find(sk => sk.skillName.toLowerCase() === req.skillName.toLowerCase());
        return !s || s.proficiencyLevel < req.benchmarkLevel;
      });

      reply = `### Why Your Gaps Matter for ${targetRole.title}
Based on market hiring benchmarks, your primary gaps are in:
${missingSkills.map(m => `- **${m.skillName} (Benchmark Level ${m.benchmarkLevel}/5)**: Critical for architectural resilience.`).join('\n')}

**The Architectural Reasoning:**
In senior engineering interviews, breadth without runtime depth is an immediate red flag. For instance, knowing React without knowing the Node.js event loop leaves you unable to debug server-side rendering hydration issues or API latency spikes. Closing these 2-3 specific gaps will increase your market readiness score by **+20-30%**.`;
      suggestedFollowUps.push(
        'Show me a study guide for Node.js event loop',
        'How do I test my PostgreSQL query skills?',
        '/mock-interview'
      );
    } else if (cleanMsg.startsWith('/pivot-career')) {
      commandExecuted = '/pivot-career';
      reply = `### Career Pivot Analysis
You are currently targeting **${targetRole.title}** (Readiness: ${profile.overallReadinessScore}%).

**Adjacent Pivots with High Overlap:**
1. **Backend Engineer**: 85% overlap with your database and API skills.
2. **AI / ML Engineer**: Strong pivot if you have Python & SQL foundations.
3. **Cloud DevOps Architect**: Ideal if you reinforce Linux and Docker containerization.

To switch your target role instantly, use the **Career Selector** on your dashboard or diagnostics page. All roadmaps will recalculate automatically.`;
      suggestedFollowUps.push(
        'Compare Full Stack vs AI/ML Engineer',
        'What skills do I need for DevOps?',
        '/reassess'
      );
    } else if (cleanMsg.startsWith('/reassess')) {
      commandExecuted = '/reassess';
      reply = `### Profile Reassessment Complete
- **Target Role:** ${targetRole.title}
- **Readiness Score:** ${profile.overallReadinessScore}%
- **Mastered Competencies:** ${skills.filter(s => s.proficiencyLevel >= 3).map(s => s.skillName).join(', ')}
- **Pending Assessments:** Take diagnostic quizzes in the Assessments studio to convert your self-reported ratings into verified badges.`;
      suggestedFollowUps.push(
        'Take JavaScript Diagnostic Assessment',
        '/explain-gap',
        '/mock-interview'
      );
    } else {
      // General or specific engineering inquiries
      const lower = cleanMsg.toLowerCase();
      if (lower.includes('event loop') || lower.includes('async')) {
        reply = `### The Node.js Event Loop Simplified
The JavaScript runtime is single-threaded, but non-blocking I/O is achieved through the **libuv** thread pool.

**Execution Order Invariant:**
1. Synchronous Stack Frames (Runs to completion)
2. **Microtask Queue** (\`process.nextTick\` in Node, then \`Promise.then\` callbacks) - Drained completely after *every* stack frame!
3. **Macrotask Queue** (Timers: \`setTimeout\`, \`setInterval\`, I/O callbacks, \`setImmediate\`)

**Pro-tip:** Never execute expensive synchronous operations inside a Promise constructor—only resolve/reject asynchronously, or offload compute to a Worker Thread.`;
        suggestedFollowUps.push(
          'Difference between process.nextTick and setImmediate',
          'Explain streams backpressure',
          '/mock-interview'
        );
      } else if (lower.includes('react') || lower.includes('state')) {
        reply = `### React State & Reconciliation Invariant
In React, state changes do not immediately mutate the DOM. Instead, React schedules an update, computes a new Fiber tree, and diffs it against the current Fiber tree using **Object.is** reference comparisons.

**Rule:** Always treat state as immutable:
\`\`\`ts
// Good: Returns a brand-new object reference
setProfile(prev => ({ ...prev, hoursPerWeek: 15 }));
\`\`\`
If you mutate an array in place (\`items.push()\`), the memory reference remains identical, and React will skip rerendering your component!`;
        suggestedFollowUps.push(
          'How does useMemo prevent rerenders?',
          'Explain Context API vs Zustand',
          '/explain-gap'
        );
      } else {
        reply = `I am your **Adaptive AI Technical Mentor**, grounded in your **${targetRole.title}** roadmap.

I can help you with:
- **Runtime Mechanics:** Deep explanations of event loops, streams, state immutability, or query indexing.
- **Mock Interviews:** Run \`/mock-interview\` to practice scenario questions.
- **Career Strategy:** Run \`/explain-gap\` to understand your prioritized milestones or \`/pivot-career\` to explore adjacent tech paths.

What technical concept or roadmap task would you like to tackle right now?`;
        suggestedFollowUps.push(
          '/explain-gap',
          '/mock-interview',
          '/pivot-career',
          'How does the event loop handle Promises?'
        );
      }
    }

    traces.push({
      step: 2,
      agentName: 'Adaptive Mentor & Evaluator Agent',
      thought: `Generated pedagogical response grounded in ${targetRole.title} curriculum invariants. Provided ${suggestedFollowUps.length} context-aware follow-ups.`,
      action: 'EMIT_MENTOR_RESPONSE',
      observation: `Dispatched response with command status "${commandExecuted || 'standard_chat'}".`,
      timestamp
    });

    return {
      reply,
      suggestedFollowUps,
      commandExecuted,
      agentReasoningTraces: traces
    };
  }

  /**
   * Interactive Project Idea Generator:
   * Synthesizes user's EXISTING strengths with NEWLY learned target skills into portfolio-ready capstones.
   */
  public static generateProjectIdeas(
    existingSkills: string[],
    targetSkills: string[],
    roleTitle: string
  ): ProjectIdea[] {
    const existingList = existingSkills.length ? existingSkills.slice(0, 3).join(' + ') : 'Core Languages';
    const targetList = targetSkills.length ? targetSkills.slice(0, 3).join(' + ') : 'Modern Frameworks';

    return [
      {
        title: 'Distributed Real-Time Telemetry & Metric Dashboard',
        elevatorPitch: `An end-to-end monitoring platform leveraging your existing knowledge of ${existingList} with newly acquired mastery in ${targetList}.`,
        synergyExplanation: `Combines robust data modeling and aggregation algorithms with reactive frontend rendering and event-driven websockets.`,
        existingSkillsCombined: existingSkills.slice(0, 3),
        newSkillsTargeted: targetSkills.slice(0, 3),
        architectureDiagram: `Client (React/TS) <---> WebSocket Gateway (Node.js) <---> Relational Engine (PostgreSQL) <---> Background Worker`,
        milestones: [
          'Design normalized schema with indexed timestamps.',
          'Implement backpressure-regulated streaming endpoints.',
          'Build virtualized data tables rendering 10,000+ rows without layout lag.'
        ],
        complexity: 'Capstone'
      },
      {
        title: 'Zero-Knowledge Offline-First Knowledge Base',
        elevatorPitch: `A high-performance markdown and notes management system that functions 100% offline using IndexedDB, synchronization queues, and cryptographic token verification.`,
        synergyExplanation: `Directly demonstrates full-stack architectural maturity, edge caching, and service worker resilience.`,
        existingSkillsCombined: existingSkills.slice(0, 2),
        newSkillsTargeted: targetSkills.slice(0, 2),
        architectureDiagram: `Service Worker Cache <---> IndexedDB Store <---> Reconciliation Sync Layer <---> REST API`,
        milestones: [
          'Implement Dexie.js offline schema with automatic sync queues.',
          'Handle conflict resolution during network rehydration.',
          'Export study summaries to Markdown and PDF.'
        ],
        complexity: 'Intermediate'
      }
    ];
  }
}
