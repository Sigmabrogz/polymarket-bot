'use client';

import { FormEvent, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Position, Trade } from '@polyburg/shared';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatPill } from '@/components/ui/stat';
import { formatTimestamp, formatUsd } from '@/lib/format';

const normalize = (value: string) => value.trim().toLowerCase();

export const WalletLookup = () => {
  const [input, setInput] = useState('');
  const [wallet, setWallet] = useState<string | undefined>();
  const { data, isFetching } = useWallet(wallet);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!input) return;
    setWallet(normalize(input));
  };

  return (
    <Card
      title="Wallet Scanner"
      description="Enter an address to review their latest positioning and tape."
      className="md:col-span-2"
    >
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="0x…"
          className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-lg border border-accent px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/10"
        >
          Load
        </button>
      </form>

      {!wallet && <p className="text-xs text-slate-500">Try pasting a known smart wallet to start tracking.</p>}

      {isFetching && <Skeleton rows={5} className="mt-4" />}

      {data && (
        <div className="mt-4 space-y-4 text-xs">
          {data.stats && (
            <div className="grid gap-3 md:grid-cols-4">
              <StatPill label="Trades" value={String(data.stats.trades ?? 0)} />
              <StatPill
                label="Hit rate"
                value={`${Math.round((data.stats.winRate ?? 0) * 100)}%`}
                accent={(data.stats.winRate ?? 0) >= 0.55 ? 'positive' : 'neutral'}
              />
              <StatPill
                label="Realized PnL"
                value={formatUsd(data.stats.realizedPnl ?? 0)}
                accent={
                  (data.stats.realizedPnl ?? 0) > 0
                    ? 'positive'
                    : (data.stats.realizedPnl ?? 0) < 0
                      ? 'negative'
                      : 'neutral'
                }
              />
              <StatPill label="Alpha score" value={(data.stats.alphaScore ?? 0).toFixed(1)} />
            </div>
          )}

          <div>
            <p className="font-semibold text-slate-200">Recent trades</p>
            <div className="mt-2 space-y-2">
              {data.trades.length === 0 && <p className="text-slate-500">No fills yet.</p>}
              {data.trades.slice(0, 5).map((trade: Trade) => (
                <div key={trade.id} className="flex items-center justify-between rounded-lg border border-slate-900 bg-slate-950/40 px-3 py-2">
                  <span>
                    {trade.marketId} · {trade.outcome}
                    <span className="ml-2 text-slate-500">{formatTimestamp(trade.timestamp)}</span>
                  </span>
                  <span className="font-mono">{trade.side.toUpperCase()} {trade.size.toFixed(2)} @ {trade.price.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="font-semibold text-slate-200">Open positions</p>
            <div className="mt-2 space-y-2">
              {data.positions.length === 0 && <p className="text-slate-500">Flat for now.</p>}
              {data.positions.slice(0, 5).map((position: Position) => (
                <div key={position.tokenId} className="flex items-center justify-between rounded-lg border border-slate-900 bg-slate-950/40 px-3 py-2">
                  <span>
                    {position.marketId} · {position.outcome}
                    <span className="ml-2 text-slate-500">Size {position.size.toFixed(2)}</span>
                  </span>
                  <span className="font-mono text-emerald-300">{formatUsd(position.unrealizedPnl)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
