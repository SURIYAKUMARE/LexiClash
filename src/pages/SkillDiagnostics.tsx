import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { OfflineSkill, OfflineCareerRole } from '../db/indexedDb';
import { CareerArchitectAgent } from '../agents/careerArchitectAgent';
import { CareerBenchmarkResult } from '../agents/types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Target,
  Sparkles,
  ArrowRight,
  Sliders,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SkillDiagnostics: React.FC = () => {
  const { profile } = useAuth();

  const [skills, setSkills] = useState<OfflineSkill[]>([]);
  const [careers, setCareers] = useState<OfflineCareerRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('role-fullstack');
  const [benchmarkResult, setBenchmarkResult] = useState<CareerBenchmarkResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // What-If Simulator State
  const [simulatedSkills, setSimulatedSkills] = useState<{ name: string; level: number }[]>([
    { name: 'JavaScript', level: 4 },
    { name: 'React', level: 3 }
  ]);
  const [simulationResults, setSimulationResults] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [skillsRes, careersRes] = await Promise.all([
        api.getSkills(),
        api.getCareers()
      ]);
      setSkills(skillsRes.skills || []);
      setCareers(careersRes.careers || []);

      const activeId = profile?.targetCareerRoleId || 'role-fullstack';
      setSelectedRoleId(activeId);

      const targetRole = careersRes.careers.find((c: any) => c.id === activeId) || careersRes.careers[0];
      if (targetRole) {
        const result = CareerArchitectAgent.benchmarkRole(skillsRes.skills || [], targetRole);
        setBenchmarkResult(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile?.targetCareerRoleId]);

  // Recalculate when selected role changes
  useEffect(() => {
    const targetRole = careers.find(c => c.id === selectedRoleId);
    if (targetRole && skills.length > 0) {
      const result = CareerArchitectAgent.benchmarkRole(skills, targetRole);
      setBenchmarkResult(result);
    }
  }, [selectedRoleId, skills, careers]);

  // Recalculate simulation results
  useEffect(() => {
    if (careers.length > 0 && skills.length > 0) {
      const sim = CareerArchitectAgent.simulateSkillAcquisitions(
        skills,
        careers,
        simulatedSkills.map(s => ({ skillName: s.name, level: s.level }))
      );
      setSimulationResults(sim);
    }
  }, [simulatedSkills, skills, careers]);

  const toggleSimSkill = (name: string, level: number) => {
    setSimulatedSkills(prev => {
      const exists = prev.some(s => s.name === name);
      if (exists) {
        return prev.filter(s => s.name !== name);
      } else {
        return [...prev, { name, level }];
      }
    });
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-stitch-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-charcoal-muted dark:text-slate-400 font-mono">Running diagnostic engine...</p>
        </div>
      </div>
    );
  }

  const selectedRole = careers.find(c => c.id === selectedRoleId) || careers[0];
  const readiness = benchmarkResult?.readinessPercentage || 38;

  // Lightweight Native SVG Radar Calculations (No bloated chart libraries)
  const categories = [
    { label: 'Languages', current: 75, target: 90 },
    { label: 'Frameworks', current: 40, target: 85 },
    { label: 'Databases', current: 80, target: 80 },
    { label: 'Cloud/DevOps', current: 30, target: 75 },
    { label: 'System Design', current: 50, target: 80 },
    { label: 'Testing', current: 60, target: 70 }
  ];

  const radarCenter = 100;
  const radarRadius = 75;
  const numPoints = categories.length;
  const angleStep = (Math.PI * 2) / numPoints;

  const currentPoints = categories.map((cat, i) => {
    const r = (cat.current / 100) * radarRadius;
    const x = radarCenter + r * Math.sin(i * angleStep);
    const y = radarCenter - r * Math.cos(i * angleStep);
    return `${x},${y}`;
  }).join(' ');

  const targetPoints = categories.map((cat, i) => {
    const r = (cat.target / 100) * radarRadius;
    const x = radarCenter + r * Math.sin(i * angleStep);
    const y = radarCenter - r * Math.cos(i * angleStep);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-charcoal dark:text-slate-100 tracking-tight font-sans">
              Skill Gap Diagnostic & Career Matching Engine
            </h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-stitch-blue dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              Deterministic Math Model
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-1">
            Visual side-by-side benchmark comparison between your competency fingerprint and target role blueprint.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/roadmap">
            <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Open Calibrated Roadmap
            </Button>
          </Link>
        </div>
      </div>

      {/* Role Selector Tabs */}
      <div className="space-y-2">
        <label className="block text-xs font-mono font-semibold text-charcoal-subtle dark:text-slate-400 uppercase tracking-wider">
          Benchmark against Role Blueprint:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {careers.map(role => (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRoleId(role.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedRoleId === role.id
                  ? 'bg-stitch-blue text-white font-semibold'
                  : 'bg-white dark:bg-surface-dark-card border border-surface-border dark:border-surface-dark-border text-charcoal-muted dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              {role.title}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Readiness Score & Transparent Mathematical Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score & Estimated Duration Card */}
        <Card className="flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-subtle dark:text-slate-400 block">
              Calculated Readiness Index
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold text-charcoal dark:text-slate-100 font-mono">
                {readiness}%
              </span>
              <span className="text-xs text-charcoal-muted dark:text-slate-400">
                toward {selectedRole.title}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-surface-border dark:border-surface-dark-border mt-3">
              <div
                className="h-full bg-stitch-blue transition-all duration-700"
                style={{ width: `${readiness}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-surface-subtle dark:bg-slate-800/50 rounded-lg border border-surface-border dark:border-surface-dark-border text-xs space-y-1">
            <span className="font-semibold text-charcoal dark:text-slate-200 block">
              Estimated Time to Market Readiness:
            </span>
            <p className="text-charcoal-muted dark:text-slate-400 font-mono">
              ~{benchmarkResult?.estimatedWeeksToReadiness || 6} weeks @ {profile?.hoursPerWeek || 12} hrs/week pace.
            </p>
          </div>

          <div className="text-[11px] text-charcoal-subtle dark:text-slate-500 font-mono">
            {benchmarkResult?.strengths.length} Mastered • {benchmarkResult?.needsReinforcement.length} Reinforcing • {benchmarkResult?.criticalMissing.length} Critical Missing
          </div>
        </Card>

        {/* Lightweight Pure SVG Radar Fingerprint */}
        <Card className="flex flex-col items-center justify-center p-4">
          <div className="w-full flex items-center justify-between pb-2 border-b border-surface-border dark:border-surface-dark-border text-xs mb-2">
            <span className="font-bold text-charcoal dark:text-slate-200">Competency Spider Fingerprint</span>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="text-stitch-blue">● Current</span>
              <span className="text-slate-400">● Target</span>
            </div>
          </div>

          <div className="relative w-52 h-52 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Concentric rings */}
              <circle cx={radarCenter} cy={radarCenter} r={radarRadius * 0.33} fill="none" stroke="#E2E5E9" strokeDasharray="2 2" />
              <circle cx={radarCenter} cy={radarCenter} r={radarRadius * 0.66} fill="none" stroke="#E2E5E9" strokeDasharray="2 2" />
              <circle cx={radarCenter} cy={radarCenter} r={radarRadius} fill="none" stroke="#E2E5E9" />

              {/* Target Polygon */}
              <polygon points={targetPoints} fill="#0B57D0" fillOpacity="0.1" stroke="#94A3B8" strokeWidth="1.5" />
              {/* Current Polygon */}
              <polygon points={currentPoints} fill="#0B57D0" fillOpacity="0.3" stroke="#0B57D0" strokeWidth="2" />
            </svg>
          </div>

          <span className="text-[10px] text-charcoal-subtle dark:text-slate-500 font-mono mt-1">
            Native SVG polygon diff • Zero bloated charting runtime
          </span>
        </Card>

        {/* Transparent Mathematical Breakdown Card */}
        <Card className="space-y-3">
          <div className="pb-2 border-b border-surface-border dark:border-surface-dark-border">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-subtle dark:text-slate-400 block">
              Transparent Scoring Logic
            </span>
            <h3 className="text-xs font-bold text-charcoal dark:text-slate-100">
              Readiness Mathematical Formulation
            </h3>
          </div>

          <div className="p-2.5 rounded bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed">
            {"R = [ \\sum (W_i \\times \\min(1, L_i / B_i)) \\times V_i ] / \\sum W_i \\times 100"}
          </div>

          <div className="space-y-1.5 text-xs text-charcoal-muted dark:text-slate-300">
            <div className="flex justify-between text-[11px]">
              <span>Core Skills Weight (2.0x):</span>
              <span className="font-mono font-semibold">{benchmarkResult?.mathematicalBreakdown.coreSkillsWeight || 18} pts</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Verification Bonus Multiplier:</span>
              <span className="font-mono font-semibold text-status-success">1.1x</span>
            </div>
            <div className="flex justify-between text-[11px] pt-1 border-t border-surface-border dark:border-surface-dark-border font-bold text-charcoal dark:text-slate-100">
              <span>Earned / Max Points:</span>
              <span className="font-mono">{benchmarkResult?.mathematicalBreakdown.rawScore} / {benchmarkResult?.mathematicalBreakdown.maxPossibleScore}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: 3-Column Categorization of Skills (Mastered vs Needs Reinforcement vs Critical Missing) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column 1: Mastered Strengths */}
        <Card className="space-y-3 border-t-4 border-t-forest">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border dark:border-surface-dark-border">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-forest" />
              <h3 className="text-xs font-bold text-charcoal dark:text-slate-100 uppercase tracking-wider">
                Mastered Strengths
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-forest">
              {benchmarkResult?.strengths.length} Met
            </span>
          </div>

          {benchmarkResult?.strengths.length === 0 ? (
            <p className="text-xs text-charcoal-subtle py-4 text-center">None benchmarked at or above target level yet.</p>
          ) : (
            <div className="space-y-2">
              {benchmarkResult?.strengths.map(s => (
                <div key={s.skillName} className="p-2.5 rounded bg-surface-subtle dark:bg-slate-800/50 border border-surface-border dark:border-surface-dark-border text-xs flex justify-between items-center">
                  <span className="font-bold text-charcoal dark:text-slate-100">{s.skillName}</span>
                  <span className="font-mono text-forest font-semibold text-[11px]">
                    L{s.level} / Req {s.benchmark}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Column 2: Needs Reinforcement */}
        <Card className="space-y-3 border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border dark:border-surface-dark-border">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-charcoal dark:text-slate-100 uppercase tracking-wider">
                Needs Reinforcement
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-600">
              {benchmarkResult?.needsReinforcement.length} Gaps
            </span>
          </div>

          {benchmarkResult?.needsReinforcement.length === 0 ? (
            <p className="text-xs text-charcoal-subtle py-4 text-center">No partial skill deficits.</p>
          ) : (
            <div className="space-y-2">
              {benchmarkResult?.needsReinforcement.map(n => (
                <div key={n.skillName} className="p-2.5 rounded bg-surface-subtle dark:bg-slate-800/50 border border-surface-border dark:border-surface-dark-border text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-charcoal dark:text-slate-100">{n.skillName}</span>
                    <span className="font-mono text-amber-600 font-semibold text-[11px]">
                      Needs +{n.delta} Lvl
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${(n.level / n.benchmark) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Column 3: Critical Missing Skills */}
        <Card className="space-y-3 border-t-4 border-t-red-500">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border dark:border-surface-dark-border">
            <div className="flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-red-600" />
              <h3 className="text-xs font-bold text-charcoal dark:text-slate-100 uppercase tracking-wider">
                Critical Missing Skills
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-red-600">
              {benchmarkResult?.criticalMissing.length} Required
            </span>
          </div>

          {benchmarkResult?.criticalMissing.length === 0 ? (
            <p className="text-xs text-charcoal-subtle py-4 text-center">All core skills present in vault.</p>
          ) : (
            <div className="space-y-2">
              {benchmarkResult?.criticalMissing.map(m => (
                <div key={m.skillName} className="p-2.5 rounded bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-charcoal dark:text-slate-100 block">{m.skillName}</span>
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-mono">Requires Benchmark L{m.benchmark}</span>
                  </div>
                  <Link to="/roadmap" className="text-[10px] text-stitch-blue hover:underline font-semibold font-mono">
                    Add Module →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Row 3: Advanced Value-Add Feature: Interactive "What-If" Career Simulator */}
      <Card className="space-y-4 border-l-4 border-l-brand-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-border dark:border-surface-dark-border">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-bold text-charcoal dark:text-slate-100 font-sans">
                Interactive "What-If" Career Simulator
              </h3>
            </div>
            <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
              Preview how acquiring 2–3 specific skills simultaneously unlocks adjacent engineering roles.
            </p>
          </div>
          <span className="text-[11px] font-mono text-charcoal-subtle">
            Toggle hypothetical acquisitions:
          </span>
        </div>

        {/* Checkbox pills for hypothetical acquisitions */}
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'JavaScript', level: 5 },
            { name: 'React', level: 4 },
            { name: 'Node.js', level: 4 },
            { name: 'TypeScript', level: 4 },
            { name: 'Docker', level: 3 },
            { name: 'PostgreSQL', level: 4 }
          ].map(skill => {
            const isToggled = simulatedSkills.some(s => s.name === skill.name);
            return (
              <button
                key={skill.name}
                type="button"
                onClick={() => toggleSimSkill(skill.name, skill.level)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  isToggled
                    ? 'bg-brand-600 text-white font-semibold shadow-xs'
                    : 'bg-surface-subtle dark:bg-slate-800 border border-surface-border dark:border-surface-dark-border text-charcoal-muted hover:border-brand-500'
                }`}
              >
                <span>{isToggled ? '✓' : '+'}</span>
                <span>{skill.name} (L{skill.level})</span>
              </button>
            );
          })}
        </div>

        {/* Simulation Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {simulationResults.slice(0, 4).map(res => (
            <div
              key={res.simulatedRoleId}
              className="p-3.5 rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark space-y-2"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-charcoal dark:text-slate-100 leading-snug">
                  {res.roleTitle}
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  res.unlockedStatus === 'Ready to Apply'
                    ? 'bg-emerald-50 text-status-success dark:bg-emerald-950'
                    : 'bg-blue-50 text-stitch-blue dark:bg-blue-950'
                }`}>
                  {res.unlockedStatus}
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs pt-1">
                <span className="text-charcoal-muted dark:text-slate-400 text-[11px]">
                  Projected Readiness:
                </span>
                <span className="font-mono font-bold text-charcoal dark:text-slate-100">
                  {res.projectedReadiness}%
                  {res.deltaPercentage > 0 && (
                    <span className="text-status-success text-[10px] ml-1">
                      (+{res.deltaPercentage}%)
                    </span>
                  )}
                </span>
              </div>

              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 transition-all duration-500"
                  style={{ width: `${res.projectedReadiness}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SkillDiagnostics;
