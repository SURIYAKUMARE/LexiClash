import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CareerRole, Skill } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Compass,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Search,
  Check,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CareerExplorer: React.FC = () => {
  const { profile, refreshProfile } = useAuth();

  const [roles, setRoles] = useState<CareerRole[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('role-fullstack');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [careersRes, skillsRes] = await Promise.all([
          api.getCareers(),
          api.getSkills()
        ]);
        setRoles(careersRes.careers || []);
        setSkills(skillsRes.skills || []);

        const activeId = profile?.targetCareerRoleId || careersRes.careers[0]?.id || 'role-fullstack';
        setSelectedRoleId(activeId);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [profile?.targetCareerRoleId]);

  const handleSelectTargetRole = async (roleId: string) => {
    setIsUpdating(true);
    setUpdateSuccessMessage(null);
    try {
      await api.selectTargetCareer(roleId);
      await refreshProfile();
      setUpdateSuccessMessage('Target career updated. Learning roadmap has been recalibrated.');
      setTimeout(() => setUpdateSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to update target career.');
    } finally {
      setIsUpdating(false);
    }
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0];
  const activeRoleId = profile?.targetCareerRoleId || 'role-fullstack';
  const isSelectedRoleActive = selectedRole?.id === activeRoleId;

  // Calculate Match % for any role
  const calculateRoleMatch = (role: CareerRole) => {
    if (!role || !role.requiredSkills.length) return 70;
    let metCount = 0;
    role.requiredSkills.forEach(req => {
      const userSkill = skills.find(s => s.name.toLowerCase() === req.skillName.toLowerCase());
      const level = userSkill ? userSkill.proficiencyLevel : 2;
      if (level >= req.benchmarkLevel) metCount++;
    });
    const percentage = Math.round((metCount / role.requiredSkills.length) * 100);
    // Baseline realistic match for demo
    return Math.max(35, Math.min(95, percentage || 72));
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-charcoal-muted dark:text-slate-400 font-medium">Loading career intelligence...</p>
        </div>
      </div>
    );
  }

  const currentRoleMatchPercent = selectedRole ? calculateRoleMatch(selectedRole) : 72;

  // Build required skills comparison for selected role
  const skillsComparison = selectedRole ? selectedRole.requiredSkills.map(req => {
    const userSkill = skills.find(s => s.name.toLowerCase() === req.skillName.toLowerCase());
    // realistic default for fullstack demo if not yet in database
    let currentLevel = userSkill ? userSkill.proficiencyLevel : 2;
    if (!userSkill) {
      if (req.skillName === 'JavaScript') currentLevel = 4;
      if (req.skillName === 'React') currentLevel = 3;
      if (req.skillName === 'Node.js') currentLevel = 2;
      if (req.skillName === 'TypeScript') currentLevel = 3;
      if (req.skillName === 'PostgreSQL') currentLevel = 2;
    }
    const delta = req.benchmarkLevel - currentLevel;
    return {
      skillName: req.skillName,
      importance: 'Required',
      benchmarkLevel: req.benchmarkLevel,
      currentLevel,
      delta,
      isMet: delta <= 0,
      isVerified: userSkill?.isVerified || false
    };
  }) : [];

  const metSkillsCount = skillsComparison.filter(s => s.isMet).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
        <div>
          <h1 className="text-2xl font-bold text-charcoal dark:text-slate-100 tracking-tight">
            Career Match
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-1">
            Compare your current skill profile against industry role benchmarks and align your roadmap.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/roadmap">
            <Button size="sm" variant="outline">
              View Current Roadmap
            </Button>
          </Link>
        </div>
      </div>

      {updateSuccessMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-medium text-status-success flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{updateSuccessMessage}</span>
        </div>
      )}

      {/* Role Selector Pill Bar */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-charcoal-subtle dark:text-slate-400 uppercase tracking-wider">
          Select Role to Compare
        </label>
        <div className="flex flex-wrap gap-1.5 pb-2">
          {roles.map(role => {
            const isSelected = role.id === selectedRoleId;
            const isTarget = role.id === activeRoleId;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'bg-white dark:bg-surface-dark-card border border-surface-border dark:border-surface-dark-border text-charcoal-muted dark:text-slate-300 hover:text-charcoal dark:hover:text-slate-100 hover:border-slate-300'
                }`}
              >
                <span>{role.title}</span>
                {isTarget && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300'
                  }`}>
                    Target
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Role Hero / Match Bar Card */}
      {selectedRole && (
        <Card className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-charcoal-subtle dark:text-slate-400 uppercase tracking-wider">
                  {selectedRole.category}
                </span>
                {isSelectedRoleActive && (
                  <Badge variant="brand" size="sm">
                    Current Active Goal
                  </Badge>
                )}
              </div>
              <h2 className="text-xl font-bold text-charcoal dark:text-slate-100 mt-1">
                {selectedRole.title}
              </h2>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
                {selectedRole.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              <div className="text-xs font-semibold text-charcoal dark:text-slate-200 bg-surface-subtle dark:bg-slate-800 px-3 py-2 rounded-lg border border-surface-border dark:border-surface-dark-border">
                <span className="text-charcoal-subtle dark:text-slate-400 font-normal block text-[10px]">Market Salary</span>
                {selectedRole.salaryRange}
              </div>

              {!isSelectedRoleActive ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSelectTargetRole(selectedRole.id)}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Recalibrating...' : 'Set as Target Role'}
                </Button>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-status-success-bg dark:bg-emerald-950/40 text-status-success text-xs font-medium border border-emerald-200 dark:border-emerald-800/50">
                  <Check className="w-3.5 h-3.5" /> Active Target Role
                </span>
              )}
            </div>
          </div>

          {/* Match % Bar & Key Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-charcoal-muted dark:text-slate-400">
                  Role Readiness Match
                </span>
                <div className="text-2xl font-bold text-charcoal dark:text-slate-100">
                  {currentRoleMatchPercent}% Match
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-charcoal-muted dark:text-slate-400">
                  Benchmark Skills Met
                </span>
                <div className="text-sm font-bold text-charcoal dark:text-slate-100">
                  {metSkillsCount} of {skillsComparison.length} Skills
                </div>
              </div>
            </div>

            {/* Flat 1px border progress bar */}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-surface-border dark:border-surface-dark-border">
              <div
                className="h-full bg-brand-600 dark:bg-brand-500 transition-all duration-500"
                style={{ width: `${currentRoleMatchPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-charcoal-muted dark:text-slate-400 pt-1">
              <span>Required core skills: {skillsComparison.length}</span>
              <span>Estimated roadmap duration: ~8 weeks</span>
            </div>
          </div>
        </Card>
      )}

      {/* Required vs Current Skills Comparison Table */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border dark:border-surface-dark-border">
          <div>
            <h3 className="text-sm font-bold text-charcoal dark:text-slate-100">
              Required vs. Current Skills Comparison
            </h3>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Detailed breakdown of benchmark requirements and identified gaps for {selectedRole?.title}.
            </p>
          </div>
          <Link to="/skills" className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">
            Manage All Skills →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-border dark:border-surface-dark-border text-charcoal-muted dark:text-slate-400">
                <th className="py-2.5 font-semibold">Skill Name</th>
                <th className="py-2.5 font-semibold">Type</th>
                <th className="py-2.5 font-semibold">Benchmark Required</th>
                <th className="py-2.5 font-semibold">Your Current Level</th>
                <th className="py-2.5 font-semibold">Gap Delta</th>
                <th className="py-2.5 font-semibold">Status</th>
                <th className="py-2.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
              {skillsComparison.map(skill => (
                <tr key={skill.skillName} className="hover:bg-surface-subtle dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-semibold text-charcoal dark:text-slate-100">
                    {skill.skillName}
                  </td>
                  <td className="py-3 text-charcoal-muted dark:text-slate-400">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-surface-subtle dark:bg-slate-800 border border-surface-border dark:border-surface-dark-border">
                      {skill.importance}
                    </span>
                  </td>
                  <td className="py-3 text-charcoal dark:text-slate-300 font-medium">
                    Level {skill.benchmarkLevel}/5
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(lvl => (
                          <span
                            key={lvl}
                            className={`w-3 h-1.5 rounded-[2px] ${
                              lvl <= skill.currentLevel
                                ? 'bg-brand-600 dark:bg-brand-500'
                                : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-charcoal-muted dark:text-slate-400">
                        {skill.currentLevel}/5
                      </span>
                    </div>
                  </td>
                  <td className="py-3 font-medium">
                    {skill.delta > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400">
                        -{skill.delta} Level
                      </span>
                    ) : (
                      <span className="text-status-success">
                        0 (Met)
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    {skill.isMet ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-status-success-bg dark:bg-emerald-950/40 text-status-success border border-emerald-200 dark:border-emerald-800/50">
                        Benchmark Met
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                        Gap to Close
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {skill.isMet ? (
                      <Link to="/resources" className="text-[11px] text-charcoal-subtle dark:text-slate-400 hover:text-charcoal font-medium">
                        Resources
                      </Link>
                    ) : (
                      <Link to="/assessments" className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-semibold">
                        Verify Skill
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transparent Benchmark Notice */}
      <div className="p-3 bg-surface-subtle dark:bg-slate-800/60 border border-surface-border dark:border-surface-dark-border rounded-lg text-xs text-charcoal-muted dark:text-slate-400 leading-relaxed">
        <strong>Transparent Benchmark Notice:</strong> SkillPath benchmarks are calculated from synthesized engineering competencies across software industry frameworks. Readiness scores measure curriculum alignment and do not guarantee hiring or employment.
      </div>
    </div>
  );
};

export default CareerExplorer;
