import { inMemoryStore } from '../repositories/memoryStore';
import { createPolymarketClient, PolymarketClient } from './polymarketClient';
import { appConfig } from '../config';
import { logger } from '../lib/logger';
import { telegramService } from './telegramService';
import { Trade } from '@polyburg/shared';

type TradesBatch = Trade[];

export class IngestService {
  private client: PolymarketClient;
  private tradeInterval?: NodeJS.Timeout;
  private marketsInterval?: NodeJS.Timeout;
  private lastTradeTimestamp?: string;

  constructor() {
    this.client = createPolymarketClient(appConfig);
  }

  async start() {
    await this.refreshMarkets();
    await this.pullRecentTrades();

    this.tradeInterval = setInterval(() => {
      this.pullRecentTrades().catch((error) => logger.error(error, 'trade poll failed'));
    }, appConfig.pollIntervalMs);

    // Refresh markets every 10 minutes to keep metadata warm without hammering Gamma.
    this.marketsInterval = setInterval(() => {
      this.refreshMarkets().catch((error) => logger.error(error, 'market refresh failed'));
    }, 10 * 60 * 1000);
  }

  stop() {
    if (this.tradeInterval) {
      clearInterval(this.tradeInterval);
    }
    if (this.marketsInterval) {
      clearInterval(this.marketsInterval);
    }
  }

  private async refreshMarkets(cursor?: string) {
    logger.info('Refreshing market metadata');
    const { markets, nextCursor } = await this.client.fetchMarkets(200, cursor);
    inMemoryStore.upsertMarkets(markets);

    if (nextCursor) {
      // Recursive pagination is acceptable here because Gamma pagination depth is shallow.
      await this.refreshMarkets(nextCursor);
    }
  }

  private async pullRecentTrades() {
    const params: { limit: number; from?: string } = { limit: 200 };
    if (this.lastTradeTimestamp) {
      params.from = this.lastTradeTimestamp;
    }

    const { trades } = await this.client.fetchTrades(params);
    if (!trades.length) {
      return;
    }

    inMemoryStore.appendTrades(trades);
    await this.handleAlerts(trades);

    this.lastTradeTimestamp = trades[0]?.timestamp ?? this.lastTradeTimestamp;
    logger.debug({ count: trades.length }, 'Ingested trades batch');
  }

  private async handleAlerts(trades: TradesBatch) {
    const interesting = trades.filter((trade) => trade.price * trade.size >= 5_000);
    if (!interesting.length) {
      return;
    }

    for (const trade of interesting) {
      const direction = trade.side === 'buy' ? 'bought' : 'sold';
      const notional = (trade.price * trade.size).toFixed(2);
      const message = `*${trade.wallet}* ${direction} ${trade.size.toFixed(2)} @ ${trade.price.toFixed(
        3
      )} (\\$${notional})`;
      await telegramService.sendAlert(message);
    }
  }
}

export const ingestService = new IngestService();
