import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

import sharp from 'sharp';

import {
	buildFavicon,
	FAVICON_PATH,
	KERNEL,
	SIZES,
	SOURCE_PATH,
} from './generate-favicon';

const built = await buildFavicon();

interface IcoEntry {
	readonly width: number;
	readonly height: number;
	readonly bitCount: number;
	readonly offset: number;
	readonly length: number;
}

function readDirectory(ico: Uint8Array): IcoEntry[] {
	const view = new DataView(ico.buffer, ico.byteOffset, ico.byteLength);
	expect(view.getUint16(0, true)).toBe(0); // reserved
	expect(view.getUint16(2, true)).toBe(1); // type: icon, not cursor
	const count = view.getUint16(4, true);
	const entries: IcoEntry[] = [];
	for (let index = 0; index < count; index += 1) {
		const at = 6 + index * 16;
		entries.push({
			width: ico[at] === 0 ? 256 : ico[at],
			height: ico[at + 1] === 0 ? 256 : ico[at + 1],
			bitCount: view.getUint16(at + 6, true),
			length: view.getUint32(at + 8, true),
			offset: view.getUint32(at + 12, true),
		});
	}
	return entries;
}

/** Reads one BGRA pixel out of a frame's bottom-up bitmap, in top-down coords. */
function readPixel(ico: Uint8Array, entry: IcoEntry, x: number, y: number) {
	const size = entry.width;
	const at = entry.offset + 40 + ((size - 1 - y) * size + x) * 4;
	return {
		b: ico[at],
		g: ico[at + 1],
		r: ico[at + 2],
		a: ico[at + 3],
	};
}

describe('buildFavicon', () => {
	/*
	 * The one that matters. `src/app/favicon.ico` is generated but committed, so
	 * nothing re-runs the generator on the way to production — replacing
	 * `src/app/apple-icon.png` would otherwise ship a mark that no longer matches
	 * the one on the page, and the only symptom is a wrong icon in a browser tab,
	 * which no build step is looking at.
	 */
	test('matches the committed src/app/favicon.ico', () => {
		const committed = new Uint8Array(readFileSync(FAVICON_PATH));
		expect(committed.length).toBe(built.length);
		expect(Buffer.from(committed).equals(Buffer.from(built))).toBe(true);
	});

	test('is deterministic across runs', async () => {
		expect(Buffer.from(await buildFavicon()).equals(Buffer.from(built))).toBe(
			true,
		);
	});

	test('carries the three sizes browsers still ask an .ico for', () => {
		const entries = readDirectory(built);
		expect(entries.map((entry) => entry.width)).toEqual([...SIZES]);
		for (const entry of entries) {
			expect(entry.height).toBe(entry.width);
			expect(entry.bitCount).toBe(32);
			expect(entry.offset + entry.length).toBeLessThanOrEqual(built.length);
		}
	});

	/*
	 * The whole point of this generator, and the thing every other check here
	 * only approximates: each frame is `src/app/apple-icon.png` resized, pixel
	 * for pixel, and nothing else. It catches the failure the previous redraw
	 * *was* — a mark that looks right in a tab and is not the one in the Dock —
	 * as well as a stray tint, crop or flatten creeping into the pipeline.
	 */
	test('is the app icon resized, and nothing else', async () => {
		for (const entry of readDirectory(built)) {
			const { data } = await sharp(SOURCE_PATH)
				.resize(entry.width, entry.width, { fit: 'fill', kernel: KERNEL })
				.raw()
				.toBuffer({ resolveWithObject: true });

			for (let y = 0; y < entry.height; y += 1) {
				for (let x = 0; x < entry.width; x += 1) {
					const at = (y * entry.width + x) * 4;
					expect(readPixel(built, entry, x, y)).toEqual({
						r: data[at],
						g: data[at + 1],
						b: data[at + 2],
						a: data[at + 3],
					});
				}
			}
		}
	});

	test('leaves the squircle corners transparent', () => {
		for (const entry of readDirectory(built)) {
			const last = entry.width - 1;
			for (const [x, y] of [
				[0, 0],
				[last, 0],
				[0, last],
				[last, last],
			]) {
				expect(readPixel(built, entry, x, y).a).toBe(0);
			}
		}
	});

	test('draws the glyph rather than a blank tile', () => {
		for (const entry of readDirectory(built)) {
			const centre = readPixel(
				built,
				entry,
				entry.width >> 1,
				entry.height >> 1,
			);
			expect(centre.a).toBe(255);

			let ink = 0;
			for (let y = 0; y < entry.height; y += 1) {
				for (let x = 0; x < entry.width; x += 1) {
					const pixel = readPixel(built, entry, x, y);
					// Near `COLOR_INK` (#e4e1dd) — bright and close to neutral, which
					// the cyan and red ghosts never are.
					const spread =
						Math.max(pixel.r, pixel.g, pixel.b) -
						Math.min(pixel.r, pixel.g, pixel.b);
					if (pixel.r > 0xb0 && spread < 0x20) {
						ink += 1;
					}
				}
			}
			/*
			 * A far smaller fraction than a redraw would give: the art keeps the
			 * 20% margin macOS wants plus the padding inside the squircle, so the
			 * lit `E` is about a fiftieth of the tile once the resample has bled
			 * the canvas into every stroke. Low, but never zero — a blank frame, a
			 * flooded one, or one where the ghosts have swallowed the glyph fails.
			 */
			const area = entry.width * entry.height;
			expect(ink).toBeGreaterThan(area * 0.01);
			expect(ink).toBeLessThan(area * 0.35);
		}
	});

	/*
	 * The chromatic split is what makes this the app's mark rather than a letter
	 * in a box, and it is the part most likely to be quietly lost: at 16px it
	 * lives in a handful of tinted pixels, so a resample that drops or averages
	 * it away still produces a perfectly legible `E` that no other check here
	 * would object to.
	 */
	test('keeps the cyan and red ghosts on opposite edges', () => {
		for (const entry of readDirectory(built)) {
			let cyanLeft = 0;
			let redRight = 0;
			for (let y = 0; y < entry.height; y += 1) {
				for (let x = 0; x < entry.width; x += 1) {
					const pixel = readPixel(built, entry, x, y);
					if (pixel.b > pixel.r + 0x10 && pixel.g > pixel.r + 0x10) {
						cyanLeft += 1;
					}
					if (pixel.r > pixel.g + 0x10 && pixel.r > pixel.b + 0x10) {
						redRight += 1;
					}
				}
			}
			expect(cyanLeft).toBeGreaterThan(0);
			expect(redRight).toBeGreaterThan(0);
		}
	});
});
