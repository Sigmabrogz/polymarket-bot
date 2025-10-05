'use client';

import { useMarkets } from '@/hooks/useMarkets';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatPill } from '@/components/ui/stat';
import { formatUsd } from '@/lib/format';

export const MarketOverview = () => {
  const { data, isLoading, error } = useMarkets();

  if (isLoading) {
    return (
      <Card title="Venue Pulse" description="Active markets, liquidity, volume snapshot.">
        <Skeleton rows={4} />
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card title="Venue Pulse">
        <p className="text-sm text-rose-300">Failed to load market metadata.</p>
      </Card>
    );
  }

  const totalLiquidity = data.items.reduce((acc, market) => acc + market.liquidity, 0);
  const totalVolume = data.items.reduce((acc, market) => acc + market.volume24h, 0);

  const categories = Object.entries(
    data.items.reduce<Record<string, number>>((acc, market) => {
      acc[market.category] = (acc[market.category] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <Card title="Venue Pulse" description="Auto-refresh every 2 min.">
      <div className="grid gap-3 md:grid-cols-3">
        <StatPill label="Active markets" value={String(data.count)} accent="neutral" />
        <StatPill label="Total liquidity" value={formatUsd(totalLiquidity)} accent="positive" />
        <StatPill label="24h volume" value={formatUsd(totalVolume)} accent="positive" />
      </div>
      <div>
        <h3 className="mt-4 text-xs uppercase tracking-widest text-slate-500">Top categories</h3>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {categories.map(([category, count]) => (
            <span key={category} className="rounded-full border border-slate-800 px-3 py-1">
              {category} · {count}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
};
