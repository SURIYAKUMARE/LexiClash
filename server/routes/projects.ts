import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { ProjectItem } from '../types.js';

export const projectsRouter = Router();

// GET /api/projects
projectsRouter.get('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const userProjects = db.projects.filter(p => p.userId === userId);
  return res.json({ projects: userProjects });
});

// POST /api/projects
projectsRouter.post('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { title, description, skills, githubUrl, liveUrl, status } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Project title is required.' });
  }

  const now = new Date().toISOString();
  const newProject: ProjectItem = {
    id: `proj-${uuidv4().slice(0, 8)}`,
    userId,
    title: title.trim(),
    description: description?.trim() || '',
    skills: Array.isArray(skills) ? skills : [],
    githubUrl: githubUrl?.trim() || undefined,
    liveUrl: liveUrl?.trim() || undefined,
    status: status || 'in_progress',
    createdAt: now,
    completedAt: status === 'completed' ? now : undefined
  };

  db.projects.push(newProject);
  db.save();

  return res.status(201).json({ project: newProject });
});

// PUT /api/projects/:id
projectsRouter.put('/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const project = db.projects.find(p => p.id === req.params.id && p.userId === userId);

  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const { title, description, skills, githubUrl, liveUrl, status } = req.body;
  if (title !== undefined) project.title = title.trim();
  if (description !== undefined) project.description = description.trim();
  if (skills !== undefined && Array.isArray(skills)) project.skills = skills;
  if (githubUrl !== undefined) project.githubUrl = githubUrl.trim() || undefined;
  if (liveUrl !== undefined) project.liveUrl = liveUrl.trim() || undefined;
  if (status !== undefined) {
    project.status = status;
    if (status === 'completed' && !project.completedAt) {
      project.completedAt = new Date().toISOString();
    }
  }

  db.save();
  return res.json({ project });
});

// DELETE /api/projects/:id
projectsRouter.delete('/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const index = db.projects.findIndex(p => p.id === req.params.id && p.userId === userId);

  if (index === -1) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const [deleted] = db.projects.splice(index, 1);
  db.save();
  return res.json({ message: 'Project removed.', project: deleted });
});
