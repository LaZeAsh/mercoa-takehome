import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '../../../lib/helper';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = body.email;
  const password = body.password;
  
  const response = await createUser(email, password);

  if(response === "incorrect") {
    return NextResponse.json({ email: "incorrect" }); // Incorrect password
  } else {
    return NextResponse.json({ email: email }); // Correct password
  }
} 