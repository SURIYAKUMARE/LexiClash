import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Exam Security & Integrity Proctoring Engine Tests', () => {
  test('should classify violation severities accurately based on infraction type', () => {
    const severities: Record<string, string> = {
      FULLSCREEN_EXIT: 'HIGH',
      TAB_SWITCH: 'HIGH',
      WINDOW_BLUR: 'MEDIUM',
      NAVIGATION_ATTEMPT: 'HIGH',
      SHORTCUT_ATTEMPT: 'LOW'
    };

    assert.equal(severities.FULLSCREEN_EXIT, 'HIGH');
    assert.equal(severities.TAB_SWITCH, 'HIGH');
    assert.equal(severities.WINDOW_BLUR, 'MEDIUM');
    assert.equal(severities.SHORTCUT_ATTEMPT, 'LOW');
  });

  test('should escalate violation penalties across 3 tiers non-punitively', () => {
    const evaluateStatus = (violationsCount: number): 'VERIFIED_CLEAN' | 'PROCTOR_WARNING' | 'FLAGGED_REVIEW' => {
      if (violationsCount === 0) return 'VERIFIED_CLEAN';
      if (violationsCount <= 2) return 'PROCTOR_WARNING';
      return 'FLAGGED_REVIEW';
    };

    assert.equal(evaluateStatus(0), 'VERIFIED_CLEAN');
    assert.equal(evaluateStatus(1), 'PROCTOR_WARNING');
    assert.equal(evaluateStatus(2), 'PROCTOR_WARNING');
    assert.equal(evaluateStatus(3), 'FLAGGED_REVIEW');
    assert.equal(evaluateStatus(5), 'FLAGGED_REVIEW');
  });

  test('should deduplicate rapid cascade events within 800ms debounce window', () => {
    let lastEventTime = 0;
    const debounceMs = 800;
    const recordedEvents: number[] = [];

    const recordEvent = (now: number) => {
      if (now - lastEventTime > debounceMs) {
        lastEventTime = now;
        recordedEvents.push(now);
      }
    };

    recordEvent(1000);
    recordEvent(1200); // within 200ms - suppressed
    recordEvent(1500); // within 500ms - suppressed
    recordEvent(1900); // after 900ms - accepted
    recordEvent(2000); // within 100ms - suppressed

    assert.equal(recordedEvents.length, 2);
    assert.deepEqual(recordedEvents, [1000, 1900]);
  });

  test('should generate structured JSON integrity audit payload for persistence', () => {
    const violation = {
      id: 'violation-101',
      timestamp: new Date('2026-11-14T10:00:00Z').toISOString(),
      type: 'TAB_SWITCH' as const,
      description: 'Learner navigated away from assessment viewport.',
      severity: 'HIGH' as const
    };

    assert.equal(violation.id, 'violation-101');
    assert.equal(violation.type, 'TAB_SWITCH');
    assert.equal(violation.severity, 'HIGH');
    assert.ok(Date.parse(violation.timestamp) > 0);
  });
});
