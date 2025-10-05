import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address.toLowerCase();
  
  // Return empty wallet data for now
  return NextResponse.json({
    wallet: address,
    stats: undefined,
    positions: [],
    trades: []
  });
}
