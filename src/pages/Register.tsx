import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Mail, Lock, User, GraduationCap, Building2, AlertCircle, Check } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    educationLevel: 'Bachelor\'s Degree',
    termsAccepted: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const educationLevels = [
    'Undergraduate Student',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'Self-Taught / Career Transitioner'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!formData.termsAccepted) {
      setError('You must accept the terms of service.');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-subtle dark:bg-surface-dark-subtle flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-lg shadow-subtle grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
                SP
              </div>
              <span className="font-bold text-base tracking-tight text-charcoal dark:text-white">
                SkillPath
              </span>
            </div>

            <h1 className="text-xl font-bold tracking-tight text-charcoal dark:text-white">
              Create an account
            </h1>
            <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-1">
              Start building your verified engineering skillset.
            </p>

            {error && (
              <div className="mt-4 p-3 bg-status-danger-bg dark:bg-red-950/40 border border-status-danger-border dark:border-red-900 rounded-lg flex items-center gap-2 text-xs text-status-danger dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-charcoal dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Sarah Chen"
                  className="w-full text-xs px-3 py-2 bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-lg text-charcoal dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full text-xs px-3 py-2 bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-lg text-charcoal dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-charcoal dark:text-slate-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full text-xs px-3 py-2 bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-lg text-charcoal dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal dark:text-slate-300 mb-1">
                    Confirm *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full text-xs px-3 py-2 bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-lg text-charcoal dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-charcoal dark:text-slate-300 mb-1">
                    College / Org
                  </label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    placeholder="MIT, Berkeley"
                    className="w-full text-xs px-3 py-2 bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-lg text-charcoal dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal dark:text-slate-300 mb-1">
                    Education Level
                  </label>
                  <select
                    value={formData.educationLevel}
                    onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-lg text-charcoal dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  >
                    {educationLevels.map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                    className="mt-0.5 rounded border-surface-border text-brand-600 focus:ring-brand-600"
                  />
                  <span className="text-[11px] text-charcoal-muted dark:text-slate-400 leading-tight">
                    I accept the terms of service and privacy policy.
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </form>
          </div>

          <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-6 text-center sm:text-left">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        {/* Right Summary */}
        <div className="bg-surface-subtle dark:bg-surface-dark-subtle border-t md:border-t-0 md:border-l border-surface-border dark:border-surface-dark-border p-8 sm:p-12 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-subtle dark:text-slate-400 block mb-2">
              SkillPath Architecture
            </span>
            <h2 className="text-lg font-bold text-charcoal dark:text-white leading-snug">
              Every dashboard element driven by verified user data.
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-2 leading-relaxed">
              Target roles like Full Stack Developer, AI/ML Engineer, and DevOps include granular skill benchmarks. Your assessment attempts feed back into verified proficiency levels.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded border border-surface-border dark:border-surface-dark-border bg-surface dark:bg-surface-dark flex items-center justify-center shrink-0 mt-0.5 text-brand-600 dark:text-brand-400">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-charcoal dark:text-slate-200">
                    Transparent skill gap delta
                  </h3>
                  <p className="text-[11px] text-charcoal-muted dark:text-slate-400 mt-0.5">
                    Clear breakdown between self-reported and assessment-verified competencies.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded border border-surface-border dark:border-surface-dark-border bg-surface dark:bg-surface-dark flex items-center justify-center shrink-0 mt-0.5 text-brand-600 dark:text-brand-400">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-charcoal dark:text-slate-200">
                    Adaptive learning loops
                  </h3>
                  <p className="text-[11px] text-charcoal-muted dark:text-slate-400 mt-0.5">
                    Scores under 70% automatically inject remediation tasks; scores above 85% advance milestones.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-surface-border dark:border-surface-dark-border text-[11px] text-charcoal-subtle dark:text-slate-500">
            Professional SaaS interface • Single primary teal (#0F5C7A) • Clean flat surfaces
          </div>
        </div>
      </div>
    </div>
  );
};
