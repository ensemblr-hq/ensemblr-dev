import type { MetadataRoute } from 'next';

import { getLatestRelease } from '@/lib/github-release';
import { SITE } from '@/lib/site';

/**
 * `lastModified` comes from the release, not the clock.
 *
 * `new Date()` here would stamp every crawl with the moment the route was
 * rendered, which tells a crawler the page changed when nothing did — and under
 * Cache Components it would also make the sitemap a request-time route. The
 * release date is the honest answer: the version, the size and the SHA-256 are
 * the only things on this page that move, and they move with it.
 *
 * `getLatestRelease` carries its own `'use cache'`, so awaiting it here keeps
 * the sitemap cacheable and never throws — a failed lookup falls back to the
 * pinned release.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const release = await getLatestRelease();

	return [
		{
			changeFrequency: 'weekly',
			lastModified: release.publishedAt ?? undefined,
			priority: 1,
			url: SITE.url,
		},
	];
}
