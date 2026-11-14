import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Question, AssessmentAttempt } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  Check,
  History,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Assessments: React.FC = () => {
  const { refreshProfile } = useAuth();

  const [topics] = useState([
    'JavaScript',
    'React',
    'Node.js',
    'TypeScript',
    'PostgreSQL',
    'Docker'
  ]);

  const [selectedTopic, setSelectedTopic] = useState('JavaScript');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isTimedMode, setIsTimedMode] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  // Quiz Running State
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSelections, setUserSelections] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result State
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);

  // History State
  const [history, setHistory] = useState<AssessmentAttempt[]>([]);
  const [activeTab, setActiveTab] = useState<'assess' | 'history'>('assess');

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
        alert('No questions found for this topic and difficulty. Please try another selection.');
        return;
      }
      setQuestions(data.questions);
      setCurrentIndex(0);
      setUserSelections({});
      setDiagnosisResult(null);
      setTimeLeft(300);
      setIsQuizActive(true);
    } catch (err: any) {
      alert(err?.message || 'Failed to load assessment questions.');
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setUserSelections(prev => ({ ...prev, [questionId]: optionIndex }));
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
          <h1 className="text-2xl font-bold text-charcoal dark:text-slate-100 tracking-tight">
            Skill Assessment
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-1">
            Diagnostic evaluations to verify competencies, uncover weak areas, and adjust your roadmap.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'assess' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setActiveTab('assess');
              setIsQuizActive(false);
              setDiagnosisResult(null);
            }}
          >
            New Quiz
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
            History ({history.length})
          </Button>
        </div>
      </div>

      {/* VIEW 1: HISTORY TAB */}
      {activeTab === 'history' && (
        <Card className="space-y-4">
          <div className="pb-3 border-b border-surface-border dark:border-surface-dark-border">
            <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">
              Assessment Attempt History
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Past scores and verified credentials recorded on your profile.
            </p>
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center text-xs text-charcoal-muted dark:text-slate-400">
              No previous assessment attempts recorded. Complete a diagnostic evaluation to see your results.
            </div>
          ) : (
            <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
              {history.map(att => (
                <div key={att.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-charcoal dark:text-slate-100 text-sm">{att.topic}</span>
                      <span className="text-[10px] uppercase font-semibold text-charcoal-subtle dark:text-slate-400">
                        {att.difficulty}
                      </span>
                      {att.passed ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-status-success-bg dark:bg-emerald-950/40 text-status-success border border-emerald-200 dark:border-emerald-800/50">
                          Passed & Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                          Needs Review
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-charcoal-muted dark:text-slate-400 leading-relaxed max-w-lg">
                      {att.feedback}
                    </p>
                    <span className="text-[11px] text-charcoal-subtle dark:text-slate-500 block">
                      {new Date(att.completedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-2xl font-bold text-charcoal dark:text-slate-100 block">
                      {att.scorePercentage}%
                    </span>
                    <span className="text-[11px] text-charcoal-subtle dark:text-slate-400">
                      {att.correctAnswers} of {att.totalQuestions} correct
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* VIEW 2: ACTIVE QUIZ RUNNER (Question with options, timer, progress) */}
      {activeTab === 'assess' && isQuizActive && (
        <Card className="space-y-6">
          {/* Top Bar: Topic, Question #, Timer */}
          <div className="flex items-center justify-between pb-3 border-b border-surface-border dark:border-surface-dark-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                {selectedTopic}
              </span>
              <span className="text-charcoal-subtle dark:text-slate-600">·</span>
              <span className="text-xs font-medium text-charcoal-muted dark:text-slate-400 capitalize">
                {selectedDifficulty}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-charcoal dark:text-slate-200">
                Question {currentIndex + 1} of {questions.length}
              </span>

              {isTimedMode && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-mono text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-surface-border dark:border-surface-dark-border">
            <div
              className="h-full bg-brand-600 dark:bg-brand-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Question Text & Options */}
          {currentQ && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-charcoal dark:text-slate-100 leading-snug">
                {currentQ.question}
              </h2>

              {currentQ.codeSnippet && (
                <div className="p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-lg border border-slate-800 overflow-x-auto leading-relaxed">
                  <pre>{currentQ.codeSnippet}</pre>
                </div>
              )}

              {/* Options List */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((option, idx) => {
                  const isSelected = userSelections[currentQ.id] === idx;
                  const letter = String.fromCharCode(65 + idx);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, idx)}
                      className={`w-full text-left p-3.5 rounded-lg border text-xs transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/40 text-charcoal dark:text-slate-100 font-medium'
                          : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card text-charcoal-muted dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border ${
                          isSelected
                            ? 'bg-brand-600 border-brand-600 text-white'
                            : 'border-surface-border dark:border-surface-dark-border bg-surface-subtle dark:bg-slate-800 text-charcoal-muted dark:text-slate-400'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="leading-relaxed flex-1">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-surface-border dark:border-surface-dark-border">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
            >
              Previous
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentIndex(prev => prev + 1)}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitAssessment}
                disabled={isSubmitting}
                rightIcon={<Check className="w-3.5 h-3.5" />}
              >
                {isSubmitting ? 'Evaluating...' : 'Submit Assessment'}
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* VIEW 3: RESULT SCREEN */}
      {activeTab === 'assess' && !isQuizActive && diagnosisResult && (
        <Card className="space-y-6">
          {/* Result Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
            <div>
              <span className="text-xs font-semibold text-charcoal-subtle dark:text-slate-400 uppercase tracking-wider">
                Assessment Results
              </span>
              <h2 className="text-xl font-bold text-charcoal dark:text-slate-100 mt-1">
                {diagnosisResult.attempt.topic} Diagnostic Report
              </h2>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
                Evaluation completed on {new Date().toLocaleDateString()}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-3xl font-extrabold text-charcoal dark:text-slate-100 block">
                  {diagnosisResult.attempt.scorePercentage}%
                </span>
                <span className="text-[11px] text-charcoal-subtle dark:text-slate-400">
                  {diagnosisResult.attempt.correctAnswers} / {diagnosisResult.attempt.totalQuestions} Correct
                </span>
              </div>
              {diagnosisResult.attempt.passed ? (
                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-status-success-bg dark:bg-emerald-950/40 text-status-success border border-emerald-200 dark:border-emerald-800/50">
                  Verified
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                  Needs Review
                </span>
              )}
            </div>
          </div>

          {/* Diagnostic Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-charcoal dark:text-slate-100 uppercase tracking-wider">
              Diagnostic Summary & Recommendations
            </h3>
            <p className="text-xs text-charcoal-muted dark:text-slate-300 leading-relaxed p-3 bg-surface-subtle dark:bg-slate-800/50 rounded-lg border border-surface-border dark:border-surface-dark-border">
              {diagnosisResult.diagnosis?.diagnosticFeedback || diagnosisResult.attempt.feedback}
            </p>
          </div>

          {/* Weak Topics to Focus On */}
          {diagnosisResult.diagnosis?.weakSubtopics && diagnosisResult.diagnosis.weakSubtopics.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-charcoal dark:text-slate-100 uppercase tracking-wider">
                Target Topics for Improvement:
              </h4>
              <div className="flex flex-wrap gap-2">
                {diagnosisResult.diagnosis.weakSubtopics.map((sub: string, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 font-medium"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions: Retake or View Roadmap */}
          <div className="flex items-center justify-between pt-4 border-t border-surface-border dark:border-surface-dark-border">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartQuiz}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Retake Quiz
            </Button>

            <Link to="/roadmap">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Return to Roadmap
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* VIEW 4: QUIZ SELECTOR (Initial State) */}
      {activeTab === 'assess' && !isQuizActive && !diagnosisResult && (
        <Card className="space-y-5">
          <div className="pb-3 border-b border-surface-border dark:border-surface-dark-border">
            <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">
              Configure Diagnostic Assessment
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Select a core skill domain and difficulty level to test your technical competency.
            </p>
          </div>

          {/* Topic Picker */}
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
                      ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold'
                      : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card text-charcoal-muted dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-charcoal dark:text-slate-200">
              Proficiency Benchmark
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map(diff => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium capitalize text-center transition-all ${
                    selectedDifficulty === diff
                      ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold'
                      : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card text-charcoal-muted dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Timed Mode Checkbox */}
          <div className="pt-2 border-t border-surface-border dark:border-surface-dark-border">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-charcoal dark:text-slate-200">
              <input
                type="checkbox"
                checked={isTimedMode}
                onChange={e => setIsTimedMode(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600 text-brand-600 focus:ring-0"
              />
              <span>Timed Mode (5 minutes · Simulated exam conditions)</span>
            </label>
          </div>

          {/* Start Button */}
          <div className="pt-3 border-t border-surface-border dark:border-surface-dark-border flex justify-end">
            <Button
              variant="primary"
              size="md"
              onClick={handleStartQuiz}
              leftIcon={<Play className="w-4 h-4" />}
            >
              Start {selectedTopic} Assessment
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Assessments;
