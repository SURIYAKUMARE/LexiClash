import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Skill, SkillCategory, ProficiencyLevel, SkillGapAnalysisResult } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { SkillRadarChart } from '../components/charts/SkillRadarChart';
import {
  Plus,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  ArrowUpDown,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';

export const SkillAnalysis: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<SkillGapAnalysisResult | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'level' | 'category' | 'verified'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
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
      const [skillsRes, gapRes, analyticsRes] = await Promise.all([
        api.getSkills(),
        api.getSkillGapAnalysis(),
        api.getAnalytics()
      ]);
      setSkills(skillsRes.skills || []);
      setGapAnalysis(gapRes.gapAnalysis || null);
      setAnalyticsData(analyticsRes || null);
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
          category: formCategory as any,
          proficiencyLevel: formLevel,
          evidence: formEvidence,
        });
      } else {
        await api.addSkill({
          skillName: formSkillName.trim(),
          category: formCategory as any,
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

  const toggleSort = (field: 'name' | 'level' | 'category' | 'verified') => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'languages', label: 'Languages' },
    { key: 'frameworks', label: 'Frameworks' },
    { key: 'databases', label: 'Databases' },
    { key: 'cloud', label: 'Cloud / DevOps' },
    { key: 'analytics', label: 'Analytics & AI' },
    { key: 'soft_skills', label: 'Soft Skills' }
  ];

  const filteredAndSortedSkills = useMemo(() => {
    return skills
      .filter(s => {
        const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
        const matchesSearch = s.skillName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'name') {
          comparison = a.skillName.localeCompare(b.skillName);
        } else if (sortField === 'level') {
          comparison = a.proficiencyLevel - b.proficiencyLevel;
        } else if (sortField === 'category') {
          comparison = a.category.localeCompare(b.category);
        } else if (sortField === 'verified') {
          comparison = (a.isVerified ? 1 : 0) - (b.isVerified ? 1 : 0);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [skills, selectedCategory, searchQuery, sortField, sortOrder]);

  const levelLabels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];

  const radarData = analyticsData?.radarData || [
    { category: 'Languages', current: 75, benchmark: 90, fullMark: 100 },
    { category: 'Frameworks', current: 65, benchmark: 85, fullMark: 100 },
    { category: 'Databases', current: 50, benchmark: 75, fullMark: 100 },
    { category: 'DevOps', current: 40, benchmark: 70, fullMark: 100 },
    { category: 'System Design', current: 55, benchmark: 80, fullMark: 100 },
    { category: 'Soft Skills', current: 80, benchmark: 80, fullMark: 100 }
  ];

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-charcoal-muted dark:text-slate-400 font-medium">Loading skill analysis...</p>
        </div>
      </div>
    );
  }

  const verifiedCount = skills.filter(s => s.isVerified).length;
  const avgLevel = skills.length
    ? (skills.reduce((acc, s) => acc + s.proficiencyLevel, 0) / skills.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
        <div>
          <h1 className="text-2xl font-bold text-charcoal dark:text-slate-100 tracking-tight">
            Skill Analysis
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-1">
            Radar competency evaluation, verified assessments, and sortable skill inventory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={openAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Skill
          </Button>
        </div>
      </div>

      {/* Row 1: Radar Chart + Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart (2 cols) */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border dark:border-surface-dark-border">
            <div>
              <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">
                Competency Radar Profile
              </h2>
              <p className="text-xs text-charcoal-muted dark:text-slate-400">
                Current proficiency vs. Full Stack Developer market benchmark
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-charcoal dark:text-slate-200">
                <span className="w-2.5 h-2.5 rounded-sm bg-brand-600 dark:bg-brand-500 inline-block" />
                Current Level
              </span>
              <span className="flex items-center gap-1.5 text-charcoal-muted dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 dark:bg-slate-600 inline-block" />
                Benchmark
              </span>
            </div>
          </div>

          <div className="py-4 flex-1 flex items-center justify-center">
            <SkillRadarChart data={radarData} />
          </div>

          <div className="pt-3 border-t border-surface-border dark:border-surface-dark-border flex flex-wrap items-center justify-between text-xs text-charcoal-muted dark:text-slate-400 gap-2">
            <span>Primary strengths: JavaScript, React, Problem Solving</span>
            <span>Key gaps: Node.js, PostgreSQL, Docker</span>
          </div>
        </Card>

        {/* Inventory Statistics */}
        <div className="space-y-4 flex flex-col justify-between">
          <Card className="flex-1 flex flex-col justify-between">
            <div className="text-xs font-semibold text-charcoal-subtle dark:text-slate-400 uppercase tracking-wider">
              Inventory Overview
            </div>
            <div className="grid grid-cols-2 gap-3 my-3">
              <div className="p-3 bg-surface-subtle dark:bg-slate-800/50 rounded-lg border border-surface-border dark:border-surface-dark-border">
                <span className="text-[11px] text-charcoal-muted dark:text-slate-400 block">Total Skills</span>
                <span className="text-xl font-bold text-charcoal dark:text-slate-100">{skills.length}</span>
              </div>
              <div className="p-3 bg-surface-subtle dark:bg-slate-800/50 rounded-lg border border-surface-border dark:border-surface-dark-border">
                <span className="text-[11px] text-charcoal-muted dark:text-slate-400 block">Verified</span>
                <span className="text-xl font-bold text-status-success">{verifiedCount}</span>
              </div>
              <div className="p-3 bg-surface-subtle dark:bg-slate-800/50 rounded-lg border border-surface-border dark:border-surface-dark-border">
                <span className="text-[11px] text-charcoal-muted dark:text-slate-400 block">Avg Level</span>
                <span className="text-xl font-bold text-charcoal dark:text-slate-100">{avgLevel}/5</span>
              </div>
              <div className="p-3 bg-surface-subtle dark:bg-slate-800/50 rounded-lg border border-surface-border dark:border-surface-dark-border">
                <span className="text-[11px] text-charcoal-muted dark:text-slate-400 block">Self-Reported</span>
                <span className="text-xl font-bold text-charcoal-muted dark:text-slate-300">
                  {skills.length - verifiedCount}
                </span>
              </div>
            </div>
            <div className="text-[11px] text-charcoal-muted dark:text-slate-400">
              Verified skills carry 2x weight in role readiness scoring.
            </div>
          </Card>

          <Card className="border-l-4 border-l-amber-500 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider pb-1">
                <span>Top Gap Identified</span>
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-charcoal dark:text-slate-100 mt-1">
                Node.js Backend & Concurrency
              </h3>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-1">
                Current Level 2 vs. Target Level 4. Take the Node.js diagnostic assessment to verify and accelerate your roadmap.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-surface-border dark:border-surface-dark-border flex justify-end">
              <Link to="/assessments">
                <Button size="sm" variant="outline">
                  Assess Node.js
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 2: Sortable Skill Table */}
      <Card className="space-y-4">
        {/* Table Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-surface-border dark:border-surface-dark-border">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1">
            {categories.map(c => (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === c.key
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'text-charcoal-muted dark:text-slate-400 hover:text-charcoal dark:hover:text-slate-200 hover:bg-surface-subtle dark:hover:bg-slate-800'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-charcoal-subtle dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter skills..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card text-charcoal dark:text-slate-100 focus:outline-none focus:border-brand-600"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-border dark:border-surface-dark-border text-charcoal-muted dark:text-slate-400">
                <th
                  onClick={() => toggleSort('name')}
                  className="py-2.5 font-semibold cursor-pointer hover:text-charcoal dark:hover:text-slate-200 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Skill</span>
                    <ArrowUpDown className="w-3 h-3 text-charcoal-subtle dark:text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('category')}
                  className="py-2.5 font-semibold cursor-pointer hover:text-charcoal dark:hover:text-slate-200 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3 text-charcoal-subtle dark:text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('level')}
                  className="py-2.5 font-semibold cursor-pointer hover:text-charcoal dark:hover:text-slate-200 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Proficiency Level</span>
                    <ArrowUpDown className="w-3 h-3 text-charcoal-subtle dark:text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('verified')}
                  className="py-2.5 font-semibold cursor-pointer hover:text-charcoal dark:hover:text-slate-200 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Verification</span>
                    <ArrowUpDown className="w-3 h-3 text-charcoal-subtle dark:text-slate-500" />
                  </div>
                </th>
                <th className="py-2.5 font-semibold">Evidence / Notes</th>
                <th className="py-2.5 font-semibold">Last Assessed</th>
                <th className="py-2.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
              {filteredAndSortedSkills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-charcoal-muted dark:text-slate-400">
                    No skills matched the current filters. Click "Add Skill" to record a new competency.
                  </td>
                </tr>
              ) : (
                filteredAndSortedSkills.map(skill => (
                  <tr key={skill.id} className="hover:bg-surface-subtle dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-semibold text-charcoal dark:text-slate-100">
                      {skill.skillName}
                    </td>
                    <td className="py-3 text-charcoal-muted dark:text-slate-400 capitalize">
                      {skill.category.replace('_', ' ')}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {/* 5-segment level bars */}
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(lvl => (
                            <span
                              key={lvl}
                              className={`w-3.5 h-2 rounded-[2px] ${
                                lvl <= skill.proficiencyLevel
                                  ? 'bg-brand-600 dark:bg-brand-500'
                                  : 'bg-slate-200 dark:bg-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-charcoal-muted dark:text-slate-400 font-medium">
                          Lvl {skill.proficiencyLevel} ({levelLabels[skill.proficiencyLevel - 1]})
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      {skill.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-status-success-bg dark:bg-emerald-950/40 text-status-success border border-emerald-200 dark:border-emerald-800/50">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified ({skill.verifiedScore ?? 100}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-charcoal-muted dark:text-slate-400 border border-surface-border dark:border-surface-dark-border">
                          Self-Reported
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-charcoal-muted dark:text-slate-400 max-w-xs truncate text-[11px]">
                      {skill.evidence || '—'}
                    </td>
                    <td className="py-3 text-charcoal-subtle dark:text-slate-400 text-[11px]">
                      {skill.lastAssessedAt
                        ? new Date(skill.lastAssessedAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(skill)}
                          className="p-1 text-charcoal-subtle dark:text-slate-400 hover:text-charcoal dark:hover:text-slate-200 rounded hover:bg-surface-subtle dark:hover:bg-slate-800"
                          title="Edit Skill"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="p-1 text-charcoal-subtle dark:text-slate-400 hover:text-red-600 rounded hover:bg-surface-subtle dark:hover:bg-slate-800"
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingSkill ? 'Edit Skill' : 'Add New Skill'}
      >
        <form onSubmit={handleSaveSkill} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs text-status-error">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
              Skill Name
            </label>
            <input
              type="text"
              value={formSkillName}
              onChange={e => setFormSkillName(e.target.value)}
              placeholder="e.g. JavaScript, Docker, System Design"
              disabled={!!editingSkill}
              className="w-full px-3 py-2 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card text-charcoal dark:text-slate-100 focus:outline-none focus:border-brand-600 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
              Category
            </label>
            <select
              value={formCategory}
              onChange={e => setFormCategory(e.target.value as SkillCategory)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card text-charcoal dark:text-slate-100 focus:outline-none focus:border-brand-600"
            >
              <option value="languages">Languages</option>
              <option value="frameworks">Frameworks</option>
              <option value="databases">Databases</option>
              <option value="cloud">Cloud / DevOps</option>
              <option value="analytics">Analytics & AI</option>
              <option value="soft_skills">Soft Skills</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
              Proficiency Level (1 - 5)
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFormLevel(lvl as ProficiencyLevel)}
                  className={`py-2 px-1 text-center rounded-lg border text-xs font-semibold transition-all ${
                    formLevel === lvl
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300'
                      : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card text-charcoal-muted dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="block text-sm font-bold">{lvl}</span>
                  <span className="text-[10px] block font-normal truncate">
                    {levelLabels[lvl - 1]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
              Evidence / Experience Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={formEvidence}
              onChange={e => setFormEvidence(e.target.value)}
              placeholder="e.g. 2 years building production REST APIs in Express & Fastify"
              className="w-full px-3 py-2 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card text-charcoal dark:text-slate-100 focus:outline-none focus:border-brand-600 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-border dark:border-surface-dark-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              {editingSkill ? 'Save Changes' : 'Add Skill'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SkillAnalysis;
