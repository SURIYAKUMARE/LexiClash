import React, { useState, useEffect, useRef } from 'react';
import { OfflineQuestion, IntegrityViolationLogItem } from '../../db/indexedDb';
import { ExamSecurityService, ExamSessionState } from '../../services/examSecurityService';
import { LexiClashLogo } from '../common/LexiClashLogo';
import {
  Clock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Maximize2,
  AlertTriangle,
  Flag,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
  Info,
  Check,
  FileText,
  XCircle,
  HelpCircle
} from 'lucide-react';

interface SecureExamWorkspaceProps {
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: OfflineQuestion[];
  isTimedMode?: boolean;
  initialTimeSeconds?: number;
  onSubmit: (result: {
    userSelections: Record<string, number>;
    violationsCount: number;
    violationsLog: IntegrityViolationLogItem[];
    timeSpentSeconds: number;
    integrityStatus: 'VERIFIED_CLEAN' | 'FLAGGED_REVIEW' | 'PROCTOR_WARNING';
  }) => Promise<void>;
  onCancel: () => void;
}

export const SecureExamWorkspace: React.FC<SecureExamWorkspaceProps> = ({
  topic,
  difficulty,
  questions,
  isTimedMode = true,
  initialTimeSeconds = 300,
  onSubmit,
  onCancel
}) => {
  // State from recovery session if exists, otherwise defaults
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSelections, setUserSelections] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(initialTimeSeconds);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [violations, setViolations] = useState<IntegrityViolationLogItem[]>([]);
  const [activeViolationNotice, setActiveViolationNotice] = useState<IntegrityViolationLogItem | null>(null);

  // UI Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPaletteModal, setShowPaletteModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Initialize Proctoring and Restore State
  useEffect(() => {
    // Attempt session recovery
    const saved = ExamSecurityService.loadSession();
    if (saved && saved.topic === topic && saved.difficulty === difficulty && !saved.isCompleted) {
      setCurrentIndex(saved.currentIndex || 0);
      setUserSelections(saved.userSelections || {});
      setFlaggedQuestions(saved.flaggedQuestions || []);
      setTimeLeft(saved.timeLeftSeconds || initialTimeSeconds);
      setViolations(saved.violationsLog || []);
    }

    // Enter Fullscreen & Start Monitoring
    ExamSecurityService.enterFullscreen();
    ExamSecurityService.startProctoring(saved?.violationsLog || []);
    setIsFullscreen(ExamSecurityService.isFullscreen());

    const unsubFullscreen = ExamSecurityService.onFullscreenChange((inFull) => {
      setIsFullscreen(inFull);
    });

    const unsubViolation = ExamSecurityService.onViolation((violation, totalCount) => {
      setViolations(prev => [...prev, violation]);
      setActiveViolationNotice(violation);
    });

    return () => {
      unsubFullscreen();
      unsubViolation();
      ExamSecurityService.stopProctoring();
    };
  }, [topic, difficulty, initialTimeSeconds]);

  // Save session state continuously for recovery
  useEffect(() => {
    ExamSecurityService.saveSession({
      topic,
      difficulty,
      currentIndex,
      userSelections,
      flaggedQuestions,
      timeLeftSeconds: timeLeft,
      totalTimeSeconds: initialTimeSeconds,
      violationsCount: violations.length,
      violationsLog: violations,
      startedAt: new Date(startTimeRef.current).toISOString(),
      isCompleted: false
    });
  }, [topic, difficulty, currentIndex, userSelections, flaggedQuestions, timeLeft, violations, initialTimeSeconds]);

  // Live Timer Countdown
  useEffect(() => {
    if (!isTimedMode || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimedMode, isSubmitting]);

  // Keyboard shortcut listener for fast options answering (1-4, A-D, Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSubmitModal || showAuditModal || showPolicyModal || !isFullscreen) return;

      const currentQ = questions[currentIndex];
      if (!currentQ) return;

      if (e.key === '1' || e.key === 'a' || e.key === 'A') {
        setUserSelections(prev => ({ ...prev, [currentQ.id]: 0 }));
      } else if (e.key === '2' || e.key === 'b' || e.key === 'B') {
        if (currentQ.options.length > 1) setUserSelections(prev => ({ ...prev, [currentQ.id]: 1 }));
      } else if (e.key === '3' || e.key === 'c' || e.key === 'C') {
        if (currentQ.options.length > 2) setUserSelections(prev => ({ ...prev, [currentQ.id]: 2 }));
      } else if (e.key === '4' || e.key === 'd' || e.key === 'D') {
        if (currentQ.options.length > 3) setUserSelections(prev => ({ ...prev, [currentQ.id]: 3 }));
      } else if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFlag(currentQ.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions, showSubmitModal, showAuditModal, showPolicyModal, isFullscreen]);

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev =>
      prev.includes(questionId) ? prev.filter(id => id !== questionId) : [...prev, questionId]
    );
  };

  const handleReEnterFullscreen = async () => {
    await ExamSecurityService.enterFullscreen();
    setIsFullscreen(ExamSecurityService.isFullscreen());
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    let integrityStatus: 'VERIFIED_CLEAN' | 'FLAGGED_REVIEW' | 'PROCTOR_WARNING' = 'VERIFIED_CLEAN';
    if (violations.length >= 3) {
      integrityStatus = 'FLAGGED_REVIEW';
    } else if (violations.length > 0) {
      integrityStatus = 'PROCTOR_WARNING';
    }

    try {
      await onSubmit({
        userSelections,
        violationsCount: violations.length,
        violationsLog: violations,
        timeSpentSeconds: timeSpent,
        integrityStatus
      });
      ExamSecurityService.clearSession();
      await ExamSecurityService.exitFullscreen();
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(userSelections).length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);
  const progressPercent = questions.length ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] bg-[#FAF9F6] dark:bg-slate-950 flex flex-col font-sans select-none overflow-hidden"
    >
      {/* 1. SECURE PROCTORED TOP BAR */}
      <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs">
        {/* Left: Brand & Exam Status */}
        <div className="flex items-center gap-3">
          <LexiClashLogo size="xs" showText={true} />
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white capitalize">
              {topic} ({difficulty})
            </span>
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>FULL-SCREEN PROCTORED</span>
            </div>
          </div>
        </div>

        {/* Center: Live Countdown Clock */}
        {isTimedMode && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold border transition-colors ${
              timeLeft < 60
                ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-200'
                : 'bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Right: Actions, Violations & Submit */}
        <div className="flex items-center gap-2">
          {/* Violations Pill */}
          <button
            type="button"
            onClick={() => setShowAuditModal(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
              violations.length === 0
                ? 'bg-emerald-50/60 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : violations.length < 3
                ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 animate-pulse'
                : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
            }`}
            title="View Proctored Audit Trail"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Violations: {violations.length}/3</span>
          </button>

          {/* Question Palette Trigger */}
          <button
            type="button"
            onClick={() => setShowPaletteModal(true)}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Palette ({answeredCount}/{questions.length})</span>
          </button>

          {/* Security Policy & Boundaries Dialog Button */}
          <button
            type="button"
            onClick={() => setShowPolicyModal(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Integrity Rules & Honest Technical Boundaries"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Finish & Submit Button */}
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0F5C7A] hover:bg-[#0c4a63] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Finish Exam</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Progress Strip */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1">
        <div
          className="h-full bg-[#0F5C7A] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 2. MAIN EXAMINATION VIEWPORT */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 flex justify-center items-start">
        <div className="w-full max-w-3xl space-y-6">
          {/* Question Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-mono text-xs font-bold">
                  Q{currentIndex + 1}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {currentQ?.subtopic || 'Technical Invariants'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => currentQ && toggleFlag(currentQ.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    currentQ && flaggedQuestions.includes(currentQ.id)
                      ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${currentQ && flaggedQuestions.includes(currentQ.id) ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span>{currentQ && flaggedQuestions.includes(currentQ.id) ? 'Flagged' : 'Flag for Review'}</span>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {currentQ?.question}
              </h2>

              {currentQ?.codeSnippet && (
                <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-xl border border-slate-800 overflow-x-auto leading-relaxed shadow-inner">
                  <pre>{currentQ.codeSnippet}</pre>
                </div>
              )}
            </div>

            {/* Options Radio List */}
            <div className="space-y-3 pt-2">
              {currentQ?.options.map((optionText, optIdx) => {
                const isSelected = userSelections[currentQ.id] === optIdx;
                const letter = String.fromCharCode(65 + optIdx);

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => setUserSelections(prev => ({ ...prev, [currentQ.id]: optIdx }))}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-[#0070F3] bg-blue-50/60 dark:bg-blue-950/40 text-slate-900 dark:text-white font-medium shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 border transition-colors ${
                        isSelected
                          ? 'bg-[#0070F3] border-[#0070F3] text-white'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-xs sm:text-sm leading-relaxed flex-1 pt-0.5">
                      {optionText}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* 3. BOTTOM CONTROL BAR */}
      <footer className="h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentQ && userSelections[currentQ.id] !== undefined && (
            <button
              type="button"
              onClick={() => {
                const next = { ...userSelections };
                delete next[currentQ.id];
                setUserSelections(next);
              }}
              className="text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline px-2 transition-colors"
            >
              Clear Choice
            </button>
          )}
        </div>

        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:block">
          Question {currentIndex + 1} of {questions.length} • {answeredCount} Answered
        </div>

        <div className="flex items-center gap-2">
          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex(prev => prev + 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F5C7A] hover:bg-[#0c4a63] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Review & Submit</span>
            </button>
          )}
        </div>
      </footer>

      {/* 4. INESCAPABLE FULLSCREEN LOCKOUT OVERLAY */}
      {!isFullscreen && (
        <div className="fixed inset-0 z-[100000] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border-2 border-rose-500 p-6 sm:p-8 text-center space-y-5 shadow-2xl animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 mx-auto">
              <Maximize2 className="w-7 h-7 animate-bounce" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Security Policy Enforcement
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Full-Screen Mode Required
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                You have exited the designated full-screen examination workspace. This event has been logged to your proctored audit record.
              </p>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-left text-xs space-y-1">
              <span className="font-bold text-amber-900 dark:text-amber-200 block">
                Total Infractions Recorded: {violations.length} of 3
              </span>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                {violations.length >= 3
                  ? 'Policy threshold exceeded: Assessment flagged for instructor proctor review.'
                  : 'Exceeding 3 infractions will mark your examination for manual instructor review.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleReEnterFullscreen}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-[#0070F3] hover:bg-blue-600 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
              Re-enter Full Screen & Resume Exam
            </button>
          </div>
        </div>
      )}

      {/* 5. VIOLATION ESCALATION NOTICE MODAL */}
      {activeViolationNotice && isFullscreen && (
        <div className="fixed top-16 right-4 z-[99999] max-w-sm w-full bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-400 p-4 shadow-xl animate-fade-in space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="font-bold text-xs uppercase tracking-wider">
                Integrity Notice ({violations.length}/3)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveViolationNotice(null)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {activeViolationNotice.description}
          </p>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="font-mono text-slate-400">
              {new Date(activeViolationNotice.timestamp).toLocaleTimeString()}
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveViolationNotice(null);
                setShowAuditModal(true);
              }}
              className="font-bold text-[#0070F3] hover:underline"
            >
              View Audit Log →
            </button>
          </div>
        </div>
      )}

      {/* 6. QUESTION PALETTE MODAL */}
      {showPaletteModal && (
        <div className="fixed inset-0 z-[100000] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Question Palette
              </h3>
              <button
                type="button"
                onClick={() => setShowPaletteModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2.5 max-h-64 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isAnswered = userSelections[q.id] !== undefined;
                const isFlagged = flaggedQuestions.includes(q.id);
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowPaletteModal(false);
                    }}
                    className={`h-11 rounded-xl text-xs font-mono font-bold flex flex-col items-center justify-center relative border transition-all ${
                      isCurrent
                        ? 'border-[#0070F3] ring-2 ring-blue-500/30'
                        : 'border-slate-200 dark:border-slate-700'
                    } ${
                      isAnswered
                        ? 'bg-[#0070F3] text-white border-[#0070F3]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1.5 right-1.5" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#0070F3]" /> Answered ({answeredCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700" /> Pending ({unansweredCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Flagged ({flaggedQuestions.length})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 7. AUDIT TRAIL LOG MODAL */}
      {showAuditModal && (
        <div className="fixed inset-0 z-[100000] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  Examination Integrity Audit Transcript
                </h3>
                <span className="text-[11px] text-slate-500">
                  {violations.length} total integrity boundary events logged
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800">
              {violations.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                  <span>Clean Integrity Transcript. Zero violations recorded.</span>
                </div>
              ) : (
                violations.map(viol => (
                  <div key={viol.id} className="pt-2 text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-[11px]">
                        {viol.type}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {new Date(viol.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      {viol.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. HONEST SECURITY BOUNDARIES DISCLOSURE MODAL */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-[100000] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Examination Security & Honest Technical Boundaries
              </h3>
              <button
                type="button"
                onClick={() => setShowPolicyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
              <p>
                SkillPath AI enforces strict in-browser examination boundaries using the <strong>HTML5 Fullscreen API</strong>, <strong>Page Visibility API</strong>, and <strong>Window Focus Detection</strong>.
              </p>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-slate-200 block text-[11px]">
                  What the Browser Proctor Detects:
                </span>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>Exiting full-screen mode</li>
                  <li>Switching tabs or minimizing the browser</li>
                  <li>Clicking outside the window or opening dev tools</li>
                  <li>Unintentional page refresh or navigation</li>
                </ul>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl space-y-1.5 border border-amber-200 dark:border-amber-800">
                <span className="font-bold text-amber-900 dark:text-amber-200 block text-[11px]">
                  Honest Technical Limitations:
                </span>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  Standard web applications cannot prevent physical mobile phones, secondary computers, or OS hardware capture. For formal high-stakes certification, institutions should mandate supported OS kiosk environments (e.g. Safe Exam Browser).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPolicyModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* 9. CONFIRM SUBMISSION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[100000] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 shadow-2xl animate-fade-in">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Confirm Examination Submission
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Please review your progress before completing this session. Once submitted, your score will be calculated and verified.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Total</span>
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">{questions.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] font-mono text-emerald-600 uppercase block">Answered</span>
                <span className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300">{answeredCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <span className="text-[10px] font-mono text-amber-600 uppercase block">Pending</span>
                <span className="text-lg font-bold font-mono text-amber-700 dark:text-amber-300">{unansweredCount}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>You have <strong>{unansweredCount} unanswered questions</strong>. Unanswered questions will receive 0 points.</span>
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Keep Reviewing
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
              >
                {isSubmitting ? 'Evaluating...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
