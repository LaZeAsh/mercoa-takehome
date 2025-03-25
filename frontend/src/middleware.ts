import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware enables CORS for the API routes
export function middleware(request: NextRequest) {
  // Only apply CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const response = NextResponse.next();
    
    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
  
  return NextResponse.next();
}

// Configure to match specific routes
export const config = {
  matcher: ['/api/:path*'],
}; 