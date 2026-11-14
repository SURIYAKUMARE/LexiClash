import { Router } from 'express';
import { db } from '../db/database.js';

export const resourcesRouter = Router();

// GET /api/resources
resourcesRouter.get('/', (req, res) => {
  const { query, skill, difficulty, type, category } = req.query;

  let results = [...db.resources];

  if (query && typeof query === 'string') {
    const q = query.toLowerCase().trim();
    results = results.filter(
      r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.provider.toLowerCase().includes(q) ||
        r.skill.toLowerCase().includes(q)
    );
  }

  if (skill && typeof skill === 'string') {
    results = results.filter(r => r.skill.toLowerCase() === skill.toLowerCase().trim());
  }

  if (difficulty && typeof difficulty === 'string' && difficulty !== 'All') {
    results = results.filter(r => r.difficulty.toLowerCase() === difficulty.toLowerCase().trim());
  }

  if (type && typeof type === 'string' && type !== 'All') {
    results = results.filter(r => r.type.toLowerCase() === type.toLowerCase().trim());
  }

  if (category && typeof category === 'string' && category !== 'All') {
    results = results.filter(r => r.category === category);
  }

  return res.json({
    resources: results,
    total: results.length
  });
});
