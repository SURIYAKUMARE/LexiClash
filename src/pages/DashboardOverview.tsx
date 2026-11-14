import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LearningRoadmap, Skill, CareerRole } from '../types';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SkillRadarChart } from '../components/charts/SkillRadarChart';
import { WeeklyActivityChart } from '../components/charts/WeeklyActivityChart';
import { CareerReadinessGauge } from '../components/charts/CareerReadinessGauge';
import { ProgressTrendChart } from '../components/charts/ProgressTrendChart';
import {
  Brain,
  Award,
  Clock,
  CheckCircle2,
  Flame,
  TrendingUp,
  ArrowRight,
  Bot,
  MapPin,
  Compass,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [targetRole, setTargetRole] = useState<CareerRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [roadmapRes, skillsRes, analyticsRes, careersRes] = await Promise.all([
          api.getRoadmap(),
          api.getSkills(),
          api.getAnalytics(),
          api.getCareers()
        ]);

        setRoadmap(roadmapRes.roadmap);
        setSkills(skillsRes.skills);
        setAnalyticsData(analyticsRes);

        const currentRoleId = profile?.targetCareerRoleId || roadmapRes.roadmap?.targetRoleId || 'role-fullstack';
        const matchedRole = careersRes.careers.find(r => r.id === currentRoleId);
        setTargetRole(matchedRole || careersRes.careers[0]);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [profile?.targetCareerRoleId]);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-charcoal-muted font-medium">Synchronizing agent intelligence...</p>
        </div>
      </div>
    );
  }

  const activePhase = roadmap?.phases.find(p => p.status === 'in_progress') || roadmap?.phases[0];
  const nextTask = activePhase?.tasks.find(t => !t.completed);
  const verifiedSkillsCount = skills.filter(s => s.isVerified).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-brand-800 rounded-2xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-brand-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-brand-300" />
            <span>Target Role: {targetRole?.title || 'Full Stack Developer'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Elevate Your Engineering Competencies, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-brand-100/90 leading-relaxed">
            Your multi-agent career pipeline has updated your roadmap. Complete active milestones to advance toward your target role benchmarks.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/roadmap">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Continue Learning Roadmap
              </Button>
            </Link>
            <Link to="/mentor">
              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Bot className="w-4 h-4 mr-1.5" /> Ask AI Mentor
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          label="Total Skills"
          value={skills.length}
          subValue={`${verifiedSkillsCount} Verified`}
          icon={<Brain className="w-5 h-5" />}
          accentColor="brand"
        />
        <StatCard
          label="Overall Mastery"
          value={`Lvl ${profile?.overallMasteryLevel || 3}/5`}
          subValue="Proficiency Index"
          icon={<Award className="w-5 h-5" />}
          accentColor="violet"
        />
        <StatCard
          label="Study Hours"
          value={`${profile?.totalLearningHours || 36}h`}
          subValue="Target: 12h/wk"
          icon={<Clock className="w-5 h-5" />}
          accentColor="info"
        />
        <StatCard
          label="Tasks Done"
          value={profile?.completedTasksCount || 14}
          subValue={`${roadmap?.overallProgressPercentage || 42}% of path`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="success"
        />
        <StatCard
          label="Active Streak"
          value={`${profile?.streakDays || 9} Days`}
          subValue="Consistent"
          icon={<Flame className="w-5 h-5" />}
          accentColor="warning"
        />
        <StatCard
          label="Career Readiness"
          value={`${profile?.overallReadinessScore || 78}%`}
          subValue="Market Benchmark"
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="brand"
        />
      </div>

      {/* Charts Section: 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Skill Radar */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3">
            <div>
              <h3 className="text-sm font-bold text-charcoal">Skill Competency Radar</h3>
              <p className="text-xs text-charcoal-muted">Your verified & self-reported levels across 6 categories</p>
            </div>
            <Link to="/skills" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
              View All Skills
            </Link>
          </div>
          <div className="flex-1">
            <SkillRadarChart data={analyticsData?.radarData || []} />
          </div>
        </Card>

        {/* Chart 2: Career Readiness Gauge */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3">
            <div>
              <h3 className="text-sm font-bold text-charcoal">Role Readiness Alignment</h3>
              <p className="text-xs text-charcoal-muted">Weighted algorithm score based on {targetRole?.title}</p>
            </div>
            <Link to="/careers" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
              Explore Roles
            </Link>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <CareerReadinessGauge
              score={profile?.overallReadinessScore || 78}
              roleTitle={targetRole?.title || 'Full Stack Developer'}
              matchedCount={skills.filter(s => s.proficiencyLevel >= 3).length}
              totalRequired={targetRole?.requiredSkills.length || 7}
              verifiedPercentage={Math.round((verifiedSkillsCount / (skills.length || 1)) * 100)}
            />
          </div>
        </Card>

        {/* Chart 3: Weekly Activity */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3">
            <div>
              <h3 className="text-sm font-bold text-charcoal">Weekly Study Distribution</h3>
              <p className="text-xs text-charcoal-muted">Hours logged across daily sessions</p>
            </div>
            <Badge variant="brand" size="sm">This Week</Badge>
          </div>
          <div className="flex-1">
            <WeeklyActivityChart data={analyticsData?.weeklyActivity || []} />
          </div>
        </Card>

        {/* Chart 4: Progress Over Time */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3">
            <div>
              <h3 className="text-sm font-bold text-charcoal">Career Readiness Trajectory</h3>
              <p className="text-xs text-charcoal-muted">Readiness percentage growth over recent weeks</p>
            </div>
            <Badge variant="success" size="sm">Trending Up</Badge>
          </div>
          <div className="flex-1">
            <ProgressTrendChart data={analyticsData?.progressTimeline || []} />
          </div>
        </Card>
      </div>

      {/* Action Snapshot: Next Milestone & Multi-Agent Quick Jump */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Roadmap Milestone */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-bold text-charcoal">Current Learning Phase</h3>
            </div>
            <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
              {activePhase?.title || 'Phase 1: Foundations'}
            </span>
          </div>

          <p className="text-xs text-charcoal-muted leading-relaxed">
            {activePhase?.description || 'Master foundational invariants and modern architecture patterns.'}
          </p>

          {nextTask ? (
            <div className="p-4 bg-surface-subtle border border-surface-border rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-charcoal flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                  Next Task: {nextTask.title}
                </span>
                <span className="text-[11px] text-charcoal-subtle font-medium">~{nextTask.estimatedHours} hrs</span>
              </div>
              <p className="text-xs text-charcoal-muted">{nextTask.description}</p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-charcoal-subtle">
                  Criteria: {nextTask.criteria}
                </span>
                <Link to="/roadmap">
                  <Button variant="primary" size="sm">
                    Open in Roadmap
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-status-success-bg border border-emerald-200 rounded-xl text-xs text-status-success">
              All tasks in this phase completed! Check the roadmap to advance to the next phase.
            </div>
          )}

          <ProgressBar
            value={roadmap?.overallProgressPercentage || 42}
            showLabel
            color="brand"
          />
        </Card>

        {/* Quick Actions Panel */}
        <Card className="space-y-3">
          <h3 className="text-sm font-bold text-charcoal border-b border-surface-border pb-2">
            Quick Actions
          </h3>

          <Link to="/assessments" className="block p-3 rounded-xl border border-surface-border hover:border-brand-300 hover:bg-surface-subtle transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-status-success flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-charcoal block">Take Skill Assessment</span>
                <span className="text-[11px] text-charcoal-subtle">Verify competencies & earn badges</span>
              </div>
            </div>
          </Link>

          <Link to="/mentor" className="block p-3 rounded-xl border border-surface-border hover:border-brand-300 hover:bg-surface-subtle transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-violetAccent-50 text-violetAccent-600 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-charcoal block">Consult AI Mentor</span>
                <span className="text-[11px] text-charcoal-subtle">Mock interviews, code & concepts</span>
              </div>
            </div>
          </Link>

          <Link to="/agents" className="block p-3 rounded-xl border border-surface-border hover:border-brand-300 hover:bg-surface-subtle transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-charcoal block">Multi-Agent Monitor</span>
                <span className="text-[11px] text-charcoal-subtle">Inspect 7 backend agents live</span>
              </div>
            </div>
          </Link>

          <Link to="/resources" className="block p-3 rounded-xl border border-surface-border hover:border-brand-300 hover:bg-surface-subtle transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-charcoal block">Course Library</span>
                <span className="text-[11px] text-charcoal-subtle">Official docs, courses & guides</span>
              </div>
            </div>
          </Link>
        </Card>
      </div>
    </div>
  );
};
