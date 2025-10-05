import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get('limit') ?? 200);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 500) : 200;
  const cursor = searchParams.get('cursor');
  
  try {
    // Fetch recent trades from Polymarket Data API
    const dataUrl = `https://data-api.polymarket.com/trades?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`;
    
    const response = await fetch(dataUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Polyburg-Terminal/1.0'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`Data API error: ${response.status}`);
    }
    
    const data = await response.json();
    const trades = data.data || data || [];
    
    return NextResponse.json({
      items: trades,
      nextCursor: data.nextCursor || null,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Feed API error:', error);
    
    return NextResponse.json({
      items: [],
      nextCursor: null,
      error: 'Failed to fetch trade data',
      lastUpdated: new Date().toISOString()
    }, { status: 500 });
  }
}
