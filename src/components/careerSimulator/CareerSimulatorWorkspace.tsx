import React, { useState } from 'react';
import { SEED_INTERVIEW_TRACKS } from '../../careerSimulator/interviewScenarios';
import { RoleInterviewTrack, InterviewAnswerSubmission, MockInterviewResult } from '../../careerSimulator/types';
import { InterviewEvaluator } from '../../careerSimulator/evaluationEngine';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  Award,
  Zap,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CareerSimulatorWorkspace: React.FC = () => {
  const { user } = useAuth();
  const [selectedTrack, setSelectedTrack] = useState<RoleInterviewTrack>(SEED_INTERVIEW_TRACKS[0]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<MockInterviewResult | null>(null);

  const currentQ = selectedTrack.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQ?.id] || '';
  const wordCount = currentAnswer.trim().split(/\s+/).filter(Boolean).length;

  const handleSelectTrack = (track: RoleInterviewTrack) => {
    setSelectedTrack(track);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setEvaluationResult(null);
  };

  const handleAnswerChange = (val: string) => {
    if (!currentQ) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: val }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < selectedTrack.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitInterview = async () => {
    setIsEvaluating(true);
    try {
      const submissions: InterviewAnswerSubmission[] = selectedTrack.questions.map(q => ({
        questionId: q.id,
        answerText: answers[q.id] || '',
        timeSpentSeconds: 120
      }));

      const result = await InterviewEvaluator.evaluateSession(
        selectedTrack,
        submissions,
        user?.id || 'demo-user'
      );
      setEvaluationResult(result);
    } catch (err) {
      console.error('Interview evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handlePrefillSample = () => {
    if (!currentQ) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: currentQ.sampleGoodAnswerSnippet }));
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setEvaluationResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Track Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Interactive Rubric Engine v2.0
            </span>
            <span className="text-xs text-charcoal-subtle dark:text-slate-400 font-mono">
              Role-Specific Technical Panels
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-charcoal dark:text-slate-100 tracking-tight">
            Career Readiness Simulator &amp; Mock Interview Panel
          </h2>
          <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
            Real technical &amp; architectural mock interviews. Evaluates runtime depth, trade-off analysis, and incident ownership.
          </p>
        </div>

        {/* Track Pills */}
        <div className="flex items-center gap-1.5 bg-surface-subtle dark:bg-slate-800/80 p-1 rounded-xl border border-surface-border dark:border-surface-dark-border text-xs font-semibold">
          {SEED_INTERVIEW_TRACKS.map(track => {
            const isSelected = track.roleId === selectedTrack.roleId;
            return (
              <button
                key={track.roleId}
                onClick={() => handleSelectTrack(track)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-surface-dark text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal'
                }`}
              >
                {track.roleTitle}
              </button>
            );
          })}
        </div>
      </div>

      {/* RESULT VIEW: Comprehensive Interview Evaluation Scorecard */}
      {evaluationResult ? (
        <Card className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-charcoal-subtle">
                  Evaluation Scorecard &bull; {evaluationResult.roleTitle}
                </span>
                <Badge
                  variant={
                    evaluationResult.readinessRating === 'Ready'
                      ? 'success'
                      : evaluationResult.readinessRating === 'Needs Reinforcement'
                      ? 'warning'
                      : 'danger'
                  }
                  size="sm"
                >
                  {evaluationResult.readinessRating}
                </Badge>
              </div>
              <h3 className="text-2xl font-extrabold text-charcoal dark:text-white mt-1">
                Overall Readiness Score: {evaluationResult.overallScore}%
              </h3>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRestart}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Restart Simulation
            </Button>
          </div>

          {/* Stage Scores Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(evaluationResult.stageScores).map(([stage, score]) => (
              <div key={stage} className="p-3.5 rounded-xl border border-surface-border dark:border-surface-dark-border bg-surface-subtle dark:bg-slate-900/60">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-subtle block mb-1">
                  {stage.replace('_', ' ')}
                </span>
                <div className="text-lg font-bold text-charcoal dark:text-slate-100">
                  {score}%
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full ${score >= 75 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Feedback Summary */}
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
            <strong>Panel Synthesis:</strong> {evaluationResult.feedbackSummary}
          </div>

          {/* Strengths & Blind Spots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Demonstrated Strengths
              </span>
              <ul className="space-y-1.5 text-xs text-charcoal-muted dark:text-slate-300">
                {evaluationResult.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 space-y-2">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Target Blind Spots &amp; Opportunities
              </span>
              <ul className="space-y-1.5 text-xs text-charcoal-muted dark:text-slate-300">
                {evaluationResult.blindSpots.map((spot, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{spot}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Curriculum Recommendations */}
          <div className="space-y-3 pt-3 border-t border-surface-border dark:border-surface-dark-border">
            <span className="text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider block">
              Direct Roadmap Recommendations
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {evaluationResult.recommendedModules.map((mod, i) => (
                <div key={i} className="p-3 rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-slate-800/60 flex items-center justify-between text-xs">
                  <span className="font-medium text-charcoal dark:text-slate-200">{mod}</span>
                  <Link to="/roadmap" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1 shrink-0 text-[11px]">
                    View in Roadmap <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        /* INTERVIEW QUESTION ACTIVE SESSION */
        <Card className="space-y-5">
          {/* Stepper Progress */}
          <div className="flex items-center justify-between pb-3 border-b border-surface-border dark:border-surface-dark-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-charcoal dark:text-white">
                Question {currentQuestionIndex + 1} of {selectedTrack.questions.length}
              </span>
              <Badge variant="neutral" size="sm">
                {currentQ.stageName}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-charcoal-muted">
              <Clock className="w-3.5 h-3.5" />
              <span>Target Readiness: {selectedTrack.targetReadinessScore}%</span>
            </div>
          </div>

          {/* Scenario Context Box */}
          <div className="p-3.5 rounded-xl bg-surface-subtle dark:bg-slate-900 border border-surface-border dark:border-surface-dark-border text-xs text-charcoal-muted dark:text-slate-300">
            <span className="font-bold text-charcoal dark:text-white block mb-0.5">Scenario Context:</span>
            {currentQ.scenarioContext}
          </div>

          {/* Question Text */}
          <div>
            <h3 className="text-base font-bold text-charcoal dark:text-slate-100 leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* Expected Evaluation Criteria */}
          <div>
            <span className="text-[11px] font-bold text-charcoal dark:text-slate-300 uppercase tracking-wider block mb-2">
              Evaluation Criteria Rubric:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {currentQ.evaluationCriteria.map((c, i) => (
                <div key={i} className="p-2.5 rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-slate-800/40 text-[11px]">
                  <div className="flex justify-between font-bold text-charcoal dark:text-slate-200 mb-1">
                    <span>{c.criterion}</span>
                    <span className="text-brand-600 font-mono">{c.weight}%</span>
                  </div>
                  <p className="text-charcoal-muted dark:text-slate-400 text-[10px] leading-tight">
                    {c.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Answer Text Area */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-charcoal dark:text-slate-200">
                Your Technical Response:
              </label>
              <div className="flex items-center gap-3 text-[11px] text-charcoal-subtle">
                <button
                  type="button"
                  onClick={handlePrefillSample}
                  className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                >
                  Load Starter Guidance
                </button>
                <span>Word count: <strong>{wordCount}</strong></span>
              </div>
            </div>
            <textarea
              value={currentAnswer}
              onChange={e => handleAnswerChange(e.target.value)}
              placeholder="Structure your answer clearly: 1. Core mechanism, 2. Concurrency trade-offs, 3. Production resilience failure modes..."
              rows={6}
              className="w-full p-3 text-xs rounded-xl border border-surface-border dark:border-surface-dark-border bg-white dark:bg-slate-800 text-charcoal dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-600 font-sans leading-relaxed"
            />
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-surface-border dark:border-surface-dark-border">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Previous Stage
            </Button>

            <div className="flex items-center gap-2">
              {currentQuestionIndex < selectedTrack.questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNext}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Next Stage
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmitInterview}
                  disabled={isEvaluating}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                >
                  {isEvaluating ? 'Evaluating Interview Rubric...' : 'Complete & Score Interview'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
