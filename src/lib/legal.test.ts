import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';
import { Glob } from 'bun';

import { ANALYTICS } from './legal';

const SRC_DIR = join(import.meta.dir, '..');

/**
 * Every `import { … } from '@vercel/analytics…'` in the tree, with the named
 * bindings captured. The subpath varies by framework entry point — this site
 * uses `/next` — so the trailing segment is deliberately loose.
 */
const ANALYTICS_IMPORT =
	/import\s*\{([^}]*)\}\s*from\s*'@vercel\/analytics[^']*'/g;

/** Every TypeScript source under `src/`, as `[relative path, contents]`. */
async function readSources(): Promise<
	ReadonlyArray<readonly [string, string]>
> {
	const glob = new Glob('**/*.{ts,tsx}');
	const paths: string[] = [];

	for await (const path of glob.scan({ cwd: SRC_DIR })) {
		paths.push(path);
	}

	return Promise.all(
		paths
			// This file quotes the package name in a regex; it is not a call site.
			.filter((path) => path !== 'lib/legal.test.ts')
			.map(
				async (path) =>
					[path, await Bun.file(join(SRC_DIR, path)).text()] as const,
			),
	);
}

/*
 * `ANALYTICS` is prose, and prose cannot be unit-tested for truth. What can be
 * tested is the gap between the prose and the code it describes — the two
 * failures where the footer would state something the site does not do.
 */
describe('ANALYTICS', () => {
	/*
	 * The over-claim. Drop `<Analytics />` from the layout and the footer goes on
	 * telling every visitor they are being counted by a script that is no longer
	 * on the page — a privacy notice for collection that is not happening, on a
	 * page whose argument is that its claims are checkable.
	 */
	test('the notice describes a script the layout actually mounts', async () => {
		const layout = await Bun.file(join(SRC_DIR, 'app/layout.tsx')).text();

		expect(layout).toContain("from '@vercel/analytics");
		expect(layout).toContain('<Analytics />');
		expect(ANALYTICS.notice).toContain('Vercel Web Analytics');
	});

	/*
	 * The under-claim, and the one that actually costs something. `track()` sends
	 * custom events with a payload of the caller's choosing, which is a different
	 * collection from the page views this copy enumerates and is not covered by
	 * a word of it. Adding a call site is allowed; adding one without rewriting
	 * `ANALYTICS.detail` and re-reading Vercel's page is not.
	 */
	test('nothing imports track, because the copy describes page views only', async () => {
		const callSites = (await readSources()).flatMap(([path, source]) =>
			[...source.matchAll(ANALYTICS_IMPORT)]
				.filter(([, bindings]) => /\btrack\b/.test(bindings))
				.map(() => path),
		);

		expect(callSites).toEqual([]);
	});
});
