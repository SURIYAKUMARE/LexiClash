import { RoleInterviewTrack, InterviewAnswerSubmission, QuestionEvaluationResult, MockInterviewResult } from './types';
import { db, OfflineMockInterview } from '../db/indexedDb';

export class InterviewEvaluator {
  /**
   * Evaluates a single technical answer against expected rubrics
   */
  public static evaluateQuestionAnswer(
    track: RoleInterviewTrack,
    submission: InterviewAnswerSubmission
  ): QuestionEvaluationResult {
    const question = track.questions.find(q => q.id === submission.questionId);
    if (!question) {
      throw new Error(`Question ${submission.questionId} not found in track.`);
    }

    const text = submission.answerText.toLowerCase();
    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    question.expectedKeywords.forEach(kw => {
      if (text.includes(kw.toLowerCase())) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    });

    // Score calculation:
    // Keyword density: up to 60 points
    // Depth/length quality: up to 40 points
    const keywordRatio = matchedKeywords.length / Math.max(question.expectedKeywords.length, 1);
    const keywordPoints = Math.round(keywordRatio * 60);

    const wordCount = submission.answerText.trim().split(/\s+/).filter(Boolean).length;
    let depthPoints = 0;
    if (wordCount >= 60) depthPoints = 40;
    else if (wordCount >= 35) depthPoints = 25;
    else if (wordCount >= 15) depthPoints = 15;
    else depthPoints = 5;

    const totalScore = Math.min(100, Math.max(10, keywordPoints + depthPoints));

    const strengthsObserved: string[] = [];
    const improvementNotes: string[] = [];

    if (matchedKeywords.length >= 3) {
      strengthsObserved.push(`Demonstrated mastery of core terminology: ${matchedKeywords.slice(0, 3).join(', ')}.`);
    }
    if (wordCount >= 50) {
      strengthsObserved.push('Detailed technical explanation with clear structural reasoning.');
    }

    if (missingKeywords.length > 0) {
      improvementNotes.push(`Deepen your response by addressing: ${missingKeywords.slice(0, 3).join(', ')}.`);
    }
    if (wordCount < 40) {
      improvementNotes.push('Provide more concrete architectural details or trade-off comparisons.');
    }

    let feedback = '';
    if (totalScore >= 80) {
      feedback = 'Outstanding technical response. Shows deep architectural understanding and clear trade-off evaluation.';
    } else if (totalScore >= 60) {
      feedback = 'Competent explanation with solid foundations. Incorporate the missing architectural keywords for full senior-level mastery.';
    } else {
      feedback = 'Foundational answer. Needs deeper conceptual precision and more concrete engineering examples.';
    }

    return {
      questionId: question.id,
      stageName: question.stageName,
      score: totalScore,
      matchedKeywords,
      missingKeywords,
      feedback,
      strengthsObserved,
      improvementNotes
    };
  }

  /**
   * Evaluates complete interview session and persists in Dexie
   */
  public static async evaluateSession(
    track: RoleInterviewTrack,
    submissions: InterviewAnswerSubmission[],
    userId: string
  ): Promise<MockInterviewResult> {
    const questionResults = submissions.map(sub => this.evaluateQuestionAnswer(track, sub));

    const totalScore = Math.round(
      questionResults.reduce((acc, r) => acc + r.score, 0) / Math.max(questionResults.length, 1)
    );

    // Compute stage scores
    const stageScores = {
      foundations: 0,
      architecture: 0,
      system_design: 0,
      behavioral: 0
    };

    track.questions.forEach(q => {
      const res = questionResults.find(r => r.questionId === q.id);
      if (res) {
        stageScores[q.stage] = res.score;
      }
    });

    let readinessRating: 'Ready' | 'Needs Reinforcement' | 'Developing' = 'Developing';
    if (totalScore >= track.targetReadinessScore) {
      readinessRating = 'Ready';
    } else if (totalScore >= 60) {
      readinessRating = 'Needs Reinforcement';
    }

    const strengths: string[] = [];
    const blindSpots: string[] = [];

    questionResults.forEach(r => {
      strengths.push(...r.strengthsObserved);
      blindSpots.push(...r.improvementNotes);
    });

    // Map blind spots to curriculum recommendations
    const recommendedModules: string[] = [];
    if (stageScores.foundations < 75) {
      recommendedModules.push('Foundational Runtime Architecture & Async Execution');
    }
    if (stageScores.architecture < 75) {
      recommendedModules.push('Concurrency Control, ACID Transactions & Optimistic Locking');
    }
    if (stageScores.system_design < 75) {
      recommendedModules.push('High-Throughput Rate Limiting & Distributed Caching');
    }
    if (stageScores.behavioral < 75) {
      recommendedModules.push('Engineering Post-Mortems & Production Incident Ownership');
    }

    if (recommendedModules.length === 0) {
      recommendedModules.push('Advanced Distributed Systems & High-Availability Scaling');
    }

    let feedbackSummary = '';
    if (readinessRating === 'Ready') {
      feedbackSummary = `Candidate achieved ${totalScore}% overall readiness for ${track.roleTitle}. Demonstrates senior architectural acumen, sound trade-off analysis, and proactive incident response skills.`;
    } else if (readinessRating === 'Needs Reinforcement') {
      feedbackSummary = `Candidate achieved ${totalScore}% readiness for ${track.roleTitle}. Strong foundational knowledge; needs reinforcement in advanced system design and concurrency controls before executive interview rounds.`;
    } else {
      feedbackSummary = `Candidate scored ${totalScore}%. Core engineering concepts require deeper study. Recommended immediate review of foundational modules.`;
    }

    const result: MockInterviewResult = {
      id: `mock-${Date.now()}`,
      roleId: track.roleId,
      roleTitle: track.roleTitle,
      overallScore: totalScore,
      stageScores,
      readinessRating,
      feedbackSummary,
      strengths: Array.from(new Set(strengths)).slice(0, 4),
      blindSpots: Array.from(new Set(blindSpots)).slice(0, 4),
      recommendedModules,
      completedAt: new Date().toISOString()
    };

    // Persist in Dexie IndexedDB
    try {
      const offlineRecord: OfflineMockInterview = {
        id: result.id,
        userId,
        roleId: result.roleId,
        roleTitle: result.roleTitle,
        overallScore: result.overallScore,
        technicalScore: result.stageScores.foundations,
        architectureScore: result.stageScores.architecture,
        clarityScore: result.stageScores.behavioral,
        edgeCaseScore: result.stageScores.system_design,
        readinessRating: result.readinessRating,
        feedbackSummary: result.feedbackSummary,
        strengths: result.strengths,
        blindSpots: result.blindSpots,
        recommendedModules: result.recommendedModules,
        completedAt: result.completedAt
      };
      await db.mockInterviews.put(offlineRecord);

      // Enqueue sync item
      await db.syncQueue.put({
        id: `sync-${Date.now()}`,
        userId,
        entity: 'MOCK_INTERVIEW',
        action: 'CREATE',
        payload: { interviewId: result.id, overallScore: totalScore, roleId: result.roleId },
        status: 'PENDING',
        clientTimestamp: new Date().toISOString(),
        retryCount: 0
      });
    } catch (dbErr) {
      console.warn('Could not persist mock interview in Dexie:', dbErr);
    }

    return result;
  }
}
