import Dexie, { Table } from 'dexie';

export interface OfflineUser {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'job_seeker' | 'professional' | 'career_changer';
  college?: string;
  passwordHash?: string;
  createdAt: string;
}

export interface OfflineProfile {
  id: string;
  userId: string;
  targetCareerRoleId: string;
  completedOnboarding: boolean;
  hoursPerWeek: number;
  educationLevel: string;
  streakDays: number;
  totalLearningHours: number;
  completedTasksCount: number;
  overallMasteryLevel: number;
  overallReadinessScore: number;
  lastActiveDate: string;
}

export interface OfflineSkill {
  id: string;
  userId: string;
  skillName: string;
  category: 'languages' | 'frameworks' | 'databases' | 'cloud' | 'analytics' | 'design' | 'security' | 'soft_skills';
  proficiencyLevel: number; // 1 to 5
  isVerified: boolean;
  verifiedScore?: number;
  evidence?: string;
  lastAssessedAt?: string;
}

export interface OfflineCareerRole {
  id: string;
  title: string;
  category: string;
  salaryRange: string;
  marketDemand: 'Very High' | 'High' | 'Steady';
  shortDescription: string;
  description: string;
  requiredSkills: { skillName: string; benchmarkLevel: number; importance: 'core' | 'supporting' }[];
  preferredSkills: { skillName: string; benchmarkLevel: number }[];
}

export interface OfflineRoadmap {
  id: string;
  userId: string;
  targetRoleId: string;
  targetRoleTitle: string;
  overallProgressPercentage: number;
  lastAdjustedAt: string;
  phases: OfflineRoadmapPhase[];
}

export interface OfflineRoadmapPhase {
  id: string;
  phaseNumber: number;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  estimatedWeeks: number;
  tasks: OfflineRoadmapTask[];
}

export interface OfflineRoadmapTask {
  id: string;
  phaseId: string;
  title: string;
  description: string;
  estimatedHours: number;
  criteria: string;
  completed: boolean;
  type: 'Doc' | 'Tutorial' | 'Course' | 'Exercise' | 'Project' | 'Assessment';
  provider: string;
  url: string;
  studyGuideOffline?: string;
  isRemedial?: boolean;
}

export interface OfflineRoadmapAdjustment {
  id: string;
  userId: string;
  timestamp: string;
  triggerEvent: string;
  description: string;
  changesSummary: string;
}

export interface OfflineQuestion {
  id: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  subtopic: string;
}

export interface OfflineAssessmentAttempt {
  id: string;
  userId: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  scorePercentage: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
  feedback: string;
  weakSubtopics: string[];
  completedAt: string;
}

export interface OfflineMentorMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  mode?: string;
  agentReasoningTrace?: string[];
}

export interface OfflineAgentTrace {
  id: string;
  userId: string;
  agentName: string;
  timestamp: string;
  task: string;
  inputSummary: string;
  outputSummary: string;
  reasoningTrace: string[];
  handoffTo?: string;
  latencyMs: number;
}

export interface OfflineProjectIdea {
  id: string;
  userId: string;
  title: string;
  description: string;
  existingSkillsUsed: string[];
  newSkillsTargeted: string[];
  complexity: 'Beginner' | 'Intermediate' | 'Capstone';
  estimatedHours: number;
  architecture: string;
  deliverables: string[];
}

export class SkillPathOfflineDatabase extends Dexie {
  users!: Table<OfflineUser, string>;
  profiles!: Table<OfflineProfile, string>;
  skills!: Table<OfflineSkill, string>;
  careers!: Table<OfflineCareerRole, string>;
  roadmaps!: Table<OfflineRoadmap, string>;
  roadmapAdjustments!: Table<OfflineRoadmapAdjustment, string>;
  questions!: Table<OfflineQuestion, string>;
  assessmentAttempts!: Table<OfflineAssessmentAttempt, string>;
  mentorMessages!: Table<OfflineMentorMessage, string>;
  agentTraces!: Table<OfflineAgentTrace, string>;
  projects!: Table<OfflineProjectIdea, string>;

  constructor() {
    super('SkillPathOfflineDB');
    this.version(1).stores({
      users: 'id, email',
      profiles: 'id, userId, targetCareerRoleId',
      skills: 'id, userId, skillName, category, isVerified',
      careers: 'id, title, category',
      roadmaps: 'id, userId, targetRoleId',
      roadmapAdjustments: 'id, userId, timestamp',
      questions: 'id, topic, difficulty',
      assessmentAttempts: 'id, userId, topic, completedAt',
      mentorMessages: 'id, userId, createdAt',
      agentTraces: 'id, userId, timestamp, agentName',
      projects: 'id, userId, complexity',
    });
  }
}

export const db = new SkillPathOfflineDatabase();
