export type ProjectComplexity = 'Beginner' | 'Intermediate' | 'Advanced' | 'Capstone';

export interface ProjectMilestone {
  id: string;
  stepNumber: number;
  title: string;
  deliverable: string;
  acceptanceCriteria: string[];
}

export interface RubricCriterion {
  id: string;
  name: string;
  maxScore: number;
  description: string;
}

export interface LabProjectTrack {
  id: string;
  title: string;
  complexity: ProjectComplexity;
  estimatedHours: number;
  domain: string;
  elevatorPitch: string;
  technologies: string[];
  skillsTargeted: string[];
  milestones: ProjectMilestone[];
  rubricCriteria: RubricCriterion[];
  starterGithubTemplate: string;
}

export interface ProjectSubmissionInput {
  projectId: string;
  githubRepoUrl: string;
  branch: string;
  commitHash?: string;
  completedMilestoneIds: string[];
  architecturalNotes: string;
}

export interface ProjectEvaluationResult {
  submissionId: string;
  projectId: string;
  projectTitle: string;
  passed: boolean;
  totalScore: number; // 0 - 100
  criteriaScores: {
    criterionId: string;
    name: string;
    score: number;
    maxScore: number;
    feedback: string;
  }[];
  verifiableCredentialId?: string;
  verifiedAt: string;
  feedbackSummary: string;
}
