import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Career Readiness & Mock Interview Simulator Tests', () => {
  test('should score interview responses across 4 rubric vectors', () => {
    interface RubricScore {
      clarity: number;
      technicalDepth: number;
      architecture: number;
      correctness: number;
    }

    const computeOverall = (scores: RubricScore): number => {
      const weights = { clarity: 0.2, technicalDepth: 0.3, architecture: 0.3, correctness: 0.2 };
      return Math.round(
        scores.clarity * weights.clarity +
        scores.technicalDepth * weights.technicalDepth +
        scores.architecture * weights.architecture +
        scores.correctness * weights.correctness
      );
    };

    const strongCandidate: RubricScore = { clarity: 95, technicalDepth: 90, architecture: 92, correctness: 98 };
    const score = computeOverall(strongCandidate);

    assert.equal(score, 93);
    assert.ok(score >= 85, 'Qualifies for interview readiness certification');
  });

  test('should generate structured feedback and actionable remediation items', () => {
    const generateFeedback = (score: number) => {
      if (score >= 90) return { verdict: 'STRONG_HIRE', coaching: 'Excellent systems depth; ready for senior loops.' };
      if (score >= 75) return { verdict: 'HIRE', coaching: 'Solid fundamentals; review distributed caching patterns.' };
      return { verdict: 'NEEDS_REVISION', coaching: 'Focus on core algorithms and database indexing.' };
    };

    const hire = generateFeedback(82);
    assert.equal(hire.verdict, 'HIRE');
    assert.ok(hire.coaching.includes('distributed caching'));
  });
});
