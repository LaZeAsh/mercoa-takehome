import { NextRequest, NextResponse } from 'next/server';
import { Mercoa, MercoaClient } from '@mercoa/javascript';

// Mock Mercoa client
const client = new MercoaClient({ token: process.env.MERCOA_KEY || 'mock_key' });

export async function POST(request: NextRequest) {
  const body = await request.json();
  const entityId = body.entityId as string;
  
  try {
    console.log(`Creating invoice for entity ${entityId}`);
    
    const invoice = await client.invoice.create({
      creatorEntityId: entityId,
      payerId: entityId,
      amount: body.amount as number,
    });

    return NextResponse.json({ invoiceId: invoice.id });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ invoiceId: null, error: 'Failed to create invoice' });
  }
} 