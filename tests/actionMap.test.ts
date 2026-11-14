import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseActionCode } from '../src/actionMap/types';
import { ACTION_MAP_WHITELIST, SEED_ACTION_GOALS } from '../src/actionMap/actionMapData';
import { ActionExecutor } from '../src/actionMap/actionExecutor';

describe('ActionMap Goal Validation Engine Tests', () => {
  it('should accurately parse valid colon-delimited action codes', () => {
    const parsed1 = parseActionCode('NAV:s3');
    assert.strictEqual(parsed1.family, 'NAV');
    assert.strictEqual(parsed1.resource, 's3');
    assert.strictEqual(parsed1.value, undefined);

    const parsed2 = parseActionCode('S3:block-public-access:bkt-customer-data');
    assert.strictEqual(parsed2.family, 'S3');
    assert.strictEqual(parsed2.resource, 'block-public-access');
    assert.strictEqual(parsed2.value, 'bkt-customer-data');
  });

  it('should validate whitelist registration for all core cloud families', () => {
    const families = Object.keys(ACTION_MAP_WHITELIST);
    assert.ok(families.includes('NAV'));
    assert.ok(families.includes('EC2'));
    assert.ok(families.includes('S3'));
    assert.ok(families.includes('IAM'));
    assert.ok(families.includes('VPC'));
    assert.ok(families.includes('CW'));
    assert.ok(families.includes('SEC'));
    assert.ok(families.includes('WAR_ROOM'));
  });

  it('should seed default interactive cloud challenge goals', () => {
    assert.ok(SEED_ACTION_GOALS.length >= 4);
    const goalIds = SEED_ACTION_GOALS.map(g => g.id);
    assert.ok(goalIds.includes('goal-s3-harden'));
    assert.ok(goalIds.includes('goal-iam-mfa'));
    assert.ok(goalIds.includes('goal-ec2-resilience'));
    assert.ok(goalIds.includes('goal-sre-remediation'));
  });

  it('should reject unwhitelisted action mutations safely', async () => {
    const result = await ActionExecutor.executeAction('INVALID_FAMILY:malicious_cmd:drop_db');
    assert.strictEqual(result.ok, false);
    assert.ok(result.reason?.includes('not in ACTION_MAP whitelist'));
  });

  it('should execute whitelisted NAV action successfully and invoke navigation hook', async () => {
    let navigatedTo = '';
    ActionExecutor.setNavigationHandler((service) => {
      navigatedTo = service;
    });

    const result = await ActionExecutor.executeAction('NAV:s3');
    assert.strictEqual(result.ok, true);
    assert.strictEqual(navigatedTo, 's3');
    assert.strictEqual(result.code, 'NAV:s3');

    // Clean up
    ActionExecutor.setNavigationHandler(null);
  });

  it('should log executed actions in audit stream and notify subscribers', async () => {
    let notified = false;
    const unsub = ActionExecutor.subscribe((logs) => {
      if (logs.length > 0) notified = true;
    });

    await ActionExecutor.executeAction('NAV:ec2');
    assert.strictEqual(notified, true);
    const logs = ActionExecutor.getLogs();
    assert.ok(logs.some(l => l.code === 'NAV:ec2'));

    unsub();
  });
});
