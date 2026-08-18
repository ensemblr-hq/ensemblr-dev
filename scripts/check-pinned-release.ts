/**
 * Fails CI when the release pinned in `src/lib/release.ts` has gone stale.
 *
 * That pin is not a developer convenience — it is what real visitors download
 * whenever the GitHub API is unreachable or rate-limited at build time. Left to
 * drift it becomes a dead link printed next to a SHA-256 that matches nothing,
 * on the page whose entire argument is that its claims are checkable. Nothing
 * updates it automatically; `docs/re-pinning.md` is the whole procedure, and
 * this is what makes it more than a request.
 *
 * The checks, and the difference in severity is deliberate:
 *
 *   - the newest `v*` release still matches the pinned tag  → hard failure
 *   - every url/size/digest the pin copied still matches     → hard failure
 *   - the pinned .dmg still resolves                         → hard failure
 *   - the pinned nightly .dmg still resolves                 → hard failure
 *   - GitHub could not be reached at all                     → warn and pass
 *
 * "Cannot verify" is not "is stale". A rate-limited check that failed the build
 * would be a flake, and a flaky guard gets disabled, which is worse than not
 * having one.
 *
 * Two things this deliberately does *not* check. It never looks at list
 * position — `selectStableRelease` picks by parsed semver over `v*` tags, the
 * same function the site renders from, so the nightly cannot be mistaken for a
 * release and `v0.1.0-beta.10` cannot be mistaken for older than `beta.9`. And
 * it never compares the nightly's bytes: that tag is force-moved most nights by
 * design, so a size or digest check there would go red on a healthy repo and
 * stay red. Only the nightly's URL is pinned, so only the URL is checked.
 */

import {
	FALLBACK_NIGHTLY,
	FALLBACK_RELEASE,
	type Release,
	releasesSchema,
	selectStableRelease,
} from '../src/lib/release';
import { REPO } from '../src/lib/site';

const ENDPOINT = `https://api.github.com/repos/${REPO.owner}/${REPO.name}/releases?per_page=10`;

const token = process.env.GITHUB_TOKEN;

const headers: Record<string, string> = {
	Accept: 'application/vnd.github+json',
	'User-Agent': 'ensemblr-dev-site-pin-check',
	'X-GitHub-Api-Version': '2022-11-28',
	...(token ? { Authorization: `Bearer ${token}` } : {}),
};

function fail(message: string): never {
	console.error(`✗ ${message}`);
	process.exit(1);
}

function skip(message: string): never {
	console.warn(`⚠ ${message}`);
	console.warn('  Skipping the staleness check — could not verify, not stale.');
	process.exit(0);
}

const REPIN = [
	'  Update FALLBACK_RELEASE in src/lib/release.ts — tag, version,',
	'  publishedAt, notesUrl, and both assets’ url, sizeBytes and sha256.',
	'  Copy them out of `gh release view`; do not retype a digest.',
	'  docs/re-pinning.md is the paste-ready version of this.',
].join('\n');

/**
 * Every value the pin copied from GitHub, compared field by field.
 *
 * Matching tags alone would pass a pin whose digest was mistyped by one
 * character — which is exactly the failure a hand-updated pin invites, and the
 * one a reader running `shasum` would find before we did.
 */
function compareAssets(pinned: Release, live: Release): string[] {
	const drift: string[] = [];

	for (const kind of ['dmg', 'zip'] as const) {
		const ours = pinned[kind];
		const theirs = live[kind];

		if (!ours && !theirs) {
			continue;
		}
		if (!ours || !theirs) {
			drift.push(
				`  ${kind}: ${ours ? 'pinned but absent from the release' : 'published but missing from the pin'}`,
			);
			continue;
		}

		for (const [field, a, b] of [
			['url', ours.url, theirs.url],
			['sizeBytes', ours.sizeBytes, theirs.sizeBytes],
			['sha256', ours.sha256, theirs.sha256],
		] as const) {
			if (a !== b) {
				drift.push(`  ${kind}.${field}:\n    pinned: ${a}\n    live:   ${b}`);
			}
		}
	}

	if (pinned.publishedAt !== live.publishedAt) {
		drift.push(
			`  publishedAt:\n    pinned: ${pinned.publishedAt}\n    live:   ${live.publishedAt}`,
		);
	}

	return drift;
}

async function resolves(url: string, label: string): Promise<void> {
	try {
		const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
		if (!response.ok) {
			fail(`The pinned ${label} returned ${response.status}: ${url}`);
		}
	} catch (error) {
		skip(`Could not reach the pinned ${label}: ${(error as Error).message}`);
	}
}

async function main() {
	let payload: unknown;

	try {
		const response = await fetch(ENDPOINT, { headers });
		if (!response.ok) {
			skip(`GitHub returned ${response.status} for the releases list.`);
		}
		payload = await response.json();
	} catch (error) {
		skip(`Could not reach the GitHub API: ${(error as Error).message}`);
	}

	const parsed = releasesSchema.safeParse(payload);
	if (!parsed.success) {
		skip(`The releases list did not match the expected shape: ${parsed.error}`);
	}

	const newest = selectStableRelease(parsed.data);
	if (!newest) {
		skip('The releases list came back with no published `v*` release.');
	}

	if (newest.tag !== FALLBACK_RELEASE.tag) {
		fail(
			`The pinned fallback release is stale.\n` +
				`  pinned: ${FALLBACK_RELEASE.tag}\n` +
				`  newest: ${newest.tag}\n${REPIN}`,
		);
	}

	const drift = compareAssets(FALLBACK_RELEASE, newest);
	if (drift.length > 0) {
		fail(
			`The pin names ${FALLBACK_RELEASE.tag} but does not match it.\n${drift.join('\n')}\n${REPIN}`,
		);
	}

	const dmg = FALLBACK_RELEASE.dmg;
	if (!dmg) {
		fail(
			'FALLBACK_RELEASE has no .dmg — the download button has nothing real to point at.',
		);
	}

	await resolves(dmg.url, '.dmg');
	await resolves(FALLBACK_NIGHTLY.dmg.url, 'nightly .dmg');

	console.log(
		`✓ Pinned release ${FALLBACK_RELEASE.tag} is current, matches GitHub and resolves.`,
	);
	console.log(`✓ Pinned nightly download resolves.`);
}

await main();
