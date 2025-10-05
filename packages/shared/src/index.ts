export type OutcomeToken = {
  tokenId: string;
  marketId: string;
  outcome: string;
  price: number;
  liquidity: number;
};

export type Market = {
  marketId: string;
  eventId: string;
  title: string;
  slug: string;
  category: string;
  endDate: string;
  status: 'open' | 'closed' | 'resolved';
  volume24h: number;
  liquidity: number;
  outcomeTokens: OutcomeToken[];
};

export type Trade = {
  id: string;
  timestamp: string;
  wallet: string;
  marketId: string;
  tokenId: string;
  outcome: string;
  side: 'buy' | 'sell';
  price: number;
  size: number;
  fee: number;
  transactionHash?: string;
};

export type Position = {
  wallet: string;
  tokenId: string;
  marketId: string;
  outcome: string;
  size: number;
  averagePrice: number;
  markPrice: number;
  unrealizedPnl: number;
  lastUpdated: string;
};

export type WalletStats = {
  wallet: string;
  trades: number;
  winRate: number;
  realizedPnl: number;
  unrealizedPnl: number;
  turnover30d: number;
  alphaScore: number;
  lastActive: string;
};

export type LeaderboardEntry = {
  rank: number;
  wallet: string;
  alias?: string;
  pnl24h: number;
  pnl7d: number;
  winRate: number;
  score: number;
  activityScore: number;
  marketsTraded: number;
};

export type ActivityFeedItem = {
  trade: Trade;
  market: Market;
};

export type Paginated<T> = {
  items: T[];
  nextCursor?: string | null;
  lastUpdated: string;
};

export type IngestConfig = {
  gammaBaseUrl: string;
  dataApiBaseUrl: string;
  clobRestBaseUrl: string;
  clobWsBaseUrl: string;
  pollIntervalMs: number;
  leaderboardWindowHours: number[];
};

export type LeaderboardWindow = '24h' | '7d' | '30d';

export const DEFAULT_CONFIG: IngestConfig = {
  gammaBaseUrl: 'https://gamma-api.polymarket.com',
  dataApiBaseUrl: 'https://data-api.polymarket.com',
  clobRestBaseUrl: 'https://clob.polymarket.com',
  clobWsBaseUrl: 'wss://clob.polymarket.com/ws',
  pollIntervalMs: 5_000,
  leaderboardWindowHours: [24, 168, 720]
};
