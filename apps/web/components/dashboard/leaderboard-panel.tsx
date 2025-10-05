'use client';

import { useLeaderboards } from '@/hooks/useLeaderboards';
import { Card } from '@/components/ui/card';
import { StatPill } from '@/components/ui/stat';
import { Skeleton } from '@/components/ui/skeleton';

const windowLabel = (hours: number) => {
  if (hours === 24) return '24h';
  if (hours === 168) return '7d';
  if (hours === 720) return '30d';
  return `${hours}h`;
};

export const LeaderboardPanel = () => {
  const { data, isLoading, error } = useLeaderboards();

  if (isLoading) {
    return (
      <Card
        title="Smart Wallet Leaderboard"
        description="Rolling alpha scores across key windows."
        className="md:col-span-2"
      >
        <Skeleton rows={6} />
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card title="Smart Wallet Leaderboard" className="md:col-span-2">
        <p className="text-sm text-rose-300">Failed to load leaderboard data.</p>
      </Card>
    );
  }

  return (
    <Card
      title="Smart Wallet Leaderboard"
      description="Composite score = alpha, hit rate, freshness."
      className="overflow-hidden md:col-span-2"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {data.leaderboards.map(({ windowHours, entries }) => (
          <div key={windowHours} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Window · {windowLabel(windowHours)}</h3>
              <span className="text-[10px] uppercase tracking-widest text-slate-500">Top {entries.length}</span>
            </div>
            <div className="space-y-2">
              {entries.slice(0, 5).map((entry) => (
                <div
                  key={`${windowHours}-${entry.wallet}`}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2"
                >
                  <div>
                    <p className="text-xs text-slate-400">#{entry.rank}</p>
                    <p className="font-mono text-sm text-white">{entry.wallet.slice(0, 6)}…{entry.wallet.slice(-4)}</p>
                  </div>
                  <div className="flex gap-2">
                    <StatPill label="Score" value={entry.score.toFixed(1)} accent="positive" />
                    <StatPill label="Win%" value={`${(entry.winRate * 100).toFixed(0)}%`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
