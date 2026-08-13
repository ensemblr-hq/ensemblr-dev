/**
 * Fails CI when the release pinned in `src/lib/release.ts` has gone stale.
 *
 * That pin is not a developer convenience — it is what real visitors download
 * whenever the GitHub API is unreachable or rate-limited at build time. Left to
 * drift it becomes a dead link printed next to a SHA-256 that matches nothing,
 * on the page whose entire argument is that its claims are checkable. The
 * README asks you to bump it when a release ships; this is what makes that
 * more than a request.
 *
 * Two checks, and the difference in severity is deliberate:
 *
 *   - the newest published release still matches the pin  → hard failure
 *   - the pinned .dmg still resolves                      → hard failure
 *   - GitHub could not be reached at all                  → warn and pass
 *
 * "Cannot verify" is not "is stale". A rate-limited check that failed the build
 * would be a flake, and a flaky guard gets disabled, which is worse than not
 * having one.
 */

import { FALLBACK_RELEASE } from '../src/lib/release';
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

async function main() {
	let releases: Array<{ draft: boolean; tag_name: string }>;

	try {
		const response = await fetch(ENDPOINT, { headers });
		if (!response.ok) {
			skip(`GitHub returned ${response.status} for the releases list.`);
		}
		releases = (await response.json()) as typeof releases;
	} catch (error) {
		skip(`Could not reach the GitHub API: ${(error as Error).message}`);
	}

	const newest = releases.find((release) => !release.draft);
	if (!newest) {
		skip('The releases list came back with nothing published.');
	}

	if (newest.tag_name !== FALLBACK_RELEASE.tag) {
		fail(
			`The pinned fallback release is stale.\n` +
				`  pinned: ${FALLBACK_RELEASE.tag}\n` +
				`  newest: ${newest.tag_name}\n` +
				`  Update FALLBACK_RELEASE in src/lib/release.ts — tag, version,\n` +
				`  publishedAt, notesUrl, and both assets' url, sizeBytes and sha256.\n` +
				`  The digests come from the release assets' \`digest\` field.`,
		);
	}

	const dmg = FALLBACK_RELEASE.dmg;
	if (!dmg) {
		fail(
			'FALLBACK_RELEASE has no .dmg — the download button has nothing real to point at.',
		);
	}

	try {
		const asset = await fetch(dmg.url, { method: 'HEAD', redirect: 'follow' });
		if (!asset.ok) {
			fail(`The pinned .dmg returned ${asset.status}: ${dmg.url}`);
		}
	} catch (error) {
		skip(`Could not reach the pinned asset: ${(error as Error).message}`);
	}

	console.log(
		`✓ Pinned release ${FALLBACK_RELEASE.tag} is current and resolves.`,
	);
}

await main();
