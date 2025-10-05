import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  
  // For now, return empty data since we can't reach Polymarket APIs
  // In production, this would fetch from the actual APIs
  const markets: any[] = [];
  
  let filteredMarkets = markets;
  
  if (category) {
    filteredMarkets = filteredMarkets.filter((market: any) => 
      market.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  if (search) {
    const term = search.toLowerCase();
    filteredMarkets = filteredMarkets.filter((market: any) =>
      market.title.toLowerCase().includes(term) ||
      market.slug.toLowerCase().includes(term) ||
      market.category.toLowerCase().includes(term)
    );
  }
  
  return NextResponse.json({
    count: filteredMarkets.length,
    items: filteredMarkets
  });
}
