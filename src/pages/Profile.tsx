import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  User,
  GraduationCap,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    college: profile?.college || user?.college || '',
    degree: profile?.degree || '',
    graduationYear: profile?.graduationYear || '',
    bio: profile?.bio || '',
    hoursPerWeek: profile?.learningPreferences?.hoursPerWeek || 10,
    style: profile?.learningPreferences?.style || 'practical',
    pace: profile?.learningPreferences?.pace || 'moderate',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await api.updateProfile({
        college: formData.college,
        degree: formData.degree,
        graduationYear: formData.graduationYear,
        bio: formData.bio,
        learningPreferences: {
          hoursPerWeek: Number(formData.hoursPerWeek),
          style: formData.style as any,
          pace: formData.pace as any,
        }
      });
      await refreshProfile();
      setSuccessMsg('Profile updated successfully.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Profile Card */}
      <Card className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-card">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
          alt={user?.name || 'User'}
          className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-200 shadow-md shrink-0"
        />
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl font-bold text-charcoal">{user?.name}</h1>
            <Badge variant="brand" size="sm">
              {user?.role === 'student' ? 'College Student' : 'Engineer'}
            </Badge>
            <Badge variant="success" size="sm">
              Profile: {profile?.profileCompletionPercentage || 85}% Complete
            </Badge>
          </div>
          <p className="text-xs text-charcoal-muted">{user?.email}</p>
          <p className="text-xs text-charcoal leading-relaxed max-w-2xl pt-1">
            {profile?.bio || 'No bio added yet.'}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-charcoal-subtle pt-2">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {profile?.college || 'University'}
            </span>
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              {profile?.degree || 'Computer Science'}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Class of {profile?.graduationYear || '2025'}
            </span>
          </div>
        </div>
      </Card>

      {/* Edit Profile Form */}
      <Card className="p-6 sm:p-8">
        <h3 className="text-base font-bold text-charcoal mb-4 pb-3 border-b border-surface-border">
          Edit Profile & Learning Preferences
        </h3>

        {successMsg && (
          <div className="mb-4 p-3 bg-status-success-bg border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-status-success">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-3 bg-status-danger-bg border border-red-200 rounded-lg flex items-center gap-2 text-xs text-status-danger">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">
                College / University
              </label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full text-xs px-3 py-2.5 bg-surface-subtle border border-surface-border rounded-lg text-charcoal focus:bg-white focus:ring-2 focus:ring-brand-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">
                Degree / Major
              </label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full text-xs px-3 py-2.5 bg-surface-subtle border border-surface-border rounded-lg text-charcoal focus:bg-white focus:ring-2 focus:ring-brand-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">
                Graduation Year
              </label>
              <input
                type="text"
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                className="w-full text-xs px-3 py-2.5 bg-surface-subtle border border-surface-border rounded-lg text-charcoal focus:bg-white focus:ring-2 focus:ring-brand-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">
                Weekly Study Commitment (Hours)
              </label>
              <input
                type="number"
                min="2"
                max="40"
                value={formData.hoursPerWeek}
                onChange={(e) => setFormData({ ...formData, hoursPerWeek: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2.5 bg-surface-subtle border border-surface-border rounded-lg text-charcoal focus:bg-white focus:ring-2 focus:ring-brand-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">
                Learning Style
              </label>
              <select
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                className="w-full text-xs px-3 py-2.5 bg-surface-subtle border border-surface-border rounded-lg text-charcoal focus:bg-white focus:ring-2 focus:ring-brand-500 transition-all"
              >
                <option value="practical">Practical / Hands-on Projects</option>
                <option value="visual">Visual / Architectural Diagrams</option>
                <option value="interactive">Interactive / Challenges & Quizzes</option>
                <option value="reading">Reading / Documentation & Specs</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">
                Pacing Velocity
              </label>
              <select
                value={formData.pace}
                onChange={(e) => setFormData({ ...formData, pace: e.target.value })}
                className="w-full text-xs px-3 py-2.5 bg-surface-subtle border border-surface-border rounded-lg text-charcoal focus:bg-white focus:ring-2 focus:ring-brand-500 transition-all"
              >
                <option value="relaxed">Relaxed (Self-paced, deep exploration)</option>
                <option value="moderate">Moderate (Standard milestone cadence)</option>
                <option value="accelerated">Accelerated (Fast-track to job market)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">
              Personal Bio & Professional Aspirations
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full text-xs p-3 bg-surface-subtle border border-surface-border rounded-lg text-charcoal focus:bg-white focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
