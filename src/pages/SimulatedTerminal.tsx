import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { TerminalQuest } from '../db/seedData';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Terminal as TerminalIcon,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
}

export const SimulatedTerminal: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'system',
      content: 'SkillPath Safe Educational Cloud Terminal (v2.4 - Ubuntu 24.04 LTS / AWS CLI 2.15)'
    },
    {
      id: 'init-2',
      type: 'system',
      content: 'Type "help" to see available commands or click a quest below to load hints.'
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [quests, setQuests] = useState<(TerminalQuest & { completed: boolean })[]>([]);
  const [unlockedQuestBanner, setUnlockedQuestBanner] = useState<TerminalQuest | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchQuests = async () => {
    const res = await api.getTerminalQuests();
    setQuests(res.quests);
  };

  useEffect(() => {
    fetchQuests();
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = currentInput;
      if (!cmd.trim()) return;

      // Add to history
      setHistory(prev => [cmd, ...prev]);
      setHistoryIndex(-1);
      setCurrentInput('');

      // Add input line
      const inputLine: TerminalLine = {
        id: `in-${Date.now()}`,
        type: 'input',
        content: cmd
      };

      setLines(prev => [...prev, inputLine]);

      // Execute command
      try {
        const res = await api.executeTerminalCommand(cmd);

        if (res.output === '__CLEAR__') {
          setLines([]);
          return;
        }

        const outLine: TerminalLine = {
          id: `out-${Date.now()}`,
          type: res.isError ? 'error' : 'output',
          content: res.output
        };

        setLines(prev => [...prev, outLine]);

        if (res.questUnlocked) {
          setUnlockedQuestBanner(res.questUnlocked);
          fetchQuests();
        }
      } catch (err: any) {
        setLines(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            type: 'error',
            content: `Execution error: ${err.message || 'Failed to process command'}`
          }
        ]);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setCurrentInput(history[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setCurrentInput(history[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    }
  };

  const handleLoadQuestHint = (q: TerminalQuest) => {
    setCurrentInput(q.targetCommandPattern);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              Interactive CLI Engine
            </span>
            <span className="text-xs text-charcoal-subtle dark:text-slate-400">Controlled Educational Sandbox</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal dark:text-slate-100 tracking-tight">
            Simulated Cloud & Systems Terminal
          </h1>
          <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
            Practice AWS CLI syntax, Linux systems administration, and Git workflows in a safe interactive sandbox.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/cloud-console">
            <Button size="sm" variant="secondary" className="text-xs">
              Open Cloud Console
            </Button>
          </Link>
          <Link to="/war-room">
            <Button size="sm" variant="primary" className="text-xs">
              Incident War Room
            </Button>
          </Link>
        </div>
      </div>

      {/* Quest Completed Toast Banner */}
      {unlockedQuestBanner && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3.5 rounded-xl flex items-center justify-between text-xs text-emerald-950 dark:text-emerald-200 shadow-sm animate-bounce">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong>Quest Unlocked: {unlockedQuestBanner.title}!</strong>
              <span className="block text-[11px] text-emerald-800 dark:text-emerald-300">
                +{unlockedQuestBanner.xpReward} XP awarded to your practical verified portfolio.
              </span>
            </div>
          </div>
          <button
            onClick={() => setUnlockedQuestBanner(null)}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Terminal & Quests Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Terminal Screen (8 Cols) */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="lg:col-span-8 bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-md flex flex-col h-[520px] font-mono text-xs cursor-text"
        >
          {/* Terminal Title Bar */}
          <div className="bg-[#1E293B] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 select-none">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="font-semibold text-slate-200 ml-2">devops-lead@skillpath-sandbox: ~</span>
            </div>
            <span className="text-[10px] text-slate-500">bash 5.2.15</span>
          </div>

          {/* Terminal Output Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 leading-relaxed">
            {lines.map(line => {
              if (line.type === 'system') {
                return (
                  <div key={line.id} className="text-slate-400 text-[11px]">
                    # {line.content}
                  </div>
                );
              }
              if (line.type === 'input') {
                return (
                  <div key={line.id} className="flex gap-2 text-slate-100">
                    <span className="text-emerald-400 select-none">devops-lead@cloud:~$</span>
                    <span className="font-semibold">{line.content}</span>
                  </div>
                );
              }
              if (line.type === 'error') {
                return (
                  <div key={line.id} className="text-rose-400 whitespace-pre-wrap pl-4 border-l-2 border-rose-500">
                    {line.content}
                  </div>
                );
              }
              return (
                <div key={line.id} className="text-slate-200 whitespace-pre-wrap pl-4 border-l-2 border-slate-700">
                  {line.content}
                </div>
              );
            })}

            {/* Active Input Line */}
            <div className="flex items-center gap-2 text-slate-100 pt-1">
              <span className="text-emerald-400 select-none shrink-0">devops-lead@cloud:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={e => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-hidden text-slate-100 font-mono text-xs focus:ring-0 p-0 m-0"
                autoFocus
                placeholder="type 'help' or an AWS CLI command..."
              />
            </div>
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* Quests & Challenges Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <div className="flex items-center justify-between pb-3 border-b border-surface-border dark:border-surface-dark-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-bold text-charcoal dark:text-slate-100 uppercase tracking-wider">
                  Terminal Quests
                </h3>
              </div>
              <span className="text-[11px] font-mono text-charcoal-subtle">
                {quests.filter(q => q.completed).length} of {quests.length} Done
              </span>
            </div>

            <div className="space-y-3 pt-3">
              {quests.map(quest => (
                <div
                  key={quest.id}
                  onClick={() => handleLoadQuestHint(quest)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    quest.completed
                      ? 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-surface-border dark:border-surface-dark-border hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-charcoal dark:text-white truncate">
                      {quest.title}
                    </span>
                    {quest.completed ? (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Done
                      </span>
                    ) : (
                      <Badge variant="brand" size="sm">
                        +{quest.xpReward} XP
                      </Badge>
                    )}
                  </div>

                  <p className="text-[11px] text-charcoal-muted dark:text-slate-400 leading-relaxed mb-2">
                    {quest.description}
                  </p>

                  <div className="font-mono text-[10px] text-brand-600 dark:text-brand-400 bg-surface-subtle dark:bg-slate-800 p-1.5 rounded flex items-center justify-between">
                    <span>{quest.hint}</span>
                    <span className="text-[9px] text-charcoal-subtle">Click to load</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
