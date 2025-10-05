import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const targets = [
    'https://gamma-api.polymarket.com/markets?active=true&limit=1',
    'https://data-api.polymarket.com/trades?limit=1'
  ];
  
  try {
    const results = await Promise.all(targets.map(async (url) => {
      const started = Date.now();
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            'user-agent': 'polyburg/1.0',
            'accept': 'application/json'
          }
        });
        
        clearTimeout(timer);
        const ms = Date.now() - started;
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        
        return { 
          url, 
          ok: true, 
          status: res.status, 
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
    
    const env = {
      https_proxy: !!process.env.HTTPS_PROXY,
      http_proxy: !!process.env.HTTP_PROXY,
      node: process.version,
      platform: process.platform
    };
    
    return NextResponse.json({ 
      results, 
      env,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Network test failed', 
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
