import { NextRequest, NextResponse } from 'next/server';
import { Mercoa, MercoaClient } from '@mercoa/javascript';

// Mock Mercoa client
const client = new MercoaClient({ token: process.env.MERCOA_KEY || 'mock_key' });

export async function POST(request: NextRequest) {
  const body = await request.json();
  const entityId: Mercoa.EntityId = body.entityId;
  
  try {
    const invoices = await client.entity.invoice.find(entityId, {
      limit: 100
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ invoices: { data: [], count: 0 } });
  }
} 