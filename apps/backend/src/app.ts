import express, { Express } from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';
import { marketsRouter } from './routes/markets';
import { leaderboardRouter } from './routes/leaderboard';
import { walletsRouter } from './routes/wallets';
import { feedRouter } from './routes/feed';
import { logger } from './lib/logger';

export const buildApp = (): Express => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/health', healthRouter);
  app.use('/markets', marketsRouter);
  app.use('/leaderboard', leaderboardRouter);
  app.use('/wallets', walletsRouter);
  app.use('/feed', feedRouter);

  app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error(error, 'Unhandled error');
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
};
