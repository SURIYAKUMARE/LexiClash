import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LearningRoadmap as RoadmapType, RoadmapAdjustmentLog } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  History,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Code2,
  FileText,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface WeekModule {
  weekNumber: number;
  title: string;
  focus: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  resources: {
    id: string;
    title: string;
    type: 'Doc' | 'Tutorial' | 'Course' | 'Exercise' | 'Project';
    duration: string;
    provider: string;
    url: string;
    completed: boolean;
  }[];
}

export const LearningRoadmap: React.FC = () => {
  const { profile, refreshProfile } = useAuth();

  const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);
  const [adjustments, setAdjustments] = useState<RoadmapAdjustmentLog[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'adjustments'>('timeline');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Realistic Week-by-Week Data for Full Stack Developer path
  const [weeks, setWeeks] = useState<WeekModule[]>([
    {
      weekNumber: 1,
      title: 'JavaScript Invariants & Asynchronous Foundations',
      focus: 'Closures, prototype chain, microtask queue, Promise lifecycle, and DOM event bubbling.',
      status: 'completed',
      resources: [
        {
          id: 'res-w1-1',
          title: 'MDN: JavaScript Concurrency Model and Event Loop',
          type: 'Doc',
          duration: '45 min',
          provider: 'MDN Web Docs',
          url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop',
          completed: true
        },
        {
          id: 'res-w1-2',
          title: 'Deep JS Foundations: Scope, Closures, and Types',
          type: 'Course',
          duration: '3.5 hrs',
          provider: 'Frontend Masters',
          url: 'https://frontendmasters.com/courses/deep-javascript-v3/',
          completed: true
        },
        {
          id: 'res-w1-3',
          title: 'Async Promise Chaining & Error Handling Exercises',
          type: 'Exercise',
          duration: '1.5 hrs',
          provider: 'Exercism',
          url: 'https://exercism.org/tracks/javascript',
          completed: true
        }
      ]
    },
    {
      weekNumber: 2,
      title: 'Modern React Architecture & State Design',
      focus: 'Hooks, custom hooks, component composition, reconciliation mechanics, and memoization patterns.',
      status: 'completed',
      resources: [
        {
          id: 'res-w2-1',
          title: 'React Official Documentation: Managing State',
          type: 'Doc',
          duration: '1 hr',
          provider: 'React.dev',
          url: 'https://react.dev/learn/managing-state',
          completed: true
        },
        {
          id: 'res-w2-2',
          title: 'Building Compound Components & Design Patterns',
          type: 'Tutorial',
          duration: '2 hrs',
          provider: 'Kent C. Dodds',
          url: 'https://kentcdodds.com/blog',
          completed: true
        },
        {
          id: 'res-w2-3',
          title: 'Interactive React Kanban Board with Context & Reducers',
          type: 'Project',
          duration: '4 hrs',
          provider: 'SkillPath Lab',
          url: 'https://github.com',
          completed: true
        }
      ]
    },
    {
      weekNumber: 3,
      title: 'Node.js Runtime & Express Server Architecture',
      focus: 'Event loop phases, Buffer/Streams, non-blocking I/O, middleware pipelines, and structured error handling.',
      status: 'in_progress',
      resources: [
        {
          id: 'res-w3-1',
          title: 'Node.js Official Guide: Understanding the Event Loop',
          type: 'Doc',
          duration: '1 hr',
          provider: 'Nodejs.org',
          url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick',
          completed: true
        },
        {
          id: 'res-w3-2',
          title: 'Node.js Streams: Handling Large Payloads without Memory Leaks',
          type: 'Tutorial',
          duration: '1.5 hrs',
          provider: 'Nodejs.org Guides',
          url: 'https://nodejs.org/en/learn/manipulating-files/nodejs-streams',
          completed: false
        },
        {
          id: 'res-w3-3',
          title: 'Production Express Middleware & REST Architecture',
          type: 'Course',
          duration: '3 hrs',
          provider: 'Coursera',
          url: 'https://www.coursera.org/specializations/node-js',
          completed: false
        },
        {
          id: 'res-w3-4',
          title: 'Diagnostic Quiz: Node.js Backend Verification',
          type: 'Exercise',
          duration: '30 min',
          provider: 'SkillPath Assessment',
          url: '/assessments',
          completed: false
        }
      ]
    },
    {
      weekNumber: 4,
      title: 'PostgreSQL Relational Modeling & Query Optimization',
      focus: 'Schema design, foreign keys, normalization, B-tree indexes, execution plans (EXPLAIN ANALYZE), and transaction isolation.',
      status: 'upcoming',
      resources: [
        {
          id: 'res-w4-1',
          title: 'PostgreSQL Tutorial: Indexes and Query Performance',
          type: 'Doc',
          duration: '1.5 hrs',
          provider: 'PostgreSQL Docs',
          url: 'https://www.postgresql.org/docs/current/indexes.html',
          completed: false
        },
        {
          id: 'res-w4-2',
          title: 'Prisma ORM with TypeScript & PostgreSQL',
          type: 'Tutorial',
          duration: '2 hrs',
          provider: 'Prisma.io',
          url: 'https://www.prisma.io/docs',
          completed: false
        },
        {
          id: 'res-w4-3',
          title: 'Complex Multi-Table SQL Join & Aggregation Drills',
          type: 'Exercise',
          duration: '2 hrs',
          provider: 'SQLZoo',
          url: 'https://sqlzoo.net',
          completed: false
        }
      ]
    },
    {
      weekNumber: 5,
      title: 'Authentication, Security & RESTful API Contracts',
      focus: 'JWT vs Session cookies, CORS, Rate limiting, input validation with Zod, and OWASP Top 10 mitigation.',
      status: 'upcoming',
      resources: [
        {
          id: 'res-w5-1',
          title: 'OWASP REST Security Cheat Sheet',
          type: 'Doc',
          duration: '1 hr',
          provider: 'OWASP',
          url: 'https://cheatsheetseries.owasp.org',
          completed: false
        },
        {
          id: 'res-w5-2',
          title: 'Full Stack Authentication Flow with Refresh Tokens',
          type: 'Project',
          duration: '4 hrs',
          provider: 'SkillPath Lab',
          url: 'https://github.com',
          completed: false
        }
      ]
    },
    {
      weekNumber: 6,
      title: 'Containerization, CI/CD & Deployment',
      focus: 'Multi-stage Dockerfiles, Docker Compose for local development, GitHub Actions CI workflows, and cloud container hosting.',
      status: 'upcoming',
      resources: [
        {
          id: 'res-w6-1',
          title: 'Docker Official Get Started: Containerizing Node.js Apps',
          type: 'Doc',
          duration: '1.5 hrs',
          provider: 'Docker Docs',
          url: 'https://docs.docker.com/language/nodejs/',
          completed: false
        },
        {
          id: 'res-w6-2',
          title: 'Automated Testing & Deployment with GitHub Actions',
          type: 'Tutorial',
          duration: '2 hrs',
          provider: 'GitHub Docs',
          url: 'https://docs.github.com/actions',
          completed: false
        }
      ]
    }
  ]);

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
  }, []);

  const handleToggleResource = (weekIndex: number, resourceId: string) => {
    setWeeks(prevWeeks => {
      const updated = [...prevWeeks];
      const targetWeek = { ...updated[weekIndex] };
      targetWeek.resources = targetWeek.resources.map(res => {
        if (res.id === resourceId) {
          return { ...res, completed: !res.completed };
        }
        return res;
      });

      // Update week status automatically
      const allDone = targetWeek.resources.every(r => r.completed);
      const someDone = targetWeek.resources.some(r => r.completed);
      if (allDone) {
        targetWeek.status = 'completed';
      } else if (someDone) {
        targetWeek.status = 'in_progress';
      }
      updated[weekIndex] = targetWeek;
      return updated;
    });
  };

  const handleRegenerate = async () => {
    if (!window.confirm('Recalculate learning roadmap based on your latest skill gaps?')) return;
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

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-charcoal-muted dark:text-slate-400 font-medium">Loading learning roadmap...</p>
        </div>
      </div>
    );
  }

  // Calculate progress stats from weeks
  const totalResources = weeks.reduce((acc, w) => acc + w.resources.length, 0);
  const completedResources = weeks.reduce((acc, w) => acc + w.resources.filter(r => r.completed).length, 0);
  const overallPercentage = Math.round((completedResources / (totalResources || 1)) * 100);
  const completedWeeksCount = weeks.filter(w => w.status === 'completed').length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Doc':
        return <FileText className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />;
      case 'Course':
        return <BookOpen className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />;
      case 'Tutorial':
        return <Layers className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />;
      case 'Exercise':
      case 'Project':
        return <Code2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />;
      default:
        return <BookOpen className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-charcoal dark:text-slate-100 tracking-tight">
              Learning Roadmap
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900">
              Full Stack Developer Path
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-1">
            Vertical week-by-week timeline with verified resources, estimated durations, and progress tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            {isRegenerating ? 'Recalculating...' : 'Regenerate Roadmap'}
          </Button>
        </div>
      </div>

      {/* Progress Overview Summary */}
      <Card className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-charcoal-subtle dark:text-slate-400 uppercase tracking-wider">
              Roadmap Progress
            </span>
            <div className="text-xl font-bold text-charcoal dark:text-slate-100 mt-0.5">
              {overallPercentage}% Complete · {completedWeeksCount} of {weeks.length} Weeks Done
            </div>
          </div>
          <div className="text-xs text-charcoal-muted dark:text-slate-400 font-medium">
            {completedResources} of {totalResources} tasks finished
          </div>
        </div>

        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-surface-border dark:border-surface-dark-border">
          <div
            className="h-full bg-brand-600 dark:bg-brand-500 transition-all duration-500"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </Card>

      {/* View Tabs */}
      <div className="flex gap-2 border-b border-surface-border dark:border-surface-dark-border pb-2">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'timeline'
              ? 'bg-brand-600 text-white font-semibold'
              : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal dark:hover:text-slate-200 hover:bg-surface-subtle dark:hover:bg-slate-800'
          }`}
        >
          Week-by-Week Timeline
        </button>
        <button
          onClick={() => setActiveTab('adjustments')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'adjustments'
              ? 'bg-brand-600 text-white font-semibold'
              : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal dark:hover:text-slate-200 hover:bg-surface-subtle dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Adjustment Logs ({adjustments.length})</span>
        </button>
      </div>

      {/* TAB 1: WEEK-BY-WEEK TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 before:z-0">
          {weeks.map((week, weekIndex) => {
            const isCompleted = week.status === 'completed';
            const isInProgress = week.status === 'in_progress';

            return (
              <div key={week.weekNumber} className="relative z-10 pl-10">
                {/* Timeline Node Dot */}
                <div
                  className={`absolute left-2.5 top-5 -translate-x-1/2 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-status-success border-status-success text-white'
                      : isInProgress
                      ? 'bg-brand-600 border-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-950'
                      : 'bg-white dark:bg-surface-dark-card border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>

                {/* Week Card */}
                <Card className="space-y-4">
                  {/* Week Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-border dark:border-surface-dark-border">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                          Week {week.weekNumber}
                        </span>
                        {isCompleted && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-status-success-bg dark:bg-emerald-950/40 text-status-success border border-emerald-200 dark:border-emerald-800/50">
                            Completed
                          </span>
                        )}
                        {isInProgress && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900">
                            Current Week
                          </span>
                        )}
                        {!isCompleted && !isInProgress && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-charcoal-muted dark:text-slate-400 border border-surface-border dark:border-surface-dark-border">
                            Upcoming
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-charcoal dark:text-slate-100 mt-1">
                        {week.title}
                      </h3>
                      <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
                        {week.focus}
                      </p>
                    </div>

                    <div className="text-xs text-charcoal-subtle dark:text-slate-400 shrink-0">
                      {week.resources.filter(r => r.completed).length} / {week.resources.length} completed
                    </div>
                  </div>

                  {/* Resource Cards Grid / List */}
                  <div className="space-y-2.5">
                    {week.resources.map(resource => (
                      <div
                        key={resource.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border transition-all gap-3 ${
                          resource.completed
                            ? 'bg-surface-subtle/40 dark:bg-slate-800/20 border-surface-border dark:border-surface-dark-border opacity-75'
                            : 'bg-white dark:bg-surface-dark-card border-surface-border dark:border-surface-dark-border hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {/* Checkbox & Details */}
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleResource(weekIndex, resource.id)}
                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              resource.completed
                                ? 'bg-brand-600 border-brand-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 hover:border-brand-600'
                            }`}
                          >
                            {resource.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-charcoal-muted dark:text-slate-400 bg-surface-subtle dark:bg-slate-800 px-1.5 py-0.5 rounded border border-surface-border dark:border-surface-dark-border">
                                {getTypeIcon(resource.type)}
                                <span>{resource.type}</span>
                              </span>
                              <span className="text-xs font-semibold text-charcoal dark:text-slate-100">
                                {resource.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-charcoal-subtle dark:text-slate-400">
                              <span>{resource.provider}</span>
                              <span>·</span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {resource.duration}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status & Open Action */}
                        <div className="flex items-center gap-2 pl-7 sm:pl-0 shrink-0">
                          {resource.completed ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-status-success-bg dark:bg-emerald-950/40 text-status-success border border-emerald-200 dark:border-emerald-800/50">
                              Done
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-charcoal-muted dark:text-slate-400 border border-surface-border dark:border-surface-dark-border">
                              Pending
                            </span>
                          )}

                          {resource.url.startsWith('http') ? (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium inline-flex items-center gap-1"
                            >
                              Open <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <Link
                              to={resource.url}
                              className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium inline-flex items-center gap-1"
                            >
                              Go <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: ADJUSTMENT LOGS */}
      {activeTab === 'adjustments' && (
        <Card className="space-y-4">
          <div className="pb-3 border-b border-surface-border dark:border-surface-dark-border">
            <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">
              Adaptive Learning Adjustment Log
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Transparent, explainable records of curriculum updates triggered by diagnostic quiz scores or changed targets.
            </p>
          </div>

          {adjustments.length === 0 ? (
            <div className="py-8 text-center text-xs text-charcoal-muted dark:text-slate-400">
              No adaptive adjustments recorded yet. Adjustments automatically log when you complete assessments or update your career goals.
            </div>
          ) : (
            <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
              {adjustments.map((log) => (
                <div key={log.id} className="py-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal dark:text-slate-100">
                      {log.triggerEvent}
                    </span>
                    <span className="text-[11px] text-charcoal-subtle dark:text-slate-400">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-muted dark:text-slate-400">
                    {log.description}
                  </p>
                  <div className="p-2.5 bg-surface-subtle dark:bg-slate-800/50 rounded-lg border border-surface-border dark:border-surface-dark-border text-xs text-charcoal-muted dark:text-slate-300">
                    <strong className="text-charcoal dark:text-slate-100">Curriculum impact: </strong>
                    {log.changesSummary}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default LearningRoadmap;
