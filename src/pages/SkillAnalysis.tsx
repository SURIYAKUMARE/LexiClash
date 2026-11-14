import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Skill, SkillCategory, ProficiencyLevel, SkillGapAnalysisResult } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import {
  BrainCircuit,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SkillAnalysis: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<SkillGapAnalysisResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const [formSkillName, setFormSkillName] = useState('');
  const [formCategory, setFormCategory] = useState<SkillCategory>('languages');
  const [formLevel, setFormLevel] = useState<ProficiencyLevel>(3);
  const [formEvidence, setFormEvidence] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [skillsRes, gapRes] = await Promise.all([
        api.getSkills(),
        api.getSkillGapAnalysis()
      ]);
      setSkills(skillsRes.skills);
      setGapAnalysis(gapRes.gapAnalysis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingSkill(null);
    setFormSkillName('');
    setFormCategory('languages');
    setFormLevel(3);
    setFormEvidence('');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (s: Skill) => {
    setEditingSkill(s);
    setFormSkillName(s.skillName);
    setFormCategory(s.category);
    setFormLevel(s.proficiencyLevel);
    setFormEvidence(s.evidence || '');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSkillName.trim()) {
      setFormError('Skill name is required.');
      return;
    }

    try {
      if (editingSkill) {
        await api.updateSkill(editingSkill.id, {
          category: formCategory,
          proficiencyLevel: formLevel,
          evidence: formEvidence,
        });
      } else {
        await api.addSkill({
          skillName: formSkillName.trim(),
          category: formCategory,
          proficiencyLevel: formLevel,
          evidence: formEvidence,
        });
      }
      setIsAddModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save skill.');
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this skill from your profile?')) return;
    try {
      await api.deleteSkill(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const categories = [
    { key: 'all', label: 'All Skills' },
    { key: 'languages', label: 'Languages' },
    { key: 'frameworks', label: 'Frameworks' },
    { key: 'databases', label: 'Databases' },
    { key: 'cloud', label: 'Cloud / DevOps' },
    { key: 'analytics', label: 'Analytics / AI' },
    { key: 'soft_skills', label: 'Soft Skills' },
    { key: 'other', label: 'Other' },
  ];

  const filteredSkills = selectedCategory === 'all'
    ? skills
    : skills.filter(s => s.category === selectedCategory);

  const getLevelLabel = (lvl: number) => {
    const map = ['1 - Beginner', '2 - Elementary', '3 - Intermediate', '4 - Advanced', '5 - Expert'];
    return map[lvl - 1] || `Level ${lvl}`;
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-charcoal">Skill Intelligence & Inventory</h1>
          <p className="text-xs text-charcoal-muted">
            Manage your verified credentials, self-reported skills, and real-time role gap analysis.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Skill
        </Button>
      </div>

      {/* Interactive Skill Gap Report Banner */}
      {gapAnalysis && (
        <Card className="bg-gradient-to-r from-surface to-brand-50/40 border-brand-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-charcoal text-base">
                  Target Role Gap Report: {gapAnalysis.roleTitle}
                </h3>
              </div>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Your profile matches <strong>{gapAnalysis.matchedSkillsCount}</strong> of <strong>{gapAnalysis.totalRequiredSkills}</strong> benchmark competencies.
                Verified assessment rate is <strong>{gapAnalysis.verifiedMatchPercentage}%</strong>.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="success" size="sm">
                  {gapAnalysis.strengths.length} Benchmark Strengths
                </Badge>
                <Badge variant="warning" size="sm">
                  {gapAnalysis.gaps.length} Actionable Gaps
                </Badge>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-surface-border shadow-xs min-w-[180px]">
              <span className="text-3xl font-extrabold text-brand-700">
                {gapAnalysis.overallReadinessScore}%
              </span>
              <span className="text-[11px] font-medium text-charcoal-subtle uppercase tracking-wider mt-0.5">
                Market Readiness
              </span>
              <Link to="/careers" className="text-xs text-brand-600 hover:text-brand-700 font-semibold mt-2">
                Change Target Role →
              </Link>
            </div>
          </div>

          {/* Actionable Gaps & Prioritized Plan Table */}
          <div className="mt-6 pt-5 border-t border-brand-100 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Critical Gaps */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-subtle mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-status-warning" />
                Top Identified Gaps to Address
              </h4>
              <div className="space-y-2">
                {gapAnalysis.gaps.slice(0, 4).map((gap, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg border border-surface-border text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-charcoal">{gap.skillName}</span>
                      <span className="text-[11px] font-semibold text-status-warning">
                        Needs +{gap.delta} Lvl (Current: {gap.currentLevel} / Req: {gap.benchmarkLevel})
                      </span>
                    </div>
                    <p className="text-charcoal-muted text-[11px] mt-1">{gap.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prioritized Improvement Sequence */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-subtle mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
                Agent Prioritized Improvement Sequence
              </h4>
              <div className="space-y-2">
                {gapAnalysis.prioritizedPlan.map((plan, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg border border-surface-border text-xs flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {plan.step}
                    </span>
                    <div>
                      <span className="font-semibold text-charcoal block">{plan.title} (~{plan.estimatedWeeks} wks)</span>
                      <span className="text-[11px] text-charcoal-muted leading-relaxed block mt-0.5">{plan.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strict Disclaimer */}
          <div className="mt-4 p-3 bg-surface-subtle border border-surface-border rounded-lg text-[11px] text-charcoal-subtle">
            {gapAnalysis.disclaimer}
          </div>
        </Card>
      )}

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-surface-border pb-2">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setSelectedCategory(c.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === c.key
                ? 'bg-brand-600 text-white shadow-xs font-semibold'
                : 'text-charcoal-muted hover:text-charcoal hover:bg-surface-subtle'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Skills Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle border-b border-surface-border text-charcoal-subtle font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Skill & Category</th>
                <th className="py-3 px-4">Proficiency Level</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4">Evidence / Proof</th>
                <th className="py-3 px-4">Last Assessed</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredSkills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-charcoal-subtle">
                    No skills found in this category. Click "Add New Skill" to add one.
                  </td>
                </tr>
              ) : (
                filteredSkills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-charcoal">
                      <div>
                        <span>{skill.skillName}</span>
                        <span className="block text-[10px] text-charcoal-subtle font-normal capitalize">
                          {skill.category.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1 w-32">
                        <div className="flex justify-between text-[11px] font-medium text-charcoal">
                          <span>Level {skill.proficiencyLevel}</span>
                          <span className="text-charcoal-subtle">{getLevelLabel(skill.proficiencyLevel).split(' - ')[1]}</span>
                        </div>
                        <ProgressBar
                          value={(skill.proficiencyLevel / 5) * 100}
                          size="sm"
                          color={skill.isVerified ? 'success' : 'brand'}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {skill.isVerified ? (
                        <Badge variant="success" size="sm" verified>
                          Verified ({skill.verifiedScore ?? 100}%)
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Badge variant="neutral" size="sm">Self-Reported</Badge>
                          <Link to="/assessments" className="text-[10px] text-brand-600 hover:underline">
                            Verify Now
                          </Link>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs text-charcoal-muted truncate text-[11px]">
                      {skill.evidence || '—'}
                    </td>
                    <td className="py-3 px-4 text-charcoal-subtle text-[11px]">
                      {skill.lastAssessedAt
                        ? new Date(skill.lastAssessedAt).toLocaleDateString()
                        : 'Not yet tested'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(skill)}
                          className="p-1 rounded text-charcoal-subtle hover:text-charcoal hover:bg-surface-muted"
                          title="Edit Skill"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="p-1 rounded text-charcoal-subtle hover:text-status-danger hover:bg-red-50"
                          title="Delete Skill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Skill Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingSkill ? 'Edit Skill Profile' : 'Add New Skill to Profile'}
        description="Declare or update technical competencies across 5 standardized levels."
      >
        <form onSubmit={handleSaveSkill} className="space-y-4">
          {formError && (
            <div className="p-3 bg-status-danger-bg border border-red-200 rounded-lg text-xs text-status-danger">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">Skill Name *</label>
            <input
              type="text"
              required
              disabled={Boolean(editingSkill)}
              value={formSkillName}
              onChange={(e) => setFormSkillName(e.target.value)}
              placeholder="e.g. TypeScript, Docker, PostgreSQL"
              className="w-full text-xs px-3 py-2.5 bg-surface-subtle border border-surface-border rounded-lg text-charcoal focus:bg-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as SkillCategory)}
                className="w-full text-xs px-3 py-2.5 bg-surface-subtle border border-surface-border rounded-lg text-charcoal"
              >
                <option value="languages">Languages</option>
                <option value="frameworks">Frameworks</option>
                <option value="databases">Databases</option>
                <option value="cloud">Cloud / Infrastructure</option>
                <option value="analytics">Analytics & Machine Learning</option>
                <option value="soft_skills">Soft Skills</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">Proficiency Level (1-5)</label>
              <select
                value={formLevel}
                onChange={(e) => setFormLevel(Number(e.target.value) as ProficiencyLevel)}
                className="w-full text-xs px-3 py-2.5 bg-surface-subtle border border-surface-border rounded-lg text-charcoal"
              >
                <option value={1}>1 - Beginner (Foundational syntax)</option>
                <option value={2}>2 - Elementary (Basic scripts)</option>
                <option value={3}>3 - Intermediate (Applied production apps)</option>
                <option value={4}>4 - Advanced (Architecture & performance)</option>
                <option value={5}>5 - Expert (System design & internals)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">
              Evidence / Practical Experience (Projects, Repos, Certs)
            </label>
            <textarea
              rows={3}
              value={formEvidence}
              onChange={(e) => setFormEvidence(e.target.value)}
              placeholder="e.g. Implemented REST API with PostgreSQL connection pooling and JWT auth..."
              className="w-full text-xs p-3 bg-surface-subtle border border-surface-border rounded-lg text-charcoal focus:bg-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingSkill ? 'Save Changes' : 'Add to Inventory'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
