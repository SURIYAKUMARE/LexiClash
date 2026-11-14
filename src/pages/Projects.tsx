import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ProjectItem } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  FolderGit2,
  Plus,
  Code2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2
} from 'lucide-react';

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProj, setEditingProj] = useState<ProjectItem | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsString, setSkillsString] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [status, setStatus] = useState<'planning' | 'in_progress' | 'completed'>('in_progress');

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openAddModal = () => {
    setEditingProj(null);
    setTitle('');
    setDescription('');
    setSkillsString('React, TypeScript, PostgreSQL');
    setGithubUrl('');
    setLiveUrl('');
    setStatus('in_progress');
    setIsModalOpen(true);
  };

  const openEditModal = (p: ProjectItem) => {
    setEditingProj(p);
    setTitle(p.title);
    setDescription(p.description);
    setSkillsString(p.skills.join(', '));
    setGithubUrl(p.githubUrl || '');
    setLiveUrl(p.liveUrl || '');
    setStatus(p.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const skills = skillsString.split(',').map(s => s.trim()).filter(Boolean);

    try {
      if (editingProj) {
        await api.updateProject(editingProj.id, {
          title,
          description,
          skills,
          githubUrl,
          liveUrl,
          status,
        });
      } else {
        await api.addProject({
          title,
          description,
          skills,
          githubUrl,
          liveUrl,
          status,
        });
      }
      setIsModalOpen(false);
      await loadProjects();
    } catch (err: any) {
      alert(err?.message || 'Failed to save project');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.deleteProject(id);
      await loadProjects();
    } catch (err) {
      console.error(err);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-charcoal">Portfolio Projects Showcase</h1>
          <p className="text-xs text-charcoal-muted">
            Build and showcase industry capstones and open-source repositories to demonstrate production competency.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((proj) => (
          <Card key={proj.id} hoverable className="flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-charcoal text-sm">{proj.title}</h3>
                <Badge
                  variant={proj.status === 'completed' ? 'success' : proj.status === 'in_progress' ? 'brand' : 'neutral'}
                  size="sm"
                >
                  {proj.status.replace('_', ' ')}
                </Badge>
              </div>

              <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-3">
                {proj.description || 'No description provided.'}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {proj.skills.map((s, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 bg-surface-subtle border border-surface-border rounded-md text-charcoal-muted font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                {proj.githubUrl && (
                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-surface-border hover:bg-surface-subtle text-charcoal-muted hover:text-charcoal"
                    title="GitHub Repository"
                  >
                    <Code2 className="w-4 h-4" />
                  </a>
                )}
                {proj.liveUrl && (
                  <a
                    href={proj.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-surface-border hover:bg-surface-subtle text-charcoal-muted hover:text-charcoal"
                    title="Live Demo"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(proj)}
                  className="p-1.5 text-charcoal-subtle hover:text-charcoal rounded hover:bg-surface-muted"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(proj.id)}
                  className="p-1.5 text-charcoal-subtle hover:text-status-danger rounded hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProj ? 'Edit Project' : 'Add New Portfolio Project'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">Project Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Task Queue & Dashboard"
              className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg text-charcoal"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Architectural overview, key trade-offs, and technical features..."
              className="w-full text-xs p-3 bg-surface-subtle border border-surface-border rounded-lg text-charcoal"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">Tech Stack (Comma Separated)</label>
            <input
              type="text"
              value={skillsString}
              onChange={(e) => setSkillsString(e.target.value)}
              placeholder="React, TypeScript, PostgreSQL, Docker"
              className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg text-charcoal"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">GitHub Repo URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg text-charcoal"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">Live Demo URL</label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://..."
                className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg text-charcoal"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg text-charcoal"
            >
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
