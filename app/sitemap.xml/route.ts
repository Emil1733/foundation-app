import { renderSitemapIndex, sitemapResponse } from '@/lib/sitemapXml';

const BASE_URL = 'https://foundationrisk.org';

export const revalidate = 86400;

export async function GET() {
    return sitemapResponse(renderSitemapIndex([
        `${BASE_URL}/sitemaps/core.xml`,
        `${BASE_URL}/sitemaps/services.xml`,
        `${BASE_URL}/sitemaps/soil-reports.xml`,
    ]));
}
