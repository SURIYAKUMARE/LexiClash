export interface AgentReasoningTrace {
  step: number;
  agentName: string;
  thought: string;
  action: string;
  observation: string;
  timestamp: string;
}

export interface ProfilerAnalysisResult {
  personaSummary: string;
  strengths: string[];
  blindSpots: string[];
  extractedSkills?: {
    skillName: string;
    category: string;
    confidenceLevel: number;
    sourceSnippet: string;
  }[];
  reasoningTraces: AgentReasoningTrace[];
}

export interface CareerBenchmarkResult {
  roleId: string;
  roleTitle: string;
  readinessPercentage: number;
  mathematicalBreakdown: {
    coreSkillsWeight: number;
    verifiedSkillsMultiplier: number;
    rawScore: number;
    maxPossibleScore: number;
  };
  strengths: { skillName: string; level: number; benchmark: number }[];
  needsReinforcement: { skillName: string; level: number; benchmark: number; delta: number }[];
  criticalMissing: { skillName: string; benchmark: number }[];
  estimatedWeeksToReadiness: number;
  reasoningTraces: AgentReasoningTrace[];
}

export interface CurriculumPlanResult {
  targetRole: string;
  totalEstimatedWeeks: number;
  weeklyPaceHours: number;
  remedialModulesInjected: number;
  phases: {
    phaseNumber: number;
    title: string;
    description: string;
    tasksCount: number;
    estimatedWeeks: number;
    status: 'completed' | 'in_progress' | 'upcoming';
  }[];
  reasoningTraces: AgentReasoningTrace[];
}

export interface MentorChatResult {
  reply: string;
  suggestedFollowUps: string[];
  commandExecuted?: string;
  agentReasoningTraces: AgentReasoningTrace[];
}

export interface ProjectIdea {
  title: string;
  elevatorPitch: string;
  synergyExplanation: string;
  existingSkillsCombined: string[];
  newSkillsTargeted: string[];
  architectureDiagram: string;
  milestones: string[];
  complexity: 'Beginner' | 'Intermediate' | 'Capstone';
}
