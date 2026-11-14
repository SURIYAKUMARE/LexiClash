import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { OfflineSkill, OfflineCareerRole, OfflineProjectIdea } from '../db/indexedDb';
import { AdaptiveMentorAgent } from '../agents/adaptiveMentorAgent';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Code2,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Plus,
  RefreshCw,
  FolderGit2
} from 'lucide-react';
import { ProjectLabWorkspace } from '../components/projectLab/ProjectLabWorkspace';

export const Projects: React.FC = () => {
  const { profile } = useAuth();

  const [viewTab, setViewTab] = useState<'lab' | 'ideas'>('lab');
  const [projects, setProjects] = useState<OfflineProjectIdea[]>([]);
  const [skills, setSkills] = useState<OfflineSkill[]>([]);
  const [careers, setCareers] = useState<OfflineCareerRole[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [projRes, skillsRes, careersRes] = await Promise.all([
        api.getProjects(),
        api.getSkills(),
        api.getCareers()
      ]);
      setProjects(projRes.projects || []);
      setSkills(skillsRes.skills || []);
      setCareers(careersRes.careers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile?.targetCareerRoleId]);

  const handleGenerateFreshIdeas = async () => {
    setIsGenerating(true);
    try {
      const targetRole = careers.find(c => c.id === profile?.targetCareerRoleId) || careers[0];
      const existingNames = skills.filter(s => s.proficiencyLevel >= 3).map(s => s.skillName);
      const targetNames = targetRole?.requiredSkills.map(r => r.skillName) || ['React', 'Node.js'];

      const generated = AdaptiveMentorAgent.generateProjectIdeas(existingNames, targetNames, targetRole?.title || 'Full Stack');

      const mapped: OfflineProjectIdea[] = generated.map((g, idx) => ({
        id: `proj-${Date.now()}-${idx}`,
        userId: profile?.userId || 'me',
        title: g.title,
        description: g.elevatorPitch,
        existingSkillsUsed: g.existingSkillsCombined,
        newSkillsTargeted: g.newSkillsTargeted,
        complexity: g.complexity,
        estimatedHours: g.complexity === 'Capstone' ? 40 : 20,
        architecture: g.architectureDiagram,
        deliverables: g.milestones
      }));

      setProjects(mapped);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-stitch-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-charcoal-muted dark:text-slate-400 font-mono">Generating project concepts...</p>
        </div>
      </div>
    );
  }

  const targetRole = careers.find(c => c.id === profile?.targetCareerRoleId) || careers[0];
  const existingMastered = skills.filter(s => s.proficiencyLevel >= 3).map(s => s.skillName);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-2 p-1 bg-surface-subtle dark:bg-slate-800 rounded-xl border border-surface-border dark:border-surface-dark-border w-fit">
        <button
          onClick={() => setViewTab('lab')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            viewTab === 'lab'
              ? 'bg-white dark:bg-surface-dark text-brand-600 dark:text-brand-400 shadow-xs'
              : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal'
          }`}
        >
          Real-World Project Lab
        </button>
        <button
          onClick={() => setViewTab('ideas')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            viewTab === 'ideas'
              ? 'bg-white dark:bg-surface-dark text-brand-600 dark:text-brand-400 shadow-xs'
              : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal'
          }`}
        >
          Project Idea Generator
        </button>
      </div>

      {viewTab === 'lab' ? (
        <ProjectLabWorkspace />
      ) : (
        <div className="space-y-6">
          {/* Header bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-charcoal dark:text-slate-100 tracking-tight font-sans">
                  Interactive Project Idea Generator
                </h1>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-stitch-blue dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  Synergy Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-1">
                Tailored capstone project briefs synthesizing your existing strengths with newly learned target skills for portfolio proof of work.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerateFreshIdeas}
                disabled={isGenerating}
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                {isGenerating ? 'Synthesizing...' : 'Generate New Briefs'}
              </Button>
            </div>
          </div>

      {/* Synergy Formula Banner */}
      <Card className="border-l-4 border-l-stitch-blue space-y-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stitch-blue block">
          Portfolio Synergy Architecture
        </span>
        <div className="text-xs text-charcoal dark:text-slate-200 leading-relaxed">
          Combining your <strong>Existing Strengths</strong> ({existingMastered.slice(0, 3).join(', ') || 'Core Algorithms'}) with <strong>Newly Acquired Target Skills</strong> for {targetRole?.title}.
        </div>
      </Card>

      {/* Projects List */}
      <div className="space-y-6">
        {projects.map((proj, idx) => (
          <Card key={proj.id} className="space-y-4 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-surface-border dark:border-surface-dark-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-stitch-blue">
                    Concept #{idx + 1}
                  </span>
                  <span className="text-charcoal-subtle dark:text-slate-600">·</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-subtle dark:bg-slate-800 text-charcoal-muted dark:text-slate-300 border border-surface-border dark:border-surface-dark-border">
                    {proj.complexity} Level
                  </span>
                </div>
                <h2 className="text-lg font-bold text-charcoal dark:text-slate-100 font-sans">
                  {proj.title}
                </h2>
              </div>

              <span className="text-xs font-mono text-charcoal-subtle dark:text-slate-400 flex items-center gap-1 shrink-0">
                <Clock className="w-3.5 h-3.5" /> ~{proj.estimatedHours} hrs to build
              </span>
            </div>

            <p className="text-xs text-charcoal-muted dark:text-slate-300 leading-relaxed">
              {proj.description}
            </p>

            {/* Architecture Diagram */}
            <div className="p-3 bg-slate-900 text-slate-100 rounded-lg border border-slate-800 font-mono text-xs overflow-x-auto leading-relaxed">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Architecture Blueprint:
              </span>
              <code>{proj.architecture}</code>
            </div>

            {/* Deliverables Checklist */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-charcoal dark:text-slate-200 block">
                Portfolio Deliverables & Verification Criteria:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {proj.deliverables.map((del, dIdx) => (
                  <div key={dIdx} className="p-2.5 rounded bg-surface-subtle dark:bg-slate-800/40 border border-surface-border dark:border-surface-dark-border text-[11px] text-charcoal-muted dark:text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                    <span>{del}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                <span className="text-charcoal-subtle">Uses:</span>
                {proj.existingSkillsUsed.map(s => (
                  <span key={s} className="px-1.5 py-0.5 rounded bg-emerald-50 text-status-success dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    {s}
                  </span>
                ))}
                {proj.newSkillsTargeted.map(s => (
                  <span key={s} className="px-1.5 py-0.5 rounded bg-blue-50 text-stitch-blue dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                    +{s}
                  </span>
                ))}
              </div>

              <Link to="/roadmap">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Align with Roadmap
                </Button>
              </Link>
            </div>
          </Card>
        ))}
        </div>
      </div>
    )}
  </div>
);
};

export default Projects;
