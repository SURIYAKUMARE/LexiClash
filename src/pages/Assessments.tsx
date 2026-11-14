import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Question, AssessmentAttempt } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import {
  CheckSquare,
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Award,
  Sparkles,
  ChevronRight,
  TrendingUp,
  History
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Assessments: React.FC = () => {
  const { refreshProfile } = useAuth();

  const [topics] = useState([
    'JavaScript',
    'React',
    'Python',
    'SQL / Databases',
    'Git & Version Control',
    'Data Structures & Algorithms'
  ]);

  const [selectedTopic, setSelectedTopic] = useState('JavaScript');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isTimedMode, setIsTimedMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in timed mode

  // Quiz Execution State
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSelections, setUserSelections] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Diagnostic Report State
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);

  // History State
  const [history, setHistory] = useState<AssessmentAttempt[]>([]);
  const [viewingTab, setViewingTab] = useState<'take' | 'history'>('take');

  const loadHistory = async () => {
    try {
      const data = await api.getAssessmentHistory();
      setHistory(data.history);
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
      if (data.questions.length === 0) {
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
  const answeredCount = Object.keys(userSelections).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-charcoal">Skill Proficiency Assessments</h1>
          <p className="text-xs text-charcoal-muted">
            Validate competencies through timed quizzes and coding diagnostics. Scores automatically update your verified badge.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewingTab === 'take' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => { setViewingTab('take'); setIsQuizActive(false); setDiagnosisResult(null); }}
          >
            Take Assessment
          </Button>
          <Button
            variant={viewingTab === 'history' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewingTab('history')}
            leftIcon={<History className="w-3.5 h-3.5" />}
          >
            Attempts History ({history.length})
          </Button>
        </div>
      </div>

      {viewingTab === 'history' ? (
        /* History View */
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-charcoal border-b border-surface-border pb-3">
            Assessment Performance Log
          </h3>

          {history.length === 0 ? (
            <div className="py-12 text-center text-xs text-charcoal-subtle">
              No previous assessment attempts recorded. Complete your first evaluation to see history.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((att) => (
                <div
                  key={att.id}
                  className="p-4 bg-surface-subtle border border-surface-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-charcoal text-sm">{att.topic}</span>
                      <Badge variant={att.passed ? 'success' : 'danger'} size="sm">
                        {att.passed ? 'Passed & Verified' : 'Needs Review'}
                      </Badge>
                      <span className="text-[10px] text-charcoal-subtle uppercase">
                        {att.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-muted leading-relaxed max-w-xl">{att.feedback}</p>
                    <span className="text-[10px] text-charcoal-subtle block">
                      Completed: {new Date(att.completedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-surface-border">
                    <span className="text-2xl font-extrabold text-charcoal">{att.scorePercentage}%</span>
                    <span className="text-[11px] text-charcoal-subtle">
                      {att.correctAnswers} of {att.totalQuestions} correct
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : isQuizActive ? (
        /* ACTIVE QUIZ RUNNER */
        <Card className="p-6 sm:p-8 space-y-6 shadow-card">
          {/* Quiz Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border pb-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-charcoal text-sm">{selectedTopic} Assessment</span>
              <Badge variant="brand" size="sm">{selectedDifficulty}</Badge>
            </div>

            <div className="flex items-center gap-4 text-xs text-charcoal-subtle font-medium">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              {isTimedMode && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full font-mono font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <ProgressBar
            value={((currentIndex + 1) / questions.length) * 100}
            size="sm"
            color="brand"
          />

          {/* Current Question View */}
          {currentQ && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-charcoal leading-snug">
                {currentQ.question}
              </h3>

              {currentQ.codeSnippet && (
                <div className="bg-charcoal text-white font-mono text-xs p-4 rounded-xl overflow-x-auto shadow-inner leading-relaxed">
                  <pre>{currentQ.codeSnippet}</pre>
                </div>
              )}

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = userSelections[currentQ.id] === oIdx;

                  return (
                    <div
                      key={oIdx}
                      onClick={() => handleSelectOption(currentQ.id, oIdx)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/60 shadow-xs font-medium text-charcoal'
                          : 'border-surface-border bg-surface hover:bg-surface-subtle text-charcoal'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                          isSelected ? 'bg-brand-600 text-white' : 'bg-surface-muted text-charcoal-subtle'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="leading-relaxed">{opt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quiz Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-surface-border">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
            >
              Previous Question
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentIndex(prev => prev + 1)}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next Question
              </Button>
            ) : (
              <Button
                variant="success"
                size="md"
                onClick={handleSubmitAssessment}
                isLoading={isSubmitting}
                rightIcon={<CheckSquare className="w-4 h-4" />}
              >
                Submit & Evaluate Diagnosis
              </Button>
            )}
          </div>
        </Card>
      ) : diagnosisResult ? (
        /* COMPREHENSIVE DIAGNOSTIC REPORT */
        <div className="space-y-6 animate-in fade-in">
          <Card className="p-6 sm:p-8 shadow-card border-brand-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-surface-border">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 rounded-full text-xs font-semibold text-brand-700">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span>Assessment Agent Diagnostic Evaluation</span>
                </div>
                <h2 className="text-xl font-bold text-charcoal">
                  Evaluation Report: {diagnosisResult.attempt.topic}
                </h2>
                <p className="text-xs text-charcoal-muted max-w-xl leading-relaxed">
                  {diagnosisResult.diagnosis.diagnosticFeedback}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-5 bg-surface-subtle border border-surface-border rounded-2xl min-w-[160px]">
                <span className={`text-4xl font-extrabold ${diagnosisResult.attempt.passed ? 'text-status-success' : 'text-amber-600'}`}>
                  {diagnosisResult.attempt.scorePercentage}%
                </span>
                <span className="text-[11px] font-semibold text-charcoal uppercase tracking-wider mt-1">
                  {diagnosisResult.attempt.passed ? 'Verified Mastery' : 'Needs Review'}
                </span>
              </div>
            </div>

            {/* Error Classification & Weak Subtopics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="p-4 bg-surface-subtle rounded-xl border border-surface-border space-y-2 text-xs">
                <h4 className="font-bold text-charcoal uppercase tracking-wider text-[11px]">Error Classifications</h4>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 bg-white rounded-lg border border-surface-border">
                    <span className="block text-xs font-bold text-charcoal">{diagnosisResult.diagnosis.errorClassification.conceptual}</span>
                    <span className="text-[10px] text-charcoal-subtle">Conceptual</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-surface-border">
                    <span className="block text-xs font-bold text-charcoal">{diagnosisResult.diagnosis.errorClassification.syntaxOrApi}</span>
                    <span className="text-[10px] text-charcoal-subtle">Syntax/API</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-surface-border">
                    <span className="block text-xs font-bold text-charcoal">{diagnosisResult.diagnosis.errorClassification.edgeCase}</span>
                    <span className="text-[10px] text-charcoal-subtle">Edge Cases</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-surface-subtle rounded-xl border border-surface-border space-y-2 text-xs">
                <h4 className="font-bold text-charcoal uppercase tracking-wider text-[11px]">Recommended Remediation</h4>
                <ul className="space-y-1.5 text-[11px] text-charcoal-muted">
                  {diagnosisResult.diagnosis.recommendedRemediation.map((rem: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                      <span>{rem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Adaptive Learning Trigger Feedback */}
            {diagnosisResult.adaptiveResult && (
              <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl space-y-2 text-xs mb-6">
                <div className="flex items-center gap-2 text-brand-900 font-bold">
                  <TrendingUp className="w-4 h-4 text-brand-600" />
                  <span>Adaptive System Action: {diagnosisResult.adaptiveResult.adjustmentType.replace('_', ' ').toUpperCase()}</span>
                </div>
                <p className="text-brand-800 leading-relaxed text-[11px]">
                  {diagnosisResult.adaptiveResult.explanation}
                </p>
                <Link to="/roadmap" className="inline-block text-brand-700 font-semibold hover:underline text-[11px]">
                  View updated roadmap tasks →
                </Link>
              </div>
            )}

            {/* Detailed Explanations for Each Question */}
            <div className="space-y-3 pt-4 border-t border-surface-border">
              <h4 className="text-sm font-bold text-charcoal mb-2">Question-by-Question Diagnostic Review</h4>
              {diagnosisResult.detailedAnswers.map((item: any, i: number) => (
                <div key={i} className="p-4 bg-white rounded-xl border border-surface-border space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-charcoal">
                      Q{i + 1}: {item.questionText}
                    </span>
                    {item.isCorrect ? (
                      <Badge variant="success" size="sm">Correct</Badge>
                    ) : (
                      <Badge variant="danger" size="sm">Incorrect</Badge>
                    )}
                  </div>
                  <p className="text-charcoal-muted text-[11px] leading-relaxed bg-surface-subtle p-2.5 rounded-lg border border-surface-border">
                    <strong>Explanation:</strong> {item.explanation}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-6 flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => setDiagnosisResult(null)}>
                Take Another Assessment
              </Button>
              <Link to="/roadmap">
                <Button variant="primary" size="sm">
                  Go to Learning Roadmap
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      ) : (
        /* QUIZ SETUP CONFIGURATION CARD */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-charcoal border-b border-surface-border pb-3">
              Configure Your Assessment Session
            </h3>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-2">
                1. Select Topic Domain
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {topics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTopic(t)}
                    className={`p-3 rounded-xl border text-xs text-left font-medium transition-all ${
                      selectedTopic === t
                        ? 'border-brand-600 bg-brand-50/60 text-brand-900 font-bold shadow-xs'
                        : 'border-surface-border bg-surface hover:bg-surface-subtle text-charcoal'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-2">
                2. Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['beginner', 'intermediate', 'advanced'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`p-3 rounded-xl border text-xs text-center capitalize transition-all ${
                      selectedDifficulty === diff
                        ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold shadow-xs'
                        : 'border-surface-border bg-surface hover:bg-surface-subtle text-charcoal'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-surface-subtle rounded-xl border border-surface-border">
                <input
                  type="checkbox"
                  checked={isTimedMode}
                  onChange={(e) => setIsTimedMode(e.target.checked)}
                  className="rounded border-surface-border text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <span className="text-xs font-bold text-charcoal block">Timed Exam Mode (5 Minutes)</span>
                  <span className="text-[11px] text-charcoal-muted">Simulate actual engineering interview pressure and test speed under constraints.</span>
                </div>
              </label>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleStartQuiz}
                leftIcon={<Play className="w-4 h-4 fill-white" />}
              >
                Begin Assessment Session
              </Button>
            </div>
          </Card>

          {/* Assessment Guidelines */}
          <Card className="space-y-4">
            <h4 className="text-sm font-bold text-charcoal border-b border-surface-border pb-2">
              Assessment Standards
            </h4>
            <ul className="space-y-3 text-xs text-charcoal-muted">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                <span><strong>Verification Benchmark:</strong> Scoring 75%+ grants a verified credential badge on your skill profile.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span><strong>Mastery Acceleration:</strong> Scoring 85%+ skips redundant beginner milestones on your roadmap.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Adaptive Remediation:</strong> Scoring &lt;70% generates targeted review tasks to seal weak subtopics.</span>
              </li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
};
