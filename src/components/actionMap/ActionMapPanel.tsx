import React, { useState, useEffect } from 'react';
import { ActionExecutor } from '../../actionMap/actionExecutor';
import { ActionExecutionLog, ActionMapGoal } from '../../actionMap/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Layers,
  Terminal,
  Shield,
  Activity,
  Check,
  Award
} from 'lucide-react';

interface ActionMapPanelProps {
  onNavigateService?: (serviceName: string) => void;
}

export const ActionMapPanel: React.FC<ActionMapPanelProps> = ({ onNavigateService }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<ActionExecutionLog[]>([]);
  const [goals, setGoals] = useState<ActionMapGoal[]>([]);
  const [activeTab, setActiveTab] = useState<'goals' | 'smoke' | 'logs'>('goals');
  const [isExecutingSmoke, setIsExecutingSmoke] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<string>('ALL');

  useEffect(() => {
    if (onNavigateService) {
      ActionExecutor.setNavigationHandler(onNavigateService);
    }
    const unsubscribe = ActionExecutor.subscribe((newLogs, newGoals) => {
      setLogs([...newLogs]);
      setGoals([...newGoals]);
    });
    return () => {
      unsubscribe();
      ActionExecutor.setNavigationHandler(null);
    };
  }, [onNavigateService]);

  const handleRunAction = async (code: string) => {
    await ActionExecutor.executeAction(code);
  };

  const handleRunAllSmokeTests = async () => {
    setIsExecutingSmoke(true);
    const smokeSuite = [
      'NAV:s3',
      'S3:block-public-access:bkt-customer-data',
      'NAV:ec2',
      'EC2:launch-instance',
      'NAV:iam',
      'IAM:enable-mfa:usr-102',
      'SEC:run-compliance-scan'
    ];

    for (const code of smokeSuite) {
      await ActionExecutor.executeAction(code);
      await new Promise(r => setTimeout(r, 120));
    }
    setIsExecutingSmoke(false);
  };

  const whitelistedCodes = ActionExecutor.listAllWhitelistedCodes();
  const families = ['ALL', 'NAV', 'EC2', 'S3', 'IAM', 'SEC', 'WAR_ROOM'];

  const filteredCodes = selectedFamily === 'ALL'
    ? whitelistedCodes
    : whitelistedCodes.filter(c => c.startsWith(`${selectedFamily}:`));

  const completedGoalsCount = goals.filter(g => g.isCompleted).length;

  return (
    <div className="bg-white dark:bg-surface-dark-card border border-surface-border dark:border-surface-dark-border rounded-xl shadow-xs overflow-hidden transition-all">
      {/* Drawer Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 bg-surface-subtle dark:bg-slate-800/80 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100/70 dark:hover:bg-slate-800"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center text-white font-mono font-bold text-xs">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-charcoal dark:text-white">
                ActionMap Goal Validation Engine
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Active Contract
              </span>
            </div>
            <span className="text-[10px] text-charcoal-subtle dark:text-slate-400">
              {completedGoalsCount} of {goals.length} Goals Completed &bull; {logs.length} Actions Tracked
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOpen ? <ChevronDown className="w-4 h-4 text-charcoal-muted" /> : <ChevronUp className="w-4 h-4 text-charcoal-muted" />}
        </div>
      </div>

      {/* Expandable Body */}
      {isOpen && (
        <div className="p-4 border-t border-surface-border dark:border-surface-dark-border space-y-4">
          {/* Sub Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-surface-border dark:border-surface-dark-border">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <button
                onClick={() => setActiveTab('goals')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'goals'
                    ? 'bg-brand-600 text-white font-bold shadow-xs'
                    : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal bg-surface-subtle dark:bg-slate-800'
                }`}
              >
                Guided Challenge Goals ({completedGoalsCount}/{goals.length})
              </button>
              <button
                onClick={() => setActiveTab('smoke')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'smoke'
                    ? 'bg-brand-600 text-white font-bold shadow-xs'
                    : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal bg-surface-subtle dark:bg-slate-800'
                }`}
              >
                Action Dispatcher & Smoke Tests
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'logs'
                    ? 'bg-brand-600 text-white font-bold shadow-xs'
                    : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal bg-surface-subtle dark:bg-slate-800'
                }`}
              >
                Event Audit Log ({logs.length})
              </button>
            </div>

            {activeTab === 'smoke' && (
              <Button
                size="sm"
                variant="primary"
                onClick={handleRunAllSmokeTests}
                disabled={isExecutingSmoke}
                className="text-xs font-mono gap-1.5 h-7 py-1"
              >
                <Play className="w-3 h-3" />
                {isExecutingSmoke ? 'Verifying Pipeline...' : 'Run All Smoke Tests'}
              </Button>
            )}
          </div>

          {/* TAB 1: GUIDED GOALS */}
          {activeTab === 'goals' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goals.map(goal => (
                <div
                  key={goal.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    goal.isCompleted
                      ? 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-surface-border dark:border-surface-dark-border bg-surface-subtle/40 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <span className="text-[10px] font-mono text-brand-600 font-bold uppercase tracking-wider block">
                        Category: {goal.category}
                      </span>
                      <h4 className="text-xs font-bold text-charcoal dark:text-white">
                        {goal.title}
                      </h4>
                    </div>
                    {goal.isCompleted ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1 shrink-0 font-mono">
                        <Check className="w-3 h-3" /> VERIFIED
                      </span>
                    ) : (
                      <Badge variant="brand" size="sm">
                        +{goal.xpReward} XP
                      </Badge>
                    )}
                  </div>

                  <p className="text-[11px] text-charcoal-muted dark:text-slate-400 leading-relaxed mb-3">
                    {goal.description}
                  </p>

                  {/* Step Verification Checklist */}
                  <div className="space-y-1.5 font-mono text-[10px]">
                    {goal.targetSequence.map((stepPattern, idx) => {
                      const isStepDone = idx < goal.completedSteps.length;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-1.5 rounded ${
                            isStepDone
                              ? 'bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                              : 'bg-white dark:bg-slate-800 text-charcoal-muted border border-surface-border dark:border-surface-dark-border'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {isStepDone ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <span className="w-3 h-3 rounded-full border border-slate-400 inline-block text-[8px] text-center leading-3">
                                {idx + 1}
                              </span>
                            )}
                            <span>{stepPattern}</span>
                          </div>
                          <button
                            onClick={() => handleRunAction(stepPattern)}
                            className="text-[9px] text-brand-600 hover:underline font-sans ml-2"
                          >
                            Execute &rarr;
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: SMOKE DISPATCHER */}
          {activeTab === 'smoke' && (
            <div className="space-y-3">
              {/* Family Filters */}
              <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-mono">
                {families.map(fam => (
                  <button
                    key={fam}
                    onClick={() => setSelectedFamily(fam)}
                    className={`px-2 py-1 rounded transition-colors ${
                      selectedFamily === fam
                        ? 'bg-charcoal text-white dark:bg-white dark:text-slate-900 font-bold'
                        : 'bg-surface-subtle dark:bg-slate-800 text-charcoal-muted hover:text-charcoal'
                    }`}
                  >
                    {fam}
                  </button>
                ))}
              </div>

              {/* Code buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 font-mono text-[10px]">
                {filteredCodes.map(code => (
                  <button
                    key={code}
                    onClick={() => handleRunAction(code)}
                    className="p-2 rounded bg-surface-subtle dark:bg-slate-800/60 border border-surface-border dark:border-surface-dark-border text-left hover:border-brand-500 hover:bg-white dark:hover:bg-slate-800 transition-colors truncate"
                    title={`Click to execute: ${code}`}
                  >
                    <span className="font-bold text-brand-600 block">{code.split(':')[0]}</span>
                    <span className="text-charcoal dark:text-slate-200">{code.split(':').slice(1).join(':')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-2">
              <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto border border-slate-800 space-y-1">
                {logs.length === 0 ? (
                  <span className="text-slate-500">No action executions recorded yet. Execute an action to view real-time state telemetry.</span>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="text-slate-500">[{log.timestamp}]</span>
                        <span className={log.ok ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          [{log.ok ? 'OK' : 'FAIL'}]
                        </span>
                        <span className="text-slate-200 font-semibold">{log.code}</span>
                        {log.message && <span className="text-slate-400">&mdash; {log.message}</span>}
                        {log.reason && <span className="text-rose-300">&mdash; {log.reason}</span>}
                      </div>
                      <span className="text-slate-500 shrink-0 text-[10px]">{log.latencyMs}ms</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
