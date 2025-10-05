import { Router } from 'express';
import { inMemoryStore } from '../repositories/memoryStore';

export const feedRouter: Router = Router();

feedRouter.get('/', (req, res) => {
  const limitParam = Number(req.query.limit ?? 200);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 500) : 200;
  const feed = inMemoryStore.getRecentTrades(limit);
  res.json(feed);
});
