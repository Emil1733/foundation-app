import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Apply content negotiation to both service and learn pages.
    if (pathname.startsWith('/services/foundation-repair/') || pathname.startsWith('/learn/')) {
        const slug = pathname.split('/').pop();
        const acceptHeader = request.headers.get('accept') || '';

        // Return structured data when a client explicitly requests JSON or Markdown.
        if (acceptHeader.includes('application/json') || acceptHeader.includes('text/markdown')) {
            const agentUrl = new URL('/api/agent/soil-data', request.url);
            const response = NextResponse.rewrite(agentUrl);

            response.headers.set('Vary', 'Accept');
            response.headers.set('x-agent-slug', slug || '');
            return response;
        }

        const response = NextResponse.next();
        response.headers.set('Vary', 'Accept');
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/services/foundation-repair/:path*',
        '/learn/:path*'
    ],
};
