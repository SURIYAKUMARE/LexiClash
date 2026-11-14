import { SreIncidentScenario } from '../db/seedData';
import { AgentReasoningTrace, IncidentAnalysisResult } from './types';

export class IncidentAnalysisAgent {
  public static triageIncident(scenario: SreIncidentScenario): IncidentAnalysisResult {
    const traces: AgentReasoningTrace[] = [];
    let step = 1;

    traces.push({
      step: step++,
      agentName: 'Incident Analysis Agent',
      thought: `Parsing incident alert telemetry for ${scenario.code} (${scenario.title}). Severity classified as ${scenario.severity}.`,
      action: 'CLASSIFY_INCIDENT_SEVERITY',
      observation: `Detected ${scenario.symptoms.length} critical symptoms. Immediate operational triage activated.`,
      timestamp: new Date().toISOString()
    });

    traces.push({
      step: step++,
      agentName: 'Incident Analysis Agent',
      thought: `Correlating mock CloudWatch and access log streams. Scanning for error patterns: ${scenario.mockLogs.map(l => l.level).join(', ')}.`,
      action: 'CORRELATE_LOG_STREAMS',
      observation: `Primary signature isolated: "${scenario.mockLogs[0]?.message.substring(0, 80)}..."`,
      timestamp: new Date().toISOString()
    });

    const correctOption = scenario.mitigationOptions.find(o => o.isCorrect) || scenario.mitigationOptions[0];

    traces.push({
      step: step++,
      agentName: 'Incident Analysis Agent',
      thought: `Synthesizing root cause hypothesis against runbook templates. Recommended mitigation: "${correctOption.actionName}".`,
      action: 'RECOMMEND_MITIGATION_RUNBOOK',
      observation: `Expected MTTR reduction: ~70%. Tradeoff: ${correctOption.tradeoffSummary}`,
      timestamp: new Date().toISOString()
    });

    return {
      incidentId: scenario.id,
      severity: scenario.severity,
      triageSummary: scenario.impactDescription,
      rootCauseIdentified: scenario.postMortemTemplate.rootCause,
      recommendedMitigation: correctOption.actionName,
      mttrEstimatedMinutes: scenario.severity === 'P1' ? 4 : 8,
      reasoningTraces: traces
    };
  }
}
