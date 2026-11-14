import { geminiClient } from './geminiClient.js';
import { AgentRunResult } from './types.js';
import { CareerRole } from '../types.js';

export interface CareerIntelligenceOutput {
  marketTrendAnalysis: string;
  inDemandTechnologies: string[];
  recommendedElectiveSkills: string[];
  capstoneProjectThemes: string[];
  hiringManagerChecklist: string[];
  averageTimeToJobReadinessWeeks: number;
  salaryContext: {
    entryLevel: string;
    midLevel: string;
    seniorLevel: string;
    notes: string;
  };
}

export async function runCareerIntelligenceAgent(
  role: CareerRole
): Promise<AgentRunResult<CareerIntelligenceOutput>> {
  const startTime = Date.now();
  const inputSummary = `Role: ${role.title}, Category: ${role.category}, Market Demand: ${role.marketDemand}`;

  if (geminiClient.hasApiKey) {
    const prompt = `Provide market intelligence for the tech role: "${role.title}".
Category: ${role.category}
Market Demand: ${role.marketDemand}
Salary Range: ${role.salaryRange}

Return strictly JSON:
{
  "marketTrendAnalysis": "2-3 sentences on 2025 hiring demand, modern stack expectations, and industry trajectory",
  "inDemandTechnologies": ["5 top libraries or tooling trends currently sought by hiring teams"],
  "recommendedElectiveSkills": ["3 strategic bonus skills that make candidates stand out"],
  "capstoneProjectThemes": ["2-3 compelling, non-trivial portfolio project ideas"],
  "hiringManagerChecklist": ["4 key qualities or deliverables engineering managers look for"],
  "averageTimeToJobReadinessWeeks": number (e.g. 12-24),
  "salaryContext": {
    "entryLevel": "$XX,XXX",
    "midLevel": "$XXX,XXX",
    "seniorLevel": "$XXX,XXX",
    "notes": "Brief compensation breakdown"
  }
}`;

    const llmResult = await geminiClient.generateJSON<CareerIntelligenceOutput>({
      prompt,
      systemInstruction: 'You are an elite Tech Career Intelligence Agent and Staff Engineering Hiring Advisor.'
    });

    if (llmResult?.data?.marketTrendAnalysis) {
      return {
        success: true,
        data: llmResult.data,
        source: 'gemini_llm',
        latencyMs: llmResult.latencyMs,
        taskSummary: `Synthesized hiring trends and compensation intelligence for ${role.title} using Gemini LLM.`,
        inputSummary,
        outputSummary: `Generated salary benchmarks and ${llmResult.data.inDemandTechnologies.length} high-demand tooling insights.`
      };
    }
  }

  // Deterministic Heuristic Engine Fallback
  const data: CareerIntelligenceOutput = {
    marketTrendAnalysis: `Demand for ${role.title} remains resilient with strong emphasis on end-to-end ownership, automated testing, and cloud-native architectures. Employers increasingly favor candidates with verifiable code repositories and demonstrated architectural reasoning.`,
    inDemandTechnologies: [
      'TypeScript & Modern Static Typing',
      'Containerization & Cloud Native (Docker/Kubernetes)',
      'Relational Database Indexing & Query Tuning',
      'Automated Testing Pipelines (CI/CD, Vitest/Jest)',
      'AI Integration & Intelligent Agent Tooling'
    ],
    recommendedElectiveSkills: [
      'System Design & Microservice Decoupling',
      'Observability & OpenTelemetry Tracing',
      'Security Best Practices (OWASP Top 10)'
    ],
    capstoneProjectThemes: [
      'Production-Grade SaaS with OAuth, Stripe billing, and background workers',
      'Real-time collaborative workspace with optimistic updates and relational DB persistence',
      'High-throughput analytics ingestion engine with automated dashboard rendering'
    ],
    hiringManagerChecklist: [
      'Clean Git commit history with meaningful branch names and PR descriptions',
      'Comprehensive automated tests verifying edge cases and error handling',
      'Clear README with architectural diagram, setup steps, and performance considerations',
      'Ability to articulate trade-offs made between different technologies and databases'
    ],
    averageTimeToJobReadinessWeeks: 16,
    salaryContext: {
      entryLevel: '$75,000 - $90,000',
      midLevel: '$100,000 - $135,000',
      seniorLevel: '$145,000 - $185,000',
      notes: 'Compensation varies by region, company scale, and demonstrated depth in production engineering.'
    }
  };

  const latencyMs = Date.now() - startTime;
  return {
    success: true,
    data,
    source: 'heuristic_engine',
    latencyMs,
    taskSummary: `Synthesized hiring trends and compensation intelligence for ${role.title} using Career Intelligence Heuristics.`,
    inputSummary,
    outputSummary: `Generated salary benchmarks and ${data.inDemandTechnologies.length} high-demand tooling insights.`
  };
}
