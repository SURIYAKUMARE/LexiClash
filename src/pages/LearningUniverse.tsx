import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LearningDomain } from '../db/seedData';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Globe2,
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  Cpu,
  Shield,
  Cloud,
  Terminal,
  Database,
  BarChart,
  Code2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const LearningUniverse: React.FC = () => {
  const navigate = useNavigate();
  const [domains, setDomains] = useState<LearningDomain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<LearningDomain | null>(null);
  const [activeFilter, setActiveFilter] = useState<'All' | 'In Progress' | 'Available'>('All');
  const [rotationAngle, setRotationAngle] = useState(0);

  useEffect(() => {
    const fetchDomains = async () => {
      const res = await api.getLearningDomains();
      setDomains(res.domains);
      setSelectedDomain(res.domains[0] || null);
    };
    fetchDomains();
  }, []);

  // Subtle orbital rotation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setRotationAngle(prev => (prev + 0.3) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const filteredDomains = domains.filter(d => {
    if (activeFilter === 'All') return true;
    return d.status === activeFilter;
  });

  const getDomainIcon = (id: string) => {
    switch (id) {
      case 'domain-cloud': return Cloud;
      case 'domain-fullstack': return Code2;
      case 'domain-ai': return Sparkles;
      case 'domain-ml': return Cpu;
      case 'domain-dataeng': return Database;
      case 'domain-analytics': return BarChart;
      case 'domain-cyber': return Shield;
      case 'domain-devops': return Terminal;
      default: return Globe2;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              Interactive Cosmos v2.4
            </span>
            <span className="text-xs text-charcoal-subtle dark:text-slate-400">8 Engineering Domains Active</span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal dark:text-slate-100 tracking-tight">
            Learning Universe
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-1 max-w-2xl">
            Explore distributed engineering domains across orbital technical pathways. Select a node to inspect skill blueprints, industry salary demand, and launch placement diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/placement">
            <Button size="sm" variant="secondary" className="gap-1.5 text-xs font-mono">
              <Compass className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              Take Placement Diagnostic
            </Button>
          </Link>
          <Link to="/cloud-console">
            <Button size="sm" variant="primary" className="gap-1.5 text-xs">
              <Cloud className="w-3.5 h-3.5" />
              Open Cloud Console
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Cosmos Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Orbital Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-surface-dark-card border border-surface-border dark:border-surface-dark-border rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-sm min-h-[480px]">
          {/* Subtle Canvas Watermark & Star Coordinates */}
          <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] dark:bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />

          {/* Filter Pills */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-surface-subtle dark:bg-slate-800 p-1 rounded-lg border border-surface-border dark:border-surface-dark-border text-[11px] font-medium">
            {(['All', 'In Progress', 'Available'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeFilter === filter
                    ? 'bg-white dark:bg-slate-900 text-charcoal dark:text-white font-semibold shadow-xs'
                    : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="absolute top-4 right-4 z-10 text-[10px] font-mono text-charcoal-subtle dark:text-slate-400">
            RADIAL COORD: {Math.round(rotationAngle)}°
          </div>

          {/* SVG Orbital Map */}
          <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center my-4">
            <svg className="w-full h-full overflow-visible" viewBox="-220 -220 440 440">
              {/* Concentric Orbit Rings */}
              {[60, 105, 150, 195].map((radius, i) => (
                <circle
                  key={radius}
                  cx="0"
                  cy="0"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="text-slate-200 dark:text-slate-800"
                />
              ))}

              {/* Sun / Core Hub: SkillPath Platform Core */}
              <circle
                cx="0"
                cy="0"
                r="32"
                className="fill-brand-600 dark:fill-brand-500 shadow-lg"
              />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                className="fill-white font-mono text-[9px] font-bold tracking-tight pointer-events-none"
              >
                SKILLPATH
              </text>

              {/* Orbital Nodes for each domain */}
              {domains.map((dom, index) => {
                const baseAngle = (index * 360) / domains.length;
                const currentAngle = (baseAngle + rotationAngle * (index % 2 === 0 ? 1 : -0.7)) * (Math.PI / 180);
                const ringRadius = 75 + (index % 4) * 38;
                const x = Math.cos(currentAngle) * ringRadius;
                const y = Math.sin(currentAngle) * ringRadius;

                const isSelected = selectedDomain?.id === dom.id;

                return (
                  <g
                    key={dom.id}
                    className="cursor-pointer transition-transform duration-200"
                    onClick={() => setSelectedDomain(dom)}
                  >
                    {/* Pulsing indicator when selected */}
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r="24"
                        fill="none"
                        stroke={dom.color}
                        strokeWidth="2"
                        className="animate-ping opacity-30"
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? '20' : '16'}
                      fill={isSelected ? dom.color : '#FFFFFF'}
                      stroke={dom.color}
                      strokeWidth={isSelected ? '3' : '2'}
                      className="transition-all duration-300 dark:fill-slate-900"
                    />

                    {/* Status Dot */}
                    <circle
                      cx={x + 10}
                      cy={y - 10}
                      r="4"
                      className={dom.status === 'In Progress' ? 'fill-emerald-500' : 'fill-slate-400'}
                    />

                    {/* Domain Label */}
                    <text
                      x={x}
                      y={y + 28}
                      textAnchor="middle"
                      className={`text-[9px] font-medium transition-colors pointer-events-none ${
                        isSelected
                          ? 'fill-charcoal dark:fill-white font-bold'
                          : 'fill-charcoal-muted dark:fill-slate-400'
                      }`}
                    >
                      {dom.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="text-center text-[11px] text-charcoal-subtle dark:text-slate-400 mt-2">
            Click any planetary node or select from the list below to inspect domain intelligence.
          </div>
        </div>

        {/* Right Column: Selected Domain Inspector (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedDomain ? (
            <Card className="border-t-4" style={{ borderTopColor: selectedDomain.color }}>
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-border dark:border-surface-dark-border">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: selectedDomain.color }}
                  >
                    {React.createElement(getDomainIcon(selectedDomain.id), { className: 'w-5 h-5' })}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-charcoal dark:text-slate-100">
                      {selectedDomain.name}
                    </h2>
                    <span className="text-[11px] font-mono text-charcoal-subtle dark:text-slate-400 block">
                      {selectedDomain.difficulty} Tier
                    </span>
                  </div>
                </div>

                <Badge
                  variant={selectedDomain.status === 'In Progress' ? 'success' : 'neutral'}
                  size="sm"
                >
                  {selectedDomain.status}
                </Badge>
              </div>

              {/* Tagline & Description */}
              <div className="py-3 text-xs leading-relaxed border-b border-surface-border dark:border-surface-dark-border space-y-2">
                <p className="font-semibold text-charcoal dark:text-slate-200">
                  {selectedDomain.tagline}
                </p>
                <p className="text-charcoal-muted dark:text-slate-400">
                  {selectedDomain.description}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="py-3 border-b border-surface-border dark:border-surface-dark-border">
                <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                  <span className="text-charcoal dark:text-slate-300">Competency Mastery</span>
                  <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">
                    {selectedDomain.progressPercentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${selectedDomain.progressPercentage}%`,
                      backgroundColor: selectedDomain.color
                    }}
                  />
                </div>
              </div>

              {/* Learning Pathways */}
              <div className="py-3 border-b border-surface-border dark:border-surface-dark-border space-y-2">
                <span className="text-[11px] font-semibold text-charcoal-subtle dark:text-slate-400 uppercase tracking-wider block">
                  Available Learning Pathways
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDomain.availablePaths.map(path => (
                    <span
                      key={path}
                      className="px-2 py-1 rounded bg-surface-subtle dark:bg-slate-800/80 text-[11px] font-medium text-charcoal dark:text-slate-200 border border-surface-border dark:border-surface-dark-border"
                    >
                      {path}
                    </span>
                  ))}
                </div>
              </div>

              {/* Benchmark Skill Requirements */}
              <div className="py-3 border-b border-surface-border dark:border-surface-dark-border space-y-2">
                <span className="text-[11px] font-semibold text-charcoal-subtle dark:text-slate-400 uppercase tracking-wider block">
                  Core Competency Benchmarks
                </span>
                <div className="space-y-1.5">
                  {selectedDomain.skillRequirements.map(req => (
                    <div key={req.name} className="flex items-center justify-between text-xs">
                      <span className="text-charcoal-muted dark:text-slate-300">{req.name}</span>
                      <span className="font-mono font-bold text-charcoal dark:text-white">
                        Level {req.level}/5
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Career Opportunities & Salary */}
              <div className="py-3 space-y-2">
                <span className="text-[11px] font-semibold text-charcoal-subtle dark:text-slate-400 uppercase tracking-wider block">
                  Industry Salary Benchmarks
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDomain.careerOpportunities.map(opp => (
                    <div
                      key={opp.title}
                      className="p-2.5 rounded-lg bg-surface-subtle dark:bg-slate-800/50 border border-surface-border dark:border-surface-dark-border"
                    >
                      <div className="text-[11px] font-semibold text-charcoal dark:text-slate-200 truncate">
                        {opp.title}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[11px]">
                        <span className="font-mono font-bold text-status-success">{opp.avgSalary}</span>
                        <span className="text-[10px] text-charcoal-subtle dark:text-slate-400">{opp.demand}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-surface-border dark:border-surface-dark-border flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  className="flex-1 text-xs gap-1.5"
                  onClick={() => navigate('/roadmap')}
                >
                  Set as Active Focus
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
                <Link to="/placement" className="flex-1">
                  <Button size="sm" variant="secondary" className="w-full text-xs">
                    Placement Quiz
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <Compass className="w-8 h-8 text-charcoal-subtle dark:text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-charcoal-muted">Select a domain node on the orbital map to view its architectural blueprint.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Domain Cards Quick Switcher */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-charcoal dark:text-slate-200 uppercase tracking-wider">
            All 8 Technical Domains
          </h2>
          <span className="text-xs text-charcoal-subtle dark:text-slate-400">
            Showing {filteredDomains.length} domains
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDomains.map(dom => {
            const isSelected = selectedDomain?.id === dom.id;
            const Icon = getDomainIcon(dom.id);

            return (
              <div
                key={dom.id}
                onClick={() => setSelectedDomain(dom)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-brand-600 dark:border-brand-400 bg-brand-50/50 dark:bg-brand-950/30 shadow-xs'
                    : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: dom.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <Badge
                    variant={dom.status === 'In Progress' ? 'success' : 'neutral'}
                    size="sm"
                  >
                    {dom.status}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-charcoal dark:text-slate-100">
                  {dom.name}
                </h3>
                <p className="text-[11px] text-charcoal-muted dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {dom.tagline}
                </p>

                <div className="mt-3 pt-2.5 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between text-[11px]">
                  <span className="text-charcoal-subtle dark:text-slate-400">Progress:</span>
                  <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                    {dom.progressPercentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
