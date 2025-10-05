import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get('limit') ?? 200);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 500) : 200;
  
  // Return empty feed for now
  return NextResponse.json({
    items: [],
    nextCursor: null,
    lastUpdated: new Date().toISOString()
  });
}
