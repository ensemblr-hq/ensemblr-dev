/**
 * Everything about a release that does not touch the network.
 *
 * Split out of `github-release.ts` so it can be tested. That file carries the
 * `'use cache'` directive and imports `next/cache`, which means importing it
 * outside a Next render drags the framework in — and the logic worth testing is
 * all here: what counts as a verifiable digest, which asset answers for a
 * platform, and how the numbers are printed under the button.
 */

import { z } from 'zod';

import { REPO } from './site';

export const assetSchema = z.object({
	name: z.string(),
	browser_download_url: z.string().url(),
	size: z.number().nonnegative(),
	/**
	 * GitHub returns this as `sha256:<hex>`, and only on assets uploaded since
	 * the field shipped — older releases omit it entirely, so it is optional
	 * rather than nullable-with-a-default. Absent means "do not claim a digest",
	 * never "the digest is empty".
	 */
	digest: z.string().nullish(),
});

export const releaseSchema = z.object({
	tag_name: z.string(),
	name: z.string().nullable(),
	draft: z.boolean(),
	prerelease: z.boolean(),
	published_at: z.string().nullable(),
	html_url: z.string().url(),
	assets: z.array(assetSchema),
});

export const releasesSchema = z.array(releaseSchema);

export interface ReleaseDownload {
	readonly label: string;
	readonly url: string;
	readonly sizeBytes: number;
	/** Bare hex SHA-256, or null when GitHub published no digest for the asset. */
	readonly sha256: string | null;
}

export interface Release {
	readonly tag: string;
	readonly version: string;
	readonly isPrerelease: boolean;
	readonly publishedAt: string | null;
	readonly notesUrl: string;
	readonly dmg: ReleaseDownload | null;
	readonly zip: ReleaseDownload | null;
	/** True when GitHub could not be reached and the pinned copy is showing. */
	readonly isFallback: boolean;
}

/**
 * Last release known at build-authoring time. The download CTA is the entire
 * point of the page, so it must render something real even when the GitHub API
 * rate-limits an unauthenticated build.
 *
 * `scripts/check-pinned-release.ts` fails CI when this drifts behind the newest
 * published release or its asset stops resolving. A stale pin is not a cosmetic
 * problem: it is a dead download link printed next to a SHA-256 that matches
 * nothing, on a page whose whole argument is that its claims are checkable.
 */
export const FALLBACK_RELEASE: Release = {
	tag: 'v0.1.0-beta.5',
	version: '0.1.0-beta.5',
	isPrerelease: true,
	publishedAt: '2026-08-16T17:40:54Z',
	notesUrl: `${REPO.releasesUrl}/tag/v0.1.0-beta.5`,
	dmg: {
		label: 'Apple silicon .dmg',
		url: `${REPO.releasesUrl}/download/v0.1.0-beta.5/Ensemblr-0.1.0-beta.5-arm64.dmg`,
		sizeBytes: 148_170_725,
		sha256: '8615968c4db03f1d3dea4bfdb55aba56fcc7c31bcdbc474091843e88e8504802',
	},
	zip: {
		label: 'Apple silicon .zip',
		url: `${REPO.releasesUrl}/download/v0.1.0-beta.5/Ensemblr-darwin-arm64-0.1.0-beta.5.zip`,
		sizeBytes: 149_479_460,
		sha256: '9f700f522fb3f6aacb8e2b25cd6470e2fc47fca92846c0d9717993b9d119dc9c',
	},
	isFallback: true,
};

/**
 * `sha256:<hex>` as GitHub writes it, reduced to the hex a reader can compare
 * against `shasum -a 256`. Anything that is not that shape is dropped rather
 * than rendered: a digest the visitor cannot verify is worse than none, because
 * it invites them to check and then fail.
 */
export function toSha256(digest: string | null | undefined): string | null {
	if (!digest) {
		return null;
	}
	const hex = digest.startsWith('sha256:') ? digest.slice(7) : digest;
	return /^[0-9a-f]{64}$/.test(hex) ? hex : null;
}

export function findAsset(
	assets: readonly z.infer<typeof assetSchema>[],
	extension: string,
	label: string,
): ReleaseDownload | null {
	const asset = assets.find((candidate) =>
		candidate.name.toLowerCase().endsWith(extension),
	);
	if (!asset) {
		return null;
	}
	return {
		label,
		sha256: toSha256(asset.digest),
		sizeBytes: asset.size,
		url: asset.browser_download_url,
	};
}

export function toRelease(release: z.infer<typeof releaseSchema>): Release {
	return {
		dmg: findAsset(release.assets, '.dmg', 'Apple silicon .dmg'),
		isFallback: false,
		isPrerelease: release.prerelease,
		notesUrl: release.html_url,
		publishedAt: release.published_at,
		tag: release.tag_name,
		version: release.tag_name.replace(/^v/, ''),
		zip: findAsset(release.assets, '.zip', 'Apple silicon .zip'),
	};
}

export function formatBytes(bytes: number): string {
	const megabytes = bytes / 1_000_000;
	return `${megabytes.toFixed(0)} MB`;
}

export function formatReleaseDate(iso: string | null): string | null {
	if (!iso) {
		return null;
	}
	const parsed = new Date(iso);
	if (Number.isNaN(parsed.getTime())) {
		return null;
	}
	return new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		month: 'short',
		timeZone: 'UTC',
		year: 'numeric',
	}).format(parsed);
}

/** Copyright year, taken from the release rather than the clock. */
export const FOUNDED_YEAR = 2026;

export function releaseYear(iso: string | null): number {
	const parsed = iso ? new Date(iso) : null;
	return parsed && !Number.isNaN(parsed.getTime())
		? parsed.getUTCFullYear()
		: FOUNDED_YEAR;
}
