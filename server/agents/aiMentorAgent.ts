import { geminiClient } from './geminiClient.js';
import { AgentRunResult } from './types.js';
import { User, UserProfile, Skill, LearningRoadmap } from '../types.js';

export interface MentorReplyOutput {
  reply: string;
  mode: 'general' | 'code_explanation' | 'quiz' | 'interview_prep' | 'roadmap_help';
  suggestedFollowUps: string[];
  referencedSkills: string[];
}

export async function runAIMentorAgent(
  user: User,
  profile: UserProfile,
  skills: Skill[],
  roadmap: LearningRoadmap | null,
  userMessage: string,
  mode: MentorReplyOutput['mode'] = 'general'
): Promise<AgentRunResult<MentorReplyOutput>> {
  const startTime = Date.now();
  const inputSummary = `User: "${userMessage.slice(0, 60)}...", Mode: ${mode}, Target: ${profile.targetCareerRoleId}`;

  const currentSkillsSummary = skills
    .map(s => `${s.skillName} (Lvl ${s.proficiencyLevel}, ${s.isVerified ? 'Verified' : 'Self-Reported'})`)
    .join(', ');

  const currentPhase = roadmap?.phases.find(p => p.status === 'in_progress') || roadmap?.phases[0];

  // Try Gemini LLM if API key is configured
  if (geminiClient.hasApiKey) {
    const systemPrompt = `You are the SkillPath AI Senior Career Mentor & Staff Technical Architect.
Learner Context:
- Name: ${user.name}
- Education: ${profile.educationLevel || 'Undergraduate'} (${profile.degree || 'Computer Science'}, ${profile.college || 'University'})
- Target Role: ${roadmap?.targetRoleTitle || profile.targetCareerRoleId}
- Current Skills: ${currentSkillsSummary}
- Active Roadmap Phase: ${currentPhase ? currentPhase.title : 'Phase 1'}
- Current Readiness Score: ${profile.overallReadinessScore}%

Rules:
1. Provide concise, high-signal, practical advice. Use clear markdown formatting, code snippets where helpful, and encouraging yet rigorous technical feedback.
2. In 'interview_prep' mode, give realistic behavioral or technical interview questions with grading criteria.
3. In 'code_explanation' mode, explain time complexity, potential bugs, and architectural idioms.
4. In 'roadmap_help' mode, direct the user to their next high-leverage milestones.
5. In 'quiz' mode, challenge the learner with a mini technical question.

Return JSON in this format:
{
  "reply": "Markdown response addressing the learner's query",
  "mode": "${mode}",
  "suggestedFollowUps": ["3 concise follow-up prompts the user can click next"],
  "referencedSkills": ["List of relevant skills mentioned"]
}`;

    const llmResult = await geminiClient.generateJSON<MentorReplyOutput>({
      prompt: `Learner message: "${userMessage}"\nMode: ${mode}`,
      systemInstruction: systemPrompt
    });

    if (llmResult?.data?.reply) {
      return {
        success: true,
        data: llmResult.data,
        source: 'gemini_llm',
        latencyMs: llmResult.latencyMs,
        taskSummary: `Generated context-aware mentoring response for mode: ${mode} using Gemini LLM.`,
        inputSummary,
        outputSummary: `Delivered ${llmResult.data.reply.length} chars of tailored guidance with ${llmResult.data.suggestedFollowUps.length} follow-up chips.`
      };
    }
  }

  // Deterministic Heuristic Engine Fallback
  const lowerMsg = userMessage.toLowerCase();
  let reply = '';
  let followUps = [
    'How do I prepare for technical interviews for this role?',
    'What should I focus on in my current roadmap phase?',
    'Can you give me a coding challenge to test my skills?',
    'Explain how database indexing works simply'
  ];
  let referencedSkills: string[] = [];

  if (lowerMsg.includes('closure') || lowerMsg.includes('javascript') || lowerMsg.includes('js')) {
    referencedSkills = ['JavaScript'];
    reply = `### Understanding Closures in JavaScript

A **closure** is a function that remembers and accesses variables from its outer (enclosing) lexical scope, even after that outer function has finished executing.

\`\`\`javascript
function createCounter(initialValue = 0) {
  let count = initialValue; // Kept in memory via closure
  
  return {
    increment: () => ++count,
    decrement: () => --count,
    get: () => count
  };
}

const counter = createCounter(10);
console.log(counter.increment()); // 11
console.log(counter.get());       // 11
\`\`\`

#### Key Takeaways:
1. **Encapsulation**: State (\`count\`) is completely private; external code cannot mutate it except through the exposed API.
2. **Memory Management**: Variables referenced in a closure remain in heap memory until the returned function reference is garbage collected.
3. **Common Pitfall**: Creating closures inside unbounded loops without let/const or failing to clear intervals can cause memory retention.`;

    followUps = [
      'What is the difference between microtasks and macrotasks?',
      'How does "this" binding work in arrow functions?',
      'Test my JavaScript skills with a quiz question'
    ];
  } else if (lowerMsg.includes('interview') || mode === 'interview_prep') {
    referencedSkills = ['Communication & Storytelling', 'Data Structures & Algorithms'];
    reply = `### Mock Interview: ${roadmap?.targetRoleTitle || 'Full Stack Developer'}

Here is a classic senior technical question tailored to your target pathway:

**"How would you design a scalable notification system that delivers real-time updates to millions of active users while handling intermittent client disconnects?"**

#### Recommended Answer Structure (STAR / Architecture Method):
1. **Functional & Non-Functional Requirements**: Throughput (10k events/sec), latency (<200ms), at-least-once delivery, reconnection sync.
2. **Protocols**: Compare WebSockets vs Server-Sent Events (SSE) vs Long Polling. Explain why SSE or WebSockets are preferred for server-push.
3. **Scale & State**: Use Redis Pub/Sub or Apache Kafka to distribute message events across horizontally scaled Node.js socket servers.
4. **Resilience & Fallback**: Handle reconnects by persisting undelivered notifications in a PostgreSQL table with an \`is_read\` flag and unique cursor timestamp.`;

    followUps = [
      'Give me a code review question',
      'How do I explain trade-offs between SQL and NoSQL?',
      'Review my current roadmap progress'
    ];
  } else if (lowerMsg.includes('roadmap') || lowerMsg.includes('next') || mode === 'roadmap_help') {
    referencedSkills = [currentPhase?.tasks[0]?.associatedSkill || 'Core Skills'];
    reply = `### Roadmap Guidance: Current Phase Overview

You are currently focused on **${currentPhase?.title || 'Foundational Competencies'}**.

#### Your Immediate Action Plan:
- **Next High-Priority Task**: ${currentPhase?.tasks.find(t => !t.completed)?.title || 'All current phase tasks completed! Advance to next phase.'}
- **Estimated Effort**: ~${currentPhase?.tasks.find(t => !t.completed)?.estimatedHours || 4} hours
- **Verification Strategy**: After finishing this milestone, take the corresponding topic assessment in the **Assessments** tab to elevate your verified skill badge.

Consistent daily progress (even 45-60 minutes) beats marathon weekend sessions for long-term neural encoding.`;

    followUps = [
      'Take me to my skill assessments',
      'What portfolio projects should I build?',
      'Explain closure in JS simply'
    ];
  } else if (lowerMsg.includes('index') || lowerMsg.includes('database') || lowerMsg.includes('sql')) {
    referencedSkills = ['SQL / PostgreSQL'];
    reply = `### How Database Indexing Works (B-Trees & Query Optimization)

Without an index, querying \`SELECT * FROM users WHERE email = 'alex@example.com'\` requires a **Full Table Scan (Sequential Scan)**, checking every single disk block ($O(n)$ time complexity).

#### 1. The B-Tree Index Mechanism
A standard index builds a balanced tree structure ($O(\\log n)$) where keys are sorted. The database traverses root $\\rightarrow$ intermediate $\\rightarrow$ leaf page pointers to pinpoint the exact disk row identifier (TID).

\`\`\`sql
-- Creating an index on lookup column
CREATE INDEX idx_users_email ON users(email);

-- Verifying index execution with EXPLAIN ANALYZE
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'alex@example.com';
\`\`\`

#### 2. Key Architectural Invariants:
- **Write Overhead**: Every \`INSERT\`, \`UPDATE\`, and \`DELETE\` must also mutate the index tree. Do not index columns with low cardinality (e.g. boolean flags).
- **Composite Index Column Order**: An index on \`(user_id, created_at)\` optimizes queries filtering by \`user_id\` or \`(user_id AND created_at)\`, but *not* queries filtering solely on \`created_at\`.`;

    followUps = [
      'What is an N+1 query problem and how do I prevent it?',
      'Explain ACID transaction isolation levels',
      'Give me an interview question on database scaling'
    ];
  } else {
    referencedSkills = ['Full Stack Architecture'];
    reply = `### Hello ${user.name}! I'm your SkillPath AI Technical Mentor.

I'm tracking your progress toward becoming a **${roadmap?.targetRoleTitle || 'Full Stack Engineer'}**. Your current skill readiness is **${profile.overallReadinessScore}%** with **${profile.streakDays} days** on your active learning streak.

#### How I Can Assist You Right Now:
- **Code Diagnostics**: Paste any code snippet for time complexity analysis, refactoring, or bug detection.
- **Concept Deep-Dives**: Ask me to demystify async runtimes, React rendering cycles, database indexes, or Docker networking.
- **Technical Mock Interviews**: Practice behavioral and system design questions tailored to your target roles.
- **Roadmap Optimization**: Strategize on which task delivers maximum career leverage this week.`;
  }

  const data: MentorReplyOutput = {
    reply,
    mode,
    suggestedFollowUps: followUps,
    referencedSkills
  };

  const latencyMs = Date.now() - startTime;
  return {
    success: true,
    data,
    source: 'heuristic_engine',
    latencyMs,
    taskSummary: `Delivered context-aware mentor response in mode: ${mode}.`,
    inputSummary,
    outputSummary: `Rendered ${reply.length} chars of guidance referencing [${referencedSkills.join(', ')}].`
  };
}
