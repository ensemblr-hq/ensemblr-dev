/**
 * Everything about a release that does not touch the network.
 *
 * Split out of `github-release.ts` so it can be tested. That file carries the
 * `'use cache'` directive and imports `next/cache`, which means importing it
 * outside a Next render drags the framework in — and the logic worth testing is
 * all here: which entry in the releases list each download link points at, what
 * counts as a verifiable digest, which asset answers for a platform, and how
 * the numbers are printed under the button.
 */

import { z } from 'zod';

import { compareSemVer, parseVersionTag } from './semver';
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
}

/**
 * The rolling nightly, which is a different kind of thing from a release and
 * deliberately has a different type.
 *
 * `nightly` is one tag that gets force-moved onto whatever `master` is that
 * morning, with the assets uploaded `--clobber`. So the URL is fixed forever —
 * `Ensemblr-Canary-arm64.dmg` carries no version — while the bytes behind it
 * are replaced most nights. A size and a digest are therefore not facts this
 * page can hold: they would be true when written and wrong by morning.
 *
 * Hence no `sizeBytes` and no `sha256` anywhere in this type, rather than
 * nullable ones. A component cannot print a stale digest for the nightly
 * because there is nowhere for it to read one from.
 */
export interface Nightly {
	/** Always the literal `nightly`; kept so the row can label itself. */
	readonly tag: string;
	readonly notesUrl: string;
	readonly dmg: {
		readonly label: string;
		readonly url: string;
	};
}

/** The rolling tag the app's `nightly.yml` republishes; never a release. */
export const NIGHTLY_TAG = 'nightly';

/**
 * Last release known at build-authoring time. The download CTA is the entire
 * point of the page, so it must render something real even when the GitHub API
 * rate-limits an unauthenticated build.
 *
 * It is rendered exactly as a live lookup would be — the page does not mark a
 * pinned render as second-class, because a pin that is correct is not
 * second-class. What keeps that honest is that it stays correct:
 * `scripts/check-pinned-release.ts` fails CI when this drifts behind the newest
 * published release, when any of the three values it copies stops matching what
 * GitHub returns, or when its asset stops resolving. A stale pin is not a
 * cosmetic problem: it is a dead download link printed next to a SHA-256 that
 * matches nothing, on a page whose whole argument is that its claims are
 * checkable. Nothing updates this automatically — see `docs/re-pinning.md`.
 */
export const FALLBACK_RELEASE: Release = {
	tag: 'v0.1.0-beta.17',
	version: '0.1.0-beta.17',
	isPrerelease: true,
	publishedAt: '2026-08-27T09:16:26Z',
	notesUrl: `${REPO.releasesUrl}/tag/v0.1.0-beta.17`,
	dmg: {
		label: 'Apple silicon .dmg',
		url: `${REPO.releasesUrl}/download/v0.1.0-beta.17/Ensemblr-0.1.0-beta.17-arm64.dmg`,
		sizeBytes: 149_521_183,
		sha256: 'ff50d000a236b54a4439daa1373b7e19a3614d965b5d6f955383c9a038cfdfaf',
	},
	zip: {
		label: 'Apple silicon .zip',
		url: `${REPO.releasesUrl}/download/v0.1.0-beta.17/Ensemblr-darwin-arm64-0.1.0-beta.17.zip`,
		sizeBytes: 150_827_278,
		sha256: '6836b018fc7bf4ec0b4550ac2fd821bcecadaf9735b20b35239c96831059ebd7',
	},
};

/**
 * The nightly's pinned copy, and the one pin here that does not go stale: the
 * tag never moves off `nightly` and the asset name never gains a version, so
 * this URL is the same URL the live lookup returns. It exists so a rate-limited
 * build still renders the row, not because the value is expected to change.
 *
 * `check:pin` still HEADs it, because "cannot change" is an argument and a 404
 * is evidence.
 */
export const FALLBACK_NIGHTLY: Nightly = {
	tag: NIGHTLY_TAG,
	notesUrl: `${REPO.releasesUrl}/tag/${NIGHTLY_TAG}`,
	dmg: {
		label: 'Apple silicon .dmg',
		url: `${REPO.releasesUrl}/download/${NIGHTLY_TAG}/Ensemblr-Canary-arm64.dmg`,
	},
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
		isPrerelease: release.prerelease,
		notesUrl: release.html_url,
		publishedAt: release.published_at,
		tag: release.tag_name,
		version: release.tag_name.replace(/^v/, ''),
		zip: findAsset(release.assets, '.zip', 'Apple silicon .zip'),
	};
}

export function toNightly(
	release: z.infer<typeof releaseSchema>,
): Nightly | null {
	const dmg = findAsset(release.assets, '.dmg', 'Apple silicon .dmg');
	if (!dmg) {
		return null;
	}
	return {
		dmg: { label: dmg.label, url: dmg.url },
		notesUrl: release.html_url,
		tag: release.tag_name,
	};
}

/**
 * The two lookups the page makes, and the only place either rule is written.
 *
 * Both pick by tag. Neither reads position, and that is the whole point: the
 * order the list endpoint returns is not newest-first, by tag or by either
 * timestamp. Read on 2026-08-21 it ran beta.12, beta.11, beta.9, beta.10,
 * `nightly`, beta.8 — the older release ahead of the newer one, and the rolling
 * tag wedged between two releases rather than at either end. Position is right
 * often enough to look load-bearing and wrong without warning: on the evening of
 * 2026-08-20, with that same ordering, index 0 was beta.9 while beta.10 was the
 * release that had just shipped.
 *
 * Nor do the timestamps rescue it. `nightly` is force-moved onto a new commit
 * most mornings and its assets re-uploaded onto the same release, so it is
 * `published_at` that freezes at the first publish while `created_at` tracks
 * whatever commit the tag now points at — on 2026-08-21 it read
 * `created_at` 2026-08-20T19:14:31Z against `published_at` 2026-08-18T13:12:43Z,
 * created two days *after* it was published. Sorting on either field puts the
 * canary somewhere in the stable list.
 *
 * `check-pinned-release.ts` imports these too. One selector, so what the page
 * serves and what CI checks cannot drift into disagreeing.
 */
export function selectStableRelease(
	releases: readonly z.infer<typeof releaseSchema>[],
): Release | null {
	const candidates = releases
		.filter((release) => !release.draft && parseVersionTag(release.tag_name))
		.map(toRelease)
		// A release whose `.dmg` upload failed is skipped rather than fatal: the
		// visitor gets the previous release, which is live and verifiable, instead
		// of the pin, which may be older still.
		.filter((release) => release.dmg !== null);

	return candidates.reduce<Release | null>((newest, candidate) => {
		if (!newest) {
			return candidate;
		}
		const a = parseVersionTag(candidate.tag);
		const b = parseVersionTag(newest.tag);
		// Both parsed once already to get here; the guard is for the type checker.
		if (!a || !b) {
			return newest;
		}
		return compareSemVer(a, b) > 0 ? candidate : newest;
	}, null);
}

export function selectNightly(
	releases: readonly z.infer<typeof releaseSchema>[],
): Nightly | null {
	// Exact match, not a prefix or a case fold. Over-matching here would label
	// some other build "nightly" on the page, which is worse than missing one.
	const nightly = releases.find(
		(release) => !release.draft && release.tag_name === NIGHTLY_TAG,
	);
	return nightly ? toNightly(nightly) : null;
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
