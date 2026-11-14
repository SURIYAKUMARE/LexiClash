import { ACTION_MAP_WHITELIST, SEED_ACTION_GOALS } from './actionMapData';
import { parseActionCode, ActionResult, ParsedAction, ActionExecutionLog, ActionMapGoal } from './types';
import { api } from '../services/api';
import { CloudEc2Instance, CloudS3Bucket, CloudIamUser } from '../db/indexedDb';

type ActionListener = (logs: ActionExecutionLog[], goals: ActionMapGoal[]) => void;
type NavigationHandler = (service: string) => void;

class ActionMapEngine {
  private static listeners: ActionListener[] = [];
  private static executionLogs: ActionExecutionLog[] = [];
  private static goals: ActionMapGoal[] = [...SEED_ACTION_GOALS];
  private static navigationHandler: NavigationHandler | null = null;

  public static setNavigationHandler(handler: NavigationHandler | null) {
    this.navigationHandler = handler;
  }

  public static subscribe(listener: ActionListener): () => void {
    this.listeners.push(listener);
    listener(this.executionLogs, this.goals);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public static getLogs(): ActionExecutionLog[] {
    return this.executionLogs;
  }

  public static getGoals(): ActionMapGoal[] {
    return this.goals;
  }

  public static listAllWhitelistedCodes(): string[] {
    const list: string[] = [];
    Object.values(ACTION_MAP_WHITELIST).forEach(codes => list.push(...codes));
    return list;
  }

  private static isWhitelisted(raw: string): boolean {
    const parsed = parseActionCode(raw);
    if (!parsed) return false;

    const list = ACTION_MAP_WHITELIST[parsed.family];
    if (!list) return false;

    return list.some(pattern => {
      // Escape special characters and replace placeholders {id}, {name}, {cidr}, etc. with wildcards
      const regexPattern = pattern
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\\\{id\\\}/g, '[^:]+')
        .replace(/\\\{name\\\}/g, '[^:]+')
        .replace(/\\\{username\\\}/g, '[^:]+')
        .replace(/\\\{policy\\\}/g, '[^:]+')
        .replace(/\\\{key\\\}/g, '[^:]+')
        .replace(/\\\{cidr\\\}/g, '[^:]+')
        .replace(/\\\{vpcId\\\}/g, '[^:]+')
        .replace(/\\\{metric\\\}/g, '[^:]+')
        .replace(/\\\{threshold\\\}/g, '[^:]+')
        .replace(/\\\{group\\\}/g, '[^:]+')
        .replace(/\\\{code\\\}/g, '[^:]+')
        .replace(/\\\{incidentId\\\}/g, '[^:]+')
        .replace(/\\\{actionId\\\}/g, '[^:]+')
        .replace(/\\\{desired\\\}/g, '[^:]+');

      return new RegExp(`^${regexPattern}$`, 'i').test(raw);
    });
  }

  private static notify() {
    this.listeners.forEach(l => l(this.executionLogs, this.goals));
  }

  /**
   * Main Action Code Dispatcher
   */
  public static async executeAction(rawCode: string): Promise<ActionResult> {
    const startTime = Date.now();
    const raw = rawCode.trim();

    if (!this.isWhitelisted(raw)) {
      const failLog: ActionExecutionLog = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        code: raw,
        ok: false,
        reason: 'Action code is not in ACTION_MAP whitelist.',
        latencyMs: Date.now() - startTime
      };
      this.executionLogs = [failLog, ...this.executionLogs].slice(0, 50);
      this.notify();
      return {
        ok: false,
        code: raw,
        reason: 'Action code is not in ACTION_MAP whitelist.'
      };
    }

    const parsed = parseActionCode(raw);
    if (!parsed) {
      return { ok: false, code: raw, reason: 'Could not parse action code structure.' };
    }

    try {
      let message = 'Action executed successfully.';
      let affectedResource: string | undefined;

      switch (parsed.family) {
        case 'NAV': {
          const target = parsed.resource.toLowerCase();
          if (this.navigationHandler) {
            this.navigationHandler(target);
          }
          message = `Navigated to simulated service: ${target.toUpperCase()}`;
          affectedResource = target;
          break;
        }

        case 'EC2': {
          const simState = await api.getCloudSimulation();
          if (parsed.resource === 'launch-instance') {
            const newId = `i-0${Math.random().toString(16).substring(2, 10)}`;
            const newInst: CloudEc2Instance = {
              id: newId,
              name: `api-node-${newId.substring(0, 6)}`,
              type: 't3.micro',
              state: 'running',
              publicIp: `54.210.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250)}`,
              privateIp: `10.0.1.${Math.floor(Math.random() * 200)}`,
              securityGroupId: 'sg-web-public',
              az: 'us-east-1a',
              launchTime: new Date().toISOString(),
              cpuUtilization: 18.2
            };
            simState.ec2.instances.unshift(newInst);
            await api.updateCloudSimulation(simState);
            message = `Launched new EC2 instance ${newId} (t3.micro).`;
            affectedResource = newId;
          } else if (parsed.resource === 'stop-instance') {
            const targetId = parsed.value || simState.ec2.instances[0]?.id;
            const inst = simState.ec2.instances.find(i => i.id === targetId);
            if (inst) {
              inst.state = 'stopped';
              inst.cpuUtilization = 0;
              await api.updateCloudSimulation(simState);
              message = `Stopped EC2 instance ${targetId}.`;
              affectedResource = targetId;
            } else {
              throw new Error(`Instance ${targetId} not found.`);
            }
          } else if (parsed.resource === 'start-instance') {
            const targetId = parsed.value || simState.ec2.instances[0]?.id;
            const inst = simState.ec2.instances.find(i => i.id === targetId);
            if (inst) {
              inst.state = 'running';
              inst.cpuUtilization = 28.4;
              await api.updateCloudSimulation(simState);
              message = `Started EC2 instance ${targetId}.`;
              affectedResource = targetId;
            } else {
              throw new Error(`Instance ${targetId} not found.`);
            }
          } else if (parsed.resource === 'terminate-instance') {
            const targetId = parsed.value || simState.ec2.instances[0]?.id;
            simState.ec2.instances = simState.ec2.instances.filter(i => i.id !== targetId);
            await api.updateCloudSimulation(simState);
            message = `Terminated EC2 instance ${targetId}.`;
            affectedResource = targetId;
          }
          break;
        }

        case 'S3': {
          const simState = await api.getCloudSimulation();
          if (parsed.resource === 'create-bucket') {
            const bktName = parsed.value || `skillpath-bkt-${Date.now()}`;
            const newBkt: CloudS3Bucket = {
              id: `bkt-${Date.now()}`,
              name: bktName,
              region: 'us-east-1',
              blockPublicAccess: true,
              isPublic: false,
              versioning: false,
              createdAt: new Date().toISOString(),
              objects: []
            };
            simState.s3.buckets.unshift(newBkt);
            await api.updateCloudSimulation(simState);
            message = `Created private S3 bucket s3://${bktName}`;
            affectedResource = bktName;
          } else if (parsed.resource === 'block-public-access') {
            const bktIdOrName = parsed.value || 'bkt-customer-data';
            const bkt = simState.s3.buckets.find(b => b.id === bktIdOrName || b.name === bktIdOrName);
            if (bkt) {
              bkt.blockPublicAccess = true;
              bkt.isPublic = false;
              await api.updateCloudSimulation(simState);
              message = `Enabled Block Public Access on bucket ${bkt.name}.`;
              affectedResource = bkt.name;
            } else {
              throw new Error(`Bucket ${bktIdOrName} not found.`);
            }
          } else if (parsed.resource === 'enable-public-access') {
            const bktIdOrName = parsed.value || 'bkt-customer-data';
            const bkt = simState.s3.buckets.find(b => b.id === bktIdOrName || b.name === bktIdOrName);
            if (bkt) {
              bkt.blockPublicAccess = false;
              bkt.isPublic = true;
              await api.updateCloudSimulation(simState);
              message = `Warning: Enabled public access on bucket ${bkt.name}.`;
              affectedResource = bkt.name;
            }
          }
          break;
        }

        case 'IAM': {
          const simState = await api.getCloudSimulation();
          if (parsed.resource === 'create-user') {
            const uname = parsed.value || `user-${Date.now()}`;
            const newUser: CloudIamUser = {
              id: `usr-${Date.now()}`,
              username: uname,
              accessKeyId: `AKIA${Math.random().toString(36).substring(2, 14).toUpperCase()}`,
              policies: ['AmazonEC2ReadOnlyAccess'],
              mfaEnabled: false,
              createdAt: new Date().toISOString()
            };
            simState.iam.users.unshift(newUser);
            await api.updateCloudSimulation(simState);
            message = `Created IAM user ${uname} with read-only access.`;
            affectedResource = uname;
          } else if (parsed.resource === 'enable-mfa') {
            const targetUId = parsed.value || 'usr-102';
            const user = simState.iam.users.find(u => u.id === targetUId || u.username === targetUId);
            if (user) {
              user.mfaEnabled = true;
              await api.updateCloudSimulation(simState);
              message = `Enforced Multi-Factor Authentication on ${user.username}.`;
              affectedResource = user.username;
            } else {
              throw new Error(`User ${targetUId} not found.`);
            }
          }
          break;
        }

        case 'SEC': {
          if (parsed.resource === 'run-compliance-scan') {
            const audit = await api.getSecurityAudit();
            message = `Executed CIS Benchmark audit. Overall score: ${audit.score}% (${audit.status}).`;
            affectedResource = 'CIS-Audit';
          } else if (parsed.resource === 'remediate-s3-public') {
            await api.remediateSecurityIssue('cis-s3-public');
            message = 'Auto-remediated S3 public bucket vulnerability.';
          } else if (parsed.resource === 'remediate-mfa-root') {
            await api.remediateSecurityIssue('cis-mfa-root');
            message = 'Auto-remediated IAM MFA requirement across users.';
          } else if (parsed.resource === 'remediate-ssh-open') {
            await api.remediateSecurityIssue('cis-sg-ssh');
            message = 'Removed unrestricted 0.0.0.0/0 SSH rule from security group.';
          }
          break;
        }

        case 'WAR_ROOM': {
          if (parsed.resource === 'triage-incident') {
            message = `Triaged incident telemetry for ${parsed.value || 'INC-101'}.`;
            affectedResource = parsed.value;
          } else if (parsed.resource === 'apply-mitigation') {
            const incId = parsed.value || 'inc-101';
            const actId = parsed.extra || 'act-101-a';
            const res = await api.resolveSreIncident(incId, actId, 90);
            message = `Mitigation applied: ${res.consequence}`;
            affectedResource = incId;
          }
          break;
        }

        default:
          message = `Executed ${raw}.`;
      }

      // Check Goals Progression
      this.checkGoalProgression(raw);

      const successLog: ActionExecutionLog = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        code: raw,
        ok: true,
        message,
        latencyMs: Date.now() - startTime
      };

      this.executionLogs = [successLog, ...this.executionLogs].slice(0, 50);
      this.notify();

      return {
        ok: true,
        code: raw,
        message,
        affectedResource
      };
    } catch (err: any) {
      const errLog: ActionExecutionLog = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        code: raw,
        ok: false,
        reason: err.message || 'Execution failed',
        latencyMs: Date.now() - startTime
      };
      this.executionLogs = [errLog, ...this.executionLogs].slice(0, 50);
      this.notify();

      return {
        ok: false,
        code: raw,
        reason: err.message || 'Execution error.'
      };
    }
  }

  /**
   * Evaluates if raw action advances any active learning goal
   */
  private static checkGoalProgression(actionCode: string) {
    this.goals.forEach(goal => {
      if (goal.isCompleted) return;

      const nextExpectedStepIndex = goal.completedSteps.length;
      const expectedStep = goal.targetSequence[nextExpectedStepIndex];

      if (!expectedStep) return;

      // Match pattern against expected step
      const isMatch = this.actionMatches(actionCode, expectedStep);
      if (isMatch) {
        goal.completedSteps.push(actionCode);
        if (goal.completedSteps.length === goal.targetSequence.length) {
          goal.isCompleted = true;
        }
      }
    });
  }

  private static actionMatches(action: string, pattern: string): boolean {
    if (action.toLowerCase() === pattern.toLowerCase()) return true;
    const actionParts = action.split(':');
    const patternParts = pattern.split(':');
    if (actionParts[0]?.toLowerCase() !== patternParts[0]?.toLowerCase()) return false;
    if (actionParts[1]?.toLowerCase() !== patternParts[1]?.toLowerCase()) return false;
    return true;
  }
}

export const ActionExecutor = ActionMapEngine;
