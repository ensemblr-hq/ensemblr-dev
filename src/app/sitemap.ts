import type { MetadataRoute } from 'next';

import { getSiteReleases } from '@/lib/github-release';
import { SCHEMAS_PAGE } from '@/lib/schemas';
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
 * `getSiteReleases` carries its own `'use cache'`, so awaiting it here keeps
 * the sitemap cacheable and never throws — a failed lookup falls back to the
 * pinned release.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const { stable: release } = await getSiteReleases();

	return [
		{
			changeFrequency: 'weekly',
			lastModified: release.publishedAt ?? undefined,
			priority: 1,
			url: SITE.url,
		},
		/*
		 * The schema page, not the schema files. `/schemas/*.schema.json` are
		 * documents for a resolver following a `$id`, and a crawler that indexed
		 * 24 KB of JSON Schema would be indexing something no reader searches for.
		 *
		 * No `lastModified`: this page changes when the app repo changes its
		 * schemas, and nothing here knows when that was. The release date would be
		 * a guess dressed as a fact, and an absent field is the honest answer.
		 */
		{
			changeFrequency: 'monthly',
			priority: 0.5,
			url: SCHEMAS_PAGE.url,
		},
	];
}
