import { cacheLife } from 'next/cache';

import {
	FALLBACK_NIGHTLY,
	FALLBACK_RELEASE,
	type Nightly,
	type Release,
	releasesSchema,
	selectNightly,
	selectStableRelease,
} from './release';
import { REPO } from './site';

/**
 * `/releases/latest` deliberately skips prereleases, and every Ensemblr build
 * so far is one — so it would report "no release found" while betas are live.
 * The list endpoint is the only one that sees them, and it is also the only one
 * that sees the nightly at all.
 */
const RELEASES_ENDPOINT = `https://api.github.com/repos/${REPO.owner}/${REPO.name}/releases?per_page=10`;

export interface SiteReleases {
	readonly stable: Release;
	/** Absent when the lookup succeeded and found no `nightly` tag. */
	readonly nightly: Nightly | null;
}

/**
 * Both download links, from one request and one cache entry.
 *
 * Never throws: any failure — network, rate limit, schema drift — falls back to
 * the pinned copies in `./release` so the download button is always live.
 *
 * The two halves fail differently on purpose. A stable release is something the
 * page must always offer, so a lookup that finds none serves the pin. The
 * nightly is something the page offers *if it exists*, so a lookup that
 * succeeds and finds no `nightly` tag drops the row — that is a verified
 * absence, not an unverifiable one, and printing a pinned link to a release
 * GitHub just told us is gone is the failure this whole file is written to
 * avoid. A lookup that fails outright shows the pinned nightly, whose URL is
 * fixed by construction.
 *
 * One caveat worth knowing before you tune `cacheLife`: the fallback is cached
 * exactly as durably as a success, so a single rate-limited lookup pins the
 * site to the stale copy for the whole window. GitHub allows 60 unauthenticated
 * requests an hour *per IP*, and serverless hosts share egress addresses — which
 * is why `GITHUB_TOKEN` is expected in deployment rather than merely offered.
 * Shortening only the failure path would mean two functions, an uncached fetch
 * and a cached wrapper, since `cacheLife` applies to the whole body.
 */
export async function getSiteReleases(): Promise<SiteReleases> {
	'use cache';
	cacheLife('hours');

	const token = process.env.GITHUB_TOKEN;
	const pinned: SiteReleases = {
		nightly: FALLBACK_NIGHTLY,
		stable: FALLBACK_RELEASE,
	};

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
			return pinned;
		}

		const parsed = releasesSchema.safeParse(await response.json());
		if (!parsed.success) {
			return pinned;
		}

		return {
			nightly: selectNightly(parsed.data),
			stable: selectStableRelease(parsed.data) ?? FALLBACK_RELEASE,
		};
	} catch {
		return pinned;
	}
}
