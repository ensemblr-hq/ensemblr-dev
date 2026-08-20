import { describe, expect, test } from 'bun:test';

import { type ClipboardWriter, writeClipboard } from './clipboard';

const COMMAND = 'brew install --cask ensemblr-hq/tap/ensemblr';

/*
 * The failure paths, which are the whole reason this function returns anything.
 * A `writeClipboard` that always resolved could be inlined at its call site;
 * what it is for is telling the button the difference between a clipboard that
 * now holds the command and one that still holds whatever was there before.
 */
describe('writeClipboard', () => {
	test('writes the command verbatim and reports success', async () => {
		const written: string[] = [];
		const clipboard: ClipboardWriter = {
			writeText: async (text) => {
				written.push(text);
			},
		};

		expect(await writeClipboard(COMMAND, clipboard)).toBe(true);
		expect(written).toEqual([COMMAND]);
	});

	/*
	 * The insecure-context case: `navigator.clipboard` is simply absent over
	 * plain `http://`, which is how anyone previewing this site from a second
	 * machine on their LAN sees it. Reaching for `writeText` there throws a
	 * TypeError inside the click handler, and an unhandled rejection is not a
	 * fallback.
	 */
	test('reports failure when the API is missing', async () => {
		expect(await writeClipboard(COMMAND, {})).toBe(false);
	});

	/*
	 * The denied-permission case. `writeText` rejects rather than throwing
	 * synchronously, so a caller that does not await *and catch* gets `true` for
	 * a write that never happened — a check mark over an unchanged clipboard.
	 */
	test('reports failure when the write is refused', async () => {
		const clipboard: ClipboardWriter = {
			writeText: () => Promise.reject(new Error('NotAllowedError')),
		};

		expect(await writeClipboard(COMMAND, clipboard)).toBe(false);
	});
});
