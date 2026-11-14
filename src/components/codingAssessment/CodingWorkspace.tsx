import React, { useState } from 'react';
import { SEED_CODING_CHALLENGES } from '../../codingAssessment/seedChallenges';
import { CodingChallenge, CodeExecutionSummary } from '../../codingAssessment/types';
import { CodeRunner } from '../../codingAssessment/codeRunner';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Code2,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Terminal,
  Award,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Clock,
  Layers,
  AlertCircle
} from 'lucide-react';

export const CodingWorkspace: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [selectedLang, setSelectedLang] = useState<'all' | 'javascript' | 'python' | 'sql'>('all');
  const [activeChallenge, setActiveChallenge] = useState<CodingChallenge>(SEED_CODING_CHALLENGES[0]);
  const [code, setCode] = useState<string>(SEED_CODING_CHALLENGES[0].starterCode);
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<CodeExecutionSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'console'>('tests');

  const filteredChallenges = selectedLang === 'all'
    ? SEED_CODING_CHALLENGES
    : SEED_CODING_CHALLENGES.filter(c => c.language === selectedLang);

  const handleSelectChallenge = (ch: CodingChallenge) => {
    setActiveChallenge(ch);
    setCode(ch.starterCode);
    setExecutionResult(null);
  };

  const handleResetCode = () => {
    setCode(activeChallenge.starterCode);
    setExecutionResult(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const result = await CodeRunner.runChallenge(
        activeChallenge,
        code,
        user?.id || 'demo-user'
      );
      setExecutionResult(result);
      if (result.competencyUpdated) {
        await refreshProfile();
      }
    } catch (err) {
      console.error('Execution error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Language Filters & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Deterministic In-Browser Runner v3.0
            </span>
            <span className="text-xs text-charcoal-subtle dark:text-slate-400 font-mono">
              Safe Sandboxed Execution
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-charcoal dark:text-slate-100 tracking-tight">
            Real Coding Assessment Engine
          </h2>
          <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
            Demonstrate verified runtime competency in Python, SQL, and JavaScript against hidden test suites.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 bg-surface-subtle dark:bg-slate-800/80 p-1 rounded-xl border border-surface-border dark:border-surface-dark-border text-xs font-semibold">
          {(['all', 'javascript', 'python', 'sql'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                selectedLang === lang
                  ? 'bg-white dark:bg-surface-dark text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge Carousel / List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredChallenges.map(ch => {
          const isSelected = ch.id === activeChallenge.id;
          return (
            <div
              key={ch.id}
              onClick={() => handleSelectChallenge(ch)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-brand-600 bg-brand-50/20 dark:bg-brand-950/20 ring-1 ring-brand-600'
                  : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal-subtle dark:text-slate-400">
                  {ch.language} &bull; {ch.difficulty}
                </span>
                <Badge variant={ch.difficulty === 'advanced' ? 'danger' : ch.difficulty === 'intermediate' ? 'warning' : 'neutral'} size="sm">
                  Target L{ch.targetLevel}
                </Badge>
              </div>
              <h3 className="text-xs font-bold text-charcoal dark:text-white leading-snug line-clamp-1">
                {ch.title}
              </h3>
              <p className="text-[11px] text-charcoal-muted dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {ch.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Verified Competency Update Alert Banner */}
      {executionResult?.competencyUpdated && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Competency Fingerprint Verified!
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                {executionResult.competencyUpdated.skillName} increased to Level {executionResult.competencyUpdated.newLevel} (100% verified test suite completion recorded in IndexedDB).
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-200/60 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
            PASSED 100%
          </span>
        </div>
      )}

      {/* Main Split-Pane Coding Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Pane (5 Cols): Problem Statement & Instructions */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-surface-border dark:border-surface-dark-border">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-slate-800 text-charcoal dark:text-slate-200">
                    {activeChallenge.language}
                  </span>
                  <span className="text-xs font-semibold text-charcoal dark:text-slate-300">
                    {activeChallenge.category}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-charcoal-subtle">
                  {activeChallenge.testCases.length} Test Cases
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-charcoal dark:text-white mb-1.5">
                  {activeChallenge.title}
                </h3>
                <p className="text-xs text-charcoal-muted dark:text-slate-400 leading-relaxed">
                  {activeChallenge.description}
                </p>
              </div>

              {/* Instructions */}
              <div>
                <span className="text-[11px] font-bold text-charcoal dark:text-slate-200 uppercase tracking-wider block mb-2">
                  Evaluation Requirements
                </span>
                <ul className="space-y-1.5 text-xs text-charcoal-muted dark:text-slate-400">
                  {activeChallenge.instructions.map((inst, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visible Sample Test Case Preview */}
              <div>
                <span className="text-[11px] font-bold text-charcoal dark:text-slate-200 uppercase tracking-wider block mb-2">
                  Sample Test Case 1
                </span>
                <div className="p-2.5 rounded-lg bg-surface-subtle dark:bg-slate-900 border border-surface-border dark:border-surface-dark-border font-mono text-[11px] space-y-1">
                  <div className="text-charcoal-muted dark:text-slate-400">
                    <span className="text-charcoal-subtle">Input:</span>{' '}
                    {JSON.stringify(activeChallenge.testCases[0].input)}
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="text-charcoal-subtle">Expected:</span>{' '}
                    {JSON.stringify(activeChallenge.testCases[0].expectedOutput)}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-border dark:border-surface-dark-border text-[11px] text-charcoal-subtle dark:text-slate-400 flex items-center justify-between">
              <span>Skill Affected: <strong>{activeChallenge.skillAffected}</strong></span>
              <span>Target: <strong>Level {activeChallenge.targetLevel} / 5</strong></span>
            </div>
          </Card>
        </div>

        {/* Right Pane (7 Cols): Code Editor & Execution Results */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="flex flex-col space-y-3">
            {/* Editor Action Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-surface-border dark:border-surface-dark-border">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span className="text-xs font-bold text-charcoal dark:text-slate-200">
                  Source Code Editor
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-charcoal-muted">
                  UTF-8
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetCode}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-charcoal dark:text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3 text-charcoal-muted" />
                  Reset
                </button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="text-xs gap-1.5 shadow-sm"
                >
                  {isRunning ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Run &amp; Verify Tests
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Code Input Area */}
            <div className="relative rounded-xl overflow-hidden border border-surface-border dark:border-surface-dark-border bg-[#1A1C1E] text-slate-100">
              <div className="px-3 py-1.5 bg-[#121314] text-[10px] font-mono text-slate-400 border-b border-slate-800 flex justify-between">
                <span>solution.{activeChallenge.language === 'python' ? 'py' : activeChallenge.language === 'sql' ? 'sql' : 'js'}</span>
                <span>Press "Run &amp; Verify Tests" to execute against hidden suites</span>
              </div>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                rows={12}
                className="w-full p-3 font-mono text-xs bg-transparent text-emerald-400 focus:outline-none resize-none selection:bg-brand-900"
                spellCheck={false}
              />
            </div>

            {/* Test Results & Console Output Sub-tabs */}
            <div className="pt-2">
              <div className="flex items-center justify-between border-b border-surface-border dark:border-surface-dark-border pb-1.5 text-xs font-semibold">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('tests')}
                    className={`pb-1 transition-all ${
                      activeTab === 'tests'
                        ? 'border-b-2 border-brand-600 text-brand-600 dark:text-brand-400'
                        : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal'
                    }`}
                  >
                    Test Suite Results {executionResult && `(${executionResult.passedTests}/${executionResult.totalTests})`}
                  </button>
                  <button
                    onClick={() => setActiveTab('console')}
                    className={`pb-1 transition-all ${
                      activeTab === 'console'
                        ? 'border-b-2 border-brand-600 text-brand-600 dark:text-brand-400'
                        : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal'
                    }`}
                  >
                    Console Output {executionResult?.logs && `(${executionResult.logs.length})`}
                  </button>
                </div>

                {executionResult && (
                  <span className="text-[11px] font-mono text-charcoal-muted">
                    Execution: {executionResult.executionTimeMs}ms
                  </span>
                )}
              </div>

              {/* Tab 1: Test Results */}
              {activeTab === 'tests' && (
                <div className="mt-3 space-y-2">
                  {!executionResult && (
                    <div className="p-4 rounded-xl border border-dashed border-surface-border dark:border-surface-dark-border text-center text-xs text-charcoal-muted dark:text-slate-400">
                      Click <strong>"Run &amp; Verify Tests"</strong> to run your solution against the visible and hidden test suites.
                    </div>
                  )}

                  {executionResult?.runtimeError && (
                    <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-mono flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{executionResult.runtimeError}</span>
                    </div>
                  )}

                  {executionResult?.results.map((r, i) => (
                    <div
                      key={r.testCaseId || i}
                      className={`p-3 rounded-xl border text-xs font-mono transition-all ${
                        r.passed
                          ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                          : 'border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 font-sans font-semibold">
                          {r.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          <span>
                            Case #{i + 1}: {r.description}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                          {r.isHidden && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              Hidden Test
                            </span>
                          )}
                          <span className="text-charcoal-subtle">{r.executionTimeMs}ms</span>
                        </div>
                      </div>

                      {/* Diff view for failed tests */}
                      {!r.passed && (
                        <div className="mt-2 space-y-1 text-[11px] bg-white dark:bg-slate-900 p-2 rounded border border-rose-200 dark:border-rose-900">
                          <div>
                            <span className="text-charcoal-subtle">Expected:</span>{' '}
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {JSON.stringify(r.expectedOutput)}
                            </span>
                          </div>
                          <div>
                            <span className="text-charcoal-subtle">Actual:</span>{' '}
                            <span className="text-rose-600 dark:text-rose-400 font-bold">
                              {r.actualOutput === undefined ? 'undefined' : JSON.stringify(r.actualOutput)}
                            </span>
                          </div>
                          {r.error && (
                            <div className="text-rose-600 font-bold">Error: {r.error}</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Console Logs */}
              {activeTab === 'console' && (
                <div className="mt-3 p-3 rounded-xl bg-[#1A1C1E] text-slate-200 font-mono text-xs min-h-[100px] max-h-48 overflow-y-auto space-y-1">
                  {executionResult?.logs && executionResult.logs.length > 0 ? (
                    executionResult.logs.map((log, i) => (
                      <div key={i} className="text-slate-300">
                        &gt; {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 italic">No console logs captured.</div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
