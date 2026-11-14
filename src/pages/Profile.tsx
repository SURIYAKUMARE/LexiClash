import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { OfflineSkill, OfflineCareerRole } from '../db/indexedDb';
import { ProfilerAgent } from '../agents/profilerAgent';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  User,
  GraduationCap,
  Building2,
  Calendar,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Target,
  ArrowRight,
  ExternalLink,
  Code2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { user, profile, refreshProfile, updateProfile } = useAuth();

  const [skills, setSkills] = useState<OfflineSkill[]>([]);
  const [careers, setCareers] = useState<OfflineCareerRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('role-fullstack');
  const [isPivotUpdating, setIsPivotUpdating] = useState(false);

  // Profile fields
  const [college, setCollege] = useState(user?.college || profile?.college || '');
  const [hoursPerWeek, setHoursPerWeek] = useState(profile?.hoursPerWeek || 12);
  const [educationLevel, setEducationLevel] = useState(profile?.educationLevel || 'B.Tech Computer Science');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Resume / Project Description Extractor Modal
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [parsedSkills, setParsedSkills] = useState<{
    skillName: string;
    category: any;
    confidenceLevel: number;
    sourceSnippet: string;
  }[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  // Add / Edit Skill Modal
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState<any>('languages');
  const [skillLevel, setSkillLevel] = useState(3);
  const [skillEvidence, setSkillEvidence] = useState('');

  const loadData = async () => {
    try {
      const [skillsRes, careersRes] = await Promise.all([
        api.getSkills(),
        api.getCareers()
      ]);
      setSkills(skillsRes.skills || []);
      setCareers(careersRes.careers || []);
      if (profile?.targetCareerRoleId) {
        setSelectedRoleId(profile.targetCareerRoleId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile?.targetCareerRoleId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    try {
      await updateProfile({
        college,
        hoursPerWeek: Number(hoursPerWeek),
        educationLevel
      });
      setSuccessMsg('Profile updated successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCareerPivot = async (roleId: string) => {
    setSelectedRoleId(roleId);
    setIsPivotUpdating(true);
    try {
      await api.selectTargetCareer(roleId);
      await refreshProfile();
      setSuccessMsg('Target career pivoted! All roadmap phases & readiness scores recalibrated.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPivotUpdating(false);
    }
  };

  const handleParseText = () => {
    if (!pastedText.trim()) return;
    setIsParsing(true);
    try {
      const result = ProfilerAgent.parseResumeOrProjectText(pastedText);
      setParsedSkills(result.extractedSkills);
    } finally {
      setIsParsing(false);
    }
  };

  const handleImportExtractedSkills = async () => {
    for (const item of parsedSkills) {
      await api.addSkill({
        skillName: item.skillName,
        category: item.category,
        proficiencyLevel: item.confidenceLevel,
        evidence: `Extracted from text: "${item.sourceSnippet}"`
      });
    }
    await loadData();
    await refreshProfile();
    setIsResumeModalOpen(false);
    setPastedText('');
    setParsedSkills([]);
    setSuccessMsg(`Imported ${parsedSkills.length} competencies into your skill vault!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleSaveSingleSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    await api.addSkill({
      skillName: skillName.trim(),
      category: skillCategory,
      proficiencyLevel: skillLevel,
      evidence: skillEvidence.trim()
    });
    await loadData();
    await refreshProfile();
    setIsSkillModalOpen(false);
    setSkillName('');
    setSkillEvidence('');
  };

  const handleDeleteSkill = async (id: string) => {
    await api.deleteSkill(id);
    await loadData();
    await refreshProfile();
  };

  const currentRole = careers.find(c => c.id === selectedRoleId) || careers[0];
  const levelLabels = ['Novice', 'Elementary', 'Intermediate', 'Advanced', 'Expert / Master'];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
        <div>
          <h1 className="text-2xl font-bold text-charcoal dark:text-slate-100 tracking-tight font-sans">
            Learner Profile & Competency Vault
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-1">
            Manage your credentials, parse competencies from project descriptions, and execute instant career pivots.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResumeModalOpen(true)}
            leftIcon={<FileText className="w-3.5 h-3.5 text-stitch-blue" />}
          >
            Auto-Extract from Resume
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSkillModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Skill
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-medium text-status-success flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Row 1: Instant Career Pivot Selector Banner */}
      <Card className="border-l-4 border-l-stitch-blue space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-surface-border dark:border-surface-dark-border">
          <div>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-stitch-blue dark:text-blue-400 block">
              Cross-Agent Career Alignment Engine
            </span>
            <h2 className="text-base font-bold text-charcoal dark:text-slate-100">
              Active Career Target: {currentRole?.title}
            </h2>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-surface-subtle dark:bg-slate-800 border border-surface-border dark:border-surface-dark-border text-charcoal dark:text-slate-200">
            Readiness: <strong className="text-stitch-blue dark:text-blue-400">{profile?.overallReadinessScore || 72}%</strong>
          </span>
        </div>

        <p className="text-xs text-charcoal-muted dark:text-slate-400">
          Switching career targets immediately triggers cross-agent recalculation across the Profiler, Career Architect, and Curriculum Strategist agents.
        </p>

        {/* Pivot Selector Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {careers.map(role => {
            const isSelected = role.id === selectedRoleId;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => handleCareerPivot(role.id)}
                disabled={isPivotUpdating}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-stitch-blue text-white font-semibold'
                    : 'bg-white dark:bg-surface-dark-card border border-surface-border dark:border-surface-dark-border text-charcoal-muted dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <span>{role.title}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Row 2: Personal Details & Velocity Budget */}
      <Card className="space-y-4">
        <div className="pb-3 border-b border-surface-border dark:border-surface-dark-border">
          <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">
            Academic & Time Budget Details
          </h2>
          <p className="text-xs text-charcoal-muted dark:text-slate-400">
            These variables anchor your weekly roadmap milestone dates and cognitive pacing.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
              Institution / College
            </label>
            <input
              type="text"
              value={college}
              onChange={e => setCollege(e.target.value)}
              placeholder="e.g. Stanford University"
              className="w-full px-3 py-2 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark text-charcoal dark:text-slate-100 focus:outline-none focus:border-stitch-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
              Education / Degree Level
            </label>
            <input
              type="text"
              value={educationLevel}
              onChange={e => setEducationLevel(e.target.value)}
              placeholder="e.g. B.Tech Computer Science"
              className="w-full px-3 py-2 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark text-charcoal dark:text-slate-100 focus:outline-none focus:border-stitch-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
              Weekly Available Study Hours
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="2"
                max="60"
                value={hoursPerWeek}
                onChange={e => setHoursPerWeek(Number(e.target.value))}
                className="w-24 px-3 py-2 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark text-charcoal dark:text-slate-100 focus:outline-none focus:border-stitch-blue font-mono"
              />
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                Save
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Row 3: Interactive Skill Matrix */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-border dark:border-surface-dark-border">
          <div>
            <h2 className="text-sm font-bold text-charcoal dark:text-slate-100">
              Interactive Competency Vault ({skills.length} Skills)
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Verified skills carry assessment proof; self-reported skills can be verified via diagnostic checks.
            </p>
          </div>
          <span className="text-xs text-status-success font-semibold font-mono">
            {skills.filter(s => s.isVerified).length} Verified Credentials
          </span>
        </div>

        <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
          {skills.map(s => (
            <div key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-charcoal dark:text-slate-100 text-sm">
                    {s.skillName}
                  </span>
                  <span className="text-[10px] uppercase font-mono text-charcoal-subtle dark:text-slate-400 bg-surface-subtle dark:bg-slate-800 px-1.5 py-0.2 rounded border border-surface-border dark:border-surface-dark-border">
                    {s.category}
                  </span>
                  {s.isVerified ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-status-success-bg dark:bg-emerald-950/40 text-status-success border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified ({s.verifiedScore || 85}%)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-charcoal-muted dark:text-slate-400 border border-surface-border dark:border-surface-dark-border">
                      Self-Reported
                    </span>
                  )}
                </div>
                {s.evidence && (
                  <p className="text-[11px] text-charcoal-muted dark:text-slate-400 line-clamp-1">
                    Proof: {s.evidence}
                  </p>
                )}
              </div>

              {/* Proficiency Level Bar & Sliders */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(lvl => (
                        <span
                          key={lvl}
                          className={`w-3.5 h-1.5 rounded-[2px] ${
                            lvl <= s.proficiencyLevel
                              ? 'bg-stitch-blue dark:bg-blue-500'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-mono font-bold text-charcoal dark:text-slate-200 ml-1">
                      L{s.proficiencyLevel}
                    </span>
                  </div>
                  <span className="text-[10px] text-charcoal-subtle dark:text-slate-400 block mt-0.5">
                    {levelLabels[s.proficiencyLevel - 1]}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteSkill(s.id)}
                  className="p-1.5 text-charcoal-subtle hover:text-red-600 rounded hover:bg-surface-subtle dark:hover:bg-slate-800"
                  title="Remove Skill"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* MODAL 1: Auto-Extract from Resume / Project */}
      <Modal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        title="Auto-Extract Skills from Resume or Project Overview"
      >
        <div className="space-y-4">
          <p className="text-xs text-charcoal-muted dark:text-slate-400 leading-relaxed">
            Paste your resume, GitHub README, or project overview text below. The Profiler Agent will deterministically parse engineering entities, map categories, and estimate proficiency confidence.
          </p>

          <textarea
            rows={5}
            value={pastedText}
            onChange={e => setPastedText(e.target.value)}
            placeholder="e.g. 2 years building full-stack applications with React, TypeScript, and Node.js. Designed PostgreSQL databases and containerized services using Docker..."
            className="w-full p-3 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark text-charcoal dark:text-slate-100 font-sans focus:outline-none focus:border-stitch-blue resize-none"
          />

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleParseText}
              disabled={!pastedText.trim() || isParsing}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              {isParsing ? 'Parsing Entities...' : 'Extract Competencies'}
            </Button>
            <span className="text-[11px] text-charcoal-subtle font-mono">
              {parsedSkills.length} Entities Found
            </span>
          </div>

          {parsedSkills.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-surface-border dark:border-surface-dark-border">
              <span className="text-xs font-bold text-charcoal dark:text-slate-200 block">
                Extracted Competency Preview:
              </span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {parsedSkills.map((ps, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-surface-subtle dark:bg-slate-800/60 border border-surface-border dark:border-surface-dark-border text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-charcoal dark:text-slate-100">{ps.skillName}</span>
                      <span className="text-[10px] text-charcoal-subtle dark:text-slate-400 block font-mono">
                        Level {ps.confidenceLevel} ({ps.category})
                      </span>
                    </div>
                    <span className="text-[10px] text-status-success font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                      High Confidence
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleImportExtractedSkills}
                >
                  Import All {parsedSkills.length} Skills
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL 2: Add Single Skill */}
      <Modal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        title="Record New Technical Skill"
      >
        <form onSubmit={handleSaveSingleSkill} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
              Skill Name
            </label>
            <input
              type="text"
              required
              value={skillName}
              onChange={e => setSkillName(e.target.value)}
              placeholder="e.g. JavaScript, Docker, PyTorch"
              className="w-full px-3 py-2 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark text-charcoal dark:text-slate-100 focus:outline-none focus:border-stitch-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
              Category
            </label>
            <select
              value={skillCategory}
              onChange={e => setSkillCategory(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark text-charcoal dark:text-slate-100 focus:outline-none focus:border-stitch-blue"
            >
              <option value="languages">Languages</option>
              <option value="frameworks">Frameworks & Libraries</option>
              <option value="databases">Databases & Storage</option>
              <option value="cloud">Cloud & DevOps</option>
              <option value="analytics">Analytics & Machine Learning</option>
              <option value="design">Design & Product</option>
              <option value="security">Security</option>
              <option value="soft_skills">Soft Skills</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
              Proficiency Level: {skillLevel} - {levelLabels[skillLevel - 1]}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={skillLevel}
              onChange={e => setSkillLevel(Number(e.target.value))}
              className="w-full accent-stitch-blue cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-charcoal-subtle dark:text-slate-400 font-mono mt-1">
              <span>Novice (1)</span>
              <span>Intermediate (3)</span>
              <span>Master (5)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal dark:text-slate-200 mb-1">
              Evidence / Practical Experience
            </label>
            <textarea
              rows={2}
              value={skillEvidence}
              onChange={e => setSkillEvidence(e.target.value)}
              placeholder="e.g. 2 years building production REST endpoints in Express"
              className="w-full px-3 py-2 text-xs rounded-lg border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark text-charcoal dark:text-slate-100 focus:outline-none focus:border-stitch-blue resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-border dark:border-surface-dark-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsSkillModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Skill
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
