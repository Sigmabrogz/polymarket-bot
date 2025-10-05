import { LeaderboardEntry } from '@polyburg/shared';
import { inMemoryStore } from '../repositories/memoryStore';
import { appConfig } from '../config';

const CACHE_TTL_MS = 60 * 1000;

type WindowCache = {
  cachedAt: number;
  entries: LeaderboardEntry[];
};

class LeaderboardService {
  private cache = new Map<number, WindowCache>();

  getLeaderboard(windowHours: number) {
    const cached = this.cache.get(windowHours);
    const now = Date.now();
    if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
      return cached.entries;
    }

    const entries = inMemoryStore.getLeaderboard(windowHours);
    this.cache.set(windowHours, { cachedAt: now, entries });
    return entries;
  }

  getDefaultLeaderboards() {
    return appConfig.leaderboardWindowHours.map((window) => ({
      windowHours: window,
      entries: this.getLeaderboard(window)
    }));
  }
}

export const leaderboardService = new LeaderboardService();
