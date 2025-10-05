import dns from 'node:dns';
import { setTimeout as sleep } from 'node:timers/promises';
import { logger } from './logger';

// Force IPv4-first to avoid IPv6 path issues
dns.setDefaultResultOrder?.('ipv4first');

type FetchOpts = {
  timeoutMs?: number; // connect+TLS+TTFB
  retries?: number;
  signal?: AbortSignal;
};

export async function safeFetch(url: string, init: RequestInit = {}, opts: FetchOpts = {}) {
  const { timeoutMs = 8000, retries = 3 } = opts;
  let lastErr: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs).unref();
    const startTime = Date.now();

    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: { 
          'user-agent': 'polyburg/1.0',
          'accept': 'application/json',
          ...(init.headers || {}) 
        }
      });
      
      clearTimeout(timer);
      const duration = Date.now() - startTime;
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      
      logger.debug({ 
        url, 
        status: res.status, 
        duration,
        attempt: attempt + 1 
      }, 'Network request successful');
      
      return res;
    } catch (err: any) {
      clearTimeout(timer);
      const duration = Date.now() - startTime;
      lastErr = err;
      
      logger.warn({ 
        url, 
        error: err?.message || String(err),
        duration,
        attempt: attempt + 1,
        retries: retries - attempt
      }, 'Network request failed');
      
      // Don't retry on abort or final attempt
      if (err.name === 'AbortError' || attempt === retries) {
        break;
      }
      
      // Backoff with jitter
      const backoff = Math.min(1000 * 2 ** attempt, 8000) + Math.random() * 500;
      await sleep(backoff);
    }
  }
  
  throw lastErr;
}

export async function testConnectivity(targets: string[]) {
  const results = await Promise.all(targets.map(async (url) => {
    const started = Date.now();
    try {
      const r = await safeFetch(url, {}, { timeoutMs: 6000, retries: 1 });
      const ms = Date.now() - started;
      return { 
        url, 
        ok: true, 
        status: r.status, 
        ms,
        error: null
      };
    } catch (e: any) {
      const ms = Date.now() - started;
      return { 
        url, 
        ok: false, 
        status: null,
        ms,
        error: e?.message || String(e)
      };
    }
  }));
  
  return results;
}
