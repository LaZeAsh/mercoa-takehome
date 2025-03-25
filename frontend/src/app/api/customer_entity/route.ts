import { NextRequest, NextResponse } from 'next/server';
import { Mercoa, MercoaClient } from '@mercoa/javascript';

// Mock Mercoa client
const client = new MercoaClient({ token: process.env.MERCOA_KEY || 'mock_key' });

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const email: string = body.email as string;
  const fullName: Mercoa.FullName = {
    firstName: body.firstName as string,
    middleName: body.middleName,
    lastName: body.lastName as string,
    suffix: body.suffix
  };

  const existingUser: Mercoa.FindEntityResponse = await client.entity.find({
    isCustomer: true,
    search: email
  });

  if(existingUser.count > 0) {
    return NextResponse.json({ entityId: existingUser.data[0].id });
  } else {
    const user = await client.entity.create({
      isCustomer: true,
      isPayor: true,
      isPayee: false,
      accountType: "individual",
      profile: {
        individual: {
          name: fullName
        }
      }
    });
    return NextResponse.json({ entityId: user.id });
  }
} 