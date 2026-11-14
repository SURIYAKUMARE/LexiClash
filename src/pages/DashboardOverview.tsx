import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LearningRoadmap, Skill, CareerRole } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { WeeklyActivityChart } from '../components/charts/WeeklyActivityChart';
import {
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Target,
  BookOpen
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { user, profile } = useAuth();

  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [targetRole, setTargetRole] = useState<CareerRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedTasksState, setCompletedTasksState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [roadmapRes, skillsRes, analyticsRes, careersRes] = await Promise.all([
          api.getRoadmap(),
          api.getSkills(),
          api.getAnalytics(),
          api.getCareers()
        ]);

        setRoadmap((roadmapRes.roadmap as any) || null);
        setSkills(skillsRes.skills || []);
        setAnalyticsData(analyticsRes);

        const currentRoleId = profile?.targetCareerRoleId || roadmapRes.roadmap?.targetRoleId || 'role-fullstack';
        const matchedRole = careersRes.careers.find(r => r.id === currentRoleId) || careersRes.careers[0];
        setTargetRole((matchedRole as any) || null);

        // Initialize completed tasks state from roadmap
        if (roadmapRes.roadmap) {
          const map: Record<string, boolean> = {};
          roadmapRes.roadmap.phases.forEach(phase => {
            phase.tasks.forEach(task => {
              map[task.id] = task.completed;
            });
          });
          setCompletedTasksState(map);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [profile?.targetCareerRoleId]);

  const handleToggleTask = async (phaseId: string, taskId: string) => {
    const nextState = !completedTasksState[taskId];
    setCompletedTasksState(prev => ({ ...prev, [taskId]: nextState }));
    try {
      await api.updateRoadmapTask(phaseId, taskId, nextState);
    } catch (err) {
      console.error('Failed to sync task toggle:', err);
      // Revert if error
      setCompletedTasksState(prev => ({ ...prev, [taskId]: !nextState }));
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-charcoal-muted dark:text-slate-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Active Phase & Tasks
  const activePhase = roadmap?.phases.find(p => p.status === 'in_progress') || roadmap?.phases[0];
  const thisWeeksTasks = activePhase?.tasks.slice(0, 5) || [];

  // Full Stack benchmark skills & gaps
  const benchmarkSkills = [
    { name: 'JavaScript', category: 'Language', targetLevel: 5, defaultCurrent: 4 },
    { name: 'React', category: 'Framework', targetLevel: 4, defaultCurrent: 3 },
    { name: 'Node.js', category: 'Runtime', targetLevel: 4, defaultCurrent: 2 },
    { name: 'TypeScript', category: 'Language', targetLevel: 4, defaultCurrent: 3 },
    { name: 'PostgreSQL', category: 'Database', targetLevel: 3, defaultCurrent: 2 },
    { name: 'Docker', category: 'DevOps', targetLevel: 3, defaultCurrent: 1 }
  ];

  const skillGaps = benchmarkSkills.map(b => {
    const matched = skills.find(s => {
      const sName = (s as any).skillName || (s as any).name || '';
      return sName.toLowerCase() === b.name.toLowerCase();
    });
    const currentLevel = matched ? matched.proficiencyLevel : b.defaultCurrent;
    const gap = b.targetLevel - currentLevel;
    return {
      name: b.name,
      category: b.category,
      currentLevel,
      targetLevel: b.targetLevel,
      gap,
      isMet: gap <= 0
    };
  });

  const readinessScore = profile?.overallReadinessScore || 72;
  const streakDays = profile?.streakDays || 9;
  const learningHours = profile?.totalLearningHours || 36.5;

  // SVG calculations for goal progress ring
  const circleRadius = 56;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (readinessScore / 100) * circumference;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
        <div>
          <h1 className="text-2xl font-bold text-charcoal dark:text-slate-100 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-1">
            Track your {targetRole?.title || 'Full Stack Developer'} preparation, target milestones, and weekly progress.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/careers">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card text-xs font-medium text-charcoal dark:text-slate-200 hover:bg-surface-subtle dark:hover:bg-slate-800 transition-colors">
              <Target className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Target: <strong className="font-semibold text-brand-600 dark:text-brand-400">{targetRole?.title || 'Full Stack Developer'}</strong></span>
              <ChevronRight className="w-3.5 h-3.5 text-charcoal-subtle dark:text-slate-500" />
            </span>
          </Link>
          <Link to="/roadmap">
            <Button size="sm" variant="primary">
              View Roadmap
            </Button>
          </Link>
        </div>
      </div>

      {/* Row 1: Goal Progress Ring & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goal Progress Ring Card */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border dark:border-surface-dark-border">
            <div>
              <span className="text-xs font-semibold text-charcoal-subtle dark:text-slate-400 uppercase tracking-wider">
                Target Role Alignment
              </span>
              <h2 className="text-base font-bold text-charcoal dark:text-slate-100 mt-0.5">
                {targetRole?.title || 'Full Stack Developer'}
              </h2>
            </div>
            <Badge variant="brand" size="sm">
              In Progress
            </Badge>
          </div>

          <div className="py-6 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r={circleRadius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  className="text-slate-100 dark:text-slate-800"
                />
                <circle
                  cx="70"
                  cy="70"
                  r={circleRadius}
                  stroke="#0F5C7A"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-charcoal dark:text-slate-100 tracking-tight">
                  {readinessScore}%
                </span>
                <span className="text-[11px] font-medium text-charcoal-subtle dark:text-slate-400">
                  Target: 100%
                </span>
              </div>
            </div>

            <p className="text-xs text-charcoal-muted dark:text-slate-400 text-center mt-3 max-w-xs">
              Based on required competencies for mid-to-senior full-stack engineering roles.
            </p>
          </div>

          <div className="pt-3 border-t border-surface-border dark:border-surface-dark-border grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-surface-subtle dark:bg-slate-800/50 rounded-lg">
              <span className="text-xs text-charcoal-muted dark:text-slate-400 block">Skills Met</span>
              <span className="text-sm font-bold text-charcoal dark:text-slate-100">
                {skillGaps.filter(s => s.isMet).length} of {skillGaps.length}
              </span>
            </div>
            <div className="p-2 bg-surface-subtle dark:bg-slate-800/50 rounded-lg">
              <span className="text-xs text-charcoal-muted dark:text-slate-400 block">Tasks Done</span>
              <span className="text-sm font-bold text-charcoal dark:text-slate-100">
                {roadmap?.overallProgressPercentage || 42}%
              </span>
            </div>
          </div>
        </Card>

        {/* 2x2 Metric Counters */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="flex flex-col justify-between">
            <div className="flex items-center justify-between text-charcoal-muted dark:text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Streak</span>
              <Flame className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-charcoal dark:text-slate-100">{streakDays} Days</div>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">Consecutive daily study sessions</p>
            </div>
            <div className="text-[11px] font-medium text-status-success bg-status-success-bg dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-lg w-fit">
              +2 days since last week
            </div>
          </Card>

          <Card className="flex flex-col justify-between">
            <div className="flex items-center justify-between text-charcoal-muted dark:text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Study Time</span>
              <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-charcoal dark:text-slate-100">{learningHours} hrs</div>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">Across completed exercises and tasks</p>
            </div>
            <div className="text-[11px] font-medium text-charcoal-subtle dark:text-slate-400 bg-surface-subtle dark:bg-slate-800/50 border border-surface-border dark:border-surface-dark-border px-2.5 py-1 rounded-lg w-fit">
              Goal: 10 hrs / week
            </div>
          </Card>

          <Card className="flex flex-col justify-between">
            <div className="flex items-center justify-between text-charcoal-muted dark:text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Verified Competencies</span>
              <CheckCircle2 className="w-4 h-4 text-status-success" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-charcoal dark:text-slate-100">
                {skills.filter(s => s.isVerified).length} / {skills.length || 6}
              </div>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">Validated through diagnostic quizzes</p>
            </div>
            <Link to="/assessments" className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium inline-flex items-center gap-1">
              Verify pending skills <ArrowRight className="w-3 h-3" />
            </Link>
          </Card>

          <Card className="flex flex-col justify-between">
            <div className="flex items-center justify-between text-charcoal-muted dark:text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Current Phase</span>
              <TrendingUp className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="my-2">
              <div className="text-base font-bold text-charcoal dark:text-slate-100 truncate">
                {activePhase?.title || 'Phase 1: Foundations'}
              </div>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
                Week 3 of 12 · 4 tasks remaining
              </p>
            </div>
            <Link to="/roadmap" className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium inline-flex items-center gap-1">
              View phase curriculum <ArrowRight className="w-3 h-3" />
            </Link>
          </Card>
        </div>
      </div>

      {/* Row 2: Skill Gaps Table & Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Gaps Table (2 cols) */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-border dark:border-surface-dark-border">
            <div>
              <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">
                Target Skill Gaps: Full Stack Developer
              </h2>
              <p className="text-xs text-charcoal-muted dark:text-slate-400">
                Benchmark requirement vs. your current verified level (Scale: 1 to 5).
              </p>
            </div>
            <Link to="/skills">
              <Button size="sm" variant="outline">
                Manage Skills
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-border dark:border-surface-dark-border text-charcoal-muted dark:text-slate-400">
                  <th className="py-2.5 font-semibold">Skill</th>
                  <th className="py-2.5 font-semibold">Category</th>
                  <th className="py-2.5 font-semibold">Current Level</th>
                  <th className="py-2.5 font-semibold">Target Level</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
                {skillGaps.map(skill => (
                  <tr key={skill.name} className="hover:bg-surface-subtle dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-semibold text-charcoal dark:text-slate-100">
                      {skill.name}
                    </td>
                    <td className="py-3 text-charcoal-muted dark:text-slate-400">
                      {skill.category}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(lvl => (
                            <span
                              key={lvl}
                              className={`w-3 h-1.5 rounded-[2px] ${
                                lvl <= skill.currentLevel
                                  ? 'bg-brand-600 dark:bg-brand-500'
                                  : 'bg-slate-200 dark:bg-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-charcoal-muted dark:text-slate-400 ml-1">
                          {skill.currentLevel}/5
                        </span>
                      </div>
                    </td>
                    <td className="py-3 font-medium text-charcoal dark:text-slate-300">
                      Level {skill.targetLevel}/5
                    </td>
                    <td className="py-3">
                      {skill.isMet ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-status-success-bg dark:bg-emerald-950/40 text-status-success border border-emerald-200 dark:border-emerald-800/50">
                          Met
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                          Gap ({skill.gap > 0 ? `-${skill.gap}` : skill.gap})
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {skill.isMet ? (
                        <Link to="/resources" className="text-[11px] text-charcoal-subtle hover:text-charcoal dark:text-slate-400 dark:hover:text-slate-200 font-medium">
                          Review
                        </Link>
                      ) : (
                        <Link to="/assessments" className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-medium">
                          Assess
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Weekly Activity Chart */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border dark:border-surface-dark-border">
            <div>
              <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">Study Activity</h2>
              <p className="text-xs text-charcoal-muted dark:text-slate-400">Weekly logged study hours</p>
            </div>
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-900">
              21.5h Total
            </span>
          </div>

          <div className="py-2 flex-1 flex items-center justify-center">
            <WeeklyActivityChart data={analyticsData?.weeklyActivity || [
              { day: 'Mon', hours: 2.5, tasksCompleted: 2 },
              { day: 'Tue', hours: 3.0, tasksCompleted: 3 },
              { day: 'Wed', hours: 1.5, tasksCompleted: 1 },
              { day: 'Thu', hours: 4.0, tasksCompleted: 4 },
              { day: 'Fri', hours: 2.0, tasksCompleted: 2 },
              { day: 'Sat', hours: 5.0, tasksCompleted: 4 },
              { day: 'Sun', hours: 3.5, tasksCompleted: 3 }
            ]} />
          </div>

          <div className="pt-3 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between text-xs text-charcoal-muted dark:text-slate-400">
            <span>Avg: 3.1h / day</span>
            <span className="text-status-success font-medium">Consistent daily pace</span>
          </div>
        </Card>
      </div>

      {/* Row 3: This Week's Tasks & Mentor Tip Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* This Week's Tasks (2 cols) */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border dark:border-surface-dark-border">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">
                  This Week's Tasks
                </h2>
                <span className="text-[11px] font-medium text-charcoal-subtle dark:text-slate-400 bg-surface-subtle dark:bg-slate-800 px-2 py-0.5 rounded border border-surface-border dark:border-surface-dark-border">
                  Week 3
                </span>
              </div>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
                Check off items as you complete them to sync roadmap progress.
              </p>
            </div>
            <Link to="/roadmap" className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">
              All Tasks →
            </Link>
          </div>

          {thisWeeksTasks.length === 0 ? (
            <div className="p-6 text-center text-xs text-charcoal-muted dark:text-slate-400 border border-dashed border-surface-border dark:border-surface-dark-border rounded-lg">
              No tasks assigned for this week yet. Visit your roadmap to generate new milestones.
            </div>
          ) : (
            <div className="space-y-2">
              {thisWeeksTasks.map(task => {
                const isCompleted = !!completedTasksState[task.id];
                return (
                  <div
                    key={task.id}
                    className={`flex items-start justify-between p-3 rounded-lg border transition-all ${
                      isCompleted
                        ? 'bg-surface-subtle/50 dark:bg-slate-800/30 border-surface-border dark:border-surface-dark-border opacity-70'
                        : 'bg-white dark:bg-surface-dark-card border-surface-border dark:border-surface-dark-border hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(activePhase?.id || 'phase-1', task.id)}
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isCompleted
                            ? 'bg-brand-600 border-brand-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-brand-600'
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                      <div>
                        <span
                          className={`text-xs font-semibold block ${
                            isCompleted
                              ? 'line-through text-charcoal-subtle dark:text-slate-500'
                              : 'text-charcoal dark:text-slate-100'
                          }`}
                        >
                          {task.title}
                        </span>
                        <p className="text-[11px] text-charcoal-muted dark:text-slate-400 mt-0.5 line-clamp-1">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-[11px] text-charcoal-subtle dark:text-slate-400">
                        {task.estimatedHours}h
                      </span>
                      {isCompleted ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-status-success-bg dark:bg-emerald-950/40 text-status-success border border-emerald-200 dark:border-emerald-800/50">
                          Completed
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-charcoal-muted dark:text-slate-300 border border-surface-border dark:border-surface-dark-border">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Mentor Tip Card */}
        <Card className="flex flex-col justify-between border-l-4 border-l-brand-600 dark:border-l-brand-500">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border dark:border-surface-dark-border">
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                Mentor Recommendation
              </span>
              <span className="text-[10px] text-charcoal-subtle dark:text-slate-500">
                Weekly Brief
              </span>
            </div>

            <h3 className="text-sm font-bold text-charcoal dark:text-slate-100 leading-snug">
              Master asynchronous patterns in Node.js & indexing in PostgreSQL
            </h3>

            <p className="text-xs text-charcoal-muted dark:text-slate-300 leading-relaxed">
              Based on your Full Stack Developer gap analysis, your largest deltas are in runtime concurrency (Node.js event loop) and database query optimization. 
              Closing these two competencies will elevate your role readiness from 72% to over 85%.
            </p>

            <div className="p-3 bg-surface-subtle dark:bg-slate-800/60 rounded-lg border border-surface-border dark:border-surface-dark-border text-xs text-charcoal-muted dark:text-slate-300 space-y-1">
              <span className="font-semibold text-charcoal dark:text-slate-100 block">Suggested next action:</span>
              <p className="text-[11px]">
                Complete the Node.js Diagnostic Assessment to verify event loop and stream handling.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between">
            <Link to="/mentor" className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold inline-flex items-center gap-1">
              Discuss with Mentor <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/assessments">
              <Button size="sm" variant="outline">
                Take Quiz
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
export default DashboardOverview;
