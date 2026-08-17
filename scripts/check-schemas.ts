/**
 * Fails CI when a schema copied into `public/schemas` has drifted from the app
 * repo's own.
 *
 * These files are not ours to edit. They are written in
 * `ensemblr-hq/ensemblr@master:schemas/`, and each declares a canonical `$id` on
 * this domain — which is why the site serves them at all. A copy that has fallen
 * behind is a schema that documents a config key the app no longer reads, or
 * rejects one it now requires, published from the URL every editor was told is
 * authoritative. That is worse than the 404 this replaced: the 404 was at least
 * obviously broken.
 *
 * Byte-for-byte, not field-by-field. The copies are excluded from Biome for
 * exactly this reason, so any difference at all — a reordered key, a reflowed
 * description, a new `$defs` entry — is drift, and the fix is always the same:
 * re-copy the file rather than reconcile it by hand.
 *
 * Same severities as `check-pinned-release.ts`:
 *
 *   - a copy differs from the app repo's  → hard failure
 *   - the app repo could not be reached   → warn and pass
 *
 * "Cannot verify" is not "is stale". A rate-limited check that failed the build
 * would be a flake, and a flaky guard gets disabled, which is worse than not
 * having one.
 */

import { join } from 'node:path';

import { SCHEMA_DIR, SCHEMAS } from '../src/lib/schemas';
import { REPO } from '../src/lib/site';

const REPO_ROOT = join(import.meta.dir, '..');

const token = process.env.GITHUB_TOKEN;

const headers: Record<string, string> = {
	Accept: 'application/vnd.github+json',
	'User-Agent': 'ensemblr-dev-site-schema-check',
	'X-GitHub-Api-Version': '2022-11-28',
	...(token ? { Authorization: `Bearer ${token}` } : {}),
};

interface ContentsResponse {
	readonly content?: string;
	readonly encoding?: string;
}

function fail(message: string): never {
	console.error(`✗ ${message}`);
	process.exit(1);
}

function skip(message: string): never {
	console.warn(`⚠ ${message}`);
	console.warn('  Skipping the drift check — could not verify, not stale.');
	process.exit(0);
}

/** The command that re-copies one schema, quoted so a fish shell survives it. */
function recopyCommand(sourcePath: string, file: string): string {
	return (
		`  gh api "repos/${REPO.owner}/${REPO.name}/contents/${sourcePath}?ref=master" \\\n` +
		`    --jq '.content' | base64 -d > ${SCHEMA_DIR}/${file}`
	);
}

async function fetchUpstream(sourcePath: string): Promise<Uint8Array> {
	const endpoint = `https://api.github.com/repos/${REPO.owner}/${REPO.name}/contents/${sourcePath}?ref=master`;

	let payload: ContentsResponse;
	try {
		const response = await fetch(endpoint, { headers });
		/*
		 * A 404 is the one status that is an answer rather than a refusal. Every
		 * other failure here — 403 for a rate limit, 5xx, a timeout — means the
		 * check could not run; this one means the file the manifest points at is
		 * not in the app repo, which is drift of the worst kind: the site is
		 * publishing a schema upstream has retired or renamed.
		 */
		if (response.status === 404) {
			fail(
				`${sourcePath} is not in ${REPO.owner}/${REPO.name}@master.\n` +
					`  The site is publishing a schema whose source has moved or been\n` +
					`  retired. Fix \`sourcePath\` in src/lib/schemas.ts, or drop the entry\n` +
					`  and the file under ${SCHEMA_DIR} with it.`,
			);
		}
		if (!response.ok) {
			skip(`GitHub returned ${response.status} for ${sourcePath}.`);
		}
		payload = (await response.json()) as ContentsResponse;
	} catch (error) {
		skip(`Could not reach the GitHub API: ${(error as Error).message}`);
	}

	// `encoding` is `none` for blobs over 1 MB, where `content` comes back empty.
	// Neither schema is close to that, but an empty buffer would read as drift.
	if (payload.encoding !== 'base64' || !payload.content) {
		skip(
			`GitHub returned no base64 content for ${sourcePath} (encoding: ${payload.encoding ?? 'absent'}).`,
		);
	}

	return new Uint8Array(Buffer.from(payload.content, 'base64'));
}

async function main() {
	for (const schema of SCHEMAS) {
		const local = Bun.file(join(REPO_ROOT, SCHEMA_DIR, schema.file));

		if (!(await local.exists())) {
			fail(
				`${SCHEMA_DIR}/${schema.file} is missing, and the site publishes\n` +
					`  ${schema.id}. Copy it from the app repo:\n` +
					recopyCommand(schema.sourcePath, schema.file),
			);
		}

		const ours = await local.bytes();
		const theirs = await fetchUpstream(schema.sourcePath);

		if (Buffer.compare(ours, theirs) !== 0) {
			fail(
				`${SCHEMA_DIR}/${schema.file} has drifted from the app repo.\n` +
					`  ours:   ${ours.length} bytes\n` +
					`  theirs: ${theirs.length} bytes (${REPO.url}/blob/master/${schema.sourcePath})\n` +
					`  Re-copy it rather than editing it — these files are the app's, and\n` +
					`  the site republishes them verbatim at ${schema.id}:\n` +
					recopyCommand(schema.sourcePath, schema.file),
			);
		}
	}

	console.log(
		`✓ ${SCHEMAS.length} published schemas match ${REPO.owner}/${REPO.name}@master.`,
	);
}

await main();
