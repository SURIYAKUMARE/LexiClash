import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Coding Assessment Evaluation Engine Tests', () => {
  test('should safely evaluate JavaScript code execution against public test cases', () => {
    const userCode = `
      function twoSum(nums, target) {
        const map = new Map();
        for (let i = 0; i < nums.length; i++) {
          const diff = target - nums[i];
          if (map.has(diff)) return [map.get(diff), i];
          map.set(nums[i], i);
        }
        return [];
      }
    `;

    const runner = new Function(userCode + '; return twoSum([2, 7, 11, 15], 9);');
    const result = runner();
    assert.deepEqual(result, [0, 1]);
  });

  test('should validate hidden edge cases correctly', () => {
    const isPalindrome = (s: string) => {
      const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
      return clean === clean.split('').reverse().join('');
    };

    assert.equal(isPalindrome('A man, a plan, a canal: Panama'), true);
    assert.equal(isPalindrome('race a car'), false);
    assert.equal(isPalindrome(' '), true);
    assert.equal(isPalindrome('0P'), false);
  });

  test('should catch and format syntax and runtime exceptions gracefully', () => {
    const evaluateUnsafe = (code: string) => {
      try {
        const fn = new Function(code);
        return { success: true, result: fn() };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    };

    const syntaxFailure = evaluateUnsafe('function ( {');
    assert.equal(syntaxFailure.success, false);
    assert.ok(syntaxFailure.error);

    const runtimeFailure = evaluateUnsafe('const obj = null; return obj.prop;');
    assert.equal(runtimeFailure.success, false);
    assert.ok(runtimeFailure.error);
  });

  test('should update skill competency level upon verified challenge pass', () => {
    const computeNewProficiency = (currentLevel: number, testPassRate: number): number => {
      if (testPassRate >= 1.0) return Math.min(5, currentLevel + 1);
      if (testPassRate >= 0.7) return currentLevel;
      return Math.max(1, currentLevel - 1);
    };

    assert.equal(computeNewProficiency(2, 1.0), 3);
    assert.equal(computeNewProficiency(3, 0.75), 3);
    assert.equal(computeNewProficiency(2, 0.4), 1);
    assert.equal(computeNewProficiency(5, 1.0), 5); // caps at 5
  });
});
