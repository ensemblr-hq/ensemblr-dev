import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';
import { Glob } from 'bun';

import { ANALYTICS_EVENTS } from './analytics';
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
	 * collection from page views and is covered by no clause written for them.
	 * Adding a call site is allowed; adding one without rewriting
	 * `ANALYTICS.detail` and re-reading Vercel's page is not.
	 *
	 * This used to assert nobody imported `track` at all, which was the right
	 * shape while the copy described page views only. The site now sends two
	 * events, so the assertion is inverted rather than dropped: whenever a
	 * `track` import exists, the notice has to name both events. A third event
	 * added without a word of copy still fails — on `ANALYTICS_EVENTS` rather
	 * than on the import, since that constant is the one place the names live.
	 */
	test('the copy names every event the site actually sends', async () => {
		const callSites = (await readSources()).flatMap(([path, source]) =>
			[...source.matchAll(ANALYTICS_IMPORT)]
				.filter(([, bindings]) => /\btrack\b/.test(bindings))
				.map(() => path),
		);

		if (callSites.length === 0) {
			expect(ANALYTICS.detail).not.toContain('Copy Command');
			return;
		}

		for (const name of Object.values(ANALYTICS_EVENTS)) {
			expect(ANALYTICS.detail).toContain(name);
		}

		/*
		 * And the headline sentence, not only the detail paragraph. `detail` sits
		 * behind a disclosure on the legal page; `notice` is the line a reader
		 * meets in the footer, and an event named only in the half nobody opens
		 * is an event this page has not really disclosed.
		 */
		expect(ANALYTICS.notice).toContain('download link');
		expect(ANALYTICS.notice).toContain('install command');
	});

	/*
	 * Every event the site sends carries something that says *which* affordance
	 * was pressed. An event with no distinguishing property is a total, and a
	 * total answers none of the questions this measurement was added for — so
	 * this reads the call sites rather than trusting them.
	 */
	test('every track call carries a target', async () => {
		const analytics = await Bun.file(join(SRC_DIR, 'lib/analytics.ts')).text();

		for (const name of Object.values(ANALYTICS_EVENTS)) {
			expect(analytics).toContain(name);
		}

		expect(analytics).toContain('readonly target');
		expect(analytics.match(/track\(/g) ?? []).toHaveLength(
			Object.values(ANALYTICS_EVENTS).length,
		);
	});
});
