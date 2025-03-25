import { NextRequest, NextResponse } from 'next/server';
import { Mercoa, MercoaClient } from '@mercoa/javascript';

// Mock Mercoa client
const client = new MercoaClient({ token: process.env.MERCOA_KEY || 'mock_key' });

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email: string = body.email as string;

  const existingEntity: Mercoa.FindEntityResponse = await client.entity.find({
    isCustomer: false,
    search: email
  }); 

  if(existingEntity.count > 0) {
    return NextResponse.json({ entityId: existingEntity.data[0].id });
  } else {
    return NextResponse.json({ entityId: "UNDEFINED" });
  }
} 