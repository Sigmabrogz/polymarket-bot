import {
  ActivityFeedItem,
  LeaderboardEntry,
  LeaderboardWindow,
  Market,
  Position,
  Trade,
  WalletStats
} from '@polyburg/shared';

type LeaderboardResponse = {
  windowHours: number;
  entries: LeaderboardEntry[];
};

type DefaultLeaderboardResponse = {
  leaderboards: LeaderboardResponse[];
};

type WalletResponse = {
  wallet: string;
  stats?: WalletStats;
  positions: Position[];
  trades: Trade[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

const toUrl = (path: string) => `${API_BASE_URL}${path}`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(toUrl(path), {
    ...(init ?? {}),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API request failed: ${res.status} ${body}`);
  }

  return (await res.json()) as T;
}

export const api = {
  getDefaultLeaderboards: () => request<DefaultLeaderboardResponse>('/leaderboard'),
  getLeaderboard: (window: LeaderboardWindow | number) =>
    request<LeaderboardResponse>(`/leaderboard?window=${window}`),
  getMarkets: () => request<{ count: number; items: Market[] }>('/markets'),
  getFeed: (limit = 100) => request<{ items: ActivityFeedItem[] }>(`/feed?limit=${limit}`),
  getWallet: (address: string) => request<WalletResponse>(`/wallets/${address}`)
};
