import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';
import { Glob } from 'bun';

import { HOMEBREW } from '@/lib/site';

const SRC_DIR = join(import.meta.dir, '..', '..');

/** The `HOMEBREW` members that are commands a reader is meant to run. */
const COMMAND_KEYS = ['install', 'upgrade'] as const;

/** Every `.tsx` under `src/`, as `[relative path, contents]`. */
async function readComponents(): Promise<
	ReadonlyArray<readonly [string, string]>
> {
	const glob = new Glob('**/*.tsx');
	const paths: string[] = [];

	for await (const path of glob.scan({ cwd: SRC_DIR })) {
		paths.push(path);
	}

	return Promise.all(
		paths.map(
			async (path) =>
				[path, await Bun.file(join(SRC_DIR, path)).text()] as const,
		),
	);
}

function count(haystack: string, needle: string): number {
	return haystack.split(needle).length - 1;
}

/*
 * `CopyCommand` is a client component and there is no DOM in this runner to
 * click it in. What can be checked without one is the property the feature
 * actually promises: that a brew command printed on this page is one you can
 * take with a click, everywhere it is printed. A later edit that adds a third
 * surface — or reverts one of these to a bare `<code>` — leaves the reader
 * selecting three wrapped lines of mono by hand, and nothing else in this repo
 * would notice.
 */
describe('the brew commands', () => {
	test('reach the page only through CopyCommand', async () => {
		const components = await readComponents();
		const uses: string[] = [];
		const offenders: string[] = [];

		for (const [path, source] of components) {
			for (const key of COMMAND_KEYS) {
				const printed = count(source, `HOMEBREW.${key}`);
				const copyable = count(source, `command={HOMEBREW.${key}}`);

				if (printed === 0) {
					continue;
				}

				uses.push(`${path} → HOMEBREW.${key}`);
				if (printed !== copyable) {
					offenders.push(`${path} → HOMEBREW.${key}`);
				}
			}
		}

		// The hero's install line, and the download note's install and upgrade. A
		// zero here means the scan found nothing and the assertion below is empty.
		expect(uses).toHaveLength(3);
		expect(offenders).toEqual([]);
	});

	/*
	 * Both are single-line strings by the time they reach the clipboard. A
	 * command carrying a trailing newline pastes into a shell and *runs* on
	 * arrival, which is not a thing a copy button decides on the reader's behalf.
	 */
	test('carry nothing a shell would execute on paste', () => {
		for (const key of COMMAND_KEYS) {
			// Widened: `HOMEBREW` is `as const`, so a literal-typed receiver refuses
			// to be compared against a plain `string`.
			const command: string = HOMEBREW[key];

			expect(command).toBe(command.trim());
			expect(command).not.toContain('\n');
		}
	});
});
