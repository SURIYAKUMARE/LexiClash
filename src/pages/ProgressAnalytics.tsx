import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { WeeklyActivityChart } from '../components/charts/WeeklyActivityChart';
import {
  Flame,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface MilestoneItem {
  id: string;
  title: string;
  phase: string;
  percentage: number;
  status: 'completed' | 'in_progress' | 'upcoming';
  targetDate: string;
  deliverable: string;
}

export const ProgressAnalytics: React.FC = () => {
  const { profile } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const milestones: MilestoneItem[] = [
    {
      id: 'm-1',
      title: 'Full Stack Onboarding & Baseline Diagnostic',
      phase: 'Foundations',
      percentage: 100,
      status: 'completed',
      targetDate: 'Oct 28',
      deliverable: 'Completed initial skill inventory and career path selection.'
    },
    {
      id: 'm-2',
      title: 'JavaScript Asynchronous Architecture & Event Loop',
      phase: 'Phase 1',
      percentage: 100,
      status: 'completed',
      targetDate: 'Nov 4',
      deliverable: 'Verified mastery of closures, Promise lifecycle, and microtasks.'
    },
    {
      id: 'm-3',
      title: 'Modern React Architecture & Component Composition',
      phase: 'Phase 2',
      percentage: 100,
      status: 'completed',
      targetDate: 'Nov 11',
      deliverable: 'Constructed custom hooks and optimized rerender cycles.'
    },
    {
      id: 'm-4',
      title: 'Node.js Concurrency, Streams & Express Middleware',
      phase: 'Phase 3 (Current)',
      percentage: 65,
      status: 'in_progress',
      targetDate: 'Nov 18',
      deliverable: 'In progress: Pass the Node.js diagnostic quiz to close current -2 level gap.'
    },
    {
      id: 'm-5',
      title: 'PostgreSQL Relational Modeling & Index Tuning',
      phase: 'Phase 4',
      percentage: 0,
      status: 'upcoming',
      targetDate: 'Nov 25',
      deliverable: 'Design schema with foreign constraints and analyze query plans with EXPLAIN.'
    },
    {
      id: 'm-6',
      title: 'Production Dockerized Full Stack Web Application',
      phase: 'Capstone',
      percentage: 0,
      status: 'upcoming',
      targetDate: 'Dec 5',
      deliverable: 'Deploy complete RESTful service with CI/CD pipeline and automated tests.'
    }
  ];

  if (isLoading || !analytics) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-charcoal-muted dark:text-slate-400 font-medium">Loading telemetry and progress...</p>
        </div>
      </div>
    );
  }

  const { metrics, weeklyActivity } = analytics;
  const streakDays = metrics?.streakDays || 9;
  const learningHours = metrics?.totalLearningHours || 36.5;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
        <div>
          <h1 className="text-2xl font-bold text-charcoal dark:text-slate-100 tracking-tight">
            Progress & Milestones
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-1">
            Study habit consistency, weekly time distribution, and full-stack career milestone velocity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/roadmap">
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1">
              View Learning Roadmap <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </div>

      {/* Row 1: Streak & KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak Card */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-muted dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Consistency Streak</span>
            <Flame className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-charcoal dark:text-slate-100">{streakDays} Days</div>
            <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">Consecutive daily study sessions</p>
          </div>
          <div className="text-[11px] font-medium text-status-success bg-status-success-bg dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded w-fit">
            Best record: 14 days
          </div>
        </Card>

        {/* Total Time */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-muted dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Study Time</span>
            <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-charcoal dark:text-slate-100">{learningHours}h</div>
            <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">Logged across tasks & quizzes</p>
          </div>
          <div className="text-[11px] text-charcoal-muted dark:text-slate-400">
            Avg: 3.1h / study day
          </div>
        </Card>

        {/* Tasks Completed */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-muted dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Tasks Finished</span>
            <CheckCircle2 className="w-4 h-4 text-status-success" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-charcoal dark:text-slate-100">
              {metrics?.completedTasksCount || 14}
            </div>
            <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">Of 24 roadmap assignments</p>
          </div>
          <div className="text-[11px] text-charcoal-muted dark:text-slate-400">
            58% of curriculum tasks done
          </div>
        </Card>

        {/* Verified Readiness */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-muted dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Role Readiness</span>
            <Target className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-brand-700 dark:text-brand-400">
              {metrics?.overallReadinessScore || 72}%
            </div>
            <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">Benchmark for Full Stack</p>
          </div>
          <div className="text-[11px] text-status-success font-medium">
            +14% since onboarding
          </div>
        </Card>
      </div>

      {/* Row 2: Weekly Activity Chart Card */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-border dark:border-surface-dark-border">
          <div>
            <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">
              Weekly Study Distribution
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Hours logged each day over the past 7 days.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-1 rounded border border-brand-200 dark:border-brand-900">
              Total this week: 21.5h
            </span>
          </div>
        </div>

        <div className="py-2">
          <WeeklyActivityChart data={weeklyActivity || []} />
        </div>

        <div className="pt-3 border-t border-surface-border dark:border-surface-dark-border grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-charcoal-muted dark:text-slate-400 text-center">
          <div className="p-2 bg-surface-subtle dark:bg-slate-800/40 rounded-lg">
            <span className="block text-[11px] text-charcoal-subtle dark:text-slate-500">Peak Day</span>
            <strong className="text-charcoal dark:text-slate-200">Saturday (5.0h)</strong>
          </div>
          <div className="p-2 bg-surface-subtle dark:bg-slate-800/40 rounded-lg">
            <span className="block text-[11px] text-charcoal-subtle dark:text-slate-500">Weekly Goal</span>
            <strong className="text-charcoal dark:text-slate-200">10.0h (Surpassed: 21.5h)</strong>
          </div>
          <div className="p-2 bg-surface-subtle dark:bg-slate-800/40 rounded-lg">
            <span className="block text-[11px] text-charcoal-subtle dark:text-slate-500">Velocity Change</span>
            <strong className="text-status-success">+3.5h vs. last week</strong>
          </div>
        </div>
      </Card>

      {/* Row 3: Career Milestones */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border dark:border-surface-dark-border">
          <div>
            <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">
              Engineering Path Milestones
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Key milestones on your path to Full Stack Developer readiness.
            </p>
          </div>
          <span className="text-xs text-charcoal-subtle dark:text-slate-400">
            3 of 6 Milestones Completed
          </span>
        </div>

        <div className="space-y-3">
          {milestones.map(m => (
            <div
              key={m.id}
              className="p-4 rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-charcoal dark:text-slate-100">
                    {m.title}
                  </span>
                  <span className="text-[11px] text-charcoal-subtle dark:text-slate-400">
                    ({m.phase})
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-charcoal-subtle dark:text-slate-400">
                    Target: {m.targetDate}
                  </span>
                  {m.status === 'completed' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-status-success-bg dark:bg-emerald-950/40 text-status-success border border-emerald-200 dark:border-emerald-800/50">
                      Completed
                    </span>
                  )}
                  {m.status === 'in_progress' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900">
                      In Progress
                    </span>
                  )}
                  {m.status === 'upcoming' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-charcoal-muted dark:text-slate-400 border border-surface-border dark:border-surface-dark-border">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-charcoal-muted dark:text-slate-400">
                {m.deliverable}
              </p>

              {/* Milestone Progress Bar */}
              <div className="pt-1">
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      m.status === 'completed'
                        ? 'bg-status-success'
                        : 'bg-brand-600 dark:bg-brand-500'
                    }`}
                    style={{ width: `${m.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ProgressAnalytics;
