import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { OfflineQuestion, OfflineAssessmentAttempt } from '../db/indexedDb';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  Check,
  History,
  Code2,
  Terminal,
  Layers,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Maximize2,
  FileCheck2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CodingWorkspace } from '../components/codingAssessment/CodingWorkspace';
import { SecureExamWorkspace } from '../components/assessment/SecureExamWorkspace';
import { ExamSecurityService } from '../services/examSecurityService';
import { IntegrityViolationLogItem } from '../db/indexedDb';

export const Assessments: React.FC = () => {
  const { refreshProfile } = useAuth();

  const [topics] = useState([
    'JavaScript',
    'React',
    'Node.js',
    'PostgreSQL',
    'Docker'
  ]);

  const [selectedTopic, setSelectedTopic] = useState('JavaScript');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isTimedMode, setIsTimedMode] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  // Running State
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [questions, setQuestions] = useState<OfflineQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSelections, setUserSelections] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result State
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);

  // History State
  const [history, setHistory] = useState<OfflineAssessmentAttempt[]>([]);
  const [activeTab, setActiveTab] = useState<'coding' | 'assess' | 'history'>('coding');

  const loadHistory = async () => {
    try {
      const data = await api.getAssessmentHistory();
      setHistory(data.history || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Timer Countdown Effect
  useEffect(() => {
    let timer: any;
    if (isQuizActive && isTimedMode && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isQuizActive, isTimedMode, timeLeft]);

  const handleStartQuiz = async () => {
    try {
      const data = await api.getQuestions({ topic: selectedTopic, difficulty: selectedDifficulty });
      if (!data.questions || data.questions.length === 0) {
        alert('No questions found for this topic and difficulty.');
        return;
      }
      setQuestions(data.questions);
      setCurrentIndex(0);
      setUserSelections({});
      setDiagnosisResult(null);
      setTimeLeft(300);
      setIsQuizActive(true);
    } catch (err: any) {
      alert(err?.message || 'Failed to load assessment.');
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setUserSelections(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSecureSubmit = async (result: {
    userSelections: Record<string, number>;
    violationsCount: number;
    violationsLog: IntegrityViolationLogItem[];
    timeSpentSeconds: number;
    integrityStatus: 'VERIFIED_CLEAN' | 'FLAGGED_REVIEW' | 'PROCTOR_WARNING';
  }) => {
    setIsSubmitting(true);
    const answersPayload = questions.map(q => ({
      questionId: q.id,
      selectedOption: result.userSelections[q.id] !== undefined ? result.userSelections[q.id] : 0
    }));

    try {
      const res = await api.submitAssessment({
        topic: selectedTopic,
        difficulty: selectedDifficulty,
        userAnswers: answersPayload,
        integrityStatus: result.integrityStatus,
        violationsCount: result.violationsCount,
        violationsLog: result.violationsLog,
        timeSpentSeconds: result.timeSpentSeconds
      });

      setDiagnosisResult(res);
      setIsQuizActive(false);
      await refreshProfile();
      await loadHistory();
    } catch (err: any) {
      alert(err?.message || 'Error evaluating assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAssessment = async () => {
    setIsSubmitting(true);
    const answersPayload = questions.map(q => ({
      questionId: q.id,
      selectedOption: userSelections[q.id] !== undefined ? userSelections[q.id] : 0
    }));

    try {
      const res = await api.submitAssessment({
        topic: selectedTopic,
        difficulty: selectedDifficulty,
        userAnswers: answersPayload
      });

      setDiagnosisResult(res);
      setIsQuizActive(false);
      await refreshProfile();
      await loadHistory();
    } catch (err: any) {
      alert(err?.message || 'Error evaluating assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentIndex];
  const progressPercent = questions.length ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
        <div>
          <h1 className="text-2xl font-bold text-charcoal dark:text-slate-100 tracking-tight font-sans">
            Adaptive Assessment & Practical Sandbox
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-1">
            Role-specific scenario diagnostics. Scores automatically feed into your verified competency badge and trigger remedial re-routing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'coding' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setActiveTab('coding');
              setIsQuizActive(false);
              setDiagnosisResult(null);
            }}
            leftIcon={<Code2 className="w-3.5 h-3.5" />}
          >
            Coding Engine
          </Button>
          <Button
            variant={activeTab === 'assess' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setActiveTab('assess');
              setIsQuizActive(false);
              setDiagnosisResult(null);
            }}
          >
            MCQ Quiz
          </Button>
          <Button
            variant={activeTab === 'history' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setActiveTab('history');
              setIsQuizActive(false);
              setDiagnosisResult(null);
            }}
            leftIcon={<History className="w-3.5 h-3.5" />}
          >
            Attempts ({history.length})
          </Button>
        </div>
      </div>

      {/* VIEW 0: REAL CODING ENGINE */}
      {activeTab === 'coding' && (
        <CodingWorkspace />
      )}

      {/* VIEW 1: HISTORY */}
      {activeTab === 'history' && (
        <Card className="space-y-4">
          <div className="pb-3 border-b border-surface-border dark:border-surface-dark-border">
            <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">
              Verified Diagnostic Performance History
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Telemetry records of passed credentials and identified weak subtopics.
            </p>
          </div>

          {history.length === 0 ? (
            <p className="py-12 text-center text-xs text-charcoal-subtle">No previous attempts recorded.</p>
          ) : (
            <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
              {history.map(att => (
                <div key={att.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-charcoal dark:text-slate-100 text-sm font-sans">{att.topic}</span>
                      <span className="text-[10px] font-mono uppercase text-charcoal-subtle dark:text-slate-400 bg-surface-subtle dark:bg-slate-800 px-1.5 py-0.2 rounded border border-surface-border dark:border-surface-dark-border">
                        {att.difficulty}
                      </span>
                      {att.passed ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-status-success-bg text-status-success border border-emerald-200">
                          Verified Mastery
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Remedial Triggered
                        </span>
                      )}
                      {att.integrityStatus === 'VERIFIED_CLEAN' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Clean Proctored
                        </span>
                      ) : att.violationsCount && att.violationsCount > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-amber-600" /> Flagged ({att.violationsCount} infractions)
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-charcoal-muted dark:text-slate-400 max-w-lg">
                      {att.feedback}
                    </p>
                    <span className="text-[10px] text-charcoal-subtle dark:text-slate-500 font-mono block">
                      {new Date(att.completedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-2xl font-extrabold text-charcoal dark:text-slate-100 font-mono block">
                      {att.scorePercentage}%
                    </span>
                    <span className="text-[11px] text-charcoal-subtle font-mono">
                      {att.correctAnswers} / {att.totalQuestions} Correct
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* VIEW 2: ACTIVE QUIZ */}
      {/* VIEW 2: SECURE FULL-SCREEN PROCTORED EXAMINATION */}
      {activeTab === 'assess' && isQuizActive && (
        <SecureExamWorkspace
          topic={selectedTopic}
          difficulty={selectedDifficulty}
          questions={questions}
          isTimedMode={isTimedMode}
          initialTimeSeconds={300}
          onSubmit={handleSecureSubmit}
          onCancel={() => {
            setIsQuizActive(false);
            ExamSecurityService.clearSession();
            ExamSecurityService.stopProctoring();
          }}
        />
      )}

      {/* VIEW 3: DIAGNOSTIC REPORT RESULT */}
      {activeTab === 'assess' && !isQuizActive && diagnosisResult && (
        <Card className="space-y-6 border-l-4 border-l-stitch-blue">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-subtle dark:text-slate-400">
                Diagnostic Evaluation Report
              </span>
              <h2 className="text-xl font-bold text-charcoal dark:text-slate-100 mt-1 font-sans">
                {diagnosisResult.attempt.topic} Skill Verification Check
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-3xl font-extrabold text-charcoal dark:text-slate-100 font-mono block">
                  {diagnosisResult.attempt.scorePercentage}%
                </span>
                <span className="text-[11px] text-charcoal-subtle font-mono">
                  {diagnosisResult.attempt.correctAnswers} / {diagnosisResult.attempt.totalQuestions} Correct
                </span>
              </div>
              {diagnosisResult.attempt.passed ? (
                <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-status-success-bg text-status-success border border-emerald-200">
                  Verified Mastery
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Remedial Injected
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-charcoal dark:text-slate-200 uppercase tracking-wider block">
              Evaluator Feedback:
            </span>
            <p className="text-xs text-charcoal-muted dark:text-slate-300 leading-relaxed p-3.5 bg-surface-subtle dark:bg-slate-800/60 rounded-lg border border-surface-border dark:border-surface-dark-border">
              {diagnosisResult.diagnosis.diagnosticFeedback}
            </p>
          </div>

          {/* Academic Integrity Audit Certificate */}
          <div className="p-4 rounded-xl border border-surface-border dark:border-surface-dark-border bg-surface-subtle dark:bg-slate-800/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {diagnosisResult.attempt.integrityStatus === 'VERIFIED_CLEAN' || (!diagnosisResult.attempt.violationsCount) ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-charcoal dark:text-slate-100 block">
                        Proctored Integrity: Verified Clean Full-Screen Session
                      </span>
                      <span className="text-[11px] text-charcoal-muted dark:text-slate-400">
                        Zero tab switches, focus losses, or window minimization interruptions detected.
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                        Proctored Integrity: Flagged for Review ({diagnosisResult.attempt.violationsCount} Infractions)
                      </span>
                      <span className="text-[11px] text-charcoal-muted dark:text-slate-400">
                        Focus boundaries were breached during active testing. Session audit transcript logged.
                      </span>
                    </div>
                  </>
                )}
              </div>
              <Badge
                variant={diagnosisResult.attempt.violationsCount ? 'error' : 'success'}
                size="sm"
                className="font-mono"
              >
                {diagnosisResult.attempt.integrityStatus || 'VERIFIED_CLEAN'}
              </Badge>
            </div>

            {diagnosisResult.attempt.violationsLog && diagnosisResult.attempt.violationsLog.length > 0 && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-1.5">
                <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                  Logged Integrity Events:
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {diagnosisResult.attempt.violationsLog.map((v: any, idx: number) => (
                    <div key={idx} className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{v.type}</span>
                      <span className="text-slate-600 dark:text-slate-400 truncate flex-1">{v.description}</span>
                      <span className="font-mono text-[10px] text-slate-400">{new Date(v.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!diagnosisResult.attempt.passed && diagnosisResult.diagnosis.weakSubtopics.length > 0 && (
            <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-1">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Adaptive Re-Routing Triggered
              </span>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Because your score was below 70%, the Curriculum Strategist Agent automatically injected targeted review exercises for <strong>{diagnosisResult.diagnosis.weakSubtopics.join(', ')}</strong> into Phase 1 of your roadmap.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-surface-border dark:border-surface-dark-border">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartQuiz}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Retake Assessment
            </Button>
            <Link to="/roadmap">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Inspect Updated Roadmap
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* VIEW 4: CONFIGURE QUIZ */}
      {activeTab === 'assess' && !isQuizActive && !diagnosisResult && (
        <Card className="space-y-5">
          <div className="pb-3 border-b border-surface-border dark:border-surface-dark-border">
            <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">
              Configure Skill Assessment Sandbox
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Select a core skill domain and difficulty level to test your technical competency.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-charcoal dark:text-slate-200">
              Skill Topic
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {topics.map(topic => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setSelectedTopic(topic)}
                  className={`p-3 rounded-lg border text-xs text-left font-medium transition-all ${
                    selectedTopic === topic
                      ? 'border-stitch-blue bg-blue-50/60 dark:bg-blue-950/40 text-stitch-blue font-semibold'
                      : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark text-charcoal-muted hover:border-slate-300'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-charcoal dark:text-slate-200">
              Benchmark Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map(diff => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium capitalize text-center transition-all ${
                    selectedDifficulty === diff
                      ? 'border-stitch-blue bg-blue-50/60 dark:bg-blue-950/40 text-stitch-blue font-semibold'
                      : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark text-charcoal-muted hover:border-slate-300'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Proctored Exam Environment Notice */}
          <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-stitch-blue">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">
                Secure Full-Screen Examination Active
              </span>
            </div>
            <p className="text-[11px] text-charcoal-muted dark:text-slate-300 leading-relaxed">
              Upon clicking "Start Assessment", browser Full-Screen API will be engaged. Tab switching, window focus loss, and navigation attempts are automatically logged to your integrity audit record. External application popups and floating AI assistance are suppressed during testing.
            </p>
          </div>

          <div className="pt-2 border-t border-surface-border dark:border-surface-dark-border">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-charcoal dark:text-slate-200">
              <input
                type="checkbox"
                checked={isTimedMode}
                onChange={e => setIsTimedMode(e.target.checked)}
                className="rounded border-slate-300 text-stitch-blue focus:ring-0"
              />
              <span>Timed Mode (5-minute countdown clock • Exam conditions)</span>
            </label>
          </div>

          <div className="pt-3 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between">
            <span className="text-[11px] text-charcoal-subtle dark:text-slate-400 font-mono">
              Proctored by LexiClash Integrity Engine
            </span>
            <Button
              variant="primary"
              size="md"
              onClick={handleStartQuiz}
              leftIcon={<Play className="w-4 h-4" />}
            >
              Start {selectedTopic} Examination
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Assessments;
