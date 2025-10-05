'use client';

import { useFeed } from '@/hooks/useFeed';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTimestamp, formatUsd } from '@/lib/format';

export const ActivityFeed = () => {
  const { data, isLoading, error } = useFeed(120);

  if (isLoading) {
    return (
      <Card title="Live Tape" description="Latest venue-wide fills." className="md:col-span-2">
        <Skeleton rows={8} />
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card title="Live Tape" className="md:col-span-2">
        <p className="text-sm text-rose-300">Unable to load recent trades right now.</p>
      </Card>
    );
  }

  return (
    <Card title="Live Tape" description="Auto-refreshing every ~5s." className="md:col-span-2">
      <div className="grid gap-2">
        {data.items.map(({ trade, market }) => (
          <div
            key={trade.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-slate-900 bg-slate-950/40 px-3 py-2 text-xs"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-white">
                {market.title || `Market ${trade.marketId}`}
              </p>
              <p className="text-[11px] text-slate-500">
                {trade.wallet.slice(0, 6)}…{trade.wallet.slice(-4)} · {formatTimestamp(trade.timestamp)}
              </p>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span className={trade.side === 'buy' ? 'text-emerald-300' : 'text-rose-300'}>
                {trade.side.toUpperCase()}
              </span>
              <span className="text-slate-200">{trade.size.toFixed(2)} @ {trade.price.toFixed(3)}</span>
              <span className="rounded bg-slate-900 px-2 py-1 text-slate-300">
                {formatUsd(trade.price * trade.size)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
