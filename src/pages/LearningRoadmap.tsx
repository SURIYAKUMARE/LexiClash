import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LearningRoadmap as RoadmapType, RoadmapAdjustmentLog, RoadmapTask, RoadmapPhase } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import {
  MapPin,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ExternalLink,
  RotateCcw,
  History,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LearningRoadmap: React.FC = () => {
  const { profile, refreshProfile } = useAuth();

  const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);
  const [adjustments, setAdjustments] = useState<RoadmapAdjustmentLog[]>([]);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'adjustments'>('roadmap');
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadRoadmapData = async () => {
    try {
      const [roadRes, adjRes] = await Promise.all([
        api.getRoadmap(),
        api.getRoadmapAdjustments()
      ]);
      setRoadmap(roadRes.roadmap);
      setAdjustments(adjRes.adjustments);

      // Expand all phases by default
      const initialExpanded: Record<string, boolean> = {};
      roadRes.roadmap.phases.forEach((p: RoadmapPhase) => {
        initialExpanded[p.id] = true;
      });
      setExpandedPhases(initialExpanded);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmapData();
  }, []);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const handleToggleTask = async (taskId: string) => {
    setTogglingTaskId(taskId);
    try {
      const res = await api.toggleRoadmapTask(taskId);
      setRoadmap(res.roadmap);
      await refreshProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingTaskId(null);
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm('Regenerate learning roadmap? This will recalculate all phases based on your latest skill gap delta.')) return;
    setIsRegenerating(true);
    try {
      const res = await api.regenerateRoadmap();
      setRoadmap(res.roadmap);
      const adjRes = await api.getRoadmapAdjustments();
      setAdjustments(adjRes.adjustments);
      await refreshProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const overallProgress = roadmap?.overallProgressPercentage || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-charcoal">Personalized Learning Roadmap</h1>
            <Badge variant="brand" size="sm">
              Role: {roadmap?.targetRoleTitle || 'Full Stack Developer'}
            </Badge>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Phased curriculum synchronized with your verified competencies, assessment diagnostics, and career targets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            isLoading={isRegenerating}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Regenerate Roadmap
          </Button>
        </div>
      </div>

      {/* Progress Overview Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-charcoal">{overallProgress}%</span>
            <div>
              <span className="text-xs font-semibold text-charcoal block">Curriculum Completion</span>
              <span className="text-[11px] text-charcoal-subtle">
                Tasks completed directly update your verified readiness metrics
              </span>
            </div>
          </div>
          <div className="text-xs text-charcoal-subtle font-medium">
            Last Adjusted: {new Date(roadmap?.lastAdjustedAt || Date.now()).toLocaleDateString()}
          </div>
        </div>
        <ProgressBar value={overallProgress} color="brand" size="md" />
      </Card>

      {/* Tabs: Roadmap vs Adjustments History */}
      <div className="flex gap-2 border-b border-surface-border pb-2">
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'roadmap'
              ? 'bg-brand-600 text-white font-semibold'
              : 'text-charcoal-muted hover:text-charcoal hover:bg-surface-subtle'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Curriculum Phases</span>
        </button>

        <button
          onClick={() => setActiveTab('adjustments')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'adjustments'
              ? 'bg-brand-600 text-white font-semibold'
              : 'text-charcoal-muted hover:text-charcoal hover:bg-surface-subtle'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Adaptive Adjustment History ({adjustments.length})</span>
        </button>
      </div>

      {/* TAB 1: ROADMAP PHASES */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          {roadmap?.phases.map((phase) => {
            const isExpanded = expandedPhases[phase.id] ?? true;
            const completedCount = phase.tasks.filter(t => t.completed).length;
            const phaseProgress = phase.tasks.length > 0 ? Math.round((completedCount / phase.tasks.length) * 100) : 0;

            let phaseBadgeVariant: 'success' | 'brand' | 'neutral' = 'neutral';
            let phaseStatusLabel = 'Not Started';
            if (phase.status === 'completed') {
              phaseBadgeVariant = 'success';
              phaseStatusLabel = 'Completed';
            } else if (phase.status === 'in_progress') {
              phaseBadgeVariant = 'brand';
              phaseStatusLabel = 'In Progress';
            }

            return (
              <Card key={phase.id} className="overflow-hidden p-0">
                {/* Phase Header */}
                <div
                  onClick={() => togglePhase(phase.id)}
                  className="p-4 sm:p-5 bg-surface-subtle flex items-center justify-between cursor-pointer hover:bg-surface-muted/60 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-charcoal-subtle">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-charcoal">{phase.title}</span>
                        <Badge variant={phaseBadgeVariant} size="sm">
                          {phaseStatusLabel}
                        </Badge>
                      </div>
                      <p className="text-xs text-charcoal-muted mt-0.5 max-w-2xl leading-relaxed">
                        {phase.description}
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <span className="text-xs font-semibold text-charcoal">
                      {completedCount} of {phase.tasks.length} Done ({phaseProgress}%)
                    </span>
                    <span className="text-[10px] text-charcoal-subtle">
                      Duration: ~{phase.durationWeeks} weeks
                    </span>
                  </div>
                </div>

                {/* Phase Tasks List */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 space-y-3 divide-y divide-surface-border">
                    {phase.tasks.map((task, idx) => (
                      <div
                        key={task.id}
                        className={`pt-3 first:pt-0 flex items-start gap-3.5 transition-all ${
                          task.completed ? 'opacity-80' : ''
                        }`}
                      >
                        {/* Task Checkbox */}
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          disabled={togglingTaskId === task.id}
                          className="mt-0.5 text-charcoal-subtle hover:text-brand-600 focus:outline-none transition-colors shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-status-success fill-emerald-100" />
                          ) : (
                            <Circle className="w-5 h-5 text-surface-border hover:border-brand-500" />
                          )}
                        </button>

                        {/* Task Info */}
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span
                              className={`text-xs font-bold ${
                                task.completed ? 'line-through text-charcoal-muted' : 'text-charcoal'
                              }`}
                            >
                              {task.title}
                            </span>
                            <div className="flex items-center gap-2">
                              {task.isAdaptiveAddition && (
                                <Badge variant="warning" size="sm">
                                  Adaptive Review
                                </Badge>
                              )}
                              <span className="text-[11px] text-charcoal-subtle font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" /> ~{task.estimatedHours} hrs
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-charcoal-muted leading-relaxed">
                            {task.description}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                            <span className="text-charcoal-subtle">
                              <strong>Completion Criteria:</strong> {task.criteria}
                            </span>

                            {/* Verified Resource Links */}
                            {task.resourceLinks && task.resourceLinks.length > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-charcoal-subtle font-medium">Resources:</span>
                                {task.resourceLinks.map((res, rIdx) => (
                                  <a
                                    key={rIdx}
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 hover:underline font-semibold"
                                  >
                                    <span>{res.title}</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB 2: ADAPTIVE ADJUSTMENTS HISTORY */}
      {activeTab === 'adjustments' && (
        <Card className="space-y-4">
          <div className="border-b border-surface-border pb-3">
            <h3 className="text-sm font-bold text-charcoal">Adaptive Optimization Audit Log</h3>
            <p className="text-xs text-charcoal-muted">
              Every adjustment triggered by low scores, verified mastery, or career changes is fully logged and explainable.
            </p>
          </div>

          {adjustments.length === 0 ? (
            <div className="py-8 text-center text-xs text-charcoal-subtle">
              No adaptive adjustments recorded yet. Complete quizzes or switch target roles to see dynamic adaptations.
            </div>
          ) : (
            <div className="space-y-3">
              {adjustments.map((adj) => (
                <div key={adj.id} className="p-4 bg-surface-subtle border border-surface-border rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          adj.trigger === 'assessment_failure'
                            ? 'warning'
                            : adj.trigger === 'assessment_mastery'
                            ? 'success'
                            : 'brand'
                        }
                        size="sm"
                      >
                        {adj.trigger.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="font-semibold text-charcoal">{adj.description}</span>
                    </div>
                    <span className="text-[11px] text-charcoal-subtle">
                      {new Date(adj.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {adj.adjustmentDetails.tasksAdded && adj.adjustmentDetails.tasksAdded.length > 0 && (
                    <div className="text-[11px] text-status-warning">
                      <strong>Remediation Tasks Injected:</strong> {adj.adjustmentDetails.tasksAdded.join(', ')}
                    </div>
                  )}

                  {adj.adjustmentDetails.tasksSkipped && adj.adjustmentDetails.tasksSkipped.length > 0 && (
                    <div className="text-[11px] text-status-success">
                      <strong>Milestones Accelerated/Skipped:</strong> {adj.adjustmentDetails.tasksSkipped.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
