import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';
import { Glob } from 'bun';

import { LINUX_INSTALL } from '@/lib/install-scripts';
import { HOMEBREW } from '@/lib/site';

const SRC_DIR = join(import.meta.dir, '..', '..');

/**
 * Every command the page prints, as `[the identifier a component writes, the
 * string]`.
 *
 * Two objects now, one per platform: `HOMEBREW` is the macOS install path and
 * `LINUX_INSTALL` is the `curl … | sh` pair. Members that are not commands — a
 * tap URL, a settings label — are deliberately absent; this list is the set of
 * strings a reader is meant to run.
 */
const COMMANDS: ReadonlyArray<readonly [string, string]> = [
	// Widened to `string`: both objects are `as const`, and a literal-typed
	// receiver refuses to be compared against a plain string.
	['HOMEBREW.install', HOMEBREW.install],
	['HOMEBREW.upgrade', HOMEBREW.upgrade],
	['LINUX_INSTALL.install', LINUX_INSTALL.install],
	['LINUX_INSTALL.update', LINUX_INSTALL.update],
];

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
 * actually promises: that a command printed on this page is one you can take
 * with a click, everywhere it is printed. A later edit that adds a surface —
 * or reverts one of these to a bare `<code>` — leaves the reader selecting
 * three wrapped lines of mono by hand, and nothing else in this repo would
 * notice.
 *
 * The check reads source text, so it only sees a command reached by its own
 * name. Passing one through a variable or a ternary would defeat it — which is
 * why the hero writes out both platform branches rather than choosing between
 * two constants inside one `CopyCommand`.
 */
describe('the commands the page prints', () => {
	test('reach the page only through CopyCommand', async () => {
		const components = await readComponents();
		const uses: string[] = [];
		const offenders: string[] = [];

		for (const [path, source] of components) {
			for (const [identifier] of COMMANDS) {
				const printed = count(source, identifier);
				const copyable = count(source, `command={${identifier}}`);

				if (printed === 0) {
					continue;
				}

				uses.push(`${path} → ${identifier}`);
				if (printed !== copyable) {
					offenders.push(`${path} → ${identifier}`);
				}
			}
		}

		// Six: the hero's two install lines, and the install and upgrade or update
		// line in each of the two platform notes. A zero here would mean the scan
		// found nothing and the assertion below is empty.
		expect(uses).toHaveLength(6);
		expect(offenders).toEqual([]);
	});

	/*
	 * All four are single-line strings by the time they reach the clipboard. A
	 * command carrying a trailing newline pastes into a shell and *runs* on
	 * arrival, which is not a thing a copy button decides on the reader's behalf.
	 */
	test('carry nothing a shell would execute on paste', () => {
		for (const [identifier, command] of COMMANDS) {
			expect(command, identifier).toBe(command.trim());
			expect(command, identifier).not.toContain('\n');
		}
	});

	/*
	 * No version in any of them, which is the rule both install paths follow for
	 * the same reason: the cask resolves its own version from the tap, and
	 * `install.sh` resolves the newest release from the GitHub API. A tag written
	 * into either command would be a second thing to bump on every release, and
	 * `check:pin` watches `FALLBACK_RELEASE` rather than these.
	 */
	test('carry no version a release would make stale', () => {
		for (const [identifier, command] of COMMANDS) {
			expect(command, identifier).not.toMatch(/\d+\.\d+\.\d+/);
		}
	});

	/*
	 * The wrapping class, asserted because the two candidates look
	 * interchangeable and are not.
	 *
	 * `break-words` is `overflow-wrap: break-word`: it permits a mid-word break
	 * at layout time but leaves min-content equal to the longest unbreakable
	 * token. The longest token any of these carries is
	 * `https://www.ensemblr.dev/install.sh`, and inside a grid item — which
	 * defaults to `min-width: auto` — that token became a floor the download
	 * column could not shrink below. At 320px the section measured 379px in a
	 * 320px box, and because `#download` is `overflow-hidden` for the pixel
	 * field, nothing scrolled: the overflow was cut off, taking the right edge
	 * of the h2 and of every requirement row with it.
	 *
	 * `wrap-anywhere` is `overflow-wrap: anywhere`, which counts the same break
	 * in min-content and lets the column shrink. Both render every character —
	 * this is not a `truncate`, and must never become one — so the failure is
	 * invisible in review and in any test that only reads the command strings.
	 * Hence a check on the class itself.
	 */
	test('wrap in a class that shrinks to its column', async () => {
		const source = await Bun.file(
			join(import.meta.dir, 'copy-command.tsx'),
		).text();
		const command = source.slice(source.indexOf('<code'));

		expect(command).toContain('wrap-anywhere');
		expect(command).not.toContain('break-words');
		// Never the other direction either: a command shown with its middle
		// missing cannot be copied by the reader who wanted to check it.
		expect(command).not.toContain('truncate');
	});
});
