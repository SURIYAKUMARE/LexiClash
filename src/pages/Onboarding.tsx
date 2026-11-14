import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CareerRole, SkillCategory } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  User,
  BrainCircuit,
  Compass,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [careerRoles, setCareerRoles] = useState<CareerRole[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Profile
  const [degree, setDegree] = useState('Computer Science B.S.');
  const [college, setCollege] = useState(user?.college || 'State University');
  const [hoursPerWeek, setHoursPerWeek] = useState(12);
  const [learningStyle, setLearningStyle] = useState<'practical' | 'visual' | 'reading' | 'interactive'>('practical');

  // Step 2: Skills with 1-5 level selectors
  const [skillsList, setSkillsList] = useState<Array<{ skillName: string; category: SkillCategory; proficiencyLevel: number; evidence: string }>>([
    { skillName: 'JavaScript', category: 'languages', proficiencyLevel: 3, evidence: 'Built web applications' },
    { skillName: 'React', category: 'frameworks', proficiencyLevel: 2, evidence: 'Component layouts' },
    { skillName: 'Node.js', category: 'frameworks', proficiencyLevel: 2, evidence: 'Express APIs' },
    { skillName: 'SQL / PostgreSQL', category: 'databases', proficiencyLevel: 2, evidence: 'Database querying' },
    { skillName: 'TypeScript', category: 'languages', proficiencyLevel: 1, evidence: 'Basic types' },
  ]);

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>('languages');
  const [newSkillLevel, setNewSkillLevel] = useState(2);

  // Step 3: Career Goal
  const [targetRoleId, setTargetRoleId] = useState('role-fullstack');
  const [pace, setPace] = useState<'relaxed' | 'moderate' | 'accelerated'>('moderate');

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const data = await api.getCareers();
        setCareerRoles(data.careers);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCareers();
  }, []);

  const updateSkillLevel = (index: number, level: number) => {
    setSkillsList(prev => prev.map((s, idx) => idx === index ? { ...s, proficiencyLevel: level } : s));
  };

  const handleAddCustomSkill = () => {
    if (!newSkillName.trim()) return;
    setSkillsList(prev => [
      ...prev,
      {
        skillName: newSkillName.trim(),
        category: newSkillCategory,
        proficiencyLevel: newSkillLevel,
        evidence: 'Self-reported during onboarding'
      }
    ]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (index: number) => {
    setSkillsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);
    try {
      await api.submitOnboarding({
        degree,
        college,
        graduationYear: '2025',
        bio: `${degree} student targeting ${targetRoleId.replace('role-', '').toUpperCase()} roles.`,
        targetCareerRoleId: targetRoleId,
        careerInterests: ['Full Stack Development', 'Cloud Systems'],
        learningPreferences: {
          hoursPerWeek,
          style: learningStyle,
          pace,
        },
        initialSkills: skillsList,
      });

      await refreshProfile();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRole = careerRoles.find(r => r.id === targetRoleId) || careerRoles[0];

  return (
    <div className="min-h-screen bg-surface-subtle dark:bg-surface-dark-subtle p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-6">
        {/* Top Header & 3-Step Stepper */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
              SP
            </div>
            <span className="font-bold text-base text-charcoal dark:text-white">SkillPath Onboarding</span>
          </div>

          {/* Stepper Header (3 Steps) */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { num: 1, title: 'Profile', icon: User },
              { num: 2, title: 'Skills (1-5 Levels)', icon: BrainCircuit },
              { num: 3, title: 'Career Goal', icon: Compass },
            ].map(step => {
              const Icon = step.icon;
              const isCurrent = currentStep === step.num;
              const isPast = currentStep > step.num;

              return (
                <div
                  key={step.num}
                  className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 transition-colors ${
                    isCurrent
                      ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold'
                      : isPast
                      ? 'border-surface-border dark:border-surface-dark-border bg-surface dark:bg-surface-dark text-status-success dark:text-emerald-400 font-medium'
                      : 'border-surface-border dark:border-surface-dark-border bg-surface dark:bg-surface-dark text-charcoal-subtle dark:text-slate-500'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-brand-600 text-white'
                        : isPast
                        ? 'bg-status-success text-white'
                        : 'bg-surface-muted dark:bg-surface-dark-muted text-charcoal-subtle'
                    }`}
                  >
                    {isPast ? <Check className="w-3 h-3" /> : step.num}
                  </div>
                  <span className="truncate">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Content */}
        <Card className="p-6 sm:p-8 space-y-6">
          {/* STEP 1: Profile */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-charcoal dark:text-white">
                  Step 1: Background & Study Capacity
                </h2>
                <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
                  Set your educational baseline and weekly learning availability.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-charcoal dark:text-slate-300 mb-1">
                    College / Organization
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. Stanford University"
                    className="w-full text-xs px-3 py-2 bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-lg text-charcoal dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal dark:text-slate-300 mb-1">
                    Degree / Discipline
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. Computer Science B.S."
                    className="w-full text-xs px-3 py-2 bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-lg text-charcoal dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal dark:text-slate-300 mb-1">
                    Weekly Time Commitment
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="4"
                      max="40"
                      value={hoursPerWeek}
                      onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                      className="w-24 text-xs px-3 py-2 bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-lg text-charcoal dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-600"
                    />
                    <span className="text-xs text-charcoal-muted dark:text-slate-400">hours per week</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal dark:text-slate-300 mb-1">
                    Preferred Learning Style
                  </label>
                  <select
                    value={learningStyle}
                    onChange={(e) => setLearningStyle(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-lg text-charcoal dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  >
                    <option value="practical">Practical / Project-Driven</option>
                    <option value="visual">Visual / Architectural Diagrams</option>
                    <option value="reading">Documentation & Technical Specs</option>
                    <option value="interactive">Interactive Challenges & Quizzes</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Skills with 1-5 Level Selectors */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-charcoal dark:text-white">
                  Step 2: Core Skills & Proficiency (1-5 Scale)
                </h2>
                <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
                  Select your current baseline: 1 Beginner, 2 Elementary, 3 Intermediate, 4 Advanced, 5 Expert.
                </p>
              </div>

              {/* Skill list with 1-5 segmented buttons */}
              <div className="space-y-3">
                {skillsList.map((skill, idx) => (
                  <div
                    key={skill.skillName}
                    className="p-3 bg-surface-subtle dark:bg-surface-dark-subtle border border-surface-border dark:border-surface-dark-border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-charcoal dark:text-white">{skill.skillName}</span>
                        <Badge variant="neutral" size="sm">{skill.category}</Badge>
                      </div>
                      <span className="text-[11px] text-charcoal-muted dark:text-slate-400">
                        Level {skill.proficiencyLevel} of 5
                      </span>
                    </div>

                    {/* 1-5 Segmented Selector Buttons */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const isSelected = skill.proficiencyLevel === lvl;

                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => updateSkillLevel(idx, lvl)}
                            className={`w-7 h-7 rounded text-xs font-semibold transition-colors border ${
                              isSelected
                                ? 'bg-brand-600 text-white border-brand-700'
                                : 'bg-surface dark:bg-surface-dark border-surface-border dark:border-surface-dark-border text-charcoal-muted dark:text-slate-400 hover:bg-surface-muted dark:hover:bg-surface-dark-muted'
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handleRemoveSkill(idx)}
                        className="ml-2 text-charcoal-subtle dark:text-slate-500 hover:text-status-danger p-1 rounded"
                        title="Remove skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Skill Row */}
              <div className="pt-2 border-t border-surface-border dark:border-surface-dark-border flex flex-col sm:flex-row gap-2 items-center">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="Add another skill (e.g. Docker, GraphQL)"
                  className="flex-1 w-full text-xs px-3 py-2 bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-lg text-charcoal dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-600"
                />
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={handleAddCustomSkill}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Skill
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Career Goal */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-charcoal dark:text-white">
                  Step 3: Select Target Career Goal
                </h2>
                <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5">
                  Your weekly tasks and assessment requirements will align with this benchmark.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {careerRoles.slice(0, 6).map((role) => {
                  const isSelected = targetRoleId === role.id;

                  return (
                    <div
                      key={role.id}
                      onClick={() => setTargetRoleId(role.id)}
                      className={`p-3.5 rounded-lg border cursor-pointer text-xs transition-colors flex items-start justify-between ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 text-brand-900 dark:text-brand-100 font-semibold'
                          : 'border-surface-border dark:border-surface-dark-border bg-surface dark:bg-surface-dark hover:bg-surface-subtle dark:hover:bg-surface-dark-muted text-charcoal dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <span className="block font-bold">{role.title}</span>
                        <span className="text-[11px] text-charcoal-muted dark:text-slate-400 block mt-0.5">
                          {role.category}
                        </span>
                        <span className="text-[11px] text-brand-600 dark:text-brand-400 font-medium block mt-1">
                          {role.salaryRange}
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-brand-600 bg-brand-600 text-white' : 'border-surface-border'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Target Role Benchmark Summary */}
              {selectedRole && (
                <div className="p-4 bg-surface-subtle dark:bg-surface-dark-subtle border border-surface-border dark:border-surface-dark-border rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-charcoal dark:text-white">Benchmark Requirements: {selectedRole.title}</span>
                    <Badge variant="brand" size="sm">Benchmark</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedRole.requiredSkills.map((req, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded text-charcoal-muted dark:text-slate-300 font-medium"
                      >
                        {req.skillName} (Req: Level {req.benchmarkLevel})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stepper Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-surface-border dark:border-surface-dark-border">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(prev => prev - 1)}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                disabled={isSubmitting}
              >
                Back
              </Button>
            ) : <div />}

            {currentStep < 3 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentStep(prev => prev + 1)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Next Step
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleCompleteOnboarding}
                isLoading={isSubmitting}
              >
                Complete Onboarding & Generate Roadmap
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
