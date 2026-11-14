import React, { useState, useEffect } from 'react';
import { AgentOrchestrator } from '../../agents/orchestrator';
import { AgentReasoningTrace } from '../../agents/types';
import { useAuth } from '../../context/AuthContext';
import {
  BrainCircuit,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowDown,
  RefreshCw,
  Terminal,
  Activity
} from 'lucide-react';

export const AgentTraceDrawer: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [traces, setTraces] = useState<AgentReasoningTrace[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const unsubscribe = AgentOrchestrator.subscribe(newTraces => {
      setTraces(newTraces);
    });
    return unsubscribe;
  }, []);

  const handleRunFullCycle = async () => {
    if (!user) return;
    setIsRunning(true);
    try {
      await AgentOrchestrator.runFullOrchestration(user.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const getAgentColor = (name: string) => {
    if (name.includes('Profiler')) return 'text-brand-600 bg-brand-50 border-brand-200 dark:bg-brand-950/50 dark:border-brand-900 dark:text-brand-300';
    if (name.includes('Career')) return 'text-stitch-blue bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-900 dark:text-blue-300';
    if (name.includes('Curriculum')) return 'text-forest bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-900 dark:text-green-300';
    return 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-900 dark:text-amber-300';
  };

  return (
    <>
      {/* Floating Tactical Pill Button to open trace drawer */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-charcoal text-white dark:bg-surface-dark dark:text-slate-100 border border-slate-700 shadow-float hover:bg-black transition-all text-xs font-mono select-none"
        title="Open Multi-Agent Reasoning Trace"
      >
        <Activity className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
        <span className="font-semibold">Agent Trace ({traces.length})</span>
      </button>

      {/* Slide-over Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-charcoal/40 backdrop-blur-xs z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-over Drawer Panel */}
      <div
        className={`fixed inset-y-0 right-0 max-w-md w-full bg-white dark:bg-surface-dark border-l border-surface-border dark:border-surface-dark-border z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-surface-border dark:border-surface-dark-border flex items-center justify-between bg-surface-subtle dark:bg-surface-dark-subtle">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <div>
              <h2 className="text-sm font-bold text-charcoal dark:text-slate-100 font-sans">
                Agent Reasoning Trace
              </h2>
              <p className="text-[10px] text-charcoal-subtle dark:text-slate-400 font-mono">
                4-Agent Collaboration Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleRunFullCycle}
              disabled={isRunning}
              className="p-1.5 rounded text-charcoal-muted dark:text-slate-300 hover:text-charcoal hover:bg-surface-muted dark:hover:bg-slate-800 text-xs"
              title="Trigger Full Orchestration Cycle"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin text-brand-600' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded text-charcoal-subtle hover:text-charcoal dark:text-slate-400 hover:bg-surface-muted dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Trace Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
          {traces.length === 0 ? (
            <div className="py-16 text-center text-charcoal-subtle dark:text-slate-500 space-y-2">
              <Terminal className="w-8 h-8 mx-auto opacity-40" />
              <p className="font-sans text-xs">No active agent reasoning traces logged yet.</p>
              <button
                type="button"
                onClick={handleRunFullCycle}
                className="mt-2 text-xs text-brand-600 dark:text-brand-400 hover:underline font-sans font-semibold"
              >
                Execute Orchestration Cycle →
              </button>
            </div>
          ) : (
            traces.map((trace, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-surface-border dark:border-surface-dark-border bg-surface-subtle dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getAgentColor(trace.agentName)}`}>
                    {trace.agentName}
                  </span>
                  <span className="text-[10px] text-charcoal-subtle dark:text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(trace.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-charcoal-subtle dark:text-slate-400 block tracking-wider">
                    Thought:
                  </span>
                  <p className="text-charcoal dark:text-slate-200 leading-relaxed font-sans text-xs">
                    {trace.thought}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-1 text-[11px] pt-1 border-t border-surface-border dark:border-surface-dark-border">
                  <div className="text-charcoal-subtle dark:text-slate-400 truncate">
                    <strong className="text-charcoal dark:text-slate-200">Action: </strong>
                    <span className="text-brand-700 dark:text-brand-300 font-semibold">{trace.action}</span>
                  </div>
                  <div className="text-charcoal-muted dark:text-slate-300 font-sans text-[11px] leading-snug">
                    <strong className="text-charcoal dark:text-slate-200 font-mono">Observation: </strong>
                    {trace.observation}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-surface-border dark:border-surface-dark-border bg-surface-subtle dark:bg-surface-dark-subtle text-[11px] text-charcoal-subtle dark:text-slate-400 flex items-center justify-between">
          <span>Engine: Local Deterministic / Fallback</span>
          <span className="text-status-success font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success" /> 4 Agents Active
          </span>
        </div>
      </div>
    </>
  );
};
