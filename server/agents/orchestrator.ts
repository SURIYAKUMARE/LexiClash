import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import {
  AgentExecutionRecord,
  User,
  UserProfile,
  Skill,
  CareerRole,
  LearningRoadmap,
  AssessmentAttempt
} from '../types.js';

import { runProfileAnalyzerAgent, ProfileAnalysisOutput } from './profileAnalyzerAgent.js';
import { runSkillGapAnalyzerAgent } from './skillGapAnalyzerAgent.js';
import { runCareerIntelligenceAgent, CareerIntelligenceOutput } from './careerIntelligenceAgent.js';
import { runLearningPathAgent } from './learningPathAgent.js';
import { runAssessmentAgent, AssessmentDiagnosisOutput } from './assessmentAgent.js';
import { runAIMentorAgent, MentorReplyOutput } from './aiMentorAgent.js';
import { runProgressOptimizationAgent, ProgressOptimizationResult } from './progressOptimizationAgent.js';

export class AgentOrchestrator {
  private logExecution(record: Omit<AgentExecutionRecord, 'id' | 'timestamp'>): AgentExecutionRecord {
    const fullRecord: AgentExecutionRecord = {
      ...record,
      id: `exec-${uuidv4().slice(0, 8)}`,
      timestamp: new Date().toISOString()
    };
    db.agentExecutions.unshift(fullRecord);
    if (db.agentExecutions.length > 200) {
      db.agentExecutions.pop();
    }
    db.save();
    return fullRecord;
  }

  // 1. Profile Analyzer Workflow
  public async executeProfileAnalysis(user: User, profile: UserProfile, skills: Skill[]): Promise<ProfileAnalysisOutput> {
    const taskId = `task-profile-${Date.now()}`;
    const result = await runProfileAnalyzerAgent(user, profile, skills);
    this.logExecution({
      agentName: 'Profile Analyzer Agent',
      userId: user.id,
      taskId,
      status: result.success ? 'completed' : 'failed',
      taskSummary: result.taskSummary,
      inputSummary: result.inputSummary,
      outputSummary: result.outputSummary,
      latencyMs: result.latencyMs,
      source: result.source
    });
    return result.data;
  }

  // 2. Skill Gap Analysis Workflow
  public async executeSkillGapAnalysis(skills: Skill[], targetRole: CareerRole, userId: string) {
    const taskId = `task-gap-${Date.now()}`;
    const result = await runSkillGapAnalyzerAgent(skills, targetRole);
    this.logExecution({
      agentName: 'Skill Gap Analyzer Agent',
      userId,
      taskId,
      status: result.success ? 'completed' : 'failed',
      taskSummary: result.taskSummary,
      inputSummary: result.inputSummary,
      outputSummary: result.outputSummary,
      latencyMs: result.latencyMs,
      source: result.source
    });
    return result.data;
  }

  // 3. Career Intelligence Workflow
  public async executeCareerIntelligence(role: CareerRole, userId: string): Promise<CareerIntelligenceOutput> {
    const taskId = `task-career-intel-${Date.now()}`;
    const result = await runCareerIntelligenceAgent(role);
    this.logExecution({
      agentName: 'Career Intelligence Agent',
      userId,
      taskId,
      status: result.success ? 'completed' : 'failed',
      taskSummary: result.taskSummary,
      inputSummary: result.inputSummary,
      outputSummary: result.outputSummary,
      latencyMs: result.latencyMs,
      source: result.source
    });
    return result.data;
  }

  // 4. Learning Path Generation Workflow
  public async executeLearningPathGeneration(
    profile: UserProfile,
    targetRole: CareerRole,
    skills: Skill[]
  ): Promise<LearningRoadmap> {
    const taskId = `task-roadmap-gen-${Date.now()}`;
    const gapAnalysis = (await runSkillGapAnalyzerAgent(skills, targetRole)).data;
    const result = await runLearningPathAgent(profile, targetRole, gapAnalysis);

    this.logExecution({
      agentName: 'Learning Path Agent',
      userId: profile.userId,
      taskId,
      status: result.success ? 'completed' : 'failed',
      taskSummary: result.taskSummary,
      inputSummary: result.inputSummary,
      outputSummary: result.outputSummary,
      latencyMs: result.latencyMs,
      source: result.source
    });

    return result.data;
  }

  // 5. Assessment Evaluation Workflow
  public async executeAssessmentEvaluation(
    userId: string,
    topic: string,
    questions: any[],
    userAnswers: any[]
  ): Promise<AssessmentDiagnosisOutput> {
    const taskId = `task-assessment-${Date.now()}`;
    const result = await runAssessmentAgent(topic, questions, userAnswers);

    this.logExecution({
      agentName: 'Assessment Agent',
      userId,
      taskId,
      status: result.success ? 'completed' : 'failed',
      taskSummary: result.taskSummary,
      inputSummary: result.inputSummary,
      outputSummary: result.outputSummary,
      latencyMs: result.latencyMs,
      source: result.source
    });

    return result.data;
  }

  // 6. AI Mentor Consultation Workflow
  public async executeMentorConsultation(
    user: User,
    profile: UserProfile,
    skills: Skill[],
    roadmap: LearningRoadmap | null,
    message: string,
    mode?: any
  ): Promise<MentorReplyOutput> {
    const taskId = `task-mentor-${Date.now()}`;
    const result = await runAIMentorAgent(user, profile, skills, roadmap, message, mode);

    this.logExecution({
      agentName: 'AI Mentor Agent',
      userId: user.id,
      taskId,
      status: result.success ? 'completed' : 'failed',
      taskSummary: result.taskSummary,
      inputSummary: result.inputSummary,
      outputSummary: result.outputSummary,
      latencyMs: result.latencyMs,
      source: result.source
    });

    return result.data;
  }

  // 7. Progress Optimization & Adaptive Learning Workflow
  public async executeProgressOptimization(
    profile: UserProfile,
    skills: Skill[],
    roadmap: LearningRoadmap,
    trigger: 'assessment_completed' | 'career_goal_changed' | 'manual_review',
    contextData?: any
  ): Promise<ProgressOptimizationResult> {
    const taskId = `task-progress-opt-${Date.now()}`;
    const result = await runProgressOptimizationAgent(profile, skills, roadmap, trigger, contextData);

    this.logExecution({
      agentName: 'Progress Optimization Agent',
      userId: profile.userId,
      taskId,
      status: result.success ? 'completed' : 'failed',
      taskSummary: result.taskSummary,
      inputSummary: result.inputSummary,
      outputSummary: result.outputSummary,
      latencyMs: result.latencyMs,
      source: result.source
    });

    return result.data;
  }

  // Multi-Agent Pipeline: Full Onboarding Synthesis
  public async runFullOnboardingSynthesis(user: User, profile: UserProfile, skills: Skill[]): Promise<{
    profileAnalysis: ProfileAnalysisOutput;
    gapAnalysis: any;
    careerIntelligence: CareerIntelligenceOutput;
    roadmap: LearningRoadmap;
  }> {
    const targetRole = db.careerRoles.find(r => r.id === profile.targetCareerRoleId) || db.careerRoles[0];

    // Pipeline Step 1: Profile Analyzer
    const profileAnalysis = await this.executeProfileAnalysis(user, profile, skills);

    // Pipeline Step 2: Skill Gap Analyzer
    const gapAnalysis = await this.executeSkillGapAnalysis(skills, targetRole, user.id);

    // Pipeline Step 3: Career Intelligence Agent
    const careerIntelligence = await this.executeCareerIntelligence(targetRole, user.id);

    // Pipeline Step 4: Learning Path Agent
    const roadmap = await this.executeLearningPathGeneration(profile, targetRole, skills);

    return {
      profileAnalysis,
      gapAnalysis,
      careerIntelligence,
      roadmap
    };
  }
}

export const orchestrator = new AgentOrchestrator();
