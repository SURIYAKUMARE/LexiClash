import { SkillCategory, ProficiencyLevel } from '../types.js';

export interface AgentRunContext {
  userId: string;
  userEmail?: string;
  userName?: string;
  targetRoleId?: string;
  additionalParams?: Record<string, any>;
}

export interface AgentRunResult<T = any> {
  success: boolean;
  data: T;
  source: 'gemini_llm' | 'heuristic_engine';
  latencyMs: number;
  taskSummary: string;
  inputSummary: string;
  outputSummary: string;
}
