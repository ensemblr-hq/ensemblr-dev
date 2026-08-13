import { cacheLife } from 'next/cache';

import {
	FALLBACK_RELEASE,
	type Release,
	releasesSchema,
	toRelease,
} from './release';
import { REPO } from './site';

/**
 * `/releases/latest` deliberately skips prereleases, and every Ensemblr build
 * so far is one — so it would report "no release found" while betas are live.
 * The list endpoint is the only one that sees them.
 */
const RELEASES_ENDPOINT = `https://api.github.com/repos/${REPO.owner}/${REPO.name}/releases?per_page=10`;

/**
 * Newest published release, prereleases included. Never throws: any failure —
 * network, rate limit, schema drift — falls back to the pinned release in
 * `./release` so the download button is always live.
 *
 * One caveat worth knowing before you tune `cacheLife`: the fallback is cached
 * exactly as durably as a success, so a single rate-limited lookup pins the
 * site to the stale copy for the whole window. GitHub allows 60 unauthenticated
 * requests an hour *per IP*, and serverless hosts share egress addresses — which
 * is why `GITHUB_TOKEN` is expected in deployment rather than merely offered.
 * Shortening only the failure path would mean two functions, an uncached fetch
 * and a cached wrapper, since `cacheLife` applies to the whole body.
 */
export async function getLatestRelease(): Promise<Release> {
	'use cache';
	cacheLife('hours');

	const token = process.env.GITHUB_TOKEN;

	try {
		const response = await fetch(RELEASES_ENDPOINT, {
			headers: {
				Accept: 'application/vnd.github+json',
				'User-Agent': 'ensemblr-dev-site',
				'X-GitHub-Api-Version': '2022-11-28',
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
		});

		if (!response.ok) {
			return FALLBACK_RELEASE;
		}

		const parsed = releasesSchema.safeParse(await response.json());
		if (!parsed.success) {
			return FALLBACK_RELEASE;
		}

		const published = parsed.data.find((release) => !release.draft);
		if (!published) {
			return FALLBACK_RELEASE;
		}

		const release = toRelease(published);
		// A release with no macOS artifact is worse than a stale one that has both.
		return release.dmg ? release : FALLBACK_RELEASE;
	} catch {
		return FALLBACK_RELEASE;
	}
}
