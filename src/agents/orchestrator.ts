import { db, OfflineUser, OfflineProfile, OfflineSkill, OfflineCareerRole, OfflineRoadmap } from '../db/indexedDb';
import { ProfilerAgent } from './profilerAgent';
import { CareerArchitectAgent } from './careerArchitectAgent';
import { CurriculumStrategistAgent } from './curriculumStrategistAgent';
import { AdaptiveMentorAgent } from './adaptiveMentorAgent';
import { AgentReasoningTrace, CareerBenchmarkResult, ProfilerAnalysisResult } from './types';

export interface FullOrchestrationResult {
  profilerResult: ProfilerAnalysisResult;
  benchmarkResult: CareerBenchmarkResult;
  updatedRoadmap: OfflineRoadmap;
  allTraces: AgentReasoningTrace[];
}

type TraceListener = (traces: AgentReasoningTrace[]) => void;

export class AgentOrchestrator {
  private static listeners: TraceListener[] = [];
  private static recentTraces: AgentReasoningTrace[] = [];

  public static subscribe(listener: TraceListener): () => void {
    this.listeners.push(listener);
    // Emit current traces immediately
    listener(this.recentTraces);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public static getRecentTraces(): AgentReasoningTrace[] {
    return this.recentTraces;
  }

  private static notify(newTraces: AgentReasoningTrace[]) {
    this.recentTraces = [...newTraces, ...this.recentTraces].slice(0, 50);
    this.listeners.forEach(l => l(this.recentTraces));
  }

  /**
   * Complete Cross-Agent Orchestration Cycle:
   * 1. Profiler Agent analyzes persona & skills
   * 2. Hand-off -> Career Market Architect benchmarks against target role
   * 3. Hand-off -> Curriculum Strategist builds/adjusts roadmap
   * 4. Hand-off -> Adaptive Mentor & Evaluator updates feedback
   */
  public static async runFullOrchestration(
    userId: string
  ): Promise<FullOrchestrationResult> {
    const user = await db.users.get(userId);
    const profile = await db.profiles.where('userId').equals(userId).first();
    const skills = await db.skills.where('userId').equals(userId).toArray();
    const careers = await db.careers.toArray();

    if (!user || !profile) {
      throw new Error('User or profile not found for orchestration');
    }

    const targetRole = careers.find(c => c.id === profile.targetCareerRoleId) || careers[0];
    const allTraces: AgentReasoningTrace[] = [];
    const startTime = Date.now();

    // 1. Profiler Agent
    const profilerResult = ProfilerAgent.analyzeProfile(user, profile, skills);
    allTraces.push(...profilerResult.reasoningTraces);

    // Save trace log
    await db.agentTraces.add({
      id: `trace-profiler-${Date.now()}`,
      userId,
      agentName: 'Profiler & Skill Analyst Agent',
      timestamp: new Date().toISOString(),
      task: 'Synthesize learner credentials, pace, and blind spots',
      inputSummary: `User: ${user.name}, Skills Count: ${skills.length}, Hours: ${profile.hoursPerWeek}h/wk`,
      outputSummary: profilerResult.personaSummary,
      reasoningTrace: profilerResult.reasoningTraces.map(t => `${t.action}: ${t.observation}`),
      handoffTo: 'Career Market Architect Agent',
      latencyMs: Date.now() - startTime
    });

    // 2. Career Market Architect Agent
    const benchmarkStartTime = Date.now();
    const benchmarkResult = CareerArchitectAgent.benchmarkRole(skills, targetRole);
    allTraces.push(...benchmarkResult.reasoningTraces);

    await db.agentTraces.add({
      id: `trace-career-${Date.now()}`,
      userId,
      agentName: 'Career Market Architect Agent',
      timestamp: new Date().toISOString(),
      task: `Compute role readiness for ${targetRole.title}`,
      inputSummary: `Role: ${targetRole.title}, Required Skills: ${targetRole.requiredSkills.length}`,
      outputSummary: `Readiness: ${benchmarkResult.readinessPercentage}%, Missing: ${benchmarkResult.criticalMissing.length}`,
      reasoningTrace: benchmarkResult.reasoningTraces.map(t => `${t.action}: ${t.observation}`),
      handoffTo: 'Curriculum & Resource Strategist Agent',
      latencyMs: Date.now() - benchmarkStartTime
    });

    // Update profile readiness score in database
    await db.profiles.update(profile.id, {
      overallReadinessScore: benchmarkResult.readinessPercentage
    });

    // 3. Curriculum & Resource Strategist Agent
    const curriculumStartTime = Date.now();
    const existingRoadmap = await db.roadmaps.where('userId').equals(userId).first();

    let updatedRoadmap: OfflineRoadmap;
    if (existingRoadmap && existingRoadmap.targetRoleId === targetRole.id) {
      updatedRoadmap = existingRoadmap;
    } else {
      updatedRoadmap = CurriculumStrategistAgent.generateRoadmap(
        userId,
        targetRole,
        skills,
        profile.hoursPerWeek
      );
      if (existingRoadmap) {
        await db.roadmaps.update(existingRoadmap.id, updatedRoadmap);
      } else {
        await db.roadmaps.add(updatedRoadmap);
      }
    }

    allTraces.push({
      step: allTraces.length + 1,
      agentName: 'Curriculum & Resource Strategist Agent',
      thought: `Synchronizing 4-phase roadmap for ${targetRole.title}. Verified ${updatedRoadmap.phases.length} phases and ${updatedRoadmap.phases.reduce((a, b) => a + b.tasks.length, 0)} tasks.`,
      action: 'SYNC_CURRICULUM_ROADMAP',
      observation: `Progress percentage: ${updatedRoadmap.overallProgressPercentage}%. Paced to ${profile.hoursPerWeek} hrs/week.`,
      timestamp: new Date().toISOString()
    });

    await db.agentTraces.add({
      id: `trace-curriculum-${Date.now()}`,
      userId,
      agentName: 'Curriculum & Resource Strategist Agent',
      timestamp: new Date().toISOString(),
      task: `Sequence 4-phase curriculum for ${targetRole.title}`,
      inputSummary: `Target Role: ${targetRole.title}, Readiness: ${benchmarkResult.readinessPercentage}%`,
      outputSummary: `Roadmap generated with ${updatedRoadmap.phases.length} phases, progress: ${updatedRoadmap.overallProgressPercentage}%`,
      reasoningTrace: [`SYNC_CURRICULUM_ROADMAP: Progress ${updatedRoadmap.overallProgressPercentage}%`],
      handoffTo: 'Adaptive Mentor & Evaluator Agent',
      latencyMs: Date.now() - curriculumStartTime
    });

    this.notify(allTraces);

    return {
      profilerResult,
      benchmarkResult,
      updatedRoadmap,
      allTraces
    };
  }
}
