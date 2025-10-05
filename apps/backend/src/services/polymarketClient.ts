import { Market, OutcomeToken, Trade } from '@polyburg/shared';
import { AppConfig } from '../config';
import { logger } from '../lib/logger';
import { safeFetch } from '../lib/network';

type GammaMarket = {
  id: string;
  event_id: string;
  question: string;
  slug: string;
  category: string;
  end_date: string;
  status: string;
  liquidity: number;
  volume_24h: number;
  outcomes: Array<{
    token_id: string;
    name: string;
    price: number;
    liquidity: number;
  }>;
};

type GammaMarketResponse = {
  data: GammaMarket[];
  next_cursor?: string | null;
};

type DataApiTrade = {
  id: string;
  created_at: string;
  user: string;
  market_id: string;
  token_id: string;
  outcome: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  fee: number;
  tx_hash?: string;
};

type DataApiResponse<T> = {
  data: T[];
  next_cursor?: string | null;
};

type FetchTradesParams = {
  limit?: number;
  cursor?: string;
  from?: string;
};

export class PolymarketClient {
  constructor(private readonly config: AppConfig) {}

  async fetchMarkets(limit = 200, cursor?: string) {
    const url = new URL('/markets', this.config.gammaBaseUrl);
    url.searchParams.set('active', 'true');
    url.searchParams.set('limit', String(limit));
    if (cursor) {
      url.searchParams.set('cursor', cursor);
    }

    const response = await this.fetchJson<GammaMarketResponse>(url.toString());
    const markets = response.data.map(this.toMarketModel);

    return {
      markets,
      nextCursor: response.next_cursor ?? null
    };
  }

  async fetchTrades(params: FetchTradesParams = {}) {
    const url = new URL('/trades', this.config.dataApiBaseUrl);
    url.searchParams.set('limit', String(params.limit ?? 500));
    if (params.cursor) {
      url.searchParams.set('cursor', params.cursor);
    }
    if (params.from) {
      url.searchParams.set('from', params.from);
    }

    const response = await this.fetchJson<DataApiResponse<DataApiTrade>>(url.toString());

    return {
      trades: response.data.map(this.toTradeModel),
      nextCursor: response.next_cursor ?? null
    };
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const res = await safeFetch(url, {
      headers: {
        Accept: 'application/json'
      }
    }, {
      timeoutMs: 10000,
      retries: 2
    });

    if (!res.ok) {
      const body = await res.text();
      logger.error({ url, status: res.status, body }, 'Polymarket API request failed');
      throw new Error(`Request failed: ${res.status}`);
    }

    return (await res.json()) as T;
  }

  private toMarketModel = (market: GammaMarket): Market => {
    const outcomeTokens: OutcomeToken[] = market.outcomes.map((outcome) => ({
      tokenId: outcome.token_id,
      marketId: market.id,
      outcome: outcome.name,
      price: outcome.price,
      liquidity: outcome.liquidity
    }));

    return {
      marketId: market.id,
      eventId: market.event_id,
      title: market.question,
      slug: market.slug,
      category: market.category,
      endDate: market.end_date,
      status: this.mapStatus(market.status),
      liquidity: market.liquidity,
      volume24h: market.volume_24h,
      outcomeTokens
    };
  };

  private toTradeModel = (trade: DataApiTrade): Trade => ({
    id: trade.id,
    timestamp: trade.created_at,
    wallet: trade.user,
    marketId: trade.market_id,
    tokenId: trade.token_id,
    outcome: trade.outcome,
    side: trade.side,
    price: trade.price,
    size: trade.amount,
    fee: trade.fee,
    transactionHash: trade.tx_hash
  });

  private mapStatus(status: string): Market['status'] {
    switch (status) {
      case 'open':
      case 'closed':
      case 'resolved':
        return status;
      default:
        return 'open';
    }
  }
}

export const createPolymarketClient = (config: AppConfig) => new PolymarketClient(config);
