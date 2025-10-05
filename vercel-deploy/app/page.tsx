import { LeaderboardPanel } from '@/components/dashboard/leaderboard-panel';
import { MarketOverview } from '@/components/dashboard/market-overview';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { WalletLookup } from '@/components/dashboard/wallet-lookup';

export default function HomePage() {
  return (
    <main className="grid gap-6">
      <section className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <MarketOverview />
        </div>
        <LeaderboardPanel />
      </section>
      <section className="grid gap-6 md:grid-cols-3">
        <ActivityFeed />
        <WalletLookup />
      </section>
    </main>
  );
}
