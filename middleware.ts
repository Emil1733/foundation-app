import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Apply Content Negotiation (Agentic Web Trap) to both Service and Learn pages
    if (pathname.startsWith('/services/foundation-repair/') || pathname.startsWith('/learn/')) {
        const slug = pathname.split('/').pop();
        const acceptHeader = request.headers.get('accept') || '';

        // If it's an AI Agent (requesting JSON or Markdown)
        if (acceptHeader.includes('application/json') || acceptHeader.includes('text/markdown')) {
            // Rewrite the request to our hidden API endpoint instead of the React page
            const agentUrl = new URL(`/api/agent/soil-data`, request.url);
            
            // Rewrite internally (the URL doesn't change for the client)
            const response = NextResponse.rewrite(agentUrl);
            
            // CRITICAL: Add the Vary header for SEO compliance
            response.headers.set('Vary', 'Accept');
            response.headers.set('x-agent-slug', slug || '');
            return response;
        }

        // If it's a Human (HTML), just pass it through normally
        const response = NextResponse.next();
        response.headers.set('Vary', 'Accept');
        return response;
    }

    return NextResponse.next();
}

// Ensure the middleware only runs on specific paths to save edge compute
export const config = {
    matcher: [
        '/services/foundation-repair/:path*',
        '/learn/:path*'
    ],
};
