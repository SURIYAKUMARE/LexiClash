import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CareerRole, SkillCategory } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  GraduationCap,
  Sparkles,
  BrainCircuit,
  Compass,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Loader2
} from 'lucide-react';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [careerRoles, setCareerRoles] = useState<CareerRole[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [synthesisProgress, setSynthesisProgress] = useState<string>('');

  // Form State
  const [degree, setDegree] = useState('Computer Science B.S.');
  const [college, setCollege] = useState(user?.college || 'State University');
  const [graduationYear, setGraduationYear] = useState('2025');
  const [bio, setBio] = useState('Aspiring software engineer eager to master full-stack web applications and cloud deployments.');

  const [targetRoleId, setTargetRoleId] = useState('role-fullstack');
  const [careerInterests, setCareerInterests] = useState<string[]>(['Full Stack Engineering', 'Cloud Native']);

  const [hoursPerWeek, setHoursPerWeek] = useState(12);
  const [learningStyle, setLearningStyle] = useState<'practical' | 'visual' | 'reading' | 'interactive'>('practical');
  const [pace, setPace] = useState<'relaxed' | 'moderate' | 'accelerated'>('moderate');

  // Existing Skills State
  const [skillsList, setSkillsList] = useState<Array<{ skillName: string; category: SkillCategory; proficiencyLevel: number; evidence: string }>>([
    { skillName: 'JavaScript', category: 'languages', proficiencyLevel: 3, evidence: 'Built interactive frontend pages' },
    { skillName: 'React', category: 'frameworks', proficiencyLevel: 3, evidence: 'Built component-driven dashboards' },
    { skillName: 'SQL / PostgreSQL', category: 'databases', proficiencyLevel: 2, evidence: 'Wrote relational schema and joins' },
  ]);

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>('languages');
  const [newSkillLevel, setNewSkillLevel] = useState(3);
  const [newSkillEvidence, setNewSkillEvidence] = useState('');

  // Projects State
  const [projectTitle, setProjectTitle] = useState('DevPortfolio Workspace');
  const [projectDesc, setProjectDesc] = useState('Personal full-stack portfolio with automated CI/CD and database storage.');

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

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkillsList([
      ...skillsList,
      {
        skillName: newSkillName.trim(),
        category: newSkillCategory,
        proficiencyLevel: newSkillLevel,
        evidence: newSkillEvidence.trim() || 'Self-reported proficiency'
      }
    ]);
    setNewSkillName('');
    setNewSkillEvidence('');
  };

  const handleRemoveSkill = (index: number) => {
    setSkillsList(skillsList.filter((_, i) => i !== index));
  };

  const toggleInterest = (interest: string) => {
    if (careerInterests.includes(interest)) {
      setCareerInterests(careerInterests.filter(i => i !== interest));
    } else {
      setCareerInterests([...careerInterests, interest]);
    }
  };

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);
    setSynthesisProgress('1. Profile Analyzer Agent analyzing learner background...');

    setTimeout(() => {
      setSynthesisProgress('2. Skill Gap Analyzer Agent computing role benchmarks...');
    }, 600);

    setTimeout(() => {
      setSynthesisProgress('3. Learning Path Agent synthesizing tailored roadmap...');
    }, 1200);

    try {
      await api.submitOnboarding({
        degree,
        college,
        graduationYear,
        bio,
        targetCareerRoleId: targetRoleId,
        careerInterests,
        learningPreferences: {
          hoursPerWeek,
          style: learningStyle,
          pace,
        },
        initialSkills: skillsList,
        projects: [
          {
            title: projectTitle,
            description: projectDesc,
            skills: ['React', 'JavaScript', 'SQL'],
            status: 'completed',
          }
        ]
      });

      await refreshProfile();
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Onboarding failed:', err);
      setIsSubmitting(false);
    }
  };

  const selectedRole = careerRoles.find(r => r.id === targetRoleId) || careerRoles[0];

  return (
    <div className="min-h-screen bg-surface-subtle p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header Steps */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200 rounded-full text-xs font-semibold text-brand-700">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Agentic Onboarding Wizard</span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal">
            Design Your Personalized Journey
          </h1>
          <p className="text-xs text-charcoal-muted">
            Step {currentStep} of 4: {
              currentStep === 1 ? 'Education & Personal Information' :
              currentStep === 2 ? 'Existing Skills & Competencies' :
              currentStep === 3 ? 'Target Career & Specialization' :
              'Learning Preferences & Multi-Agent Synthesis'
            }
          </p>

          {/* Progress Indicators */}
          <div className="flex justify-center items-center gap-2 pt-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all ${
                  step === currentStep
                    ? 'w-8 bg-brand-600'
                    : step < currentStep
                    ? 'w-4 bg-status-success'
                    : 'w-4 bg-surface-border'
                }`}
              />
            ))}
          </div>
        </div>

        <Card className="p-6 sm:p-8 shadow-card">
          {/* STEP 1: Personal & Education */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-surface-border pb-3">
                <GraduationCap className="w-5 h-5 text-brand-600" />
                <h3 className="font-semibold text-charcoal text-sm">Academic Background & Bio</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1">
                    College or University
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. Stanford, Georgia Tech"
                    className="w-full text-xs px-3 py-2.5 bg-surface-subtle border border-surface-border rounded-lg text-charcoal focus:bg-white focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1">
                    Degree & Major
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. Computer Science B.S."
                    className="w-full text-xs px-3 py-2.5 bg-surface-subtle border border-surface-border rounded-lg text-charcoal focus:bg-white focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1">
                    Expected Graduation / Completion Year
                  </label>
                  <input
                    type="text"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="2025"
                    className="w-full text-xs px-3 py-2.5 bg-surface-subtle border border-surface-border rounded-lg text-charcoal focus:bg-white focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1">
                    Portfolio Project Highlight (Optional)
                  </label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g. Distributed Task Queue"
                    className="w-full text-xs px-3 py-2.5 bg-surface-subtle border border-surface-border rounded-lg text-charcoal focus:bg-white focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">
                  Professional Bio & Career Goals
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a brief overview of your background, motivations, and technical interests..."
                  className="w-full text-xs p-3 bg-surface-subtle border border-surface-border rounded-lg text-charcoal focus:bg-white focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Existing Skills */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-surface-border pb-3">
                <BrainCircuit className="w-5 h-5 text-brand-600" />
                <div>
                  <h3 className="font-semibold text-charcoal text-sm">Your Current Skill Profile</h3>
                  <p className="text-xs text-charcoal-muted">Add skills you have worked with and estimate your proficiency (Level 1 to 5).</p>
                </div>
              </div>

              {/* Skills Table / List */}
              <div className="space-y-2">
                {skillsList.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-surface-subtle rounded-lg border border-surface-border"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-charcoal">{skill.skillName}</span>
                        <Badge variant="brand" size="sm">Level {skill.proficiencyLevel}/5</Badge>
                        <span className="text-[10px] text-charcoal-subtle uppercase">{skill.category}</span>
                      </div>
                      {skill.evidence && (
                        <p className="text-[11px] text-charcoal-muted mt-0.5">{skill.evidence}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveSkill(index)}
                      className="text-charcoal-subtle hover:text-status-danger p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Skill Form */}
              <div className="p-4 bg-brand-50/50 rounded-xl border border-brand-100 space-y-3">
                <span className="text-xs font-semibold text-brand-900 block">Add Another Skill</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-charcoal-muted mb-1">Skill Name</label>
                    <input
                      type="text"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="e.g. TypeScript, Docker"
                      className="w-full text-xs px-2.5 py-2 bg-white border border-surface-border rounded-lg text-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-charcoal-muted mb-1">Category</label>
                    <select
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value as SkillCategory)}
                      className="w-full text-xs px-2.5 py-2 bg-white border border-surface-border rounded-lg text-charcoal"
                    >
                      <option value="languages">Languages</option>
                      <option value="frameworks">Frameworks</option>
                      <option value="databases">Databases</option>
                      <option value="cloud">Cloud / DevOps</option>
                      <option value="analytics">Analytics / AI</option>
                      <option value="soft_skills">Soft Skills</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-charcoal-muted mb-1">Proficiency Level (1-5)</label>
                    <select
                      value={newSkillLevel}
                      onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                      className="w-full text-xs px-2.5 py-2 bg-white border border-surface-border rounded-lg text-charcoal"
                    >
                      <option value={1}>1 - Beginner</option>
                      <option value={2}>2 - Elementary</option>
                      <option value={3}>3 - Intermediate</option>
                      <option value={4}>4 - Advanced</option>
                      <option value={5}>5 - Expert</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-charcoal-muted mb-1">Evidence / Projects (Optional)</label>
                  <input
                    type="text"
                    value={newSkillEvidence}
                    onChange={(e) => setNewSkillEvidence(e.target.value)}
                    placeholder="e.g. Implemented REST microservices and unit tests"
                    className="w-full text-xs px-2.5 py-2 bg-white border border-surface-border rounded-lg text-charcoal"
                  />
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddSkill}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Skill to Inventory
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Target Career Role */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-surface-border pb-3">
                <Compass className="w-5 h-5 text-brand-600" />
                <div>
                  <h3 className="font-semibold text-charcoal text-sm">Select Your Target Career Role</h3>
                  <p className="text-xs text-charcoal-muted">Choose the primary role you are targeting. You can change this anytime.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {careerRoles.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => setTargetRoleId(role.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      targetRoleId === role.id
                        ? 'border-brand-600 bg-brand-50/50 shadow-xs'
                        : 'border-surface-border bg-surface hover:bg-surface-subtle'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-charcoal">{role.title}</span>
                      {targetRoleId === role.id && (
                        <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-charcoal-subtle block mt-1">{role.category}</span>
                    <span className="text-[10px] text-status-success font-semibold block mt-1">
                      {role.salaryRange}
                    </span>
                  </div>
                ))}
              </div>

              {selectedRole && (
                <div className="p-4 bg-surface-subtle rounded-xl border border-surface-border text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-charcoal">Benchmark Overview: {selectedRole.title}</span>
                    <Badge variant="brand" size="sm">Demand: {selectedRole.marketDemand}</Badge>
                  </div>
                  <p className="text-charcoal-muted text-[11px] leading-relaxed">{selectedRole.description}</p>
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-charcoal block mb-1">Critical Benchmark Skills:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRole.requiredSkills.map((req, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-white border border-surface-border rounded-md text-charcoal-muted font-medium">
                          {req.skillName} (Lvl {req.benchmarkLevel})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Learning Preferences & Synthesis */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-surface-border pb-3">
                <Clock className="w-5 h-5 text-brand-600" />
                <div>
                  <h3 className="font-semibold text-charcoal text-sm">Learning Preferences & Pace</h3>
                  <p className="text-xs text-charcoal-muted">Tell our Progress Optimization Agent how you prefer to learn.</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-charcoal">Weekly Time Commitment</label>
                  <span className="text-xs font-bold text-brand-600">{hoursPerWeek} hours / week</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="35"
                  step="1"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
                <div className="flex justify-between text-[10px] text-charcoal-subtle mt-1">
                  <span>Part-time (4h)</span>
                  <span>Steady (15h)</span>
                  <span>Intensive (35h)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1">Preferred Learning Style</label>
                  <select
                    value={learningStyle}
                    onChange={(e) => setLearningStyle(e.target.value as any)}
                    className="w-full text-xs px-3 py-2.5 bg-surface-subtle border border-surface-border rounded-lg text-charcoal"
                  >
                    <option value="practical">Practical / Project-Driven (Hands-on)</option>
                    <option value="visual">Visual / Architectural (Diagrams & Videos)</option>
                    <option value="interactive">Interactive / Quiz & Coding Challenges</option>
                    <option value="reading">Reading / Official Documentation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1">Learning Velocity Pace</label>
                  <select
                    value={pace}
                    onChange={(e) => setPace(e.target.value as any)}
                    className="w-full text-xs px-3 py-2.5 bg-surface-subtle border border-surface-border rounded-lg text-charcoal"
                  >
                    <option value="relaxed">Relaxed (Thorough mastery, flexible dates)</option>
                    <option value="moderate">Moderate (Standard milestone pacing)</option>
                    <option value="accelerated">Accelerated (Fast-track to job readiness)</option>
                  </select>
                </div>
              </div>

              {isSubmitting && (
                <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-brand-800 text-xs font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                    <span>Multi-Agent Orchestration Pipeline Running...</span>
                  </div>
                  <p className="text-xs text-brand-700 font-mono">{synthesisProgress}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-surface-border mt-6">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(prev => prev - 1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                disabled={isSubmitting}
              >
                Previous Step
              </Button>
            ) : <div />}

            {currentStep < 4 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentStep(prev => prev + 1)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleCompleteOnboarding}
                isLoading={isSubmitting}
                rightIcon={<Sparkles className="w-4 h-4" />}
              >
                Synthesize My Path with Multi-Agent AI
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
