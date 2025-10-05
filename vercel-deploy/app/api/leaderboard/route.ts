import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const window = searchParams.get('window');
  const limit = parseInt(searchParams.get('limit') || '50');
  
  // Default leaderboard windows
  const defaultWindows = [24, 168, 720]; // 24h, 7d, 30d
  
  if (!window) {
    // Return all windows with empty data for now
    const leaderboards = defaultWindows.map(windowHours => ({
      windowHours,
      entries: []
    }));
    
    return NextResponse.json({ leaderboards });
  }
  
  const windowHours = parseInt(window);
  if (isNaN(windowHours)) {
    return NextResponse.json({ error: 'Invalid window parameter' }, { status: 400 });
  }
  
  try {
    // For now, return empty leaderboard since we need to aggregate wallet data
    // In a full implementation, this would:
    // 1. Fetch trades from Data API
    // 2. Aggregate by wallet address
    // 3. Calculate PnL for the time window
    // 4. Sort by performance
    
    return NextResponse.json({
      windowHours,
      entries: [],
      message: 'Leaderboard aggregation not yet implemented',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Leaderboard API error:', error);
    
    return NextResponse.json({
      windowHours,
      entries: [],
      error: 'Failed to fetch leaderboard data',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
