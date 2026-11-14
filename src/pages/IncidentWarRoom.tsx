import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SreIncidentScenario } from '../db/seedData';
import { OfflinePortfolioCredential } from '../db/indexedDb';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Flame,
  AlertOctagon,
  Clock,
  Terminal,
  Activity,
  CheckCircle2,
  XCircle,
  FileText,
  RotateCcw,
  Award,
  ChevronRight,
  ShieldAlert,
  Play,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const IncidentWarRoom: React.FC = () => {
  const [incidents, setIncidents] = useState<SreIncidentScenario[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<SreIncidentScenario | null>(null);
  const [activeTab, setActiveTab] = useState<'triage' | 'diagnostics' | 'mitigation' | 'postmortem'>('triage');

  // Diagnostic tool state
  const [diagnosticOutputs, setDiagnosticOutputs] = useState<Record<string, boolean>>({});

  // Mitigation state
  const [selectedMitigationId, setSelectedMitigationId] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [mitigationResult, setMitigationResult] = useState<{
    success: boolean;
    consequence: string;
    postMortem: any;
    score: number;
    credentialAwarded?: OfflinePortfolioCredential;
  } | null>(null);

  // Response Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(true);

  useEffect(() => {
    const fetchIncidents = async () => {
      const res = await api.getSreIncidents();
      setIncidents(res.incidents);
      setSelectedIncident(res.incidents[0] || null);
    };
    fetchIncidents();
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && !mitigationResult?.success) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, mitigationResult]);

  const handleSelectIncident = (inc: SreIncidentScenario) => {
    setSelectedIncident(inc);
    setSelectedMitigationId(null);
    setMitigationResult(null);
    setDiagnosticOutputs({});
    setSecondsElapsed(0);
    setIsTimerActive(true);
    setActiveTab('triage');
  };

  const handleRunDiagnostic = (diagId: string) => {
    setDiagnosticOutputs(prev => ({ ...prev, [diagId]: true }));
  };

  const handleApplyMitigation = async () => {
    if (!selectedIncident || !selectedMitigationId) return;
    setIsResolving(true);
    try {
      const res = await api.resolveSreIncident(selectedIncident.id, selectedMitigationId, secondsElapsed);
      setMitigationResult(res);
      if (res.success) {
        setIsTimerActive(false);
        setActiveTab('postmortem');
      }
    } catch (err) {
      console.error('Failed to submit mitigation:', err);
    } finally {
      setIsResolving(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* SRE Emergency Header */}
      <div className="bg-[#1A1C1E] text-white rounded-xl p-4 sm:p-6 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400" /> SRE INCIDENT WAR ROOM
            </span>
            <span className="text-xs text-slate-400">Production Reliability Cockpit</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Live Incident Response Operations
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Simulate high-stakes production outages, correlate telemetry logs, execute diagnostic checks, and apply remediations to minimize Mean Time to Recovery (MTTR).
          </p>
        </div>

        {/* Stopwatch & MTTR Target */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 px-5 flex items-center gap-4 shrink-0 font-mono">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">RESPONSE TIMER</span>
            <span className="text-2xl font-extrabold text-white">{formatTimer(secondsElapsed)}</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">TARGET MTTR</span>
            <span className="text-sm font-bold text-emerald-400">&lt; 05:00</span>
          </div>
        </div>
      </div>

      {/* Incident Switcher Rail */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {incidents.map(inc => {
          const isSelected = selectedIncident?.id === inc.id;
          return (
            <button
              key={inc.id}
              onClick={() => handleSelectIncident(inc)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-rose-600 bg-white dark:bg-surface-dark-card shadow-xs ring-1 ring-rose-600'
                  : 'border-surface-border dark:border-surface-dark-border bg-surface-subtle dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-charcoal-subtle">{inc.code}</span>
                <Badge variant={inc.severity === 'P1' ? 'danger' : 'brand'} size="sm">
                  {inc.severity}
                </Badge>
              </div>
              <div className="text-xs font-bold text-charcoal dark:text-slate-100 truncate">{inc.title}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Incident Cockpit */}
      {selectedIncident && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Workspace (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <Card>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border dark:border-surface-dark-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-600">{selectedIncident.code}</span>
                    <Badge variant={selectedIncident.severity === 'P1' ? 'danger' : 'brand'} size="sm">
                      {selectedIncident.severity} - CRITICAL
                    </Badge>
                  </div>
                  <h2 className="text-base font-bold text-charcoal dark:text-slate-100 mt-1">
                    {selectedIncident.title}
                  </h2>
                </div>

                {/* Sub-tabs */}
                <div className="flex items-center gap-1 bg-surface-subtle dark:bg-slate-800 p-1 rounded-lg border border-surface-border dark:border-surface-dark-border text-xs">
                  <button
                    onClick={() => setActiveTab('triage')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activeTab === 'triage'
                        ? 'bg-white dark:bg-slate-900 font-bold text-charcoal dark:text-white shadow-xs'
                        : 'text-charcoal-muted dark:text-slate-400'
                    }`}
                  >
                    Triage & Logs
                  </button>
                  <button
                    onClick={() => setActiveTab('diagnostics')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activeTab === 'diagnostics'
                        ? 'bg-white dark:bg-slate-900 font-bold text-charcoal dark:text-white shadow-xs'
                        : 'text-charcoal-muted dark:text-slate-400'
                    }`}
                  >
                    Diagnostics
                  </button>
                  <button
                    onClick={() => setActiveTab('mitigation')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activeTab === 'mitigation'
                        ? 'bg-white dark:bg-slate-900 font-bold text-charcoal dark:text-white shadow-xs'
                        : 'text-charcoal-muted dark:text-slate-400'
                    }`}
                  >
                    Mitigation Runbook
                  </button>
                  {mitigationResult?.success && (
                    <button
                      onClick={() => setActiveTab('postmortem')}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        activeTab === 'postmortem'
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 font-bold'
                          : 'text-emerald-600'
                      }`}
                    >
                      Post-Mortem
                    </button>
                  )}
                </div>
              </div>

              {/* TAB 1: TRIAGE & LOGS */}
              {activeTab === 'triage' && (
                <div className="space-y-4 pt-3">
                  <div>
                    <h3 className="text-xs font-bold text-charcoal dark:text-slate-100 uppercase tracking-wider mb-1">
                      Incident Summary & Impact
                    </h3>
                    <p className="text-xs text-charcoal-muted dark:text-slate-300 leading-relaxed">
                      {selectedIncident.impactDescription}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-charcoal dark:text-slate-100 uppercase tracking-wider mb-2">
                      Reported Production Symptoms
                    </h3>
                    <ul className="space-y-1.5 text-xs text-charcoal dark:text-slate-300">
                      {selectedIncident.symptoms.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Simulated Log Stream */}
                  <div>
                    <h3 className="text-xs font-bold text-charcoal dark:text-slate-100 uppercase tracking-wider mb-2">
                      Live Telemetry Log Stream
                    </h3>
                    <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] leading-relaxed space-y-1.5 overflow-x-auto border border-slate-800">
                      {selectedIncident.mockLogs.map((log, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-slate-500">[{log.timestamp}]</span>
                          <span className={log.level === 'FATAL' ? 'text-rose-400 font-bold' : log.level === 'ERROR' ? 'text-amber-400 font-bold' : 'text-blue-400'}>
                            [{log.level}]
                          </span>
                          <span>{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button size="sm" variant="primary" className="text-xs gap-1.5" onClick={() => setActiveTab('diagnostics')}>
                      Proceed to Diagnostics <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* TAB 2: DIAGNOSTIC CHECKS */}
              {activeTab === 'diagnostics' && (
                <div className="space-y-4 pt-3">
                  <p className="text-xs text-charcoal-muted dark:text-slate-400">
                    Run safe simulated diagnostic queries to inspect target cloud configurations and identify root cause.
                  </p>

                  <div className="space-y-3">
                    {selectedIncident.diagnosticChecks.map(diag => {
                      const isRun = diagnosticOutputs[diag.id];
                      return (
                        <div key={diag.id} className="p-3 rounded-lg border border-surface-border dark:border-surface-dark-border space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-charcoal dark:text-white">
                              {diag.label}
                            </span>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-[11px] font-mono gap-1 py-1 h-7"
                              onClick={() => handleRunDiagnostic(diag.id)}
                            >
                              <Play className="w-3 h-3 text-brand-600" />
                              {isRun ? 'Re-run Command' : 'Execute Check'}
                            </Button>
                          </div>

                          <div className="p-2 rounded bg-surface-subtle dark:bg-slate-800 text-[11px] font-mono text-charcoal-muted">
                            $ {diag.command}
                          </div>

                          {isRun && (
                            <pre className="p-3 rounded bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed">
                              <code>{diag.output}</code>
                            </pre>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex justify-between">
                    <Button size="sm" variant="secondary" className="text-xs" onClick={() => setActiveTab('triage')}>
                      Back to Triage
                    </Button>
                    <Button size="sm" variant="primary" className="text-xs gap-1.5" onClick={() => setActiveTab('mitigation')}>
                      Select Mitigation Runbook <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* TAB 3: MITIGATION RUNBOOK */}
              {activeTab === 'mitigation' && (
                <div className="space-y-4 pt-3">
                  <p className="text-xs text-charcoal-muted dark:text-slate-400">
                    Evaluate operational tradeoffs and select the correct incident mitigation action.
                  </p>

                  <div className="space-y-3">
                    {selectedIncident.mitigationOptions.map(opt => {
                      const isSelected = selectedMitigationId === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedMitigationId(opt.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-brand-600 dark:border-brand-400 bg-brand-50/60 dark:bg-brand-950/40 ring-1 ring-brand-600'
                              : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-charcoal dark:text-white">
                              {opt.actionName}
                            </span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'
                            }`}>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-charcoal-muted dark:text-slate-400">
                            <strong>Tradeoff:</strong> {opt.tradeoffSummary}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {mitigationResult && !mitigationResult.success && (
                    <div className="p-3 rounded-lg bg-rose-50 text-rose-900 border border-rose-200 text-xs flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Mitigation Failed:</strong> {mitigationResult.consequence}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-between">
                    <Button size="sm" variant="secondary" className="text-xs" onClick={() => setActiveTab('diagnostics')}>
                      Back to Diagnostics
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={!selectedMitigationId || isResolving}
                      onClick={handleApplyMitigation}
                      className="text-xs gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      {isResolving ? 'Validating Action...' : 'Apply Mitigation Decision'}
                    </Button>
                  </div>
                </div>
              )}

              {/* TAB 4: POST-MORTEM REPORT */}
              {activeTab === 'postmortem' && mitigationResult?.success && (
                <div className="space-y-4 pt-3">
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <h3 className="text-sm font-bold">Incident Successfully Mitigated!</h3>
                      </div>
                      <span className="font-mono text-xs font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-300">
                        Score: {mitigationResult.score}/100
                      </span>
                    </div>
                    <p className="text-xs mt-2 leading-relaxed">
                      {mitigationResult.consequence}
                    </p>
                  </div>

                  {/* Post-Mortem Report Document */}
                  <div className="border border-surface-border dark:border-surface-dark-border rounded-xl p-4 bg-white dark:bg-surface-dark-card space-y-3 text-xs">
                    <div className="flex items-center gap-2 pb-2 border-b border-surface-border dark:border-surface-dark-border font-bold text-charcoal dark:text-white">
                      <FileText className="w-4 h-4 text-brand-600" />
                      SRE Incident Post-Mortem Document ({selectedIncident.code})
                    </div>

                    <div>
                      <span className="font-bold text-charcoal dark:text-slate-200 block mb-0.5">Root Cause Analysis:</span>
                      <p className="text-charcoal-muted dark:text-slate-400">{mitigationResult.postMortem.rootCause}</p>
                    </div>

                    <div>
                      <span className="font-bold text-charcoal dark:text-slate-200 block mb-0.5">Preventative Architecture Action Items:</span>
                      <ul className="list-disc pl-4 text-charcoal-muted dark:text-slate-400 space-y-1">
                        {mitigationResult.postMortem.preventativeMeasures.map((m: string, i: number) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-bold text-charcoal dark:text-slate-200 block mb-0.5">Key Lessons Learned:</span>
                      <p className="text-charcoal-muted dark:text-slate-400">{mitigationResult.postMortem.lessonsLearned}</p>
                    </div>
                  </div>

                  {/* Awarded Proof-of-Work Credential */}
                  {mitigationResult.credentialAwarded && (
                    <div className="p-3 rounded-lg border border-brand-200 bg-brand-50/50 dark:bg-brand-950/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-brand-600" />
                        <span>Verified Credential Issued: <strong>{mitigationResult.credentialAwarded.credentialId}</strong></span>
                      </div>
                      <Link to="/portfolio" className="text-brand-600 font-bold hover:underline">
                        View in Portfolio &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Incident Meta & SRE Checklist (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Card>
              <h3 className="text-xs font-bold text-charcoal dark:text-slate-100 uppercase tracking-wider mb-3">
                Incident Response Protocol
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-surface-border dark:border-surface-dark-border">
                  <span className="text-charcoal-muted">Severity Level</span>
                  <Badge variant={selectedIncident.severity === 'P1' ? 'danger' : 'brand'} size="sm">
                    {selectedIncident.severity}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-surface-border dark:border-surface-dark-border">
                  <span className="text-charcoal-muted">Target Resolution</span>
                  <span className="font-mono font-bold text-charcoal dark:text-white">&lt; 300 seconds</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-surface-border dark:border-surface-dark-border">
                  <span className="text-charcoal-muted">Simulated Environment</span>
                  <span className="font-mono text-brand-600 font-bold">AWS us-east-1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-muted">Incident Commander</span>
                  <span className="font-mono text-charcoal dark:text-white">Active Learner</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-xs font-bold text-charcoal dark:text-slate-100 uppercase tracking-wider mb-2">
                Quick Navigation
              </h3>
              <div className="space-y-2">
                <Link to="/terminal" className="w-full block">
                  <Button size="sm" variant="secondary" className="w-full text-xs font-mono justify-start gap-2">
                    <Terminal className="w-3.5 h-3.5" />
                    Open CLI Terminal
                  </Button>
                </Link>
                <Link to="/architecture" className="w-full block">
                  <Button size="sm" variant="secondary" className="w-full text-xs justify-start gap-2">
                    <Activity className="w-3.5 h-3.5" />
                    Inspect Topology Visualizer
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
