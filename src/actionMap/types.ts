export type ActionResult =
  | { ok: true; code: string; message: string; affectedResource?: string }
  | { ok: false; code: string; reason: string };

export interface ParsedAction {
  family: string;
  resource: string;
  value?: string;
  extra?: string;
  raw: string;
}

/**
 * Parses structured action string: FAMILY:RESOURCE:VALUE:EXTRA
 * e.g. "EC2:stop-instance:i-0a12b34c56d78e01" -> { family: "EC2", resource: "stop-instance", value: "i-0a12b34c56d78e01" }
 */
export function parseActionCode(raw: string): ParsedAction | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(':');
  if (parts.length < 2) return null;

  const family = parts[0].toUpperCase();
  const resource = parts[1];
  const value = parts[2];
  const extra = parts.slice(3).join(':');

  return {
    family,
    resource,
    value,
    extra: extra || undefined,
    raw: trimmed
  };
}

export interface ActionMapGoal {
  id: string;
  title: string;
  description: string;
  category: 'Security' | 'Compute' | 'Storage' | 'Network' | 'SRE';
  targetSequence: string[]; // List of action code patterns required
  completedSteps: string[];
  isCompleted: boolean;
  xpReward: number;
}

export interface ActionExecutionLog {
  id: string;
  timestamp: string;
  code: string;
  ok: boolean;
  message?: string;
  reason?: string;
  latencyMs: number;
}
