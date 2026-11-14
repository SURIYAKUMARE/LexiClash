import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SkillRadarChart } from '../components/charts/SkillRadarChart';
import { WeeklyActivityChart } from '../components/charts/WeeklyActivityChart';
import { ProgressTrendChart } from '../components/charts/ProgressTrendChart';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  Award,
  Calendar
} from 'lucide-react';

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

  if (isLoading || !analytics) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { metrics, radarData, weeklyActivity, progressTimeline, assessmentStats } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-charcoal">Progress & Learning Analytics</h1>
        <p className="text-xs text-charcoal-muted">
          Continuous telemetry tracking your study velocity, skill growth, assessment accuracy, and consistency streak.
        </p>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[10px] font-semibold text-charcoal-subtle uppercase tracking-wider block">Consistency Streak</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{metrics.streakDays} Days</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <span className="text-[11px] text-charcoal-muted mt-1 block">Active learning streak</span>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-semibold text-charcoal-subtle uppercase tracking-wider block">Verified Skills</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-status-success">{metrics.verifiedSkills}</span>
            <span className="text-xs text-charcoal-muted">of {metrics.totalSkills} total</span>
          </div>
          <span className="text-[11px] text-charcoal-muted mt-1 block">Validated by testing</span>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-semibold text-charcoal-subtle uppercase tracking-wider block">Assessment Accuracy</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand-600">{metrics.averageAssessmentScore}%</span>
            <span className="text-xs text-charcoal-muted">Avg Score</span>
          </div>
          <span className="text-[11px] text-charcoal-muted mt-1 block">{metrics.assessmentsTaken} assessments completed</span>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-semibold text-charcoal-subtle uppercase tracking-wider block">Total Effort Logged</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-charcoal">{metrics.totalLearningHours}h</span>
            <Clock className="w-4 h-4 text-charcoal-subtle" />
          </div>
          <span className="text-[11px] text-charcoal-muted mt-1 block">{metrics.completedTasksCount} roadmap tasks</span>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-surface-border pb-3 mb-2">
              <h3 className="text-sm font-bold text-charcoal">Competency Growth by Category</h3>
              <Badge variant="brand" size="sm">Radar Metrics</Badge>
            </div>
            <p className="text-xs text-charcoal-muted mb-4">
              Multi-axis evaluation against standard industry hiring benchmarks.
            </p>
          </div>
          <div className="flex-1">
            <SkillRadarChart data={radarData} />
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-surface-border pb-3 mb-2">
              <h3 className="text-sm font-bold text-charcoal">Weekly Time Allocation</h3>
              <Badge variant="violet" size="sm">7-Day Velocity</Badge>
            </div>
            <p className="text-xs text-charcoal-muted mb-4">
              Hours invested daily in exercises, projects, and assessments.
            </p>
          </div>
          <div className="flex-1">
            <WeeklyActivityChart data={weeklyActivity} />
          </div>
        </Card>
      </div>

      {/* Readiness Trajectory Over Time */}
      <Card className="p-5">
        <div className="flex items-center justify-between border-b border-surface-border pb-3 mb-2">
          <div>
            <h3 className="text-sm font-bold text-charcoal">Career Readiness Trajectory</h3>
            <p className="text-xs text-charcoal-muted">Simulated growth curve from onboarding baseline to current milestone.</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-brand-700">{metrics.overallReadinessScore}%</span>
            <span className="text-[10px] text-charcoal-subtle block">Current Score</span>
          </div>
        </div>
        <ProgressTrendChart data={progressTimeline} />
      </Card>
    </div>
  );
};
