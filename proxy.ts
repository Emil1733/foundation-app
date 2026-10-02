import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const VALID_PAGE = /^[1-9]\d*$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const page = request.nextUrl.searchParams.get('page');
  const isLegacyDirectoryUrl =
    pathname === '/learn' || /^\/locations\/[^/]+$/.test(pathname);

  if (page && isLegacyDirectoryUrl) {
    const destination = request.nextUrl.clone();
    destination.searchParams.delete('page');

    if (!VALID_PAGE.test(page) || !Number.isSafeInteger(Number(page))) {
      destination.pathname = `${pathname}/page/__invalid__`;
      return NextResponse.rewrite(destination);
    }

    destination.pathname = page === '1'
      ? pathname
      : `${pathname}/page/${page}`;

    return NextResponse.redirect(destination, 308);
  }

  const isContentPage =
    /^\/services\/foundation-repair\/[^/]+$/.test(pathname) ||
    (/^\/learn\/[^/]+$/.test(pathname) && !pathname.startsWith('/learn/page/'));

  if (isContentPage) {
    const slug = pathname.split('/').pop();
    const acceptHeader = request.headers.get('accept') || '';

    if (acceptHeader.includes('application/json') || acceptHeader.includes('text/markdown')) {
      const agentUrl = new URL('/api/agent/soil-data', request.url);
      agentUrl.searchParams.set('slug', slug || '');
      return NextResponse.rewrite(agentUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/services/foundation-repair/:path*',
    '/learn/:path*',
    {
      source: '/locations/:state',
      has: [{ type: 'query', key: 'page' }],
    },
  ],
};
