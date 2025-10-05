import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const window = searchParams.get('window');
  
  // Default leaderboard windows
  const defaultWindows = [24, 168, 720]; // 24h, 7d, 30d
  
  if (!window) {
    // Return all windows
    const leaderboards = defaultWindows.map(windowHours => ({
      windowHours,
      entries: [] // Empty for now
    }));
    
    return NextResponse.json({ leaderboards });
  }
  
  const windowHours = parseInt(window);
  if (isNaN(windowHours)) {
    return NextResponse.json({ error: 'Invalid window parameter' }, { status: 400 });
  }
  
  // Return empty entries for now
  return NextResponse.json({
    windowHours,
    entries: []
  });
}
