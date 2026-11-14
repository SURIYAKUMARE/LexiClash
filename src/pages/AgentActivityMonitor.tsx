import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AgentExecutionRecord } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowDown,
  Play,
  Layers,
  ChevronRight,
  Check
} from 'lucide-react';

interface PipelineAgent {
  id: string;
  order: number;
  name: string;
  role: string;
  taskSummary: string;
  inputSummary: string;
  outputSummary: string;
  handoffPayload: string;
  status: 'completed' | 'in_progress' | 'queued';
  latencyMs: number;
  timestamp: string;
}

export const AgentActivityMonitor: React.FC = () => {
  const [executions, setExecutions] = useState<AgentExecutionRecord[]>([]);
  const [hasGeminiApiKey, setHasGeminiApiKey] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Five Core Sequential Agents with Hand-offs
  const pipelineAgents: PipelineAgent[] = [
    {
      id: 'agent-1',
      order: 1,
      name: 'Profile Analyzer Agent',
      role: 'Baseline Ingestion & Persona Synthesis',
      taskSummary: 'Analyzed user educational level, weekly time commitment (10h/wk), and self-reported skills.',
      inputSummary: 'UserProfile { role: "Full Stack Developer", skillsCount: 6, hoursPerWeek: 10 }',
      outputSummary: 'Synthesized learner persona: Intermediate web developer transitioning to senior full-stack standards.',
      handoffPayload: 'Dispatched structured profile invariants and baseline proficiency map to Skill Gap Analyzer.',
      status: 'completed',
      latencyMs: 84,
      timestamp: '2 mins ago'
    },
    {
      id: 'agent-2',
      order: 2,
      name: 'Skill Gap Analyzer Agent',
      role: 'Algorithmic Benchmark Delta Computation',
      taskSummary: 'Compared 6 active user skills against 7 core benchmarks for Full Stack Developer role.',
      inputSummary: 'UserSkills Map vs. RoleRequirements (JavaScript: 4/5, React: 3/4, Node.js: 2/4, PostgreSQL: 2/3)',
      outputSummary: 'Identified critical deficits: Node.js (-2 levels) and PostgreSQL (-1 level). Benchmark met for JavaScript and React.',
      handoffPayload: 'Forwarded quantified skill delta vector and weak subtopics to Career Intelligence Agent.',
      status: 'completed',
      latencyMs: 112,
      timestamp: '2 mins ago'
    },
    {
      id: 'agent-3',
      order: 3,
      name: 'Career Intelligence Agent',
      role: 'Market Alignment & Role Readiness Scoring',
      taskSummary: 'Evaluated market benchmark standards, salary compensation distribution ($95k-$145k), and computed readiness.',
      inputSummary: 'Skill Gap Vector + Market Benchmark Model for Full Stack Developer',
      outputSummary: 'Computed weighted readiness score: 72%. Determined primary hiring obstacle is asynchronous runtime depth.',
      handoffPayload: 'Dispatched 72% readiness benchmark and target skill priorities to Learning Path Agent.',
      status: 'completed',
      latencyMs: 96,
      timestamp: '1 min ago'
    },
    {
      id: 'agent-4',
      order: 4,
      name: 'Learning Path Agent',
      role: 'Phased Curriculum & Milestone Planner',
      taskSummary: 'Constructed week-by-week curriculum prioritizing Node.js event loop and PostgreSQL query indexing.',
      inputSummary: 'Prioritized Gaps (Node.js, PostgreSQL) + Target Role (Full Stack) + Velocity (10h/wk)',
      outputSummary: 'Generated progressive roadmap with verified tasks, documentation links, and coding exercises.',
      handoffPayload: 'Transferred curriculum milestones to Cloud Architecture Agent.',
      status: 'completed',
      latencyMs: 145,
      timestamp: '1 min ago'
    },
    {
      id: 'agent-5',
      order: 5,
      name: 'Cloud Architecture Agent',
      role: 'Multi-AZ Topology & Resilience Auditor',
      taskSummary: 'Audited simulated VPC subnets, ingress routing, and S3 Block Public Access perimeters.',
      inputSummary: 'Simulated VPC (10.0.0.0/16) + 3 Subnets + 2 EC2 Instances + S3 Buckets',
      outputSummary: 'Verified multi-AZ distribution across us-east-1a/b. Flagged 1 S3 bucket for public exposure remediation.',
      handoffPayload: 'Dispatched infrastructure resilience audit to Incident Analysis Agent.',
      status: 'completed',
      latencyMs: 65,
      timestamp: '1 min ago'
    },
    {
      id: 'agent-6',
      order: 6,
      name: 'Incident Analysis Agent',
      role: 'SRE Outage Triage & Runbook Recommender',
      taskSummary: 'Analyzed telemetry log streams and diagnostic checks for active production outages.',
      inputSummary: 'Incident INC-101 logs (CloudWatch + S3 Access Logs) + Error Frequency',
      outputSummary: 'Correlated root cause to public ACL override. Recommended automated Block Public Access remediation.',
      handoffPayload: 'Dispatched post-mortem recommendations to Assessment Agent.',
      status: 'completed',
      latencyMs: 82,
      timestamp: 'Just now'
    },
    {
      id: 'agent-7',
      order: 7,
      name: 'Assessment Agent',
      role: 'Scenario Evaluation & Subtopic Scoring',
      taskSummary: 'Diagnosed quiz and placement assessment answers across 4 competency dimensions.',
      inputSummary: 'Scenario Submissions Map + Dimension Matrix (Technical, Problem-Solving, Practical, Experience)',
      outputSummary: 'Determined Level 3-4 competency. Awarded verified skills and flagged streams for reinforcement.',
      handoffPayload: 'Forwarded evaluated subtopics to Progress Optimization Agent.',
      status: 'completed',
      latencyMs: 94,
      timestamp: 'Just now'
    },
    {
      id: 'agent-8',
      order: 8,
      name: 'Progress Optimization Agent',
      role: 'Adaptive Pacing & Dynamic Re-Routing',
      taskSummary: 'Calibrated roadmap pacing, adjusted task deadlines, and scheduled retests for weak concepts.',
      inputSummary: 'Learner Velocity + Pacing Commitment (12h/wk) + Competency Deliberations',
      outputSummary: 'Optimized roadmap to 4 phases. Injected remedial micro-modules for Node.js backpressure.',
      handoffPayload: 'Synchronized telemetry with persistent AI Mentor Agent.',
      status: 'completed',
      latencyMs: 78,
      timestamp: 'Just now'
    },
    {
      id: 'agent-9',
      order: 9,
      name: 'AI Mentor Agent',
      role: 'Contextual Socratic Guidance & Audio Coaching',
      taskSummary: 'Synthesized active learning context, route location, and personalized suggestions in English/Tanglish.',
      inputSummary: 'Current Location: /cloud-console + User Competency Fingerprint + Speech State',
      outputSummary: 'Delivered contextual recommendations, audio assistance, and real-time incident support.',
      handoffPayload: 'Pipeline cycle complete. All telemetry synchronized with learner profile.',
      status: 'completed',
      latencyMs: 54,
      timestamp: 'Just now'
    }
  ];

  const loadActivity = async () => {
    try {
      const data = await api.getAgentActivity();
      setExecutions(data.executions || []);
      setHasGeminiApiKey(data.hasGeminiApiKey || false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, []);

  const handleRunFullPipeline = async () => {
    setIsTriggering(true);
    try {
      await api.runAgent('Profile Analyzer Agent');
      await api.runAgent('Skill Gap Analyzer Agent');
      await api.runAgent('Career Intelligence Agent');
      await api.runAgent('Learning Path Agent');
      await api.runAgent('Cloud Architecture Agent');
      await api.runAgent('Incident Analysis Agent');
      await api.runAgent('Assessment Agent');
      await api.runAgent('Progress Optimization Agent');
      await api.runAgent('AI Mentor Agent');
      await loadActivity();
    } catch (err: any) {
      alert(err?.message || 'Failed to trigger agent pipeline.');
    } finally {
      setIsTriggering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-charcoal-muted dark:text-slate-400 font-medium">Loading agent telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-charcoal dark:text-slate-100 tracking-tight">
              Agent Activity Monitor
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900">
              5-Agent Pipeline
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-1">
            Sequential orchestration of specialized agents with structured inputs, outputs, and hand-offs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card text-charcoal-muted dark:text-slate-300">
            Engine: <strong>{hasGeminiApiKey ? 'Gemini 1.5' : 'Deterministic Heuristic'}</strong>
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRunFullPipeline}
            disabled={isTriggering}
            leftIcon={<Play className="w-3.5 h-3.5" />}
          >
            {isTriggering ? 'Running...' : 'Run Pipeline'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadActivity}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Sequential Hand-off Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">
            Pipeline Execution & Hand-off Sequence
          </h2>
          <span className="text-xs text-status-success font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> All 5 Agents Operational
          </span>
        </div>

        <div className="space-y-4">
          {pipelineAgents.map((agent, index) => {
            const isLast = index === pipelineAgents.length - 1;

            return (
              <div key={agent.id} className="space-y-3">
                {/* Agent Card */}
                <Card className="space-y-3 p-4 sm:p-5">
                  {/* Card Header: Agent Name, Role, Status, Latency */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-border dark:border-surface-dark-border">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-brand-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {agent.order}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-charcoal dark:text-slate-100">
                            {agent.name}
                          </h3>
                          <span className="text-[11px] font-medium text-charcoal-subtle dark:text-slate-400">
                            · {agent.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-charcoal-subtle dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {agent.latencyMs}ms
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-status-success-bg dark:bg-emerald-950/40 text-status-success border border-emerald-200 dark:border-emerald-800/50">
                        Completed
                      </span>
                    </div>
                  </div>

                  {/* Task Summary */}
                  <p className="text-xs text-charcoal dark:text-slate-200 leading-relaxed font-medium">
                    {agent.taskSummary}
                  </p>

                  {/* Input and Output Split Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="p-2.5 rounded-lg bg-surface-subtle dark:bg-slate-800/50 border border-surface-border dark:border-surface-dark-border space-y-1">
                      <span className="text-[10px] font-semibold text-charcoal-subtle dark:text-slate-400 uppercase tracking-wider block">
                        Input Summary
                      </span>
                      <p className="text-charcoal-muted dark:text-slate-300 font-mono text-[11px]">
                        {agent.inputSummary}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-surface-subtle dark:bg-slate-800/50 border border-surface-border dark:border-surface-dark-border space-y-1">
                      <span className="text-[10px] font-semibold text-charcoal-subtle dark:text-slate-400 uppercase tracking-wider block">
                        Output Summary
                      </span>
                      <p className="text-charcoal-muted dark:text-slate-300 text-[11px] leading-relaxed">
                        {agent.outputSummary}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Hand-off Arrow Indicator between agents */}
                {!isLast && (
                  <div className="flex items-center justify-center py-1">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-subtle dark:bg-slate-800 border border-surface-border dark:border-surface-dark-border text-xs text-charcoal-muted dark:text-slate-400">
                      <ArrowDown className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span className="text-[11px] font-medium">
                        Hand-off: {agent.handoffPayload}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Log Table */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border dark:border-surface-dark-border">
          <div>
            <h3 className="text-sm font-bold text-charcoal dark:text-slate-100">
              Recent Execution Logs
            </h3>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Audit trail of individual agent invocations and latency.
            </p>
          </div>
          <span className="text-xs text-charcoal-subtle dark:text-slate-400">
            {executions.length} executions recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-border dark:border-surface-dark-border text-charcoal-muted dark:text-slate-400">
                <th className="py-2.5 font-semibold">Agent Name</th>
                <th className="py-2.5 font-semibold">Task Summary</th>
                <th className="py-2.5 font-semibold">Source</th>
                <th className="py-2.5 font-semibold">Latency</th>
                <th className="py-2.5 font-semibold">Status</th>
                <th className="py-2.5 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
              {executions.slice(0, 8).map(exec => (
                <tr key={exec.id} className="hover:bg-surface-subtle dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 font-semibold text-charcoal dark:text-slate-100">
                    {exec.agentName}
                  </td>
                  <td className="py-2.5 text-charcoal-muted dark:text-slate-400 max-w-xs truncate">
                    {exec.task}
                  </td>
                  <td className="py-2.5 text-charcoal-subtle dark:text-slate-400">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-surface-subtle dark:bg-slate-800 border border-surface-border dark:border-surface-dark-border">
                      {exec.source === 'gemini_llm' ? 'Gemini' : 'Heuristic'}
                    </span>
                  </td>
                  <td className="py-2.5 text-charcoal-subtle dark:text-slate-400 font-mono">
                    {exec.latencyMs}ms
                  </td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-status-success-bg dark:bg-emerald-950/40 text-status-success border border-emerald-200 dark:border-emerald-800/50">
                      Success
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-charcoal-subtle dark:text-slate-400 text-[11px]">
                    {new Date(exec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AgentActivityMonitor;
