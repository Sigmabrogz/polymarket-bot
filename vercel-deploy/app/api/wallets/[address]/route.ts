import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address.toLowerCase();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '100');
  
  try {
    // Fetch wallet trades from Polymarket Data API
    const tradesUrl = `https://data-api.polymarket.com/trades?user=${address}&limit=${Math.min(limit, 500)}`;
    
    const response = await fetch(tradesUrl, {
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
    
    // Calculate basic stats
    const totalTrades = trades.length;
    const totalVolume = trades.reduce((sum: number, trade: any) => 
      sum + (parseFloat(trade.size) || 0), 0
    );
    
    // Group trades by market for positions
    const positions = trades.reduce((acc: any, trade: any) => {
      const marketId = trade.market;
      if (!acc[marketId]) {
        acc[marketId] = {
          market: marketId,
          outcome: trade.outcome,
          totalSize: 0,
          avgPrice: 0,
          trades: []
        };
      }
      acc[marketId].totalSize += parseFloat(trade.size) || 0;
      acc[marketId].trades.push(trade);
      return acc;
    }, {});
    
    return NextResponse.json({
      wallet: address,
      stats: {
        totalTrades,
        totalVolume,
        avgTradeSize: totalTrades > 0 ? totalVolume / totalTrades : 0
      },
      positions: Object.values(positions),
      trades: trades.slice(0, limit),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Wallet API error:', error);
    
    return NextResponse.json({
      wallet: address,
      stats: undefined,
      positions: [],
      trades: [],
      error: 'Failed to fetch wallet data',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
