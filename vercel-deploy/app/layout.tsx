import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Polyburg Terminal',
  description: 'Realtime wallet intelligence and market radar for Polymarket traders.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-black">
      <body className="min-h-screen bg-black text-slate-100">
        <Providers>
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
            <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">Polyburg Terminal</h1>
                <p className="text-sm text-slate-400">
                  Live Polymarket intelligence – leaderboards, wallet heat, order books, and alerts.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="rounded border border-slate-800 px-2 py-1">v0.1.0</span>
                <span className="rounded border border-slate-800 px-2 py-1">Powered by Polymarket APIs</span>
              </div>
            </header>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
