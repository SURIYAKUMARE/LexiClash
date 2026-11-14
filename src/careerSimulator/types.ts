export type InterviewStage = 'foundations' | 'architecture' | 'system_design' | 'behavioral';

export interface InterviewQuestion {
  id: string;
  stage: InterviewStage;
  stageName: string;
  question: string;
  scenarioContext: string;
  expectedKeywords: string[];
  evaluationCriteria: {
    criterion: string;
    weight: number;
    description: string;
  }[];
  sampleGoodAnswerSnippet: string;
}

export interface RoleInterviewTrack {
  roleId: string;
  roleTitle: string;
  difficulty: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  targetReadinessScore: number;
  questions: InterviewQuestion[];
}

export interface InterviewAnswerSubmission {
  questionId: string;
  answerText: string;
  timeSpentSeconds: number;
}

export interface QuestionEvaluationResult {
  questionId: string;
  stageName: string;
  score: number; // 0 - 100
  matchedKeywords: string[];
  missingKeywords: string[];
  feedback: string;
  strengthsObserved: string[];
  improvementNotes: string[];
}

export interface MockInterviewResult {
  id: string;
  roleId: string;
  roleTitle: string;
  overallScore: number;
  stageScores: {
    foundations: number;
    architecture: number;
    system_design: number;
    behavioral: number;
  };
  readinessRating: 'Ready' | 'Needs Reinforcement' | 'Developing';
  feedbackSummary: string;
  strengths: string[];
  blindSpots: string[];
  recommendedModules: string[];
  completedAt: string;
}
