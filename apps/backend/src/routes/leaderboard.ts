import { Router } from 'express';
import { leaderboardService } from '../services/leaderboardService';

export const leaderboardRouter: Router = Router();

leaderboardRouter.get('/', (req, res) => {
  const { window } = req.query;

  if (!window) {
    const leaderboards = leaderboardService.getDefaultLeaderboards();
    res.json({ leaderboards });
    return;
  }

  const windowHours = Number(window);
  if (!Number.isFinite(windowHours) || windowHours <= 0) {
    res.status(400).json({ error: 'Invalid `window` query parameter' });
    return;
  }

  const entries = leaderboardService.getLeaderboard(windowHours);
  res.json({ windowHours, entries });
});
