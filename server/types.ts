export type ProficiencyLevel = 1 | 2 | 3 | 4 | 5;

export type SkillCategory =
  | 'languages'
  | 'frameworks'
  | 'databases'
  | 'cloud'
  | 'analytics'
  | 'soft_skills'
  | 'other';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  college?: string;
  educationLevel?: string;
  avatar?: string;
  role: 'student' | 'job_seeker' | 'professional' | 'admin';
  termsAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  completedOnboarding: boolean;
  degree?: string;
  college?: string;
  educationLevel?: string;
  graduationYear?: string;
  bio?: string;
  targetCareerRoleId: string;
  careerInterests: string[];
  learningPreferences: {
    hoursPerWeek: number;
    style: 'visual' | 'practical' | 'reading' | 'interactive';
    pace: 'relaxed' | 'moderate' | 'accelerated';
  };
  overallMasteryLevel: number;
  overallReadinessScore: number;
  profileCompletionPercentage: number;
  streakDays: number;
  lastActiveDate: string;
  totalLearningHours: number;
  completedTasksCount: number;
  completedAssessmentsCount: number;
}

export interface Skill {
  id: string;
  userId: string;
  skillName: string;
  category: SkillCategory;
  proficiencyLevel: ProficiencyLevel; // 1-5
  isVerified: boolean;
  evidence?: string;
  lastAssessedAt?: string;
  verifiedScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CareerRoleRequirement {
  skillName: string;
  category: SkillCategory;
  benchmarkLevel: ProficiencyLevel;
  weight: number; // e.g. 1.0 to 3.0
  importance: 'critical' | 'important' | 'nice_to_have';
}

export interface CareerRole {
  id: string;
  title: string;
  category: string;
  description: string;
  shortDescription: string;
  marketDemand: 'Very High' | 'High' | 'Growing' | 'Moderate';
  salaryRange: string;
  typicalRoles: string[];
  dailyResponsibilities: string[];
  requiredSkills: CareerRoleRequirement[];
  optionalSkills: CareerRoleRequirement[];
  prerequisites: string[];
}

export interface SkillGapAnalysisResult {
  roleId: string;
  roleTitle: string;
  overallReadinessScore: number; // 0-100
  matchedSkillsCount: number;
  totalRequiredSkills: number;
  verifiedMatchPercentage: number;
  gaps: {
    skillName: string;
    category: SkillCategory;
    currentLevel: number;
    benchmarkLevel: number;
    delta: number;
    importance: 'critical' | 'important' | 'nice_to_have';
    isVerified: boolean;
    recommendation: string;
  }[];
  strengths: {
    skillName: string;
    category: SkillCategory;
    currentLevel: number;
    isVerified: boolean;
  }[];
  prioritizedPlan: {
    step: number;
    title: string;
    description: string;
    estimatedWeeks: number;
    targetSkills: string[];
  }[];
  disclaimer: string;
  calculatedAt: string;
}

export interface RoadmapTask {
  id: string;
  phaseId: string;
  order: number;
  title: string;
  description: string;
  estimatedHours: number;
  completed: boolean;
  completedAt?: string;
  category: SkillCategory;
  criteria: string;
  associatedSkill: string;
  resourceLinks: {
    title: string;
    url: string;
    type: 'doc' | 'course' | 'tutorial' | 'exercise' | 'project';
  }[];
  isAdaptiveAddition?: boolean;
}

export interface RoadmapPhase {
  id: string;
  phaseNumber: number;
  title: string;
  description: string;
  durationWeeks: number;
  status: 'not_started' | 'in_progress' | 'completed';
  tasks: RoadmapTask[];
}

export interface LearningRoadmap {
  id: string;
  userId: string;
  targetRoleId: string;
  targetRoleTitle: string;
  phases: RoadmapPhase[];
  overallProgressPercentage: number;
  generatedBy: 'agent' | 'user' | 'adaptive_system';
  generatedAt: string;
  lastAdjustedAt: string;
}

export interface RoadmapAdjustmentLog {
  id: string;
  userId: string;
  timestamp: string;
  trigger: 'assessment_failure' | 'assessment_mastery' | 'career_goal_change' | 'manual_rebalance';
  description: string;
  affectedSkills: string[];
  adjustmentDetails: {
    tasksAdded?: string[];
    tasksSkipped?: string[];
    roleSwitchedTo?: string;
    reasoning: string;
  };
}

export interface Question {
  id: string;
  topic: string;
  skillName: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'multiple_choice' | 'code_snippet';
  question: string;
  codeSnippet?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface AssessmentAttempt {
  id: string;
  userId: string;
  assessmentId: string;
  topic: string;
  skillName: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  passed: boolean;
  userAnswers: {
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
  }[];
  weakSubtopics: string[];
  feedback: string;
  completedAt: string;
}

export interface MentorMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    mode?: 'general' | 'code_explanation' | 'quiz' | 'interview_prep' | 'roadmap_help';
    referencedSkill?: string;
    suggestedFollowUps?: string[];
  };
  createdAt: string;
}

export interface AgentExecutionRecord {
  id: string;
  agentName:
    | 'Profile Analyzer Agent'
    | 'Skill Gap Analyzer Agent'
    | 'Career Intelligence Agent'
    | 'Learning Path Agent'
    | 'Assessment Agent'
    | 'AI Mentor Agent'
    | 'Progress Optimization Agent';
  userId: string;
  taskId: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  taskSummary: string;
  inputSummary: string;
  outputSummary: string;
  latencyMs: number;
  source: 'gemini_llm' | 'heuristic_engine';
  timestamp: string;
}

export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  type: 'course' | 'tutorial' | 'documentation' | 'platform' | 'article' | 'project';
  url: string;
  skill: string;
  category: SkillCategory;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  isFree: boolean;
  rating: number;
  description: string;
}

export interface ProjectItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  skills: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: 'planning' | 'in_progress' | 'completed';
  createdAt: string;
  completedAt?: string;
}

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  title: string;
  credentialId: string;
  verificationHash: string;
  skillsCovered: string[];
  issuedAt: string;
  gradePercentage: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'adaptive';
  read: boolean;
  createdAt: string;
  link?: string;
}
