import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { OfflineRoadmap, OfflineRoadmapPhase, OfflineRoadmapTask } from '../db/indexedDb';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  MapPin,
  CheckCircle2,
  Clock,
  RotateCcw,
  Download,
  Printer,
  FileText,
  AlertCircle,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LearningRoadmap: React.FC = () => {
  const { profile, refreshProfile } = useAuth();

  const [roadmap, setRoadmap] = useState<OfflineRoadmap | null>(null);
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'adjustments'>('timeline');
  const [selectedTask, setSelectedTask] = useState<OfflineRoadmapTask | null>(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [roadRes, adjRes] = await Promise.all([
        api.getRoadmap(),
        api.getRoadmapAdjustments()
      ]);
      setRoadmap(roadRes.roadmap);
      setAdjustments(adjRes.adjustments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile?.targetCareerRoleId]);

  const handleToggleTask = async (phaseId: string, taskId: string) => {
    try {
      const res = await api.toggleRoadmapTask(taskId);
      setRoadmap(res.roadmap);
      await refreshProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm('Recalculate and re-order roadmap milestones based on current skill gaps?')) return;
    setIsRegenerating(true);
    try {
      const res = await api.regenerateRoadmap();
      setRoadmap(res.roadmap);
      const adjRes = await api.getRoadmapAdjustments();
      setAdjustments(adjRes.adjustments || []);
      await refreshProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const openStudyGuide = (task: OfflineRoadmapTask) => {
    setSelectedTask(task);
    setIsGuideModalOpen(true);
  };

  // Offline Study Pack Exporter Functions
  const handleExportMarkdown = () => {
    if (!roadmap) return;
    let md = `# SkillPath Personalized Learning Roadmap\n`;
    md += `**Target Role:** ${roadmap.targetRoleTitle}\n`;
    md += `**Progress:** ${roadmap.overallProgressPercentage}%\n`;
    md += `**Generated:** ${new Date().toLocaleDateString()}\n\n`;
    md += `---\n\n`;

    roadmap.phases.forEach(phase => {
      md += `## ${phase.title} (${phase.status.toUpperCase()})\n`;
      md += `*${phase.description}*\n\n`;
      phase.tasks.forEach(task => {
        const check = task.completed ? '[x]' : '[ ]';
        const tag = task.isRemedial ? ' **[REMEDIAL FOCUS]**' : '';
        md += `- ${check}${tag} **${task.title}** (~${task.estimatedHours} hrs)\n`;
        md += `  - *Criteria:* ${task.criteria}\n`;
        if (task.studyGuideOffline) {
          md += `  - *Study Notes:*\n\n\`\`\`\n${task.studyGuideOffline}\n\`\`\`\n\n`;
        }
      });
      md += `\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SkillPath-Roadmap-${roadmap.targetRoleTitle.replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!roadmap) return;
    const jsonStr = JSON.stringify(roadmap, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SkillPath-Roadmap-Backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !roadmap) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-stitch-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-charcoal-muted dark:text-slate-400 font-mono">Loading personalized curriculum...</p>
        </div>
      </div>
    );
  }

  const totalTasks = roadmap.phases.reduce((a, b) => a + b.tasks.length, 0);
  const completedTasks = roadmap.phases.reduce((a, b) => a + b.tasks.filter(t => t.completed).length, 0);
  const remedialCount = roadmap.phases.reduce((a, b) => a + b.tasks.filter(t => t.isRemedial).length, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-charcoal dark:text-slate-100 tracking-tight font-sans">
              Adaptive Learning Roadmap & Resource Studio
            </h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-stitch-blue dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              {roadmap.targetRoleTitle}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-1">
            Sequential, dependency-aware milestone phases with offline-readable study guides and dynamic remedial re-routing.
          </p>
        </div>

        {/* Exporter Actions & Regenerate */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportMarkdown}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export .MD
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            leftIcon={<FileText className="w-3.5 h-3.5" />}
          >
            Backup .JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            {isRegenerating ? 'Recalibrating...' : 'Regenerate'}
          </Button>
        </div>
      </div>

      {/* Curriculum Progress Overview */}
      <Card className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-charcoal-subtle dark:text-slate-400 block">
              Curriculum Progress Velocity
            </span>
            <div className="text-xl font-bold text-charcoal dark:text-slate-100 mt-0.5 font-mono">
              {roadmap.overallProgressPercentage}% Complete · {completedTasks} of {totalTasks} Tasks Done
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {remedialCount > 0 && (
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {remedialCount} Remedial Modules Injected
              </span>
            )}
            <span className="text-charcoal-muted dark:text-slate-400 font-mono">
              Last Synced: {new Date(roadmap.lastAdjustedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-surface-border dark:border-surface-dark-border">
          <div
            className="h-full bg-stitch-blue transition-all duration-500"
            style={{ width: `${roadmap.overallProgressPercentage}%` }}
          />
        </div>
      </Card>

      {/* Tabs: Roadmap vs Dynamic Adjustments */}
      <div className="flex gap-2 border-b border-surface-border dark:border-surface-dark-border pb-2">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'timeline'
              ? 'bg-stitch-blue text-white font-semibold'
              : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal hover:bg-surface-subtle dark:hover:bg-slate-800'
          }`}
        >
          Dependency-Aware Phases ({roadmap.phases.length})
        </button>
        <button
          onClick={() => setActiveTab('adjustments')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'adjustments'
              ? 'bg-stitch-blue text-white font-semibold'
              : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal hover:bg-surface-subtle dark:hover:bg-slate-800'
          }`}
        >
          Dynamic Re-Routing Logs ({adjustments.length})
        </button>
      </div>

      {/* TAB 1: PHASES TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          {roadmap.phases.map(phase => {
            const isCompleted = phase.status === 'completed';
            const isInProgress = phase.status === 'in_progress';

            return (
              <Card key={phase.id} className="space-y-4 p-5 sm:p-6 border-l-4 border-l-stitch-blue">
                {/* Phase Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-border dark:border-surface-dark-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-stitch-blue uppercase tracking-wider">
                        Phase {phase.phaseNumber}
                      </span>
                      {isCompleted && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-status-success-bg dark:bg-emerald-950/40 text-status-success border border-emerald-200 dark:border-emerald-800/50">
                          Phase Completed
                        </span>
                      )}
                      {isInProgress && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-950/40 text-stitch-blue border border-blue-200 dark:border-blue-900">
                          Active Phase
                        </span>
                      )}
                      {!isCompleted && !isInProgress && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-charcoal-muted dark:text-slate-400 border border-surface-border dark:border-surface-dark-border">
                          Upcoming Milestone
                        </span>
                      )}
                    </div>

                    <h2 className="text-base font-bold text-charcoal dark:text-slate-100 mt-1">
                      {phase.title}
                    </h2>
                    <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5 leading-relaxed">
                      {phase.description}
                    </p>
                  </div>

                  <div className="text-xs text-charcoal-subtle dark:text-slate-400 shrink-0 font-mono">
                    ~{phase.estimatedWeeks} weeks @ {profile?.hoursPerWeek || 12}h/wk
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-2.5">
                  {phase.tasks.map(task => (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        task.isRemedial
                          ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20'
                          : task.completed
                          ? 'border-surface-border dark:border-surface-dark-border bg-surface-subtle/50 dark:bg-slate-800/20 opacity-80'
                          : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(phase.id, task.id)}
                          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            task.completed
                              ? 'bg-stitch-blue border-stitch-blue text-white'
                              : 'border-slate-300 dark:border-slate-600 hover:border-stitch-blue'
                          }`}
                        >
                          {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-subtle dark:bg-slate-800 border border-surface-border dark:border-surface-dark-border text-charcoal-muted dark:text-slate-400">
                              {task.type}
                            </span>
                            <span className={`text-xs font-semibold ${
                              task.completed ? 'line-through text-charcoal-subtle dark:text-slate-500' : 'text-charcoal dark:text-slate-100'
                            }`}>
                              {task.title}
                            </span>
                            {task.isRemedial && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                                Injected Remedial
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-charcoal-muted dark:text-slate-400 line-clamp-1">
                            {task.description}
                          </p>
                          <span className="text-[11px] text-charcoal-subtle dark:text-slate-500 block font-mono">
                            Criteria: {task.criteria}
                          </span>
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 pl-7 sm:pl-0">
                        <span className="text-[11px] font-mono text-charcoal-subtle dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.estimatedHours}h
                        </span>

                        {task.studyGuideOffline && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[11px]"
                            onClick={() => openStudyGuide(task)}
                            leftIcon={<BookOpen className="w-3 h-3 text-stitch-blue" />}
                          >
                            Study Guide
                          </Button>
                        )}

                        {task.type === 'Assessment' ? (
                          <Link to="/assessments">
                            <Button variant="primary" size="sm" className="text-[11px]">
                              Take Check
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            variant={task.completed ? 'outline' : 'primary'}
                            size="sm"
                            className="text-[11px]"
                            onClick={() => handleToggleTask(phase.id, task.id)}
                          >
                            {task.completed ? 'Completed' : 'Mark Done'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB 2: ADJUSTMENT LOGS */}
      {activeTab === 'adjustments' && (
        <Card className="space-y-4">
          <div className="pb-3 border-b border-surface-border dark:border-surface-dark-border">
            <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">
              Dynamic Re-Routing Telemetry History
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Deterministic audit logs tracking real-time roadmap adjustments when quiz scores drop below 70% or target careers change.
            </p>
          </div>

          {adjustments.length === 0 ? (
            <p className="py-8 text-center text-xs text-charcoal-subtle">No adaptive adjustments recorded yet.</p>
          ) : (
            <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
              {adjustments.map(log => (
                <div key={log.id} className="py-3.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-charcoal dark:text-slate-100">
                      {log.triggerEvent}
                    </span>
                    <span className="text-[11px] font-mono text-charcoal-subtle dark:text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-charcoal-muted dark:text-slate-400">
                    {log.description}
                  </p>
                  <div className="p-2.5 rounded bg-surface-subtle dark:bg-slate-800/50 border border-surface-border dark:border-surface-dark-border text-[11px] text-charcoal dark:text-slate-300">
                    <strong>Curriculum Adaptation: </strong>
                    {log.changesSummary}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* OFFLINE STUDY GUIDE MODAL */}
      <Modal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        title={selectedTask ? `Offline Study Guide: ${selectedTask.title}` : 'Study Guide'}
      >
        <div className="space-y-4">
          <div className="p-4 bg-surface-subtle dark:bg-slate-900 rounded-lg border border-surface-border dark:border-surface-dark-border font-sans text-xs leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap text-charcoal dark:text-slate-200">
            {selectedTask?.studyGuideOffline || 'Offline guide not attached.'}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-surface-border dark:border-surface-dark-border">
            <span className="text-[11px] font-mono text-status-success flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Cached 100% Offline in IndexedDB
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (selectedTask) handleToggleTask('', selectedTask.id);
                setIsGuideModalOpen(false);
              }}
            >
              Mark Guide Completed
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LearningRoadmap;
