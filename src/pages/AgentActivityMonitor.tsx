import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AgentExecutionRecord } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Activity,
  Bot,
  BrainCircuit,
  Compass,
  MapPin,
  CheckSquare,
  TrendingUp,
  Sparkles,
  Play,
  RotateCcw,
  Clock,
  Server,
  Cpu,
  CheckCircle2
} from 'lucide-react';

export const AgentActivityMonitor: React.FC = () => {
  const [executions, setExecutions] = useState<AgentExecutionRecord[]>([]);
  const [hasGeminiApiKey, setHasGeminiApiKey] = useState(false);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [filterAgent, setFilterAgent] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  const loadActivity = async () => {
    try {
      const data = await api.getAgentActivity();
      setExecutions(data.executions);
      setHasGeminiApiKey(data.hasGeminiApiKey);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, []);

  const agentsList = [
    {
      name: 'Profile Analyzer Agent',
      role: 'Background Persona & Learning Velocity Synthesis',
      description: 'Parses academic degree, existing portfolio projects, and hours commitment to compute baseline persona and pace.',
      icon: Cpu,
    },
    {
      name: 'Skill Gap Analyzer Agent',
      role: 'Algorithmic Benchmark Delta Computation',
      description: 'Calculates mathematically rigorous, weighted deficit between verified user skills and target role requirements.',
      icon: BrainCircuit,
    },
    {
      name: 'Career Intelligence Agent',
      role: 'Industry Trends & Hiring Expectations',
      description: 'Gathers real-time hiring manager checklists, compensation distributions, and key capstone project themes.',
      icon: Compass,
    },
    {
      name: 'Learning Path Agent',
      role: 'Phased Multi-Milestone Roadmap Construction',
      description: 'Synthesizes gaps into an actionable 4-phase roadmap with duration estimates and verified documentation links.',
      icon: MapPin,
    },
    {
      name: 'Assessment Agent',
      role: 'Diagnostic Error Classification & Remediation',
      description: 'Categorizes wrong answers into conceptual, syntax, or edge-case errors, detecting weak subtopics.',
      icon: CheckSquare,
    },
    {
      name: 'AI Mentor Agent',
      role: 'Context-Aware Technical Mentorship & Simulation',
      description: 'Conducts simulated mock interviews, code reviews, and architectural problem breakdowns.',
      icon: Bot,
    },
    {
      name: 'Progress Optimization Agent',
      role: 'Adaptive Pacing & Dynamic Roadmap Rebalancing',
      description: 'Detects assessment failures or masteries and automatically injects remediation tasks or skips milestones.',
      icon: TrendingUp,
    },
  ];

  const handleTriggerAgent = async (agentName: string) => {
    setRunningAgent(agentName);
    try {
      const res = await api.runAgent(agentName);
      setExecutions(res.executions);
    } catch (err: any) {
      alert(err?.message || 'Failed to execute agent.');
    } finally {
      setRunningAgent(null);
    }
  };

  const filteredExecutions = filterAgent === 'All'
    ? executions
    : executions.filter(e => e.agentName === filterAgent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-charcoal">Multi-Agent System Orchestrator</h1>
            <Badge variant="brand" size="sm">
              7 Active Agents
            </Badge>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Real-time telemetry showing agent status, input and output summaries, latency, and execution source.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={hasGeminiApiKey ? 'success' : 'neutral'} size="sm">
            {hasGeminiApiKey ? 'Gemini 1.5 Flash Active' : 'SkillPath Heuristic Engine Active'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={loadActivity}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Refresh Logs
          </Button>
        </div>
      </div>

      {/* 7 Agents Architectural Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentsList.map((agent) => {
          const Icon = agent.icon;
          const isRunning = runningAgent === agent.name;
          const lastRun = executions.find(e => e.agentName === agent.name);

          return (
            <Card key={agent.name} className="flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-status-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                    Online
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-charcoal">{agent.name}</h3>
                  <span className="text-[10px] text-brand-600 font-semibold block">{agent.role}</span>
                </div>

                <p className="text-[11px] text-charcoal-muted leading-relaxed">
                  {agent.description}
                </p>
              </div>

              <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                <span className="text-[10px] text-charcoal-subtle">
                  {lastRun ? `${lastRun.latencyMs}ms • ${lastRun.source === 'gemini_llm' ? 'Gemini' : 'Heuristic'}` : 'Ready to invoke'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  isLoading={isRunning}
                  onClick={() => handleTriggerAgent(agent.name)}
                  leftIcon={<Play className="w-3 h-3 fill-current" />}
                >
                  Run Agent
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Execution Telemetry History Table */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-charcoal">Agent Execution History</h3>
            <p className="text-xs text-charcoal-muted">
              Live audit trail of structured JSON exchanges between backend agents.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-charcoal-subtle">Filter:</span>
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-surface-subtle border border-surface-border rounded-lg text-charcoal"
            >
              <option value="All">All 7 Agents</option>
              {agentsList.map(a => (
                <option key={a.name} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredExecutions.length === 0 ? (
          <div className="py-8 text-center text-xs text-charcoal-subtle">
            No executions logged yet. Click "Run Agent" above to test any agent live.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-surface-border text-charcoal-subtle font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Agent</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Task Summary</th>
                  <th className="py-2.5 px-3">Input Summary</th>
                  <th className="py-2.5 px-3">Output Summary</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredExecutions.map((exec) => (
                  <tr key={exec.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-charcoal whitespace-nowrap">
                      {exec.agentName}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge
                        variant={exec.status === 'completed' ? 'success' : exec.status === 'running' ? 'brand' : 'danger'}
                        size="sm"
                      >
                        {exec.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-charcoal-muted max-w-xs truncate">
                      {exec.taskSummary}
                    </td>
                    <td className="py-2.5 px-3 text-charcoal-subtle font-mono text-[11px] max-w-xs truncate">
                      {exec.inputSummary}
                    </td>
                    <td className="py-2.5 px-3 text-charcoal max-w-xs truncate">
                      {exec.outputSummary}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-charcoal-subtle">
                      <span className="font-semibold text-charcoal">{exec.latencyMs}</span> ms
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-charcoal-subtle text-[11px]">
                      {new Date(exec.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
