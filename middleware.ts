import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');

  // If the host starts with www, redirect to non-www
  if (hostname?.startsWith('www.')) {
    const newHostname = hostname.replace('www.', '');
    const url = request.nextUrl.clone();
    
    // Construct the new URL (forcing https as well for security/SEO)
    const newUrl = `https://${newHostname}${url.pathname}${url.search}`;
    
    return NextResponse.redirect(newUrl, 301);
  }

  return NextResponse.next();
}

// Only run on document requests, not assets or APIs
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
