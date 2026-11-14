import { geminiClient } from './geminiClient.js';
import { AgentRunResult } from './types.js';
import { Question, AssessmentAttempt } from '../types.js';

export interface AssessmentDiagnosisOutput {
  scorePercentage: number;
  passed: boolean;
  masteryLevelDemonstrated: number; // 1-5
  errorClassification: {
    conceptual: number;
    syntaxOrApi: number;
    edgeCase: number;
  };
  weakSubtopics: string[];
  strengthsIdentified: string[];
  diagnosticFeedback: string;
  recommendedRemediation: string[];
}

export async function runAssessmentAgent(
  topic: string,
  questions: Question[],
  userAnswers: { questionId: string; selectedOption: number }[]
): Promise<AgentRunResult<AssessmentDiagnosisOutput>> {
  const startTime = Date.now();
  const inputSummary = `Topic: ${topic}, Questions: ${questions.length}, Submissions: ${userAnswers.length}`;

  let correctCount = 0;
  const incorrectQuestions: { q: Question; selected: number }[] = [];
  const correctQuestions: Question[] = [];

  for (const ans of userAnswers) {
    const q = questions.find(item => item.id === ans.questionId);
    if (!q) continue;

    if (ans.selectedOption === q.correctOptionIndex) {
      correctCount++;
      correctQuestions.push(q);
    } else {
      incorrectQuestions.push({ q, selected: ans.selectedOption });
    }
  }

  const total = questions.length || 1;
  const scorePercentage = Math.round((correctCount / total) * 100);
  const passed = scorePercentage >= 75;

  let masteryLevelDemonstrated = 1;
  if (scorePercentage >= 90) masteryLevelDemonstrated = 5;
  else if (scorePercentage >= 80) masteryLevelDemonstrated = 4;
  else if (scorePercentage >= 65) masteryLevelDemonstrated = 3;
  else if (scorePercentage >= 45) masteryLevelDemonstrated = 2;

  const weakSubtopics: string[] = [];
  const conceptualErrors = incorrectQuestions.filter(i => !i.q.codeSnippet).length;
  const edgeCaseOrApiErrors = incorrectQuestions.length - conceptualErrors;

  for (const item of incorrectQuestions) {
    if (!weakSubtopics.includes(item.q.skillName)) {
      weakSubtopics.push(item.q.skillName);
    }
  }

  const strengthsIdentified = correctQuestions.map(q => q.topic).filter((v, i, a) => a.indexOf(v) === i);

  let diagnosticFeedback = '';
  if (scorePercentage >= 90) {
    diagnosticFeedback = `Outstanding mastery demonstrated in ${topic}. Strong command of both theoretical invariants and implementation mechanics. Verified proficiency badge granted.`;
  } else if (scorePercentage >= 75) {
    diagnosticFeedback = `Proficient comprehension of ${topic}. Solid baseline fundamentals with minor areas for refinement in advanced edge-cases.`;
  } else if (scorePercentage >= 50) {
    diagnosticFeedback = `Developing competency in ${topic}. Key conceptual gaps detected regarding runtime behaviors and syntax patterns. Targeted review recommended before re-assessment.`;
  } else {
    diagnosticFeedback = `Foundational remediation required for ${topic}. The assessment highlighted critical misconceptions. Review the recommended interactive documentation and practical exercises below.`;
  }

  const recommendedRemediation: string[] = [];
  if (incorrectQuestions.length > 0) {
    recommendedRemediation.push(`Review the detailed explanations for the ${incorrectQuestions.length} missed question(s).`);
    recommendedRemediation.push(`Complete targeted practice exercises on: ${weakSubtopics.join(', ') || topic}.`);
    recommendedRemediation.push('Retake this assessment in 48 hours to lock in long-term retention.');
  } else {
    recommendedRemediation.push(`Ready to proceed to next advanced phase in ${topic}.`);
  }

  const data: AssessmentDiagnosisOutput = {
    scorePercentage,
    passed,
    masteryLevelDemonstrated,
    errorClassification: {
      conceptual: conceptualErrors,
      syntaxOrApi: Math.ceil(edgeCaseOrApiErrors / 2),
      edgeCase: Math.floor(edgeCaseOrApiErrors / 2)
    },
    weakSubtopics: weakSubtopics.length > 0 ? weakSubtopics : ['None detected - flawless performance'],
    strengthsIdentified: strengthsIdentified.length > 0 ? strengthsIdentified : [topic],
    diagnosticFeedback,
    recommendedRemediation
  };

  const latencyMs = Date.now() - startTime;
  return {
    success: true,
    data,
    source: 'heuristic_engine',
    latencyMs,
    taskSummary: `Diagnosed ${topic} assessment performance and pinpointed conceptual gaps.`,
    inputSummary,
    outputSummary: `Score: ${scorePercentage}%, Passed: ${passed}, Mastery: Level ${masteryLevelDemonstrated}/5.`
  };
}
