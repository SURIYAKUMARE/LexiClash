import { geminiClient } from './geminiClient.js';
import { AgentRunContext, AgentRunResult } from './types.js';
import { User, UserProfile, Skill } from '../types.js';

export interface ProfileAnalysisOutput {
  persona: string;
  strengthsSummary: string[];
  recommendedWeeklyHours: number;
  optimalLearningStyle: string;
  learningVelocity: 'accelerated' | 'moderate' | 'steady';
  growthOpportunities: string[];
  careerAlignmentSummary: string;
}

export async function runProfileAnalyzerAgent(
  user: User,
  profile: UserProfile,
  skills: Skill[]
): Promise<AgentRunResult<ProfileAnalysisOutput>> {
  const startTime = Date.now();
  const inputSummary = `Learner: ${user.name}, Edu: ${profile.educationLevel || 'N/A'}, Target: ${profile.targetCareerRoleId}, Skills: ${skills.length} listed`;

  // Try LLM if configured
  if (geminiClient.hasApiKey) {
    const prompt = `Analyze this learner profile and return a structured JSON assessment:
Learner Name: ${user.name}
Education: ${profile.educationLevel || 'Undergraduate'} in ${profile.degree || 'Computer Science'} at ${profile.college || 'University'}
Graduation Year: ${profile.graduationYear || '2025'}
Target Role: ${profile.targetCareerRoleId}
Interests: ${profile.careerInterests.join(', ')}
Hours per week: ${profile.learningPreferences?.hoursPerWeek || 10}
Style: ${profile.learningPreferences?.style || 'practical'}
Pace: ${profile.learningPreferences?.pace || 'moderate'}
Existing Skills: ${skills.map(s => `${s.skillName} (Level ${s.proficiencyLevel}/5, ${s.isVerified ? 'Verified' : 'Self-Reported'})`).join(', ')}

Return strictly JSON with this shape:
{
  "persona": "One sentence describing the learner's archetype and focus",
  "strengthsSummary": ["3-4 specific strengths based on education and verified skills"],
  "recommendedWeeklyHours": number,
  "optimalLearningStyle": "Advice on how to learn effectively using their preferred style",
  "learningVelocity": "accelerated" | "moderate" | "steady",
  "growthOpportunities": ["2-3 high leverage areas to improve"],
  "careerAlignmentSummary": "Summary of current alignment to their target role"
}`;

    const llmResult = await geminiClient.generateJSON<ProfileAnalysisOutput>({
      prompt,
      systemInstruction: 'You are an expert AI Profile Analyzer for technical education and engineering careers.'
    });

    if (llmResult?.data?.persona) {
      return {
        success: true,
        data: llmResult.data,
        source: 'gemini_llm',
        latencyMs: llmResult.latencyMs,
        taskSummary: 'Analyzed academic background, verified competencies, and pace preferences using Gemini LLM.',
        inputSummary,
        outputSummary: `Generated persona "${llmResult.data.persona}" with ${llmResult.data.strengthsSummary.length} key strengths.`
      };
    }
  }

  // Deterministic Heuristic Engine Fallback
  const verifiedCount = skills.filter(s => s.isVerified).length;
  const avgLevel = skills.length > 0 ? (skills.reduce((acc, s) => acc + s.proficiencyLevel, 0) / skills.length).toFixed(1) : '1.0';
  const pace = profile.learningPreferences?.pace || 'moderate';
  const hours = profile.learningPreferences?.hoursPerWeek || 10;

  let persona = 'Pragmatic Builder focused on hands-on full-stack development and practical engineering';
  if (profile.targetCareerRoleId.includes('aiml') || profile.targetCareerRoleId.includes('data')) {
    persona = 'Analytical Innovator specializing in data-driven architectures, machine learning, and statistical modeling';
  } else if (profile.targetCareerRoleId.includes('cloud') || profile.targetCareerRoleId.includes('devops')) {
    persona = 'Systems Architect targeting resilient cloud infrastructure, automation, and reliability engineering';
  } else if (profile.targetCareerRoleId.includes('cyber')) {
    persona = 'Security Analyst dedicated to defensive posture, vulnerability remediation, and network integrity';
  }

  const strengthsSummary = [
    `Solid foundation with an average reported skill level of ${avgLevel}/5 across ${skills.length} domains`,
    verifiedCount > 0 ? `${verifiedCount} skill(s) verified through standardized assessments and practical evidence` : 'Strong self-awareness and active dedication to structured technical growth',
    `Structured commitment of ${hours} dedicated hours per week at a ${pace} pace`,
    `Clear specialization roadmap towards target role: ${profile.targetCareerRoleId.replace('role-', '').toUpperCase()}`
  ];

  const growthOpportunities = [
    'Validate additional self-reported skills through timed technical assessments',
    'Build and publish end-to-end full-stack capstone projects with public Git history',
    'Deepen understanding of production cloud deployments, CI/CD, and database indexing'
  ];

  const data: ProfileAnalysisOutput = {
    persona,
    strengthsSummary,
    recommendedWeeklyHours: hours,
    optimalLearningStyle: profile.learningPreferences?.style === 'visual'
      ? 'Leverage interactive architectural diagrams, step-by-step video deep-dives, and visual mental models.'
      : 'Focus on project-based building, immediate code execution, unit test writing, and bug hunting.',
    learningVelocity: pace === 'accelerated' ? 'accelerated' : pace === 'relaxed' ? 'steady' : 'moderate',
    growthOpportunities,
    careerAlignmentSummary: `Current skill distribution demonstrates intermediate readiness for the ${profile.targetCareerRoleId} pathway, with clear milestones identified.`
  };

  const latencyMs = Date.now() - startTime;
  return {
    success: true,
    data,
    source: 'heuristic_engine',
    latencyMs,
    taskSummary: 'Analyzed academic background, verified competencies, and pace preferences using SkillPath Heuristic Engine.',
    inputSummary,
    outputSummary: `Generated persona "${persona}" with ${strengthsSummary.length} key strengths.`
  };
}
