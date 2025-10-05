import {
  ActivityFeedItem,
  LeaderboardEntry,
  Market,
  Paginated,
  Position,
  Trade,
  WalletStats
} from '@polyburg/shared';

const nowIso = () => new Date().toISOString();

export class InMemoryStore {
  private markets = new Map<string, Market>();
  private trades: Trade[] = [];
  private positions = new Map<string, Position>();
  private walletStats = new Map<string, WalletStats>();

  upsertMarkets(markets: Market[]) {
    markets.forEach((market) => {
      this.markets.set(market.marketId, market);
    });
  }

  getMarkets(): Market[] {
    return Array.from(this.markets.values());
  }

  appendTrades(newTrades: Trade[]) {
    if (!newTrades.length) return;
    const marketLookup = this.getMarketLookup();

    newTrades.forEach((trade) => {
      this.trades.unshift(trade);
      this.updatePositionFromTrade(trade);
      this.updateWalletStats(trade);

      const market = marketLookup.get(trade.marketId);
      if (market) {
        market.volume24h += trade.price * trade.size;
        this.markets.set(market.marketId, market);
      }
    });

    // Keep only the latest 10k trades in memory to avoid runaway growth.
    if (this.trades.length > 10_000) {
      this.trades.length = 10_000;
    }
  }

  getRecentTrades(limit = 200): Paginated<ActivityFeedItem> {
    const marketLookup = this.getMarketLookup();
    const items = this.trades.slice(0, limit).map((trade) => ({
      trade,
      market: marketLookup.get(trade.marketId) ?? this.placeholderMarket(trade)
    }));

    return {
      items,
      nextCursor: limit >= this.trades.length ? null : this.trades[limit]?.id,
      lastUpdated: nowIso()
    };
  }

  getWalletPositions(wallet: string): Position[] {
    return Array.from(this.positions.values()).filter((position) => position.wallet === wallet);
  }

  getWalletStats(wallet: string): WalletStats | undefined {
    return this.walletStats.get(wallet);
  }

  getWalletTrades(wallet: string, limit = 100): Trade[] {
    return this.trades.filter((trade) => trade.wallet === wallet).slice(0, limit);
  }

  getLeaderboard(windowHours: number): LeaderboardEntry[] {
    const cutoff = Date.now() - windowHours * 3_600_000;
    const entries = Array.from(this.walletStats.values())
      .filter((stat) => new Date(stat.lastActive).getTime() >= cutoff)
      .map<LeaderboardEntry>((stat, index) => ({
        rank: index + 1,
        wallet: stat.wallet,
        pnl24h: stat.realizedPnl,
        pnl7d: stat.unrealizedPnl,
        winRate: stat.winRate,
        score: stat.alphaScore,
        activityScore: stat.turnover30d,
        marketsTraded: stat.trades,
        alias: undefined
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 100)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

    return entries;
  }

  private getMarketLookup() {
    return new Map(this.getMarkets().map((market) => [market.marketId, market]));
  }

  private updatePositionFromTrade(trade: Trade) {
    const key = `${trade.wallet}:${trade.tokenId}`;
    const existing = this.positions.get(key);

    if (!existing) {
      const position: Position = {
        wallet: trade.wallet,
        tokenId: trade.tokenId,
        marketId: trade.marketId,
        outcome: trade.outcome,
        size: trade.side === 'buy' ? trade.size : -trade.size,
        averagePrice: trade.price,
        markPrice: trade.price,
        unrealizedPnl: 0,
        lastUpdated: trade.timestamp
      };
      this.positions.set(key, position);
      return;
    }

    const signedSize = trade.side === 'buy' ? trade.size : -trade.size;
    const newSize = existing.size + signedSize;

    if (newSize === 0) {
      this.positions.delete(key);
      return;
    }

    // Weighted average price update for remaining exposure.
    const totalCost = existing.averagePrice * existing.size + trade.price * signedSize;
    const avgPrice = totalCost / newSize;

    this.positions.set(key, {
      ...existing,
      size: newSize,
      averagePrice: avgPrice,
      markPrice: trade.price,
      lastUpdated: trade.timestamp
    });
  }

  private updateWalletStats(trade: Trade) {
    const existing = this.walletStats.get(trade.wallet);
    if (!existing) {
      const baseline: WalletStats = {
        wallet: trade.wallet,
        trades: 1,
        winRate: 0.5,
        realizedPnl: 0,
        unrealizedPnl: 0,
        turnover30d: trade.price * trade.size,
        alphaScore: trade.price * trade.size,
        lastActive: trade.timestamp
      };
      this.walletStats.set(trade.wallet, baseline);
      return;
    }

    const turnover = existing.turnover30d + trade.price * trade.size;
    const trades = existing.trades + 1;

    // Lightweight score heuristic until Subgraph backfill is wired in.
    const alphaScore = turnover * 0.1 + existing.realizedPnl * 0.6 + existing.unrealizedPnl * 0.3;

    this.walletStats.set(trade.wallet, {
      ...existing,
      trades,
      turnover30d: turnover,
      alphaScore,
      lastActive: trade.timestamp
    });
  }

  private placeholderMarket(trade: Trade): Market {
    return {
      marketId: trade.marketId,
      eventId: trade.marketId,
      title: `Market ${trade.marketId}`,
      slug: trade.marketId,
      category: 'unknown',
      endDate: trade.timestamp,
      status: 'open',
      volume24h: 0,
      liquidity: 0,
      outcomeTokens: []
    };
  }
}

export const inMemoryStore = new InMemoryStore();
