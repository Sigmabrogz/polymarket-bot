import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '50');
  
  try {
    // Fetch markets from Polymarket Gamma API
    const gammaUrl = `https://gamma-api.polymarket.com/markets?active=true&limit=${Math.min(limit, 200)}`;
    
    const response = await fetch(gammaUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Polyburg-Terminal/1.0'
      },
      // Add timeout
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`Gamma API error: ${response.status}`);
    }
    
    const data = await response.json();
    let markets = data.data || data || [];
    
    // Apply filters
    if (category) {
      markets = markets.filter((market: any) => 
        market.category?.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (search) {
      const term = search.toLowerCase();
      markets = markets.filter((market: any) =>
        market.question?.toLowerCase().includes(term) ||
        market.slug?.toLowerCase().includes(term) ||
        market.category?.toLowerCase().includes(term)
      );
    }
    
    return NextResponse.json({
      count: markets.length,
      items: markets.slice(0, limit),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Markets API error:', error);
    
    // Return empty data on error but with proper structure
    return NextResponse.json({
      count: 0,
      items: [],
      error: 'Failed to fetch markets data',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
