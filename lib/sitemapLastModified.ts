// Dates of verified material changes to the public page content, not builds or
// sitemap requests. Update the relevant date when a shared template changes.
// 2026-10-02: city/state title correction on services and soil reports; reviewed
// city profiles and descriptions also shipped on this date.
const CONTENT_RELEASES = {
    service: '2026-10-02',
    soilReport: '2026-10-02',
} as const;

export function sitemapLastModified(
    pageType: keyof typeof CONTENT_RELEASES,
    ...recordDates: Array<string | null | undefined>
): string {
    const releaseTime = Date.parse(CONTENT_RELEASES[pageType]);
    const latest = recordDates.reduce<number>((time, value) => {
        const candidate = value ? Date.parse(value) : NaN;
        return Number.isFinite(candidate) ? Math.max(time, candidate) : time;
    }, releaseTime);

    return new Date(latest).toISOString();
}
