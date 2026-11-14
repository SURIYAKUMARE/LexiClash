import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PlacementQuestion } from '../db/seedData';
import { OfflinePlacementResult } from '../db/indexedDb';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BarChart3,
  Award,
  Zap,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CareerSimulatorWorkspace } from '../components/careerSimulator/CareerSimulatorWorkspace';

export const PlacementDiagnostic: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'simulator' | 'diagnostic'>('simulator');
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placementResult, setPlacementResult] = useState<OfflinePlacementResult | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await api.getPlacementScenarios();
      setQuestions(res.questions);
    };
    fetchQuestions();
  }, []);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.submitPlacementAssessment(answers);
      setPlacementResult(res.result);
    } catch (err) {
      console.error('Failed to submit placement diagnostic:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentStep];
  const isAnswered = currentQ && answers[currentQ.id] !== undefined;
  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  if (placementResult) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="flex items-center gap-2 p-1 bg-surface-subtle dark:bg-slate-800 rounded-xl border border-surface-border dark:border-surface-dark-border w-fit">
          <button
            onClick={() => setViewMode('simulator')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-charcoal-muted dark:text-slate-400 hover:text-charcoal"
          >
            Mock Interview Simulator
          </button>
          <button
            onClick={() => setViewMode('diagnostic')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-surface-dark text-brand-600 dark:text-brand-400 shadow-xs"
          >
            Role Diagnostic Quiz
          </button>
        </div>
        {/* Placement Completed Banner */}
        <div className="bg-white dark:bg-surface-dark-card border border-surface-border dark:border-surface-dark-border rounded-xl p-8 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-300 flex items-center justify-center mx-auto mb-4">
            <Award className="w-7 h-7" />
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            Placement Assessment Verified
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal dark:text-white mt-3 tracking-tight">
            {placementResult.levelName}
          </h1>

          <p className="text-sm text-charcoal-muted dark:text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed">
            {placementResult.personalizedSummary}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="md"
              variant="primary"
              className="gap-2"
              onClick={() => {
                if (placementResult.recommendedMode === 'professional') {
                  window.location.href = 'https://rebon123.vercel.app/';
                } else {
                  navigate('/roadmap');
                }
              }}
            >
              Start {placementResult.recommendedMode.toUpperCase()} Curriculum
              {placementResult.recommendedMode === 'professional' ? (
                <ExternalLink className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="md"
              variant="secondary"
              className="gap-2"
              onClick={() => {
                setPlacementResult(null);
                setAnswers({});
                setCurrentStep(0);
              }}
            >
              <RotateCcw className="w-4 h-4" />
              Retake Diagnostic
            </Button>
          </div>
        </div>

        {/* 4 Dimension Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h2 className="text-xs font-bold text-charcoal-subtle dark:text-slate-400 uppercase tracking-wider mb-4">
              Diagnostic Dimension Breakdown
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-charcoal dark:text-slate-200">Technical Knowledge</span>
                  <span className="font-mono font-bold text-brand-600">{placementResult.technicalScore}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-600 rounded-full" style={{ width: `${placementResult.technicalScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-charcoal dark:text-slate-200">Problem-Solving Ability</span>
                  <span className="font-mono font-bold text-emerald-600">{placementResult.problemSolvingScore}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${placementResult.problemSolvingScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-charcoal dark:text-slate-200">Practical & Architecture Understanding</span>
                  <span className="font-mono font-bold text-indigo-600">{placementResult.practicalScore}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${placementResult.practicalScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-charcoal dark:text-slate-200">Existing Project / SRE Experience</span>
                  <span className="font-mono font-bold text-amber-600">{placementResult.experienceScore}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600 rounded-full" style={{ width: `${placementResult.experienceScore}%` }} />
                </div>
              </div>
            </div>
          </Card>

          {/* Recommended Curriculum Calibration */}
          <Card className="flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold text-charcoal-subtle dark:text-slate-400 uppercase tracking-wider mb-2">
                Curriculum Calibration
              </h2>
              <div className="p-3 bg-surface-subtle dark:bg-slate-800/60 rounded-lg border border-surface-border dark:border-surface-dark-border mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-charcoal dark:text-white block">
                    Recommended Learning Mode:
                  </span>
                  {placementResult.recommendedMode === 'professional' && (
                    <button
                      onClick={() => { window.location.href = 'https://rebon123.vercel.app/'; }}
                      className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                    >
                      <span>Open Professional Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <span className="text-sm font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  {placementResult.recommendedMode} Mode
                </span>
                <p className="text-[11px] text-charcoal-muted dark:text-slate-400 mt-1">
                  {placementResult.recommendedMode === 'professional'
                    ? 'Immediate access to cloud console simulations, SRE incident drills, and advanced CLI terminal quests on Rebon Professional.'
                    : 'Interactive concept whiteboards, guided architecture diagrams, step-by-step tutorials, and foundational knowledge checks.'}
                </p>
              </div>

              <span className="text-xs font-semibold text-charcoal-subtle dark:text-slate-400 uppercase tracking-wider block mb-2">
                High-Priority Focus Areas
              </span>
              <ul className="space-y-1.5 text-xs text-charcoal-muted dark:text-slate-300">
                {placementResult.recommendedFocusAreas.map((area, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between text-xs">
              <span className="text-charcoal-subtle dark:text-slate-400">Diagnostic ID:</span>
              <span className="font-mono text-charcoal dark:text-white">{placementResult.id}</span>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Mode Navigation Tabs */}
      <div className="flex items-center gap-2 p-1 bg-surface-subtle dark:bg-slate-800 rounded-xl border border-surface-border dark:border-surface-dark-border w-fit">
        <button
          onClick={() => setViewMode('simulator')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'simulator'
              ? 'bg-white dark:bg-surface-dark text-brand-600 dark:text-brand-400 shadow-xs'
              : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal'
          }`}
        >
          Mock Interview Simulator
        </button>
        <button
          onClick={() => setViewMode('diagnostic')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'diagnostic'
              ? 'bg-white dark:bg-surface-dark text-brand-600 dark:text-brand-400 shadow-xs'
              : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal'
          }`}
        >
          Role Diagnostic Quiz
        </button>
      </div>

      {viewMode === 'simulator' ? (
        <CareerSimulatorWorkspace />
      ) : (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="pb-4 border-b border-surface-border dark:border-surface-dark-border flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  Diagnostic Assessment
                </span>
                <span className="text-xs text-charcoal-subtle dark:text-slate-400">
                  Step {currentStep + 1} of {questions.length}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-charcoal dark:text-slate-100 tracking-tight">
                Intelligent Placement Assessment
              </h1>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
                Evaluate your baseline technical knowledge, architectural problem-solving, and practical readiness.
              </p>
            </div>

            <Link to="/universe">
              <Button size="sm" variant="secondary" className="text-xs">
                Cancel
              </Button>
            </Link>
          </div>

          {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-600 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / (questions.length || 1)) * 100}%` }}
        />
      </div>

      {/* Active Question Card */}
      {currentQ ? (
        <Card className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border dark:border-surface-dark-border">
            <Badge variant="brand" size="sm">
              {currentQ.levelTitle}
            </Badge>
            <span className="text-xs font-mono font-medium text-charcoal-subtle dark:text-slate-400 uppercase">
              Dimension: {currentQ.dimension.replace('_', ' ')}
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-charcoal dark:text-slate-100 leading-snug">
              {currentQ.scenario}
            </h2>

            {currentQ.codeOrDiagram && (
              <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                <code>{currentQ.codeOrDiagram}</code>
              </pre>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2.5 pt-2">
            {currentQ.options.map((opt, idx) => {
              const isSelected = answers[currentQ.id] === idx;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelectOption(currentQ.id, idx)}
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-brand-600 dark:border-brand-400 bg-brand-50/60 dark:bg-brand-950/40 text-brand-950 dark:text-white shadow-xs'
                      : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card hover:border-slate-300 dark:hover:border-slate-700 text-charcoal dark:text-slate-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                      isSelected
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 text-charcoal-subtle'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="leading-relaxed">{opt.text}</span>
                </div>
              );
            })}
          </div>

          {/* Nav Controls */}
          <div className="pt-4 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between">
            <Button
              size="sm"
              variant="secondary"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="text-xs"
            >
              Previous
            </Button>

            {currentStep < questions.length - 1 ? (
              <Button
                size="sm"
                variant="primary"
                onClick={handleNext}
                disabled={!isAnswered}
                className="text-xs gap-1.5"
              >
                Next Scenario
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={handleSubmit}
                disabled={!allAnswered || isSubmitting}
                className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? 'Evaluating Diagnostic...' : 'Calculate My Placement'}
                <Sparkles className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <p className="text-xs text-charcoal-muted">Loading placement diagnostic scenarios...</p>
        </Card>
      )}
        </div>
      )}
    </div>
  );
};
