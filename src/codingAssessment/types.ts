export type CodeLanguage = 'javascript' | 'python' | 'sql';

export interface TestCase {
  id: string;
  description: string;
  input: any;
  expectedOutput: any;
  isHidden: boolean;
}

export interface CodingChallenge {
  id: string;
  title: string;
  language: CodeLanguage;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  description: string;
  instructions: string[];
  starterCode: string;
  solutionTemplate: string;
  testCases: TestCase[];
  skillAffected: string;
  targetLevel: number;
}

export interface TestCaseResult {
  testCaseId: string;
  description: string;
  passed: boolean;
  actualOutput: any;
  expectedOutput: any;
  error?: string;
  executionTimeMs: number;
  isHidden: boolean;
}

export interface CodeExecutionSummary {
  passed: boolean;
  score: number; // 0 to 100
  totalTests: number;
  passedTests: number;
  results: TestCaseResult[];
  logs: string[];
  runtimeError?: string;
  executionTimeMs: number;
  competencyUpdated?: {
    skillName: string;
    oldLevel: number;
    newLevel: number;
    isVerified: boolean;
  };
}
