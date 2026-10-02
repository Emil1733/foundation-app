const xmlEscape = (value: string) =>
    value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');

export type SitemapEntry = {
    url: string;
    lastModified?: string | Date;
    changeFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    priority?: number;
};

export function renderSitemapIndex(urls: string[]) {
    const entries = urls
        .map((url) => `  <sitemap><loc>${xmlEscape(url)}</loc></sitemap>`)
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>`;
}

export function renderUrlSet(entries: SitemapEntry[]) {
    const urls = entries
        .map((entry) => {
            const fields = [`    <loc>${xmlEscape(entry.url)}</loc>`];
            if (entry.lastModified) {
                const date = entry.lastModified instanceof Date
                    ? entry.lastModified
                    : new Date(entry.lastModified);
                if (!Number.isNaN(date.getTime())) fields.push(`    <lastmod>${date.toISOString()}</lastmod>`);
            }
            if (entry.changeFrequency) fields.push(`    <changefreq>${entry.changeFrequency}</changefreq>`);
            if (entry.priority !== undefined) fields.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
            return `  <url>\n${fields.join('\n')}\n  </url>`;
        })
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export function sitemapResponse(xml: string) {
    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
        },
    });
}
