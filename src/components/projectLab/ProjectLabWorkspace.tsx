import React, { useState } from 'react';
import { SEED_LAB_PROJECTS } from '../../projectLab/seedProjectTracks';
import { LabProjectTrack, ProjectEvaluationResult } from '../../projectLab/types';
import { ProjectLabEvaluator } from '../../projectLab/projectEvaluator';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  FolderGit2,
  GitBranch,
  CheckCircle2,
  Clock,
  Award,
  ExternalLink,
  Layers,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProjectLabWorkspace: React.FC = () => {
  const { user } = useAuth();
  const [selectedComplexity, setSelectedComplexity] = useState<string>('All');
  const [activeProject, setActiveProject] = useState<LabProjectTrack>(SEED_LAB_PROJECTS[0]);

  // Submission Form State
  const [completedMilestones, setCompletedMilestones] = useState<string[]>(
    SEED_LAB_PROJECTS[0].milestones.map(m => m.id)
  );
  const [githubUrl, setGithubUrl] = useState('https://github.com/alex-developer/distributed-task-queue');
  const [branch, setBranch] = useState('main');
  const [commitHash, setCommitHash] = useState('a8f924c');
  const [architecturalNotes, setArchitecturalNotes] = useState(
    'Implemented priority min-heap queue with worker thread concurrency. Added dead-letter queue with exponential backoff retry.'
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<ProjectEvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredProjects = selectedComplexity === 'All'
    ? SEED_LAB_PROJECTS
    : SEED_LAB_PROJECTS.filter(p => p.complexity === selectedComplexity);

  const handleSelectProject = (proj: LabProjectTrack) => {
    setActiveProject(proj);
    setCompletedMilestones(proj.milestones.map(m => m.id));
    setEvaluationResult(null);
    setError(null);
  };

  const toggleMilestone = (id: string) => {
    setCompletedMilestones(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsEvaluating(true);
    try {
      const result = await ProjectLabEvaluator.evaluateProject(
        activeProject,
        {
          projectId: activeProject.id,
          githubRepoUrl: githubUrl,
          branch,
          commitHash,
          completedMilestoneIds: completedMilestones,
          architecturalNotes
        },
        user?.id || 'demo-user'
      );
      setEvaluationResult(result);
    } catch (err: any) {
      setError(err?.message || 'Project evaluation failed.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Verifiable Capstones v2.5
            </span>
            <span className="text-xs text-charcoal-subtle dark:text-slate-400 font-mono">
              Milestone &amp; GitHub Rubrics
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-charcoal dark:text-slate-100 tracking-tight">
            Real-World Project Lab
          </h2>
          <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
            Construct production-quality engineering systems. Submit your GitHub repositories for automated rubric verification.
          </p>
        </div>

        {/* Complexity Filter */}
        <div className="flex items-center gap-1.5 bg-surface-subtle dark:bg-slate-800/80 p-1 rounded-xl border border-surface-border dark:border-surface-dark-border text-xs font-semibold">
          {['All', 'Beginner', 'Intermediate', 'Advanced', 'Capstone'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedComplexity(lvl)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedComplexity === lvl
                  ? 'bg-white dark:bg-surface-dark text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Project Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredProjects.map(proj => {
          const isSelected = proj.id === activeProject.id;
          return (
            <div
              key={proj.id}
              onClick={() => handleSelectProject(proj)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-brand-600 bg-brand-50/20 dark:bg-brand-950/20 ring-1 ring-brand-600'
                  : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-subtle dark:text-slate-400">
                  {proj.domain} &bull; {proj.estimatedHours}h
                </span>
                <Badge
                  variant={
                    proj.complexity === 'Capstone'
                      ? 'danger'
                      : proj.complexity === 'Advanced'
                      ? 'warning'
                      : proj.complexity === 'Intermediate'
                      ? 'info'
                      : 'neutral'
                  }
                  size="sm"
                >
                  {proj.complexity}
                </Badge>
              </div>
              <h3 className="text-xs font-bold text-charcoal dark:text-white line-clamp-1">
                {proj.title}
              </h3>
              <p className="text-[11px] text-charcoal-muted dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {proj.elevatorPitch}
              </p>
              <div className="flex flex-wrap gap-1 mt-2.5">
                {proj.technologies.slice(0, 3).map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded bg-surface-subtle dark:bg-slate-800 text-[10px] font-mono text-charcoal-muted"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Result Scorecard if Evaluated */}
      {evaluationResult && (
        <Card className="space-y-4 border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200 dark:border-emerald-900">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Project Rubric Verification Passed
                </span>
                <h3 className="text-base font-bold text-charcoal dark:text-white">
                  {evaluationResult.projectTitle} &bull; Score: {evaluationResult.totalScore}%
                </h3>
              </div>
            </div>

            {evaluationResult.verifiableCredentialId && (
              <div className="flex items-center gap-2">
                <Link to="/portfolio">
                  <Button size="sm" variant="primary" className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    View Skill Passport Credential
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <p className="text-xs text-charcoal-muted dark:text-slate-300 leading-relaxed">
            {evaluationResult.feedbackSummary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {evaluationResult.criteriaScores.map((c, i) => (
              <div key={i} className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-800/80">
                <div className="flex justify-between font-bold text-charcoal dark:text-slate-200 mb-1">
                  <span>{c.name}</span>
                  <span className="text-emerald-600 font-mono">{c.score}/{c.maxScore}</span>
                </div>
                <p className="text-[10px] text-charcoal-muted dark:text-slate-400 leading-tight">
                  {c.feedback}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Split-Pane Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Pane (5 Cols): Project Specs & Milestones */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border dark:border-surface-dark-border">
              <span className="text-xs font-bold text-charcoal dark:text-white">
                Milestones &amp; Acceptance Criteria
              </span>
              <span className="text-[10px] font-mono text-charcoal-subtle">
                {completedMilestones.length} of {activeProject.milestones.length} Completed
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-charcoal dark:text-white">
                {activeProject.title}
              </h3>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-1 leading-relaxed">
                {activeProject.elevatorPitch}
              </p>
            </div>

            {/* Milestones checklist */}
            <div className="space-y-2.5">
              {activeProject.milestones.map(m => {
                const isChecked = completedMilestones.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => toggleMilestone(m.id)}
                    className={`p-3 rounded-xl border text-xs transition-all cursor-pointer select-none ${
                      isChecked
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20'
                        : 'border-surface-border dark:border-surface-dark-border bg-surface-subtle dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                      />
                      <div className="space-y-1">
                        <span className="font-bold text-charcoal dark:text-slate-200">
                          Phase {m.stepNumber}: {m.title}
                        </span>
                        <p className="text-[11px] text-charcoal-muted dark:text-slate-400">
                          {m.deliverable}
                        </p>
                        <ul className="space-y-0.5 text-[10px] text-charcoal-subtle dark:text-slate-500 pt-1">
                          {m.acceptanceCriteria.map((crit, idx) => (
                            <li key={idx}>&bull; {crit}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Template Link */}
            <div className="pt-3 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between text-xs">
              <span className="text-charcoal-muted">GitHub Starter Boilerplate:</span>
              <a
                href={activeProject.starterGithubTemplate}
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1 text-[11px]"
              >
                Template Repo <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </Card>
        </div>

        {/* Right Pane (7 Cols): GitHub Repository Submission Form */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="space-y-4">
            <div className="pb-3 border-b border-surface-border dark:border-surface-dark-border">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <h3 className="text-xs font-bold text-charcoal dark:text-white">
                  GitHub Repository Submission
                </h3>
              </div>
              <p className="text-[11px] text-charcoal-muted dark:text-slate-400 mt-0.5">
                Submit your public or educational repository URL. The automated rubric validator will review architecture and deliverables.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
                  GitHub Repository URL
                </label>
                <div className="relative">
                  <FolderGit2 className="w-4 h-4 text-charcoal-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    required
                    value={githubUrl}
                    onChange={e => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-surface-border dark:border-surface-dark-border bg-white dark:bg-slate-800 text-charcoal dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
                    Branch Name
                  </label>
                  <div className="relative">
                    <GitBranch className="w-4 h-4 text-charcoal-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={branch}
                      onChange={e => setBranch(e.target.value)}
                      placeholder="main"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-surface-border dark:border-surface-dark-border bg-white dark:bg-slate-800 text-charcoal dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
                    Commit SHA (Optional)
                  </label>
                  <input
                    type="text"
                    value={commitHash}
                    onChange={e => setCommitHash(e.target.value)}
                    placeholder="e.g. 8f92a4c"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border dark:border-surface-dark-border bg-white dark:bg-slate-800 text-charcoal dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
                  Architectural Summary &amp; Design Notes
                </label>
                <textarea
                  rows={4}
                  value={architecturalNotes}
                  onChange={e => setArchitecturalNotes(e.target.value)}
                  placeholder="Detail your component design, concurrency handling, error recovery, and testing coverage..."
                  className="w-full p-3 text-xs rounded-xl border border-surface-border dark:border-surface-dark-border bg-white dark:bg-slate-800 text-charcoal dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-600 leading-relaxed font-sans"
                />
              </div>

              {/* Rubric Criteria Summary */}
              <div>
                <span className="text-[11px] font-bold text-charcoal dark:text-slate-200 uppercase tracking-wider block mb-2">
                  Scoring Rubric Breakdown (Min 70% to Pass)
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {activeProject.rubricCriteria.map(rc => (
                    <div key={rc.id} className="p-2 rounded-lg bg-surface-subtle dark:bg-slate-800 border border-surface-border dark:border-surface-dark-border flex justify-between items-center">
                      <span className="text-charcoal-muted truncate pr-2">{rc.name}</span>
                      <span className="font-mono font-bold text-brand-600">{rc.maxScore} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isEvaluating}
                className="w-full text-xs py-2.5 shadow-sm"
              >
                {isEvaluating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Validating Repository &amp; Rubric Criteria...
                  </>
                ) : (
                  <>
                    Submit Project for Rubric Evaluation
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
